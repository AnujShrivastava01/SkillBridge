const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { connectDB, testConnection } = require("./utils/database");
const Message = require("./models/Message");
const HelpRequest = require("./models/HelpRequest");
const User = require("./models/User");
require("dotenv").config();
const aiRoutes = require('./routes/ai');


const aiChatbotRoutes = require('./routes/aiChatbot');

const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");
const messageRoutes = require("./routes/messages");

const app = express();
app.set('trust proxy', 1); // Trust first proxy for correct client IP handling
const server = createServer(app);
const allowedOrigins = [
  process.env.FRONTEND_URL
].filter(Boolean);


// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rate limiting for general API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (increased for better UX)
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static("uploads"));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and document files are allowed!'));
    }
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/ai-chatbot', aiChatbotRoutes);
app.use('/api/ai-help', aiRoutes);
// Make socket.io instance available to routes
app.set('io', io);

// Health check endpoints
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "SkillWave Backend API",
      database: dbConnected ? "Connected" : "Disconnected",
    });
  } catch (error) {
    res.status(503).json({
      status: "Service Unavailable",
      timestamp: new Date().toISOString(),
      service: "SkillWave Backend API",
      database: "Disconnected",
      error: error.message,
    });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "SkillWave Backend API",
      database: dbConnected ? "Connected" : "Disconnected",
    });
  } catch (error) {
    res.status(503).json({
      status: "Service Unavailable",
      timestamp: new Date().toISOString(),
      service: "SkillWave Backend API",
      database: "Disconnected",
      error: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "SkillWave Backend API is running",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Store connected users and their rooms
const connectedUsers = new Map(); // userId -> socket
const userRooms = new Map(); // userId -> Set of roomIds
const roomUsers = new Map(); // roomId -> Set of userIds

// Socket connection handler
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (userId) {
    socket.userId = userId;
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`🔌 User connected: ${userId} (Socket: ${socket.id})`);
  
  // Store user connection
  connectedUsers.set(userId, socket);
  
  // Initialize user's room tracking
  if (!userRooms.has(userId)) {
    userRooms.set(userId, new Set());
  }

  // Join room handler
  socket.on('join_room', async (data) => {
    const { requestId, userId } = data;
    console.log(`🏠 User ${userId} joining room: ${requestId}`);
    
    try {
      // Verify user has access to this request
      const request = await HelpRequest.findById(requestId);
      if (!request) {
        console.log(`❌ Request ${requestId} not found`);
        return;
      }
      
      // Check if user is requester or helper
      const isRequester = request.requester.toString() === userId;
      const isHelper = request.helper && request.helper.toString() === userId;
      
      if (!isRequester && !isHelper) {
        console.log(`❌ User ${userId} not authorized for request ${requestId}`);
        return;
      }
      
      // Join the room
      socket.join(requestId);
      
      // Update tracking
      userRooms.get(userId).add(requestId);
      if (!roomUsers.has(requestId)) {
        roomUsers.set(requestId, new Set());
      }
      roomUsers.get(requestId).add(userId);
      
      // Notify other users in the room
      socket.to(requestId).emit('user_joined_room', {
        requestId,
        userId,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ User ${userId} joined room ${requestId}`);
      
    } catch (error) {
      console.error(`❌ Error joining room: ${error.message}`);
    }
  });

  // Leave room handler
  socket.on('leave_room', (data) => {
    const { requestId, userId } = data;
    console.log(`🏠 User ${userId} leaving room: ${requestId}`);
    
    socket.leave(requestId);
    
    // Update tracking
    const userRoomsSet = userRooms.get(userId);
    if (userRoomsSet) {
      userRoomsSet.delete(requestId);
    }
    
    const roomUsersSet = roomUsers.get(requestId);
    if (roomUsersSet) {
      roomUsersSet.delete(userId);
      if (roomUsersSet.size === 0) {
        roomUsers.delete(requestId);
      }
    }
    
    // Notify other users in the room
    socket.to(requestId).emit('user_left_room', {
      requestId,
      userId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ User ${userId} left room ${requestId}`);
  });

  // Send message handler
  socket.on('send_message', async (messageData) => {
    const { requestId, content, messageType, fileName, fileSize } = messageData;
    const senderId = socket.userId;
    
    console.log(`📤 Message from ${senderId} in room ${requestId}:`, content);
    
    try {
      // Get user details
      const user = await User.findById(senderId);
      if (!user) {
        console.log(`❌ User ${senderId} not found`);
        return;
      }
      
      // Create message object
      const message = {
        requestId,
        senderId,
        senderName: user.name,
        senderPicture: user.picture,
        content,
        messageType: messageType || 'text',
        fileName,
        fileSize,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      // Save to database
      const newMessage = new Message({
        request: requestId,
        sender: senderId,
        content,
        messageType: messageType || 'text',
        fileName,
        fileSize,
        isRead: false
      });
      
      const savedMessage = await newMessage.save();
      
      // Add database ID to message
      message._id = savedMessage._id;
      
      // Broadcast to room
      io.to(requestId).emit('message', message);
      
      // Send notification to other users in the room
      const roomUsersSet = roomUsers.get(requestId);
      if (roomUsersSet) {
        roomUsersSet.forEach(userId => {
          if (userId !== senderId) {
            const userSocket = connectedUsers.get(userId);
            if (userSocket) {
              userSocket.emit('notification', {
                requestId,
                message: `New message from ${user.name}`,
                senderName: user.name,
                timestamp: new Date().toISOString()
              });
            }
          }
        });
      }
      
      console.log(`✅ Message sent and broadcasted to room ${requestId}`);
      
    } catch (error) {
      console.error(`❌ Error sending message: ${error.message}`);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator handler
  socket.on('typing', (data) => {
    const { requestId, userId, userName, isTyping } = data;
    console.log(`⌨️ Typing indicator from ${userName} in room ${requestId}: ${isTyping}`);
    
    // Broadcast typing indicator to other users in the room
    socket.to(requestId).emit('typing', {
      requestId,
      userId,
      userName,
      isTyping,
      timestamp: new Date().toISOString()
    });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    const userId = socket.userId;
    console.log(`🔌 User disconnected: ${userId}`);
    
    // Clean up user tracking
    connectedUsers.delete(userId);
    
    // Leave all rooms
    const userRoomsSet = userRooms.get(userId);
    if (userRoomsSet) {
      userRoomsSet.forEach(requestId => {
        const roomUsersSet = roomUsers.get(requestId);
        if (roomUsersSet) {
          roomUsersSet.delete(userId);
          if (roomUsersSet.size === 0) {
            roomUsers.delete(requestId);
          }
        }
        
        // Notify other users
        socket.to(requestId).emit('user_left_room', {
          requestId,
          userId,
          timestamp: new Date().toISOString()
        });
      });
      userRooms.delete(userId);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3001;

// Always start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export for Vercel
module.exports = app;

// Function to save messages using Message model
async function saveMessage(data) {
  try {
    const { requestId, senderId, receiverId, message, senderName } = data;
    
    const newMessage = new Message({
      request: requestId,
      sender: senderId,
      receiver: receiverId,
      message,
      messageType: 'text'
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email picture')
      .populate('receiver', 'name email picture');

    return populatedMessage;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

// Function to save file messages using Message model
async function saveFileMessage(data) {
  try {
    const { requestId, senderId, receiverId, message, fileData, senderName } = data;
    
    const newMessage = new Message({
      request: requestId,
      sender: senderId,
      receiver: receiverId,
      message: message || `Sent a ${fileData.mimeType.startsWith('image/') ? 'image' : 'file'}`,
      messageType: fileData.mimeType.startsWith('image/') ? 'image' : 'file',
      fileData: {
        fileName: fileData.fileName,
        fileUrl: fileData.fileUrl,
        fileSize: fileData.fileSize,
        mimeType: fileData.mimeType,
        thumbnailUrl: fileData.mimeType.startsWith('image/') ? fileData.fileUrl : null
      }
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email picture')
      .populate('receiver', 'name email picture');

    return populatedMessage;
  } catch (error) {
    console.error("Error saving file message:", error);
    throw error;
  }
}

module.exports = { app, io };
