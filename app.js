const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const mediacmsRoutes = require('./routes/mediacms');
const feedRoute = require('./routes/feedRoute'); 



require('dotenv').config();

// Ensure uploads directory exists for multer
const fs = require('fs');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// 1. Allow your admin panel host to hit every endpoint on this API (CORS first)
app.use(cors({
  origin: 'https://snap-news.onrender.com',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// 2. Allow form submissions (important for file uploads)

app.use(express.urlencoded({ extended: true }));

// 3. EJS and static files
app.set('view engine', 'ejs');
app.use(express.static('public'));

// 4. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// 5. Register MediaCMS API routes early!
app.use('/api/mediacms', mediacmsRoutes);

// 6. Other routes (order doesn't matter after above)
const uploadRoute = require('./routes/upload');

const watchRoute = require('./routes/watchRoute');
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);
app.use(uploadRoute);
app.use('/feed', feedRoute);
app.use(watchRoute);

// 7. Homepage/static pages
app.get('/', (req, res) => res.render('index'));
app.get('/privacy', (req, res) => res.render('privacy'));
app.get('/terms', (req, res) => res.render('terms'));
app.get('/cookies', (req, res) => res.render('cookies'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('login'));

// 8. Start server
app.listen(3000, () => console.log('SnapNews running on port 3000'));
