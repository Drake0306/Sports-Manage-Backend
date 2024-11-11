'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class JOINEDTEAMDATA extends Model {
    static associate(models) {
      // Define association with User
      JOINEDTEAMDATA.belongsTo(models.USERS, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Define association with CoachTeam
      JOINEDTEAMDATA.belongsTo(models.COACHTEAM, {
        foreignKey: 'teamId',
        as: 'team',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  JOINEDTEAMDATA.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'USERS', // Reference to User model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'COACHTEAM', // Reference to CoachTeam model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active', // Set default value to 'active'
    },
  }, {
    sequelize,
    modelName: 'JOINEDTEAMDATA',
    tableName: 'JOINEDTEAMDATA',
    timestamps: true, // Enables createdAt and updatedAt fields
  });

  return JOINEDTEAMDATA;
};
