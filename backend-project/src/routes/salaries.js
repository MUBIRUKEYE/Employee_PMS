const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const { protect } = require('../middleware/auth');

// GET all salaries
router.get('/', protect, async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate({ path: 'employee', select: 'employeeNumber firstName lastName position', populate: { path: 'department', select: 'departmentName' } })
      .sort({ monthOfPayment: -1 });
    res.json({ success: true, count: salaries.length, data: salaries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create salary
router.post('/', protect, async (req, res) => {
  try {
    const { employee, grossSalary, totalDeduction, monthOfPayment } = req.body;
    const netSalary = grossSalary - totalDeduction;
    const salary = await Salary.create({ employee, grossSalary, totalDeduction, netSalary, monthOfPayment });
    await salary.populate({ path: 'employee', select: 'employeeNumber firstName lastName position', populate: { path: 'department', select: 'departmentName' } });
    res.status(201).json({ success: true, data: salary });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET single salary
router.get('/:id', protect, async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id)
      .populate({ path: 'employee', select: 'employeeNumber firstName lastName position', populate: { path: 'department', select: 'departmentName' } });
    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found' });
    res.json({ success: true, data: salary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update salary
router.put('/:id', protect, async (req, res) => {
  try {
    const { grossSalary, totalDeduction, monthOfPayment, employee } = req.body;
    const netSalary = grossSalary - totalDeduction;
    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { grossSalary, totalDeduction, netSalary, monthOfPayment, employee },
      { new: true, runValidators: true }
    ).populate({ path: 'employee', select: 'employeeNumber firstName lastName position', populate: { path: 'department', select: 'departmentName' } });
    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found' });
    res.json({ success: true, data: salary });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE salary
router.delete('/:id', protect, async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found' });
    res.json({ success: true, message: 'Salary record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
