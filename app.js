const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const coachRoutes = require('./routes/coach.routes');
const parentRoutes = require('./routes/parent.routes');
const adminRoutes = require('./routes/admin.routes');
const ChatService = require('./services/chatService');
const chatRoutes = require('./routes/chatRoutes');
const app = express();
const server = http.createServer(app);

// Create the uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


// Use CORS with default settings or specify options
app.use(cors()); // Allow all origins by default

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// If you want to restrict origins, you can use:
// app.use(cors({
//   origin: 'http://localhost:8081' // Allow only your React Native app
// }));



app.use(express.json());
app.get('/test', (req, res) => {
  res.json({ message: 'This is a test endpoint!', timestamp: new Date() });
});

const chatService = new ChatService(server);

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/user', userRoutes);
app.use('/coach', coachRoutes);
app.use('/parent', parentRoutes);
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);




const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
