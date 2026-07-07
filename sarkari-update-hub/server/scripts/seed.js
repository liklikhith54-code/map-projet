const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');

// Load environment variables from parent folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const samplePosts = [
  {
    title: "UPSC Civil Services (IAS/IFS) Recruitment 2026",
    category: "Job",
    organization: "UPSC",
    description: "Union Public Service Commission (UPSC) has released the official notification for the prestigious Civil Services Examination (IAS/IFS) 2026. The examination is conducted in three stages: Preliminary, Mains, and Interview to recruit officers for IAS, IPS, IFS, IRS, and other Group A services.",
    importantDates: {
      notificationDate: new Date("2026-02-01T00:00:00.000Z"),
      applicationStartDate: new Date("2026-02-05T00:00:00.000Z"),
      applicationLastDate: new Date("2026-03-05T18:00:00.000Z"),
      examDate: new Date("2026-05-24T00:00:00.000Z"),
      resultDate: new Date("2026-06-25T00:00:00.000Z")
    },
    eligibility: "Bachelor's Degree in any discipline from a recognized university. Candidates appearing for the final year examinations are also eligible to apply. Age limit: 21 to 32 years (with relaxation for reserved categories).",
    applicationFee: "General / OBC: ₹100 | SC / ST / PwD / Female: Nil",
    officialLink: "https://www.upsc.gov.in",
    pdfLink: "https://www.upsc.gov.in/sites/default/files/Notification-CSM-2026-Engl.pdf",
    status: "Active"
  },
  {
    title: "SSC CGL 2026 Tier 1 Admit Card",
    category: "Admit Card",
    organization: "SSC",
    description: "Staff Selection Commission (SSC) has uploaded the regional Tier 1 Admit Cards and Application Status for the Combined Graduate Level (CGL) Examination 2026. Candidates who applied for CGL 2026 can download their region-wise admit cards using their Registration Number and Date of Birth.",
    importantDates: {
      notificationDate: new Date("2026-06-01T00:00:00.000Z"),
      applicationStartDate: new Date("2026-06-10T00:00:00.000Z"),
      applicationLastDate: new Date("2026-07-10T00:00:00.000Z"),
      examDate: new Date("2026-09-15T00:00:00.000Z"),
      resultDate: null
    },
    eligibility: "Not applicable for Admit Card downloads. Candidates who registered successfully can download their hall tickets.",
    applicationFee: "Nil (For downloading admit card)",
    officialLink: "https://ssc.gov.in",
    pdfLink: "",
    status: "Active"
  },
  {
    title: "Bihar B.Ed Common Entrance Test (CET-BED) 2026 Results",
    category: "Result",
    organization: "Lalit Narayan Mithila University (LNMU)",
    description: "LNMU Darbhanga has declared the results for Bihar B.Ed Common Entrance Test (CET-BED) 2026. Candidates who appeared for the entrance exam on June 15, 2026, can check their scorecards and download their counseling allotment letters by logging in with their email ID and password.",
    importantDates: {
      notificationDate: new Date("2026-04-10T00:00:00.000Z"),
      applicationStartDate: new Date("2026-04-15T00:00:00.000Z"),
      applicationLastDate: new Date("2026-05-15T00:00:00.000Z"),
      examDate: new Date("2026-06-15T00:00:00.000Z"),
      resultDate: new Date("2026-07-05T00:00:00.000Z")
    },
    eligibility: "Check B.Ed college allotment rankings based on the qualified scores (minimum cutoff: General 35%, Reserved 30%).",
    applicationFee: "",
    officialLink: "https://biharcetbed-lnmu.in",
    pdfLink: "https://biharcetbed-lnmu.in/pdf/Bihar-Bed-Result-Notice-2026.pdf",
    status: "Active"
  },
  {
    title: "IBPS Probationary Officers (PO) XIV Recruitment 2026",
    category: "Job",
    organization: "IBPS",
    description: "Institute of Banking Personnel Selection (IBPS) invites online applications for the Common Recruitment Process (CRP PO/MT-XIV) for the recruitment of Probationary Officers / Management Trainees in participating public sector banks. Over 4,000 vacancies are expected across 11 nationalized banks.",
    importantDates: {
      notificationDate: new Date("2026-07-01T00:00:00.000Z"),
      applicationStartDate: new Date("2026-07-05T00:00:00.000Z"),
      applicationLastDate: new Date("2026-07-26T23:59:00.000Z"),
      examDate: new Date("2026-10-18T00:00:00.000Z"),
      resultDate: new Date("2026-11-20T00:00:00.000Z")
    },
    eligibility: "Graduation (Bachelor's Degree) in any discipline from a recognized University or equivalent qualification. Age: 20 to 30 years.",
    applicationFee: "General / EWS / OBC: ₹850 | SC / ST / PwD: ₹175",
    officialLink: "https://www.ibps.in",
    pdfLink: "https://www.ibps.in/wp-content/uploads/CRP_PO_XIV_Detailed_Notification.pdf",
    status: "Active"
  },
  {
    title: "UP B.Ed Joint Entrance Exam (JEE) Admission 2026",
    category: "Admission",
    organization: "Bundelkhand University, Jhansi",
    description: "Bundelkhand University has announced admission for the 2-Year B.Ed Joint Entrance Exam (JEE) 2026. This entrance exam provides candidates admission into government and private B.Ed colleges across the state of Uttar Pradesh.",
    importantDates: {
      notificationDate: new Date("2026-02-10T00:00:00.000Z"),
      applicationStartDate: new Date("2026-02-15T00:00:00.000Z"),
      applicationLastDate: new Date("2026-04-10T00:00:00.000Z"),
      examDate: new Date("2026-06-03T00:00:00.000Z"),
      resultDate: new Date("2026-06-30T00:00:00.000Z")
    },
    eligibility: "Bachelor's or Master's Degree with at least 50% marks (55% for Engineering/Technology students). SC/ST candidates need passing marks only.",
    applicationFee: "General / OBC (UP): ₹1400 | SC / ST (UP): ₹700 | Candidates from other states: ₹1400",
    officialLink: "https://www.bujhansi.ac.in",
    pdfLink: "https://www.bujhansi.ac.in/BEdJEE2026/JEE_Detailed_Brochure.pdf",
    status: "Active"
  },
  {
    title: "RRB NTPC (Non-Technical Popular Categories) Exam Schedule Announcement",
    category: "Exam Date",
    organization: "Railway Recruitment Board (RRB)",
    description: "Railway Recruitment Boards (RRBs) have announced the tentative timeline and exam dates for the RRB NTPC Stage 1 Computer Based Test (CBT-1) recruitment. Candidates who registered for vacancies of Station Master, Goods Guard, Junior Clerk, etc., can check their exam date outlines.",
    importantDates: {
      notificationDate: new Date("2025-12-15T00:00:00.000Z"),
      applicationStartDate: new Date("2025-12-20T00:00:00.000Z"),
      applicationLastDate: new Date("2026-01-20T00:00:00.000Z"),
      examDate: new Date("2026-08-20T00:00:00.000Z"),
      resultDate: null
    },
    eligibility: "12th Standard or Graduation depending on the applied post. Selection will include CBT 1, CBT 2, Typing test (if applicable), and Document Verification.",
    applicationFee: "General / OBC: ₹500 (₹400 refundable) | SC / ST / Female / PwD: ₹250 (Full refundable)",
    officialLink: "https://www.rrcb.gov.in",
    pdfLink: "",
    status: "Active"
  },
  {
    title: "CTET July 2026 Official Answer Key & Objection Portal",
    category: "Answer Key",
    organization: "CBSE",
    description: "Central Board of Secondary Education (CBSE) has released the provisional Answer Keys and OMR sheets for the Central Teacher Eligibility Test (CTET) July 2026 Session. Candidates can verify their answers and challenge the answer key through the official login portal by paying ₹1000 per question challenged.",
    importantDates: {
      notificationDate: new Date("2026-03-05T00:00:00.000Z"),
      applicationStartDate: new Date("2026-03-10T00:00:00.000Z"),
      applicationLastDate: new Date("2026-04-12T00:00:00.000Z"),
      examDate: new Date("2026-07-07T00:00:00.000Z"),
      resultDate: null
    },
    eligibility: "Candidates who appeared in CTET July Paper 1 and Paper 2 can check answer keys. Challenge portal closes on July 15, 2026.",
    applicationFee: "Objection fee: ₹1000 per challenged answer key",
    officialLink: "https://ctet.nic.in",
    pdfLink: "https://ctet.nic.in/pdf/CTET_Answer_Key_Press_Note_2026.pdf",
    status: "Active"
  },
  {
    title: "SSC GD Constable Recruitment 2026 Notification",
    category: "Job",
    organization: "SSC",
    description: "Staff Selection Commission (SSC) has released the official notification for GD Constables in BSF, CISF, ITBP, CRPF, SSB, SSF, and Rifleman in Assam Rifles. This is a massive job drive with more than 25,000 tentative vacancies.",
    importantDates: {
      notificationDate: new Date("2026-07-05T00:00:00.000Z"),
      applicationStartDate: new Date("2026-07-05T00:00:00.000Z"),
      applicationLastDate: new Date("2026-08-05T23:30:00.000Z"),
      examDate: new Date("2026-11-10T00:00:00.000Z"),
      resultDate: null
    },
    eligibility: "Class 10 (Matriculation) pass from any recognized board in India. Age: 18 to 23 years. Physical standards apply.",
    applicationFee: "General / OBC / EWS: ₹100 | SC / ST / Females: Nil",
    officialLink: "https://ssc.gov.in",
    pdfLink: "https://ssc.gov.in/SSC_GD_Constable_Notification_2026.pdf",
    status: "Active"
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sarkari';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    console.log("Connected successfully to database.");

    // Clear existing posts
    await Post.deleteMany({});
    console.log("Cleared existing posts.");

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users.");

    // Seed Admin user
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
    
    const adminUser = new User({
      username: adminUsername,
      password: adminPassword
    });
    
    await adminUser.save();
    console.log(`Initial Admin User Seeded! -> Username: ${adminUsername}, Password: ${adminPassword}`);

    // Seed sample posts
    await Post.insertMany(samplePosts);
    console.log(`Seeded ${samplePosts.length} sample posts into the database successfully!`);

    mongoose.connection.close();
    console.log("Database connection closed. Seeding process complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
