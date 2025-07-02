import React, { useState } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';

const AgregarModal = ({ isOpen, onClose, onSubmit, isSubmitting: propIsSubmitting }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    institucion: '',
    fecha: '',
    imagen: null
  });
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  
  // Usar el prop isSubmitting si está disponible, de lo contrario usar el estado local
  const isSubmitting = propIsSubmitting !== undefined ? propIsSubmitting : isLocalSubmitting;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen') {
      const file = files[0];
      setFormData(prev => ({ ...prev, imagen: file }));
      
      // Crear vista previa de la imagen
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const uploadImageToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      
      const response = await fetch('http://localhost:5000/api/certificados/upload', {
        method: 'POST',
        body: formData,
        // No establecer Content-Type, el navegador lo hará automáticamente con el boundary correcto
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al subir la imagen');
      }
      
      return {
        fileName: data.file.filename,
        path: data.file.path
      };
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw new Error('No se pudo subir la imagen al servidor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.titulo || !formData.institucion || !formData.fecha) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }
    
    // Validar que se haya seleccionado una imagen
    if (!formData.imagen) {
      alert('Por favor, selecciona una imagen para el certificado');
      return;
    }
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (formData.imagen && !allowedTypes.includes(formData.imagen.type)) {
      alert('Por favor, selecciona un archivo de imagen válido (JPEG, PNG o GIF)');
      return;
    }
    
    // Validar tamaño del archivo (máx 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (formData.imagen && formData.imagen.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es de 10MB');
      return;
    }
    
    try {
      // Usar el estado local si no se proporciona isSubmitting como prop
      if (propIsSubmitting === undefined) {
        setIsLocalSubmitting(true);
      }
      
      // Subir la imagen al servidor y obtener su ruta
      const savedImage = await uploadImageToServer(formData.imagen);
      
      // Crear objeto con los datos del formulario
      const formDataToSend = {
        titulo: formData.titulo.trim(),
        institucion: formData.institucion.trim(),
        fecha: formData.fecha,
        imagen: savedImage.fileName // Solo enviamos el nombre del archivo
      };
      
      console.log('Enviando datos:', formDataToSend);
      
      // Enviar los datos
      await onSubmit(JSON.stringify(formDataToSend));
      
      // Limpiar el formulario después de enviar
      setFormData({
        titulo: '',
        institucion: '',
        fecha: '',
        imagen: null
      });
      setPreview(null);
      
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      alert(error.message || 'Ocurrió un error al procesar el formulario');
    } finally {
      // Solo actualizar el estado local si estamos usando el estado local
      if (propIsSubmitting === undefined) {
        setIsLocalSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado con color sólido */}
        <div className="px-6 py-4 bg-green-700 text-white flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold">
            Agregar Nuevo Certificado
          </h2>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen del certificado
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Vista previa" className="mx-auto max-h-48 object-contain rounded-md" />
                      <div className="mt-2 flex justify-center space-x-3">
                        <label
                          htmlFor="imagen"
                          className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer bg-blue-50 px-3 py-1 rounded-md"
                        >
                          Cambiar
                          <input
                            id="imagen"
                            name="imagen"
                            type="file"
                            className="sr-only"
                            onChange={handleChange}
                            accept="image/*"
                            disabled={isSubmitting}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, imagen: null }));
                            setPreview(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-500"
                          disabled={isSubmitting}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="imagen"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Subir archivo</span>
                          <input
                            id="imagen"
                            name="imagen"
                            type="file"
                            className="sr-only"
                            onChange={handleChange}
                            accept="image/*"
                            disabled={isSubmitting}
                          />
                        </label>
                        <p className="pl-1">o arrastrar y soltar</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting || !formData.titulo || !formData.institucion || !formData.fecha}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarModal;
