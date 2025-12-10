require('dotenv').config();
console.log('📍 Loaded server.js from:', __filename);

const express      = require('express');
const cors         = require('cors');
const mongoose     = require('mongoose');
const session      = require('express-session');
const path         = require('path');
const fs           = require('fs');
const fileUpload   = require('express-fileupload');



const app = express();

// === View engine setup ===
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// === Middleware ===

app.use(fileUpload()); // for req.files
app.use(cors({
  origin: [
    'https://snap-news.onrender.com',
    'https://snapbackend-new.onrender.com',
    'http://localhost:3000'
    'http://www.snapshnap.com'
  ],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Serve static assets (CSS, client-side JS, images)
app.use(express.static(path.join(__dirname, '../public')));

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// === Health check ===
app.get('/health', (req, res) => res.send('OK'));

// === Upload endpoint ===
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !Object.keys(req.files).length) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Expect the field name to be 'video'
    const file = req.files.video || req.files.file || Object.values(req.files)[0];
    const filename = `${Date.now()}-${file.name}`;
    const destPath = path.join(uploadDir, filename);
    await file.mv(destPath);

    const Content = require('../models/Content');
    const newContent = new Content({
      title:     req.body.title || file.name,
      description: req.body.description || '',
      category:  req.body.category || '',
      filePath:  `/uploads/${filename}`,
      videoUrl:  `/uploads/${filename}`,
      mimeType:  file.mimetype,
      status:    'pending',
      createdBy: req.session.userId || null
    });
    await newContent.save();

    return res.status(201).json({ success: true, content: newContent });
  } catch (err) {
    console.error('🛑 Upload handler error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// === EJS routes ===
// Feed route renders list of approved videos
const feedRoute = require('./routes/feedRoute');
app.use('/', feedRoute);

// Watch route renders individual video page
const watchRoute = require('./routes/watchRoute');
app.use('/', watchRoute);

// === API/Admin/Public ===
const adminController  = require('../controllers/adminController');
const adminRoutes      = require('../routes/admin');
const publicRoutes     = require('../routes/public');
const { authenticateAdmin } = require('../middleware/auth');

app.post('/admin/login', adminController.login);
app.use('/admin', authenticateAdmin, adminRoutes);
app.use('/public', publicRoutes);

// Public Red Pill page
app.get('/redpill', (req, res) => {
  res.render('redpill'); // looks for views/redpill.ejs
});

// === Debug: List all mounted routes ===
app.get('/routes', (req, res) => {
  const routes = app._router.stack
    .filter(layer => layer.route)
    .map(layer => ({ path: layer.route.path, methods: Object.keys(layer.route.methods).map(m => m.toUpperCase()) }));
  res.json(routes);
});
console.log('—— MOUNTED ROUTES ——');
app._router.stack
  .filter(layer => layer.route)
  .forEach(layer => console.log(Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(','), layer.route.path));

// === Start server ===
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB error:', err));


