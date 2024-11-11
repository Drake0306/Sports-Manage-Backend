'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class STUDENTGUARDIAN extends Model {
    static associate(models) {
      // Define associations here if needed
      STUDENTGUARDIAN.belongsTo(models.USERS, { foreignKey: 'userId', onDelete: 'CASCADE' });


      STUDENTGUARDIAN.belongsTo(models.ORGANIZATIONS, { foreignKey: 'organizationId', onDelete: 'CASCADE' });

    }
  }
  
  STUDENTGUARDIAN.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'USERS', // References the Users table
        key: 'id'
      }
    },
    parentEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true // Ensures valid email format
      }
    },
    parentContact: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentSignup: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0 // Default value set to 0
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      athleteCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active' // Default value set to 'active'
    }
  }, {
    sequelize,
    modelName: 'STUDENTGUARDIAN',
    tableName:'STUDENTGUARDIAN',
    timestamps: true // Enable createdAt and updatedAt fields
  });

  return STUDENTGUARDIAN;
};
