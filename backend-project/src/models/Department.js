const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentCode: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  departmentName: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
