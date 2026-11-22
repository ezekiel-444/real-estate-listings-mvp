require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Real Estate MVP API is running' });
});

// Routes (Uncomment as Member A and Member B add route files)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/cities', require('./routes/cities'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/inquiries', require('./routes/inquiries'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
