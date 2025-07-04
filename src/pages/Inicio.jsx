import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

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
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
      <div className="h-full w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="relative group h-full flex items-center justify-center py-8 lg:py-12">
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-200 to-blue-300 rounded-2xl opacity-0 group-hover:opacity-70 blur-xl transition-all duration-500 group-hover:duration-200"></div>
              <img 
                src="/assets/recursos/Img.png" 
                alt="Panel de Control"
                className="relative w-full h-auto max-h-[70vh] lg:max-h-[80vh] object-contain transform transition-all duration-500 group-hover:scale-[1.02]"
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
              Controla tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Marca Personal</span>
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
              <button 
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="relative z-10">Comenzar Ahora</span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
              
              <button className="px-6 py-4 text-gray-700 font-medium hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                <span>Ver Demostración</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </motion.div>
            
            <motion.div 
              className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap justify-center lg:justify-start gap-6"
              variants={item}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-500">Personalizable</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-500">Disponible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">Fácil</div>
                <div className="text-sm text-gray-500">De usar</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Inicio;
