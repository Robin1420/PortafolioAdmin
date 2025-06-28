import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DatosPersonalesView from './components/DatosPersonales/DatosPersonales.view.jsx';

// Crear el root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <DatosPersonalesView />
  </React.StrictMode>
);
