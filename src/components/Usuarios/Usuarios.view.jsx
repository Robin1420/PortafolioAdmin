import React from 'react';

const Usuarios = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Usuarios</h1>
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-500">No hay usuarios registrados</p>
      </div>
    </div>
  );
};

export default Usuarios;
