const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const coachRoutes = require('./routes/coach.routes');
const parentRoutes = require('./routes/parent.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
app.use(express.json());

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/user', userRoutes);
app.use('/coach', coachRoutes);
app.use('/parent', parentRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
