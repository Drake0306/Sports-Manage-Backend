'use strict';
const { Model } = require('sequelize');
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  class EVENTRESPONSE extends Model {
    static associate(models) {
      // Define association with the EVENT model (eventId as foreign key)
      EVENTRESPONSE.belongsTo(models.EVENTS, { foreignKey: 'eventId', onDelete: 'CASCADE' });

      // Define association with the USER model (userId as foreign key)
      EVENTRESPONSE.belongsTo(models.USERS, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }

  EVENTRESPONSE.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID, // Assuming userId is UUID, update it if it's another type
      allowNull: false
    },
    response: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'EVENTRESPONSE',
    tableName: 'EVENTRESPONSES', // Use uppercase table name
    timestamps: true,  // Automatically adds `createdAt` and `updatedAt` columns
    createdAt: 'createdAt',  // Specify custom column names if needed (optional)
    updatedAt: 'updatedAt'   // Specify custom column names if needed (optional)
  });

  return EVENTRESPONSE;
};
