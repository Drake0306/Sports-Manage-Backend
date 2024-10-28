'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CoachTeam extends Model {
    static associate(models) {
      // Define associations here if needed
      CoachTeam.belongsTo(models.SportsList, {
        foreignKey: 'sport', // This assumes the column name is 'sport'
        as: 'sportDetails', // Optional alias for the association
      });
      CoachTeam.belongsTo(models.User, {
        foreignKey: 'coachId', // Assuming the user model has 'id' as primary key
        as: 'coachDetails', // Optional alias for the association
      });
    }
  }

  CoachTeam.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    teamName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teamCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Ensures each team code is unique
    },
    teamLogo: {
      type: DataTypes.STRING,
      allowNull: true // Allows null if logo is optional
    },
    sport: { // Adding the sport column
      type: DataTypes.INTEGER,
      allowNull: false, // Ensure it is NOT NULL
      references: {
        model: 'sportsList', // Ensure the correct table name
        key: 'id'
      },
      onUpdate: 'CASCADE', // Update foreign key on sportslist updates
      onDelete: 'RESTRICT' // Prevent deletion of referenced sport
    },
    coachId: {
      type: DataTypes.INTEGER, // Assuming coachId will store the ID of the user
      allowNull: false, // Not nullable
      references: {
        model: 'users', // Ensure the model name matches the user table name
        key: 'id' // Key in the referenced table
      },
      onUpdate: 'CASCADE', // Handles updates in the referenced table
      onDelete: 'RESTRICT' // Prevent deletion of referenced coach
    },
    teamColor: { // Adding the teamColor column
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      allowNull: false,
      defaultValue: 'active' // Default value set to 'active'
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW // Sets default to current timestamp
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW // Sets default to current timestamp
    }
  }, {
    sequelize,
    modelName: 'CoachTeam',
    tableName: 'coachTeam', // Explicitly define the table name
    timestamps: true // Enables createdAt and updatedAt fields
  });

  return CoachTeam;
};
