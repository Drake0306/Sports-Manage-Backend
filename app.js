const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const coachRoutes = require('./routes/coach.routes');
const parentRoutes = require('./routes/parent.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Use CORS with default settings or specify options
app.use(cors()); // Allow all origins by default

// If you want to restrict origins, you can use:
// app.use(cors({
//   origin: 'http://localhost:8081' // Allow only your React Native app
// }));

app.use(express.json());
app.get('/test', (req, res) => {
  res.json({ message: 'This is a test endpoint!', timestamp: new Date() });
});
// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/user', userRoutes);
app.use('/coach', coachRoutes);
app.use('/parent', parentRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
