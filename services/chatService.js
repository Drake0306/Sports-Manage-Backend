const socketIO = require('socket.io');
const { CHATROOMS, MESSAGES, GROUPS, GROUP_MEMBERSHIPS, GROUP_MESSAGES } = require('../models');
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

            // Individual chat handling (existing)
            socket.on('join', async (data) => {
                try {
                    const { userPhone, receiverPhone, roomId } = data;
                    console.log('Join request:', { userPhone, receiverPhone, roomId });

                    if (!roomId || !userPhone || !receiverPhone) {
                        throw new Error('Missing required join data');
                    }

                    // Verify room exists and user is a participant
                    const room = await CHATROOMS.findOne({
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
                    const messages = await MESSAGES.findAll({
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

            // Group chat handling (new)
            socket.on('joinGroup', async (data) => {
                try {
                    const { userPhone, groupId } = data;
                    console.log('Join group request:', { userPhone, groupId });

                    if (!groupId) {
                        throw new Error('Missing required group data');
                    }

                    // Verify group exists
                    const group = await GROUPS.findOne({
                        where: { id: groupId }
                    });

                    if (!group) {
                        throw new Error('Group not found');
                    }

                    // Join the socket to the group
                    socket.join(groupId);

                    // Store socket data
                    this.socketToPhone.set(socket.id, { 
                        groupId,
                        group: group // Store group object for reference
                    });

                    // Fetch messages for the group
                    const messages = await GROUP_MESSAGES.findAll({
                        where: { groupId },
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
                    socket.emit('groupJoined', {
                        groupId,
                        messages: decryptedMessages
                    });

                    console.log(`User ${userPhone} joined group ${groupId}`);
                } catch (error) {
                    console.error('Error in joinGroup:', error);
                    socket.emit('error', { message: error.message });
                }
            });

            // Group message handling (new)
            socket.on('groupMessage', async (data) => {
                try {
                    const socketData = this.socketToPhone.get(socket.id);
                    if (!socketData) {
                        throw new Error('Not in a group');
                    }

                    const { userPhone, groupId } = socketData;
                    const { text } = data;

                    if (!text) {
                        throw new Error('Message text is required');
                    }

                    console.log('Processing group message in group:', groupId, 'from:', userPhone);

                    // Find the group
                    const group = await GROUPS.findOne({
                        where: { groupId }
                    });

                    if (!group) {
                        throw new Error('Group not found');
                    }

                    // Save the message to the database using groupId
                    const encryptedContent = this.encryptionService.encrypt(text);
                    const message = await GROUP_MESSAGES.create({
                        groupId: group.groupId,
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

                    // Broadcast the message to all members in the group
                    const groupMembers = await GROUP_MEMBERSHIPS.findAll({
                        where: { groupId: group.groupId },
                        attributes: ['userPhone']
                    });

                    groupMembers.forEach(member => {
                        const userSocketId = this.getUserSocketId(member.userPhone);  // Get the socket ID for each member
                        if (userSocketId) {
                            this.io.to(userSocketId).emit('newGroupMessage', messageData);  // Emit new group message to the user
                        }
                    });

                    console.log('Group message broadcasted to group:', groupId);
                } catch (error) {
                    console.error('Error in groupMessage:', error);
                    socket.emit('error', { message: error.message });
                }
            });

            // Disconnect handler (existing)
            socket.on('disconnect', () => {
                const socketData = this.socketToPhone.get(socket.id);
                if (socketData) {
                    const { groupId, userPhone, roomId } = socketData;
                    if (groupId) {
                        socket.leave(groupId);
                        console.log(`User ${userPhone} left group ${groupId}`);
                    } else if (roomId) {
                        socket.leave(roomId);
                        console.log(`User ${userPhone} left room ${roomId}`);
                    }
                    this.socketToPhone.delete(socket.id);
                }
            });
        });
    }

    // Method for sending group messages outside socket handling (API or backend)
    async sendGroupMessage(groupId, senderPhone, text) {
        try {
            // Save the encrypted message to DB
            const encryptedContent = this.encryptionService.encrypt(text);
            const message = await GROUP_MESSAGES.create({
                groupId: groupId,
                senderPhone: senderPhone,
                encryptedContent,
                status: 'sent'
            });

            // Retrieve group members from the database
            const groupMembers = await GROUP_MEMBERSHIPS.findAll({
                where: { groupId: groupId },
                attributes: ['userPhone']
            });

            // Broadcast the message to all participants
            groupMembers.forEach(member => {
                const userSocketId = this.getUserSocketId(member.userPhone);  // Get the socket ID for each member
                if (userSocketId) {
                    this.io.to(userSocketId).emit('newGroupMessage', message);  // Emit new message to the user
                }
            });

            console.log('Group message sent to all group members.');
            return message;  // Return the message for the API response
        } catch (error) {
            console.error('Error sending group message:', error);
            throw error;  // Rethrow the error to be handled by the caller
        }
    }

    // Helper method to get user socket ID by phone number
    getUserSocketId(phoneNumber) {
        for (const [socketId, data] of this.socketToPhone.entries()) {
            if (data.userPhone === phoneNumber) {
                return socketId;
            }
        }
        return null;
    }

    async getOrCreateRoom(userPhone, receiverPhone) {
        try {
            const [phone1, phone2] = [userPhone, receiverPhone].sort();
            const roomId = `${phone1}-${phone2}`;

            let room = await CHATROOMS.findOne({
                where: { roomId }
            });

            if (!room) {
                room = await CHATROOMS.create({
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
            const message = await MESSAGES.findByPk(messageId);
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
            const messages = await MESSAGES.findAll({
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