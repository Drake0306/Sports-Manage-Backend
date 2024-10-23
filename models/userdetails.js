'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class userDetails extends Model {
    static associate(models) {
      // Define association with the User model
      userDetails.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });

      // Define association with the Coach model
      userDetails.belongsTo(models.Coach, { foreignKey: 'coachTypeId', onDelete: 'CASCADE' });

      // Define association with the Organization model
      userDetails.belongsTo(models.Organization, { foreignKey: 'organizationId', onDelete: 'CASCADE' });

      
    }
  }

  userDetails.init({
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
    modelName: 'userDetails',
    timestamps: true
  });

  return userDetails;
};
