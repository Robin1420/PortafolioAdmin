import { useState, useEffect } from 'react';
import { useDatosPersonales } from './DatosPersonales.controllers';
import EditarDatosModal from './EditarDatosModal';
import FotoModal from './FotoModal';
import CvModal from './cvModal';

// Componente de notificación
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-4 transition-all duration-300 transform hover:scale-105`}>
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200 focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

// Componente de skeleton para la carga
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 rounded-full bg-gray-200 mb-4"></div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>

    </div>
  </div>
);

const DatosPersonalesView = () => {
  const {
    datos,
    loading,
    error,
    isModalOpen,
    formData,
    notification,
    isRefreshing,
    openEditModal,
    closeModal,
    handleSubmit,
    handleInputChange,
    handleImageChange,
    handleCvSelect,
    refreshData,
    showArchivosModal,
    openArchivosModal,
    closeArchivosModal,
    handleCambiarFoto,
    handleCambiarCV,
    forceUpdate,
    isSubmitting,
    showNotification
  } = useDatosPersonales();

  const [showCvModal, setShowCvModal] = useState(false);
  
  const handleOpenCvModal = (e) => {
    // Verificar si se pasó un evento para evitar errores
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowCvModal(true);
  };

  const handleCvUpload = async (file) => {
    try {
      await handleCvSelect({ target: { files: [file] } });
      // Actualizar la URL del CV en el modal después de subir
      if (datos[0]?.cv) {
        // Forzar actualización de la URL para evitar caché
        setShowCvModal(false);
        setTimeout(() => {
          setShowCvModal(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error al subir el CV:', error);
    }
  };
  
  // Efecto para manejar notificaciones
  // Este efecto ya no es necesario ya que el hook useDatosPersonales maneja las notificaciones
  // y las pasa a través de la prop notification

  if (loading && !isRefreshing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Modal de visualización de CV */}
          <CvModal 
            isOpen={showCvModal}
            onClose={() => setShowCvModal(false)}
            cvUrl={datos[0]?.cv ? `http://localhost:5000/assets/DatosPersonales/documento/${datos[0].cv}?t=${new Date().getTime()}` : ''}
            onCvChange={handleCvUpload}
            isSubmitting={isSubmitting}
          />
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Modal de visualización de CV */}
      <CvModal 
        isOpen={showCvModal}
        onClose={() => setShowCvModal(false)}
        cvUrl={datos[0]?.cv ? `http://localhost:5000/assets/DatosPersonales/documento/${datos[0].cv}?t=${new Date().getTime()}` : ''}
        onCvChange={handleCvUpload}
        isSubmitting={isSubmitting}
      />
      
      {/* Notificación */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => {}}
        />
      )}
      
      {/* Encabezado */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Datos Personales</h1>
        <p className="text-gray-600">Administra tu información personal y profesional</p>
      </header>
      
      {/* Contenedor del contenido con animación de carga */}
      <div className="relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-30 rounded-xl transition-opacity duration-300">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Vista de escritorio (solo en pantallas medianas y grandes) */}
        <div className={`hidden md:block transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        {datos.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Datos personales</h2>
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(datos[0]);
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg"
                  title="Editar perfil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {datos.map((dato) => (
                <div key={dato.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Columna izquierda - Foto de perfil */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={openArchivosModal}
                    >
                      <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                        <img 
                          className="w-full h-full object-cover" 
                          src={datos[0]?.foto_perfil ? `/assets/DatosPersonales/foto/foto.png?t=${new Date().getTime()}` : 'https://via.placeholder.com/512'}
                          alt="Foto de perfil"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/512';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
                        <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Cambiar foto</span>
                      </div>
                    </div>
                  </div>

                  {/* Columna central - Información personal */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{dato.nombre} {dato.apellido}</h3>
                      <p className="text-blue-600 font-medium">{dato.profesion || 'Profesión no especificada'}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {dato.email && (
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-gray-500">Correo electrónico</p>
                            <a href={`mailto:${dato.email}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {dato.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {dato.telefono && (
                        <div className="flex items-start">
                          <div className="bg-green-100 p-2 rounded-lg text-green-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-gray-500">Teléfono</p>
                            <a href={`tel:${dato.telefono.replace(/\s+/g, '')}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                              {dato.telefono}
                            </a>
                          </div>
                        </div>
                      )}

                      {dato.direccion && (
                        <div className="flex items-start">
                          <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-gray-500">Dirección</p>
                            <p className="text-sm font-medium text-gray-900">{dato.direccion}</p>
                          </div>
                        </div>
                      )}

                      {/* Campo CV en tarjeta grande */}
                      <div className="flex items-start">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">Curriculum Vitae</p>
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  document.getElementById('cv-upload-large').click();
                                }}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 transition-colors p-1 rounded-lg"
                                title="Actualizar CV"
                                disabled={isSubmitting}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                              <input
                                id="cv-upload-large"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleCvSelect}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          {dato.cv ? (
                            <button 
                              onClick={handleOpenCvModal}
                              className="text-sm font-medium text-blue-600 hover:underline cursor-pointer inline-flex items-center"
                            >
                              Ver CV
                              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                              </svg>
                            </button>
                          ) : (
                            <p className="text-sm font-medium text-gray-500">No disponible</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha - Descripción */}
                  <div className="lg:col-span-3 mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Sobre mí</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {dato.descripcion || 'No hay descripción disponible.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">No hay datos disponibles</h3>
            <p className="mt-1 text-gray-500">Comienza agregando tu información personal</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  // Lógica para agregar nuevo dato
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Agregar información
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vista de tarjetas (solo en pantallas pequeñas) */}
      <div className={`md:hidden transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        {datos.length > 0 ? (
          datos.map((dato) => (
            <div key={dato.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              {/* Encabezado con gradiente */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white">{dato.nombre} {dato.apellido}</h3>
                  <p className="text-blue-100">{dato.profesion || 'Profesión no especificada'}</p>
                </div>
              </div>
              
              {/* Contenido principal */}
              <div className="px-6 pb-6 -mt-12 relative">
                {/* Foto de perfil */}
                <div className="flex justify-end mb-4">
                  <div 
                  className="relative group cursor-pointer h-24 w-24"
                  onClick={(e) => {
                    e.stopPropagation();
                    openArchivosModal();
                  }}
                >
                  <div className="h-full w-full rounded-full border-4 border-white shadow-lg bg-white overflow-hidden">
                    <img 
                      className="w-full h-full object-cover" 
                      src={datos[0]?.foto_perfil ? `/assets/DatosPersonales/foto/foto.png?t=${new Date().getTime()}` : 'https://via.placeholder.com/512'}
                      alt="Foto de perfil"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/512';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center px-1">Cambiar foto</span>
                  </div>
                </div>
                </div>

                {/* Información de contacto */}
                <div className="space-y-4 mt-6">
                  {dato.email && (
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Correo</p>
                        <a href={`mailto:${dato.email}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {dato.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {dato.telefono && (
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Teléfono</p>
                        <a href={`tel:${dato.telefono.replace(/\s+/g, '')}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {dato.telefono}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {dato.direccion && (
                    <div className="flex items-start">
                      <div className="bg-purple-100 p-2 rounded-lg text-purple-600 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Dirección</p>
                        <p className="text-sm font-medium text-gray-900">{dato.direccion}</p>
                      </div>
                    </div>
                  )}

                  {/* Campo CV en tarjeta pequeña */}
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600 mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">Curriculum Vitae</p>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              document.getElementById('cv-upload-small').click();
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 transition-colors p-1 rounded-lg"
                            title="Actualizar CV"
                            disabled={isSubmitting}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <input
                            id="cv-upload-small"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleCvSelect}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      {dato.cv ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCvModal();
                          }}
                          className="text-sm font-medium text-blue-600 hover:underline cursor-pointer inline-flex items-center"
                        >
                          Ver CV
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      ) : (
                        <p className="text-sm font-medium text-gray-500">No disponible</p>
                      )}
                    </div>
                  </div>
                  
                </div>

                {/* Descripción */}
                {dato.descripcion && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Sobre mí</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {dato.descripcion}
                    </p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(dato);
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">No hay datos disponibles</h3>
            <p className="mt-1 text-gray-500">Comienza agregando tu información personal</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  // Aquí irá la lógica para agregar un nuevo dato
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Agregar información
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modal de edición */}
      <EditarDatosModal
        isOpen={isModalOpen}
        onClose={closeModal}
        formData={formData}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleCvChange={handleCvSelect}
        handleSubmit={handleSubmit}
        loading={loading}
        error={error}
        showNotification={showNotification}
      />

      {showArchivosModal && (
        <FotoModal
          isOpen={showArchivosModal}
          onClose={closeArchivosModal}
          fotoPerfil={datos[0]?.foto_perfil ? `http://localhost:5000/assets/DatosPersonales/foto/${datos[0].foto_perfil}` : ''}
          onCambiarFoto={handleImageChange}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Inputs ocultos para la carga de archivos */}
      <input
        type="file"
        id="foto-input"
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />
      <input
        type="file"
        id="cv-upload-large"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleCvSelect}
        key="cv-upload-large"
      />
      <input
        type="file"
        id="cv-upload-small"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleCvSelect}
        key="cv-upload-small"
      />
    </div>
  );
};

export default DatosPersonalesView;