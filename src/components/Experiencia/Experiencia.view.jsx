import React, { useState } from 'react';
import { useExperiencia } from './Experiencia.controllers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AgregarModal from './Agregar.modal';
import EditarModal from './Editar.modal';

const ExperienciaView = () => {
  const {
    experiencias,
    loading,
    error,
    notification,
    isSubmitting,
    fetchExperiencias,
    createExperiencia,
    updateExperiencia,
    deleteExperiencia,
    showNotification,
  } = useExperiencia();

  // Estados para controlar los modales
  const [showAgregarModal, setShowAgregarModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [experienciaSeleccionada, setExperienciaSeleccionada] = useState(null);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [experienciaAEliminar, setExperienciaAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'Actualidad';
    return format(new Date(dateString), 'MMM yyyy', { locale: es });
  };

  // Renderizar viñetas de la descripción
  const renderDescripcion = (descripcion) => {
    if (!descripcion) return null;
    return descripcion.split('\n').map((item, index) => {
      if (!item.trim()) return null;
      return (
        <li key={index} className="flex items-start mb-2">
          <span className="inline-block mr-2 text-blue-500">•</span>
          <span className="text-gray-700">{item.trim()}</span>
        </li>
      );
    });
  };

  // Manejadores para los modales
  const handleOpenAgregarModal = () => {
    setShowAgregarModal(true);
  };

  const handleCloseAgregarModal = () => {
    setShowAgregarModal(false);
  };

  const handleOpenEditarModal = (experiencia) => {
    setExperienciaSeleccionada(experiencia);
    setShowEditarModal(true);
  };

  const handleCloseEditarModal = () => {
    setShowEditarModal(false);
    setExperienciaSeleccionada(null);
  };

  // Manejadores para las acciones CRUD
  const handleCreateExperiencia = async (data) => {
    try {
      await createExperiencia(data);
      showNotification('Experiencia creada exitosamente', 'success');
      handleCloseAgregarModal();
    } catch (error) {
      showNotification(error.message || 'Error al crear la experiencia', 'error');
    }
  };

  const handleUpdateExperiencia = async (data) => {
    try {
      await updateExperiencia(experienciaSeleccionada.id, data);
      showNotification('Experiencia actualizada exitosamente', 'success');
      handleCloseEditarModal();
    } catch (error) {
      showNotification(error.message || 'Error al actualizar la experiencia', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!experienciaAEliminar) return;
    
    try {
      setIsDeleting(true);
      await deleteExperiencia(experienciaAEliminar);
      showNotification('Experiencia eliminada exitosamente', 'success');
      setShowConfirmAlert(false);
    } catch (error) {
      showNotification(error.message || 'Error al eliminar la experiencia', 'error');
    } finally {
      setIsDeleting(false);
      setExperienciaAEliminar(null);
    }
  };

  const handleDeleteClick = (id) => {
    setExperienciaAEliminar(id);
    setShowConfirmAlert(true);
  };

  if (loading && experiencias.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Experiencia Laboral
            <button className="ml-4 bg-gray-100 text-gray-400 p-2 rounded-lg cursor-not-allowed" disabled>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </h1>
        </div>

        <div className="space-y-8">
          {[1, 2, 3].map((_, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-blue-500 relative animate-pulse"
            >
              {/* Botones de acción */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
              </div>
              
              <div className="p-6 pt-12">
                {/* Encabezado */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-blue-100 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                  </div>
                  <div className="h-5 w-16 bg-green-100 rounded-full"></div>
                </div>
                
                {/* Descripción */}
                <div className="mt-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  <ul className="space-y-2">
                    {[1, 2, 3].map((_, i) => (
                      <li key={i} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2"></span>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Habilidades */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-100 rounded-full px-4 w-20"></div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Pie de tarjeta */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button
          onClick={fetchExperiencias}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Experiencia Laboral
          <button
            onClick={handleOpenAgregarModal}
            className="ml-4 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors p-2 rounded-lg"
            title="Agregar experiencia"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </h1>
      </div>

      <div className="space-y-8">
        {experiencias.map((exp) => (
          <div 
            key={exp.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-blue-500 relative"
          >
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => handleOpenEditarModal(exp)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg"
                title="Editar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteClick(exp.id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg"
                title="Eliminar"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="p-6 pt-12">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{exp.puesto}</h2>
                  <h3 className="text-xl text-blue-600 font-semibold">{exp.empresa}</h3>
                  <div className="text-gray-600 font-medium">
                    {formatDate(exp.fecha_inicio)} - {exp.actual ? 'Actualidad' : formatDate(exp.fecha_fin)}
                  </div>
                </div>
                <div className="text-right">
                  
                  <div className="text-sm text-gray-500">
                    {exp.actual ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Actual
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Responsabilidades:</h4>
                <ul className="list-none pl-0">
                  {renderDescripcion(exp.descripcion)}
                </ul>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notificación */}
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Modal de Agregar */}
      <AgregarModal
        isOpen={showAgregarModal}
        onClose={handleCloseAgregarModal}
        onSubmit={handleCreateExperiencia}
        isSubmitting={isSubmitting}
        notification={notification}
      />

      {/* Modal de Editar */}
      <EditarModal
        isOpen={showEditarModal}
        onClose={handleCloseEditarModal}
        experiencia={experienciaSeleccionada}
        onSave={handleUpdateExperiencia}
        isSubmitting={isSubmitting}
        notification={notification}
      />
      {/* Modal de Editar */}
      <EditarModal
        isOpen={showEditarModal}
        onClose={handleCloseEditarModal}
        experiencia={experienciaSeleccionada}
        onSave={handleUpdateExperiencia}
        isSubmitting={isSubmitting}
        notification={notification}
      />

      {/* Alerta de confirmación de eliminación */}
      {showConfirmAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo oscuro */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
              aria-hidden="true"
              onClick={() => !isDeleting && setShowConfirmAlert(false)}
            ></div>
            
            {/* Contenido de la alerta */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      ¿Eliminar experiencia?
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar esta experiencia? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : 'Eliminar'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowConfirmAlert(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienciaView;