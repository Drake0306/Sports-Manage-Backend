const socketIO = require('socket.io');
const { ChatRoom, Message } = require('../models');
const EncryptionService = require('./encryptionService');

class ChatService {
    constructor(server) {
        this.io = socketIO(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            }
        });
        
        this.socketToPhone = new Map();
        this.encryptionService = new EncryptionService();
        
        this.setupSocketHandlers();
    }

    async setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('join', async (data) => {
                try {
                    const { userPhone, receiverPhone, roomId } = data;
                    console.log('Join request:', { userPhone, receiverPhone, roomId });

                    if (!roomId || !userPhone || !receiverPhone) {
                        throw new Error('Missing required join data');
                    }

                    // Verify room exists and user is a participant
                    const room = await ChatRoom.findOne({
                        where: { roomId }
                    });

                    if (!room) {
                        throw new Error('Room not found');
                    }

                    if (room.participant1Phone !== userPhone && room.participant2Phone !== userPhone) {
                        throw new Error('User not authorized for this room');
                    }

                    // Join the socket to the room
                    socket.join(roomId);
                    
                    // Store socket data
                    this.socketToPhone.set(socket.id, { 
                        userPhone, 
                        roomId,
                        room: room // Store room object for reference
                    });

                    // Fetch messages for the room
                    const messages = await Message.findAll({
                        where: { roomId: room.roomId },
                        order: [['createdAt', 'ASC']]
                    });

                    const decryptedMessages = messages.map(msg => ({
                        id: msg.id,
                        sender: msg.senderPhone,
                        text: this.encryptionService.decrypt(msg.encryptedContent),
                        timestamp: msg.createdAt,
                        status: msg.status
                    }));

                    // Confirm join with messages
                    socket.emit('joined', {
                        roomId,
                        messages: decryptedMessages
                    });

                    console.log(`User ${userPhone} joined room ${roomId}`);
                } catch (error) {
                    console.error('Error in join:', error);
                    socket.emit('error', { message: error.message });
                }
            });

            socket.on('message', async (data) => {
                try {
                    const socketData = this.socketToPhone.get(socket.id);
                    if (!socketData) {
                        throw new Error('Not in a chat room');
                    }
            
                    const { userPhone, roomId } = socketData;
                    const { text } = data;
            
                    if (!text) {
                        throw new Error('Message text is required');
                    }
            
                    console.log('Processing message in room:', roomId, 'from:', userPhone);
            
                    // Find the room first
                    const room = await ChatRoom.findOne({
                        where: { roomId: roomId }
                    });
            
                    if (!room) {
                        throw new Error('Room not found');
                    }
            
                    // Save message to database using roomId
                    const encryptedContent = this.encryptionService.encrypt(text);
                    const message = await Message.create({
                        roomId: room.roomId,  // Use the room's roomId
                        senderPhone: userPhone,
                        encryptedContent,
                        status: 'sent'
                    });
            
                    const messageData = {
                        id: message.id,
                        sender: userPhone,
                        text,
                        timestamp: message.createdAt,
                        status: message.status
                    };
            
                    // Broadcast to room
                    this.io.to(roomId).emit('message', messageData);
                    console.log('Message broadcast to room:', roomId);
                } catch (error) {
                    console.error('Error in message:', error);
                    socket.emit('error', { message: error.message });
                }
            });
            

            socket.on('disconnect', () => {
                const socketData = this.socketToPhone.get(socket.id);
                if (socketData) {
                    const { roomId, userPhone } = socketData;
                    socket.leave(roomId);
                    this.socketToPhone.delete(socket.id);
                    console.log(`User ${userPhone} left room ${roomId}`);
                }
            });
        });
    }

    async getOrCreateRoom(userPhone, receiverPhone) {
        try {
            const [phone1, phone2] = [userPhone, receiverPhone].sort();
            const roomId = `${phone1}-${phone2}`;

            let room = await ChatRoom.findOne({
                where: { roomId }
            });

            if (!room) {
                room = await ChatRoom.create({
                    roomId,
                    participant1Phone: phone1,
                    participant2Phone: phone2
                });
                console.log('New room created:', roomId);
            } else {
                console.log('Existing room found:', roomId);
            }

            return room;
        } catch (error) {
            console.error('Error in getOrCreateRoom:', error);
            throw error;
        }
    }

    async updateMessageStatus(messageId, status) {
        try {
            const message = await Message.findByPk(messageId);
            if (message) {
                await message.update({ status });
                this.io.to(message.roomId).emit('messageStatus', {
                    messageId,
                    status
                });
                console.log(`Message ${messageId} status updated to ${status}`);
            }
        } catch (error) {
            console.error('Error updating message status:', error);
            throw error;
        }
    }

    async getMessagesForRoom(roomId) {
        try {
            const messages = await Message.findAll({
                where: { roomId },
                order: [['createdAt', 'ASC']]
            });

            return messages.map(msg => ({
                id: msg.id,
                sender: msg.senderPhone,
                text: this.encryptionService.decrypt(msg.encryptedContent),
                timestamp: msg.createdAt,
                status: msg.status
            }));
        } catch (error) {
            console.error('Error getting messages for room:', error);
            throw error;
        }
    }
}

module.exports = ChatService;