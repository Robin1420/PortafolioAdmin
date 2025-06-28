import { useState, useRef, useEffect } from 'react';

const CvModal = ({ isOpen, onClose, cvUrl, onCvChange, isSubmitting }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (cvUrl) {
      setPreviewUrl(cvUrl);
    } else {
      setPreviewUrl('');
    }
  }, [cvUrl]);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream' // Para algunos tipos de archivo en ciertos navegadores
    ];
    
    // Verificar extensión del archivo como respaldo
    const fileName = file.name.toLowerCase();
    const isValidExtension = fileName.endsWith('.pdf') || 
                           fileName.endsWith('.doc') || 
                           fileName.endsWith('.docx');
    
    if (!validTypes.includes(file.type) && !isValidExtension) {
      alert('Por favor, sube un archivo PDF o Word (PDF, DOC, DOCX)');
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      return;
    }

    // Crear URL de vista previa para PDF
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    } else {
      // Para archivos que no son PDF, no mostramos vista previa
      setPreviewUrl('');
    }

    // Llamar a la función de cambio de CV
    if (onCvChange) {
      onCvChange(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] my-8 overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-gray-800 text-white">
          <h3 className="text-xl font-semibold mb-2 sm:mb-0">Vista Previa del CV</h3>
          <div className="flex items-center space-x-3 w-full sm:w-auto mt-2 sm:mt-0">
            
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors p-1 -mr-1"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center overflow-auto w-full">
          <div className="w-full max-w-3xl">
            {previewUrl ? (
              <div className="w-full h-full">
                {/* Verificar si es un PDF o una URL de blob (vista previa) */}
                {previewUrl.endsWith('.pdf') || 
                 previewUrl.includes('.pdf?') || 
                 previewUrl.startsWith('blob:') || 
                 previewUrl.includes('application/pdf') ? (
                  <div className="w-full h-full flex justify-center">
                    <div className="w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: 'calc(80vh - 200px)' }}>
                      <iframe
                        src={`${previewUrl}#toolbar=0`}
                        className="w-full h-full border-0"
                        title="Vista previa del CV"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 sm:h-64 bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-gray-600 text-base sm:text-lg font-medium mb-1 sm:mb-2">Vista previa no disponible</p>
                    <p className="text-sm sm:text-base text-gray-500">El archivo no puede mostrarse en la vista previa.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 sm:p-6 text-center">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="text-gray-600 text-base sm:text-lg font-medium mb-1 sm:mb-2">No hay CV cargado</p>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Sube tu CV en formato PDF, DOC o DOCX</p>
                <button
                  type="button"
                  onClick={handleButtonClick}
                  disabled={isSubmitting}
                  className={`px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  } transition-colors flex items-center mx-auto`}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {isSubmitting ? 'Subiendo...' : 'Seleccionar archivo'}
                </button>
              </div>
            )}
            <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Formatos soportados: PDF, DOC, DOCX (máx. 10MB)
            </p>
            </div>
            
            <div className="w-full flex justify-center">
            <button
            type="button"
              onClick={handleButtonClick}
              disabled={isSubmitting}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-sm font-medium ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              } transition-colors flex items-center flex-1 sm:flex-none justify-center`}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isSubmitting ? 'Subiendo...' : 'Cambiar CV'}
            </button>
            </div>
            
          </div>
        </div>
        {/* Input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          className="hidden"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CvModal;