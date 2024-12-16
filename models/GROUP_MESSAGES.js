const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class GROUP_MESSAGES extends Model {}

    GROUP_MESSAGES.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        groupId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'group_id',
            references: {
                model: 'GROUPS',
                key: 'id',
            },
        },
        senderPhone: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'sender_phone',
        },
        encryptedContent: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'encrypted_content',
        },
        status: {
            type: DataTypes.ENUM('sent', 'delivered', 'read'),
            defaultValue: 'sent',
        },
    }, {
        sequelize,
        modelName: 'GROUP_MESSAGES',
        tableName: 'GROUP_MESSAGES',
        underscored: true,
    });

    return GROUP_MESSAGES;
};
