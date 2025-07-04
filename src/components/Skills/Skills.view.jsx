import React, { useState } from 'react';
import { useSkills } from './Skills.controllers';
import AgregarModal from './Agregar.modal';

const Skills = () => {
  const {
    skills,
    loading,
    error,
    notification,
    isSubmitting,
    addSkill,
    deleteSkill,
    showNotification
  } = useSkills();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  // Agrupar habilidades por categoría
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.categoria]) {
      acc[skill.categoria] = [];
    }
    acc[skill.categoria].push(skill);
    return acc;
  }, {});

  const handleAddSkill = async (formData) => {
    try {
      await addSkill(formData);
      // El controlador ya maneja la notificación
      // Cerrar el modal después de un tiempo
      setTimeout(() => {
        setIsModalOpen(false);
      }, 500);
      return true;
    } catch (error) {
      console.error('Error al agregar habilidad:', error);
      // El controlador ya maneja la notificación de error
      return false;
    }
  };

  const handleDeleteClick = (id) => {
    setSkillToDelete(id);
    setShowConfirmAlert(true);
  };

  const handleConfirmDelete = async () => {
    if (!skillToDelete) return;
    
    try {
      await deleteSkill(skillToDelete);
      setShowConfirmAlert(false);
    } catch (error) {
      console.error('Error al eliminar habilidad:', error);
    } finally {
      setSkillToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Habilidades</h1>
          <div className="ml-4 bg-gray-100 rounded-lg h-10 w-10 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </div>
              <ul className="divide-y divide-gray-100">
                {[1, 2, 3].map((skill) => (
                  <li key={skill} className="py-3 px-6">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-100 rounded-full"></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Habilidades</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-4 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors p-2 rounded-lg"
          title="Agregar habilidad"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button 
              onClick={() => showNotification(null)}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal para agregar habilidad */}
      <AgregarModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          showNotification(null);
        }}
        onSubmit={handleAddSkill}
        isSubmitting={isSubmitting}
        notification={notification}
        skills={skills}
      />

      {/* Modal de confirmación para eliminar */}
      {showConfirmAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <svg className="mx-auto mb-4 w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500">
                ¿Estás seguro de que deseas eliminar esta habilidad?
              </h3>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowConfirmAlert(false);
                    setSkillToDelete(null);
                  }}
                  type="button"
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                >
                  No, cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  type="button"
                  disabled={isSubmitting}
                  className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  {isSubmitting ? 'Eliminando...' : 'Sí, estoy seguro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de habilidades agrupadas por categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(skillsByCategory).map(([categoria, habilidades]) => (
          <div key={categoria} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden">
            <div className="px-6 py-3 border-b border-blue-50 bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-base font-semibold text-blue-800 flex items-center">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 mr-3"></span>
                <span className="uppercase tracking-wide text-sm text-blue-700">{categoria}</span>
                <span className="ml-auto text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 px-2.5 py-1 rounded-full shadow-sm">
                  {habilidades.length} {habilidades.length === 1 ? 'habilidad' : 'habilidades'}
                </span>
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {habilidades.map((skill) => (
                <li key={skill.id} className="group hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between py-3 px-6">
                    <span className="text-gray-700 font-medium truncate">{skill.nombre}</span>
                    <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(skill.id);
                        }}
                        className="text-red-500 hover:bg-red-50 transition-all duration-200 p-1.5 rounded-full focus:outline-none"
                        title="Eliminar habilidad"
                        aria-label={`Eliminar ${skill.nombre}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {skills.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          No hay habilidades registradas. Agrega una nueva habilidad para comenzar.
        </div>
      )}
    </div>
  );
};

export default Skills;
