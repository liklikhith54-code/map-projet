const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Job', 'Result', 'Admit Card', 'Exam Date', 'Admission', 'Answer Key'],
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    importantDates: {
      notificationDate: { type: Date },
      applicationStartDate: { type: Date },
      applicationLastDate: { type: Date },
      examDate: { type: Date },
      resultDate: { type: Date },
    },
    eligibility: {
      type: String,
      required: true,
    },
    applicationFee: {
      type: String,
      default: '',
    },
    officialLink: {
      type: String,
      required: true,
      trim: true,
    },
    pdfLink: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Closed'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
