const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class GROUP_MEMBERSHIPS extends Model {}

    GROUP_MEMBERSHIPS.init({
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
        userPhone: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'user_phone',
        },
        role: {
            type: DataTypes.ENUM('admin', 'member'),
            defaultValue: 'member',
        }
    }, {
        sequelize,
        modelName: 'GROUP_MEMBERSHIPS',
        tableName: 'GROUP_MEMBERSHIPS',
        underscored: true,
    });

    return GROUP_MEMBERSHIPS;
};
