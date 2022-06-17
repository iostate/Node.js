const express = require('express');
const router = express.Router();

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
} = require('../controllers/bootcamps');

router.route('/').get(getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

// router.get('/:id', (req, res) => {
//   res.status(200).json({ success: true, msg: `Show the bootcamp id ${req.params.id}` });
// });

// router.post('/:id', (req, res) => {
//   res.status(200).json({ success: true, msg: `Create new bootcamp id ${req.params.id}` });
// });

// router.put('/:id', (req, res) => {
//   res.status(200).json({ success: true, msg: `Update bootcamp id ${req.params.id} ` });
// });

// router.delete('/:id', (req, res) => {
//   res.status(200).json({ success: true, msg: `Deleted bootcamp id ${req.params.id}` });
// });

// router.listen(3000, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

module.exports = router;
