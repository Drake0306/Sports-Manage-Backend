const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class GROUP_MEMBERSHIPS extends Model {
        static associate(models) {
            // Define the reverse association with an alias (e.g., 'group')
            GROUP_MEMBERSHIPS.belongsTo(models.GROUPS, {
                foreignKey: 'groupId',
                onDelete: 'CASCADE',
                as: 'group' // alias defined here
            });
        }
    }

    GROUP_MEMBERSHIPS.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'group_id',
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
