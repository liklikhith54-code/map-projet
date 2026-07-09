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
    vacancies: 1056,
    salary: "₹56,100 - ₹1,77,500",
    qualification: ["Graduate"],
    jobLocation: "Central Govt",
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
    vacancies: 7500,
    salary: "₹35,400 - ₹1,12,400",
    qualification: ["Graduate"],
    jobLocation: "Central Govt",
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
    vacancies: 37500,
    salary: "Not Applicable",
    qualification: ["Graduate"],
    jobLocation: "Bihar",
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
    vacancies: 4455,
    salary: "₹36,000 - ₹47,920",
    qualification: ["Graduate"],
    jobLocation: "Central Govt",
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
    vacancies: 200000,
    salary: "Not Applicable",
    qualification: ["Graduate"],
    jobLocation: "Uttar Pradesh",
    status: "Active"
  },
  {
    title: "RRB NTPC (Non-Technical Popular Categories) Exam Schedule Announcement",
    category: "Exam Date",
    organization: "Railway Recruitment Board (RRB)",
    description: "Railway Recruitment Boards (RRBs) have announced the tentative timeline and exam dates for the RRB NTPC Stage 1 Computer Based Test (CBT-1) recruitment. Candidates who registered for vacancies of State Master, Goods Guard, Junior Clerk, etc., can check their exam date outlines.",
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
    vacancies: 11558,
    salary: "₹19,900 - ₹35,400",
    qualification: ["12th", "Graduate"],
    jobLocation: "Central Govt",
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
    vacancies: 0,
    salary: "Not Applicable",
    qualification: ["Graduate", "B.Ed"],
    jobLocation: "Central Govt",
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
    vacancies: 26146,
    salary: "₹21,700 - ₹69,100",
    qualification: ["10th"],
    jobLocation: "Central Govt",
    status: "Active"
  },
  {
    title: "Karnataka State Police (KSP) Sub-Inspector Recruitment 2026",
    category: "Job",
    organization: "KSP",
    description: "Karnataka State Police (KSP) invites online applications for the recruitment of Police Sub-Inspectors (Civil) in the State Police Force. Selected candidates will undergo comprehensive training.",
    importantDates: {
      notificationDate: new Date("2026-06-15T00:00:00.000Z"),
      applicationStartDate: new Date("2026-06-20T00:00:00.000Z"),
      applicationLastDate: new Date("2026-07-20T17:00:00.000Z"),
      examDate: new Date("2026-09-30T00:00:00.000Z"),
      resultDate: null
    },
    eligibility: "Bachelor's Degree in any discipline from a UGC recognized university. Age: 21 to 30 years (relaxations apply for OBC/SC/ST).",
    applicationFee: "General / OBC: ₹500 | SC / ST: ₹250",
    officialLink: "https://ksp.karnataka.gov.in",
    pdfLink: "https://ksp.karnataka.gov.in/pdf/PSI_Civil_Notification_2026.pdf",
    vacancies: 402,
    salary: "₹37,900 - ₹70,850",
    qualification: ["Graduate"],
    jobLocation: "Karnataka",
    status: "Active"
  },
  {
    title: "Tamil Nadu Public Service Commission (TNPSC) Group 4 Recruitment 2026",
    category: "Job",
    organization: "TNPSC",
    description: "TNPSC invites applications for Direct Recruitment to the posts included in Combined Civil Services Examination - IV (Group-IV Services) to fill vacancies in various departments of the Tamil Nadu Government.",
    importantDates: {
      notificationDate: new Date("2026-07-01T00:00:00.000Z"),
      applicationStartDate: new Date("2026-07-05T00:00:00.000Z"),
      applicationLastDate: new Date("2026-08-04T23:59:00.000Z"),
      examDate: new Date("2026-10-25T00:00:00.000Z"),
      resultDate: null
    },
    eligibility: "Must have passed S.S.L.C (Class 10) Public Examination or its equivalent with eligibility for admission to Higher Secondary Courses.",
    applicationFee: "One-Time Registration: ₹150 | Examination Fee: ₹100",
    officialLink: "https://www.tnpsc.gov.in",
    pdfLink: "https://www.tnpsc.gov.in/pdf/TNPSC_Group4_Notification_2026.pdf",
    vacancies: 6244,
    salary: "₹19,500 - ₹71,900",
    qualification: ["10th"],
    jobLocation: "Tamil Nadu",
    status: "Active"
  },
  {
    title: "MAHA-METRO Pune & Nagpur Engineer & Technician Recruitment 2026",
    category: "Job",
    organization: "MAHA-METRO",
    description: "MAHA-METRO invites online applications from eligible Indian citizens for various supervisory and non-supervisory posts including Station Controller, Section Engineer, and Junior Engineer.",
    importantDates: {
      notificationDate: new Date("2026-06-25T00:00:00.000Z"),
      applicationStartDate: new Date("2026-07-01T00:00:00.000Z"),
      applicationLastDate: new Date("2026-07-31T23:59:00.000Z"),
      examDate: new Date("2026-09-18T00:00:00.000Z"),
      resultDate: null
    },
    eligibility: "Three-Year Diploma in Engineering or B.Tech/B.E in Mechanical, Electrical, Electronics, or Civil discipline from a government recognized institute.",
    applicationFee: "General / OBC: ₹400 | SC / ST / PwD / Women: Nil",
    officialLink: "https://www.mahametro.org",
    pdfLink: "https://www.mahametro.org/careers/Pune_Nagpur_Recruitment_2026.pdf",
    vacancies: 134,
    salary: "₹33,000 - ₹1,25,000",
    qualification: ["Graduate"],
    jobLocation: "Maharashtra",
    status: "Active"
  },
  {
    title: "West Bengal Health Board (WBHRB) Staff Nurse Recruitment 2026",
    category: "Job",
    organization: "WBHRB",
    description: "West Bengal Health Recruitment Board (WBHRB) has announced vacancies for Staff Nurse Grade II in the state health services. Registered Nurses (GNM or B.Sc Nursing) can apply online.",
    importantDates: {
      notificationDate: new Date("2026-05-10T00:00:00.000Z"),
      applicationStartDate: new Date("2026-05-15T00:00:00.000Z"),
      applicationLastDate: new Date("2026-06-15T20:00:00.000Z"),
      examDate: new Date("2026-08-05T00:00:00.000Z"),
      resultDate: new Date("2026-09-10T00:00:00.000Z")
    },
    eligibility: "General Nursing & Midwifery (GNM) or Basic B.Sc. Nursing from a recognized Nursing Council. Must be registered with the West Bengal Nursing Council.",
    applicationFee: "Application processing: ₹210",
    officialLink: "https://www.wbhrb.in",
    pdfLink: "",
    vacancies: 1200,
    salary: "₹28,900 - ₹37,600",
    qualification: ["Graduate"],
    jobLocation: "West Bengal",
    status: "Active"
  },
  {
    title: "Google Software Engineer (SWE-I) Off-Campus Recruitment 2026",
    category: "Job",
    organization: "Google",
    description: "Google India is hiring Software Engineers for its engineering centers in Bangalore and Hyderabad. Candidates will work on large-scale infrastructure, application frameworks, and cutting-edge machine learning services.",
    importantDates: {
      notificationDate: new Date("2026-07-01T00:00:00.000Z"),
      applicationStartDate: new Date("2026-07-02T00:00:00.000Z"),
      applicationLastDate: new Date("2026-07-28T23:59:00.000Z"),
      examDate: new Date("2026-08-15T00:00:00.000Z"),
      resultDate: null
    },
    eligibility: "Bachelor's, Master's, or PhD in Computer Science or related technical field, or equivalent practical experience. Solid programming skills in Java, C++, Python, or Go.",
    applicationFee: "Nil (Free to Apply)",
    officialLink: "https://careers.google.com",
    pdfLink: "",
    vacancies: 150,
    salary: "₹18,00,000 - ₹32,00,000",
    qualification: ["Graduate"],
    jobLocation: "Karnataka",
    status: "Active"
  },
  {
    title: "TCS National Qualifier Test (NQT) 2026 Registration Drive",
    category: "Job",
    organization: "TCS",
    description: "Tata Consultancy Services (TCS) announces registration for TCS NQT 2026. TCS NQT evaluates candidates on cognitive skills, professional skills, and coding abilities, opening doors to top IT job roles in TCS (Ninja & Digital) and 200+ partner corporations.",
    importantDates: {
      notificationDate: new Date("2026-06-15T00:00:00.000Z"),
      applicationStartDate: new Date("2026-06-18T00:00:00.000Z"),
      applicationLastDate: new Date("2026-07-25T23:59:00.000Z"),
      examDate: new Date("2026-08-10T00:00:00.000Z"),
      resultDate: new Date("2026-08-30T00:00:00.000Z")
    },
    eligibility: "UG/PG/Diploma students in pre-final or final year (Batch 2026 & 2027) of any discipline from recognized colleges in India.",
    applicationFee: "Nil for off-campus direct entries | ₹999 for advanced specialization certificates",
    officialLink: "https://www.tcs.com/careers",
    pdfLink: "",
    vacancies: 15000,
    salary: "₹3,36,000 - ₹7,00,000",
    qualification: ["Graduate"],
    jobLocation: "Central Govt",
    status: "Active"
  },
  {
    title: "Microsoft Azure Cloud Support Engineer Recruitment 2026",
    category: "Job",
    organization: "Microsoft",
    description: "Microsoft is seeking Azure Cloud Engineers to join the Cloud Support & Infrastructure operations. This role focuses on helping customers build, deploy, and manage robust enterprise applications in the cloud.",
    importantDates: {
      notificationDate: new Date("2026-07-03T00:00:00.000Z"),
      applicationStartDate: new Date("2026-07-05T00:00:00.000Z"),
      applicationLastDate: new Date("2026-07-30T23:59:00.000Z"),
      examDate: new Date("2026-08-20T00:00:00.000Z"),
      resultDate: null
    },
    eligibility: "Degree in Engineering, IT, or Computer Science. Familiarity with networking concepts, OS fundamentals, and Azure cloud computing essentials.",
    applicationFee: "Nil (Free to Apply)",
    officialLink: "https://careers.microsoft.com",
    pdfLink: "",
    vacancies: 80,
    salary: "₹15,00,000 - ₹28,00,000",
    qualification: ["Graduate"],
    jobLocation: "Maharashtra",
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
