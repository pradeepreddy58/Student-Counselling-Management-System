const mongoose = require('mongoose');

const counsellingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'assigned'],
    default: 'pending',
  },
  uploadedDetails: {
    tenthCertificate: String,
    interCertificate: String,
    name: String,
    address: String,
    phoneNumber: String,
    desiredBranch: String,
  },
  assignedCollegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    default: null,
  },
  assignedBranch: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('CounsellingRequest', counsellingSchema);
