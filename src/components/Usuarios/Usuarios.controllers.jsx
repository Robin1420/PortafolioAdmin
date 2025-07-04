import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'tu_clave_secreta_muy_segura_123';
const API_URL = 'https://api-django-portafolio.fly.dev/api/usuarios-admin/1/';

// Función para hashear la contraseña
export const hashPassword = (password) => {
  return CryptoJS.AES.encrypt(JSON.stringify(password), SECRET_KEY).toString();
};

// Función para desencriptar la contraseña
export const decryptPassword = (encryptedPassword) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    console.error('Error al desencriptar:', e);
    return null;
  }
};

export const useUsuarios = () => {
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Obtener datos del usuario
  const fetchUsuario = async () => {
    setLoading(true);
    try {
      console.log('Obteniendo datos del usuario...');
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Respuesta del servidor:', response);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error(`Error al cargar el usuario: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Datos del usuario recibidos:', data);
      setUsuario(data);
      return data;
    } catch (error) {
      console.error('Error en fetchUsuario:', error);
      setNotification({ type: 'error', message: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verificar contraseña desencriptando la almacenada
  const verifyPassword = (password) => {
    try {
      if (!usuario || !usuario.password_hash) {
        console.error('No se encontró información de contraseña del usuario');
        return false;
      }
      
      // Desencriptar la contraseña almacenada
      const decryptedPassword = decryptPassword(usuario.password_hash);
      console.log('Contraseña desencriptada:', decryptedPassword);
      
      if (!decryptedPassword) {
        console.error('No se pudo desencriptar la contraseña almacenada');
        return false;
      }
      
      // Comparar la contraseña ingresada con la desencriptada
      const isValid = password === decryptedPassword;
      console.log('Comparación de contraseñas:', {
        ingresada: password,
        almacenada: decryptedPassword,
        coinciden: isValid
      });
      
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        console.log('Las contraseñas no coinciden');
      }
      
      return isValid;
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      return false;
    }
  };

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUser = async () => {
      try {
        await fetchUsuario();
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    };
    
    loadUser();
  }, []);

  // Función para actualizar la contraseña
  const updatePassword = async (newPassword) => {
    setLoading(true);
    try {
      console.log('Nueva contraseña recibida:', newPassword);
      
      // Hashear la nueva contraseña
      const hashedPassword = hashPassword(newPassword);
      console.log('Contraseña hasheada:', hashedPassword);
      
      // Datos a enviar - ajustar según lo que espera el backend
      const requestData = { 
        password_hash: hashedPassword,  // Cambiado de 'password' a 'password_hash'
        // Incluir otros campos requeridos por el backend
        username: 'admin_bytezon',     // Mantener el mismo username
        email: 'robinzon.1420@hotmail.com'  // Mantener el mismo email
      };
      
      console.log('Enviando al servidor:', requestData);
      
      // Enviar al backend
      console.log('Enviando petición PATCH a:', API_URL);
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      let responseData;
      try {
        // Intentar parsear la respuesta como JSON
        const responseText = await response.text();
        console.log('Respuesta en texto plano:', responseText);
        
        // Si hay contenido, intentar parsear como JSON
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log('Respuesta parseada:', responseData);
      } catch (parseError) {
        console.error('Error al parsear la respuesta:', parseError);
        responseData = {};
      }

      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: responseData
      });

      if (!response.ok) {
        const errorMessage = responseData.detail || 
                           responseData.message || 
                           `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      setNotification({
        type: 'success',
        message: 'Contraseña actualizada exitosamente'
      });

      return true;
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error al actualizar la contraseña'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar un campo del usuario
  const updateUserField = async (field, value) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al actualizar el campo');
      }

      const updatedUser = await response.json();
      setUsuario(updatedUser);
      
      setNotification({
        type: 'success',
        message: 'Campo actualizado exitosamente'
      });
      
      return true;
    } catch (error) {
      console.error('Error al actualizar campo:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Error al actualizar el campo'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    usuario,
    loading,
    notification,
    setNotification,
    updatePassword,
    verifyPassword,
    fetchUsuario,
    updateUserField
  };
};
