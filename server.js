/**
 * 13. Creating Routes & Responses In Express
 */
const express = require('express');
const dotenv = require('dotenv');
const bootcamps = require('./routes/bootcamps');
// const logger = require('./middleware/logger');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./db');

dotenv.config({ path: './config/config.env' });

connectDB();
const app = express();

app.use(express.json());
// app.use(
//   express.urlencoded({
//     extended: false,
//   })
// );

// Dev logging middleware
// Only check if server is launched in development environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Replaced our own middleware with Morgan.
// app.use(logger);

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
