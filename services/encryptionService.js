// src/services/encryptionService.js
const crypto = require('crypto');
require('dotenv').config();

class EncryptionService {
    constructor() {
        // Check if encryption keys exist
        if (!process.env.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY is not set in environment variables');
        }

        // Store the algorithm and key details
        this.algorithm = 'aes-256-cbc';
        
        // Ensure the key is exactly 32 bytes (256 bits)
        this.key = Buffer.from(process.env.ENCRYPTION_KEY).slice(0, 32);
        
        // Generate or use existing IV
        this.iv = process.env.ENCRYPTION_IV 
            ? Buffer.from(process.env.ENCRYPTION_IV, 'hex').slice(0, 16)
            : crypto.randomBytes(16);
    }

    encrypt(text) {
        try {
            const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Encryption failed');
        }
    }

    decrypt(encryptedText) {
        try {
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Decryption failed');
        }
    }

    // Generate key for .env file
    static generateKeyForEnv() {
        // Generate a random 32-byte key
        const key = crypto.randomBytes(32);
        // Generate a random 16-byte IV
        const iv = crypto.randomBytes(16);

        return {
            ENCRYPTION_KEY: key.toString('base64'),
            ENCRYPTION_IV: iv.toString('hex')
        };
    }
}

module.exports = EncryptionService;