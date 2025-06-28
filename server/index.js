const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Configuración de CORS
app.use(cors());

// Middleware para parsear JSON y form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de directorios
const fotoDir = path.join(__dirname, '../public/assets/DatosPersonales/foto');
const proyectosDir = path.join(__dirname, '../public/assets/Proyectos');
const cvDir = path.join(__dirname, '../public/assets/DatosPersonales/documento');

// Crear directorios si no existen
[ fotoDir, proyectosDir, cvDir ].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración de multer para CV
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvDir);
  },
  filename: (req, file, cb) => {
    // Usar el nombre original del archivo
    const filename = file.originalname;
    cb(null, filename);
  }
});

// Configuración de multer para fotos de perfil
const fotoPerfilStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fotoDir);
  },
  filename: (req, file, cb) => {
    // Siempre usar el mismo nombre
    const filename = 'foto.png';
    const filePath = path.join(fotoDir, filename);
    
    // Eliminar archivo existente si existe
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error al eliminar archivo existente:', err);
      }
    }
    
    cb(null, filename);
  }
});

// Middleware para subir foto de perfil
const uploadFotoPerfil = multer({
  storage: fotoPerfilStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
}).single('foto');

// Middleware para subir CV
const uploadCv = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Solo permitir PDF, DOC y DOCX
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o Word'), false);
    }
  }
});

// Ruta para subir la imagen de perfil
app.post('/api/upload', uploadFotoPerfil, (req, res) => {
  try {
    console.log('Archivo recibido:', req.file);
    console.log('Cuerpo de la solicitud:', req.body);
    
    if (!req.file) {
      console.error('No se recibió ningún archivo');
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    // Determinar la ruta base según la carpeta
    const carpeta = req.body.carpeta || 'DatosPersonales';
    const rutaBase = carpeta === 'Proyectos' ? 'Proyectos' : 'DatosPersonales/foto';
    
    // Devolver solo el nombre del archivo, el frontend construirá la ruta completa si es necesario
    res.status(200).json({ 
      success: true,
      message: 'Archivo subido correctamente',
      foto_perfil: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    // Asegurarse de eliminar el archivo temporal si hay un error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: 'Error al procesar la imagen',
      details: error.message
    });
  }
});

// Ruta para subir el CV
app.post('/api/upload-cv', uploadCv.single('cv'), (req, res) => {
  try {
    console.log('Archivo CV recibido:', req.file);
    console.log('Cuerpo de la solicitud:', req.body);
    
    if (!req.file) {
      console.error('No se recibió ningún archivo CV');
      return res.status(400).json({ 
        success: false,
        error: 'No se proporcionó ningún archivo CV' 
      });
    }
    
    // Obtener el nombre del archivo
    const cvNombre = req.file.filename;
    
    // Si se proporcionó un nombre en el cuerpo, renombrar el archivo
    if (req.body.cv_nombre && req.body.cv_nombre !== cvNombre) {
      const rutaVieja = req.file.path;
      const directorio = path.dirname(rutaVieja);
      const rutaNueva = path.join(directorio, req.body.cv_nombre);
      
      // Renombrar el archivo
      fs.renameSync(rutaVieja, rutaNueva);
      console.log(`CV renombrado de ${cvNombre} a ${req.body.cv_nombre}`);
    }
    
    console.log(`CV guardado como: ${cvNombre}`);
    
    res.json({ 
      success: true,
      cv_nombre: req.body.cv_nombre || cvNombre,
      message: 'CV subido correctamente',
      cvUrl: `/assets/DatosPersonales/documento/${req.body.cv_nombre || cvNombre}`
    });
    
  } catch (error) {
    console.error('Error al subir el CV:', error);
    // Asegurarse de eliminar el archivo temporal si hay un error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: 'Error al procesar el CV',
      details: error.message
    });
  }
});

// Manejador de errores para multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error de multer
    return res.status(400).json({
      success: false,
      error: `Error al subir el archivo: ${err.message}`
    });
  } else if (err) {
    // Otros errores
    return res.status(400).json({
      success: false,
      error: err.message || 'Error al procesar la solicitud'
    });
  }
  next();
});

// Servir archivos estáticos
app.use('/assets', express.static(path.join(__dirname, '../public/assets'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Configurar cabeceras para evitar caché de imágenes
    if (path.endsWith('.png') || path.endsWith('.png') || path.endsWith('.png')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
  }
}));

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
