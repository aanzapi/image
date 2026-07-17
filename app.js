require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Import routes
const uploadRoutes = require('./routes/upload.routes');
const imageRoutes = require('./routes/image.routes');
const galleryRoutes = require('./routes/gallery.routes');
const adminRoutes = require('./routes/admin.routes');
const apiRoutes = require('./routes/api.routes');

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api', apiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/', imageRoutes);
app.use('/gallery', galleryRoutes);
app.use('/admin', adminRoutes);

// Health check for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    error: 'The page you are looking for does not exist.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).render('error', {
    title: 'Error',
    error: err.message || 'Something went wrong!'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel
module.exports = app;
