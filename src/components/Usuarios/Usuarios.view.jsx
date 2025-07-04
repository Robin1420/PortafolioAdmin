import React, { useState, useEffect } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useUsuarios, hashPassword, decryptPassword } from './Usuarios.controllers';

const PasswordModal = ({ onClose, onVerify, verifyPassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor ingrese su contraseña');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        onVerify();
      } else {
        setError('Contraseña incorrecta');
      }
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      setError('Ocurrió un error al verificar la contraseña');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Verificar Identidad</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Por su seguridad, ingrese su contraseña actual para continuar.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña Actual</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  error 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900'
                } focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isVerifying}
                autoFocus
              />
              {error && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              disabled={isVerifying}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                isVerifying || !password
                  ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800 transform hover:scale-[1.02] active:scale-[0.98] transition-transform'
              }`}
            >
              {isVerifying ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : 'Verificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UpdatePasswordModal = ({ onClose, onUpdate, verifyPassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerifyCurrentPassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('Por favor ingrese su contraseña actual');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await verifyPassword(currentPassword);
      if (isValid) {
        setVerified(true);
        setError('');
      } else {
        setError('La contraseña actual es incorrecta');
      }
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      setError('Ocurrió un error al verificar la contraseña');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitNewPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    onUpdate(newPassword);
  };

  if (!verified) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Verificar Contraseña</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Por su seguridad, debe verificar su contraseña actual para continuar.</p>
          
          <form onSubmit={handleVerifyCurrentPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña Actual</label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    error 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900'
                  } focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isVerifying}
                  autoFocus
                />
                {error && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                disabled={isVerifying}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isVerifying || !currentPassword}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                  isVerifying || !currentPassword
                    ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800 transform hover:scale-[1.02] active:scale-[0.98] transition-transform'
                }`}
              >
                {isVerifying ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                  </span>
                ) : 'Continuar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nueva Contraseña</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Cree una nueva contraseña segura para su cuenta.</p>
        
        <form onSubmit={handleSubmitNewPassword} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  error && newPassword.length < 6 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900'
                } focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="••••••••"
                required
                minLength={6}
                autoFocus
              />
              {error && newPassword.length < 6 && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Mínimo 6 caracteres</p>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Contraseña</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  error && (newPassword !== confirmPassword || confirmPassword.length < 6)
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900'
                } focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="••••••••"
                required
                minLength={6}
              />
              {error && (newPassword !== confirmPassword || confirmPassword.length < 6) && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {error && (newPassword !== confirmPassword || confirmPassword.length < 6) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Las contraseñas coinciden
              </p>
            )}
          </div>
          
          <div className="flex flex-col space-y-3 pt-2">
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  !newPassword ? 'bg-gray-200 w-0' :
                  newPassword.length < 6 ? 'bg-red-500 w-1/4' :
                  newPassword.length < 9 ? 'bg-yellow-500 w-2/4' :
                  'bg-green-500 w-full'
                }`}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {!newPassword ? 'Seguridad de la contraseña' :
               newPassword.length < 6 ? 'Débil' :
               newPassword.length < 9 ? 'Moderada' : 'Fuerte'}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6
                  ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800 transform hover:scale-[1.02] active:scale-[0.98] transition-transform'
              }`}
            >
              Actualizar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Usuarios = () => {
  const { 
    usuario, 
    loading, 
    notification, 
    setNotification,
    updatePassword,
    verifyPassword,
    updateUserField,
    isAuthenticated
  } = useUsuarios();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (field, currentValue) => {
    setEditingField(field);
    setFieldValue(currentValue);
    setShowPasswordModal(true);
  };


  const handleVerifySuccess = () => {
    setShowPasswordModal(false);
    setVerificationError('');
    setShowEditModal(true);
  };

  const handleSaveField = async () => {
    if (!fieldValue.trim() || !editingField) return;
    
    try {
      const success = await updateUserField(editingField, fieldValue);
      
      if (success) {
        setShowEditModal(false);
        setFieldValue('');
        setEditingField(null);
      }
    } catch (error) {
      console.error('Error al guardar el campo:', error);
    }
  };

  const handleUpdatePassword = async (newPassword) => {
    try {
      const success = await updatePassword(newPassword);
      if (success) {
        setShowUpdatePasswordModal(false);
        setNotification({
          type: 'success',
          message: 'Contraseña actualizada exitosamente'
        });
      }
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Error al actualizar la contraseña'
      });
    }
  };

  const handleChangePasswordClick = () => {
    setShowUpdatePasswordModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">No se pudieron cargar los datos del usuario.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Administración de usuario</h1>
      
      {notification && (
        <div className={`mb-6 p-4 rounded ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-medium text-gray-500">Usuario:</span>
                <span className="ml-2">{usuario?.username}</span>
              </div>
              <button 
                type="button"
                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                onClick={() => handleEditClick('username', usuario?.username)}
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-medium text-gray-500">Email:</span>
                <span className="ml-2">{usuario?.email}</span>
              </div>
              <button 
                type="button"
                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                onClick={() => handleEditClick('email', usuario?.email)}
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Opciones de Seguridad</h3>
          <div className="space-y-4">
            <button
              onClick={handleChangePasswordClick}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordModal
          onClose={() => {
            setShowPasswordModal(false);
            setEditingField(null);
          }}
          onVerify={handleVerifySuccess}
          verifyPassword={verifyPassword}
        />
      )}

      {showUpdatePasswordModal && (
        <UpdatePasswordModal
          onClose={() => setShowUpdatePasswordModal(false)}
          onUpdate={handleUpdatePassword}
          verifyPassword={verifyPassword}
        />
      )}
      
      {/* Modal de edición de campo */}
      {showEditModal && editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Editar {editingField === 'username' ? 'Nombre de usuario' : 'Correo electrónico'}
            </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {editingField === 'username' ? 'Nuevo nombre de usuario' : 'Nuevo correo electrónico'}
              </label>
              <input
                type={editingField === 'email' ? 'email' : 'text'}
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Ingrese el nuevo ${editingField === 'username' ? 'nombre de usuario' : 'correo electrónico'}`}
                autoFocus
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingField(null);
                  setFieldValue('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveField}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={!fieldValue.trim() || loading}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Exportar el componente Usuarios como exportación por defecto
export default Usuarios;

// Exportar los componentes para que estén disponibles para pruebas si es necesario
export { PasswordModal, UpdatePasswordModal };