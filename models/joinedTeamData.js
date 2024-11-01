'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class JoinedTeamData extends Model {
    static associate(models) {
      // Define association with User
      JoinedTeamData.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Define association with CoachTeam
      JoinedTeamData.belongsTo(models.CoachTeam, {
        foreignKey: 'teamId',
        as: 'team',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  JoinedTeamData.init({
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
        model: 'User', // Reference to User model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CoachTeam', // Reference to CoachTeam model
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
    modelName: 'JoinedTeamData',
    tableName: 'joinedTeamData',
    timestamps: true, // Enables createdAt and updatedAt fields
  });

  return JoinedTeamData;
};
