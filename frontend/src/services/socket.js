import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.isConnected = false;
    this.messageListeners = [];
    this.notificationListeners = [];
    this.typingListeners = [];
    this.connectionStatusListeners = [];
    this.currentRoom = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.connectionTimeout = 10000; // 10 seconds timeout
  }

  getSocketUrl() {
    return import.meta.env.VITE_API_URL || "http://localhost:3001";
  }

  connect(userId) {
    if (this.socket && this.socket.connected) {
      console.log('🔌 Socket already connected, skipping connection');
      return;
    }

    this.userId = userId;
    const socketUrl = this.getSocketUrl();
    
    console.log(`🔌 Attempting to connect to socket server at: ${socketUrl}`);
    
    // Connect to the backend socket server
    this.socket = io(socketUrl, {
      auth: {
        userId: userId
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: this.connectionTimeout,
      forceNew: true,
      upgrade: true,
      rememberUpgrade: false
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionStatus(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
      this.notifyConnectionStatus(false);
      
      // Attempt to reconnect if it wasn't a manual disconnect
      if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
        this.reconnectAttempts++;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => {
            this.socket.connect();
          }, 1000 * this.reconnectAttempts);
        } else {
          console.error('❌ Max reconnection attempts reached');
        }
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this.isConnected = false;
      this.notifyConnectionStatus(false);
      
      // Handle specific error types
      if (error.message.includes('timeout')) {
        console.error('⏰ Connection timeout - server may not be running');
      } else if (error.message.includes('xhr poll error')) {
        console.error('🌐 Network error - check your internet connection');
      } else if (error.message.includes('CORS')) {
        console.error('🚫 CORS error - check server configuration');
      }
      
      this.reconnectAttempts++;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`🔄 Retrying connection... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => {
          this.socket.connect();
        }, 1000 * this.reconnectAttempts);
      } else {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    // Listen for incoming messages
    this.socket.on('message', (message) => {
      console.log('📨 Received message:', message);
      this.messageListeners.forEach(listener => listener(message));
    });

    // Listen for notifications
    this.socket.on('notification', (notification) => {
      console.log('🔔 Received notification:', notification);
      this.notificationListeners.forEach(listener => listener(notification));
    });

    // Listen for typing indicators
    this.socket.on('typing', (data) => {
      console.log('⌨️ Typing indicator:', data);
      this.typingListeners.forEach(listener => listener(data));
    });

    // Listen for user joined/left room
    this.socket.on('user_joined_room', (data) => {
      console.log('👤 User joined room:', data);
    });

    this.socket.on('user_left_room', (data) => {
      console.log('👤 User left room:', data);
    });

    // Listen for errors
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Listen for connection timeout
    this.socket.on('connect_timeout', () => {
      console.error('⏰ Connection timeout');
      this.isConnected = false;
      this.notifyConnectionStatus(false);
    });
  }

  // Room management
  joinRoom(requestId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot join room');
      return;
    }

    if (this.currentRoom === requestId) {
      console.log('Already in room:', requestId);
      return;
    }

    // Leave current room if any
    if (this.currentRoom) {
      this.leaveRoom(this.currentRoom);
    }

    console.log('🏠 Joining room:', requestId);
    this.socket.emit('join_room', { requestId, userId: this.userId });
    this.currentRoom = requestId;
  }

  leaveRoom(requestId) {
    if (!this.socket || !this.isConnected) return;

    console.log('🏠 Leaving room:', requestId);
    this.socket.emit('leave_room', { requestId, userId: this.userId });
    
    if (this.currentRoom === requestId) {
      this.currentRoom = null;
    }
  }

  // Message sending
  sendMessage(messageData) {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected, cannot send message');
      return;
    }

    const message = {
      ...messageData,
      senderId: this.userId,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending message:', message);
    this.socket.emit('send_message', message);
  }

  // Typing indicators
  startTyping(requestId, userName) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing', {
      requestId,
      userId: this.userId,
      userName,
      isTyping: true
    });
  }

  stopTyping(requestId, userName) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('typing', {
      requestId,
      userId: this.userId,
      userName,
      isTyping: false
    });
  }

  // Event listeners
  onMessage(callback) {
    this.messageListeners.push(callback);
  }

  offMessage() {
    this.messageListeners = [];
  }

  onNotification(callback) {
    this.notificationListeners.push(callback);
  }

  offNotification() {
    this.notificationListeners = [];
  }

  onTyping(callback) {
    this.typingListeners.push(callback);
  }

  offTyping() {
    this.typingListeners = [];
  }

  onConnectionStatus(callback) {
    this.connectionStatusListeners.push(callback);
  }

  offConnectionStatus() {
    this.connectionStatusListeners = [];
  }

  notifyConnectionStatus(status) {
    this.connectionStatusListeners.forEach(listener => listener(status));
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      url: this.getSocketUrl()
    };
  }

  // Test connection
  testConnection() {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not initialized"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Connection test timeout"));
      }, 5000);

      if (this.isConnected) {
        clearTimeout(timeout);
        resolve({ connected: true, socketId: this.socket.id });
      } else {
        this.socket.once("connect", () => {
          clearTimeout(timeout);
          resolve({ connected: true, socketId: this.socket.id });
        });

        this.socket.once("connect_error", (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.userId = null;
    this.currentRoom = null;
    this.reconnectAttempts = 0;
    this.messageListeners = [];
    this.notificationListeners = [];
    this.typingListeners = [];
    this.connectionStatusListeners = [];
  }
}

const socketService = new SocketService();
export default socketService;
