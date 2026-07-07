import React, { createContext, useState, useContext } from 'react';

const LangContext = createContext();

const translations = {
  en: {
    siteTitle: 'Sarkari Update Hub',
    siteSubTitle: 'Latest Government Jobs, Results, Admit Cards & Exam Dates',
    home: 'Home',
    jobs: 'Jobs',
    results: 'Results',
    admitCard: 'Admit Card',
    admitCards: 'Admit Cards',
    examDates: 'Exam Dates',
    admission: 'Admission',
    answerKey: 'Answer Key',
    about: 'About',
    contact: 'Contact',
    disclaimer: 'Disclaimer',
    applyNow: 'Apply Now',
    officialWebsite: 'Official Website',
    downloadPdf: 'Download PDF',
    notificationDate: 'Notification Date',
    applicationStart: 'Application Start Date',
    lastDateToApply: 'Last Date to Apply',
    examDate: 'Exam Date',
    resultDate: 'Result Date',
    eligibility: 'Eligibility',
    applicationFee: 'Application Fee',
    organization: 'Organization',
    category: 'Category',
    importantDates: 'Important Dates',
    searchPlaceholder: 'Search jobs, results, exams...',
    searchButton: 'Search',
    subscribeTitle: 'Get Instant Updates in Your Inbox',
    subscribeSub: 'Subscribe to our newsletter to receive the latest government job alerts daily.',
    emailPlaceholder: 'Enter your email address',
    subscribeBtn: 'Subscribe',
    newBadge: 'New',
    statusActive: 'Active',
    statusClosed: 'Closed',
    activeAlerts: 'Active Alerts',
    noPostsFound: 'No alerts found in this category.',
    loading: 'Loading updates...',
    viewDetails: 'View Details',
    disclaimerText: 'Note: Please check and verify all details on the official website or advertisement PDF before applying.',
    postDetails: 'Announcement Details',
    adminLogin: 'Admin Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    adminPanel: 'Admin Panel',
  },
  hi: {
    siteTitle: 'सरकारी अपडेट हब',
    siteSubTitle: 'नवीनतम सरकारी नौकरियां, परिणाम, प्रवेश पत्र और परीक्षा तिथियां',
    home: 'होम',
    jobs: 'नौकरियां',
    results: 'परिणाम',
    admitCard: 'प्रवेश पत्र',
    admitCards: 'प्रवेश पत्र',
    examDates: 'परीक्षा तिथियां',
    admission: 'प्रवेश',
    answerKey: 'उत्तर कुंजी',
    about: 'हमारे बारे में',
    contact: 'संपर्क करें',
    disclaimer: 'अस्वीकरण',
    applyNow: 'आवेदन करें',
    officialWebsite: 'आधिकारिक वेबसाइट',
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    notificationDate: 'अधिसूचना तिथि',
    applicationStart: 'आवेदन शुरू होने की तिथि',
    lastDateToApply: 'आवेदन करने की अंतिम तिथि',
    examDate: 'परीक्षा तिथि',
    resultDate: 'परिणाम तिथि',
    eligibility: 'योग्यता',
    applicationFee: 'आवेदन शुल्क',
    organization: 'संगठन',
    category: 'श्रेणी',
    importantDates: 'महत्वपूर्ण तिथियां',
    searchPlaceholder: 'नौकरियां, परिणाम, परीक्षाएं खोजें...',
    searchButton: 'खोजें',
    subscribeTitle: 'अपने इनबॉक्स में तुरंत अपडेट प्राप्त करें',
    subscribeSub: 'नवीनतम सरकारी नौकरियों के अलर्ट रोजाना प्राप्त करने के लिए हमारे न्यूज़लेटर को सब्सक्राइब करें।',
    emailPlaceholder: 'अपना ईमेल पता दर्ज करें',
    subscribeBtn: 'सब्सक्राइब करें',
    newBadge: 'नया',
    statusActive: 'सक्रिय',
    statusClosed: 'बंद',
    activeAlerts: 'सक्रिय अलर्ट',
    noPostsFound: 'इस श्रेणी में कोई अलर्ट नहीं मिला।',
    loading: 'अपडेट लोड हो रहे हैं...',
    viewDetails: 'विवरण देखें',
    disclaimerText: 'नोट: कृपया आवेदन करने से पहले आधिकारिक वेबसाइट या विज्ञापन पीडीएफ पर सभी विवरणों की जांच और सत्यापन करें।',
    postDetails: 'अधिसूचना विवरण',
    adminLogin: 'एडमिन लॉगिन',
    logout: 'लॉगआउट',
    dashboard: 'डैशबोर्ड',
    adminPanel: 'एडमिन पैनल',
  }
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sarkari_lang') || 'en';
  });

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('sarkari_lang', next);
      return next;
    });
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
