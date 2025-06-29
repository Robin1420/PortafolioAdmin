import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://api-django-portafolio.fly.dev/api/proyectos/';

export const useProyectos = () => {
  // Estados
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProyecto, setCurrentProyecto] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Mostrar notificación
  const showNotification = useCallback((message, type = 'success', autoHide = true) => {
    setNotification({ message, type, autoHide });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Obtener todos los proyectos
  const fetchProyectos = useCallback(async () => {
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
  }, [showNotification]);

  // Función para formatear la fecha a YYYY-MM-DD
  const formatearFecha = (fecha) => {
    if (!fecha) {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    
    // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }
    
    // Si es un objeto Date o timestamp
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida, usando fecha actual:', fecha);
      return new Date().toISOString().split('T')[0];
    }
    
    // Asegurarse de que la fecha esté en la zona horaria local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Función para obtener el nombre del archivo
  const getFileName = (file, proyectoId = null) => {
    // Obtener la extensión del archivo
    const extension = file.name.split('.').pop().toLowerCase();
    
    // Si tenemos un ID de proyecto, usarlo en el nombre
    if (proyectoId) {
      return `proyecto${proyectoId}.${extension}`;
    }
    
    // Si no hay ID de proyecto, usar timestamp
    return `proyecto_${Date.now()}.${extension}`;
  };
  
  // Función para subir un archivo al servidor
  const subirArchivo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      
      console.log('Enviando solicitud para subir archivo...');
      const response = await fetch('http://localhost:5000/api/proyectos/upload', {
        method: 'POST',
        body: formData,
        // No establecer Content-Type, se establecerá automáticamente con el boundary
      });
      
      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error al subir la imagen');
      }
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Error en la respuesta del servidor');
      }
      
      console.log('Archivo subido exitosamente:', responseData);
      
      // Asegurarse de que tenemos el nombre del archivo
      if (!responseData.filename) {
        throw new Error('No se recibió el nombre del archivo en la respuesta');
      }
      
      return {
        nombreArchivo: responseData.filename,
        ruta: responseData.url || `/assets/Proyectos/${responseData.filename}`,
        url: responseData.url || `/assets/Proyectos/${responseData.filename}`
      };
      
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw new Error('No se pudo subir la imagen al servidor: ' + error.message);
    }
  };

  // Función para manejar la imagen
  const subirImagen = useCallback(async (imagen) => {
    if (!imagen) return null;
    
    console.log('Procesando imagen:', imagen);
    
    // Si la imagen ya es una URL o un nombre de archivo, devolver solo el nombre del archivo
    if (typeof imagen === 'string') {
      // Si es una URL completa o una ruta que ya existe
      if (imagen.startsWith('http') || imagen.startsWith('/')) {
        const nombreArchivo = imagen.split('/').pop();
        console.log('Imagen existente, usando nombre de archivo:', nombreArchivo);
        return nombreArchivo;
      }
    }

    // Si es un archivo, devolverlo para adjuntar en la solicitud principal
    if (imagen instanceof File) {
      return imagen;
    }

    return null;
  }, []);

  // Función para manejar la apertura del modal de edición
  const handleOpenModal = useCallback((proyecto = null) => {
    setCurrentProyecto(proyecto);
    setIsModalOpen(true);
  }, []);

  // Función para manejar el cierre del modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentProyecto(null);
  }, []);

  // Función para manejar la edición de un proyecto
  const handleEdit = useCallback((proyecto) => {
    handleOpenModal(proyecto);
  }, [handleOpenModal]);

  // Función para manejar el envío del formulario
  const handleSubmit = useCallback(async (formData, currentProyecto, onClose) => {
    setIsSubmitting(true);
    try {
      console.log('Datos del formulario recibidos:', formData);
      console.log('Proyecto actual:', currentProyecto);
      
      // Validar que los campos requeridos estén presentes
      if (!formData.titulo || !formData.descripcion || !formData.tecnologias) {
        throw new Error('Por favor completa todos los campos requeridos');
      }
      
      // Determinar la URL y el método para la solicitud
      const requestUrl = currentProyecto ? `${API_URL}${currentProyecto.id}/` : API_URL;
      const requestMethod = currentProyecto ? 'PUT' : 'POST';
      
      // Crear objeto con los datos del proyecto
      console.log('Fecha recibida del formulario:', formData.fecha);
      const fechaFormateada = formatearFecha(formData.fecha);
      console.log('Fecha después de formatear:', fechaFormateada);
      
      const proyectoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tecnologias: formData.tecnologias,
        enlace_demo: formData.enlace_demo || '',
        enlace_codigo: formData.enlace_codigo || '',
        fecha: fechaFormateada,
        visible: formData.visible,
      };
      
      console.log('Datos que se enviarán al servidor:', JSON.stringify(proyectoData, null, 2));
      
      // Manejar la imagen
      if (formData.imagen && formData.imagen instanceof File) {
        console.log('Subiendo nueva imagen...');
        try {
          // Subir la imagen al servidor
          const resultadoSubida = await subirArchivo(formData.imagen);
          console.log('Imagen subida exitosamente:', resultadoSubida);
          
          // Usar el nombre de archivo devuelto por el servidor
          if (resultadoSubida && resultadoSubida.nombreArchivo) {
            proyectoData.imagen = resultadoSubida.nombreArchivo;
          } else {
            throw new Error('No se pudo obtener el nombre del archivo subido');
          }
        } catch (error) {
          console.error('Error al subir la imagen:', error);
          throw new Error('No se pudo subir la imagen: ' + error.message);
        }
      } else if (currentProyecto && currentProyecto.imagen) {
        // Si es una actualización y no hay una nueva imagen, mantener la existente
        console.log('Manteniendo imagen existente:', currentProyecto.imagen);
        proyectoData.imagen = currentProyecto.imagen;
      } else {
        // Si no hay imagen, establecer un valor por defecto
        console.log('No se proporcionó imagen, usando valor por defecto');
        proyectoData.imagen = 'default.png';
      }

      // Enviar la solicitud con los datos del proyecto
      console.log('Enviando solicitud a:', requestUrl);
      console.log('Método:', requestMethod);
      console.log('Datos enviados:', JSON.stringify(proyectoData, null, 2));
      
      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proyectoData),
        credentials: 'include',
      });
      
      console.log('Respuesta del servidor - Estado:', response.status);

      if (!response.ok) {
        let errorMessage = 'Error al guardar el proyecto';
        let errorDetails = {};
        
        try {
          // Intentar obtener el cuerpo de la respuesta como JSON
          const errorData = await response.json();
          console.error('Error del servidor:', errorData);
          
          // Construir un mensaje de error más detallado
          if (typeof errorData === 'object' && errorData !== null) {
            // Si hay errores de validación de Django
            if (errorData.errors) {
              errorMessage = 'Errores de validación';
              errorDetails = errorData.errors;
            } 
            // Si hay un mensaje de error específico
            else if (errorData.detail || errorData.error) {
              errorMessage = errorData.detail || errorData.error;
            }
            // Si hay errores de campo
            else {
              const fieldErrors = Object.entries(errorData)
                .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                .join('; ');
              
              if (fieldErrors) {
                errorMessage = `Error de validación: ${fieldErrors}`;
                errorDetails = errorData;
              }
            }
          }
        } catch (e) {
          console.error('Error al procesar la respuesta de error:', e);
          // Si no se puede procesar como JSON, usar el texto de la respuesta
          const text = await response.text();
          errorMessage = `Error ${response.status}: ${text || response.statusText}`;
        }
        
        const error = new Error(errorMessage);
        error.details = errorDetails;
        throw error;
      }
      
      // Si todo salió bien, obtener los datos actualizados
      const data = await response.json();
      console.log('Proyecto guardado exitosamente:', data);
      
      // Cerrar el modal y actualizar la lista de proyectos
      if (onClose) onClose();
      await fetchProyectos();
      
      // Mostrar notificación de éxito
      showNotification(
        currentProyecto 
          ? 'Proyecto actualizado correctamente' 
          : 'Proyecto creado correctamente',
        'success'
      );
      
      return data;
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
      showNotification(
        error.message || 'Error al guardar el proyecto',
        'error'
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentProyecto, fetchProyectos, handleCloseModal, showNotification, subirImagen, formatearFecha]);

  // Función para eliminar un proyecto
  const handleDelete = useCallback(async (id) => {
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
      
      // Actualizar la lista de proyectos
      await fetchProyectos();
      showNotification('Proyecto eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
      showNotification(error.message || 'Error al eliminar el proyecto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchProyectos, showNotification]);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  // Retornar las funciones y estados necesarios para el componente
  return {
    proyectos,
    loading,
    error,
    isModalOpen,
    currentProyecto,
    notification,
    isSubmitting,
    isUploading,
    fetchProyectos,
    handleOpenModal,
    handleCloseModal,
    handleEdit,
    handleSubmit,
    handleDelete,
    formatearFecha,
    showNotification,
  };
};
