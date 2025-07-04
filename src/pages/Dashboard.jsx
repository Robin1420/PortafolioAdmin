import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { 
  FiHome, FiUser, FiBriefcase, FiAward, FiLink, FiCode, 
  FiUsers, FiMenu, FiX, FiBell, FiLogOut, FiSettings, 
  FiBarChart2, FiCalendar, FiClock, FiTrendingUp, FiDollarSign, 
  FiMoreHorizontal, FiChevronLeft, FiChevronRight, FiLoader, FiLayers
} from 'react-icons/fi';
import { FaReact, FaNodeJs, FaDatabase } from 'react-icons/fa';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Carga perezosa de componentes
const Inicio = lazy(() => import('./Inicio').then(module => ({ default: module.default })));
const DatosPersonales = lazy(() => import('../components/DatosPersonales/DatosPersonales.view'));
const Experiencia = lazy(() => import('../components/Experiencia/Experiencia.view'));
const Proyectos = lazy(() => import('../components/Proyectos/Proyectos.view'));
const Certificados = lazy(() => import('../components/Certificados/Certificados.view'));
const RedesSociales = lazy(() => import('../components/RedesSociales/RedesSociales.view'));
const Usuarios = lazy(() => import('../components/Usuarios/Usuarios.view').then(module => ({ default: module.default })));
const Skills = lazy(() => import('../components/Skills/Skills.view'));

// Componente de carga
const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <FiLoader className="animate-spin w-8 h-8 text-blue-500" />
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && 
          !menuRef.current.contains(event.target) && 
          menuButtonRef.current && 
          !menuButtonRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    // Agregar el event listener cuando el menú está abierto
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Limpiar el event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);
  
  const [activeTab, setActiveTab] = useState('inicio');

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: <FiHome className="w-5 h-5" />, path: '/dashboard' },
    { id: 'datos-personales', label: 'Datos Personales', icon: <FiUser className="w-5 h-5" />, path: '/dashboard/datos-personales' },
    { id: 'skills', label: 'Skills', icon: <FiLayers className="w-5 h-5" />, path: '/dashboard/skills' },
    { id: 'experiencia', label: 'Experiencia', icon: <FiBriefcase className="w-5 h-5" />, path: '/dashboard/experiencia' },
    { id: 'proyectos', label: 'Proyectos', icon: <FiCode className="w-5 h-5" />, path: '/dashboard/proyectos' },
    { id: 'certificados', label: 'Certificados', icon: <FiAward className="w-5 h-5" />, path: '/dashboard/certificados' },
    { id: 'redes-sociales', label: 'Redes Sociales', icon: <FiLink className="w-5 h-5" />, path: '/dashboard/redes-sociales' },
/*     { id: 'configuracion', label: 'Configuración', icon: <FiSettings className="w-5 h-5" />, path: '/dashboard/configuracion' },
 */  ];

  const navigateTo = (tabId) => {
    const item = menuItems.find(item => item.id === tabId);
    if (item) {
      setActiveTab(tabId);
      navigate(item.path);
    }
  };

  useEffect(() => {
    // Obtener la ruta actual y actualizar el tab activo
    const currentPath = location.pathname.split('/').pop() || 'inicio';
    if (currentPath !== activeTab) {
      setActiveTab(currentPath);
    }
  }, [location.pathname, activeTab]);

  const renderContent = () => (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/dashboard" element={<Inicio />} />
        <Route path="/datos-personales" element={<DatosPersonales />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/experiencia" element={<Experiencia />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/certificados" element={<Certificados />} />
        <Route path="/redes-sociales" element={<RedesSociales />} />
        <Route path="/usuarios" element={<Usuarios />} />
      </Routes>
    </Suspense>
  );

  // Función para obtener el ícono activo
  const getMobileIcon = (icon, isActive) => {
    const iconProps = { className: `w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}` };
    return React.cloneElement(icon, iconProps);
  };

  return (
    <div className="flex h-screen bg-white text-gray-800 font-sans overflow-hidden">
      {/* Sidebar - Oculto en móviles, visible en desktop */}
      <div 
        className={`hidden md:block fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                  md:relative md:translate-x-0 ${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-blue-600 to-blue-600 shadow-xl transition-all duration-300 ease-in-out z-30 hover:w-64 group`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ '--transition-duration': '300ms' }}
      >
        <div className="flex items-center justify-between h-20 px-4 border-b border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
              <img 
                src="/assets/DatosPersonales/foto/foto.png" 
                alt="Foto de perfil" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
            </div>
            <div className={`transition-all duration-300 ease-in-out ${collapsed && !isHovered ? 'opacity-0 w-0' : 'opacity-100'}`}>
              <span className="text-xl font-bold text-white whitespace-nowrap">
              Portfolio Manager
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex items-center justify-center p-2 rounded-full hover:bg-blue-700 text-blue-200 hover:text-white"
              title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {collapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-full hover:bg-blue-700 text-blue-200 hover:text-white md:hidden"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-5rem)] flex flex-col overflow-hidden bg-blue-600">
          <nav className={`p-4 flex-1 ${collapsed ? 'overflow-hidden' : 'overflow-y-auto pr-1 -mr-1 scrollbar-hide'} bg-blue-600`}>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === item.id
                        ? 'bg-blue-700 text-white'
                        : 'text-white hover:bg-blue-700'
                    } ${collapsed && !isHovered ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : ''}
                  >
                    <span className="text-white">
                      {React.cloneElement(item.icon, { className: 'w-5 h-5 flex-shrink-0' })}
                    </span>
                    <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
                      collapsed && !isHovered ? 'opacity-0 w-0' : 'opacity-100'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </nav>
          
          <div className={`p-4 border-t border-blue-500 transition-all duration-300 ease-in-out ${
            collapsed && !isHovered ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100 h-auto'
          }`}>
            <button 
              onClick={() => navigate('/dashboard/usuarios')}
              className="w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-xl text-left text-white hover:bg-white/10 transition-all"
            >
              <FiUser className="w-6 h-6 text-white flex-shrink-0" />
              <span className="transition-all duration-300 ease-in-out">
                Cuenta
              </span>
            </button>
            <button 
              onClick={() => {}}
              className="w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-xl text-left text-white hover:bg-white/10 transition-all mt-2"
            >
              <FiLogOut className="w-6 h-6 text-white flex-shrink-0" />
              <span className="transition-all duration-300 ease-in-out">
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col bg-white h-full overflow-y-auto pb-16 md:pb-0 scrollbar-hide relative" style={{
        msOverflowStyle: 'none',  /* IE and Edge */
        scrollbarWidth: 'none',   /* Firefox */
      }}>
        {/* Botón de menú móvil (solo visible en móviles) */}
        <div className="md:hidden fixed top-4 right-4 z-30">
          <button 
            ref={menuButtonRef}
            className="w-10 h-10 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FiMenu className="w-5 h-5" />
          </button>
          
          {/* Menú desplegable */}
          {mobileMenuOpen && (
            <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-blue-600 rounded-md shadow-xl py-1 border border-blue-500 border-opacity-30 animate-fadeIn">
              <button
                onClick={() => {
                  navigate('/dashboard/usuarios');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-blue-500 transition-colors flex items-center"
              >
                <FiUser className="mr-3 w-4 h-4 opacity-90" />
                <span>Cuenta</span>
              </button>
              <div className="h-px bg-blue-500 my-1"></div>
              <button
                onClick={() => {
                  // Aquí iría la lógica de cierre de sesión
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-200 hover:bg-red-600 hover:bg-opacity-50 transition-colors flex items-center"
              >
                <FiLogOut className="mr-3 w-4 h-4 opacity-90" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Estilos para la animación */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
          }
        `}</style>
        {/* Header - Solo visible en desktop */}
        <header className="hidden md:flex bg-white shadow-sm h-16 items-center px-6 sticky top-0 z-20">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <FiBell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                A
              </div>
            </div>
            
            <button className="hidden md:flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100">
              <FiLogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto bg-white w-full" style={{
          msOverflowStyle: 'none',  /* IE and Edge */
          scrollbarWidth: 'none',   /* Firefox */
        }}>
          <div className="w-full h-full">
            {renderContent()}
          </div>
        </div>
        
        {/* Estilos para ocultar scrollbar en WebKit (Chrome, Safari, etc) */}
        <style jsx global>{`
          ::-webkit-scrollbar {
            display: none;  /* Chrome, Safari, Opera */
            width: 0;  /* Remove scrollbar space */
            background: transparent;  /* Optional: just make scrollbar invisible */
          }
          /* Optional: show position indicator in red */
          ::-webkit-scrollbar-thumb {
            background: transparent;
          }
        `}</style>
      </div>

      {/* Barra de navegación móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-blue-600 shadow-lg z-40">
        <div className="flex justify-between items-center h-16 px-1">
          {/* Botón de Datos Personales */}
          <button
            onClick={() => navigateTo('datos-personales')}
            className={`flex flex-col items-center justify-center w-14 h-full ${
              activeTab === 'datos-personales' ? 'text-white' : 'text-blue-100 hover:text-white'
            }`}
          >
            <FiUser className={`w-5 h-5 ${activeTab === 'datos-personales' ? 'text-white' : 'text-blue-200'}`} />
            <span className="text-[10px] mt-0.5">Datos</span>
          </button>
          
          {/* Botón de Proyectos */}
          <button
            onClick={() => navigateTo('proyectos')}
            className={`flex flex-col items-center justify-center w-14 h-full ${
              activeTab === 'proyectos' ? 'text-white' : 'text-blue-100 hover:text-white'
            }`}
          >
            <FiCode className={`w-5 h-5 ${activeTab === 'proyectos' ? 'text-white' : 'text-blue-200'}`} />
            <span className="text-[10px] mt-0.5">Proy</span>
          </button>
          
          {/* Botón de Experiencia */}
          <button
            onClick={() => navigateTo('experiencia')}
            className={`flex flex-col items-center justify-center w-14 h-full ${
              activeTab === 'experiencia' ? 'text-white' : 'text-blue-100 hover:text-white'
            }`}
          >
            <FiBriefcase className={`w-5 h-5 ${activeTab === 'experiencia' ? 'text-white' : 'text-blue-200'}`} />
            <span className="text-[10px] mt-0.5">Exp</span>
          </button>
          
          {/* Botón de Inicio (Foto de perfil) */}
          <button
            onClick={() => navigateTo('inicio')}
            className="flex flex-col items-center justify-center -mt-8"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src="/assets/DatosPersonales/foto/foto.png" 
                alt="Inicio" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
            </div>
          </button>
          
          {/* Botón de Skills */}
          <button
            onClick={() => navigateTo('skills')}
            className={`flex flex-col items-center justify-center w-14 h-full ${
              activeTab === 'skills' ? 'text-white' : 'text-blue-100 hover:text-white'
            }`}
          >
            <FiLayers className={`w-5 h-5 ${activeTab === 'skills' ? 'text-white' : 'text-blue-200'}`} />
            <span className="text-[10px] mt-0.5">Skills</span>
          </button>
          
          {/* Botón de Certificados */}
          <button
            onClick={() => navigateTo('certificados')}
            className={`flex flex-col items-center justify-center w-14 h-full ${
              activeTab === 'certificados' ? 'text-white' : 'text-blue-100 hover:text-white'
            }`}
          >
            <FiAward className={`w-5 h-5 ${activeTab === 'certificados' ? 'text-white' : 'text-blue-200'}`} />
            <span className="text-[10px] mt-0.5">Certs</span>
          </button>
          
          {/* Botón de Redes Sociales */}
          <button
            onClick={() => navigateTo('redes-sociales')}
            className={`flex flex-col items-center justify-center w-14 h-full ${
              activeTab === 'redes-sociales' ? 'text-white' : 'text-blue-100 hover:text-white'
            }`}
          >
            <FiLink className={`w-5 h-5 ${activeTab === 'redes-sociales' ? 'text-white' : 'text-blue-200'}`} />
            <span className="text-[10px] mt-0.5">Redes</span>
          </button>
          
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
