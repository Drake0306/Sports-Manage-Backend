'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Coach extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Coach.init({
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
    modelName: 'Coach',
    timestamps: true // Enable createdAt and updatedAt
  });

  return Coach;
};
