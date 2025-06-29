const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Asegúrate de que coincida con tu URL de frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Middleware para parsear JSON y form-urlencoded
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware para manejar errores CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Manejar solicitudes preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

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

// Configuración de multer para proyectos
const proyectosStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegurarse de que el directorio existe de forma síncrona
    if (!fs.existsSync(proyectosDir)) {
      try {
        fs.mkdirSync(proyectosDir, { recursive: true });
        console.log(`Directorio creado: ${proyectosDir}`);
      } catch (error) {
        console.error('Error al crear el directorio de proyectos:', error);
        return cb(error);
      }
    }
    
    // Verificar permisos del directorio
    try {
      fs.accessSync(proyectosDir, fs.constants.W_OK);
      cb(null, proyectosDir);
    } catch (error) {
      console.error('Error de permisos en el directorio de proyectos:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Generar un nombre de archivo único
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `proyecto-${uniqueSuffix}${ext}`;
      
      console.log('Guardando archivo con nombre:', filename);
      cb(null, filename);
    } catch (error) {
      console.error('Error al generar el nombre del archivo:', error);
      cb(error);
    }
  }
});

// Middleware para subir imágenes de proyectos
const uploadProyecto = multer({
  storage: proyectosStorage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (!file.mimetype.startsWith('image/')) {
      console.error('Tipo de archivo no permitido:', file.mimetype);
      return cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, etc.)'), false);
    }
    
    // Verificar extensión del archivo
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowedExts.includes(ext)) {
      console.error('Extensión de archivo no permitida:', ext);
      return cb(new Error('Solo se permiten archivos con extensiones: ' + allowedExts.join(', ')), false);
    }
    
    cb(null, true);
  }
}).single('imagen');

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


// Ruta para subir imagen de proyecto
app.post('/api/proyectos/upload', (req, res) => {
  console.log('Solicitud de subida de imagen de proyecto recibida');
  
  uploadProyecto(req, res, async (err) => {
    try {
      if (err) {
        console.error('Error al subir la imagen del proyecto:', err);
        return res.status(400).json({ 
          success: false,
          error: err.message 
        });
      }
      
      if (!req.file) {
        console.error('No se recibió ningún archivo');
        return res.status(400).json({ 
          success: false,
          error: 'No se recibió ningún archivo' 
        });
      }
      
      console.log('Archivo recibido:', req.file);
      
      // Verificar que el archivo se haya guardado correctamente
      const filePath = path.join(proyectosDir, req.file.filename);
      if (!fs.existsSync(filePath)) {
        console.error('El archivo no se guardó correctamente en el servidor');
        return res.status(500).json({
          success: false,
          error: 'Error al guardar el archivo en el servidor'
        });
      }
      
      console.log('Archivo guardado correctamente en:', filePath);
      
      // Construir la URL para acceder al archivo
      const fileUrl = `/assets/Proyectos/${req.file.filename}`;
      
      // Devolver la información del archivo
      res.status(200).json({ 
        success: true,
        message: 'Archivo subido correctamente',
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      });
      
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      
      // Asegurarse de eliminar el archivo temporal si hay un error
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('Archivo temporal eliminado después del error');
        } catch (err) {
          console.error('Error al eliminar el archivo temporal:', err);
        }
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al procesar la imagen',
        details: error.message
      });
    }
  });
});

// Función para eliminar un archivo
const deleteFile = (filename, directory) => {
  return new Promise((resolve, reject) => {
    if (!filename) {
      console.log('No se proporcionó un nombre de archivo para eliminar');
      return resolve(false);
    }
    
    const filePath = path.join(directory, filename);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`El archivo ${filename} no existe en ${directory}`);
      return resolve(false);
    }
    
    // Eliminar el archivo
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error al eliminar el archivo ${filename}:`, err);
        return reject(err);
      }
      console.log(`Archivo ${filename} eliminado correctamente`);
      resolve(true);
    });
  });
};

// Ruta para eliminar una imagen de proyecto
app.delete('/api/proyectos/imagen/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el nombre del archivo a eliminar'
      });
    }
    
    console.log(`Solicitada eliminación de imagen: ${filename}`);
    
    // Eliminar el archivo
    const deleted = await deleteFile(filename, proyectosDir);
    
    if (!deleted) {
      console.log(`La imagen ${filename} no pudo ser eliminada (puede que no exista)`);
      // No devolvemos error 404 para no romper el flujo si la imagen ya no existe
      return res.status(200).json({
        success: true,
        message: 'La imagen no existe o ya fue eliminada',
        deleted: false
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Imagen eliminada correctamente',
      deleted: true
    });
    
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar la imagen',
      details: error.message
    });
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
    let cvNombre = req.file.filename;
    
    // Si se proporcionó un nombre en el cuerpo, renombrar el archivo
    if (req.body.cv_nombre) {
      const rutaVieja = req.file.path;
      const directorio = path.dirname(rutaVieja);
      const extension = path.extname(cvNombre);
      const nombreSinExtension = path.basename(req.body.cv_nombre, path.extname(req.body.cv_nombre));
      const nuevoNombre = `${nombreSinExtension}${extension}`;
      const rutaNueva = path.join(directorio, nuevoNombre);
      
      // Eliminar archivo anterior si existe
      if (fs.existsSync(rutaNueva)) {
        fs.unlinkSync(rutaNueva);
      }
      
      // Renombrar el archivo
      fs.renameSync(rutaVieja, rutaNueva);
      cvNombre = nuevoNombre;
      console.log(`CV renombrado a: ${cvNombre}`);
    }
    
    console.log(`CV guardado como: ${cvNombre}`);
    
    // Asegurarse de que la URL sea accesible
    const cvUrl = `/assets/DatosPersonales/documento/${cvNombre}`;
    
    res.status(200).json({ 
      success: true,
      cv_nombre: cvNombre,
      message: 'CV subido correctamente',
      cvUrl: cvUrl
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
