require('dotenv').config();
const { signToken } = require('./server/utils/jwt');

const token = signToken({ role: 'Super Admin' });
console.log('JWT:', token);
