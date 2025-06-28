import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../utils/constants';

export const useDatosPersonales = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({
    foto_perfil: '',
    cv: ''
  });
  const [file, setFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showArchivosModal, setShowArchivosModal] = useState(false);



  // Mostrar notificación
  const showNotification = useCallback((message, type = 'success', autoHide = true) => {
    setNotification({ message, type, autoHide });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Función para obtener los datos
  const fetchDatos = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      setDatos(data);
      if (data.length > 0) {
        setFormData(data[0]);
      }
      return data;
    } catch (err) {
      setError(err.message);
      showNotification('Error al cargar los datos', 'error');
      throw err;
    } finally {
      if (showLoader) {
        setTimeout(() => setLoading(false), 300); // Pequeño retraso para evitar parpadeo
      }
    }
  }, [showNotification]);

  // Función para refrescar datos suavemente
  const handleRefreshData = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchDatos(false);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, [fetchDatos, isRefreshing]);

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar la subida de la foto de perfil
  const handleImageChange = async (file) => {
    if (!file) return;
    
    try {
      setIsSubmitting(true);
      console.log('Archivo seleccionado:', file);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('foto', file);
      
      console.log('Enviando imagen al servidor...');
      
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      
      console.log('Respuesta recibida del servidor, estado:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        let errorMessage = `Error al subir la imagen: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // No es un JSON válido, usar el texto como está
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Forzar recarga de la imagen con un nuevo timestamp
      const timestamp = Date.now();
      localStorage.setItem('profile_photo_timestamp', timestamp);
      
      // Actualizar el estado local con el nuevo timestamp
      const updatedData = {
        ...datos[0],
        foto_perfil: `foto.png?t=${timestamp}`
      };
      
      setDatos([updatedData]);
      
      // Actualizar el formulario
      setFormData(prev => ({
        ...prev,
        foto_perfil: `foto.png?t=${timestamp}`
      }));
      
      // Mostrar notificación de éxito
      setNotification({
        message: 'Foto de perfil actualizada correctamente',
        type: 'success',
        autoHide: true
      });
      
      // Forzar actualización del componente
      forceUpdate();
      
      return { success: true, timestamp };
    } catch (error) {
      console.error('Error en handleImageChange:', error);
      setError(error.message);
      setNotification({
        message: `Error al subir la imagen: ${error.message}`,
        type: 'error'
      });
      throw error; // Re-lanzar el error para manejarlo en el componente
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para manejar el cambio de foto desde el input de archivo
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageChange(e.target.files[0]);
      // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
      e.target.value = null;
    }
  };
  
  // Cargar la foto desde localStorage al iniciar
  useEffect(() => {
    const savedPhoto = localStorage.getItem('profile_photo');
    if (savedPhoto && datos.length > 0 && !datos[0].foto_perfil) {
      setDatos(prev => [{
        ...prev[0],
        foto_perfil: savedPhoto
      }]);
    }
  }, [datos.length]);

  // Función para manejar el archivo CV
  const handleCvChange = async (file) => {
    if (!file) return;
    
    try {
      setIsSubmitting(true);
      console.log('Archivo CV seleccionado:', file);
      
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Por favor, sube un archivo PDF o Word (PDF, DOC, DOCX)');
      }
      
      // Validar tamaño del archivo (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. El tamaño máximo permitido es 5MB');
      }
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('cv', file);
      
      // Usar el nombre actual del CV si existe, de lo contrario generar uno nuevo
      const currentCvName = datos[0]?.cv || `cv-${Date.now()}.${file.name.split('.').pop()}`;
      formData.append('cv_nombre', currentCvName);
      
      const response = await fetch('http://localhost:5000/api/upload-cv', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al subir el CV');
      }
      
      // Actualizar el estado con el nuevo nombre de archivo
      setDatos(prev => [{
        ...prev[0],
        cv: result.cv_nombre
      }]);
      
      // Actualizar el formulario
      setFormData(prev => ({
        ...prev,
        cv: result.cv_nombre
      }));
      
      // Mostrar notificación de éxito
      setNotification({
        message: 'CV actualizado correctamente',
        type: 'success',
        autoHide: true
      });
      
      return result;
      
    } catch (error) {
      console.error('Error al subir el CV:', error);
      setNotification({
        message: `Error al subir el CV: ${error.message}`,
        type: 'error',
        autoHide: true
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para manejar la selección de archivo CV
  const handleCvSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsSubmitting(true);
      // Mostrar mensaje de carga
      setNotification({
        message: 'Subiendo archivo CV, por favor espere...',
        type: 'info',
        autoHide: false
      });
      
      // Llamar a la función de subida
      await handleCvChange(file);
      
      // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
      e.target.value = null;
      
      // Mostrar notificación de éxito
      setNotification({
        message: 'CV subido correctamente',
        type: 'success',
        autoHide: true
      });
      
    } catch (error) {
      console.error('Error en handleCvSelect:', error);
      setNotification({
        message: `Error al subir el CV: ${error.message}`,
        type: 'error',
        autoHide: true
      });
      throw error; // Propagar el error para manejarlo en el componente
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para abrir el modal de edición
  const handleOpenEditModal = (data) => {
    setEditingData(data);
    setFormData(data);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
    setFile(null);
    setCvFile(null);
  };

  // Función para guardar los cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Agregar campos de texto
      Object.keys(formData).forEach(key => {
        if (key !== 'foto_perfil' && key !== 'cv' && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Agregar archivos si existen
      if (file) {
        formDataToSend.append('foto_perfil', file);
      }
      
      if (cvFile) {
        formDataToSend.append('cv', cvFile);
      }

      const url = editingData ? `${API_URL}${editingData.id}/` : API_URL;
      const method = editingData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Error al guardar los datos');
      }

      closeModal();
      showNotification(editingData ? 'Datos actualizados correctamente' : 'Datos guardados correctamente');
      await handleRefreshData();
    } catch (err) {
      console.error('Error:', err);
      showNotification(err.message || 'Ocurrió un error al guardar', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  // Cerrar notificación automáticamente después de 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Función para abrir el modal de archivos
  const handleOpenArchivosModal = () => {
    setShowArchivosModal(true);
  };

  // Función para cerrar el modal de archivos
  const handleCloseArchivosModal = () => {
    setShowArchivosModal(false);
  };

  // Función para manejar el cambio de foto
  const handleCambiarFoto = () => {
    handleCloseArchivosModal();
    // Aquí podrías abrir directamente el input de archivo para la foto
    document.getElementById('foto-input')?.click();
  };

  // Función para manejar el cambio de CV
  const handleCambiarCV = (event) => {
    console.log('handleCambiarCV llamado con evento:', event ? 'con evento' : 'sin evento');
    
    // Si no hay evento, es porque se está llamando desde el botón para abrir el selector de archivos
    if (!event) {
      console.log('Abriendo selector de archivos para CV');
      document.getElementById('cv-input')?.click();
      return;
    }
    
    // Si hay un evento, es porque se está subiendo un archivo
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      console.log('No se seleccionó ningún archivo');
      return;
    }
    
    console.log('Archivo seleccionado para CV:', selectedFile.name);
    
    const uploadCv = async () => {
      try {
        const formData = new FormData();
        formData.append('cv', selectedFile);
        formData.append('cv_nombre', `cv-${Date.now()}.${selectedFile.name.split('.').pop()}`);
        
        const response = await fetch('http://localhost:5000/api/upload-cv', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Error al subir el CV');
        }
        
        // Actualizar el estado con el nuevo nombre de archivo
        setDatos(prev => [{
          ...prev[0],
          cv: result.cv_nombre
        }]);
        
        // Actualizar el formulario
        setFormData(prev => ({
          ...prev,
          cv: result.cv_nombre
        }));
        
        // Mostrar notificación de éxito
        showNotification('CV actualizado correctamente', 'success');
        
        // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
        if (event?.target) event.target.value = '';
        
      } catch (error) {
        console.error('Error al subir el CV:', error);
        showNotification(`Error al subir el CV: ${error.message}`, 'error');
        throw error; // Propagar el error para manejarlo en el componente
      } finally {
        setIsSubmitting(false);
      }
    };
    
    uploadCv();
  };

  // Verificar que handleCvSelect sea una función
  if (typeof handleCvSelect !== 'function') {
    console.error('handleCvSelect no es una función');
  }

  // Forzar actualización del componente
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  return {
    datos,
    loading,
    error,
    isModalOpen,
    formData,
    notification,
    isRefreshing,
    openEditModal: handleOpenEditModal,
    closeModal,
    handleSubmit,
    handleInputChange,
    handleImageChange,
    handleCvSelect,
    refreshData: handleRefreshData,
    showArchivosModal,
    openArchivosModal: handleOpenArchivosModal,
    closeArchivosModal: handleCloseArchivosModal,
    handleCambiarFoto,
    handleCambiarCV,
    forceUpdate,
    isSubmitting,
    showNotification
  };
};
