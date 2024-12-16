const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class EVENTS extends Model {}

    EVENTS.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,   
            field: 'title'
        },
        startTime: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'start_time'
        },
        endTime: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'end_time'
        },
        date: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'date'
        },
        presentAttendees: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'present_attendees'
        },
        absentAttendees: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'absent_attendees'
        },
        missingAttendees: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'missing_attendees'
        },
        type: {
            type: DataTypes.JSON, // JSON type to store nested properties
            allowNull: false,
            field: 'type'
        },
        coachId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'coach_id'
        },
        orgId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'org_id'
        },
        teamId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'team_id'
        }
    }, {
        sequelize,
        modelName: 'EVENTS',
        tableName: 'EVENTS',
        underscored: true,
    });

    return EVENTS;
};
