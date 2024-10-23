const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    // Import ChatRoom after initializing
    const ChatRoom = require('./ChatRoom')(sequelize);

    class Message extends Model {}

    Message.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        roomId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'room_id'
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
        modelName: 'Message',
        tableName: 'messages',
        underscored: true,
    });

    // Set up associations after both models are initialized
    ChatRoom.hasMany(Message, { foreignKey: 'roomId' });
    Message.belongsTo(ChatRoom, { foreignKey: 'roomId' });

    return Message;
};
