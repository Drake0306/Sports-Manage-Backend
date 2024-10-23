// scripts/generate-keys.js
const EncryptionService = require('../services/encryptionService');

const keys = EncryptionService.generateKeyForEnv();
console.log('Add these to your .env file:');
console.log(`ENCRYPTION_KEY=${keys.ENCRYPTION_KEY}`);
console.log(`ENCRYPTION_IV=${keys.ENCRYPTION_IV}`);