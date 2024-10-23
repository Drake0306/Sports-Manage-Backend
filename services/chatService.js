// src/services/chatService.js
const socketIO = require('socket.io');
const { ChatRoom, Message } = require('../models');
const EncryptionService = require('./encryptionService');

class ChatService {
    constructor(server) {
        this.io = socketIO(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.socketToPhone = new Map();
        this.encryptionService = new EncryptionService();
        
        this.setupSocketHandlers();
    }

    async setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('join', this.handleJoin(socket));
            socket.on('message', this.handleMessage(socket));
            socket.on('disconnect', this.handleDisconnect(socket));
        });
    }

    async getOrCreateRoom(userPhone, receiverPhone) {
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
        }

        return room;
    }

    handleJoin(socket) {
        return async ({ userPhone, receiverPhone }) => {
            try {
                const room = await this.getOrCreateRoom(userPhone, receiverPhone);
                socket.join(room.id);
                this.socketToPhone.set(socket.id, { userPhone, roomId: room.id });

                // Fetch and decrypt messages
                const messages = await Message.findAll({
                    where: { roomId: room.id },
                    order: [['createdAt', 'ASC']]
                });

                const decryptedMessages = messages.map(msg => ({
                    id: msg.id,
                    sender: msg.senderPhone,
                    text: this.encryptionService.decrypt(msg.encryptedContent),
                    timestamp: msg.createdAt,
                    status: msg.status
                }));

                socket.emit('joined', {
                    roomId: room.id,
                    messages: decryptedMessages
                });

                console.log(`User ${userPhone} joined room ${room.id}`);
            } catch (error) {
                console.error('Error in handleJoin:', error);
                socket.emit('error', { message: 'Failed to join chat' });
            }
        };
    }

    handleMessage(socket) {
        return async ({ text }) => {
            try {
                const socketData = this.socketToPhone.get(socket.id);
                if (!socketData) {
                    socket.emit('error', { message: 'Not in a chat room' });
                    return;
                }

                const { userPhone, roomId } = socketData;
                const encryptedContent = this.encryptionService.encrypt(text);

                // Save encrypted message to database
                const message = await Message.create({
                    roomId,
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

                this.io.to(roomId).emit('message', messageData);
            } catch (error) {
                console.error('Error in handleMessage:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        };
    }

    handleDisconnect(socket) {
        return () => {
            const socketData = this.socketToPhone.get(socket.id);
            if (socketData) {
                const { roomId } = socketData;
                socket.leave(roomId);
                this.socketToPhone.delete(socket.id);
                console.log(`User left room ${roomId}`);
            }
        };
    }

    // Add method to mark messages as delivered/read
    async updateMessageStatus(messageId, status) {
        try {
            const message = await Message.findByPk(messageId);
            if (message) {
                await message.update({ status });
                this.io.to(message.roomId).emit('messageStatus', {
                    messageId,
                    status
                });
            }
        } catch (error) {
            console.error('Error updating message status:', error);
        }
    }
}

module.exports = ChatService;