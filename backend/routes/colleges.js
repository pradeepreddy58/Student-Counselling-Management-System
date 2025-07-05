const express = require('express');
const College = require('../models/College');
const router = express.Router();

// Add college (admin)
router.post('/', async (req, res) => {
  const { name, location, branches } = req.body;
  const college = new College({ name, location, branches });
  await college.save();
  res.json({ message: 'College added' });
});

// Get all colleges
router.get('/', async (req, res) => {
  const colleges = await College.find();
  res.json(colleges);
});
router.put('/:id', async (req, res) => {
  const { name, location, branches } = req.body;
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { name, location, branches },
      { new: true }
    );
    res.json(college);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update college' });
  }
});

// Delete college
router.delete('/:id', async (req, res) => {
  try {
    await College.findByIdAndDelete(req.params.id);
    res.json({ message: 'College deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete college' });
  }
});

module.exports = router;
