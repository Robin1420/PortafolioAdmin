import React from 'react';

const Inicio = () => {
  // Ruta al archivo X3D en la carpeta public/3D
  const x3dFilePath = '/3D/Intergalactic_Spaceship-((x3d)).x3d';

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bienvenido de nuevo, Admin</h1>
            <p className="text-gray-500">Aquí tienes un resumen de tu portafolio</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
