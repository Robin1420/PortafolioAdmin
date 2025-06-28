import { useState } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({
      message,
      type,
      timestamp: Date.now()
    });

    // Ocultar la notificación después de 5 segundos
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return {
    notification,
    showNotification
  };
};
