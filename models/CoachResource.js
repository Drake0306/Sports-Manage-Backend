'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CoachResource extends Model {
    /**
     * Define associations here.
     * This method is not a part of Sequelize lifecycle.
     */
    static associate(models) {
      // Define association with the User model
      CoachResource.belongsTo(models.User, {
        foreignKey: 'coachId',
        as: 'coach'
      });
    }
  }

  CoachResource.init(
    {
      finalForms: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      spiritShop: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      tickets: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      Dragonfly: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'active'
      },
      coachId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'CoachResource',
      tableName: 'coachresources', // Explicitly specify table name if different
      timestamps: true // Enable timestamps if using createdAt and updatedAt
    }
  );

  return CoachResource;
};
