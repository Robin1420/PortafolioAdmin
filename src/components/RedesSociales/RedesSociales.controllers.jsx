import { useState, useEffect } from 'react';

const API_URL = 'https://api-django-portafolio.fly.dev/api/redes-sociales/';

const useRedesSociales = () => {
  const [redes, setRedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRed, setSelectedRed] = useState(null);

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Obtener todas las redes sociales
  const fetchRedes = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error al cargar las redes sociales');
      }
      const data = await response.json();
      setRedes(data);
    } catch (err) {
      setError(err.message);
      showNotification('Error al cargar las redes sociales', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Agregar una nueva red social
  const createRedSocial = async (redData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(redData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear la red social');
      }

      const newRed = await response.json();
      setRedes([...redes, newRed]);
      showNotification('Red social agregada correctamente');
      return { success: true };
    } catch (err) {
      setError(err.message);
      showNotification(err.message || 'Error al crear la red social', 'error');
      return { success: false, error: err.message };
    }
  };

  // Actualizar una red social existente
  const updateRedSocial = async (id, redData) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(redData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar la red social');
      }

      const updatedRed = await response.json();
      setRedes(redes.map(red => red.id === id ? updatedRed : red));
      showNotification('Red social actualizada correctamente');
      return { success: true };
    } catch (err) {
      setError(err.message);
      showNotification(err.message || 'Error al actualizar la red social', 'error');
      return { success: false, error: err.message };
    }
  };

  // Eliminar una red social
  const deleteRedSocial = async (id) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la red social');
      }

      setRedes(redes.filter(red => red.id !== id));
      showNotification('Red social eliminada correctamente');
      return { success: true };
    } catch (err) {
      setError(err.message);
      showNotification('Error al eliminar la red social', 'error');
      return { success: false, error: err.message };
    }
  };

  // Cargar las redes al montar el componente
  useEffect(() => {
    fetchRedes();
  }, []);

  // Funciones para manejar los modales
  const openAddModal = () => setIsAddModalOpen(true);
  const openEditModal = (red) => {
    setSelectedRed(red);
    setIsEditModalOpen(true);
  };
  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedRed(null);
  };

  return {
    redes,
    loading,
    error,
    notification,
    isAddModalOpen,
    isEditModalOpen,
    selectedRed,
    fetchRedes,
    createRedSocial,
    updateRedSocial,
    deleteRedSocial,
    openAddModal,
    openEditModal,
    closeModals,
    showNotification,
  };
};

export default useRedesSociales;
