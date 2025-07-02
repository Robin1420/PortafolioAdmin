import { useState, useEffect } from 'react';

const API_URL = 'https://api-django-portafolio.fly.dev/api/certificados/';

export const useCertificados = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCertificado, setSelectedCertificado] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Obtener todos los certificados
  const fetchCertificados = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error al cargar los certificados');
      }
      const data = await response.json();
      setCertificados(data);
    } catch (err) {
      setError(err.message);
      showNotification('Error al cargar los certificados', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo certificado
  const createCertificado = async (jsonData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Datos recibidos:', jsonData);
      
      // Parsear el JSON si es una cadena
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Verificar que los campos requeridos estén presentes
      const { titulo, institucion, fecha, imagen } = data;
      
      if (!titulo) throw new Error('El título es requerido');
      if (!institucion) throw new Error('La institución es requerida');
      if (!fecha) throw new Error('La fecha es requerida');
      if (!imagen) throw new Error('La imagen es requerida');
      
      console.log('Campos validados:', { titulo, institucion, fecha, imagen });

      console.log('Enviando datos al servidor...');
      
      // Crear el objeto de datos para enviar
      const certificadoData = {
        titulo: titulo.trim(),
        institucion: institucion.trim(),
        fecha,
        imagen: imagen // Solo el nombre del archivo
      };
      
      console.log('Datos a enviar:', certificadoData);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certificadoData),
      });

      let responseData;
      try {
        // Intentar parsear la respuesta como JSON
        responseData = await response.json();
        console.log('Respuesta del servidor (JSON):', responseData);
      } catch (jsonError) {
        // Si falla el parseo JSON, mostrar el error y el texto de la respuesta
        const textResponse = await response.text();
        console.error('Error al parsear respuesta JSON:', jsonError);
        console.error('Respuesta del servidor (texto):', textResponse);
        throw new Error(`Error en la respuesta del servidor: ${textResponse}`);
      }

      if (!response.ok) {
        // Mostrar errores detallados del servidor si están disponibles
        let errorDetails = [];
        
        // Recorrer todas las propiedades del objeto de respuesta para encontrar errores
        for (const [key, value] of Object.entries(responseData)) {
          if (Array.isArray(value)) {
            errorDetails.push(`${key}: ${value.join(', ')}`);
          } else if (typeof value === 'string') {
            errorDetails.push(`${key}: ${value}`);
          }
        }
        
        const errorMessage = responseData.detail || 
                           (errorDetails.length > 0 ? errorDetails.join(' | ') : 
                           `Error al crear el certificado (${response.status} ${response.statusText})`);
        
        console.error('Error en la respuesta:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errors: responseData
        });
        
        throw new Error(errorMessage);
      }

      setCertificados([...certificados, responseData]);
      showNotification('Certificado creado exitosamente');
      setIsAddModalOpen(false);
      return responseData;
    } catch (err) {
      setError(err.message);
      showNotification(err.message || 'Error al crear el certificado', 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar un certificado existente
  const updateCertificado = async (certificadoData) => {
    if (!selectedCertificado) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('titulo', certificadoData.titulo);
      formData.append('institucion', certificadoData.institucion);
      formData.append('fecha', certificadoData.fecha);
      
      // Solo adjuntar la imagen si es un archivo nuevo
      if (certificadoData.imagen instanceof File) {
        formData.append('imagen', certificadoData.imagen);
      }

      const response = await fetch(`${API_URL}${selectedCertificado.id}/`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar el certificado');
      }

      const data = await response.json();
      setCertificados(certificados.map(cert => 
        cert.id === selectedCertificado.id ? data : cert
      ));
      showNotification('Certificado actualizado exitosamente');
      closeModals();
      return data;
    } catch (err) {
      setError(err.message);
      showNotification(err.message || 'Error al actualizar el certificado', 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar un certificado
  const deleteCertificado = async (id, imagen) => {
    try {
      // Primero eliminamos el certificado de la base de datos
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el certificado');
      }

      console.log('Certificado eliminado con éxito');
      
      // Si el certificado tenía una imagen, la eliminamos del servidor
      if (imagen) {
        try {
          // Extraer solo el nombre del archivo de la ruta de la imagen
          const filename = imagen.split('/').pop();
          console.log('Eliminando imagen del servidor:', filename);
          
          const deleteResponse = await fetch(`http://localhost:5000/api/certificados/imagen/${filename}`, {
            method: 'DELETE',
          });
          
          if (!deleteResponse.ok) {
            console.warn('No se pudo eliminar la imagen del servidor, pero el certificado se eliminó correctamente');
          } else {
            console.log('Imagen eliminada del servidor correctamente');
          }
        } catch (imgError) {
          console.error('Error al eliminar la imagen del servidor:', imgError);
          // No lanzamos el error para no afectar la eliminación del certificado
        }
      }
      
      // Actualizar la lista de certificados
      fetchCertificados();
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar el certificado:', error);
      setError(error.message || 'Error al eliminar el certificado');
      return { success: false, error: error.message };
    }
  };

  // Abrir modal de edición
  const openEditModal = (certificado) => {
    setSelectedCertificado(certificado);
    setIsEditModalOpen(true);
  };

  // Cerrar modales
  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedCertificado(null);
  };

  // Cargar certificados al montar el componente
  useEffect(() => {
    fetchCertificados();
  }, []);

  return {
    certificados,
    loading,
    error,
    notification,
    isSubmitting,
    isAddModalOpen,
    isEditModalOpen,
    selectedCertificado,
    createCertificado,
    updateCertificado,
    deleteCertificado,
    openEditModal,
    closeModals,
    setIsAddModalOpen,
    setIsEditModalOpen,
  };
};

export default useCertificados;