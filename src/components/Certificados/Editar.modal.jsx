import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi';

const EditarModal = ({ isOpen, onClose, certificado, onSubmit, onDelete, isSubmitting }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    institucion: '',
    fecha: '',
    imagen: null,
  });
  const [preview, setPreview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Actualizar el formulario cuando cambia el certificado
  useEffect(() => {
    if (certificado) {
      setFormData({
        titulo: certificado.titulo || '',
        institucion: certificado.institucion || '',
        fecha: certificado.fecha ? certificado.fecha.split('T')[0] : '',
      });
    }
  }, [certificado]);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      const file = files[0];
      setFormData(prev => ({ ...prev, imagen: file }));
      
      // Crear vista previa de la nueva imagen
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleDeleteClick = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este certificado?')) {
      setIsDeleting(true);
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('Error al eliminar el certificado:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!isOpen || !certificado) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado con color sólido */}
        <div className="px-6 py-4 bg-blue-700 text-white flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold">
            Editar Certificado
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
              disabled={isSubmitting || isDeleting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting || isDeleting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institución <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="institucion"
                value={formData.institucion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting || isDeleting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de obtención <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting || isDeleting}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting || isDeleting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting || isDeleting || !formData.titulo || !formData.institucion || !formData.fecha}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarModal;
