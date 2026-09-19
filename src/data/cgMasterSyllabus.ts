export interface SyllabusChapter {
  id: string;
  name: string;
  nameHindi: string;
  subTopics: string[];
}

export interface SyllabusModule {
  id: string;
  name: string;
  nameHindi: string;
  chapters: SyllabusChapter[];
}

export const CG_MASTER_SYLLABUS: SyllabusModule[] = [
  {
    id: 'cg_special',
    name: 'Chhattisgarh Special (General Knowledge)',
    nameHindi: 'छत्तीसगढ़ सामान्य ज्ञान एवं इतिहास',
    chapters: [
      {
        id: 'cg-his-01',
        name: 'Ancient Dynasties (Sharabhapuriya, Pandu, Somvanshi)',
        nameHindi: 'प्राचीन राजवंश (शरभपुरीय, पाण्डु, सोमवंश)',
        subTopics: ['Sirpur Lakshman Temple', 'Tivaradeva', 'Prasannamatra', 'Inscriptions']
      },
      {
        id: 'cg-his-02',
        name: 'Kalchuri Dynasty & Ratanpur/Raipur Branch',
        nameHindi: 'कलचुरी राजवंश एवं रतनपुर/रायपुर शाखा',
        subTopics: ['Kalingaraj', 'Ratanpur Capital', 'Garh System (18 Garhs)', 'Revenue System', 'Temples']
      },
      {
        id: 'cg-his-03',
        name: 'Maratha Administration, Suba System & British Rule',
        nameHindi: 'मराठा सूबा शासन एवं ब्रिटिश संरक्षण काल',
        subTopics: ['Suba System (Vithal Dinkar)', 'Agnew Administration', 'Tahutdari System', 'Capital shifted to Raipur 1818']
      },
      {
        id: 'cg-his-04',
        name: 'Freedom Struggle & Tribal Revolts in Chhattisgarh',
        nameHindi: 'स्वतंत्रता संग्राम एवं जनजाति विद्रोह',
        subTopics: ['Halba Revolt 1774', 'Tarapur Revolt', 'Meria Revolt', 'Koi Revolt 1859', 'Bhumkal 1910 (Gunda Dhur)', 'Veer Narayan Singh 1857']
      },
      {
        id: 'cg-geo-01',
        name: 'Geography, River Basins & Dams of Chhattisgarh',
        nameHindi: 'भौगोलिक स्थिति, अपवाह तंत्र (महानदी, शिवनाथ) एवं बांध',
        subTopics: ['Mahanadi Drainage', 'Hasdeo Bango Dam', 'Gangrel Dam', 'Chitrakote Falls', 'Mainpat']
      },
      {
        id: 'cg-tribal-01',
        name: 'Tribal Culture, Customs, Ghotul & Folk Dances',
        nameHindi: 'जनजाति संस्कृति, परम्पराएं, घोटुल एवं लोक नृत्य',
        subTopics: ['Gond Tribes', 'Baiga PVTG', 'Bastar Dussehra (75 Days)', 'Ghotul System', 'Panthi Dance', 'Pandwani', 'Karma']
      },
      {
        id: 'cg-panch-01',
        name: 'Panchayati Raj & Urban Local Bodies (CG Act 1993)',
        nameHindi: 'पंचायती राज अधिनियम 1993 एवं नगरीय निकाय',
        subTopics: ['Gram Sabha Quorum', '73rd Amendment', 'Gram Panchayat Powers', 'PESA Act 1996 in CG']
      },
      {
        id: 'cg-lang-01',
        name: 'Chhattisgarhi Language, Grammar, Proverbs (Hana)',
        nameHindi: 'छत्तीसगढ़ी भाषा, व्याकरण, मुहावरे एवं हाना-लोकोक्तियां',
        subTopics: ['Chhattisgarhi Hana', 'Grammar and Verb conjugation', 'Famous Authors & Poets']
      },
      {
        id: 'cg-econ-01',
        name: 'State Economy, Mineral Resources & Welfare Schemes',
        nameHindi: 'अर्थव्यवस्था, खनिज संसाधन (कोयला, लौह) एवं जनकल्याणकारी योजनाएं',
        subTopics: ['Bailadila Iron Ore', 'Korba Coalfields', 'Godhan Nyay Yojana', 'Rajiv Gandhi Kisan Nyay', 'Mahtari Vandan Yojana']
      }
    ]
  },
  {
    id: 'computer',
    name: 'Computer Knowledge (Vyapam Specific)',
    nameHindi: 'कम्प्यूटर ज्ञान एवं अनुप्रयोग (व्यापम विशेष)',
    chapters: [
      {
        id: 'comp-01',
        name: 'Computer Fundamentals & Hardware Architecture',
        nameHindi: 'कम्प्यूटर संरचना, CPU, ALU एवं मेमोरी (RAM/ROM)',
        subTopics: ['Input/Output Devices', 'Generations of Computer', 'System Bus', 'Cache Memory']
      },
      {
        id: 'comp-02',
        name: 'Operating Systems (Windows, Linux, Android)',
        nameHindi: 'ऑपरेटिंग सिस्टम एवं फाइल प्रबंधन',
        subTopics: ['Kernel', 'MS DOS Commands', 'File Extensions', 'Multi-tasking']
      },
      {
        id: 'comp-03',
        name: 'MS Office (Word, Excel, PowerPoint Shortcuts)',
        nameHindi: 'माइक्रोसॉफ्ट ऑफिस (Word, Excel, PPT) एवं शॉर्टकट कीज',
        subTopics: ['Excel Formulas (VLOOKUP, SUMIF)', 'Word Formatting', 'PowerPoint Transitions']
      },
      {
        id: 'comp-04',
        name: 'Computer Viruses, Antivirus & Cyber Security',
        nameHindi: 'कम्प्यूटर वायरस, मैलवेयर, एंटीवायरस एवं साइबर सुरक्षा',
        subTopics: ['Trojan Horse', 'Worms', 'Ransomware', 'Firewall', 'Phishing']
      },
      {
        id: 'comp-05',
        name: 'Internet, Networking, Email & Search Engines',
        nameHindi: 'इंटरनेट, वेब ब्राउज़र, सर्च इंजन एवं ईमेल प्रोटोकॉल्स',
        subTopics: ['HTTP/HTTPS', 'TCP/IP', 'DNS', 'SMTP/POP3', 'Search Engine Algorithms']
      }
    ]
  },
  {
    id: 'aptitude_reasoning',
    name: 'Quantitative Aptitude & Logical Reasoning',
    nameHindi: 'गणित एवं तार्किक तर्कशक्ति (Aptitude & Reasoning)',
    chapters: [
      {
        id: 'math-01',
        name: 'Number System, HCF/LCM & Simplification',
        nameHindi: 'संख्या पद्धति, ल.स./म.स. एवं सरलीकरण',
        subTopics: ['Divisibility Rules', 'Surds and Indices', 'Fractions', 'BODMAS']
      },
      {
        id: 'math-02',
        name: 'Percentage, Profit-Loss & Simple/Compound Interest',
        nameHindi: 'प्रतिशत, लाभ-हानि एवं साधारण/चक्रवृद्धि ब्याज',
        subTopics: ['Discount', 'Compound Interest Formulas', 'Successive Percentage']
      },
      {
        id: 'math-03',
        name: 'Time & Work, Pipes & Cisterns, Speed-Distance-Train',
        nameHindi: 'समय एवं कार्य, पाइप-टंकी, चाल-दूरी एवं रेलगाड़ी',
        subTopics: ['Relative Speed', 'Efficiency ratio', 'Boat & Stream']
      },
      {
        id: 'reas-01',
        name: 'Series, Coding-Decoding & Blood Relations',
        nameHindi: 'श्रृंखला, कोडिंग-डिकोडिंग एवं रक्त संबंध',
        subTopics: ['Number Series', 'Letter Coding', 'Family Tree Relations']
      },
      {
        id: 'reas-02',
        name: 'Syllogism, Venn Diagrams & Direction Sense',
        nameHindi: 'न्याय निगमन (Syllogism), वेन आरेख एवं दिशा ज्ञान',
        subTopics: ['Statements & Conclusions', 'Distance and directions']
      }
    ]
  },
  {
    id: 'general_studies',
    name: 'Indian General Studies & Constitution',
    nameHindi: 'भारत का सामान्य अध्ययन एवं संविधान',
    chapters: [
      {
        id: 'gs-polity-01',
        name: 'Indian Constitution, Fundamental Rights & Parliament',
        nameHindi: 'भारतीय संविधान, मौलिक अधिकार (भाग 3) एवं संसद',
        subTopics: ['Preamble', 'Articles 12-35', 'President Powers', 'Supreme Court']
      },
      {
        id: 'gs-his-01',
        name: 'Modern Indian History & National Freedom Movement',
        nameHindi: 'आधुनिक भारत का इतिहास एवं राष्ट्रीय आंदोलन',
        subTopics: ['Revolt of 1857', 'Gandhian Era 1915-1947', 'Governor Generals']
      },
      {
        id: 'gs-sci-01',
        name: 'General Science, Biology, Chemistry & Physics',
        nameHindi: 'सामान्य विज्ञान (भौतिकी, रसायन, जीव विज्ञान)',
        subTopics: ['Human Anatomy & Diseases', 'Vitamins', 'Newton Laws', 'Periodic Table']
      }
    ]
  },
  {
    id: 'cdp_education',
    name: 'Child Development & Pedagogy (CDP / Atmanand)',
    nameHindi: 'बाल विकास एवं शिक्षाशास्त्र (शिक्षक/टीईटी/आत्मानंद)',
    chapters: [
      {
        id: 'cdp-01',
        name: 'Child Development Theories (Piaget, Vygotsky, Kohlberg)',
        nameHindi: 'बाल विकास सिद्धांत (पियाजे, वाइगोत्स्की, कोहलबर्ग)',
        subTopics: ['Cognitive Stages', 'Zone of Proximal Development', 'Moral Development']
      },
      {
        id: 'cdp-02',
        name: 'Inclusive Education, RTE Act 2009 & NEP 2020',
        nameHindi: 'समावेशी शिक्षा, शिक्षा का अधिकार 2009 एवं नई शिक्षा नीति 2020',
        subTopics: ['Special Needs Children', '5+3+3+4 Structure', 'Continuous Evaluation (CCE)']
      }
    ]
  }
];

export function getChapterById(chapterId: string): SyllabusChapter | undefined {
  for (const mod of CG_MASTER_SYLLABUS) {
    const found = mod.chapters.find(c => c.id === chapterId);
    if (found) return found;
  }
  return undefined;
}

export function getChaptersForModule(moduleId: string): SyllabusChapter[] {
  const mod = CG_MASTER_SYLLABUS.find(m => m.id === moduleId);
  return mod ? mod.chapters : [];
}
