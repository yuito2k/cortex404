export type ChapterEntry = { en: string; bn: string }
export type SubjectEntry = { en: string; bn: string; chapters: ChapterEntry[] }
export type Curriculum = Record<string, SubjectEntry[]>

export const curriculum: Curriculum = {
    HSC: [
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