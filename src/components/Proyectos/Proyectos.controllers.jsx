import { useState, useEffect } from 'react';

const API_URL = 'https://api-django-portafolio.fly.dev/api/proyectos/';

export const useProyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProyecto, setCurrentProyecto] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mostrar notificación
  const showNotification = (message, type = 'success', autoHide = true) => {
    setNotification({ message, type, autoHide });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  };

  // Obtener todos los proyectos
  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error al obtener los proyectos');
      }
      const data = await response.json();
      setProyectos(data);
      return data;
    } catch (err) {
      setError(err.message);
      showNotification('Error al cargar los proyectos', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para convertir imagen a base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Función para formatear fechas a YYYY-MM-DD
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    
    // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }
    
    // Si es un objeto Date, formatearlo
    if (fecha instanceof Date && !isNaN(fecha)) {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Si es una cadena de fecha, intentar parsearla
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', fecha);
      return ''; // Devolver cadena vacía en lugar de null
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Función para subir una imagen
  const subirImagen = async (imagen, idProyecto) => {
    if (!imagen) {
      console.log('No se proporcionó ninguna imagen para subir');
      return null;
    }
    
    // Si la imagen ya es una URL (en caso de edición), extraemos solo el nombre del archivo
    if (typeof imagen === 'string') {
      if (imagen.startsWith('http') || imagen.startsWith('/')) {
        // Extraer solo el nombre del archivo de la ruta
        const nombreArchivo = imagen.split('/').pop();
        console.log('Imagen ya es una URL, devolviendo nombre de archivo:', nombreArchivo);
        return nombreArchivo;
      }
      console.log('Imagen es un nombre de archivo, devolviendo tal cual:', imagen);
      return imagen; // Si ya es solo un nombre de archivo, lo devolvemos tal cual
    }
    
    // Si no es un archivo, no hacemos nada
    if (!(imagen instanceof File)) {
      console.error('El objeto de imagen no es un archivo válido:', imagen);
      return null;
    }
    
    const formData = new FormData();
    const extension = imagen.name.substring(imagen.name.lastIndexOf('.'));
    const nombreArchivo = `proyecto${idProyecto}${extension}`; // Mantener la extensión original
    
    console.log('Preparando para subir imagen:', {
      nombreOriginal: imagen.name,
      nombreNuevo: nombreArchivo,
      tipo: imagen.type,
      tamaño: imagen.size
    });
    
    try {
      // Agregar la imagen al FormData con el nombre 'foto' que espera el backend
      formData.append('foto', imagen);
      
      // Agregar el nombre del archivo que queremos usar
      formData.append('nombreArchivo', `proyecto${idProyecto}`);
      
      console.log('Enviando FormData al servidor:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }
      
      const url = 'http://localhost:5000/api/upload';
      console.log(`Enviando solicitud a: ${url}`);
      
      // Usamos el endpoint correcto para subir la imagen
      const response = await fetch(url, {
        method: 'POST',
        body: formData
        // No establecer Content-Type, el navegador lo hará automáticamente con el límite correcto
      });
      
      console.log('Respuesta recibida, estado:', response.status);
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        console.error('Respuesta no es JSON:', text);
        throw new Error('La respuesta del servidor no es un JSON válido');
      }
      
      console.log('Respuesta del servidor al subir imagen:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || `Error al subir la imagen: ${response.statusText}`);
      }
      
      // Devolver el nombre del archivo para guardar en la base de datos
      if (responseData.filename) {
        console.log('Imagen subida exitosamente:', responseData.filename);
        return responseData.filename;
      } else if (responseData.foto_perfil) {
        console.log('Imagen subida exitosamente (usando foto_perfil):', responseData.foto_perfil);
        return responseData.foto_perfil.split('/').pop();
      }
      
      console.log('No se encontró filename ni foto_perfil en la respuesta, usando nombre generado:', nombreArchivo);
      return nombreArchivo;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  };

  // Crear un nuevo proyecto
  const createProyecto = async (proyectoData) => {
    try {
      setIsSubmitting(true);
      const { imagen, ...datosSinImagen } = proyectoData;
      
      // Formatear la fecha usando la función formatearFecha
      
      // Primero, crear el proyecto sin la imagen
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosSinImagen),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el proyecto');
      }
      
      console.log('Proyecto creado exitosamente:', data);
      
      // Si hay una imagen, subirla y actualizar el proyecto
      if (imagen) {
        console.log('Subiendo imagen para el proyecto:', data.id);
        try {
          const nombreImagen = await subirImagen(imagen, data.id);
          console.log('Nombre de la imagen subida:', nombreImagen);
          
          if (nombreImagen) {
            // Actualizar el proyecto con el nombre de la imagen
            const updateResponse = await fetch(`${API_URL}${data.id}/`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                ...datosSinImagen, // Incluir todos los datos originales
                imagen: nombreImagen 
              }),
            });
            
            if (!updateResponse.ok) {
              const errorData = await updateResponse.json().catch(() => ({}));
              console.error('Error al actualizar el proyecto con la imagen:', errorData);
              showNotification('El proyecto se creó, pero hubo un error al actualizar la imagen', 'warning');
            } else {
              const updatedProject = await updateResponse.json();
              console.log('Proyecto actualizado con imagen:', updatedProject);
              data.imagen = updatedProject.imagen;
              showNotification('Proyecto creado exitosamente con imagen', 'success');
            }
          }
        } catch (error) {
          console.error('Error al subir la imagen, pero el proyecto se creó correctamente', error);
          showNotification('El proyecto se creó, pero hubo un error al subir la imagen', 'warning');
          // No lanzamos el error para no fallar la creación del proyecto
        }
      } else {
        showNotification('Proyecto creado exitosamente', 'success');
      }
      
      // Actualizar la lista de proyectos
      await fetchProyectos();
      return data;
    } catch (err) {
      showNotification(`Error al crear el proyecto: ${err.message}`, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar un proyecto
  const deleteProyecto = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el proyecto');
      }

      showNotification('Proyecto eliminado exitosamente');
      await fetchProyectos();
    } catch (err) {
      showNotification(`Error al eliminar el proyecto: ${err.message}`, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProyectos();
  }, []);

  // Manejar cierre del modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProyecto(null);
  };

  // Manejar apertura del modal para editar
  const handleEdit = (proyecto) => {
    setCurrentProyecto(proyecto);
    setIsModalOpen(true);
  };

  // Manejar envío del formulario (crear o actualizar)
  const handleSubmit = async (formData) => {
    try {
      if (currentProyecto) {
        // Actualizar proyecto existente
        await updateProyecto(currentProyecto.id, formData);
      } else {
        // Crear nuevo proyecto
        await createProyecto(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
    }
  };

  // Actualizar un proyecto
  const updateProyecto = async (id, proyectoData) => {
    try {
      setIsSubmitting(true);
      const { imagen, ...datosSinImagen } = proyectoData;
      
      // Formatear la fecha usando la función formatearFecha
      const fechaFormateada = formatearFecha(datosSinImagen.fecha || new Date());
      
      // Preparar los datos para enviar
      const datosAEnviar = {
        ...datosSinImagen,
        fecha: fechaFormateada
      };
      
      console.log('Actualizando proyecto con datos:', { id, datosAEnviar });
      
      // 1. Primero actualizamos los datos del proyecto
      const updateResponse = await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosAEnviar),
      });
      
      const responseData = await updateResponse.json().catch(() => ({}));
      
      if (!updateResponse.ok) {
        console.error('Error al actualizar el proyecto. Respuesta:', responseData);
        throw new Error(responseData.message || 'Error al actualizar el proyecto');
      }
      
      const proyectoActualizado = responseData;
      console.log('Proyecto actualizado exitosamente:', proyectoActualizado);
      
      // 2. Si hay una imagen, la subimos y actualizamos el proyecto
      if (imagen) {
        try {
          console.log('Subiendo imagen para el proyecto:', id);
          // Subir la imagen y obtener la ruta del archivo
          const rutaImagen = await subirImagen(imagen, id);
          
          if (rutaImagen) {
            console.log('Actualizando proyecto con imagen:', rutaImagen);
            
            // Actualizamos solo la imagen del proyecto
            const imageUpdateResponse = await fetch(`${API_URL}${id}/`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...datosAEnviar,
                imagen: rutaImagen
              }),
            });
            
            if (!imageUpdateResponse.ok) {
              const errorData = await imageUpdateResponse.json().catch(() => ({}));
              console.error('Error al actualizar la imagen del proyecto:', errorData);
              throw new Error('Error al actualizar la imagen del proyecto');
            }
            
            const updatedWithImage = await imageUpdateResponse.json();
            console.log('Proyecto actualizado con imagen exitosamente:', updatedWithImage);
            
            // Actualizamos el objeto de retorno con los datos actualizados
            Object.assign(proyectoActualizado, updatedWithImage);
          }
        } catch (error) {
          console.error('Error al subir la imagen, pero el proyecto se actualizó correctamente', error);
          // Si falla la subida de la imagen, mostramos un mensaje pero no fallamos
          showNotification('Proyecto actualizado, pero hubo un error al subir la imagen', 'warning');
        }
      }
      
      // Actualizar la lista de proyectos
      await fetchProyectos();
      
      showNotification('Proyecto actualizado correctamente', 'success');
      return proyectoActualizado;
    } catch (err) {
      showNotification(`Error al actualizar el proyecto: ${err.message}`, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retornar las funciones y estados necesarios para el componente
  return {
    proyectos,
    loading,
    error,
    isModalOpen,
    currentProyecto,
    notification,
    isSubmitting,
    fetchProyectos,
    createProyecto,
    updateProyecto,
    deleteProyecto,
    handleEdit,
    handleCloseModal,
    handleSubmit,
    showNotification,
    formatearFecha,
    setCurrentProyecto,
    setIsModalOpen
  };
};