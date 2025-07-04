import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiExternalLink } from 'react-icons/fi';
import useRedesSociales from './RedesSociales.controllers';
import AgregarModal from './Agregar.modal';
import EditarModal from './Editar.modal';

const RedesSociales = () => {
  const {
    redes,
    loading,
    error,
    notification,
    setNotification,
    isAddModalOpen,
    isEditModalOpen,
    selectedRed,
    createRedSocial,
    updateRedSocial,
    deleteRedSocial,
    openAddModal,
    openEditModal,
    closeModals,
  } = useRedesSociales();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [redToDelete, setRedToDelete] = useState(null);

  const handleDeleteClick = (red) => {
    setRedToDelete(red);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (redToDelete) {
      await deleteRedSocial(redToDelete.id);
      setShowDeleteModal(false);
      setRedToDelete(null);
    }
  };

  const getPlatformIcon = (plataforma) => {
    const platform = plataforma.toLowerCase();
    if (platform.includes('github')) return 'github';
    if (platform.includes('linkedin')) return 'linkedin';
    if (platform.includes('twitter')) return 'twitter';
    if (platform.includes('instagram')) return 'instagram';
    if (platform.includes('facebook')) return 'facebook';
    return 'link';
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-4">
          Redes Sociales
          <button
            onClick={openAddModal}
            className="ml-4 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors p-2 rounded-lg"
            title="Agregar nueva red social"
          >
            <FiPlus size={16} />
            <span className="hidden sm:inline"></span>
          </button>
        </h1>
      </div>

      {notification && (
        <div className={`fixed top-4 right-4 ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-4 transition-all duration-300 transform hover:scale-105`}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : redes.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">No hay redes sociales configuradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {redes.map((red) => (
            <div key={red.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start">
                <div className="pr-2">
                  <h3 className="font-medium text-gray-900">{red.plataforma}</h3>
                  <a 
                    href={red.enlace} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    {red.enlace}
                    <FiExternalLink size={14} />
                  </a>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${red.visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {red.visible ? 'Visible' : 'Oculta'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 absolute right-4 top-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(red);
                    }}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg shadow-sm"
                    title="Editar"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(red);
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg shadow-sm"
                    title="Eliminar"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <svg className="mx-auto mb-4 w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500">
                ¿Estás seguro de que deseas eliminar esta red social?
              </h3>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRedToDelete(null);
                  }}
                  type="button"
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                >
                  No, cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  type="button"
                  className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  Sí, estoy seguro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AgregarModal
        isOpen={isAddModalOpen}
        onClose={closeModals}
        onSave={createRedSocial}
      />

      {selectedRed && (
        <EditarModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onSave={(data) => updateRedSocial(selectedRed.id, data)}
          initialData={selectedRed}
        />
      )}
    </div>
  );
};

export default RedesSociales;
