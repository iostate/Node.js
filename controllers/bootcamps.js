const Bootcamp = require('../models/Bootcamp');

/**
 *
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public
 */
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({ success: true, data: bootcamps });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

/**
 *
 * @desc    Get single bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Show the bootcamp id ${req.params.id}`, hello: req.hello });
};

/**
 *
 * @desc    Create new bootcamp
 * @route   POST /api/v1/bootcamps/:id
 * @access  Public
 */
exports.createBootcamp = async (req, res, next) => {
  try {
    console.log(req.body);
    // const bootcamp = await Bootcamp.create(req.body);
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp,
    });

    console.log(`bootcamp = `);
    console.log(bootcamp);
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, error: `${err}` });
  }

  // console.log(req.body);
  // console.log(`req.body = ${JSON.stringify(req.body)}`);
  // console.log(`req.query = ${JSON.stringify(req.query)}`);
  // console.log(`req.app = ${req.app}`);
  // console.log(`req.baseUrl = ${req.baseUrl}`);
  // console.log(`req.state = ${req.state}`);

  // res.status(200).json({ success: true, msg: `Create new bootcamp id ${req.params.id}` });
};

/**
 *
 * @desc    Update one bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Update bootcamp id ${req.params.id}` });
};

/**
 *
 * @desc    Delete one bootcamp
 * @route   DELETE /api/v1/bootcamps/:id
 * @access  Public
 */
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Deleted bootcamp id ${req.params.id}` });
};
