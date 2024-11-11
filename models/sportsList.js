'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SPORTSLIST extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  SPORTSLIST.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    sportName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Ensure unique sport names
    },
    sportIcon: {
      type: DataTypes.STRING,
      allowNull: true // sportIcon is optional
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'), // status can be 'active' or 'inactive'
      allowNull: false,
      defaultValue: 'active' // Default is 'active'
    }
  }, {
    sequelize,
    modelName: 'SPORTSLIST',
    tableName: 'SPORTSLIST', // Explicitly define the table name
    timestamps: true // Enables createdAt and updatedAt fields
  });

  return SPORTSLIST;
};
