const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add amount of tuition'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  // Courses are never actually included in the schema
});

CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log('Calculating avg cost....'.blue);

  //  type !mbda for shortcut Mongoose Snippets
  const obj = await this.aggregate(
    // This array is called a pipeline
    [
      {
        // Match the bootcamp field to the bootcampId
        $match: { bootcamp: bootcampId },
      },
      {
        // Group is the calculated object that we want to create
        $group: {
          // Kind of weird but we need to put a dollar sign in front
          _id: '$bootcamp',
          // We're going to create a property called averageCost
          averageCost: {
            // $avg is an operator
            $avg: '$tuition',
          },
        },
      },
    ]
  );

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.error(err);
  }
  // console.log(obj[0]._id.toString());
};

CourseSchema.post('save', function () {
  // let bootcampId = this.bootcamp[0]._id.toString();
  // console.log(this.bootcamp);
  this.constructor.getAverageCost(this.bootcamp);
});

CourseSchema.pre('remove', function () {
  // const vals = Object.values(this.bootcamp);
  // vals.forEach((e) => console.log(e));
  const bootcampId = this.bootcamp[0]._id.toString();
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
