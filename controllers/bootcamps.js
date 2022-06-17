const Bootcamp = require('../models/Bootcamp');

/**
 *
 * @desc    Get all bootcamps
 * @route   GET /api/v1/bootcamps
 * @access  Public
 */
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps', hello: req.hello });
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
  console.log(req.body);
  try {
    // const bootcamp = await Bootcamp.create(req.body);
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, error: `${err}` });
  }
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
