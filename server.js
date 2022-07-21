/**
 * 13. Creating Routes & Responses In Express
 */
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./db');

dotenv.config({ path: './config/config.env' });

connectDB();
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

var escapeHtml = require('escape-html');
var fs = require('fs');
var marked = require('marked');

// register .md as an engine in express view system

app.engine('md', function (path, options, fn) {
  fs.readFile(path, 'utf8', function (err, str) {
    if (err) return fn(err);
    var html = marked.parse(str).replace(/\{([^}]+)\}/g, function (_, name) {
      return escapeHtml(options[name] || '');
    });
    fn(null, html);
  });
});

app.set('views', path.join(__dirname, 'views'));

// make it the default so we dont need .md
app.set('view engine', 'md');

app.get('/', function (req, res) {
  res.render('index', { title: 'Markdown Example' });
});

app.get('/fail', function (req, res) {
  res.render('missing', { title: 'Markdown Example' });
});

app.use(helmet()); // Secure HTTP Headers
app.use(cors()); // Cross origin requests
app.use(express.json()); // Body parser
app.use(fileUpload()); // File Uploader for route api/v1/bootcamps/:bootcampId/photos
app.use(cookieParser()); // Currently being used for authentication
// app.use(
//   // Allows us to get
//   express.urlencoded({
//     extended: false,
//   })
// );

// Replaced the logging middleware I created.
// Only runs when server is launched in development environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/hello_world', (req, res) => {
  res.status(200).json({ success: true, data: 'hello world' });
});

// Replaced our own middleware with Morgan.
// app.use(logger);

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
// Mount the authentication route and controller
app.use('/api/v1/auth', auth);
// Yet to implement
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

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
