// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { CHATROOMS, MESSAGES, USERS, GROUP_PARTICIPANTS, GROUP_MESSAGES, GROUPS, EVENTS, GROUP_MEMBERSHIPS } = require('../models');
const EncryptionService = require('../services/encryptionService');
const { where } = require('sequelize');
const encryptionService = new EncryptionService();
const { Op } = require('sequelize');

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

        const [room, created] = await CHATROOMS.findOrCreate({
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

        // Find the room first
        const room = await CHATROOMS.findOne({
            where: { roomId }
        });

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
        
        const message = await MESSAGES.create({
            roomId: room.roomId,  // Use the room's roomId
            senderPhone,
            encryptedContent,
            status: 'sent'
        });

        res.json({
            success: true,
            message: {
                id: message.id,
                sender: senderPhone,
                text: text,
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
        const room = await CHATROOMS.findOne({
            where: { roomId }
        });
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Chat room not found'
            });
        }

        const messages = await MESSAGES.findAll({
            where: { roomId: room.roomId },  // Use the room's roomId
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

        const message = await MESSAGES.findByPk(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await MESSAGES.update({ status });

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

router.get('/users', async (req, res) => {
    try {
      const users = await USERS.findAll({
        attributes: ['id', 'username', 'email', 'userImage', 'contactNumber', 'firstname', 'lastname', 'role'], // Include only necessary fields
        where: {
            username: {
              [Op.ne]: 'admin' // Exclude users with the username 'admin'
            }
          }
      });
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});


// List specific groups
router.get('/groups/:groupId', async (req, res) => {
    try {
        // Fetch group with its members
        const group = await GROUPS.findOne({
            where: { id: req.params.groupId },
            include: [
                {
                    model: GROUP_MEMBERSHIPS,
                    as: 'members', // Alias defined in GROUPS model
                    attributes: ['userPhone', 'role'] // Fetch the phone and role of the members
                }
            ]
        });

        // If no group found, return 404
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Return the group and its members
        return res.status(200).json(group);
    } catch (error) {
        console.error('Error fetching groups:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// List all groups
router.get('/groups-list', async (req, res) => {
    try {
        // Fetch group with its members
        const group = await GROUPS.findAll({
            include: [
                {
                    model: GROUP_MEMBERSHIPS,
                    as: 'members', // Alias defined in GROUPS models
                    attributes: ['userPhone', 'role'] // Fetch the phone and role of the members
                }
            ]
        });

        // If no group found, return 404
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Return the group and its members
        return res.status(200).json(group);
    } catch (error) {
        console.error('Error fetching groups:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Add multiple participants to a group
router.post('/group/:roomId/add', async (req, res) => {
    const { roomId } = req.params;
    const { userPhones } = req.body; // Expecting an array of phone numbers

    if (!Array.isArray(userPhones) || userPhones.length === 0) {
        return res.status(400).json({ success: false, message: 'No participants provided' });
    }

    try {
        const participantEntries = userPhones.map(userPhone => ({
            groupId: roomId,
            userPhone
        }));

        await GROUP_MEMBERSHIPS.bulkCreate(participantEntries);
        res.status(200).json({ success: true, message: 'Participants added successfully' });
    } catch (error) {
        console.error('Error adding participants:', error);
        res.status(500).json({ success: false, message: 'Failed to add participants' });
    }
});

// Remove multiple participants from a group
router.delete('/group/:roomId/remove', async (req, res) => {
    const { roomId } = req.params;
    const { userPhones } = req.body; // Expecting an array of phone numbers

    if (!Array.isArray(userPhones) || userPhones.length === 0) {
        return res.status(400).json({ success: false, message: 'No participants provided' });
    }

    try {
        await GROUP_MEMBERSHIPS.destroy({
            where: {
                roomId,
                userPhone: { [Op.in]: userPhones }
            }
        });
        res.status(200).json({ success: true, message: 'Participants removed successfully' });
    } catch (error) {
        console.error('Error removing participants:', error);
        res.status(500).json({ success: false, message: 'Failed to remove participants' });
    }
});

// Create a new group
router.post('/group', async (req, res) => {
    const { groupName, createdBy, participants } = req.body;

    try {
        const group = await GROUPS.create({
            groupName,
            createdBy,
            description: req.body.description || ''
        });

        // const participantEntries = participants.map(userPhone => ({
        //     groupId: group.id,
        //     userPhone
        // }));


        console.log('participantEntries:', participants);

        // await GROUP_MEMBERSHIPS.bulkCreate(participantEntries);
        res.status(201).json({ success: true, group });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ success: false, message: 'Failed to create group' });
    }
});

// Send a message in a group (Live Chat)
router.post('/group/message', async (req, res) => {
    const { roomId, senderPhone, text } = req.body;

    try {

        const encryptedContent = encryptionService.encrypt(text);

        // Save message to DB
        const message = await GROUP_MESSAGES.create({
            groupId: roomId,
            senderPhone,
            encryptedContent: encryptedContent,
            status: 'sent'
        });

        // Broadcast to all participants (Live chat using socket.io)
        const groupMembers = await GROUP_MEMBERSHIPS.findAll({
            where: { groupId: roomId },
            attributes: ['userPhone']
        });

        res.status(201).json({ success: true, message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

router.get('/group-history/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;

        // Fetch group details from the GROUPS table
        const group = await GROUPS.findOne({
            where: { id: groupId }
        });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Fetch all messages for the group from the GROUP_MESSAGES table
        const messages = await GROUP_MESSAGES.findAll({
            where: { groupId },  // Filter by groupId
            order: [['createdAt', 'ASC']]  // Order by timestamp
        });

        // Decrypt the message content
        const decryptedMessages = messages.map(msg => ({
            id: msg.id,
            senderPhone: msg.senderPhone,
            text: encryptionService.decrypt(msg.encryptedContent), // Decrypt the message
            timestamp: msg.createdAt,
            status: msg.status
        }));

        // Get the list of members in the group
        const groupMembers = await GROUP_MEMBERSHIPS.findAll({
            where: { groupId },
        });

        // Fetch user details for each group member based on their userPhone matching with contactNumber
        const groupMemberDetails = await Promise.all(groupMembers.map(async (member) => {
            // Fetch all users from USERS where userPhone matches the contactNumber
            const users = await USERS.findAll({
                where: { contactNumber: member.userPhone }
            });

            if (users && users.length > 0) {
                // Map users to return their details along with the group membership role
                return users.map(user => ({
                    userPhone: member.userPhone,
                    userName: user.username, // Adjust this if you want full name or another field
                    userFirstName: user.firstname,
                    userLastName: user.lastname,
                    userRole: member.role,
                    userStatus: user.status
                }));
            }
            return []; // Return an empty array if no matching users are found
        }));

        // Flatten the array of group member details (since each member could have multiple matching users)
        const validGroupMembers = groupMemberDetails.flat();

        console.log('####',validGroupMembers);
        // return groupId;

        // Return the group info, along with messages and members
        res.json({
            success: true,
            group: {
                id: group.id,
                groupId: group.groupId,
                groupName: group.groupName,
                createdBy: group.createdBy,
                description: group.description,
                members: validGroupMembers
            },
            messages: decryptedMessages
        });
    } catch (error) {
        console.error('Error fetching history for group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch group chat history'
        });
    }
});




// EVENTS SECTION HERE


// List all events
// router.get('/events', async (req, res) => {
//     try {
//         const events = await EVENTS.findAll();
//         res.status(200).json({ success: true, events });
//     } catch (error) {
//         console.error('Error fetching events:', error);
//         res.status(500).json({ success: false, message: 'Failed to fetch events' });
//     }
// });


// Update an event
router.put('/update/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, startTime, endTime, date, presentAttendees, absentAttendees, missingAttendees, type, coachId, orgId, teamId } = req.body;

        const event = await EVENTS.findByPk(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        await event.update({
            title,
            startTime,
            endTime,
            date,
            presentAttendees,
            absentAttendees,
            missingAttendees,
            type,
            coachId,
            orgId,
            teamId
        });

        res.status(200).json({ success: true, event });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ success: false, message: 'Failed to update event' });
    }
});

// Delete an event
router.delete('/delete/events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const event = await EVENTS.findByPk(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        await event.destroy();
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, message: 'Failed to delete event' });
    }
});



module.exports = router;