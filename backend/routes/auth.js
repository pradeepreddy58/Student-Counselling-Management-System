const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET 

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }


    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || 'student',
      status: role === 'admin' ? 'approved' : 'pending'
    });

    await user.save();

    res.json({ message: 'Registered successfully..' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'Not approved by admin yet' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      role: user.role,
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Get pending students (admin)
router.get('/students/pending', async (req, res) => {
  try {
    const pendingStudents = await User.find({ role: 'student', status: 'pending' });
    res.json(pendingStudents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch pending students.' });
  }
});

// Approve student
// Update student status (approve/reject/pending)
router.put('/students/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: `Student status updated to ${status}`, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update student status.' });
  }
});

module.exports = router;
