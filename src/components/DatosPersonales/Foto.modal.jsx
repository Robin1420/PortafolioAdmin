import React, { useRef, useState, useEffect } from 'react';

const FotoModal = ({ 
  isOpen, 
  onClose, 
  fotoPerfil, 
  onCambiarFoto,
  isSubmitting,
  showNotification
}) => {
  // Input de archivo oculto
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState('');

  // Manejar la vista previa de la imagen
  useEffect(() => {
    console.log('Foto de perfil recibida:', fotoPerfil);
    
    // Si hay un archivo seleccionado, crear una vista previa
    if (fotoPerfil instanceof File) {
      console.log('Es un archivo File, creando URL de objeto');
      const imageUrl = URL.createObjectURL(fotoPerfil);
      console.log('URL del objeto creada:', imageUrl);
      setPreview(imageUrl);
      
      // Limpiar la URL cuando el componente se desmonte o cambie la imagen
      return () => {
        console.log('Limpiando URL del objeto');
        URL.revokeObjectURL(imageUrl);
      };
    } 
    // Si hay una URL de imagen, usarla
    else if (fotoPerfil) {
      console.log('Es una URL de imagen:', fotoPerfil);
      // Si ya tiene un timestamp, no lo agregues de nuevo
      if (fotoPerfil.includes('?')) {
        setPreview(fotoPerfil);
      } else {
        // Agregar timestamp para evitar caché
        const timestamp = new Date().getTime();
        setPreview(`${fotoPerfil}?t=${timestamp}`);
      }
    } 
    // Si no hay imagen, no mostrar nada (usar un div con fondo en su lugar)
    else {
      console.log('No hay imagen de perfil');
      setPreview('');
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Primero mostramos la vista previa local
        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);
        
        // Llamamos a onCambiarFoto y esperamos a que termine
        await onCambiarFoto(file);
        
        // Si todo salió bien, cerramos el modal
        onClose();
      } catch (error) {
        // Si hay un error, mostramos el error y restauramos la vista previa anterior
        console.error('Error al subir la imagen:', error);
        setPreview(fotoPerfil || 'https://via.placeholder.com/512');
      }
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
              {/* Contenedor de la imagen - Extra grande */}
              <div className="relative w-[32rem] h-[32rem] rounded-lg overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Vista previa de la foto de perfil"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Si hay un error al cargar la imagen, mostrar un ícono
                        console.error('Error al cargar la imagen:', e);
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                      <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-sm">No se pudo cargar la imagen</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm">Sin imagen de perfil</p>
                  </div>
                )}
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
