'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeatureRequest extends Model {
    static associate(models) {
      // Define associations here
      // For example, if you want to associate FeatureRequest with User
      FeatureRequest.belongsTo(models.User, {
        foreignKey: 'userId', // The foreign key in the featureRequest table
        as: 'user' // Alias for the association
      });
    }
  }

  FeatureRequest.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    desc: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'), // Updated to ENUM type
      allowNull: false,
      defaultValue: 'medium' // Default value can be set to 'medium'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active' // Default value is 'active'
    },
    requestFor: {
      type: DataTypes.ENUM('bug', 'feature'),
      allowNull: false,
      defaultValue: 'feature' // Default value can be set to 'feature'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Ensure this matches the actual table name for users
        key: 'id' // Key in the referenced table
      }
    }
  }, {
    sequelize,
    modelName: 'FeatureRequest',
    tableName:'FeatureRequest',
    timestamps: true // Enable timestamps
  });

  return FeatureRequest;
};
