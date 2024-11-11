'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class COACHANNOUNCEMENT extends Model {
    static associate(models) {
      // Define associations here if needed
      COACHANNOUNCEMENT.belongsTo(models.USERS, { foreignKey: 'coachId', as: 'coach' }); // Assuming your User model is defined in models/User.js
    }
  }

  COACHANNOUNCEMENT.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    coachId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'USERS', // Ensure this matches your User table name
        key: 'id'
      },
      onUpdate: 'CASCADE', // Update on user changes
      onDelete: 'RESTRICT' // Prevent deletion of referenced user
    },
    announcement: {
      type: DataTypes.TEXT,
      allowNull: false // Ensure announcement text is required
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active' // Default status is 'active'
    }
  }, {
    sequelize,
    modelName: 'COACHANNOUNCEMENT',
    tableName: 'coachannouncement', // Ensure this matches your migration
    timestamps: true // Automatically adds createdAt and updatedAt fields
  });

  return COACHANNOUNCEMENT;
};
