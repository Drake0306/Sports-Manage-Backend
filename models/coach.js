'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class COACH extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  COACH.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'COACH',
    tableName:'coaches',
    timestamps: true // Enable createdAt and updatedAt
  });

  return COACH;
};
