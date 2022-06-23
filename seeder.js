const fs = require('fs');

const mongoose = require('mongoose');

const colors = require('colors');

const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./models/Bootcamp');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

// Import into DB
const importData = async () => {
  try {
    // .create() function fires save() hooks
    await Bootcamp.create(bootcamps);
    console.log('Data Imported'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// We have 2 different functions, we need to add an argument that we want to either
// import or delete

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
