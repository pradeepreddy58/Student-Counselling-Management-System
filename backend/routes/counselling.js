const express = require('express');
const CounsellingRequest = require('../models/CounsellingRequest');
const router = express.Router();
const upload = require('../middleware/upload');
const { auth } = require('../middleware/authMiddleware');


// Book counselling
router.post('/', async (req, res) => {
  try {
    const { studentId, collegeId } = req.body;
    const request = new CounsellingRequest({ studentId, collegeId });
    await request.save();
    res.json({ message: 'Counselling request sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin approves counselling
router.put('/:id/approve', async (req, res) => {
  try {
    await CounsellingRequest.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ message: 'Counselling approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin rejects counselling
router.put('/:id/reject', async (req, res) => {
  try {
    await CounsellingRequest.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ message: 'Counselling rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student uploads details after approval
router.put('/:id/upload', upload.fields([
  { name: 'tenthCertificate', maxCount: 1 },
  { name: 'interCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, address, phoneNumber, desiredBranch } = req.body;

    const uploadedDetails = {
      name,
      address,
      phoneNumber,
      desiredBranch,
      tenthCertificate: req.files['tenthCertificate'][0].path,
      interCertificate: req.files['interCertificate'][0].path,
    };

    await CounsellingRequest.findByIdAndUpdate(req.params.id, { uploadedDetails });
    res.json({ message: 'Details and certificates uploaded successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all counselling requests (Admin)
router.get('/', async (req, res) => {
  try {
    const requests = await CounsellingRequest.find()
      .populate('studentId', 'name email')
      .populate('collegeId', 'name location')
      .populate('assignedCollegeId', 'name location');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin assigns college & branch to student
router.put('/:id/assign', async (req, res) => {
  try {
    const { collegeId, branch } = req.body;

    const counselling = await CounsellingRequest.findById(req.params.id);
    if (!counselling) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (!counselling.uploadedDetails) {
      return res.status(400).json({ message: 'Student has not uploaded certificates yet' });
    }

    counselling.assignedCollegeId = collegeId;
    counselling.assignedBranch = branch;
    counselling.status = 'assigned';
    await counselling.save();

    res.json({ message: 'College and branch assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's own counselling request
router.get('/my', auth, async (req, res) => {
  try {
    const request = await CounsellingRequest.findOne({ studentId: req.user.id })
      .populate('collegeId', 'name location')
      .populate('assignedCollegeId', 'name location');

    if (!request) {
      return res.status(404).json({ message: 'No counselling request found' });
    }

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
