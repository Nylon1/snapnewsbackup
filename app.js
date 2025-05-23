const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

// ✅ Load environment variables first
require('dotenv').config();

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Allow form submissions
app.use(express.urlencoded({ extended: true }));

// Set up view engine
app.set('view engine', 'ejs');

// Routes
const uploadRoute = require('./routes/upload');
const feedRoute = require('./routes/feedRoute');
const watchRoute = require('./routes/watchRoute');
const adminRoutes = require('./routes/admin');

app.use('/admin', adminRoutes); // 👈 add this prefix

// Allow your admin panel host to hit every endpoint on this API
app.use(cors({
  origin: 'https://snap-news.onrender.com',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));



app.use(uploadRoute);
app.use('/feed', feedRoute);
app.use(watchRoute);


// Homepage routes
app.get('/', (req, res) => res.render('index'));
app.get('/privacy', (req, res) => res.render('privacy'));
app.get('/terms', (req, res) => res.render('terms'));
app.get('/cookies', (req, res) => res.render('cookies'));
app.get('/contact', (req, res) => res.render('contact'));

// Serve static files
app.use(express.static('public'));

// Start server
app.listen(3000, () => console.log('SnapNews running on port 3000'));
