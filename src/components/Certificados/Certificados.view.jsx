import React, { useState } from 'react';
import { useCertificados } from './Certificados.controlers';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import AgregarModal from './Agregar.modal';
import EditarModal from './Editar.modal';

const Certificados = () => {
  const {
    certificados,
    loading,
    error,
    notification,
    setNotification,
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
  } = useCertificados();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [certificadoToDelete, setCertificadoToDelete] = useState(null);

  const handleDeleteClick = (certificado) => {
    setCertificadoToDelete(certificado);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (certificadoToDelete) {
      try {
        await deleteCertificado(certificadoToDelete.id, certificadoToDelete.imagen);
        setShowDeleteModal(false);
        setCertificadoToDelete(null);
      } catch (error) {
        console.error('Error al eliminar el certificado:', error);
      }
    }
  };

  const handleAddCertificado = async (certificadoData) => {
    try {
      await createCertificado(certificadoData);
    } catch (error) {
      console.error('Error al crear el certificado:', error);
    }
  };

  const handleUpdateCertificado = async (certificadoData) => {
    try {
      await updateCertificado(certificadoData);
    } catch (error) {
      console.error('Error al actualizar el certificado:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Certificados</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificados.map((certificado) => (
          <div
            key={certificado.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
          >
            <div className="relative group">
              <div className="absolute top-3 right-3 flex space-x-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(certificado);
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg"
                  title="Editar"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(certificado);
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg"
                  title="Eliminar"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
              <div className="h-48 bg-gray-100 overflow-hidden">
                {certificado.imagen ? (
                  <img
                    src={`/assets/Certificados/${certificado.imagen}`}
                    alt={certificado.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span>Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{certificado.titulo}</h3>
                <p className="text-sm text-gray-500 mb-4">{certificado.institucion}</p>
                <div className="text-xs text-gray-500">
                  {new Date(certificado.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Tarjeta de Agregar Certificado - Al final de la lista */}
        <div 
          onClick={() => setIsAddModalOpen(true)}
          className="group bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-green-400 flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:bg-green-50"
        >
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-200">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Agregar Certificado</h3>
            <p className="text-sm text-gray-600">Haz clic para agregar un nuevo certificado</p>
          </div>
        </div>
      </div>

      {/* Modal de Agregar */}
      <AgregarModal
        isOpen={isAddModalOpen}
        onClose={closeModals}
        onSubmit={handleAddCertificado}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Editar */}
      <EditarModal
        isOpen={isEditModalOpen}
        onClose={closeModals}
        certificado={selectedCertificado}
        onSubmit={handleUpdateCertificado}
        onDelete={handleDeleteClick}
        isSubmitting={isSubmitting}
      />

      {/* Alerta de confirmación personalizada */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo oscuro */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
              aria-hidden="true"
              onClick={() => !isSubmitting && setShowDeleteModal(false)}
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
                      ¿Eliminar certificado?
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar el certificado "{certificadoToDelete?.titulo}"? Esta acción no se puede deshacer.
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
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
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white max-w-sm transition-all duration-300 transform ${
          notification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {notification.message}
            </p>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-100"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificados;
