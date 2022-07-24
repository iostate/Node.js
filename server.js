const path = require('path');
const express = require('express');
// const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

var escapeHtml = require('escape-html');
var fs = require('fs');
var marked = require('marked');
const errorHandler = require('./middleware/error');
const connectDB = require('./db');

var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

dotenv.config({ path: './config/config.env' });

connectDB();

const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
const { createServer } = require('http');

const app = express();

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello world!';
  },
};

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.use(express.json()); // Body parser

// Sanitize data
app.use(mongoSanitize());
app.use(helmet()); // Secure HTTP Headers
app.use(helmet.dnsPrefetchControl());
app.use(cors()); // Cross origin requests

app.use(fileUpload()); // File Uploader for route api/v1/bootcamps/:bootcampId/photos
app.use(cookieParser()); // Currently being used for authentication
//
// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);
// Prevent XSS attacks
app.use(xss());
// Prevent http param pollution
app.use(hpp());

app.get('/', function (req, res) {
  res.render('index', { title: 'Markdown Example' });
});

app.get('/fail', function (req, res) {
  res.render('missing', { title: 'Markdown Example' });
});

// app.use(
//   // Allows us to get
//   express.urlencoded({
//     extended: false,
//   })
// );

// Replaced the logging middleware I created.
// Only runs when server is launched in development environment

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

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(PORT, pino, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
