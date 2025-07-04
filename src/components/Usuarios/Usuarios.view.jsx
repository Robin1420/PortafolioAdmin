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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Verificar Identidad</h2>
        <p className="mb-4">Por favor ingrese su contraseña para continuar.</p>
        <form onSubmit={handleSubmit}>
          <div className="w-full mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className={`w-full p-2 border rounded ${
                error ? 'border-red-500' : ''
              }`}
              placeholder="Ingrese su contraseña actual"
              autoComplete="current-password"
              disabled={isVerifying}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={isVerifying}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className={`px-4 py-2 rounded ${
                isVerifying 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isVerifying ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UpdatePasswordModal = ({ onClose, onUpdate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    onUpdate(newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Actualizar Contraseña</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Actualizar
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
    const success = await updatePassword(newPassword);
    if (success) {
      setShowUpdatePasswordModal(false);
    }
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
      <h1 className="text-2xl font-bold mb-6">Perfil de Usuario</h1>
      
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
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Cambiar Contraseña
          </button>
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