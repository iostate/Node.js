/**
 * 13. Creating Routes & Responses In Express
 */
const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const app = express();

app.get('/', (req, res) => {
  // res.send('Hello from express');
  // res.setHeader('Content-Type', 'application/json');

  // If you just want to send a status code

  res.status(200).json({ success: true, msg: `Show all bootcamps` });
  // res.json({ name: 'Brad' });
});

app.get('/api/v1/bootcamps', (req, res) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps' });
});

app.post('/api/v1/bootcamps/:id', (req, res) => {
  res.status(200).json({ success: true, msg: `Show the bootcamp id ${req.params.id}` });
});

app.put('/api/v1/bootcamps/:id', (req, res) => {
  res.status(200).json({ success: true, msg: `Udate bootcamps ${req.params.id} ` });
});

app.delete('/api/v1/bootcamps/:id', (req, res) => {
  res.status(200).json({ success: true, msg: `Deleted Bootcamp ${req.params.id}` });
});

const PORT = process.env.PORT;

app.listen(3000, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
