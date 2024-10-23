const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class ChatRoom extends Model {}

    ChatRoom.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        roomId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            field: 'room_id'
        },
        participant1Phone: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'participant1_phone'
        },
        participant2Phone: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'participant2_phone'
        }
    }, {
        sequelize,
        modelName: 'ChatRoom',
        tableName: 'chat_rooms',
        underscored: true,
    });

    return ChatRoom;
};
