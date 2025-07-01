import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  FiHome, FiUser, FiBriefcase, FiAward, FiLink, FiCode, 
  FiUsers, FiMenu, FiX, FiBell, FiLogOut, FiSettings, 
  FiBarChart2, FiCalendar, FiClock, FiTrendingUp, FiDollarSign, 
  FiMoreHorizontal, FiChevronLeft, FiChevronRight, FiLoader
} from 'react-icons/fi';
import { FaReact, FaNodeJs, FaDatabase } from 'react-icons/fa';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Carga perezosa de componentes
const Inicio = lazy(() => import('./Inicio'));
const DatosPersonales = lazy(() => import('../components/DatosPersonales/DatosPersonales.view'));
const Experiencia = lazy(() => import('../components/Experiencia/Experiencia.view'));
const Proyectos = lazy(() => import('../components/Proyectos/Proyectos.view'));
const Certificados = lazy(() => import('../components/Certificados/Certificados.view'));
const RedesSociales = lazy(() => import('../components/RedesSociales/RedesSociales.view'));
const Usuarios = lazy(() => import('../components/Usuarios/Usuarios.view'));

// Componente de carga
const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <FiLoader className="animate-spin w-8 h-8 text-blue-500" />
  </div>
);

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const [stats, setStats] = useState({
    proyectos: 12,
    visitas: 1245,
    clientes: 42,
    ingresos: 8750
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, user: 'Juan Pérez', action: 'actualizó su perfil', time: 'Hace 5 min', icon: 'user', color: 'bg-blue-100 text-blue-600' },
    { id: 2, user: 'María García', action: 'subió un nuevo proyecto', time: 'Hace 1 hora', icon: 'code', color: 'bg-green-100 text-green-600' },
    { id: 3, user: 'Carlos López', action: 'comentó en tu publicación', time: 'Hace 3 horas', icon: 'briefcase', color: 'bg-yellow-100 text-yellow-600' },
  ]);
  
  const [activeTab, setActiveTab] = useState('inicio');

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: <FiHome className="w-5 h-5" />, path: '/dashboard' },
    { id: 'datos-personales', label: 'Datos Personales', icon: <FiUser className="w-5 h-5" />, path: '/dashboard/datos-personales' },
    { id: 'experiencia', label: 'Experiencia', icon: <FiBriefcase className="w-5 h-5" />, path: '/dashboard/experiencia' },
    { id: 'proyectos', label: 'Proyectos', icon: <FiCode className="w-5 h-5" />, path: '/dashboard/proyectos' },
    { id: 'certificados', label: 'Certificados', icon: <FiAward className="w-5 h-5" />, path: '/dashboard/certificados' },
    { id: 'redes-sociales', label: 'Redes Sociales', icon: <FiLink className="w-5 h-5" />, path: '/dashboard/redes-sociales' },
    { id: 'usuarios', label: 'Usuarios', icon: <FiUsers className="w-5 h-5" />, path: '/dashboard/usuarios' },
  ];

  const navigateTo = (tabId) => {
    const item = menuItems.find(item => item.id === tabId);
    if (item) {
      setActiveTab(tabId);
      navigate(item.path);
    }
  };

  useEffect(() => {
    // Obtener la ruta actual y actualizar el tab activo
    const currentPath = pathname.split('/').pop() || 'inicio';
    if (currentPath !== activeTab) {
      setActiveTab(currentPath);
    }
  }, [pathname, activeTab]);

  const renderContent = () => (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/dashboard" element={<Inicio />} />
        <Route path="/datos-personales" element={<DatosPersonales />} />
        <Route path="/experiencia" element={<Experiencia />} />
        <Route path="/proyectos" element={<Proyectos />} />
        <Route path="/certificados" element={<Certificados />} />
        <Route path="/redes-sociales" element={<RedesSociales />} />
        <Route path="/usuarios" element={<Usuarios />} />
      </Routes>
    </Suspense>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Sidebar para desktop */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                  md:relative md:translate-x-0 ${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-blue-600 to-indigo-700 shadow-xl transition-all duration-300 ease-in-out z-30 hover:w-64 group`}
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
        <div className="h-[calc(100%-5rem)] flex flex-col overflow-hidden">
          <nav className={`p-4 flex-1 ${collapsed ? 'overflow-hidden' : 'overflow-y-auto pr-1 -mr-1 scrollbar-hide'}`}>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === item.id
                        ? 'bg-white/20 text-white'
                        : 'text-white hover:bg-white/10'
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
          
          <div className="p-4 border-t border-blue-500">
            <button 
              onClick={() => {}}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-white hover:bg-white/10 transition-all"
            >
              <FiSettings className="w-5 h-5 text-white" />
              <span className={`transition-all duration-300 ease-in-out ${
                collapsed && !isHovered ? 'opacity-0 w-0' : 'opacity-100'
              }`}>
                Configuración
              </span>
            </button>
            <button 
              onClick={() => {}}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-white hover:bg-white/10 transition-all"
            >
              <FiLogOut className="w-5 h-5 text-white" />
              <span className={`transition-all duration-300 ease-in-out ${
                collapsed && !isHovered ? 'opacity-0 w-0' : 'opacity-100'
              }`}>
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-20">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 text-gray-600 hover:text-gray-900 md:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center text-sm text-gray-500">
              <span>Inicio</span>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">
                {menuItems.find(item => item.id === activeTab)?.label || 'Panel de Control'}
              </span>
            </div>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 relative">
                <FiBell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
            
            <div className="hidden md:block w-px h-6 bg-gray-200 mx-2"></div>
            
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">Administrador</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
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
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
