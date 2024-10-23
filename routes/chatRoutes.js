// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { ChatRoom, Message } = require('../models');
const EncryptionService = require('../services/encryptionService');
const encryptionService = new EncryptionService();

// 1. Create or get chat room
router.post('/room', async (req, res) => {
    try {
        const { userPhone, receiverPhone } = req.body;
        
        if (!userPhone || !receiverPhone) {
            return res.status(400).json({
                success: false,
                message: 'Both phone numbers are required'
            });
        }

        const [phone1, phone2] = [userPhone, receiverPhone].sort();
        const roomId = `${phone1}-${phone2}`;

        const [room, created] = await ChatRoom.findOrCreate({
            where: { roomId },
            defaults: {
                participant1Phone: phone1,
                participant2Phone: phone2
            }
        });

        res.json({
            success: true,
            room: {
                id: room.id,
                roomId: room.roomId,
                participant1Phone: room.participant1Phone,
                participant2Phone: room.participant2Phone,
                created: created
            }
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create chat room'
        });
    }
});

// 2. Send message to a room
router.post('/message', async (req, res) => {
    try {
        const { roomId, senderPhone, text } = req.body;

        if (!roomId || !senderPhone || !text) {
            return res.status(400).json({
                success: false,
                message: 'roomId, senderPhone and text are required'
            });
        }

        const room = await ChatRoom.findOne({ where: { roomId } });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        // Verify sender is part of the room
        if (room.participant1Phone !== senderPhone && room.participant2Phone !== senderPhone) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized sender'
            });
        }

        const encryptedContent = encryptionService.encrypt(text);
        
        const message = await Message.create({
            roomId: room.id,
            senderPhone,
            encryptedContent,
            status: 'sent'
        });

        res.json({
            success: true,
            message: {
                id: message.id,
                sender: senderPhone,
                text: text, // Sending back original text for testing
                timestamp: message.createdAt,
                status: message.status
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});

// 3. Get chat history
router.get('/history/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await ChatRoom.findOne({ where: { roomId } });
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        const messages = await Message.findAll({
            where: { roomId: room.id },
            order: [['createdAt', 'ASC']]
        });

        const decryptedMessages = messages.map(msg => ({
            id: msg.id,
            sender: msg.senderPhone,
            text: encryptionService.decrypt(msg.encryptedContent),
            timestamp: msg.createdAt,
            status: msg.status
        }));

        res.json({
            success: true,
            room: {
                id: room.id,
                roomId: room.roomId,
                participant1Phone: room.participant1Phone,
                participant2Phone: room.participant2Phone
            },
            messages: decryptedMessages
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chat history'
        });
    }
});

// 4. Update message status
router.patch('/message/:messageId/status', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { status } = req.body;

        if (!['sent', 'delivered', 'read'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const message = await Message.findByPk(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await message.update({ status });

        res.json({
            success: true,
            message: {
                id: message.id,
                status: message.status,
                updated: true
            }
        });
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update message status'
        });
    }
});

router.post('/test-encryption', (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required'
            });
        }

        const encryptionService = new EncryptionService();
        
        // Test encryption
        const encrypted = encryptionService.encrypt(text);
        // Test decryption
        const decrypted = encryptionService.decrypt(encrypted);

        res.json({
            success: true,
            original: text,
            encrypted: encrypted,
            decrypted: decrypted,
            matches: text === decrypted
        });
    } catch (error) {
        console.error('Encryption test error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


module.exports = router;