const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Configuración de CORS
app.use(cors());

// Crear directorio si no existe
const uploadDir = path.join(__dirname, '../public/assets/DatosPersonales/foto');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para fotos de perfil
const fotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Aseguramos que el directorio existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Usar un nombre temporal primero
    const tempName = 'temp-foto-perfil';
    const nombreFinal = `${tempName}-${Date.now()}.png`;
    console.log('Guardando temporalmente como:', nombreFinal);
    cb(null, nombreFinal);
  }
});

// Configuración de multer para CVs
const cvDir = path.join(__dirname, '../public/assets/DatosPersonales/documento');
if (!fs.existsSync(cvDir)) {
  fs.mkdirSync(cvDir, { recursive: true });
}

const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(cvDir)) {
      fs.mkdirSync(cvDir, { recursive: true });
    }
    cb(null, cvDir);
  },
  filename: function (req, file, cb) {
    // Usar el nombre proporcionado en el cuerpo de la solicitud o generar uno por defecto
    const cvNombre = req.body.cv_nombre || `cv-${Date.now()}.${file.originalname.split('.').pop()}`;
    console.log('Guardando CV como:', cvNombre);
    cb(null, cvNombre);
  }
});

// Configuración de multer para fotos
const upload = multer({ 
  storage: fotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Configuración de multer para CVs
const uploadCv = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB para CVs
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o Word'), false);
    }
  }
});

// Middleware para parsear el form-data
app.use(express.urlencoded({ extended: true }));

// Ruta para subir la imagen
app.post('/api/upload', upload.single('foto'), (req, res) => {
  try {
    console.log('Archivo recibido:', req.file);
    console.log('Cuerpo de la solicitud:', req.body);
    
    if (!req.file) {
      console.error('No se recibió ningún archivo');
      return res.status(400).json({ 
        success: false,
        error: 'No se proporcionó ninguna imagen' 
      });
    }
    
    // Obtener el valor de foto_perfil del cuerpo de la solicitud
    const fotoPerfil = req.body.foto_perfil;
    if (!fotoPerfil) {
      // Eliminar el archivo temporal
      fs.unlinkSync(req.file.path);
      console.error('No se proporcionó el campo foto_perfil');
      return res.status(400).json({
        success: false,
        error: 'Se requiere el campo foto_perfil'
      });
    }
    
    // Construir rutas
    const rutaVieja = req.file.path;
    const directorio = path.dirname(rutaVieja);
    const rutaNueva = path.join(directorio, fotoPerfil);
    
    // Renombrar el archivo
    fs.renameSync(rutaVieja, rutaNueva);
    
    console.log(`Archivo renombrado de ${path.basename(rutaVieja)} a ${fotoPerfil}`);
    
    res.json({ 
      success: true,
      foto_perfil: fotoPerfil, // Devolver el nombre exacto del archivo
      message: 'Imagen subida correctamente',
      imageUrl: `/assets/DatosPersonales/foto/${fotoPerfil}`
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
