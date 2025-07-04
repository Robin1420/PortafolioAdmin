import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';

const Inicio = () => {
  // Efecto para animaciones al cargar
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Animaciones
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const image = {
    hidden: { opacity: 0, x: -50 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
      
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12"
          variants={container}
          initial="hidden"
          animate="show"
          style={{ minHeight: 'calc(100vh - 64px)' }} // Ajustar según el alto del header
        >
          {/* Imagen a la izquierda con animación */}
          <motion.div 
            className="w-full lg:w-1/2 h-full flex items-center justify-center overflow-visible"
            variants={image}
          >
            <div className="relative h-full flex items-center justify-center py-8 lg:py-12">
              <img 
                src="/assets/recursos/Img.png" 
                alt="Panel de Control"
                className="w-full h-auto max-h-[70vh] lg:max-h-[80vh] object-contain"
                style={{ maxWidth: '100%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/1200x1000';
                }}
              />
            </div>
          </motion.div>
          
          {/* Contenido a la derecha */}
          <motion.div 
            className="w-full lg:w-1/2 h-full flex flex-col justify-center text-center lg:text-left px-4 lg:pl-12 py-8 lg:py-12"
            variants={container}
          >
            <motion.div variants={item} className="mb-2">
              <span className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                Panel de Administración
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              variants={item}
            >
              Administra tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Portafolio Personal</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              variants={item}
            >
              Gestiona y actualiza tu portafolio profesional con herramientas intuitivas y poderosas.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={item}
            >
            </motion.div>
            
            <motion.div 
              className="mt-12 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={item}
            >
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-3">
                  <FiIcons.FiUser className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos Personales</h3>
                <p className="text-gray-600 text-sm">Administra tu información personal, experiencia y habilidades profesionales en un solo lugar.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-3">
                  <FiIcons.FiBriefcase className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Experiencia Laboral</h3>
                <p className="text-gray-600 text-sm">Gestiona tu historial profesional, logros y responsabilidades laborales.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-3">
                  <FiIcons.FiCode className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Proyectos</h3>
                <p className="text-gray-600 text-sm">Muestra tus trabajos más importantes con imágenes, descripciones y tecnologías utilizadas.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-3">
                  <FiIcons.FiAward className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificaciones</h3>
                <p className="text-gray-600 text-sm">Destaca tus logros educativos y certificaciones profesionales.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-3">
                  <FiIcons.FiLink className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Redes Sociales</h3>
                <p className="text-gray-600 text-sm">Conecta tus perfiles profesionales y redes sociales en un solo lugar.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-3">
                  <FiIcons.FiUsers className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Usuarios</h3>
                <p className="text-gray-600 text-sm">Administra los usuarios que tienen acceso al panel de control.</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default Inicio;
