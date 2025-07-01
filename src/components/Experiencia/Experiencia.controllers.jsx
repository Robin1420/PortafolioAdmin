import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://api-django-portafolio.fly.dev/api/experiencias/';

export const useExperiencia = () => {
  const [experiencias, setExperiencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExperiencia, setCurrentExperiencia] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mostrar notificación
  const showNotification = useCallback((message, type = 'success', autoHide = true) => {
    setNotification({ message, type, autoHide });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Obtener todas las experiencias
  const fetchExperiencias = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Haciendo petición a:', API_URL);
      const response = await fetch(API_URL);
      
      console.log('Respuesta recibida, status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error(`Error al obtener las experiencias: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Datos recibidos:', data);
      setExperiencias(data);
      return data;
    } catch (err) {
      console.error('Error en fetchExperiencias:', err);
      const errorMessage = err.message || 'Error al cargar las experiencias';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Crear una nueva experiencia
  const createExperiencia = async (experienciaData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experienciaData),
      });

      if (!response.ok) {
        throw new Error('Error al crear la experiencia');
      }

      const data = await response.json();
      setExperiencias(prev => [...prev, data]);
      showNotification('Experiencia creada correctamente', 'success');
      return data;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar una experiencia existente
  const updateExperiencia = async (id, experienciaData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experienciaData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la experiencia');
      }

      const data = await response.json();
      setExperiencias(prev => 
        prev.map(exp => (exp.id === id ? { ...data } : exp))
      );
      showNotification('Experiencia actualizada correctamente', 'success');
      return data;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar una experiencia
  const deleteExperiencia = async (id) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la experiencia');
      }

      setExperiencias(prev => prev.filter(exp => exp.id !== id));
      showNotification('Experiencia eliminada correctamente', 'success');
      return true;
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal para editar o crear
  const openModal = (experiencia = null) => {
    setCurrentExperiencia(experiencia);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExperiencia(null);
  };

  // Cargar experiencias al montar el componente
  useEffect(() => {
    fetchExperiencias();
  }, [fetchExperiencias]);

  return {
    experiencias,
    loading,
    error,
    isModalOpen,
    currentExperiencia,
    notification,
    isSubmitting,
    fetchExperiencias,
    createExperiencia,
    updateExperiencia,
    deleteExperiencia,
    openModal,
    closeModal,
    showNotification,
  };
};