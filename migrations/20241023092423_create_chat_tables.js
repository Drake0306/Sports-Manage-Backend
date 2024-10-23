'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create chat_rooms table
        await queryInterface.createTable('chat_rooms', {
            id: {
                type: DataTypes.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            room_id: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            participant1_phone: {
                type: DataTypes.STRING,
                allowNull: false
            },
            participant2_phone: {
                type: DataTypes.STRING,
                allowNull: false
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });

        // Create messages table
        await queryInterface.createTable('messages', {
            id: {
                type: DataTypes.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            room_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'chat_rooms',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                allowNull: false
            },
            sender_phone: {
                type: DataTypes.STRING,
                allowNull: false
            },
            encrypted_content: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('sent', 'delivered', 'read'),
                defaultValue: 'sent'
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });

        // Add indexes
        await queryInterface.addIndex('chat_rooms', ['room_id']);
        await queryInterface.addIndex('chat_rooms', ['participant1_phone']);
        await queryInterface.addIndex('chat_rooms', ['participant2_phone']);
        await queryInterface.addIndex('messages', ['room_id']);
        await queryInterface.addIndex('messages', ['created_at']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('messages');
        await queryInterface.dropTable('chat_rooms');
    }
};