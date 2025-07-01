import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://api-django-portafolio.fly.dev/api/proyectos/';

export const useProyectos = () => {
  // Estados
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // Función para subir un archivo al servidor
  const subirArchivo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      
      const response = await fetch('http://localhost:5000/api/proyectos/upload', {
        method: 'POST',
        body: formData,
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error al subir la imagen');
      }
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Error en la respuesta del servidor');
      }
      
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
    
    if (typeof imagen === 'string') {
      if (imagen.startsWith('http') || imagen.startsWith('/')) {
        return imagen.split('/').pop();
      }
    }

    if (imagen instanceof File) {
      return imagen;
    }

    return null;
  }, []);

  // Funciones para manejar los modales
  const handleOpenAddModal = useCallback(() => {
    setCurrentProyecto(null);
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setCurrentProyecto(null);
  }, []);
  
  const handleOpenEditModal = useCallback((proyecto) => {
    setCurrentProyecto(proyecto);
    setIsEditModalOpen(true);
  }, []);
  
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setCurrentProyecto(null);
  }, []);

  const handleEdit = useCallback((proyecto) => {
    handleOpenEditModal(proyecto);
  }, [handleOpenEditModal]);

  // Función para manejar el envío del formulario
  const handleSubmit = useCallback(async (formData, currentProyecto, onClose) => {
    setIsSubmitting(true);
    try {
      if (!formData.titulo || !formData.descripcion || !formData.tecnologias) {
        throw new Error('Por favor completa todos los campos requeridos');
      }
      
      const requestUrl = currentProyecto ? `${API_URL}${currentProyecto.id}/` : API_URL;
      const requestMethod = currentProyecto ? 'PUT' : 'POST';
      const fechaFormateada = formatearFecha(formData.fecha);
      
      const proyectoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tecnologias: formData.tecnologias,
        enlace_demo: formData.enlace_demo || '',
        enlace_codigo: formData.enlace_codigo || '',
        fecha: fechaFormateada,
        visible: formData.visible,
      };
      
      if (formData.imagen && formData.imagen instanceof File) {
        try {
          const resultadoSubida = await subirArchivo(formData.imagen);
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
        proyectoData.imagen = currentProyecto.imagen;
      } else {
        proyectoData.imagen = 'default.png';
      }

      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proyectoData),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'Error al guardar el proyecto';
        let errorDetails = {};
        
        try {
          const errorData = await response.json();
          
          if (typeof errorData === 'object' && errorData !== null) {
            if (errorData.errors) {
              errorMessage = 'Errores de validación';
              errorDetails = errorData.errors;
            } else if (errorData.detail || errorData.error) {
              errorMessage = errorData.detail || errorData.error;
            } else {
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
          const text = await response.text();
          errorMessage = `Error ${response.status}: ${text || response.statusText}`;
        }
        
        const error = new Error(errorMessage);
        error.details = errorDetails;
        throw error;
      }
      
      const data = await response.json();
      
      if (onClose) onClose();
      await fetchProyectos();
      
      showNotification(
        currentProyecto ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente',
        'success'
      );
      
      return data;
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
      showNotification(error.message || 'Error al guardar el proyecto', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchProyectos, handleCloseAddModal, showNotification, subirImagen, formatearFecha]);

  // Función para eliminar un proyecto
  const handleDelete = useCallback(async (id) => {
    if (!id) return;
    
    // Importar SweetAlert2 al inicio de la función
    const { default: Swal } = await import('sweetalert2');
    
    try {
      // Mostrar alerta de confirmación con SweetAlert2
      const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar proyecto?',
        text: '¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });
      
      if (!isConfirmed) return;
      
      setIsSubmitting(true);
      
      // Mostrar indicador de carga
      await Swal.fire({
        title: 'Eliminando proyecto...',
        text: 'Por favor espera mientras se procesa la solicitud',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Obtener los datos del proyecto para saber qué archivo eliminar
      const proyectoResponse = await fetch(`${API_URL}${id}/`);
      if (!proyectoResponse.ok) {
        throw new Error('No se pudo obtener la información del proyecto');
      }
      const proyecto = await proyectoResponse.json();
      
      // Si el proyecto tiene una imagen, eliminarla
      if (proyecto.imagen && proyecto.imagen !== 'default.png') {
        try {
          const response = await fetch(`http://localhost:5000/api/proyectos/imagen/${proyecto.imagen}`, {
            method: 'DELETE',
          });
          
          const result = await response.json();
          if (!response.ok) {
            console.warn('No se pudo eliminar la imagen del proyecto:', result.error || 'Error desconocido');
          } else {
            console.log('Imagen eliminada correctamente:', result);
          }
        } catch (error) {
          console.error('Error al eliminar la imagen del proyecto:', error);
        }
      }
      
      // Eliminar el proyecto de la base de datos
      const deleteResponse = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!deleteResponse.ok) {
        throw new Error('Error al eliminar el proyecto de la base de datos');
      }
      
      // Cerrar alerta de carga
      await Swal.close();
      
      // Mostrar notificación de éxito
      showNotification('El proyecto ha sido eliminado correctamente', 'success');
      
      // Actualizar la lista de proyectos
      await fetchProyectos();
      
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
      
      try {
        // Cerrar alerta de carga si está abierta
        await Swal.close();
        
        // Mostrar error con notificación personalizada
        showNotification(error.message || 'Ocurrió un error al eliminar el proyecto', 'error');
      } catch (swalError) {
        console.error('Error mostrando el error:', swalError);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchProyectos]);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  return {
    proyectos,
    loading,
    error,
    isAddModalOpen,
    isEditModalOpen,
    currentProyecto,
    notification,
    isSubmitting,
    isUploading,
    fetchProyectos,
    handleOpenAddModal,
    handleCloseAddModal,
    handleOpenEditModal,
    handleCloseEditModal,
    handleEdit,
    handleSubmit,
    handleDelete,
    formatearFecha,
    showNotification,
  };
};
