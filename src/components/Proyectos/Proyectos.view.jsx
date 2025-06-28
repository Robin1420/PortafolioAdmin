import React, { useState } from 'react';
import { useProyectos } from './Proyectos.controllers';

const ProyectosView = () => {
  const {
    proyectos,
    loading,
    error,
    isModalOpen,
    currentProyecto,
    notification,
    isSubmitting,
    createProyecto,
    updateProyecto,
    deleteProyecto,
    handleEdit,
    handleCloseModal,
    handleSubmit,
    showNotification,
    formatearFecha, // Asegurarse de obtener formatearFecha del controlador
    setCurrentProyecto, // Asegurarse de obtener setCurrentProyecto
    setIsModalOpen,
  } = useProyectos();

  // Estado para el formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tecnologias: '',
    imagen: null,
    enlace_demo: '',
    enlace_codigo: '',
    fecha: new Date().toISOString().split('T')[0],
    visible: true,
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    console.log('Campo cambiado:', { name, value, type });
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'date') {
      // Asegurarse de que la fecha esté en formato YYYY-MM-DD
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    console.log('Datos del formulario actualizados:', formData);
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Enviando formulario con datos:', formData);
    
    // Asegurarse de que la fecha esté en el formato correcto
    const datosAEnviar = {
      ...formData,
      fecha: formatearFecha(formData.fecha) || new Date().toISOString().split('T')[0]
    };
    
    console.log('Datos a enviar al servidor:', datosAEnviar);
    
    try {
      await handleSubmit(datosAEnviar);
      // Resetear el formulario después de enviar exitosamente
      setFormData({
        titulo: '',
        descripcion: '',
        tecnologias: '',
        imagen: null,
        enlace_demo: '',
        enlace_codigo: '',
        fecha: new Date().toISOString().split('T')[0],
        visible: true,
      });
      showNotification('Proyecto guardado exitosamente', 'success');
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
      showNotification(`Error al guardar el proyecto: ${error.message}`, 'error');
    }
  };

  // Formatear fecha para mostrar en la interfaz (formato DD/MM/YYYY)
  const formatearFechaParaMostrar = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    // Si la fecha no es válida, devolver la cadena original
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida para formatear:', fecha);
      return fecha;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mis Proyectos</h1>
      </div>

      {/* Notificación */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg ${notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500 text-red-700' : 'bg-green-100 border-l-4 border-green-500 text-green-700'}`}>
          <p>{notification.message}</p>
        </div>
      )}

      {/* Lista de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyectos.map((proyecto) => (
          <div key={proyecto.id} className="group bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 relative border border-gray-100 hover:z-10 hover:scale-105">
            {/* Delete Button - Only shows on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProyecto(proyecto.id);
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg"
                title="Eliminar proyecto"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {proyecto.imagen && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={`/assets/Proyectos/${proyecto.imagen}`} 
                  alt={proyecto.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/placeholder-image.png';
                  }}
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{proyecto.titulo}</h3>
              <p className="text-sm text-gray-500">
                {formatearFechaParaMostrar(proyecto.fecha)}
              </p>
              <div className="relative">
                <p className="text-gray-700 mb-4 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                  {proyecto.descripcion}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none group-hover:hidden"></div>
              </div>
              
              {/* Technologies */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {proyecto.tecnologias.split(',').map((tech, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visibility Status */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  proyecto.visible 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${
                    proyecto.visible ? 'text-green-400' : 'text-yellow-400'
                  }`} fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  {proyecto.visible ? 'Visible' : 'Oculto'}
                </span>
              </div>

              {/* Action Buttons - GitHub above Visit */}
              <div className="flex flex-col space-y-2">
                {proyecto.enlace_codigo && (
                  <a 
                    href={proyecto.enlace_codigo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-gray-700 hover:text-gray-900 text-sm font-medium px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    GitHub
                  </a>
                )}
                <a 
                  href={proyecto.enlace_demo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visitar
                </a>
              </div>
            </div>
          </div>
        ))}
        
        {/* Tarjeta de Agregar Proyecto - Al final de la lista */}
        <div 
          onClick={() => {
            setCurrentProyecto(null);
            setIsModalOpen(true);
          }}
          className="group bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:bg-blue-50"
        >
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-200">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Agregar Proyecto</h3>
            <p className="text-sm text-gray-500">Haz clic para crear un nuevo proyecto</p>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {currentProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías (separadas por comas)</label>
                  <input
                    type="text"
                    name="tecnologias"
                    value={formData.tecnologias}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="enlace_demo" className="block text-sm font-medium text-gray-700 mb-1">Enlace Demo</label>
                    <input
                      type="url"
                      id="enlace_demo"
                      name="enlace_demo"
                      value={formData.enlace_demo || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/demo"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="enlace_codigo" className="block text-sm font-medium text-gray-700 mb-1">Enlace Código</label>
                    <input
                      type="url"
                      id="enlace_codigo"
                      name="enlace_codigo"
                      value={formData.enlace_codigo || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="visible"
                    id="visible"
                    checked={formData.visible}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="visible" className="ml-2 block text-sm text-gray-700">
                    Visible
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen {currentProyecto?.imagen && '(Dejar en blanco para mantener la actual)'}
                  </label>
                  <input
                    type="file"
                    name="imagen"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {currentProyecto ? 'Actualizando...' : 'Creando...'}
                    </span>
                  ) : currentProyecto ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProyectosView;