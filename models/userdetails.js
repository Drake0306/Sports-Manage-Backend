'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class USERDETAILS extends Model {
    static associate(models) {
      // Define association with the User model
      USERDETAILS.belongsTo(models.USERS, { foreignKey: 'userId', onDelete: 'CASCADE' });

      // Define association with the Coach model
      USERDETAILS.belongsTo(models.COACH, { foreignKey: 'coachTypeId', onDelete: 'CASCADE' });

      // Define association with the Organization model
      USERDETAILS.belongsTo(models.ORGANIZATIONS, { foreignKey: 'organizationId', onDelete: 'CASCADE' });

      
    }
  }

  USERDETAILS.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    coachTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'USERDETAILS',
    tableName:'USERDETAILS',
    timestamps: true
  });

  return USERDETAILS;
};
