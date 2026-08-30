export type ChapterEntry = { en: string; bn: string }
export type SubjectEntry = { en: string; bn: string; chapters: ChapterEntry[] }
export type Curriculum = Record<string, SubjectEntry[]>

export const curriculum: Curriculum = {
    "HSC Science": [
        {
            en: 'ICT',
            bn: 'তথ্য ও যোগাযোগ প্রযুক্তি',
            chapters: [
                { en: 'ICT in the World and Bangladesh Context', bn: 'তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত' },
                { en: 'Communication Systems and Networking', bn: 'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং' },
                { en: 'Number Systems and Digital Devices', bn: 'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস' },
                { en: 'Introduction to Web Design and HTML', bn: 'ওয়েব ডিজাইন পরিচিতি এবং HTML' },
                { en: 'Programming Language', bn: 'প্রোগ্রামিং ভাষা' },
                { en: 'Database Management System', bn: 'ডেটাবেজ ম্যানেজমেন্ট সিস্টেম' },
            ]
        },
        {
            en: 'Physics 1st Paper',
            bn: 'পদার্থবিজ্ঞান ১ম পত্র',
            chapters: [
                { en: 'Physical World and Measurement', bn: 'ভৌত জগৎ ও পরিমাপ' },
                { en: 'Vectors', bn: 'ভেক্টর' },
                { en: 'Kinematics', bn: 'গতিবিদ্যা' },
                { en: 'Newtonian Mechanics', bn: 'নিউটনীয় বলবিদ্যা' },
                { en: 'Work, Energy and Power', bn: 'কাজ, শক্তি ও ক্ষমতা' },
                { en: 'Gravitation', bn: 'মহাকর্ষ ও অভিকর্ষ' },
                { en: 'Properties of Matter', bn: 'পদার্থের গাঠনিক ধর্ম' },
                { en: 'Periodic Motion', bn: 'পর্যায়বৃত্ত গতি' },
                { en: 'Waves', bn: 'তরঙ্গ' },
                { en: 'Ideal Gas and Kinetic Theory', bn: 'আদর্শ গ্যাস ও গতি তত্ত্ব' },
            ]
        },
        {
            en: 'Physics 2nd Paper',
            bn: 'পদার্থবিজ্ঞান ২য় পত্র',
            chapters: [
                { en: 'Thermodynamics', bn: 'তাপগতিবিদ্যা' },
                { en: 'Electrostatics', bn: 'স্থির তড়িৎ' },
                { en: 'Current Electricity', bn: 'চল তড়িৎ' },
                { en: 'Magnetic Effects of Current and Magnetism', bn: 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব' },
                { en: 'Electromagnetic Induction and Alternating Current', bn: 'তড়িৎচুম্বকীয় আবেশ ও পরিবর্তী প্রবাহ' },
                { en: 'Geometrical Optics', bn: 'জ্যামিতিক আলোকবিজ্ঞান' },
                { en: 'Physical Optics', bn: 'ভৌত আলোকবিজ্ঞান' },
                { en: 'Introduction to Modern Physics', bn: 'আধুনিক পদার্থবিজ্ঞানের সূচনা' },
                { en: 'Atomic Model and Nuclear Physics', bn: 'পারমাণবিক মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান' },
                { en: 'Semiconductor and Electronics', bn: 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স' },
                { en: 'Astronomy', bn: 'জ্যোতির্বিজ্ঞান' },
            ]
        },
        {
            en: 'Chemistry 1st Paper',
            bn: 'রসায়ন ১ম পত্র',
            chapters: [
                { en: 'Safe Use of Laboratory', bn: 'ল্যাবরেটরির নিরাপদ ব্যবহার' },
                { en: 'Qualitative Chemistry', bn: 'গুণগত রসায়ন' },
                { en: 'Periodic Properties and Bonding in Elements', bn: 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন' },
                { en: 'Chemical Change', bn: 'রাসায়নিক পরিবর্তন' },
                { en: 'Vocational Chemistry', bn: 'কর্মমুখী রসায়ন' },
            ]
        },
        {
            en: 'Chemistry 2nd Paper',
            bn: 'রসায়ন ২য় পত্র',
            chapters: [
                { en: 'Environmental Chemistry', bn: 'পরিবেশ রসায়ন' },
                { en: 'Organic Chemistry', bn: 'জৈব রসায়ন' },
                { en: 'Stoichiometric Chemistry', bn: 'পরিমাণগত রসায়ন' },
                { en: 'Electrochemistry', bn: 'তড়িৎ রসায়ন' },
                { en: 'Economic Chemistry', bn: 'অর্থনৈতিক রসায়ন' },
            ]
        },
        {
            en: 'Mathematics 1st Paper',
            bn: 'গণিত ১ম পত্র',
            chapters: [
                { en: 'Matrices and Determinants', bn: 'ম্যাট্রিক্স ও নির্ণায়ক' },
                { en: 'Vector', bn: 'ভেক্টর' },
                { en: 'Straight Lines', bn: 'সরলরেখা' },
                { en: 'Circle', bn: 'বৃত্ত' },
                { en: 'Permutation and Combination', bn: 'বিন্যাস ও সমাবেশ' },
                { en: 'Trigonometric Ratios', bn: 'ত্রিকোণমিতিক অনুপাত' },
                { en: 'Compound Angles', bn: 'সংযুক্ত কোণ' },
                { en: 'Function and Graph', bn: 'ফাংশন ও লেখচিত্র' },
                { en: 'Differentiation', bn: 'অন্তরীকরণ' },
                { en: 'Integration', bn: 'যোগজীকরণ' },
            ]
        },
        {
            en: 'Mathematics 2nd Paper',
            bn: 'গণিত ২য় পত্র',
            chapters: [
                { en: 'Real Numbers and Inequalities', bn: 'বাস্তব সংখ্যা ও অসমতা' },
                { en: 'Complex Numbers', bn: 'জটিল সংখ্যা' },
                { en: 'Polynomials and Equations', bn: 'বহুপদী সমীকরণ' },
                { en: 'Binomial Expansion', bn: 'দ্বিপদী বিস্তৃতি' },
                { en: 'Conic Sections', bn: 'কনিক' },
                { en: 'Inverse Trigonometric Functions and Equations', bn: 'বিপরীত ত্রিকোণমিতিক ফাংশন' },
                { en: 'Statics', bn: 'স্থিতিবিদ্যা' },
                { en: 'Dynamics', bn: 'গতিবিদ্যা' },
                { en: 'Probability', bn: 'সম্ভাবনা' },
                { en: 'Statistics', bn: 'পরিসংখ্যান' },
            ]
        },
        {
            en: 'Botany',
            bn: 'উদ্ভিদবিজ্ঞান',
            chapters: [
                { en: 'Cell and Its Structure', bn: 'কোষ ও কোষের গঠন' },
                { en: 'Cell Division', bn: 'কোষ বিভাজন' },
                { en: 'Microorganisms', bn: 'অণুজীব' },
                { en: 'Algae and Fungi', bn: 'শৈবাল ও ছত্রাক' },
                { en: 'Bryophytes and Pteridophytes', bn: 'ব্রায়োফাইটা ও টেরিডোফাইটা' },
                { en: 'Gymnosperms and Angiosperms', bn: 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ' },
                { en: 'Tissue and Tissue System', bn: 'টিস্যু ও টিস্যুতন্ত্র' },
                { en: 'Plant Physiology', bn: 'উদ্ভিদের শারীরতত্ত্ব' },
                { en: 'Plant Reproduction', bn: 'উদ্ভিদের প্রজনন' },
                { en: 'Biotechnology', bn: 'জীবপ্রযুক্তি' },
            ]
        },
        {
            en: 'Zoology',
            bn: 'প্রাণিবিজ্ঞান',
            chapters: [
                { en: 'Animal Diversity and Classification', bn: 'প্রাণীর বৈচিত্র্য ও শ্রেণিবিন্যাস' },
                { en: 'Animal Identity', bn: 'প্রাণীর পরিচিতি' },
                { en: 'Digestion and Absorption', bn: 'পরিপাক ও শোষণ' },
                { en: 'Blood & Circulation', bn: 'রক্ত ও সঞ্চালন' },
                { en: 'Respiration & Breathing', bn: 'শ্বসন ও শ্বাসক্রিয়া' },
                { en: 'Wastes & Elimination', bn: 'বর্জ্য ও নিষ্কাশন' },
                { en: 'Locomotion & Movement', bn: 'চলন ও অঙ্গচালনা' },
                { en: 'Coordination & Control', bn: 'সমন্বয় ও নিয়ন্ত্রণ' },
                { en: 'Continuation of Human Life', bn: 'মানব জীবনের ধারাবাহিকতা' },
                { en: 'Protection of Human Body', bn: 'মানবদেহের প্রতিরক্ষা' },
                { en: 'Genetics and Evolution', bn: 'জিনতত্ত্ব ও বিবর্তন' },
                { en: 'Animal Behavior', bn: 'প্রাণীর আচরণ' },
            ]
        },
        // --- paste your other HSC subjects below this line ---
        // {
        //   en: 'Physics', bn: 'পদার্থবিজ্ঞান',
        //   chapters: [
        //     { en: 'Newtonian Mechanics', bn: 'নিউটনিয়ান মেকানিক্স' },
        //     ...
        //   ]
        // },
    ],

    SSC: [
        // { en: 'ICT', bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', chapters: [...] },
    ],

    Medical: [],
    BUET: [],
    DU: [],
    BCS: [],
    Bank: [],
}