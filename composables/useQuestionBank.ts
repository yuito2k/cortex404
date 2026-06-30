// composables/useQuestionBank.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all question data across:
//   - hsc-ssc-exam.vue    → uses hscSscQuestionBank
//   - engineering-exam.vue → uses engineeringQuestionBank
//   - admission-exam.vue   → uses admissionQuestionBank
//
// Each exam page replaces its inline `const questionBank = { ... }` with:
//   const { hscSscQuestionBank }     = useQuestionBank()   ← hsc-ssc-exam.vue
//   const { engineeringQuestionBank } = useQuestionBank()  ← engineering-exam.vue
//   const { admissionQuestionBank }   = useQuestionBank()  ← admission-exam.vue
//
// Future: swap the static objects below with a Supabase fetch:
//   const { data } = await supabase.from('questions').select('*').eq('stream', stream)
// ─────────────────────────────────────────────────────────────────────────────

export const useQuestionBank = () => {

  // ══════════════════════════════════════════════════════════════════════════
  // HSC / SSC QUESTION BANK
  // Used by: pages/dashboard/hsc-ssc-exam.vue
  // Key structure: { [groupKey]: { [subject]: Question[] } }
  // groupKey: hsc_science | hsc_arts | hsc_commerce | ssc_science | ssc_arts | ssc_commerce
  // ══════════════════════════════════════════════════════════════════════════
  const hscSscQuestionBank = {

    // ── HSC SCIENCE ──────────────────────────────────────────────────────────
    hsc_science: {
      physics: [
        { id: 'hs-phy-1', text: 'A body moves with uniform acceleration. Which graph of velocity vs time is a straight line?', options: ['Parabola', 'Straight line through origin', 'Horizontal line', 'Hyperbola'], answer: 1, chapter: 'Kinematics', year: '2023', difficulty: 'easy', explanation: 'With uniform acceleration, velocity increases linearly with time (v = u + at). On a v-t graph this gives a straight line. A horizontal line would mean constant velocity (zero acceleration).' },
        { id: 'hs-phy-2', text: 'The SI unit of electric charge is:', options: ['Ampere', 'Volt', 'Coulomb', 'Ohm'], answer: 2, chapter: 'Electricity', year: '2022', difficulty: 'easy', explanation: 'The Coulomb (C) is the SI unit of electric charge. One Coulomb equals the charge transferred by a current of one Ampere flowing for one second.' },
        { id: 'hs-phy-3', text: 'Which law states that the pressure of a gas is inversely proportional to its volume at constant temperature?', options: ['Charles\'s Law', 'Boyle\'s Law', 'Gay-Lussac\'s Law', 'Avogadro\'s Law'], answer: 1, chapter: 'Thermodynamics', year: '2023', difficulty: 'medium', explanation: 'Boyle\'s Law (PV = constant at constant T) states that pressure and volume of a gas are inversely proportional.' },
        { id: 'hs-phy-4', text: 'The focal length of a convex lens is positive. What does this indicate?', options: ['It is a diverging lens', 'It converges parallel rays to a point', 'It has no focal point', 'It only works in water'], answer: 1, chapter: 'Optics', year: '2022', difficulty: 'medium', explanation: 'A convex (converging) lens has a positive focal length. It refracts parallel rays so they converge at the principal focus on the other side of the lens.' },
        { id: 'hs-phy-5', text: 'Newton\'s second law of motion states that force is equal to:', options: ['mass × velocity', 'mass × acceleration', 'mass × displacement', 'mass × time'], answer: 1, chapter: 'Dynamics', year: '2023', difficulty: 'easy', explanation: 'Newton\'s 2nd Law: F = ma. Force equals mass multiplied by acceleration.' },
        { id: 'hs-phy-6', text: 'Which type of wave does not require a medium for propagation?', options: ['Sound wave', 'Water wave', 'Electromagnetic wave', 'Seismic wave'], answer: 2, chapter: 'Waves', year: '2021', difficulty: 'easy', explanation: 'Electromagnetic waves (light, radio, X-rays etc.) are transverse waves that can travel through a vacuum.' },
      ],
      chemistry: [
        { id: 'hs-chem-1', text: 'The atomic number of Carbon is:', options: ['6', '8', '12', '14'], answer: 0, chapter: 'Atomic Structure', year: '2023', difficulty: 'easy', explanation: 'Carbon (C) has atomic number 6, meaning it has 6 protons.' },
        { id: 'hs-chem-2', text: 'Which of the following is an example of an exothermic reaction?', options: ['Photosynthesis', 'Electrolysis', 'Combustion of methane', 'Dissolving ammonium nitrate'], answer: 2, chapter: 'Thermochemistry', year: '2022', difficulty: 'medium', explanation: 'Combustion releases energy as heat and light — exothermic (ΔH < 0).' },
        { id: 'hs-chem-3', text: 'What is the formula of sulphuric acid?', options: ['HCl', 'HNO₃', 'H₂SO₄', 'H₃PO₄'], answer: 2, chapter: 'Acids & Bases', year: '2023', difficulty: 'easy', explanation: 'H₂SO₄ is sulphuric acid. HCl = hydrochloric acid, HNO₃ = nitric acid.' },
        { id: 'hs-chem-4', text: 'An organic compound containing a -COOH group is called a:', options: ['Alcohol', 'Ester', 'Carboxylic acid', 'Ketone'], answer: 2, chapter: 'Organic Chemistry', year: '2022', difficulty: 'medium', explanation: 'The -COOH (carboxyl) group defines carboxylic acids.' },
        { id: 'hs-chem-5', text: 'The process of converting a liquid to vapour below its boiling point is:', options: ['Condensation', 'Sublimation', 'Evaporation', 'Distillation'], answer: 2, chapter: 'States of Matter', year: '2023', difficulty: 'easy', explanation: 'Evaporation occurs at the liquid surface at any temperature below boiling point.' },
        { id: 'hs-chem-6', text: 'Which element is the most electronegative?', options: ['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'], answer: 2, chapter: 'Periodic Table', year: '2021', difficulty: 'medium', explanation: 'Fluorine (F) is the most electronegative element (3.98 on Pauling scale).' },
      ],
      biology: [
        { id: 'hs-bio-1', text: 'Which organelle is responsible for cellular respiration?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'], answer: 2, chapter: 'Cell Biology', year: '2023', difficulty: 'easy', explanation: 'Mitochondria are the "powerhouses of the cell" where aerobic respiration occurs, producing ATP.' },
        { id: 'hs-bio-2', text: 'The process by which plants lose water through leaves is called:', options: ['Osmosis', 'Transpiration', 'Diffusion', 'Absorption'], answer: 1, chapter: 'Plant Physiology', year: '2022', difficulty: 'easy', explanation: 'Transpiration is the evaporation of water from plant leaves through stomata.' },
        { id: 'hs-bio-3', text: 'DNA replication occurs during which phase of the cell cycle?', options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'], answer: 1, chapter: 'Genetics', year: '2023', difficulty: 'medium', explanation: 'S (Synthesis) phase is when DNA replication takes place, duplicating the entire genome.' },
        { id: 'hs-bio-4', text: 'Which blood cells are responsible for immunity?', options: ['Red blood cells', 'Platelets', 'White blood cells', 'Plasma cells'], answer: 2, chapter: 'Human Physiology', year: '2022', difficulty: 'easy', explanation: 'White blood cells (leukocytes) are the immune cells.' },
      ],
      math: [
        { id: 'hs-math-1', text: 'If f(x) = x² + 3x + 2, what is f(2)?', options: ['8', '10', '12', '6'], answer: 2, chapter: 'Functions', year: '2023', difficulty: 'easy', explanation: 'f(2) = (2)² + 3(2) + 2 = 4 + 6 + 2 = 12.' },
        { id: 'hs-math-2', text: 'The value of log₁₀ 1000 is:', options: ['2', '3', '4', '10'], answer: 1, chapter: 'Logarithm', year: '2022', difficulty: 'easy', explanation: 'log₁₀ 1000 = log₁₀ 10³ = 3.' },
        { id: 'hs-math-3', text: 'The derivative of sin(x) is:', options: ['cos(x)', '-cos(x)', '-sin(x)', 'tan(x)'], answer: 0, chapter: 'Calculus', year: '2023', difficulty: 'easy', explanation: 'd/dx [sin(x)] = cos(x). This is a fundamental derivative to memorise.' },
        { id: 'hs-math-4', text: 'A quadratic equation ax²+bx+c=0 has roots given by:', options: ['(-b±√(b²-4ac))/a', '(-b±√(b²-4ac))/2a', '(b±√(b²-4ac))/2a', '(-b±√(b²+4ac))/2a'], answer: 1, chapter: 'Algebra', year: '2022', difficulty: 'medium', explanation: 'The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. The discriminant b²-4ac determines the nature of roots.' },
      ],
      english: [
        { id: 'hs-eng-1', text: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'John Milton', 'Jane Austen'], answer: 1, chapter: 'Literature', year: '2023', difficulty: 'easy', explanation: '"Romeo and Juliet" is a tragedy by William Shakespeare, written around 1594–1596.' },
        { id: 'hs-eng-2', text: 'The past participle of "break" is:', options: ['broke', 'broken', 'breaked', 'breaking'], answer: 1, chapter: 'Grammar', year: '2022', difficulty: 'easy', explanation: '"Break" is irregular. Past simple = broke; past participle = broken (used with have/had).' },
        { id: 'hs-eng-3', text: 'Choose the correct passive: "They are building a new bridge":', options: ['A new bridge is built.', 'A new bridge is being built.', 'A new bridge was being built.', 'A new bridge has been built.'], answer: 1, chapter: 'Grammar', year: '2023', difficulty: 'medium', explanation: 'Present continuous active → passive: is/are + being + past participle.' },
      ],
      ict: [
        { id: 'hs-ict-1', text: 'Which generation of computers used transistors?', options: ['First', 'Second', 'Third', 'Fourth'], answer: 1, chapter: 'Computer History', year: '2023', difficulty: 'easy', explanation: 'Second generation computers (1956-1963) used transistors instead of vacuum tubes, making them smaller and more reliable.' },
        { id: 'hs-ict-2', text: 'The full form of URL is:', options: ['Uniform Resource Locator', 'Universal Resource Locator', 'Uniform Record Locator', 'Universal Record Link'], answer: 0, chapter: 'Internet', year: '2022', difficulty: 'easy', explanation: 'URL = Uniform Resource Locator — the web address used to access resources on the internet.' },
      ],
    },

    // ── HSC ARTS ─────────────────────────────────────────────────────────────
    hsc_arts: {
      bangla: [
        { id: 'ha-ban-1', text: '"বিদ্রোহী" কবিতাটি কোন কবির রচনা?', options: ['রবীন্দ্রনাথ ঠাকুর', 'শামসুর রাহমান', 'কাজী নজরুল ইসলাম', 'সুফিয়া কামাল'], answer: 2, chapter: 'বাংলা কবিতা', year: '2023', difficulty: 'easy', explanation: '"বিদ্রোহী" কবিতাটি কাজী নজরুল ইসলাম ১৯২১ সালে রচনা করেন।' },
        { id: 'ha-ban-2', text: '"রবীন্দ্রনাথ ঠাকুর" কোন সালে নোবেল পুরস্কার পান?', options: ['১৯১১', '১৯১৩', '১৯১৫', '১৯২০'], answer: 1, chapter: 'বাংলা সাহিত্য', year: '2022', difficulty: 'easy', explanation: 'রবীন্দ্রনাথ ঠাকুর ১৯১৩ সালে সাহিত্যে নোবেল পুরস্কার লাভ করেন — প্রথম এশীয় নোবেলজয়ী।' },
        { id: 'ha-ban-3', text: 'বাংলা ভাষায় মৌলিক স্বরধ্বনি কয়টি?', options: ['৫টি', '৬টি', '৭টি', '৮টি'], answer: 2, chapter: 'ব্যাকরণ', year: '2023', difficulty: 'medium', explanation: 'বাংলা ভাষায় মৌলিক স্বরধ্বনি ৭টি: অ, আ, ই, উ, এ, ও, অ্যা।' },
        { id: 'ha-ban-4', text: '"পথের পাঁচালী" উপন্যাসটি কার রচনা?', options: ['রবীন্দ্রনাথ ঠাকুর', 'মানিক বন্দ্যোপাধ্যায়', 'বিভূতিভূষণ বন্দ্যোপাধ্যায়', 'শরৎচন্দ্র চট্টোপাধ্যায়'], answer: 2, chapter: 'উপন্যাস', year: '2022', difficulty: 'easy', explanation: '"পথের পাঁচালী" বিভূতিভূষণ বন্দ্যোপাধ্যায় রচিত বিখ্যাত উপন্যাস (১৯২৯)।' },
      ],
      english: [
        { id: 'ha-eng-1', text: 'Who wrote "Hamlet"?', options: ['Charles Dickens', 'William Shakespeare', 'John Keats', 'George Orwell'], answer: 1, chapter: 'Literature', year: '2023', difficulty: 'easy', explanation: '"Hamlet" is a tragedy written by William Shakespeare around 1600-1601.' },
        { id: 'ha-eng-2', text: 'The past tense of "write" is:', options: ['written', 'writed', 'wrote', 'writing'], answer: 2, chapter: 'Grammar', year: '2022', difficulty: 'easy', explanation: '"Write" is an irregular verb. Simple past = "wrote". Past participle = "written".' },
        { id: 'ha-eng-3', text: 'Choose the correct passive voice: "She writes a letter":', options: ['A letter was written by her.', 'A letter is written by her.', 'A letter is being written by her.', 'A letter has been written by her.'], answer: 1, chapter: 'Grammar', year: '2023', difficulty: 'medium', explanation: 'Simple present active "writes" → simple present passive "is written".' },
      ],
      history: [
        { id: 'ha-his-1', text: 'মুক্তিযুদ্ধের সময় বাংলাদেশ কতটি সেক্টরে বিভক্ত ছিল?', options: ['৯টি', '১০টি', '১১টি', '১২টি'], answer: 2, chapter: 'বাংলাদেশের ইতিহাস', year: '2023', difficulty: 'easy', explanation: '১৯৭১ সালের মুক্তিযুদ্ধে বাংলাদেশকে মোট ১১টি সেক্টরে বিভক্ত করা হয়।' },
        { id: 'ha-his-2', text: 'ছয় দফা কর্মসূচি কোন সালে ঘোষণা করা হয়?', options: ['১৯৬৪', '১৯৬৬', '১৯৬৮', '১৯৭০'], answer: 1, chapter: 'রাজনৈতিক ইতিহাস', year: '2022', difficulty: 'medium', explanation: '১৯৬৬ সালে শেখ মুজিবুর রহমান ছয় দফা দাবি উত্থাপন করেন।' },
      ],
      civics: [
        { id: 'ha-civ-1', text: 'বাংলাদেশের সংবিধান কত সালে প্রণীত হয়?', options: ['১৯৭১', '১৯৭২', '১৯৭৩', '১৯৭৫'], answer: 1, chapter: 'সংবিধান', year: '2023', difficulty: 'easy', explanation: 'বাংলাদেশের সংবিধান ১৯৭২ সালের ৪ নভেম্বর গণপরিষদে গৃহীত হয়।' },
        { id: 'ha-civ-2', text: 'জাতীয় সংসদে মোট আসন সংখ্যা কত?', options: ['২৫০', '৩০০', '৩৫০', '৪০০'], answer: 2, chapter: 'সংসদীয় ব্যবস্থা', year: '2022', difficulty: 'medium', explanation: 'বাংলাদেশের জাতীয় সংসদে মোট ৩৫০টি আসন — ৩০০টি সাধারণ + ৫০টি সংরক্ষিত মহিলা আসন।' },
      ],
      economics: [
        { id: 'ha-eco-1', text: 'চাহিদার সূত্র অনুযায়ী দাম বাড়লে চাহিদা:', options: ['বাড়ে', 'কমে', 'অপরিবর্তিত থাকে', 'অনিশ্চিত'], answer: 1, chapter: 'চাহিদা ও যোগান', year: '2023', difficulty: 'easy', explanation: 'চাহিদার সূত্র অনুযায়ী দাম ও চাহিদার মধ্যে বিপরীত সম্পর্ক রয়েছে।' },
        { id: 'ha-eco-2', text: 'GDP এর পূর্ণরূপ কী?', options: ['Gross Domestic Product', 'General Domestic Product', 'Gross Development Product', 'Gross Domestic Price'], answer: 0, chapter: 'জাতীয় আয়', year: '2022', difficulty: 'easy', explanation: 'GDP = Gross Domestic Product — একটি নির্দিষ্ট সময়কালে দেশের মধ্যে উৎপাদিত সব পণ্য ও সেবার মোট বাজারমূল্য।' },
      ],
      ict: [
        { id: 'ha-ict-1', text: 'www stands for:', options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'], answer: 0, chapter: 'Internet', year: '2023', difficulty: 'easy', explanation: 'WWW = World Wide Web, invented by Tim Berners-Lee in 1989.' },
        { id: 'ha-ict-2', text: 'RAM stands for:', options: ['Read Access Memory', 'Random Access Memory', 'Remote Access Memory', 'Rapid Access Memory'], answer: 1, chapter: 'Hardware', year: '2022', difficulty: 'easy', explanation: 'RAM = Random Access Memory. Short-term working memory, volatile.' },
      ],
    },

    // ── HSC COMMERCE ─────────────────────────────────────────────────────────
    hsc_commerce: {
      accounting: [
        { id: 'hc-acc-1', text: 'The accounting equation is:', options: ['Assets = Liabilities + Owner\'s Equity', 'Assets = Liabilities − Owner\'s Equity', 'Assets + Liabilities = Owner\'s Equity', 'Assets = Owner\'s Equity − Liabilities'], answer: 0, chapter: 'Accounting Fundamentals', year: '2023', difficulty: 'easy', explanation: 'Assets = Liabilities + Owner\'s Equity. Everything a business owns is financed either by creditors or owners.' },
        { id: 'hc-acc-2', text: 'Depreciation is charged on:', options: ['Current assets', 'Fixed assets', 'Intangible assets only', 'Liquid assets'], answer: 1, chapter: 'Depreciation', year: '2022', difficulty: 'medium', explanation: 'Depreciation is the systematic allocation of the cost of fixed (tangible non-current) assets.' },
        { id: 'hc-acc-3', text: 'A credit entry in accounts always indicates:', options: ['An increase in assets', 'A decrease in expenses', 'An increase in liabilities or equity', 'A decrease in revenue'], answer: 2, chapter: 'Double Entry', year: '2023', difficulty: 'medium', explanation: 'Credit increases liabilities, equity, and revenue; Debit increases assets and expenses.' },
        { id: 'hc-acc-4', text: 'Bank reconciliation statement is prepared to:', options: ['Calculate profit', 'Reconcile cash book and bank passbook', 'Prepare balance sheet', 'Record sales'], answer: 1, chapter: 'Cash Book', year: '2022', difficulty: 'easy', explanation: 'A bank reconciliation statement explains differences between the cash book balance and the bank passbook balance.' },
      ],
      business_studies: [
        { id: 'hc-bus-1', text: 'Which type of business organisation has unlimited liability?', options: ['Private limited company', 'Public limited company', 'Sole proprietorship', 'Cooperative society'], answer: 2, chapter: 'Forms of Business', year: '2023', difficulty: 'easy', explanation: 'A sole proprietor has unlimited liability — personal assets can be seized to pay business debts.' },
        { id: 'hc-bus-2', text: 'Marketing mix consists of how many Ps?', options: ['3', '4', '5', '6'], answer: 1, chapter: 'Marketing', year: '2022', difficulty: 'easy', explanation: 'The 4 Ps of marketing: Product, Price, Place, Promotion. Extended to 7 Ps with People, Process, Physical evidence.' },
      ],
      bangla: [
        { id: 'hc-ban-1', text: '"বাণিজ্য" শব্দের সন্ধি বিচ্ছেদ কোনটি?', options: ['বাণ + ইজ্য', 'বাণিজ + য', 'বাণি + জ্য', 'বাণিজ্ + য'], answer: 1, chapter: 'ব্যাকরণ', year: '2023', difficulty: 'medium', explanation: '"বাণিজ্য" শব্দের সন্ধি বিচ্ছেদ: বাণিজ + য। এটি ব্যঞ্জনসন্ধির উদাহরণ।' },
        { id: 'hc-ban-2', text: '"বাণিজ্যের" বিপরীত শব্দ কী?', options: ['ব্যবসা', 'লেনদেন', 'ভোক্তা', 'অব্যবসায়িক'], answer: 3, chapter: 'ব্যাকরণ', year: '2022', difficulty: 'medium', explanation: '"বাণিজ্য" শব্দের বিপরীত হলো "অব্যবসায়িক" বা "অবাণিজ্যিক"।' },
      ],
      english: [
        { id: 'hc-eng-1', text: 'A formal business letter ends with:', options: ['Yours faithfully', 'Best regards', 'Take care', 'All the best'], answer: 0, chapter: 'Business Writing', year: '2023', difficulty: 'easy', explanation: '"Yours faithfully" is used when the salutation is "Dear Sir/Madam" (unknown recipient).' },
        { id: 'hc-eng-2', text: 'The plural of "analysis" is:', options: ['analysises', 'analysis', 'analyses', 'analysys'], answer: 2, chapter: 'Grammar', year: '2022', difficulty: 'medium', explanation: '"Analyses" — words ending in -is form their plural by changing -is to -es.' },
      ],
      ict: [
        { id: 'hc-ict-1', text: 'A spreadsheet application is primarily used for:', options: ['Writing documents', 'Numerical data and calculations', 'Creating presentations', 'Browsing the internet'], answer: 1, chapter: 'Office Applications', year: '2023', difficulty: 'easy', explanation: 'Spreadsheet software is designed for numerical data, formulas, calculations, and data analysis.' },
      ],
    },

    // ── SSC SCIENCE ──────────────────────────────────────────────────────────
    ssc_science: {
      physics: [
        { id: 'ss-phy-1', text: 'The speed of light in vacuum is approximately:', options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], answer: 1, chapter: 'Light', year: '2023', difficulty: 'easy', explanation: 'The speed of light in vacuum is approximately 3×10⁸ m/s (300,000 km/s).' },
        { id: 'ss-phy-2', text: 'Which of the following is a vector quantity?', options: ['Speed', 'Mass', 'Time', 'Velocity'], answer: 3, chapter: 'Motion', year: '2022', difficulty: 'easy', explanation: 'Velocity is a vector — it has both magnitude and direction. Speed is a scalar.' },
        { id: 'ss-phy-3', text: 'Ohm\'s law states that V = I × ?', options: ['Power', 'Resistance', 'Frequency', 'Capacitance'], answer: 1, chapter: 'Electricity', year: '2023', difficulty: 'easy', explanation: 'Ohm\'s Law: V = IR (Voltage = Current × Resistance).' },
        { id: 'ss-phy-4', text: 'The unit of work is:', options: ['Newton', 'Watt', 'Joule', 'Pascal'], answer: 2, chapter: 'Work & Energy', year: '2022', difficulty: 'easy', explanation: 'Work = Force × Displacement. The unit is the Joule (J).' },
      ],
      chemistry: [
        { id: 'ss-chem-1', text: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2, chapter: 'Elements', year: '2023', difficulty: 'easy', explanation: 'Gold\'s symbol Au comes from the Latin "Aurum".' },
        { id: 'ss-chem-2', text: 'Water has the chemical formula:', options: ['H₂O₂', 'HO', 'H₂O', 'H₃O'], answer: 2, chapter: 'Chemical Formulas', year: '2022', difficulty: 'easy', explanation: 'Water is H₂O — two hydrogen atoms bonded to one oxygen atom.' },
        { id: 'ss-chem-3', text: 'An acid has a pH value:', options: ['Greater than 7', 'Equal to 7', 'Less than 7', 'Equal to 14'], answer: 2, chapter: 'Acids and Bases', year: '2023', difficulty: 'easy', explanation: 'Acids have pH < 7. pH 7 = neutral. pH > 7 = alkaline.' },
      ],
      biology: [
        { id: 'ss-bio-1', text: 'Photosynthesis occurs in which part of the plant cell?', options: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'], answer: 2, chapter: 'Plant Biology', year: '2023', difficulty: 'easy', explanation: 'Chloroplasts contain chlorophyll which captures sunlight to drive photosynthesis.' },
        { id: 'ss-bio-2', text: 'The human heart has how many chambers?', options: ['2', '3', '4', '5'], answer: 2, chapter: 'Human Anatomy', year: '2022', difficulty: 'easy', explanation: 'The human heart has 4 chambers: right atrium, right ventricle, left atrium, left ventricle.' },
        { id: 'ss-bio-3', text: 'Which nutrient provides the most energy per gram?', options: ['Carbohydrates', 'Protein', 'Fat', 'Vitamins'], answer: 2, chapter: 'Nutrition', year: '2023', difficulty: 'medium', explanation: 'Fat provides 9 kcal/gram — more than double carbohydrates or protein (both ~4 kcal/gram).' },
      ],
      math: [
        { id: 'ss-math-1', text: 'The square root of 144 is:', options: ['11', '12', '13', '14'], answer: 1, chapter: 'Arithmetic', year: '2023', difficulty: 'easy', explanation: '√144 = 12 because 12 × 12 = 144.' },
        { id: 'ss-math-2', text: 'If 2x + 4 = 10, then x =?', options: ['2', '3', '4', '5'], answer: 1, chapter: 'Algebra', year: '2022', difficulty: 'easy', explanation: '2x + 4 = 10 → 2x = 6 → x = 3.' },
        { id: 'ss-math-3', text: 'The area of a circle with radius r is:', options: ['2πr', 'πr²', '2πr²', 'πr'], answer: 1, chapter: 'Geometry', year: '2023', difficulty: 'easy', explanation: 'Area of circle = πr². Circumference = 2πr.' },
      ],
      ict: [
        { id: 'ss-ict-1', text: 'CPU stands for:', options: ['Central Processing Unit', 'Computer Processing Unit', 'Central Program Unit', 'Central Power Unit'], answer: 0, chapter: 'Computer Basics', year: '2023', difficulty: 'easy', explanation: 'CPU = Central Processing Unit — the "brain" of the computer.' },
        { id: 'ss-ict-2', text: '1 Byte = how many bits?', options: ['4', '8', '16', '32'], answer: 1, chapter: 'Data Storage', year: '2022', difficulty: 'easy', explanation: '1 Byte = 8 bits.' },
      ],
      english: [
        { id: 'ss-eng-1', text: 'The plural of "child" is:', options: ['childs', 'childes', 'children', 'childre'], answer: 2, chapter: 'Grammar', year: '2023', difficulty: 'easy', explanation: '"Children" is the irregular plural of "child".' },
        { id: 'ss-eng-2', text: 'A word that describes a noun is called a:', options: ['Verb', 'Adverb', 'Adjective', 'Pronoun'], answer: 2, chapter: 'Parts of Speech', year: '2022', difficulty: 'easy', explanation: 'An adjective modifies (describes) a noun.' },
      ],
    },

    // ── SSC ARTS ─────────────────────────────────────────────────────────────
    ssc_arts: {
      bangla: [
        { id: 'sa-ban-1', text: '"আমার সোনার বাংলা" কবিতাটি কে রচনা করেছেন?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জীবনানন্দ দাশ', 'মাইকেল মধুসূদন দত্ত'], answer: 1, chapter: 'বাংলা সাহিত্য', year: '2023', difficulty: 'easy', explanation: '"আমার সোনার বাংলা" কবিতাটি রবীন্দ্রনাথ ঠাকুর রচনা করেন।' },
        { id: 'sa-ban-2', text: 'বাংলাদেশের জাতীয় ফুল কোনটি?', options: ['গোলাপ', 'শাপলা', 'কদম', 'জবা'], answer: 1, chapter: 'সাধারণ জ্ঞান', year: '2022', difficulty: 'easy', explanation: 'বাংলাদেশের জাতীয় ফুল শাপলা (সাদা শাপলা)।' },
      ],
      english: [
        { id: 'sa-eng-1', text: 'What is the capital of the United Kingdom?', options: ['Paris', 'Berlin', 'London', 'Madrid'], answer: 2, chapter: 'General Knowledge', year: '2023', difficulty: 'easy', explanation: 'London is the capital city of the United Kingdom.' },
        { id: 'sa-eng-2', text: 'The opposite of "ancient" is:', options: ['Old', 'Antique', 'Modern', 'Historic'], answer: 2, chapter: 'Vocabulary', year: '2022', difficulty: 'easy', explanation: '"Modern" is the antonym of "ancient".' },
      ],
      history: [
        { id: 'sa-his-1', text: 'ভাষা আন্দোলন কত সালে সংঘটিত হয়?', options: ['১৯৪৮', '১৯৫২', '১৯৫৪', '১৯৫৬'], answer: 1, chapter: 'ভাষা আন্দোলন', year: '2023', difficulty: 'easy', explanation: 'বাংলা ভাষা আন্দোলন ১৯৫২ সালের ২১ ফেব্রুয়ারি চূড়ান্ত রূপ ধারণ করে।' },
        { id: 'sa-his-2', text: 'বাংলাদেশের স্বাধীনতার ঘোষণাপত্র কোথায় পাঠ করা হয়?', options: ['ঢাকায়', 'চট্টগ্রামে', 'কুমিল্লায়', 'সিলেটে'], answer: 1, chapter: 'মুক্তিযুদ্ধ', year: '2022', difficulty: 'medium', explanation: '১৯৭১ সালের ২৬ মার্চ চট্টগ্রামের কালুরঘাট বেতার কেন্দ্র থেকে স্বাধীনতার ঘোষণাপত্র পাঠ করা হয়।' },
      ],
      civics: [
        { id: 'sa-civ-1', text: 'বাংলাদেশের জাতীয় সংগীতের রচয়িতা কে?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'সুকান্ত ভট্টাচার্য', 'জীবনানন্দ দাশ'], answer: 1, chapter: 'জাতীয় পরিচয়', year: '2023', difficulty: 'easy', explanation: '"আমার সোনার বাংলা" বাংলাদেশের জাতীয় সংগীত, রচয়িতা রবীন্দ্রনাথ ঠাকুর।' },
      ],
      ict: [
        { id: 'sa-ict-1', text: 'Email এর পূর্ণরূপ কী?', options: ['Electronic Mail', 'Easy Mail', 'External Mail', 'Express Mail'], answer: 0, chapter: 'ইন্টারনেট', year: '2023', difficulty: 'easy', explanation: 'Email = Electronic Mail।' },
      ],
      economics: [
        { id: 'sa-eco-1', text: 'বাংলাদেশের প্রধান রপ্তানি পণ্য কোনটি?', options: ['পাট', 'চা', 'তৈরি পোশাক', 'চামড়া'], answer: 2, chapter: 'বাংলাদেশের অর্থনীতি', year: '2023', difficulty: 'easy', explanation: 'তৈরি পোশাক (RMG) বাংলাদেশের প্রধান রপ্তানি পণ্য — মোট রপ্তানির প্রায় ৮০%।' },
      ],
    },

    // ── SSC COMMERCE ─────────────────────────────────────────────────────────
    ssc_commerce: {
      accounting: [
        { id: 'sc-acc-1', text: 'Journal is also known as:', options: ['Ledger', 'Book of original entry', 'Trial balance', 'Balance sheet'], answer: 1, chapter: 'Basic Accounting', year: '2023', difficulty: 'easy', explanation: 'The journal is called the "book of original entry" — transactions are first recorded here.' },
        { id: 'sc-acc-2', text: 'Debit means:', options: ['Credit side entry', 'Left side of an account', 'Right side of an account', 'Net balance'], answer: 1, chapter: 'Double Entry', year: '2022', difficulty: 'easy', explanation: 'In a T-account, the debit side is always the LEFT side.' },
        { id: 'sc-acc-3', text: 'Gross profit = Net sales −', options: ['Operating expenses', 'Cost of goods sold', 'Net profit', 'Total expenses'], answer: 1, chapter: 'Trading Account', year: '2023', difficulty: 'easy', explanation: 'Gross Profit = Net Sales − Cost of Goods Sold (COGS).' },
      ],
      business_studies: [
        { id: 'sc-bus-1', text: 'The process of planning, organizing, leading and controlling is known as:', options: ['Marketing', 'Management', 'Economics', 'Finance'], answer: 1, chapter: 'Business Management', year: '2023', difficulty: 'easy', explanation: 'Management: Planning, Organising, Staffing, Directing, and Controlling (POSDC).' },
        { id: 'sc-bus-2', text: 'Which is NOT a function of an entrepreneur?', options: ['Innovation', 'Risk-taking', 'Consuming goods', 'Capital formation'], answer: 2, chapter: 'Entrepreneurship', year: '2022', difficulty: 'easy', explanation: '"Consuming goods" is the role of a consumer, not an entrepreneur.' },
      ],
      bangla: [
        { id: 'sc-ban-1', text: 'বাণিজ্যিক পত্রে কতটি অংশ থাকে?', options: ['৫টি', '৭টি', '৬টি', '৮টি'], answer: 1, chapter: 'বাণিজ্যিক পত্র', year: '2023', difficulty: 'medium', explanation: 'একটি আদর্শ বাণিজ্যিক পত্রে সাধারণত ৭টি অংশ থাকে।' },
      ],
      english: [
        { id: 'sc-eng-1', text: 'In business writing, "B2B" means:', options: ['Back to Back', 'Business to Business', 'Buy to Buy', 'Brand to Brand'], answer: 1, chapter: 'Business Terms', year: '2023', difficulty: 'easy', explanation: 'B2B = Business to Business — transactions between businesses.' },
      ],
      ict: [
        { id: 'sc-ict-1', text: 'Microsoft Excel is a:', options: ['Word processor', 'Database software', 'Spreadsheet application', 'Presentation tool'], answer: 2, chapter: 'Office Software', year: '2023', difficulty: 'easy', explanation: 'Microsoft Excel is a spreadsheet application.' },
      ],
      math: [
        { id: 'sc-math-1', text: 'Simple interest formula is:', options: ['P × R × T', '(P × R × T) / 100', 'P + R + T', 'P × R / T'], answer: 1, chapter: 'Commercial Math', year: '2023', difficulty: 'easy', explanation: 'Simple Interest (SI) = (P × R × T) / 100.' },
        { id: 'sc-math-2', text: 'If profit % = 20% and cost price = 500, find selling price:', options: ['520', '580', '600', '540'], answer: 2, chapter: 'Profit & Loss', year: '2022', difficulty: 'medium', explanation: 'Profit = 20% of 500 = ৳100. SP = CP + Profit = 500 + 100 = ৳600.' },
      ],
    },
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINEERING QUESTION BANK
  // Used by: pages/dashboard/engineering-exam.vue
  // Key structure: { [examKey]: { [subject]: Question[] } }
  // examKey: buet | ruet | kuet | cuet
  // ══════════════════════════════════════════════════════════════════════════
  const engineeringQuestionBank = {
    buet: {
      physics: [
        { id: 'bu-phy-1', text: 'A projectile is launched at 45° with initial speed v₀. What is the maximum range on flat ground?', options: ['v₀²/g', 'v₀²/2g', '2v₀²/g', 'v₀²/4g'], answer: 0, chapter: 'Projectile Motion', year: '2023', difficulty: 'medium', explanation: 'Range R = v₀²sin(2θ)/g. At θ = 45°, sin(90°) = 1, so R_max = v₀²/g.' },
        { id: 'bu-phy-2', text: 'The magnetic force on a charge q moving with velocity v in magnetic field B is:', options: ['qvB sinθ', 'qvB cosθ', 'qvB tanθ', 'q²vB'], answer: 0, chapter: 'Electromagnetism', year: '2022', difficulty: 'easy', explanation: 'F = qv × B. The magnitude is F = qvB sinθ where θ is the angle between v and B.' },
        { id: 'bu-phy-3', text: 'In simple harmonic motion, which quantity is NOT constant?', options: ['Amplitude', 'Time period', 'Frequency', 'Total energy'], answer: 3, chapter: 'Oscillations', year: '2023', difficulty: 'medium', explanation: 'Total energy in SHM = ½mω²A² is constant. However, kinetic and potential energies continuously exchange.' },
        { id: 'bu-phy-4', text: 'The de Broglie wavelength of a particle with momentum p is:', options: ['h/p', 'hp', 'h/p²', 'p/h'], answer: 0, chapter: 'Modern Physics', year: '2022', difficulty: 'medium', explanation: 'λ = h/p (de Broglie relation). Every particle has an associated wavelength inversely proportional to its momentum.' },
        { id: 'bu-phy-5', text: 'A capacitor of capacitance C is charged to voltage V. The energy stored is:', options: ['CV', '½CV²', 'CV²', '2CV²'], answer: 1, chapter: 'Electrostatics', year: '2023', difficulty: 'easy', explanation: 'Energy stored in a capacitor = ½CV².' },
        { id: 'bu-phy-6', text: 'Which of the following demonstrates the photoelectric effect?', options: ['Diffraction of X-rays', 'Emission of electrons when light hits metal', 'Scattering of photons by electrons', 'Pair production'], answer: 1, chapter: 'Modern Physics', year: '2021', difficulty: 'easy', explanation: 'The photoelectric effect is the emission of electrons from a metal surface when light above a threshold frequency strikes it.' },
        { id: 'bu-phy-7', text: 'The moment of inertia of a solid sphere of mass M and radius R about its diameter is:', options: ['⅔MR²', '⅖MR²', '½MR²', '¾MR²'], answer: 1, chapter: 'Rotational Mechanics', year: '2023', difficulty: 'hard', explanation: 'I = (2/5)MR² for a solid sphere about a diameter.' },
        { id: 'bu-phy-8', text: 'Snell\'s law of refraction states that n₁sinθ₁ =', options: ['n₂cosθ₂', 'n₂sinθ₂', 'n₁sinθ₂', 'n₂tanθ₂'], answer: 1, chapter: 'Optics', year: '2022', difficulty: 'easy', explanation: 'Snell\'s Law: n₁sinθ₁ = n₂sinθ₂.' },
      ],
      chemistry: [
        { id: 'bu-chem-1', text: 'The hybridisation of carbon in benzene (C₆H₆) is:', options: ['sp', 'sp²', 'sp³', 'sp³d'], answer: 1, chapter: 'Organic Chemistry', year: '2023', difficulty: 'medium', explanation: 'Benzene carbons are sp² hybridised.' },
        { id: 'bu-chem-2', text: 'The pH of a 0.01 M strong acid solution is:', options: ['1', '2', '3', '0.01'], answer: 1, chapter: 'Acids & Bases', year: '2022', difficulty: 'easy', explanation: 'For a strong acid: [H⁺] = 0.01 M = 10⁻² M. pH = -log(10⁻²) = 2.' },
        { id: 'bu-chem-3', text: 'Which of the following is an electrophile?', options: ['OH⁻', 'NH₃', 'NO₂⁺', 'CN⁻'], answer: 2, chapter: 'Reaction Mechanisms', year: '2023', difficulty: 'medium', explanation: 'NO₂⁺ (nitronium ion) is an electrophile — electron-deficient.' },
        { id: 'bu-chem-4', text: 'In the periodic table, which property increases along a period left to right?', options: ['Atomic radius', 'Metallic character', 'Ionisation energy', 'Reactivity with water'], answer: 2, chapter: 'Periodic Table', year: '2022', difficulty: 'easy', explanation: 'Ionisation energy increases left to right due to increasing nuclear charge.' },
        { id: 'bu-chem-5', text: 'The number of σ (sigma) bonds in ethyne (C₂H₂) is:', options: ['2', '3', '4', '5'], answer: 1, chapter: 'Chemical Bonding', year: '2023', difficulty: 'medium', explanation: 'H-C≡C-H has 2 C-H σ bonds + 1 C-C σ bond = 3 σ bonds total.' },
        { id: 'bu-chem-6', text: 'Fehling\'s solution is used to detect:', options: ['Amino acids', 'Aldehydes', 'Carboxylic acids', 'Esters'], answer: 1, chapter: 'Organic Chemistry', year: '2021', difficulty: 'medium', explanation: 'Fehling\'s solution detects reducing sugars and aldehydes — blue Cu²⁺ → brick-red Cu₂O.' },
      ],
      math: [
        { id: 'bu-math-1', text: 'The value of ∫₀¹ x² dx is:', options: ['1/2', '1/3', '1/4', '2/3'], answer: 1, chapter: 'Integration', year: '2023', difficulty: 'easy', explanation: '∫x² dx = x³/3. Evaluating from 0 to 1: 1/3.' },
        { id: 'bu-math-2', text: 'If A is a 3×3 matrix with determinant 2, what is det(2A)?', options: ['4', '8', '16', '6'], answer: 2, chapter: 'Matrices', year: '2022', difficulty: 'medium', explanation: 'det(kA) = kⁿ det(A). Here: det(2A) = 2³ × 2 = 16.' },
        { id: 'bu-math-3', text: 'The general solution of dy/dx = y is:', options: ['y = Cx', 'y = Ce^x', 'y = C/x', 'y = C ln(x)'], answer: 1, chapter: 'Differential Equations', year: '2023', difficulty: 'medium', explanation: 'Separating variables: y = Ce^x.' },
        { id: 'bu-math-4', text: 'The angle between vectors a = (1,0,0) and b = (0,1,0) is:', options: ['0°', '45°', '90°', '180°'], answer: 2, chapter: 'Vectors', year: '2022', difficulty: 'easy', explanation: 'a·b = 0 → cosθ = 0 → θ = 90°.' },
        { id: 'bu-math-5', text: 'The sum of an infinite geometric series with first term a and ratio r (|r|<1) is:', options: ['a/(1-r)', 'a/(1+r)', 'a·r', 'a(1-r)'], answer: 0, chapter: 'Series', year: '2023', difficulty: 'medium', explanation: 'S∞ = a/(1-r) for |r| < 1.' },
        { id: 'bu-math-6', text: 'The number of ways to choose 3 items from 8 (order does not matter) is:', options: ['24', '56', '336', '512'], answer: 1, chapter: 'Combinatorics', year: '2021', difficulty: 'easy', explanation: 'C(8,3) = 8!/(3!×5!) = 56.' },
      ],
      english: [
        { id: 'bu-eng-1', text: 'Choose the word most similar in meaning to "meticulous":', options: ['Careless', 'Thorough', 'Hasty', 'Vague'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'medium', explanation: '"Meticulous" means showing great attention to detail; very careful and precise.' },
        { id: 'bu-eng-2', text: 'Identify the correct sentence:', options: ['He has went there.', 'He has gone there.', 'He have gone there.', 'He gone there.'], answer: 1, chapter: 'Grammar', year: '2022', difficulty: 'easy', explanation: '"Has gone" is correct — present perfect using has + past participle.' },
        { id: 'bu-eng-3', text: 'The word "enervate" means:', options: ['To energise', 'To weaken or exhaust', 'To strengthen', 'To excite'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'hard', explanation: '"Enervate" means to weaken someone\'s vitality.' },
        { id: 'bu-eng-4', text: 'Choose the correct form: "Neither of the boys ___ present."', options: ['were', 'are', 'was', 'have been'], answer: 2, chapter: 'Grammar', year: '2022', difficulty: 'medium', explanation: '"Neither" is singular — takes a singular verb: "was".' },
      ],
    },
    ruet: {
      physics: [
        { id: 'ru-phy-1', text: 'A body of mass m moving with velocity v collides and sticks to a stationary body of mass 2m. Final velocity is:', options: ['v/2', 'v/3', '2v/3', 'v/4'], answer: 1, chapter: 'Momentum', year: '2023', difficulty: 'medium', explanation: 'Perfectly inelastic: mv = 3m·v_f → v_f = v/3.' },
        { id: 'ru-phy-2', text: 'Which law is equivalent to conservation of angular momentum?', options: ['Newton\'s 1st Law', 'Newton\'s 2nd Law in rotation', 'Newton\'s 3rd Law', 'Kepler\'s 3rd Law'], answer: 1, chapter: 'Rotational Mechanics', year: '2022', difficulty: 'medium', explanation: 'τ = dL/dt. When net torque τ = 0, angular momentum L is conserved.' },
        { id: 'ru-phy-3', text: 'What is the escape velocity from Earth\'s surface? (g=9.8m/s², R=6400km)', options: ['7.9 km/s', '11.2 km/s', '16.8 km/s', '3.4 km/s'], answer: 1, chapter: 'Gravitation', year: '2023', difficulty: 'medium', explanation: 'v_esc = √(2gR) ≈ 11.2 km/s.' },
        { id: 'ru-phy-4', text: 'A convex mirror always forms an image that is:', options: ['Real, inverted, diminished', 'Virtual, erect, diminished', 'Virtual, erect, magnified', 'Real, erect, diminished'], answer: 1, chapter: 'Optics', year: '2022', difficulty: 'easy', explanation: 'Convex mirrors always produce virtual, erect, and diminished images.' },
        { id: 'ru-phy-5', text: 'In Young\'s double slit experiment, if λ is doubled and d is halved, fringe width β becomes:', options: ['Same', '2× original', '4× original', 'Half original'], answer: 2, chapter: 'Wave Optics', year: '2023', difficulty: 'hard', explanation: 'β = λD/d. New β = (2λ)D/(d/2) = 4β.' },
        { id: 'ru-phy-6', text: 'Radioactive decay follows:', options: ['Linear decay', 'Exponential decay', 'Inverse square decay', 'Polynomial decay'], answer: 1, chapter: 'Nuclear Physics', year: '2021', difficulty: 'easy', explanation: 'N = N₀e^(-λt). Radioactive decay is exponential.' },
      ],
      chemistry: [
        { id: 'ru-chem-1', text: 'Which type of isomerism is shown by glucose and fructose?', options: ['Chain isomerism', 'Position isomerism', 'Functional isomerism', 'Optical isomerism'], answer: 2, chapter: 'Isomerism', year: '2023', difficulty: 'medium', explanation: 'Glucose and fructose are functional group isomers — same formula C₆H₁₂O₆, different functional groups.' },
        { id: 'ru-chem-2', text: 'Which gas is produced when zinc reacts with dilute H₂SO₄?', options: ['O₂', 'SO₂', 'H₂', 'H₂S'], answer: 2, chapter: 'Acid-Metal Reactions', year: '2022', difficulty: 'easy', explanation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑.' },
        { id: 'ru-chem-3', text: 'The number of moles in 44g of CO₂ (molar mass = 44 g/mol) is:', options: ['0.5', '1', '2', '22'], answer: 1, chapter: 'Mole Concept', year: '2023', difficulty: 'easy', explanation: 'Moles = 44g / 44 g/mol = 1 mol.' },
        { id: 'ru-chem-4', text: 'A catalyst in a reaction:', options: ['Is consumed in the reaction', 'Increases activation energy', 'Lowers activation energy', 'Changes equilibrium position'], answer: 2, chapter: 'Chemical Kinetics', year: '2022', difficulty: 'medium', explanation: 'A catalyst lowers the activation energy and is NOT consumed.' },
      ],
      math: [
        { id: 'ru-math-1', text: 'lim(x→0) [sin(x)/x] equals:', options: ['0', '∞', '1', 'x'], answer: 2, chapter: 'Limits', year: '2023', difficulty: 'medium', explanation: 'lim(x→0) sin(x)/x = 1. Fundamental trigonometric limit.' },
        { id: 'ru-math-2', text: 'The equation of a circle with centre (3, -2) and radius 5 is:', options: ['(x-3)²+(y+2)²=5', '(x-3)²+(y+2)²=25', '(x+3)²+(y-2)²=25', '(x-3)²-(y+2)²=25'], answer: 1, chapter: 'Coordinate Geometry', year: '2022', difficulty: 'easy', explanation: '(x-h)² + (y-k)² = r². (x-3)² + (y+2)² = 25.' },
        { id: 'ru-math-3', text: 'The value of cos(60°) + sin(30°) is:', options: ['0', '½', '1', '√3/2'], answer: 2, chapter: 'Trigonometry', year: '2023', difficulty: 'easy', explanation: 'cos(60°) = ½, sin(30°) = ½. Sum = 1.' },
        { id: 'ru-math-4', text: 'If a complex number z = 3 + 4i, then |z| =', options: ['3', '4', '5', '7'], answer: 2, chapter: 'Complex Numbers', year: '2022', difficulty: 'easy', explanation: '|z| = √(9+16) = √25 = 5.' },
        { id: 'ru-math-5', text: 'The eigenvalues of matrix [[2,0],[0,3]] are:', options: ['2, 3', '1, 6', '0, 5', '2, 2'], answer: 0, chapter: 'Matrices', year: '2023', difficulty: 'medium', explanation: 'For a diagonal matrix, eigenvalues are the diagonal entries: 2 and 3.' },
      ],
      english: [
        { id: 'ru-eng-1', text: 'Choose the antonym of "verbose":', options: ['Talkative', 'Concise', 'Lengthy', 'Detailed'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'medium', explanation: '"Verbose" means using more words than needed. Antonym: "concise".' },
        { id: 'ru-eng-2', text: 'Which sentence is in the passive voice?', options: ['The engineer designed the bridge.', 'The bridge was designed by the engineer.', 'The engineer is designing the bridge.', 'The engineer had designed the bridge.'], answer: 1, chapter: 'Grammar', year: '2022', difficulty: 'easy', explanation: '"The bridge was designed by the engineer" — passive voice.' },
        { id: 'ru-eng-3', text: '"Ameliorate" means:', options: ['To worsen', 'To improve', 'To ignore', 'To destroy'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'hard', explanation: '"Ameliorate" means to make something bad better or more tolerable.' },
      ],
    },
    kuet: {
      physics: [
        { id: 'ku-phy-1', text: 'The work done by a force F = (3i + 4j) N over displacement d = (2i + 3j) m is:', options: ['17 J', '18 J', '20 J', '14 J'], answer: 1, chapter: 'Work & Energy', year: '2023', difficulty: 'medium', explanation: 'W = F·d = 3×2 + 4×3 = 6 + 12 = 18 J.' },
        { id: 'ku-phy-2', text: 'Which of the following has the highest electrical conductivity?', options: ['Silver', 'Copper', 'Gold', 'Aluminium'], answer: 0, chapter: 'Electricity', year: '2022', difficulty: 'easy', explanation: 'Silver has the highest electrical conductivity (6.3×10⁷ S/m).' },
        { id: 'ku-phy-3', text: 'If a wire of resistance R is stretched to twice its length (volume constant), the new resistance is:', options: ['R', '2R', '4R', 'R/4'], answer: 2, chapter: 'Electricity', year: '2023', difficulty: 'hard', explanation: 'L doubles, A halves. New R = ρ(2L)/(A/2) = 4R.' },
        { id: 'ku-phy-4', text: 'The threshold frequency in the photoelectric effect depends on:', options: ['Intensity of light', 'The metal surface', 'Speed of light', 'Temperature'], answer: 1, chapter: 'Modern Physics', year: '2022', difficulty: 'medium', explanation: 'Threshold frequency depends on the work function (φ) of the metal: hf₀ = φ.' },
      ],
      chemistry: [
        { id: 'ku-chem-1', text: 'How many electrons does the outermost shell of Neon contain?', options: ['2', '6', '8', '10'], answer: 2, chapter: 'Electronic Configuration', year: '2023', difficulty: 'easy', explanation: 'Neon (Z=10): 1s²2s²2p⁶. Outermost shell has 8 electrons.' },
        { id: 'ku-chem-2', text: 'The process of converting a sulphide ore to its oxide by heating in excess air is called:', options: ['Smelting', 'Calcination', 'Roasting', 'Reduction'], answer: 2, chapter: 'Metallurgy', year: '2022', difficulty: 'medium', explanation: 'Roasting converts sulphide ores to oxides in excess air.' },
        { id: 'ku-chem-3', text: 'In an exothermic reaction, which statement is TRUE?', options: ['Reactants have lower energy than products', 'Energy is absorbed from surroundings', 'ΔH is negative', 'Activation energy = 0'], answer: 2, chapter: 'Thermochemistry', year: '2023', difficulty: 'medium', explanation: 'In exothermic reactions: ΔH < 0 (negative). Energy is released to surroundings.' },
      ],
      math: [
        { id: 'ku-math-1', text: 'The slope of the line 3x − 4y + 8 = 0 is:', options: ['3/4', '4/3', '-3/4', '-4/3'], answer: 0, chapter: 'Straight Lines', year: '2023', difficulty: 'easy', explanation: 'y = (3/4)x + 2. Slope = 3/4.' },
        { id: 'ku-math-2', text: 'The nth term of an arithmetic sequence with first term a and common difference d is:', options: ['a + nd', 'a + (n-1)d', 'a × dⁿ', 'a + d^(n-1)'], answer: 1, chapter: 'Sequences & Series', year: '2022', difficulty: 'easy', explanation: 'aₙ = a + (n-1)d.' },
        { id: 'ku-math-3', text: 'The derivative of ln(x) is:', options: ['1/x²', '1/x', 'x', 'e^x'], answer: 1, chapter: 'Differentiation', year: '2023', difficulty: 'easy', explanation: 'd/dx [ln(x)] = 1/x.' },
        { id: 'ku-math-4', text: 'How many different 4-digit numbers can be formed using digits 1,2,3,4 without repetition?', options: ['16', '24', '64', '256'], answer: 1, chapter: 'Permutations', year: '2022', difficulty: 'easy', explanation: 'P(4,4) = 4! = 24.' },
      ],
      english: [
        { id: 'ku-eng-1', text: 'A "prerequisite" is something that is:', options: ['Rare and valuable', 'Required beforehand', 'Unnecessary', 'Easily available'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'medium', explanation: '"Prerequisite" — a condition required before something else.' },
        { id: 'ku-eng-2', text: 'Identify the error: "The data shows that the results were positive."', options: ['data shows', 'the results', 'were positive', 'No error'], answer: 0, chapter: 'Grammar', year: '2022', difficulty: 'hard', explanation: '"Data" is plural (datum = singular), so: "The data show".' },
      ],
    },
    cuet: {
      physics: [
        { id: 'cu-phy-1', text: 'The velocity of sound in air at 0°C is approximately:', options: ['232 m/s', '332 m/s', '432 m/s', '532 m/s'], answer: 1, chapter: 'Sound', year: '2023', difficulty: 'easy', explanation: 'Speed of sound in air at 0°C ≈ 332 m/s. It increases with temperature.' },
        { id: 'cu-phy-2', text: 'Which law relates pressure and temperature of a gas at constant volume?', options: ['Boyle\'s Law', 'Charles\'s Law', 'Gay-Lussac\'s Law', 'Avogadro\'s Law'], answer: 2, chapter: 'Gas Laws', year: '2022', difficulty: 'easy', explanation: 'Gay-Lussac\'s Law: P/T = constant at constant volume.' },
        { id: 'cu-phy-3', text: 'The SI unit of magnetic flux is:', options: ['Tesla', 'Weber', 'Henry', 'Ampere'], answer: 1, chapter: 'Electromagnetism', year: '2023', difficulty: 'easy', explanation: 'Weber (Wb) is the SI unit of magnetic flux. Tesla (T) is for magnetic flux density (Wb/m²).' },
        { id: 'cu-phy-4', text: 'Which mirror is used in car headlights?', options: ['Plane mirror', 'Convex mirror', 'Concave mirror', 'Spherical mirror'], answer: 2, chapter: 'Optics', year: '2022', difficulty: 'easy', explanation: 'Concave mirrors are used in car headlights — they converge light into a parallel beam.' },
      ],
      chemistry: [
        { id: 'cu-chem-1', text: 'Which of the following is a polymer?', options: ['Glucose', 'Amino acid', 'Starch', 'Fatty acid'], answer: 2, chapter: 'Polymers', year: '2023', difficulty: 'easy', explanation: 'Starch is a polymer of glucose units. Glucose and amino acids are monomers.' },
        { id: 'cu-chem-2', text: 'The IUPAC name of CH₃-CH₂-OH is:', options: ['Methanol', 'Ethanol', 'Propanol', 'Butanol'], answer: 1, chapter: 'Organic Nomenclature', year: '2022', difficulty: 'easy', explanation: 'CH₃-CH₂-OH has 2 carbons with -OH group: ethanol.' },
        { id: 'cu-chem-3', text: 'Which gas has the smell of rotten eggs?', options: ['SO₂', 'H₂S', 'NH₃', 'CO₂'], answer: 1, chapter: 'Inorganic Chemistry', year: '2023', difficulty: 'easy', explanation: 'H₂S (hydrogen sulphide) has the characteristic smell of rotten eggs.' },
      ],
      math: [
        { id: 'cu-math-1', text: 'The value of sin(90°) + cos(0°) is:', options: ['0', '1', '2', '√2'], answer: 2, chapter: 'Trigonometry', year: '2023', difficulty: 'easy', explanation: 'sin(90°) = 1, cos(0°) = 1. Sum = 2.' },
        { id: 'cu-math-2', text: 'If 3x − 7 = 14, find x:', options: ['5', '7', '3', '9'], answer: 1, chapter: 'Algebra', year: '2022', difficulty: 'easy', explanation: '3x = 21 → x = 7.' },
        { id: 'cu-math-3', text: 'The perimeter of a rectangle with length 8 cm and width 5 cm is:', options: ['13 cm', '26 cm', '40 cm', '30 cm'], answer: 1, chapter: 'Geometry', year: '2023', difficulty: 'easy', explanation: 'Perimeter = 2(l + w) = 2(8 + 5) = 26 cm.' },
        { id: 'cu-math-4', text: 'If P(A) = 0.4 and P(B) = 0.3 and A, B are independent, then P(A∩B) =', options: ['0.7', '0.1', '0.12', '0.58'], answer: 2, chapter: 'Probability', year: '2022', difficulty: 'medium', explanation: 'P(A∩B) = P(A)×P(B) = 0.4×0.3 = 0.12 for independent events.' },
      ],
      english: [
        { id: 'cu-eng-1', text: 'The synonym of "benevolent" is:', options: ['Cruel', 'Kind', 'Selfish', 'Angry'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'easy', explanation: '"Benevolent" means well-meaning and kindly. Synonym: "kind".' },
        { id: 'cu-eng-2', text: 'Choose the correct spelling:', options: ['Accomodation', 'Accommodation', 'Accomadation', 'Acomodation'], answer: 1, chapter: 'Spelling', year: '2022', difficulty: 'medium', explanation: '"Accommodation" — double c and double m. A common misspelling.' },
        { id: 'cu-eng-3', text: '"She insisted that he ___ present at the meeting." (Choose correct verb)', options: ['is', 'was', 'be', 'were'], answer: 2, chapter: 'Grammar', year: '2023', difficulty: 'hard', explanation: 'Subjunctive mood after "insisted that": use base form "be".' },
      ],
    },
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ADMISSION QUESTION BANK
  // Used by: pages/dashboard/admission-exam.vue
  // Key structure: { medical: { [subject]: Question[] }, varsity: { [subject]: Question[] } }
  // ══════════════════════════════════════════════════════════════════════════
  const admissionQuestionBank = {
    medical: {
      biology: [
        { id: 'm-bio-1', text: 'Which of the following is the universal blood donor?', options: ['A+', 'AB+', 'O−', 'B−'], answer: 2, chapter: 'Human Physiology', year: '2023', difficulty: 'easy', explanation: 'O− (O negative) is the universal donor because its red blood cells lack A, B, and Rh antigens.' },
        { id: 'm-bio-2', text: 'The process of cell division that produces gametes is called:', options: ['Mitosis', 'Meiosis', 'Binary fission', 'Budding'], answer: 1, chapter: 'Reproduction', year: '2022', difficulty: 'easy', explanation: 'Meiosis produces gametes (eggs and sperm) with half the chromosome number (haploid).' },
        { id: 'm-bio-3', text: 'Which vitamin is produced in the skin when exposed to sunlight?', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'], answer: 3, chapter: 'Nutrition', year: '2023', difficulty: 'easy', explanation: 'Vitamin D is synthesised in the skin by UV radiation acting on 7-dehydrocholesterol.' },
        { id: 'm-bio-4', text: 'The functional unit of the kidney is:', options: ['Glomerulus', 'Nephron', 'Bowman\'s capsule', 'Loop of Henle'], answer: 1, chapter: 'Excretion', year: '2022', difficulty: 'easy', explanation: 'The nephron is the structural and functional unit of the kidney.' },
        { id: 'm-bio-5', text: 'Myelin sheath is produced by which cells in the peripheral nervous system?', options: ['Astrocytes', 'Schwann cells', 'Oligodendrocytes', 'Microglia'], answer: 1, chapter: 'Nervous System', year: '2021', difficulty: 'hard', explanation: 'In the PNS, Schwann cells wrap around axons to form the myelin sheath.' },
        { id: 'm-bio-6', text: 'During aerobic respiration, the net gain of ATP from one molecule of glucose is:', options: ['2 ATP', '4 ATP', '36-38 ATP', '24 ATP'], answer: 2, chapter: 'Cell Biology', year: '2023', difficulty: 'medium', explanation: 'Aerobic respiration yields a net gain of 36–38 ATP per glucose.' },
        { id: 'm-bio-7', text: 'Which hormone is responsible for the "fight or flight" response?', options: ['Cortisol', 'Adrenaline (Epinephrine)', 'Thyroxine', 'Insulin'], answer: 1, chapter: 'Endocrine System', year: '2022', difficulty: 'easy', explanation: 'Adrenaline (epinephrine), secreted by the adrenal medulla, triggers the fight-or-flight response.' },
        { id: 'm-bio-8', text: 'The process by which plants make their own food is called:', options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Fermentation'], answer: 2, chapter: 'Plant Biology', year: '2023', difficulty: 'easy', explanation: 'Photosynthesis converts light energy into chemical energy: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.' },
      ],
      chemistry: [
        { id: 'm-chem-1', text: 'The pH of blood is maintained at approximately:', options: ['6.4–6.8', '7.35–7.45', '7.8–8.0', '6.0–7.0'], answer: 1, chapter: 'Acids & Bases', year: '2023', difficulty: 'medium', explanation: 'Normal human blood pH is 7.35–7.45 (slightly alkaline).' },
        { id: 'm-chem-2', text: 'Which of the following is an example of a noble gas?', options: ['Fluorine', 'Nitrogen', 'Argon', 'Chlorine'], answer: 2, chapter: 'Periodic Table', year: '2022', difficulty: 'easy', explanation: 'Noble gases (Group 18): He, Ne, Ar, Kr, Xe, Rn. Chemically inert.' },
        { id: 'm-chem-3', text: 'Haemoglobin contains which metal ion?', options: ['Zinc (Zn²⁺)', 'Copper (Cu²⁺)', 'Iron (Fe²⁺)', 'Magnesium (Mg²⁺)'], answer: 2, chapter: 'Coordination Chemistry', year: '2023', difficulty: 'easy', explanation: 'Haemoglobin contains iron (Fe²⁺) at the centre of the haem group.' },
        { id: 'm-chem-4', text: 'The hybridization of carbon in methane (CH₄) is:', options: ['sp', 'sp²', 'sp³', 'sp³d'], answer: 2, chapter: 'Organic Chemistry', year: '2021', difficulty: 'medium', explanation: 'In CH₄, carbon forms 4 single bonds — sp³ hybridization, tetrahedral geometry.' },
      ],
      physics: [
        { id: 'm-phy-1', text: 'Which principle explains why blood pressure is measured in mmHg?', options: ['Archimedes\' Principle', 'Pascal\'s Law', 'Bernoulli\'s Principle', 'Boyle\'s Law'], answer: 1, chapter: 'Fluid Mechanics', year: '2023', difficulty: 'hard', explanation: 'Pascal\'s Law: pressure applied to a confined fluid is transmitted equally in all directions.' },
        { id: 'm-phy-2', text: 'The unit of electric potential difference is:', options: ['Ampere', 'Ohm', 'Volt', 'Watt'], answer: 2, chapter: 'Electricity', year: '2022', difficulty: 'easy', explanation: 'The Volt (V) is the SI unit of electric potential difference. 1 V = 1 J/C.' },
        { id: 'm-phy-3', text: 'X-rays are part of which spectrum?', options: ['Sound waves', 'Electromagnetic spectrum', 'Mechanical waves', 'Matter waves'], answer: 1, chapter: 'Modern Physics', year: '2023', difficulty: 'easy', explanation: 'X-rays are electromagnetic radiation with wavelengths of 0.01–10 nm.' },
      ],
      english: [
        { id: 'm-eng-1', text: 'Choose the correct sentence:', options: ['The patient are recovering.', 'The patient is recovering.', 'The patient were recovering.', 'The patient have recovered.'], answer: 1, chapter: 'Grammar', year: '2023', difficulty: 'easy', explanation: '"The patient" is singular → "is recovering".' },
        { id: 'm-eng-2', text: 'The synonym of "benign" (in medical context) is:', options: ['Malignant', 'Harmless', 'Infectious', 'Chronic'], answer: 1, chapter: 'Medical Vocabulary', year: '2022', difficulty: 'medium', explanation: 'A benign tumour is non-cancerous and harmless (not malignant).' },
      ],
      general_knowledge: [
        { id: 'm-gk-1', text: 'DGHS stands for:', options: ['Directorate General of Health Services', 'Department of General Health Standards', 'Directorate of Government Health System', 'Division of General Health Services'], answer: 0, chapter: 'Bangladesh Affairs', year: '2023', difficulty: 'easy', explanation: 'DGHS = Directorate General of Health Services — the body overseeing medical college admissions in Bangladesh.' },
        { id: 'm-gk-2', text: 'The WHO was established in:', options: ['1945', '1948', '1950', '1955'], answer: 1, chapter: 'International Affairs', year: '2022', difficulty: 'medium', explanation: 'WHO (World Health Organization) was established on 7 April 1948 — now celebrated as World Health Day.' },
      ],
    },
    varsity: {
      bangla: [
        { id: 'v-ban-1', text: '"আমার সোনার বাংলা" কবিতাটি কে রচনা করেছেন?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জীবনানন্দ দাশ', 'মাইকেল মধুসূদন দত্ত'], answer: 1, chapter: 'বাংলা সাহিত্য', year: '2023', difficulty: 'easy', explanation: '"আমার সোনার বাংলা" রবীন্দ্রনাথ ঠাকুর ১৯০৫ সালে রচনা করেন।' },
        { id: 'v-ban-2', text: '"বিদ্রোহী" কবিতাটি কোন কবির রচনা?', options: ['রবীন্দ্রনাথ ঠাকুর', 'শামসুর রাহমান', 'কাজী নজরুল ইসলাম', 'সুফিয়া কামাল'], answer: 2, chapter: 'বাংলা কবিতা', year: '2022', difficulty: 'easy', explanation: '"বিদ্রোহী" কাজী নজরুল ইসলাম ১৯২১ সালে রচনা করেন।' },
        { id: 'v-ban-3', text: 'বাংলা ব্যাকরণ অনুযায়ী "সন্ধি" কত প্রকার?', options: ['২ প্রকার', '৩ প্রকার', '৪ প্রকার', '৫ প্রকার'], answer: 1, chapter: 'বাংলা ব্যাকরণ', year: '2023', difficulty: 'medium', explanation: 'বাংলা ব্যাকরণে সন্ধি তিন প্রকার: স্বরসন্ধি, ব্যঞ্জনসন্ধি, বিসর্গসন্ধি।' },
        { id: 'v-ban-4', text: '"পদ্মা নদীর মাঝি" উপন্যাসটির রচয়িতা কে?', options: ['শরৎচন্দ্র চট্টোপাধ্যায়', 'রবীন্দ্রনাথ ঠাকুর', 'মানিক বন্দ্যোপাধ্যায়', 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়'], answer: 2, chapter: 'বাংলা উপন্যাস', year: '2022', difficulty: 'easy', explanation: '"পদ্মা নদীর মাঝি" মানিক বন্দ্যোপাধ্যায়ের বিখ্যাত উপন্যাস (১৯৩৬)।' },
      ],
      english: [
        { id: 'v-eng-1', text: 'Choose the correct passive form of: "The teacher teaches the students."', options: ['The students are taught by the teacher.', 'The students were taught by the teacher.', 'The students have been taught by the teacher.', 'The students is taught by the teacher.'], answer: 0, chapter: 'Grammar', year: '2023', difficulty: 'medium', explanation: 'Simple present passive: The students are taught by the teacher.' },
        { id: 'v-eng-2', text: 'What is the synonym of "Eloquent"?', options: ['Silent', 'Fluent', 'Dull', 'Harsh'], answer: 1, chapter: 'Vocabulary', year: '2022', difficulty: 'medium', explanation: '"Eloquent" means expressing ideas fluently and persuasively. Synonym: "Fluent".' },
        { id: 'v-eng-3', text: 'Which of the following is a correct sentence?', options: ['She don\'t know the answer.', 'She doesn\'t knows the answer.', 'She doesn\'t know the answer.', 'She not know the answer.'], answer: 2, chapter: 'Grammar', year: '2023', difficulty: 'easy', explanation: '"She doesn\'t know" — third person singular present with "doesn\'t" + base verb.' },
      ],
      math: [
        { id: 'v-math-1', text: 'If log₂8 = x, what is the value of x?', options: ['2', '3', '4', '6'], answer: 1, chapter: 'Logarithm', year: '2023', difficulty: 'easy', explanation: 'log₂8 = x → 2ˣ = 8 = 2³ → x = 3.' },
        { id: 'v-math-2', text: 'The roots of the equation x² − 5x + 6 = 0 are:', options: ['2 and 3', '1 and 6', '−2 and −3', '2 and −3'], answer: 0, chapter: 'Algebra', year: '2022', difficulty: 'easy', explanation: '(x−2)(x−3) = 0 → x = 2 or 3.' },
        { id: 'v-math-3', text: 'The value of sin²θ + cos²θ is always equal to:', options: ['0', '2', '1', 'Depends on θ'], answer: 2, chapter: 'Trigonometry', year: '2023', difficulty: 'easy', explanation: 'sin²θ + cos²θ = 1 is the fundamental Pythagorean identity.' },
        { id: 'v-math-4', text: 'What is the derivative of f(x) = x³ + 2x² − 5?', options: ['3x² + 4x', '3x² + 4x − 5', 'x² + 4x', '3x + 4'], answer: 0, chapter: 'Calculus', year: '2022', difficulty: 'medium', explanation: 'f\'(x) = 3x² + 4x. Constants differentiate to zero.' },
      ],
      ict: [
        { id: 'v-ict-1', text: 'Which of the following is NOT a programming language?', options: ['Python', 'HTML', 'Java', 'C++'], answer: 1, chapter: 'Programming', year: '2023', difficulty: 'easy', explanation: 'HTML is a markup language, not a programming language.' },
        { id: 'v-ict-2', text: 'The binary equivalent of decimal number 10 is:', options: ['1010', '1100', '1001', '0110'], answer: 0, chapter: 'Number System', year: '2022', difficulty: 'medium', explanation: '10 in binary = 1010. Verify: 8+0+2+0 = 10.' },
      ],
      general_knowledge: [
        { id: 'v-gk-1', text: 'Bangladesh gained independence in which year?', options: ['1947', '1952', '1971', '1975'], answer: 2, chapter: 'Bangladesh Affairs', year: '2023', difficulty: 'easy', explanation: 'Bangladesh gained independence on 26 March 1971.' },
        { id: 'v-gk-2', text: 'The capital of Australia is:', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], answer: 2, chapter: 'World Geography', year: '2022', difficulty: 'medium', explanation: 'Canberra is the capital of Australia, not Sydney or Melbourne.' },
        { id: 'v-gk-3', text: 'Who is the Secretary-General of the United Nations (as of 2023)?', options: ['Ban Ki-moon', 'Kofi Annan', 'António Guterres', 'Boutros Ghali'], answer: 2, chapter: 'International Affairs', year: '2023', difficulty: 'medium', explanation: 'António Guterres has been UN Secretary-General since 2017.' },
      ],
    },
  }

  return {
    hscSscQuestionBank,
    engineeringQuestionBank,
    admissionQuestionBank,
  }
}
