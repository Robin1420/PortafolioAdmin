import React, { useRef, useState, useEffect } from 'react';

const FotoModal = ({ 
  isOpen, 
  onClose, 
  fotoPerfil, 
  onCambiarFoto,
  isSubmitting
}) => {
  // Input de archivo oculto
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState('');

  // Manejar la vista previa de la imagen y nombre del CV
  useEffect(() => {
    // Configurar vista previa de la imagen
    if (fotoPerfil) {
      if (fotoPerfil.startsWith('data:')) {
        // Es una vista previa de archivo
        setPreview(fotoPerfil);
      } else {
        // Usar la imagen guardada
        const savedImage = localStorage.getItem('profile_photo');
        if (savedImage) {
          setPreview(savedImage);
        } else if (fotoPerfil.startsWith('http')) {
          setPreview(fotoPerfil);
        } else {
          // Si no hay imagen guardada, usar placeholder
          setPreview('https://via.placeholder.com/512');
        }
      }
    } else {
      // Si no hay foto, mostrar placeholder
      setPreview('https://via.placeholder.com/512');
    }
    
  }, [fotoPerfil]);

  // Limpiar la URL de la vista previa cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Actualizar la vista previa cuando cambia la foto de perfil
  useEffect(() => {
    if (fotoPerfil) {
      setPreview(fotoPerfil);
    } else {
      setPreview('https://via.placeholder.com/512');
    }
  }, [fotoPerfil]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Crear una URL para la vista previa
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      onCambiarFoto(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  const handleRemovePhoto = () => {
    setPreview('https://via.placeholder.com/512');
    localStorage.removeItem('profile_photo');
    // Pasar null para indicar que se eliminó la foto
    onCambiarFoto(null);
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[calc(100vh-2rem)] my-8 overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
          <h3 className="text-xl font-semibold">Vista Previa de la Foto</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center overflow-auto w-full">
          <div className="w-full max-w-3xl">
            <div className="flex flex-col items-center space-y-6">
              {/* Imagen un poco más pequeña */}
              <div className="w-full max-w-3xl aspect-square max-h-[60vh] overflow-hidden">
                <img
                  src={preview || 'https://via.placeholder.com/1000'}
                  alt="Vista previa de la foto de perfil"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/1000';
                  }}
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Formatos aceptados: JPG, PNG, GIF (máx. 5MB)</p>
              </div>
              
              <div className="w-full flex justify-center">
                <button
                  type="button"
                  onClick={handleButtonClick}
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  } transition-colors flex items-center justify-center`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isSubmitting ? 'Subiendo...' : 'Cambiar foto'}
                </button>
              </div>
            </div>
          </div>

          {/* Input de archivo oculto */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default FotoModal;
