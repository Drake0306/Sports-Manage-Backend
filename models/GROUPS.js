const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class GROUPS extends Model {}

    GROUPS.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        groupName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'group_name',
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'created_by', // Phone number of the group creator
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'GROUPS',
        tableName: 'GROUPS',
        underscored: true,
    });

    return GROUPS;
};
