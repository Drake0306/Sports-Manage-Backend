'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SportsList extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  SportsList.init({
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
    modelName: 'SportsList',
    tableName: 'sportslist', // Explicitly define the table name
    timestamps: true // Enables createdAt and updatedAt fields
  });

  return SportsList;
};
