import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://api-django-portafolio.fly.dev/api/skills/';

export const useSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mostrar notificación
  const showNotification = useCallback((message, type = 'success', autoHide = true) => {
    setNotification({ message, type, autoHide });
    if (autoHide) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Obtener todas las habilidades
  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al cargar las habilidades');
      const data = await response.json();
      setSkills(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las habilidades');
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  // Agregar una nueva habilidad
  const addSkill = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          categoria: formData.categoria
        }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Error al agregar la habilidad';
        let errorDetails = null;
        
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object') {
            // Si hay errores de validación del servidor
            if (errorData.detail) {
              errorMessage = errorData.detail;
            } else {
              // Formatear errores de validación de campos
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
      setSkills(prevSkills => [...prevSkills, data]);
      
      showNotification('Habilidad agregada correctamente', 'success');
      return data;
    } catch (err) {
      console.error('Error al agregar habilidad:', err);
      showNotification(err.message || 'Error al agregar la habilidad', 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar una habilidad
  const deleteSkill = async (id) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Error al eliminar la habilidad');
      
      setSkills(prevSkills => prevSkills.filter(skill => skill.id !== id));
      showNotification('Habilidad eliminada correctamente', 'success');
      return true;
    } catch (err) {
      console.error('Error al eliminar habilidad:', err);
      showNotification('Error al eliminar la habilidad', 'error');
      throw err;
    }
  };

  // Cargar habilidades al montar el componente
  useEffect(() => {
    fetchSkills();
  }, []);

  return {
    skills,
    loading,
    error,
    notification,
    isSubmitting,
    addSkill,
    deleteSkill,
    showNotification
  };
};
