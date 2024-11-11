// models/Message.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class MESSAGES extends Model {}

    MESSAGES.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        roomId: {
            type: DataTypes.STRING,  // Changed to STRING to match ChatRoom's roomId
            allowNull: false,
            field: 'room_id',
            references: {
                model: 'CHATROOMS',
                key: 'room_id'  // Reference the room_id column
            }
        },
        senderPhone: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'sender_phone'
        },
        encryptedContent: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'encrypted_content'
        },
        status: {
            type: DataTypes.ENUM('sent', 'delivered', 'read'),
            defaultValue: 'sent'
        }
    }, {
        sequelize,
        modelName: 'MESSAGES',
        tableName: 'MESSAGES',
        underscored: true,
    });

    return MESSAGES;
};