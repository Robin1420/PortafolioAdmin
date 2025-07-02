import React, { useState, useEffect } from 'react';

const AgregarModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  notification,
  skills = []
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: ''
  });
  const [categorias, setCategorias] = useState([]);

  // Extraer categorías únicas de las habilidades existentes
  useEffect(() => {
    if (skills && skills.length > 0) {
      const categoriasUnicas = [...new Set(skills.map(skill => skill.categoria).filter(Boolean))];
      setCategorias(categoriasUnicas);
    } else {
      setCategorias([]);
    }
  }, [skills]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await onSubmit(formData);
      if (success) {
        // Limpiar el formulario después de un envío exitoso
        setFormData({
          nombre: '',
          categoria: ''
        });
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      // El manejo de errores se realiza en el componente padre
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Encabezado con color sólido */}
        <div className="px-6 py-4 bg-green-600 text-white flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold">Agregar Habilidad</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {notification && (
            <div className={`mb-4 p-3 rounded-md ${
              notification.type === 'error' ? 'bg-red-100 border-l-4 border-red-500 text-red-700' : 'bg-green-100 border-l-4 border-green-500 text-green-700'
            } py-2`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {notification.type === 'error' ? (
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Habilidad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: React, Node.js, etc."
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  required
                  disabled={isSubmitting || categorias.length === 0}
                >
                  <option value="">
                    {categorias.length > 0 
                      ? 'Selecciona una categoría' 
                      : 'No hay categorías disponibles'}
                  </option>
                  {categorias.map((categoria, index) => (
                    <option key={index} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {categorias.length > 0 && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="O escribe una nueva categoría"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  notification && notification.autoHide && setTimeout(() => {
                    notification = null;
                  }, 1500);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Agregar skills'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarModal;