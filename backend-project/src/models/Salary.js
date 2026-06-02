const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee is required']
  },
  grossSalary: {
    type: Number,
    required: [true, 'Gross salary is required'],
    min: 0
  },
  totalDeduction: {
    type: Number,
    required: [true, 'Total deduction is required'],
    min: 0,
    default: 0
  },
  netSalary: {
    type: Number,
    required: [true, 'Net salary is required'],
    min: 0
  },
  monthOfPayment: {
    type: Date,
    required: [true, 'Month of payment is required']
  }
}, { timestamps: true });

// Auto-calculate netSalary before saving
salarySchema.pre('save', function(next) {
  this.netSalary = this.grossSalary - this.totalDeduction;
  next();
});

module.exports = mongoose.model('Salary', salarySchema);
