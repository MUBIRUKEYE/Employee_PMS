const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { protect } = require('../middleware/auth');

// GET dashboard summary
router.get('/summary', protect, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalSalaries = await Salary.countDocuments();
    const salaryAgg = await Salary.aggregate([
      { $group: { _id: null, totalGross: { $sum: '$grossSalary' }, totalNet: { $sum: '$netSalary' }, totalDeductions: { $sum: '$totalDeduction' } } }
    ]);
    res.json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments,
        totalSalaries,
        totalGross: salaryAgg[0]?.totalGross || 0,
        totalNet: salaryAgg[0]?.totalNet || 0,
        totalDeductions: salaryAgg[0]?.totalDeductions || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET daily report (today)
router.get('/daily', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const salaries = await Salary.find({ createdAt: { $gte: today, $lt: tomorrow } })
      .populate({ path: 'employee', select: 'employeeNumber firstName lastName position', populate: { path: 'department', select: 'departmentName' } });

    const employees = await Employee.find({ createdAt: { $gte: today, $lt: tomorrow } }).populate('department', 'departmentName');
    const departments = await Department.find({ createdAt: { $gte: today, $lt: tomorrow } });

    res.json({ success: true, period: 'daily', date: today, data: { salaries, employees, departments } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET weekly report (last 7 days)
router.get('/weekly', protect, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const salaries = await Salary.find({ createdAt: { $gte: weekAgo, $lte: today } })
      .populate({ path: 'employee', select: 'employeeNumber firstName lastName position', populate: { path: 'department', select: 'departmentName' } });

    const employees = await Employee.find({ createdAt: { $gte: weekAgo, $lte: today } }).populate('department', 'departmentName');
    const departments = await Department.find({ createdAt: { $gte: weekAgo, $lte: today } });

    const totalNetSalary = salaries.reduce((sum, s) => sum + s.netSalary, 0);
    const totalGrossSalary = salaries.reduce((sum, s) => sum + s.grossSalary, 0);

    res.json({ success: true, period: 'weekly', from: weekAgo, to: today, data: { salaries, employees, departments, totalNetSalary, totalGrossSalary } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET monthly report
router.get('/monthly', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month) - 1 : new Date().getMonth();
    const y = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59);

    const salaries = await Salary.find({ monthOfPayment: { $gte: startDate, $lte: endDate } })
      .populate({ path: 'employee', select: 'employeeNumber firstName lastName position', populate: { path: 'department', select: 'departmentName' } });

    const totalNetSalary = salaries.reduce((sum, s) => sum + s.netSalary, 0);
    const totalGrossSalary = salaries.reduce((sum, s) => sum + s.grossSalary, 0);
    const totalDeductions = salaries.reduce((sum, s) => sum + s.totalDeduction, 0);

    const employees = await Employee.find({ hiredDate: { $gte: startDate, $lte: endDate } }).populate('department', 'departmentName');

    res.json({
      success: true, period: 'monthly',
      month: m + 1, year: y,
      data: { salaries, employees, totalNetSalary, totalGrossSalary, totalDeductions, totalRecords: salaries.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
