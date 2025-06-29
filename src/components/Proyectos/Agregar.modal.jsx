import React, { useState, useEffect } from 'react';

const AgregarModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  proyecto = null,
  notification
}) => {
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

  // Si se pasa un proyecto (para edición), actualizar el estado
  useEffect(() => {
    if (proyecto) {
      setFormData({
        titulo: proyecto.titulo || '',
        descripcion: proyecto.descripcion || '',
        tecnologias: Array.isArray(proyecto.tecnologias) 
          ? proyecto.tecnologias.join(', ') 
          : (proyecto.tecnologias || ''),
        imagen: proyecto.imagen || null,
        enlace_demo: proyecto.enlace_demo || '',
        enlace_codigo: proyecto.enlace_codigo || '',
        fecha: proyecto.fecha || new Date().toISOString().split('T')[0],
        visible: proyecto.visible !== undefined ? proyecto.visible : true,
      });
    } else {
      // Resetear el formulario
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
    }
  }, [proyecto, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Asegurarse de que onSubmit reciba solo los datos del formulario, no el evento
    if (onSubmit && typeof onSubmit === 'function') {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        // El manejo de errores se realiza en el componente padre
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {proyecto ? 'Editar Proyecto' : 'Agregar Nuevo Proyecto'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {notification && (
            <div className={`mb-4 p-3 rounded-md ${
              notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tecnologías (separadas por comas) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tecnologias"
                  value={formData.tecnologias}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enlace al Demo
                </label>
                <input
                  type="url"
                  name="enlace_demo"
                  value={formData.enlace_demo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enlace al Código
                </label>
                <input
                  type="url"
                  name="enlace_codigo"
                  value={formData.enlace_codigo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen del Proyecto {!proyecto?.imagen && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                name="imagen"
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept="image/*"
                disabled={isSubmitting}
              />
              {formData.imagen && !(formData.imagen instanceof File) && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Imagen actual:</p>
                  <img 
                    src={formData.imagen} 
                    alt="Vista previa" 
                    className="mt-1 h-20 object-cover rounded"
                  />
                </div>
              )}
              {formData.imagen instanceof File && (
                <p className="mt-1 text-sm text-gray-600">
                  Archivo seleccionado: {formData.imagen.name}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="visible"
                name="visible"
                checked={formData.visible}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="visible" className="ml-2 block text-sm text-gray-700">
                Mostrar en el portafolio
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : proyecto ? (
                  'Actualizar Proyecto'
                ) : (
                  'Agregar Proyecto'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarModal;