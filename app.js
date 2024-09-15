const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth.routes');
const { authenticateToken } = require('./middleware/auth.middleware');

const app = express();
app.use(bodyParser.json());

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.get('/protected', authenticateToken, (req, res) => {
  res.send('This is a protected route');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
