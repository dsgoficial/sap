
const VERSION = '2.0.0';
const MIN_DATABASE_VERSION = '2.0.0';

//READ DATABASE VERSION FROM DATABASE
//VALIDATE MIN DATABASE VERSION

const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  PORT: process.env.PORT,
  DB_SERVER: process.env.DB_SERVER,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_VERSION: process.env.DATABASE_VERSION,
  VERSION: VERSION,
};