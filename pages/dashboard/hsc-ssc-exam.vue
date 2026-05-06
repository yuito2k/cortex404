<script setup>
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ─── MOCK USER TIER ──────────────────────────────────────────────────────────
// In production: const user = useSupabaseUser(); const isPaid = user.value?.user_metadata?.plan === 'pro'
const isPaid = ref(false) // toggle for demo — wire to Supabase user metadata

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
const questionBank = {
  // ── HSC SCIENCE ────────────────────────────────────────────────────────────
  hsc_science: {
    physics: [
      { id: 'hs-phy-1', text: 'A body moves with uniform acceleration. Which graph of velocity vs time is a straight line?', options: ['Parabola', 'Straight line through origin', 'Horizontal line', 'Hyperbola'], answer: 1, chapter: 'Kinematics', year: '2023', difficulty: 'easy' },
      { id: 'hs-phy-2', text: 'The SI unit of electric charge is:', options: ['Ampere', 'Volt', 'Coulomb', 'Ohm'], answer: 2, chapter: 'Electricity', year: '2022', difficulty: 'easy' },
      { id: 'hs-phy-3', text: 'Which law states that the pressure of a gas is inversely proportional to its volume at constant temperature?', options: ['Charles\'s Law', 'Boyle\'s Law', 'Gay-Lussac\'s Law', 'Avogadro\'s Law'], answer: 1, chapter: 'Thermodynamics', year: '2023', difficulty: 'medium' },
      { id: 'hs-phy-4', text: 'The focal length of a convex lens is positive. What does this indicate?', options: ['It is a diverging lens', 'It converges parallel rays to a point', 'It has no focal point', 'It only works in water'], answer: 1, chapter: 'Optics', year: '2022', difficulty: 'medium' },
      { id: 'hs-phy-5', text: 'Newton\'s second law of motion states that force is equal to:', options: ['mass × velocity', 'mass × acceleration', 'mass × displacement', 'mass × time'], answer: 1, chapter: 'Dynamics', year: '2023', difficulty: 'easy' },
      { id: 'hs-phy-6', text: 'Which type of wave does not require a medium for propagation?', options: ['Sound wave', 'Water wave', 'Electromagnetic wave', 'Seismic wave'], answer: 2, chapter: 'Waves', year: '2021', difficulty: 'easy' },
    ],
    chemistry: [
      { id: 'hs-chem-1', text: 'The atomic number of Carbon is:', options: ['6', '8', '12', '14'], answer: 0, chapter: 'Atomic Structure', year: '2023', difficulty: 'easy' },
      { id: 'hs-chem-2', text: 'Which of the following is an example of an exothermic reaction?', options: ['Photosynthesis', 'Electrolysis', 'Combustion of methane', 'Dissolving ammonium nitrate'], answer: 2, chapter: 'Thermochemistry', year: '2022', difficulty: 'medium' },
      { id: 'hs-chem-3', text: 'What is the formula of sulphuric acid?', options: ['HCl', 'HNO₃', 'H₂SO₄', 'H₃PO₄'], answer: 2, chapter: 'Acids & Bases', year: '2023', difficulty: 'easy' },
      { id: 'hs-chem-4', text: 'An organic compound containing a -COOH group is called a:', options: ['Alcohol', 'Ester', 'Carboxylic acid', 'Ketone'], answer: 2, chapter: 'Organic Chemistry', year: '2022', difficulty: 'medium' },
      { id: 'hs-chem-5', text: 'The process of converting a liquid to vapour below its boiling point is:', options: ['Condensation', 'Sublimation', 'Evaporation', 'Distillation'], answer: 2, chapter: 'States of Matter', year: '2023', difficulty: 'easy' },
      { id: 'hs-chem-6', text: 'Which element is the most electronegative?', options: ['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'], answer: 2, chapter: 'Periodic Table', year: '2021', difficulty: 'medium' },
    ],
    biology: [
      { id: 'hs-bio-1', text: 'Which organelle is responsible for cellular respiration?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'], answer: 2, chapter: 'Cell Biology', year: '2023', difficulty: 'easy' },
      { id: 'hs-bio-2', text: 'The process by which plants lose water through leaves is called:', options: ['Osmosis', 'Transpiration', 'Diffusion', 'Absorption'], answer: 1, chapter: 'Plant Physiology', year: '2022', difficulty: 'easy' },
      { id: 'hs-bio-3', text: 'DNA replication occurs during which phase of the cell cycle?', options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'], answer: 1, chapter: 'Genetics', year: '2023', difficulty: 'medium' },
      { id: 'hs-bio-4', text: 'Which blood cells are responsible for immunity?', options: ['Red blood cells', 'Platelets', 'White blood cells', 'Plasma cells'], answer: 2, chapter: 'Human Physiology', year: '2022', difficulty: 'easy' },
    ],
    math: [
      { id: 'hs-math-1', text: 'If f(x) = x² + 3x + 2, what is f(2)?', options: ['8', '10', '12', '6'], answer: 2, chapter: 'Functions', year: '2023', difficulty: 'easy' },
      { id: 'hs-math-2', text: 'The value of log₁₀ 1000 is:', options: ['2', '3', '4', '10'], answer: 1, chapter: 'Logarithm', year: '2022', difficulty: 'easy' },
      { id: 'hs-math-3', text: 'What is the derivative of sin(x)?', options: ['cos(x)', '-cos(x)', '-sin(x)', 'tan(x)'], answer: 0, chapter: 'Calculus', year: '2023', difficulty: 'medium' },
      { id: 'hs-math-4', text: 'If sin θ = 3/5, what is cos θ?', options: ['4/5', '3/4', '5/3', '1/2'], answer: 0, chapter: 'Trigonometry', year: '2022', difficulty: 'medium' },
    ],
    ict: [
      { id: 'hs-ict-1', text: 'The binary representation of decimal 15 is:', options: ['1010', '1111', '1101', '1100'], answer: 1, chapter: 'Number Systems', year: '2023', difficulty: 'easy' },
      { id: 'hs-ict-2', text: 'Which generation of computers used vacuum tubes?', options: ['Second', 'Third', 'First', 'Fourth'], answer: 2, chapter: 'Computer History', year: '2022', difficulty: 'easy' },
    ],
    english: [
      { id: 'hs-eng-1', text: 'Choose the correct sentence:', options: ['He go to school.', 'He goes to school.', 'He going to school.', 'He gone to school.'], answer: 1, chapter: 'Grammar', year: '2023', difficulty: 'easy' },
      { id: 'hs-eng-2', text: 'The antonym of "benevolent" is:', options: ['Generous', 'Malevolent', 'Friendly', 'Kind'], answer: 1, chapter: 'Vocabulary', year: '2022', difficulty: 'medium' },
    ],
  },

  // ── HSC ARTS ───────────────────────────────────────────────────────────────
  hsc_arts: {
    bangla: [
      { id: 'ha-ban-1', text: '"বিদ্রোহী" কবিতাটি প্রথম কোন পত্রিকায় প্রকাশিত হয়?', options: ['সওগাত', 'কল্লোল', 'বিজলী', 'প্রবাসী'], answer: 2, chapter: 'কাব্যসাহিত্য', year: '2023', difficulty: 'medium' },
      { id: 'ha-ban-2', text: '"সোনার তরী" কাব্যগ্রন্থের রচয়িতা কে?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জীবনানন্দ দাশ', 'সুকান্ত ভট্টাচার্য'], answer: 1, chapter: 'বাংলা সাহিত্য', year: '2022', difficulty: 'easy' },
      { id: 'ha-ban-3', text: 'বাংলা ভাষায় মৌলিক স্বরধ্বনি কয়টি?', options: ['৫টি', '৬টি', '৭টি', '৮টি'], answer: 2, chapter: 'ব্যাকরণ', year: '2023', difficulty: 'medium' },
      { id: 'ha-ban-4', text: '"পথের পাঁচালী" উপন্যাসটি কার রচনা?', options: ['রবীন্দ্রনাথ ঠাকুর', 'মানিক বন্দ্যোপাধ্যায়', 'বিভূতিভূষণ বন্দ্যোপাধ্যায়', 'শরৎচন্দ্র চট্টোপাধ্যায়'], answer: 2, chapter: 'উপন্যাস', year: '2022', difficulty: 'easy' },
    ],
    english: [
      { id: 'ha-eng-1', text: 'Who wrote "Hamlet"?', options: ['Charles Dickens', 'William Shakespeare', 'John Keats', 'George Orwell'], answer: 1, chapter: 'Literature', year: '2023', difficulty: 'easy' },
      { id: 'ha-eng-2', text: 'The past tense of "write" is:', options: ['written', 'writed', 'wrote', 'writing'], answer: 2, chapter: 'Grammar', year: '2022', difficulty: 'easy' },
      { id: 'ha-eng-3', text: 'Choose the correct passive voice: "She writes a letter":', options: ['A letter was written by her.', 'A letter is written by her.', 'A letter is being written by her.', 'A letter has been written by her.'], answer: 1, chapter: 'Grammar', year: '2023', difficulty: 'medium' },
    ],
    history: [
      { id: 'ha-his-1', text: 'মুক্তিযুদ্ধের সময় বাংলাদেশ কতটি সেক্টরে বিভক্ত ছিল?', options: ['৯টি', '১০টি', '১১টি', '১২টি'], answer: 2, chapter: 'বাংলাদেশের ইতিহাস', year: '2023', difficulty: 'easy' },
      { id: 'ha-his-2', text: 'ছয় দফা কর্মসূচি কোন সালে ঘোষণা করা হয়?', options: ['১৯৬৪', '১৯৬৬', '১৯৬৮', '১৯৭০'], answer: 1, chapter: 'রাজনৈতিক ইতিহাস', year: '2022', difficulty: 'medium' },
    ],
    civics: [
      { id: 'ha-civ-1', text: 'বাংলাদেশের সংবিধান কত সালে প্রণীত হয়?', options: ['১৯৭১', '১৯৭২', '১৯৭৩', '১৯৭৫'], answer: 1, chapter: 'সংবিধান', year: '2023', difficulty: 'easy' },
      { id: 'ha-civ-2', text: 'জাতীয় সংসদে মোট আসন সংখ্যা কত?', options: ['২৫০', '৩০০', '৩৫০', '৪০০'], answer: 1, chapter: 'সংসদীয় ব্যবস্থা', year: '2022', difficulty: 'medium' },
    ],
    ict: [
      { id: 'ha-ict-1', text: 'www stands for:', options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'], answer: 0, chapter: 'Internet', year: '2023', difficulty: 'easy' },
      { id: 'ha-ict-2', text: 'RAM stands for:', options: ['Read Access Memory', 'Random Access Memory', 'Remote Access Memory', 'Rapid Access Memory'], answer: 1, chapter: 'Hardware', year: '2022', difficulty: 'easy' },
    ],
    economics: [
      { id: 'ha-eco-1', text: 'চাহিদার সূত্র অনুযায়ী দাম বাড়লে চাহিদা:', options: ['বাড়ে', 'কমে', 'অপরিবর্তিত থাকে', 'অনিশ্চিত'], answer: 1, chapter: 'চাহিদা ও যোগান', year: '2023', difficulty: 'easy' },
      { id: 'ha-eco-2', text: 'GDP এর পূর্ণরূপ কী?', options: ['Gross Domestic Product', 'General Domestic Product', 'Gross Development Product', 'Gross Domestic Price'], answer: 0, chapter: 'জাতীয় আয়', year: '2022', difficulty: 'easy' },
    ],
  },

  // ── HSC COMMERCE ───────────────────────────────────────────────────────────
  hsc_commerce: {
    accounting: [
      { id: 'hc-acc-1', text: 'The accounting equation is:', options: ['Assets = Liabilities + Owner\'s Equity', 'Assets = Liabilities − Owner\'s Equity', 'Assets + Liabilities = Owner\'s Equity', 'Assets = Owner\'s Equity − Liabilities'], answer: 0, chapter: 'Accounting Fundamentals', year: '2023', difficulty: 'easy' },
      { id: 'hc-acc-2', text: 'Depreciation is charged on:', options: ['Current assets', 'Fixed assets', 'Intangible assets only', 'Liquid assets'], answer: 1, chapter: 'Depreciation', year: '2022', difficulty: 'medium' },
      { id: 'hc-acc-3', text: 'A credit entry in accounts always indicates:', options: ['An increase in assets', 'A decrease in expenses', 'An increase in liabilities or equity', 'A decrease in revenue'], answer: 2, chapter: 'Double Entry', year: '2023', difficulty: 'medium' },
      { id: 'hc-acc-4', text: 'Bank reconciliation statement is prepared to:', options: ['Calculate profit', 'Reconcile cash book and bank passbook', 'Prepare balance sheet', 'Record sales'], answer: 1, chapter: 'Cash Book', year: '2022', difficulty: 'easy' },
    ],
    business_studies: [
      { id: 'hc-bus-1', text: 'Which type of business organisation has unlimited liability?', options: ['Private limited company', 'Public limited company', 'Sole proprietorship', 'Cooperative society'], answer: 2, chapter: 'Forms of Business', year: '2023', difficulty: 'easy' },
      { id: 'hc-bus-2', text: 'SWOT analysis stands for:', options: ['Strength, Weakness, Opportunity, Threat', 'Strategy, Work, Output, Target', 'Strength, Work, Opportunity, Team', 'Sales, Workforce, Output, Trend'], answer: 0, chapter: 'Business Strategy', year: '2022', difficulty: 'easy' },
      { id: 'hc-bus-3', text: 'E-commerce refers to:', options: ['Electronic money', 'Buying/selling goods online', 'Email communication in business', 'Economic commerce'], answer: 1, chapter: 'Digital Business', year: '2023', difficulty: 'easy' },
    ],
    finance: [
      { id: 'hc-fin-1', text: 'Which financial statement shows a company\'s financial position at a specific date?', options: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'Statement of Retained Earnings'], answer: 1, chapter: 'Financial Statements', year: '2023', difficulty: 'easy' },
      { id: 'hc-fin-2', text: 'Working capital is calculated as:', options: ['Fixed assets − Current liabilities', 'Current assets − Current liabilities', 'Total assets − Total liabilities', 'Revenue − Expenses'], answer: 1, chapter: 'Working Capital', year: '2022', difficulty: 'medium' },
    ],
    bangla: [
      { id: 'hc-ban-1', text: 'ব্যবসায়িক পত্রের মূল উদ্দেশ্য কোনটি?', options: ['সাহিত্যিক প্রকাশ', 'তথ্য আদান-প্রদান', 'কবিতা রচনা', 'ইতিহাস লেখা'], answer: 1, chapter: 'বাণিজ্যিক পত্র', year: '2023', difficulty: 'easy' },
      { id: 'hc-ban-2', text: '"বাণিজ্যের" বিপরীত শব্দ কী?', options: ['ব্যবসা', 'লেনদেন', 'ভোক্তা', 'অব্যবসায়িক'], answer: 3, chapter: 'ব্যাকরণ', year: '2022', difficulty: 'medium' },
    ],
    english: [
      { id: 'hc-eng-1', text: 'A formal business letter ends with:', options: ['Yours faithfully', 'Best regards', 'Take care', 'All the best'], answer: 0, chapter: 'Business Writing', year: '2023', difficulty: 'easy' },
      { id: 'hc-eng-2', text: 'The plural of "analysis" is:', options: ['analysises', 'analysis', 'analyses', 'analysys'], answer: 2, chapter: 'Grammar', year: '2022', difficulty: 'medium' },
    ],
    ict: [
      { id: 'hc-ict-1', text: 'A spreadsheet application is primarily used for:', options: ['Writing documents', 'Numerical data and calculations', 'Creating presentations', 'Browsing the internet'], answer: 1, chapter: 'Office Applications', year: '2023', difficulty: 'easy' },
    ],
  },

  // ── SSC SCIENCE ────────────────────────────────────────────────────────────
  ssc_science: {
    physics: [
      { id: 'ss-phy-1', text: 'The speed of light in vacuum is approximately:', options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], answer: 1, chapter: 'Light', year: '2023', difficulty: 'easy' },
      { id: 'ss-phy-2', text: 'Which of the following is a vector quantity?', options: ['Speed', 'Mass', 'Time', 'Velocity'], answer: 3, chapter: 'Motion', year: '2022', difficulty: 'easy' },
      { id: 'ss-phy-3', text: 'Ohm\'s law states that V = I × ?', options: ['Power', 'Resistance', 'Frequency', 'Capacitance'], answer: 1, chapter: 'Electricity', year: '2023', difficulty: 'easy' },
      { id: 'ss-phy-4', text: 'The unit of work is:', options: ['Newton', 'Watt', 'Joule', 'Pascal'], answer: 2, chapter: 'Work & Energy', year: '2022', difficulty: 'easy' },
    ],
    chemistry: [
      { id: 'ss-chem-1', text: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2, chapter: 'Elements', year: '2023', difficulty: 'easy' },
      { id: 'ss-chem-2', text: 'Water has the chemical formula:', options: ['H₂O₂', 'HO', 'H₂O', 'H₃O'], answer: 2, chapter: 'Chemical Formulas', year: '2022', difficulty: 'easy' },
      { id: 'ss-chem-3', text: 'An acid has a pH value:', options: ['Greater than 7', 'Equal to 7', 'Less than 7', 'Equal to 14'], answer: 2, chapter: 'Acids and Bases', year: '2023', difficulty: 'easy' },
    ],
    biology: [
      { id: 'ss-bio-1', text: 'Photosynthesis occurs in which part of the plant cell?', options: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'], answer: 2, chapter: 'Plant Biology', year: '2023', difficulty: 'easy' },
      { id: 'ss-bio-2', text: 'The human heart has how many chambers?', options: ['2', '3', '4', '5'], answer: 2, chapter: 'Human Anatomy', year: '2022', difficulty: 'easy' },
      { id: 'ss-bio-3', text: 'Which nutrient provides the most energy per gram?', options: ['Carbohydrates', 'Protein', 'Fat', 'Vitamins'], answer: 2, chapter: 'Nutrition', year: '2023', difficulty: 'medium' },
    ],
    math: [
      { id: 'ss-math-1', text: 'The square root of 144 is:', options: ['11', '12', '13', '14'], answer: 1, chapter: 'Arithmetic', year: '2023', difficulty: 'easy' },
      { id: 'ss-math-2', text: 'If 2x + 4 = 10, then x =?', options: ['2', '3', '4', '5'], answer: 1, chapter: 'Algebra', year: '2022', difficulty: 'easy' },
      { id: 'ss-math-3', text: 'The area of a circle with radius r is:', options: ['2πr', 'πr²', '2πr²', 'πr'], answer: 1, chapter: 'Geometry', year: '2023', difficulty: 'easy' },
    ],
    ict: [
      { id: 'ss-ict-1', text: 'CPU stands for:', options: ['Central Processing Unit', 'Computer Processing Unit', 'Central Program Unit', 'Central Power Unit'], answer: 0, chapter: 'Computer Basics', year: '2023', difficulty: 'easy' },
      { id: 'ss-ict-2', text: '1 Byte = how many bits?', options: ['4', '8', '16', '32'], answer: 1, chapter: 'Data Storage', year: '2022', difficulty: 'easy' },
    ],
    english: [
      { id: 'ss-eng-1', text: 'The plural of "child" is:', options: ['childs', 'childes', 'children', 'childre'], answer: 2, chapter: 'Grammar', year: '2023', difficulty: 'easy' },
      { id: 'ss-eng-2', text: 'A word that describes a noun is called a:', options: ['Verb', 'Adverb', 'Adjective', 'Pronoun'], answer: 2, chapter: 'Parts of Speech', year: '2022', difficulty: 'easy' },
    ],
  },

  // ── SSC ARTS ───────────────────────────────────────────────────────────────
  ssc_arts: {
    bangla: [
      { id: 'sa-ban-1', text: '"আমার ভাইয়ের রক্তে রাঙানো একুশে ফেব্রুয়ারী" গানটির রচয়িতা কে?', options: ['আবদুল গাফফার চৌধুরী', 'শামসুর রাহমান', 'কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর'], answer: 0, chapter: 'বাংলা সাহিত্য', year: '2023', difficulty: 'easy' },
      { id: 'sa-ban-2', text: 'বাংলা ব্যঞ্জনবর্ণের সংখ্যা কত?', options: ['৩৯টি', '৪০টি', '৩৮টি', '৪১টি'], answer: 0, chapter: 'ব্যাকরণ', year: '2022', difficulty: 'easy' },
      { id: 'sa-ban-3', text: '"একাত্তরের দিনগুলি" গ্রন্থটির লেখক কে?', options: ['হুমায়ূন আহমেদ', 'জাহানারা ইমাম', 'সেলিনা হোসেন', 'রাবেয়া খাতুন'], answer: 1, chapter: 'মুক্তিযুদ্ধের সাহিত্য', year: '2023', difficulty: 'medium' },
    ],
    english: [
      { id: 'sa-eng-1', text: 'What is the capital of the United Kingdom?', options: ['Paris', 'Berlin', 'London', 'Madrid'], answer: 2, chapter: 'General Knowledge', year: '2023', difficulty: 'easy' },
      { id: 'sa-eng-2', text: 'The opposite of "ancient" is:', options: ['Old', 'Antique', 'Modern', 'Historic'], answer: 2, chapter: 'Vocabulary', year: '2022', difficulty: 'easy' },
    ],
    history: [
      { id: 'sa-his-1', text: 'ভাষা আন্দোলন কত সালে সংঘটিত হয়?', options: ['১৯৪৮', '১৯৫২', '১৯৫৪', '১৯৫৬'], answer: 1, chapter: 'ভাষা আন্দোলন', year: '2023', difficulty: 'easy' },
      { id: 'sa-his-2', text: 'বাংলাদেশের স্বাধীনতার ঘোষণাপত্র কোথায় পাঠ করা হয়?', options: ['ঢাকায়', 'চট্টগ্রামে', 'কুমিল্লায়', 'সিলেটে'], answer: 1, chapter: 'মুক্তিযুদ্ধ', year: '2022', difficulty: 'medium' },
    ],
    civics: [
      { id: 'sa-civ-1', text: 'বাংলাদেশের জাতীয় সংগীতের রচয়িতা কে?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'সুকান্ত ভট্টাচার্য', 'জীবনানন্দ দাশ'], answer: 1, chapter: 'জাতীয় পরিচয়', year: '2023', difficulty: 'easy' },
    ],
    ict: [
      { id: 'sa-ict-1', text: 'Email এর পূর্ণরূপ কী?', options: ['Electronic Mail', 'Easy Mail', 'External Mail', 'Express Mail'], answer: 0, chapter: 'ইন্টারনেট', year: '2023', difficulty: 'easy' },
    ],
    economics: [
      { id: 'sa-eco-1', text: 'বাংলাদেশের প্রধান রপ্তানি পণ্য কোনটি?', options: ['পাট', 'চা', 'তৈরি পোশাক', 'চামড়া'], answer: 2, chapter: 'বাংলাদেশের অর্থনীতি', year: '2023', difficulty: 'easy' },
    ],
  },

  // ── SSC COMMERCE ───────────────────────────────────────────────────────────
  ssc_commerce: {
    accounting: [
      { id: 'sc-acc-1', text: 'Journal is also known as:', options: ['Ledger', 'Book of original entry', 'Trial balance', 'Balance sheet'], answer: 1, chapter: 'Basic Accounting', year: '2023', difficulty: 'easy' },
      { id: 'sc-acc-2', text: 'Debit means:', options: ['Credit side entry', 'Left side of an account', 'Right side of an account', 'Net balance'], answer: 1, chapter: 'Double Entry', year: '2022', difficulty: 'easy' },
      { id: 'sc-acc-3', text: 'Gross profit = Net sales −', options: ['Operating expenses', 'Cost of goods sold', 'Net profit', 'Total expenses'], answer: 1, chapter: 'Trading Account', year: '2023', difficulty: 'easy' },
    ],
    business_studies: [
      { id: 'sc-bus-1', text: 'The process of planning, organizing, leading and controlling is known as:', options: ['Marketing', 'Management', 'Economics', 'Finance'], answer: 1, chapter: 'Business Management', year: '2023', difficulty: 'easy' },
      { id: 'sc-bus-2', text: 'Which is NOT a function of an entrepreneur?', options: ['Innovation', 'Risk-taking', 'Consuming goods', 'Capital formation'], answer: 2, chapter: 'Entrepreneurship', year: '2022', difficulty: 'easy' },
    ],
    bangla: [
      { id: 'sc-ban-1', text: 'বাণিজ্যিক পত্রে কতটি অংশ থাকে?', options: ['৫টি', '৭টি', '৬টি', '৮টি'], answer: 1, chapter: 'বাণিজ্যিক পত্র', year: '2023', difficulty: 'medium' },
    ],
    english: [
      { id: 'sc-eng-1', text: 'In business writing, "B2B" means:', options: ['Back to Back', 'Business to Business', 'Buy to Buy', 'Brand to Brand'], answer: 1, chapter: 'Business Terms', year: '2023', difficulty: 'easy' },
    ],
    ict: [
      { id: 'sc-ict-1', text: 'Microsoft Excel is a:', options: ['Word processor', 'Database software', 'Spreadsheet application', 'Presentation tool'], answer: 2, chapter: 'Office Software', year: '2023', difficulty: 'easy' },
    ],
    math: [
      { id: 'sc-math-1', text: 'Simple interest formula is:', options: ['P × R × T', '(P × R × T) / 100', 'P + R + T', 'P × R / T'], answer: 1, chapter: 'Commercial Math', year: '2023', difficulty: 'easy' },
      { id: 'sc-math-2', text: 'If profit % = 20% and cost price = 500, find selling price:', options: ['520', '580', '600', '540'], answer: 2, chapter: 'Profit & Loss', year: '2022', difficulty: 'medium' },
    ],
  },
}

// ─── WRITTEN QUESTIONS (paid only) ───────────────────────────────────────────
const writtenQuestions = {
  hsc_science: [
    { id: 'w-hs-1', type: 'short', marks: 4, text: 'State Newton\'s three laws of motion with one example each. How do these laws apply to everyday life situations?', subject: 'Physics', chapter: 'Dynamics', year: '2023' },
    { id: 'w-hs-2', type: 'creative', marks: 10, text: 'পাদটীকা: হাইড্রোকার্বনের রাসায়নিক বৈশিষ্ট্য\n\n(ক) অ্যালকেনের সাধারণ সূত্র লিখ। (খ) মিথেনের গঠন ব্যাখ্যা কর। (গ) ইথিলিন ও অ্যাসিটিলিনের মধ্যে পার্থক্য দেখাও। (ঘ) পেট্রোলিয়াম পরিশোধনের পদ্ধতি বিশ্লেষণ কর।', subject: 'Chemistry', chapter: 'Organic Chemistry', year: '2023' },
    { id: 'w-hs-3', type: 'creative', marks: 10, text: 'একটি বাস্তুসংস্থানে শক্তি প্রবাহ ও পদার্থের চক্রের গুরুত্ব বিশ্লেষণ কর। বায়োজিওকেমিক্যাল চক্রের উদাহরণ দিয়ে ব্যাখ্যা কর কীভাবে কার্বন এবং নাইট্রোজেন পরিবেশে চক্রাকারে আবর্তিত হয়।', subject: 'Biology', chapter: 'Ecology', year: '2022' },
  ],
  hsc_arts: [
    { id: 'w-ha-1', type: 'short', marks: 4, text: '"বিদ্রোহী" কবিতায় কবির স্বদেশপ্রেম ও মানবতাবাদী চেতনার বিশ্লেষণ করো।', subject: 'বাংলা', chapter: 'কাব্যসাহিত্য', year: '2023' },
    { id: 'w-ha-2', type: 'creative', marks: 10, text: 'পাদটীকা: ভাষা আন্দোলন ও বাংলাদেশের জাতীয় পরিচয়\n\n(ক) ভাষা আন্দোলনের পটভূমি বর্ণনা কর। (খ) ২১ ফেব্রুয়ারির ঘটনাবলী ব্যাখ্যা কর। (গ) ভাষা আন্দোলনের ফলাফল বিশ্লেষণ কর। (ঘ) বাঙালি জাতীয়তাবাদে ভাষা আন্দোলনের প্রভাব মূল্যায়ন কর।', subject: 'ইতিহাস', chapter: 'ভাষা আন্দোলন', year: '2022' },
    { id: 'w-ha-3', type: 'creative', marks: 10, text: 'বাংলাদেশের গণতান্ত্রিক ব্যবস্থা এবং নাগরিকের অধিকার ও কর্তব্য সম্পর্কে একটি বিশ্লেষণমূলক প্রবন্ধ লিখ। নাগরিক সমাজের ভূমিকা এবং সুশাসনের জন্য করণীয় বিষয়সমূহও আলোচনা কর।', subject: 'পৌরনীতি', chapter: 'গণতন্ত্র', year: '2023' },
  ],
  hsc_commerce: [
    { id: 'w-hc-1', type: 'short', marks: 4, text: 'Explain the double-entry system of bookkeeping with an example transaction. Why is it considered the most reliable accounting system?', subject: 'Accounting', chapter: 'Double Entry', year: '2023' },
    { id: 'w-hc-2', type: 'creative', marks: 10, text: 'Creative Question: Business Environment Analysis\n\n(a) Define internal and external business environment. (b) Explain PESTEL factors with examples from Bangladesh context. (c) Analyze how global trade affects local businesses. (d) Evaluate strategies a small business can use to compete in a globalized market.', subject: 'Business Studies', chapter: 'Business Environment', year: '2022' },
  ],
  ssc_science: [
    { id: 'w-ss-1', type: 'short', marks: 4, text: 'Explain photosynthesis with a diagram. What are the products and raw materials? How does light affect the rate of photosynthesis?', subject: 'Biology', chapter: 'Plant Biology', year: '2023' },
    { id: 'w-ss-2', type: 'creative', marks: 10, text: 'Creative Question: Electricity in Daily Life\n\n(a) State Ohm\'s law. (b) Draw a simple circuit diagram. (c) Calculate the resistance if V = 12V and I = 3A. (d) Discuss the safety measures we should take while using electricity at home.', subject: 'Physics', chapter: 'Electricity', year: '2022' },
  ],
  ssc_arts: [
    { id: 'w-sa-1', type: 'short', marks: 4, text: 'বাংলাদেশের মুক্তিযুদ্ধে সাধারণ মানুষের ভূমিকা বর্ণনা কর। তাদের আত্মত্যাগ কীভাবে স্বাধীনতা অর্জনে সহায়ক হয়েছিল?', subject: 'ইতিহাস', chapter: 'মুক্তিযুদ্ধ', year: '2023' },
    { id: 'w-sa-2', type: 'creative', marks: 10, text: 'সৃজনশীল প্রশ্ন: বাংলা সাহিত্য\n\nউদ্দীপক: "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি..."\n\n(ক) কবিতাটির রচয়িতার নাম লিখ। (খ) কবিতায় দেশপ্রেমের প্রকাশ ব্যাখ্যা কর। (গ) স্বদেশের প্রতি ভালোবাসার যে চিত্র তুলে ধরা হয়েছে তা বিশ্লেষণ কর। (ঘ) বর্তমান সময়ে দেশপ্রেম চর্চার গুরুত্ব মূল্যায়ন কর।', subject: 'বাংলা', chapter: 'কবিতা', year: '2022' },
  ],
  ssc_commerce: [
    { id: 'w-sc-1', type: 'short', marks: 4, text: 'Describe the importance of bookkeeping for a small business. What problems can arise if proper books of accounts are not maintained?', subject: 'Accounting', chapter: 'Bookkeeping', year: '2023' },
    { id: 'w-sc-2', type: 'creative', marks: 10, text: 'Creative Question: Entrepreneurship in Bangladesh\n\n(a) Define an entrepreneur. (b) List 4 qualities of a successful entrepreneur. (c) Explain the challenges faced by young entrepreneurs in Bangladesh. (d) Suggest how government and NGOs can support small business development.', subject: 'Business Studies', chapter: 'Entrepreneurship', year: '2022' },
  ],
}

// ─── EXAM CONFIGURATIONS ────────────────────────────────────────────────────
const examTypes = {
  hsc: {
    label: 'HSC', fullLabel: 'Higher Secondary Certificate',
    icon: '🎓', authority: 'Bangladesh Education Board',
    totalMcq: 25, mcqDuration: 25,
    writtenQuestions: 3, writtenDuration: 120,
    negativeMarking: 0.25, passScore: 33,
    groups: [
      { key: 'hsc_science', label: 'Science', icon: '⚗️', subjects: { physics: 5, chemistry: 5, biology: 4, math: 4, ict: 2, english: 3 } },
      { key: 'hsc_arts', label: 'Arts / Humanities', icon: '📚', subjects: { bangla: 5, english: 4, history: 3, civics: 3, ict: 2, economics: 4 } },
      { key: 'hsc_commerce', label: 'Commerce', icon: '📊', subjects: { accounting: 4, business_studies: 5, finance: 3, bangla: 3, english: 3, ict: 2 } },
    ]
  },
  ssc: {
    label: 'SSC', fullLabel: 'Secondary School Certificate',
    icon: '📝', authority: 'Bangladesh Education Board',
    totalMcq: 20, mcqDuration: 20,
    writtenQuestions: 2, writtenDuration: 100,
    negativeMarking: 0.25, passScore: 33,
    groups: [
      { key: 'ssc_science', label: 'Science', icon: '🔬', subjects: { physics: 4, chemistry: 4, biology: 4, math: 3, ict: 2, english: 3 } },
      { key: 'ssc_arts', label: 'Arts / Humanities', icon: '🖊️', subjects: { bangla: 5, english: 3, history: 3, civics: 2, ict: 2, economics: 2 } },
      { key: 'ssc_commerce', label: 'Commerce', icon: '💼', subjects: { accounting: 4, business_studies: 4, bangla: 3, english: 2, ict: 2, math: 3 } },
    ]
  }
}

const subjectLabels = {
  physics: 'Physics', chemistry: 'Chemistry', biology: 'Biology', math: 'Math',
  ict: 'ICT', english: 'English', bangla: 'Bangla', history: 'History',
  civics: 'Civics', economics: 'Economics', accounting: 'Accounting',
  business_studies: 'Bus. Studies', finance: 'Finance',
}

// ─── STATE ────────────────────────────────────────────────────────────────────
const phase = ref('setup')             // 'setup' | 'mcq' | 'written_intro' | 'written' | 'results'
const selectedExamType = ref(null)     // 'hsc' | 'ssc'
const selectedGroupKey = ref(null)
const questions = ref([])
const answers = ref({})
const flagged = ref(new Set())
const currentIdx = ref(0)
const timeLeft = ref(0)
const timerInterval = ref(null)
const showEndModal = ref(false)
const showNegativeWarning = ref(false)
const filterTab = ref('all')
const showSubjectBreakdown = ref(false)

// Written section state
const writtenAnswers = ref({})         // { questionId: { text: '', imageBase64: '', imageUrl: '' } }
const currentWrittenIdx = ref(0)
const writtenTimeLeft = ref(0)
const writtenTimerInterval = ref(null)
const writtenQuestionsList = ref([])
const imageUploadRefs = ref({})

// ─── COMPUTED ─────────────────────────────────────────────────────────────────
const examConfig = computed(() => selectedExamType.value ? examTypes[selectedExamType.value] : null)
const selectedGroup = computed(() => {
  if (!examConfig.value || !selectedGroupKey.value) return null
  return examConfig.value.groups.find(g => g.key === selectedGroupKey.value)
})

const canStart = computed(() => selectedExamType.value && selectedGroupKey.value)

const timerClass = computed(() => {
  const t = phase.value === 'written' ? writtenTimeLeft.value : timeLeft.value
  if (t <= 30) return 'critical'
  if (t <= 120) return 'warning'
  return ''
})

const timerDisplay = computed(() => {
  const t = phase.value === 'written' ? writtenTimeLeft.value : timeLeft.value
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = (t % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const answeredCount = computed(() => Object.keys(answers.value).length)
const flaggedCount = computed(() => flagged.value.size)
const progressPct = computed(() => questions.value.length ? (answeredCount.value / questions.value.length) * 100 : 0)

const scoreData = computed(() => {
  if (!examConfig.value) return {}
  let correct = 0, wrong = 0, skipped = 0
  questions.value.forEach(q => {
    if (answers.value[q.id] === undefined) skipped++
    else if (answers.value[q.id] === q.answer) correct++
    else wrong++
  })
  const raw = correct - wrong * examConfig.value.negativeMarking
  const total = questions.value.length
  const pct = total ? Math.max(0, (raw / total) * 100) : 0
  return { correct, wrong, skipped, raw: Math.max(0, raw).toFixed(2), total, pct: pct.toFixed(1) }
})

const gradeInfo = computed(() => {
  const p = parseFloat(scoreData.value.pct || 0)
  if (p >= 80) return { letter: 'A+', label: 'Excellent', cls: 'grade-high' }
  if (p >= 70) return { letter: 'A', label: 'Very Good', cls: 'grade-high' }
  if (p >= 60) return { letter: 'B', label: 'Good', cls: 'grade-mid' }
  if (p >= 50) return { letter: 'C', label: 'Average', cls: 'grade-mid' }
  if (p >= 40) return { letter: 'D', label: 'Pass', cls: 'grade-low' }
  return { letter: 'F', label: 'Fail', cls: 'grade-fail' }
})

const filteredReview = computed(() => {
  if (filterTab.value === 'correct') return questions.value.filter(q => answers.value[q.id] === q.answer)
  if (filterTab.value === 'wrong') return questions.value.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer)
  if (filterTab.value === 'skipped') return questions.value.filter(q => answers.value[q.id] === undefined)
  return questions.value
})

const subjectBreakdown = computed(() => {
  if (!selectedGroup.value) return []
  return Object.keys(selectedGroup.value.subjects).map(subj => {
    const qs = questions.value.filter(q => q.subject === subj)
    const correct = qs.filter(q => answers.value[q.id] === q.answer).length
    const wrong = qs.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer).length
    const total = qs.length
    const pct = total ? ((correct - wrong * 0.25) / total * 100).toFixed(1) : '0.0'
    return { subj, label: subjectLabels[subj] || subj, correct, wrong, skipped: total - correct - wrong, total, pct }
  }).filter(s => s.total > 0)
})

const writtenTotalMarks = computed(() => writtenQuestionsList.value.reduce((sum, q) => sum + q.marks, 0))

// ─── EXAM LOGIC ───────────────────────────────────────────────────────────────
function buildMcqQuestions() {
  const bank = questionBank[selectedGroupKey.value] || {}
  const pool = []
  const subjects = selectedGroup.value.subjects
  Object.keys(subjects).forEach(subj => {
    const needed = subjects[subj]
    const available = bank[subj] || []
    const tagged = available.map(q => ({ ...q, subject: subj }))
    const shuffled = [...tagged].sort(() => Math.random() - 0.5)
    pool.push(...shuffled.slice(0, needed))
  })
  questions.value = pool.sort(() => Math.random() - 0.5)
}

function buildWrittenQuestions() {
  const wqs = writtenQuestions[selectedGroupKey.value] || []
  writtenQuestionsList.value = [...wqs].sort(() => Math.random() - 0.5).slice(0, examConfig.value.writtenQuestions)
  writtenAnswers.value = {}
  writtenQuestionsList.value.forEach(q => {
    writtenAnswers.value[q.id] = { text: '', imageBase64: '', imageUrl: '' }
  })
}

function startExam() {
  showNegativeWarning.value = false
  buildMcqQuestions()
  answers.value = {}
  flagged.value = new Set()
  currentIdx.value = 0
  timeLeft.value = examConfig.value.mcqDuration * 60
  phase.value = 'mcq'
  nextTick(() => setupObserver())
  startMcqTimer()
}

function startMcqTimer() {
  clearInterval(timerInterval.value)
  timerInterval.value = setInterval(() => {
    if (timeLeft.value <= 0) { submitMcq(); return }
    timeLeft.value--
  }, 1000)
}

function submitMcq() {
  clearInterval(timerInterval.value)
  showEndModal.value = false
  if (isPaid.value) {
    phase.value = 'written_intro'
    buildWrittenQuestions()
  } else {
    phase.value = 'results'
    filterTab.value = 'all'
  }
}

function startWritten() {
  currentWrittenIdx.value = 0
  writtenTimeLeft.value = examConfig.value.writtenDuration * 60
  phase.value = 'written'
  startWrittenTimer()
}

function startWrittenTimer() {
  clearInterval(writtenTimerInterval.value)
  writtenTimerInterval.value = setInterval(() => {
    if (writtenTimeLeft.value <= 0) { submitWritten(); return }
    writtenTimeLeft.value--
  }, 1000)
}

function submitWritten() {
  clearInterval(writtenTimerInterval.value)
  phase.value = 'results'
  filterTab.value = 'all'
}

function toggleFlag(id) {
  const f = new Set(flagged.value)
  f.has(id) ? f.delete(id) : f.add(id)
  flagged.value = f
}

function scrollToQuestion(i) {
  const el = document.getElementById(`question-${i}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleImageUpload(questionId, event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    writtenAnswers.value[questionId].imageBase64 = e.target.result
    writtenAnswers.value[questionId].imageUrl = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeImage(questionId) {
  writtenAnswers.value[questionId].imageBase64 = ''
  writtenAnswers.value[questionId].imageUrl = ''
}

function resetToSetup() {
  clearInterval(timerInterval.value)
  clearInterval(writtenTimerInterval.value)
  phase.value = 'setup'
  selectedExamType.value = null
  selectedGroupKey.value = null
  questions.value = []
  answers.value = {}
  flagged.value = new Set()
  writtenAnswers.value = {}
  writtenQuestionsList.value = []
}

let observer = null
function setupObserver() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = parseInt(e.target.dataset.idx)
        if (!isNaN(idx)) currentIdx.value = idx
      }
    })
  }, { threshold: 0.4 })
  questions.value.forEach((_, i) => {
    const el = document.getElementById(`question-${i}`)
    if (el) observer.observe(el)
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function diffClass(d) {
  if (d === 'easy') return 'diff-easy'
  if (d === 'hard') return 'diff-hard'
  return 'diff-med'
}

function reviewOptClass(q, idx) {
  if (idx === q.answer) return 'rc-correct'
  if (answers.value[q.id] === idx && idx !== q.answer) return 'rc-wrong'
  return ''
}
</script>

<template>
  <div class="exam-page">

    <!-- ══════════════════ SETUP PHASE ══════════════════ -->
    <div v-if="phase === 'setup'" class="setup-phase">
      <div class="page-header">
        <div>
          <span class="page-chip"><span class="chip-dot"></span>HSC · SSC EXAM</span>
          <h1 class="page-title">Board <span class="text-outline">Exam Prep</span></h1>
          <p class="page-desc">Full mock exams for HSC & SSC across Science, Arts and Commerce groups. Free members get MCQ. Pro members get MCQ + Written.</p>
        </div>
        <div class="tier-badge" :class="isPaid ? 'tier-pro' : 'tier-free'">
          <div class="tier-icon">{{ isPaid ? '⭐' : '🔓' }}</div>
          <div>
            <div class="tier-label">{{ isPaid ? 'PRO MEMBER' : 'FREE MEMBER' }}</div>
            <div class="tier-sub">{{ isPaid ? 'MCQ + Written sections' : 'MCQ only · Upgrade for Written' }}</div>
          </div>
          <!-- Demo toggle -->
          <button class="tier-toggle iso-btn iso-btn--ghost" @click="isPaid = !isPaid" style="font-size:0.55rem;padding:5px 10px;">
            {{ isPaid ? 'Demo: Switch to Free' : 'Demo: Switch to Pro' }}
          </button>
        </div>
      </div>

      <!-- Exam Type Selection -->
      <div class="type-section">
        <div class="section-label-row">
          <span class="section-pill">SELECT EXAM TYPE</span>
          <div class="section-line"></div>
        </div>
        <div class="type-grid">
          <div
            v-for="(config, key) in examTypes"
            :key="key"
            class="type-card"
            :class="{ 'type-card--active': selectedExamType === key }"
            @click="selectedExamType = key; selectedGroupKey = null"
          >
            <div class="type-card-corner tl"></div>
            <div class="type-card-corner br"></div>
            <div class="type-card-top">
              <span class="type-icon">{{ config.icon }}</span>
              <span class="type-label">{{ config.label }}</span>
            </div>
            <div class="type-full">{{ config.fullLabel }}</div>
            <div class="type-authority">{{ config.authority }}</div>
            <div class="type-meta-row">
              <span class="meta-pill">{{ config.totalMcq }}Q MCQ</span>
              <span class="meta-pill">{{ config.mcqDuration }} min</span>
              <span v-if="isPaid" class="meta-pill meta-pill--written">+Written {{ config.writtenDuration }}min</span>
              <span class="meta-pill">Pass: {{ config.passScore }}%</span>
            </div>
            <div class="type-sections-row">
              <span class="section-tag-item">{{ config.groups.length }} Groups</span>
              <span v-if="isPaid" class="section-tag-item section-tag-written">MCQ + Written</span>
              <span v-else class="section-tag-item section-tag-free">MCQ Only</span>
            </div>
            <div class="type-select-label">
              <span v-if="selectedExamType === key">✓ SELECTED</span>
              <span v-else>SELECT →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Group Selection -->
      <transition name="slide-down">
        <div v-if="selectedExamType" class="group-section">
          <div class="section-label-row">
            <span class="section-pill">SELECT GROUP</span>
            <div class="section-line"></div>
          </div>
          <div class="group-grid">
            <div
              v-for="group in examConfig.groups"
              :key="group.key"
              class="group-card"
              :class="{ 'group-card--active': selectedGroupKey === group.key }"
              @click="selectedGroupKey = group.key"
            >
              <div class="group-card-corner tl"></div>
              <div class="group-card-corner br"></div>
              <div class="group-header">
                <span class="group-icon">{{ group.icon }}</span>
                <span class="group-label">{{ group.label }}</span>
                <span v-if="selectedGroupKey === group.key" class="group-check">✓</span>
              </div>
              <div class="group-subjects">
                <div v-for="(count, subj) in group.subjects" :key="subj" class="group-subj-row">
                  <span class="group-subj-name">{{ subjectLabels[subj] || subj }}</span>
                  <div class="group-subj-bar-track">
                    <div class="group-subj-bar" :style="{ width: (count / Object.values(group.subjects).reduce((a,b)=>a+b,0) * 100) + '%' }"></div>
                  </div>
                  <span class="group-subj-count">{{ count }}Q</span>
                </div>
              </div>
              <div class="group-sections">
                <span class="group-section-tag">MCQ</span>
                <span v-if="isPaid" class="group-section-tag group-section-written">Written</span>
                <span v-else class="group-section-tag group-section-locked">Written 🔒</span>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- What to Expect -->
      <div v-if="selectedGroupKey" class="expect-panel">
        <div class="expect-header">EXAM STRUCTURE</div>
        <div class="expect-grid">
          <div class="expect-item">
            <div class="expect-label">SECTION 1 — MCQ</div>
            <div class="expect-val">{{ examConfig.totalMcq }} Questions</div>
            <div class="expect-sub">{{ examConfig.mcqDuration }} min · −0.25 negative marking</div>
          </div>
          <div class="expect-item" :class="{ 'expect-item--locked': !isPaid }">
            <div class="expect-label">SECTION 2 — WRITTEN {{ !isPaid ? '🔒 PRO' : '' }}</div>
            <div class="expect-val">{{ examConfig.writtenQuestions }} Questions</div>
            <div class="expect-sub">{{ examConfig.writtenDuration }} min · Mix of short & creative · Image upload allowed</div>
          </div>
        </div>
      </div>

      <!-- CTA Bar -->
      <div v-if="canStart" class="cta-bar">
        <div class="cta-left">
          <div class="cta-name">{{ examConfig.label }} — {{ selectedGroup?.label }}</div>
          <div class="cta-meta">
            <span>{{ examConfig.totalMcq }} MCQ Questions</span>
            <span>·</span>
            <span>{{ examConfig.mcqDuration }} min</span>
            <span>·</span>
            <span class="neg-warn">−0.25 Marking</span>
            <template v-if="isPaid">
              <span>·</span>
              <span class="written-note">+Written {{ examConfig.writtenDuration }} min after MCQ</span>
            </template>
            <template v-else>
              <span>·</span>
              <span class="free-note">MCQ only (free tier)</span>
            </template>
          </div>
        </div>
        <div class="cta-right">
          <button class="iso-btn iso-btn--ghost" @click="selectedExamType = null; selectedGroupKey = null">Cancel</button>
          <button class="iso-btn iso-btn--fill" @click="showNegativeWarning = true">Start Exam →</button>
        </div>
      </div>
    </div><!-- /setup -->

    <!-- ══════════════════ NEGATIVE MARKING WARNING MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showNegativeWarning" class="modal-backdrop" @click.self="showNegativeWarning = false">
        <div class="modal neg-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="neg-icon">⚠</div>
          <div class="neg-title">MCQ NEGATIVE MARKING</div>
          <div class="neg-exam">{{ examConfig?.label }} — {{ selectedGroup?.label }}</div>
          <div class="neg-rules">
            <div class="neg-rule"><span class="nri correct-i">✓</span><div><strong>Correct</strong><span>+1.00 mark</span></div></div>
            <div class="neg-rule"><span class="nri wrong-i">✗</span><div><strong>Wrong</strong><span>−0.25 marks</span></div></div>
            <div class="neg-rule"><span class="nri skip-i">—</span><div><strong>Skipped</strong><span>0 marks</span></div></div>
          </div>
          <div v-if="isPaid" class="neg-written-note">
            <span class="neg-written-icon">✏</span>
            After MCQ, a <strong>Written section</strong> ({{ examConfig?.writtenQuestions }} questions, {{ examConfig?.writtenDuration }} min) will begin automatically.
          </div>
          <div v-else class="neg-free-note">
            <span>🔓</span> Written section is available for Pro members only. <NuxtLink to="/pricing" class="upgrade-link">Upgrade →</NuxtLink>
          </div>
          <div class="neg-formula">
            <span class="neg-formula-label">MCQ SCORE FORMULA</span>
            <div class="neg-formula-eq">Score = Correct × 1 − Wrong × 0.25</div>
          </div>
          <div class="neg-modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="showNegativeWarning = false">Go Back</button>
            <button class="iso-btn iso-btn--fill" @click="startExam">I Understand — Start</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════ MCQ PHASE ══════════════════ -->
    <div v-if="phase === 'mcq'" class="exam-phase">

      <!-- Sticky Topbar -->
      <div class="exam-topbar">
        <div class="topbar-left">
          <span class="topbar-chip">{{ examConfig.label }} · {{ selectedGroup?.label }}</span>
          <span class="topbar-section-badge">MCQ</span>
          <span class="topbar-neg">−0.25 NM</span>
          <span class="topbar-prog">{{ answeredCount }}/{{ questions.length }}</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-bar-track"><div class="topbar-bar-fill" :style="{ width: progressPct + '%' }"></div></div>
        </div>
        <div class="topbar-right">
          <div class="topbar-timer" :class="timerClass">⏱ {{ timerDisplay }}</div>
          <button class="iso-btn iso-btn--ghost topbar-end-btn" @click="showEndModal = true">End MCQ</button>
        </div>
      </div>

      <!-- Sticky Question Palette -->
      <div class="q-palette-wrap">
        <div class="q-palette">
          <button
            v-for="(q, i) in questions"
            :key="q.id"
            class="q-dot"
            :class="{ answered: answers[q.id] !== undefined, flagged: flagged.has(q.id), current: currentIdx === i }"
            @click="scrollToQuestion(i)"
            :title="`Q${i+1}`"
          >{{ i+1 }}</button>
        </div>
        <div class="palette-legend">
          <span class="legend-item"><span class="legend-dot answered"></span>Answered</span>
          <span class="legend-item"><span class="legend-dot flagged"></span>Flagged</span>
          <span class="legend-item"><span class="legend-dot"></span>Unanswered</span>
          <span v-if="isPaid" class="palette-next-hint">Written section follows after MCQ →</span>
        </div>
      </div>

      <!-- Questions List -->
      <div class="questions-list">
        <div
          v-for="(q, i) in questions"
          :key="q.id"
          :id="`question-${i}`"
          :data-idx="i"
          class="q-card"
          :class="{ 'card-answered': answers[q.id] !== undefined, 'card-flagged': flagged.has(q.id), 'card-current': currentIdx === i }"
        >
          <div class="q-card-header">
            <div class="q-meta">
              <span class="q-num">Q{{ i+1 }}</span>
              <span class="q-subject">{{ subjectLabels[q.subject] || q.subject }}</span>
              <span class="q-chapter">{{ q.chapter }}</span>
              <span :class="['q-diff', diffClass(q.difficulty)]">{{ q.difficulty.toUpperCase() }}</span>
              <span class="q-year">{{ q.year }}</span>
            </div>
            <button class="flag-btn" :class="{ 'flag-active': flagged.has(q.id) }" @click="toggleFlag(q.id)">
              {{ flagged.has(q.id) ? '🚩 Flagged' : '⚑ Flag' }}
            </button>
          </div>
          <div class="q-text">{{ q.text }}</div>
          <div class="q-options">
            <button
              v-for="(opt, idx) in q.options"
              :key="idx"
              class="q-opt"
              :class="{ 'opt-selected': answers[q.id] === idx }"
              @click="answers[q.id] = idx"
            >
              <span class="opt-letter">{{ ['A','B','C','D'][idx] }}</span>
              <span class="opt-text">{{ opt }}</span>
            </button>
          </div>
          <div class="q-card-footer">
            <span class="neg-reminder" :class="{ 'skip-note': answers[q.id] === undefined }">
              {{ answers[q.id] !== undefined ? 'Selected — skip to avoid −0.25 if unsure' : 'Not answered — no penalty for skipping' }}
            </span>
            <button v-if="answers[q.id] !== undefined" class="clear-btn" @click="delete answers[q.id]">✕ Clear</button>
          </div>
        </div>

        <!-- Submit Bar -->
        <div class="submit-bar">
          <div class="submit-stats">
            <span>Answered: <strong>{{ answeredCount }}</strong></span>
            <span>Flagged: <strong>{{ flaggedCount }}</strong></span>
            <span>Skipped: <strong>{{ questions.length - answeredCount }}</strong></span>
          </div>
          <div class="submit-actions">
            <span v-if="isPaid" class="submit-written-note">Written section will follow</span>
            <button class="iso-btn iso-btn--fill" @click="showEndModal = true">
              {{ isPaid ? 'Submit MCQ & Start Written →' : 'Submit Exam →' }}
            </button>
          </div>
        </div>
      </div>
    </div><!-- /mcq -->

    <!-- ══════════════════ END MCQ MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showEndModal && phase === 'mcq'" class="modal-backdrop" @click.self="showEndModal = false">
        <div class="modal end-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="end-title">{{ isPaid ? 'SUBMIT MCQ?' : 'SUBMIT EXAM?' }}</div>
          <div class="end-sub">{{ examConfig?.label }} — {{ selectedGroup?.label }}</div>
          <div class="end-stats-grid">
            <div class="end-stat"><span class="end-val answered-color">{{ answeredCount }}</span><span>Answered</span></div>
            <div class="end-stat"><span class="end-val flagged-color">{{ flaggedCount }}</span><span>Flagged</span></div>
            <div class="end-stat"><span class="end-val skipped-color">{{ questions.length - answeredCount }}</span><span>Skipped</span></div>
          </div>
          <div v-if="flaggedCount > 0" class="end-warn">⚠ {{ flaggedCount }} flagged question(s) still unanswered.</div>
          <div v-if="isPaid" class="end-written-note">After submitting MCQ, the Written section will begin immediately.</div>
          <div class="end-neg-note">Skipped = 0 penalty. Wrong = −0.25 per question.</div>
          <div class="end-actions">
            <button class="iso-btn iso-btn--ghost" @click="showEndModal = false">Keep Going</button>
            <button class="iso-btn iso-btn--fill" @click="submitMcq">{{ isPaid ? 'Submit & Start Written' : 'Submit Now' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════ WRITTEN INTRO ══════════════════ -->
    <div v-if="phase === 'written_intro'" class="written-intro-phase">
      <div class="wi-container">
        <div class="wi-icon">✏</div>
        <div class="wi-title">MCQ COMPLETE</div>
        <div class="wi-subtitle">Now starting the Written Section</div>
        <div class="wi-meta-grid">
          <div class="wi-meta-item">
            <div class="wi-meta-val">{{ writtenQuestionsList.length }}</div>
            <div class="wi-meta-lbl">Questions</div>
          </div>
          <div class="wi-meta-item">
            <div class="wi-meta-val">{{ examConfig.writtenDuration }}</div>
            <div class="wi-meta-lbl">Minutes</div>
          </div>
          <div class="wi-meta-item">
            <div class="wi-meta-val">{{ writtenTotalMarks }}</div>
            <div class="wi-meta-lbl">Total Marks</div>
          </div>
        </div>
        <div class="wi-rules">
          <div class="wi-rule">✓ Mix of short answer and creative questions</div>
          <div class="wi-rule">✓ You may upload an image/diagram for any question</div>
          <div class="wi-rule">✓ No negative marking in the written section</div>
          <div class="wi-rule">✓ Answers will be saved automatically</div>
        </div>
        <div class="wi-question-preview">
          <div class="wi-preview-label">QUESTION PREVIEW</div>
          <div v-for="(q, i) in writtenQuestionsList" :key="q.id" class="wi-preview-item">
            <span class="wi-preview-num">Q{{ i+1 }}</span>
            <span class="wi-preview-subj">{{ q.subject }}</span>
            <span class="wi-preview-type" :class="q.type === 'creative' ? 'type-creative' : 'type-short'">{{ q.type === 'creative' ? 'Creative' : 'Short' }}</span>
            <span class="wi-preview-marks">{{ q.marks }} marks</span>
          </div>
        </div>
        <div class="wi-actions">
          <button class="iso-btn iso-btn--ghost" @click="phase = 'results'; filterTab = 'all'">Skip Written & See Results</button>
          <button class="iso-btn iso-btn--fill" @click="startWritten">Begin Written Section →</button>
        </div>
      </div>
    </div>

    <!-- ══════════════════ WRITTEN PHASE ══════════════════ -->
    <div v-if="phase === 'written'" class="written-phase">

      <!-- Sticky Written Topbar -->
      <div class="exam-topbar written-topbar">
        <div class="topbar-left">
          <span class="topbar-chip">{{ examConfig.label }} · {{ selectedGroup?.label }}</span>
          <span class="topbar-section-badge topbar-written-badge">WRITTEN</span>
          <span class="topbar-prog">Q{{ currentWrittenIdx + 1 }}/{{ writtenQuestionsList.length }}</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-bar-track">
            <div class="topbar-bar-fill written-fill" :style="{ width: ((currentWrittenIdx) / writtenQuestionsList.length * 100) + '%' }"></div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-timer" :class="timerClass">⏱ {{ timerDisplay }}</div>
          <button class="iso-btn iso-btn--ghost topbar-end-btn" @click="submitWritten">Submit Written</button>
        </div>
      </div>

      <!-- Written Question Navigation -->
      <div class="written-q-nav">
        <button
          v-for="(q, i) in writtenQuestionsList"
          :key="q.id"
          class="wq-nav-btn"
          :class="{
            'wq-nav-active': currentWrittenIdx === i,
            'wq-nav-answered': writtenAnswers[q.id]?.text?.length > 10
          }"
          @click="currentWrittenIdx = i"
        >
          Q{{ i+1 }}
          <span class="wq-nav-marks">{{ q.marks }}m</span>
        </button>
      </div>

      <!-- Current Written Question -->
      <div class="written-question-area" v-if="writtenQuestionsList[currentWrittenIdx]">
        <div class="wq-card">
          <div class="wq-card-corner tl"></div>
          <div class="wq-card-corner br"></div>
          <div class="wq-header">
            <div class="wq-meta">
              <span class="wq-num">Q{{ currentWrittenIdx + 1 }}</span>
              <span class="wq-subject">{{ writtenQuestionsList[currentWrittenIdx].subject }}</span>
              <span class="wq-chapter">{{ writtenQuestionsList[currentWrittenIdx].chapter }}</span>
              <span :class="['wq-type', writtenQuestionsList[currentWrittenIdx].type === 'creative' ? 'type-creative' : 'type-short']">
                {{ writtenQuestionsList[currentWrittenIdx].type === 'creative' ? 'Creative' : 'Short Answer' }}
              </span>
              <span class="wq-year">{{ writtenQuestionsList[currentWrittenIdx].year }}</span>
            </div>
            <span class="wq-marks-badge">{{ writtenQuestionsList[currentWrittenIdx].marks }} marks</span>
          </div>
          <div class="wq-text">{{ writtenQuestionsList[currentWrittenIdx].text }}</div>

          <!-- Answer textarea -->
          <div class="wq-answer-section">
            <label class="wq-answer-label">YOUR ANSWER</label>
            <textarea
              class="wq-textarea"
              :placeholder="writtenQuestionsList[currentWrittenIdx].type === 'creative'
                ? 'Write your creative answer here. Address each part (ক/খ/গ/ঘ or a/b/c/d) clearly...'
                : 'Write your answer here. Be clear and concise...'"
              v-model="writtenAnswers[writtenQuestionsList[currentWrittenIdx].id].text"
              rows="8"
            ></textarea>
            <div class="wq-char-count">
              {{ writtenAnswers[writtenQuestionsList[currentWrittenIdx].id]?.text?.length || 0 }} characters
            </div>
          </div>

          <!-- Image upload (Pro only) -->
          <div class="wq-image-section">
            <div class="wq-image-label">
              <span>ATTACH DIAGRAM / IMAGE</span>
              <span class="wq-image-hint">Optional — upload a handwritten diagram or figure</span>
            </div>
            <div
              v-if="!writtenAnswers[writtenQuestionsList[currentWrittenIdx].id]?.imageUrl"
              class="wq-image-dropzone"
              @click="$refs['imgUpload_' + writtenQuestionsList[currentWrittenIdx].id]?.[0]?.click()"
            >
              <div class="wq-dropzone-icon">📎</div>
              <div class="wq-dropzone-text">Click to upload image</div>
              <div class="wq-dropzone-hint">JPG, PNG, or PDF — max 5MB</div>
              <input
                :ref="el => { if(el) imageUploadRefs['imgUpload_' + writtenQuestionsList[currentWrittenIdx].id] = [el] }"
                type="file"
                accept="image/*,.pdf"
                style="display:none"
                @change="handleImageUpload(writtenQuestionsList[currentWrittenIdx].id, $event)"
              />
            </div>
            <div v-else class="wq-image-preview">
              <img :src="writtenAnswers[writtenQuestionsList[currentWrittenIdx].id].imageUrl" alt="Uploaded diagram" class="wq-preview-img" />
              <button class="wq-remove-image" @click="removeImage(writtenQuestionsList[currentWrittenIdx].id)">✕ Remove</button>
            </div>
          </div>

          <!-- Navigation -->
          <div class="wq-nav-footer">
            <button
              class="iso-btn iso-btn--ghost"
              :disabled="currentWrittenIdx === 0"
              @click="currentWrittenIdx--"
            >← Previous</button>
            <div class="wq-nav-dots">
              <span
                v-for="(q, i) in writtenQuestionsList"
                :key="q.id"
                class="wq-nav-dot"
                :class="{
                  'wq-dot-active': currentWrittenIdx === i,
                  'wq-dot-answered': writtenAnswers[q.id]?.text?.length > 10
                }"
              ></span>
            </div>
            <button
              v-if="currentWrittenIdx < writtenQuestionsList.length - 1"
              class="iso-btn iso-btn--fill"
              @click="currentWrittenIdx++"
            >Next →</button>
            <button v-else class="iso-btn iso-btn--fill" @click="submitWritten">Submit Written →</button>
          </div>
        </div>
      </div>
    </div><!-- /written -->

    <!-- ══════════════════ RESULTS PHASE ══════════════════ -->
    <div v-if="phase === 'results'" class="results-phase">

      <!-- Score Hero -->
      <div class="score-hero">
        <div class="score-hero-corner tl"></div>
        <div class="score-hero-corner br"></div>
        <div class="score-hero-left">
          <div class="score-exam-label">{{ examConfig?.label }} — {{ selectedGroup?.label }}</div>
          <div class="score-badge-row">
            <span class="score-section-tag">MCQ</span>
            <span v-if="isPaid && writtenQuestionsList.length > 0" class="score-section-tag score-section-written">+ Written</span>
          </div>
          <div class="score-pct" :class="gradeInfo.cls">
            {{ scoreData.pct }}<span class="score-pct-sym">%</span>
          </div>
          <div class="score-raw">MCQ Raw: <strong>{{ scoreData.raw }} / {{ scoreData.total }}</strong></div>
          <div class="score-calc">
            <span class="score-calc-text">({{ scoreData.correct }}×1) − ({{ scoreData.wrong }}×0.25) = {{ scoreData.raw }}</span>
          </div>
          <div class="score-status" :class="parseFloat(scoreData.pct) >= examConfig.passScore ? 'status-pass' : 'status-fail'">
            {{ parseFloat(scoreData.pct) >= examConfig.passScore ? '✓ PASSED' : '✗ FAILED' }} · Pass: {{ examConfig.passScore }}%
          </div>
        </div>
        <div class="score-hero-right">
          <div class="grade-badge" :class="gradeInfo.cls">{{ gradeInfo.letter }}</div>
          <div class="grade-label">{{ gradeInfo.label }}</div>
          <div class="score-cards-grid">
            <div class="smc correct-card"><div class="smc-val">{{ scoreData.correct }}</div><div class="smc-lbl">Correct</div><div class="smc-mark correct-mark">+{{ scoreData.correct }}</div></div>
            <div class="smc wrong-card"><div class="smc-val">{{ scoreData.wrong }}</div><div class="smc-lbl">Wrong</div><div class="smc-mark wrong-mark">−{{ (scoreData.wrong * 0.25).toFixed(2) }}</div></div>
            <div class="smc skipped-card"><div class="smc-val">{{ scoreData.skipped }}</div><div class="smc-lbl">Skipped</div><div class="smc-mark">±0</div></div>
          </div>
        </div>
      </div>

      <!-- Subject Performance Toggle -->
      <div class="subject-perf-header" @click="showSubjectBreakdown = !showSubjectBreakdown">
        <span class="section-title-label">SUBJECT-WISE PERFORMANCE</span>
        <button class="toggle-breakdown-btn">
          {{ showSubjectBreakdown ? '▲ Hide Details' : '▼ Show Details' }}
        </button>
      </div>

      <transition name="fade-expand">
        <div v-if="showSubjectBreakdown" class="subject-breakdown-grid">
          <div v-for="sb in subjectBreakdown" :key="sb.subj" class="sb-card">
            <div class="sb-top">
              <span class="sb-name">{{ sb.label }}</span>
              <span class="sb-pct" :class="parseFloat(sb.pct) >= 60 ? 'sb-high' : parseFloat(sb.pct) >= 40 ? 'sb-mid' : 'sb-low'">{{ sb.pct }}%</span>
            </div>
            <div class="sb-stats-row">
              <span class="sb-stat correct">✓{{ sb.correct }}</span>
              <span class="sb-stat wrong">✗{{ sb.wrong }}</span>
              <span class="sb-stat skip">—{{ sb.skipped }}</span>
              <span class="sb-total">/ {{ sb.total }}Q</span>
            </div>
            <div class="sb-bar-track">
              <div class="sb-bar-fill" :class="parseFloat(sb.pct) >= 60 ? 'sb-high-fill' : parseFloat(sb.pct) >= 40 ? 'sb-mid-fill' : 'sb-low-fill'" :style="{ width: Math.max(0, parseFloat(sb.pct)) + '%' }"></div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Written answers summary (if attempted) -->
      <div v-if="isPaid && writtenQuestionsList.length > 0" class="written-summary">
        <div class="section-title-label" style="margin-bottom:12px;">WRITTEN SECTION — SUBMITTED</div>
        <div class="ws-grid">
          <div v-for="(q, i) in writtenQuestionsList" :key="q.id" class="ws-card">
            <div class="ws-header">
              <span class="ws-qnum">Q{{ i+1 }}</span>
              <span class="ws-subj">{{ q.subject }}</span>
              <span :class="['ws-type', q.type === 'creative' ? 'type-creative' : 'type-short']">{{ q.type }}</span>
              <span class="ws-marks">{{ q.marks }} marks</span>
            </div>
            <div class="ws-answer-preview">
              {{ writtenAnswers[q.id]?.text?.slice(0, 120) || 'No answer written.' }}{{ writtenAnswers[q.id]?.text?.length > 120 ? '...' : '' }}
            </div>
            <div v-if="writtenAnswers[q.id]?.imageUrl" class="ws-has-image">📎 Image attached</div>
            <div v-else class="ws-no-image">No image attached</div>
          </div>
        </div>
      </div>

      <!-- Question Review -->
      <div class="review-header">
        <span class="section-title-label">MCQ QUESTION REVIEW</span>
        <div class="review-tabs">
          <button v-for="t in ['all','correct','wrong','skipped']" :key="t" class="rev-tab" :class="{ active: filterTab === t }" @click="filterTab = t">
            {{ t.toUpperCase() }}
            <span class="rev-count">{{ t === 'all' ? questions.length : t === 'correct' ? scoreData.correct : t === 'wrong' ? scoreData.wrong : scoreData.skipped }}</span>
          </button>
        </div>
      </div>

      <div class="review-list">
        <div
          v-for="(q) in filteredReview"
          :key="q.id"
          class="rc-card"
          :class="{ 'rc-correct': answers[q.id] === q.answer, 'rc-wrong': answers[q.id] !== undefined && answers[q.id] !== q.answer, 'rc-skipped': answers[q.id] === undefined }"
        >
          <div class="rc-header">
            <div class="rc-meta">
              <span class="rc-qnum">Q{{ questions.indexOf(q)+1 }}</span>
              <span class="rc-subj">{{ subjectLabels[q.subject] || q.subject }}</span>
              <span class="rc-chapter">{{ q.chapter }}</span>
              <span :class="['rc-diff', diffClass(q.difficulty)]">{{ q.difficulty }}</span>
            </div>
            <span v-if="answers[q.id] === q.answer" class="rc-badge rc-badge-correct">+1.00 ✓</span>
            <span v-else-if="answers[q.id] !== undefined" class="rc-badge rc-badge-wrong">−0.25 ✗</span>
            <span v-else class="rc-badge rc-badge-skip">±0 skip</span>
          </div>
          <div class="rc-question">{{ q.text }}</div>
          <div class="rc-options">
            <div v-for="(opt, idx) in q.options" :key="idx" class="rc-opt" :class="reviewOptClass(q, idx)">
              <span class="rc-opt-letter">{{ ['A','B','C','D'][idx] }}</span>
              <span class="rc-opt-text">{{ opt }}</span>
              <span v-if="idx === q.answer" class="rc-tag-correct">✓ Correct</span>
              <span v-else-if="answers[q.id] === idx && idx !== q.answer" class="rc-tag-wrong">✗ Your answer</span>
            </div>
          </div>
          <div v-if="answers[q.id] === undefined" class="rc-skipped-note">— Skipped · No marks deducted</div>
        </div>
      </div>

      <!-- Results Actions -->
      <div class="results-actions">
        <NuxtLink to="/pricing" v-if="!isPaid" class="iso-btn iso-btn--ghost">Upgrade for Written →</NuxtLink>
        <button class="iso-btn iso-btn--ghost" @click="resetToSetup">← New Exam</button>
        <button class="iso-btn iso-btn--fill" @click="showNegativeWarning = true; buildMcqQuestions(); answers={}; flagged=new Set(); currentIdx=0; timeLeft=examConfig.mcqDuration*60; phase='setup'">Retake</button>
      </div>

    </div><!-- /results -->

  </div>
</template>

<style scoped>
/* ─── PAGE SHELL ─────────────────────────────────────────────────────────── */
.exam-page {
  min-height: 100vh;
  padding: 32px 28px 80px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ─── PAGE HEADER ────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 40px;
}
.page-chip {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.18em;
  color: var(--gray); border: 1px solid var(--border); padding: 4px 10px; margin-bottom: 14px;
}
.chip-dot {
  width: 5px; height: 5px; border-radius: 50%; background: var(--border-bright);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
.page-title {
  font-family: var(--font-mono); font-size: 2rem; font-weight: 700;
  color: var(--white); margin: 0 0 10px; line-height: 1.2;
}
.text-outline { -webkit-text-stroke: 1px var(--white); color: transparent; }
.page-desc { font-family: var(--font-sans); color: var(--gray); font-size: 0.88rem; max-width: 480px; line-height: 1.6; }

/* ─── TIER BADGE ─────────────────────────────────────────────────────────── */
.tier-badge {
  display: flex; align-items: center; gap: 12px;
  border: 1px solid var(--border); padding: 14px 18px;
  max-width: 280px; flex-shrink: 0;
}
.tier-pro  { border-color: rgba(255,200,80,0.3); background: rgba(255,200,80,0.04); }
.tier-free { border-color: var(--border); background: rgba(240,240,234,0.02); }
.tier-icon { font-size: 1.4rem; }
.tier-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; color: var(--white); margin-bottom: 3px; }
.tier-sub { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }
.tier-toggle { font-size: 0.52rem !important; padding: 4px 8px !important; margin-left: auto; white-space: nowrap; }

/* ─── SECTION LABEL ROW ──────────────────────────────────────────────────── */
.section-label-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.section-pill {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em;
  color: var(--dim); border: 1px solid var(--border); padding: 4px 12px; white-space: nowrap;
}
.section-line { flex: 1; height: 1px; background: var(--border); }

/* ─── TYPE SECTION ───────────────────────────────────────────────────────── */
.type-section { margin-bottom: 32px; }
.type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--border); }

.type-card {
  position: relative; background: var(--black); padding: 24px; cursor: pointer;
  border: 1px solid transparent; transition: all 0.2s;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
}
.type-card:hover { border-color: var(--border-bright); border-left: 2px solid var(--border-bright); transform: translate(-1px,-1px); }
.type-card--active { border-color: var(--white) !important; border-left: 3px solid var(--white) !important; }
.type-card-corner { position: absolute; width: 10px; height: 10px; }
.type-card-corner.tl { top:6px;left:6px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.type-card-corner.br { bottom:6px;right:6px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.type-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.type-icon { font-size: 1.8rem; }
.type-label { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--white); }
.type-full { font-family: var(--font-mono); font-size: 0.78rem; color: var(--white); margin-bottom: 4px; }
.type-authority { font-family: var(--font-sans); font-size: 0.72rem; color: var(--dim); margin-bottom: 14px; }
.type-meta-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.meta-pill {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.06em;
  color: var(--dim); border: 1px solid var(--border); padding: 2px 8px;
}
.meta-pill--written { color: rgba(255,200,80,0.7); border-color: rgba(255,200,80,0.25); }
.type-sections-row { display: flex; gap: 8px; margin-bottom: 14px; }
.section-tag-item { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.08em; color: var(--dim); border: 1px solid var(--border); padding: 2px 7px; }
.section-tag-written { color: rgba(255,200,80,0.7); border-color: rgba(255,200,80,0.25); }
.section-tag-free { color: rgba(120,220,120,0.6); border-color: rgba(120,220,120,0.2); }
.type-select-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em; color: var(--dim); text-align: right; }
.type-card--active .type-select-label { color: var(--white); }

/* ─── GROUP SECTION ──────────────────────────────────────────────────────── */
.group-section { margin-bottom: 28px; }
.group-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
.group-card {
  position: relative; background: var(--black); padding: 20px; cursor: pointer;
  border: 1px solid transparent; transition: all 0.2s;
}
.group-card:hover { border-color: var(--border-bright); border-left: 2px solid var(--border-bright); transform: translate(-1px,-1px); }
.group-card--active { border-color: var(--white) !important; border-left: 3px solid var(--white) !important; }
.group-card-corner { position: absolute; width: 8px; height: 8px; }
.group-card-corner.tl { top:5px;left:5px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.group-card-corner.br { bottom:5px;right:5px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.group-icon { font-size: 1.2rem; }
.group-label { font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: var(--white); flex: 1; }
.group-check { font-family: var(--font-mono); font-size: 0.7rem; color: var(--white); }
.group-subjects { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.group-subj-row { display: flex; align-items: center; gap: 8px; }
.group-subj-name { font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); width: 68px; text-align: right; }
.group-subj-bar-track { flex: 1; height: 3px; background: rgba(240,240,234,0.06); }
.group-subj-bar { height: 100%; background: rgba(240,240,234,0.25); transition: width 0.4s; }
.group-card--active .group-subj-bar { background: rgba(240,240,234,0.5); }
.group-subj-count { font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); width: 24px; }
.group-sections { display: flex; gap: 6px; }
.group-section-tag { font-family: var(--font-mono); font-size: 0.54rem; letter-spacing: 0.08em; padding: 2px 7px; border: 1px solid var(--border); color: var(--dim); }
.group-section-written { color: rgba(255,200,80,0.7); border-color: rgba(255,200,80,0.25); }
.group-section-locked { color: rgba(240,240,234,0.2); border-color: rgba(240,240,234,0.1); }

/* ─── EXPECT PANEL ───────────────────────────────────────────────────────── */
.expect-panel { border: 1px solid var(--border); padding: 20px; margin-bottom: 24px; background: rgba(240,240,234,0.01); }
.expect-header { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); margin-bottom: 14px; }
.expect-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); }
.expect-item { background: var(--black); padding: 14px 16px; }
.expect-item--locked { opacity: 0.5; }
.expect-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em; color: var(--dim); margin-bottom: 6px; }
.expect-val { font-family: var(--font-mono); font-size: 0.9rem; color: var(--white); margin-bottom: 4px; }
.expect-sub { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }

/* ─── CTA BAR ────────────────────────────────────────────────────────────── */
.cta-bar {
  position: sticky; bottom: 20px; z-index: 30;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  background: var(--black); border: 1px solid var(--border-bright);
  padding: 18px 24px; box-shadow: 6px 6px 0 0 rgba(240,240,234,0.05);
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.cta-name { font-family: var(--font-mono); font-size: 0.85rem; color: var(--white); margin-bottom: 4px; }
.cta-meta { font-family: var(--font-sans); font-size: 0.78rem; color: var(--gray); display: flex; gap: 8px; flex-wrap: wrap; }
.neg-warn { color: rgba(255,120,120,0.8); }
.written-note { color: rgba(255,200,80,0.8); font-family: var(--font-mono); font-size: 0.68rem; }
.free-note { color: rgba(120,220,120,0.6); font-family: var(--font-mono); font-size: 0.68rem; }
.cta-right { display: flex; gap: 10px; flex-shrink: 0; }

/* slide-down transition */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
.fade-expand-enter-active, .fade-expand-leave-active { transition: all 0.3s ease; }
.fade-expand-enter-from, .fade-expand-leave-to { opacity: 0; transform: scaleY(0.95); transform-origin: top; }

/* ─── NEGATIVE MARKING MODAL ─────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(8,8,8,0.88);
  z-index: 200; display: flex; align-items: center; justify-content: center;
}
.modal {
  position: relative; background: var(--black); border: 1px solid var(--border-bright);
  padding: 36px; max-width: 480px; width: 90%;
  box-shadow: 8px 8px 0 0 rgba(240,240,234,0.04);
  animation: modalPop 0.25s ease;
}
@keyframes modalPop { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
.modal-corner { position: absolute; width: 12px; height: 12px; }
.modal-corner.tl { top:8px;left:8px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.modal-corner.br { bottom:8px;right:8px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.neg-icon { font-size: 2.5rem; margin-bottom: 12px; }
.neg-title { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.16em; color: rgba(255,120,120,0.9); margin-bottom: 6px; }
.neg-exam { font-family: var(--font-mono); font-size: 1rem; color: var(--white); margin-bottom: 24px; }
.neg-rules { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.neg-rule { display: flex; align-items: center; gap: 14px; border: 1px solid var(--border); padding: 12px 14px; }
.neg-rule div { display: flex; flex-direction: column; gap: 2px; }
.neg-rule strong { font-family: var(--font-sans); font-size: 0.85rem; color: var(--white); }
.neg-rule span { font-family: var(--font-sans); font-size: 0.75rem; color: var(--gray); }
.nri { font-size: 1rem; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 1px solid; font-weight: bold; flex-shrink: 0; }
.correct-i { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); }
.wrong-i   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); }
.skip-i    { color: var(--gray); border-color: var(--border); }
.neg-written-note {
  display: flex; align-items: flex-start; gap: 10px;
  font-family: var(--font-sans); font-size: 0.8rem; color: var(--gray);
  background: rgba(255,200,80,0.04); border: 1px solid rgba(255,200,80,0.2);
  padding: 10px 14px; margin-bottom: 16px;
}
.neg-written-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
.neg-free-note {
  font-family: var(--font-sans); font-size: 0.78rem; color: var(--gray);
  border: 1px solid var(--border); padding: 10px 14px; margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}
.upgrade-link { color: var(--white); text-decoration: underline; }
.neg-formula { border: 1px solid var(--border); padding: 12px 16px; margin-bottom: 16px; background: rgba(240,240,234,0.02); }
.neg-formula-label { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.14em; color: var(--dim); display: block; margin-bottom: 6px; }
.neg-formula-eq { font-family: var(--font-mono); font-size: 0.78rem; color: var(--white); }
.neg-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── EXAM TOPBAR ────────────────────────────────────────────────────────── */
.exam-topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 16px;
  background: var(--black); border-bottom: 1px solid var(--border);
  padding: 10px 16px;
}
.topbar-left { display: flex; align-items: center; gap: 10px; }
.topbar-chip { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; color: var(--white); border: 1px solid var(--border-bright); padding: 3px 10px; }
.topbar-section-badge { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; padding: 2px 8px; border: 1px solid; }
.topbar-section-badge { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.3); }
.topbar-written-badge { color: rgba(255,200,80,0.8) !important; border-color: rgba(255,200,80,0.3) !important; }
.topbar-neg { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(255,100,100,0.7); border: 1px solid rgba(255,100,100,0.25); padding: 2px 7px; }
.topbar-prog { font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); }
.topbar-center { flex: 1; }
.topbar-bar-track { height: 3px; background: rgba(240,240,234,0.08); }
.topbar-bar-fill { height: 100%; background: var(--white); transition: width 0.3s; max-width: 100%; }
.written-fill { background: rgba(255,200,80,0.7); }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.topbar-timer {
  font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700;
  color: var(--white); padding: 4px 10px; border: 1px solid var(--border);
  display: flex; align-items: center; gap: 6px;
}
.topbar-timer.warning { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.4); }
.topbar-timer.critical { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.4); animation: blink 0.6s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }
.topbar-end-btn { font-size: 0.68rem; padding: 5px 12px; }

/* ─── Q PALETTE ──────────────────────────────────────────────────────────── */
.q-palette-wrap {
  position: sticky; top: 45px; z-index: 40;
  background: var(--black); border-bottom: 1px solid var(--border); padding: 8px 16px;
}
.q-palette { display: flex; flex-wrap: wrap; gap: 4px; max-height: 80px; overflow-y: auto; margin-bottom: 6px; }
.q-dot {
  width: 26px; height: 22px; font-family: var(--font-mono); font-size: 0.55rem;
  border: 1px solid var(--border); background: transparent; color: var(--dim);
  cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center;
}
.q-dot:hover { border-color: var(--border-bright); color: var(--white); }
.q-dot.answered { background: rgba(240,240,234,0.08); color: var(--white); border-color: rgba(240,240,234,0.3); }
.q-dot.flagged  { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); }
.q-dot.current  { border-color: var(--white); color: var(--white); font-weight: 700; }
.palette-legend { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); }
.legend-dot { width: 10px; height: 8px; border: 1px solid var(--border); }
.legend-dot.answered { background: rgba(240,240,234,0.1); border-color: rgba(240,240,234,0.3); }
.legend-dot.flagged  { border-color: rgba(255,200,80,0.5); }
.palette-next-hint { font-family: var(--font-mono); font-size: 0.55rem; color: rgba(255,200,80,0.6); margin-left: auto; letter-spacing: 0.06em; }

/* ─── QUESTIONS LIST ─────────────────────────────────────────────────────── */
.questions-list { padding: 16px 0; }
.q-card {
  background: var(--black); border: 1px solid var(--border);
  border-left: 3px solid transparent; margin-bottom: 10px; padding: 20px;
  scroll-margin-top: 140px; transition: border-color 0.2s;
}
.card-answered { border-left-color: rgba(240,240,234,0.4); }
.card-flagged  { border-left-color: rgba(255,200,80,0.6); }
.card-current  { border-left-color: var(--white); }
.q-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.q-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.q-num { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: var(--white); background: rgba(240,240,234,0.06); padding: 2px 8px; border: 1px solid var(--border); }
.q-subject, .q-chapter, .q-year { font-family: var(--font-mono); font-size: 0.56rem; color: var(--dim); border: 1px solid var(--border); padding: 2px 6px; }
.q-diff { font-family: var(--font-mono); font-size: 0.54rem; letter-spacing: 0.08em; padding: 2px 6px; border: 1px solid; }
.diff-easy { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.25); background: rgba(120,220,120,0.04); }
.diff-med  { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25);  background: rgba(255,200,80,0.04); }
.diff-hard { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); background: rgba(255,100,100,0.04); }
.flag-btn { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.06em; border: 1px solid var(--border); background: transparent; color: var(--dim); padding: 4px 10px; cursor: pointer; transition: all 0.15s; }
.flag-btn:hover { border-color: rgba(255,200,80,0.5); color: rgba(255,200,80,0.8); }
.flag-btn.flag-active { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); background: rgba(255,200,80,0.06); }
.q-text { font-family: var(--font-sans); font-size: 0.95rem; color: var(--white); line-height: 1.65; margin-bottom: 16px; }
.q-options { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
.q-opt { display: flex; align-items: center; gap: 12px; border: 1px solid var(--border); background: transparent; padding: 10px 14px; cursor: pointer; text-align: left; transition: all 0.15s; width: 100%; }
.q-opt:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.q-opt.opt-selected { border-color: var(--white); background: rgba(240,240,234,0.04); }
.opt-letter { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; width: 22px; height: 22px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--white); flex-shrink: 0; }
.opt-selected .opt-letter { background: var(--white); color: var(--black); border-color: var(--white); }
.opt-text { font-family: var(--font-sans); font-size: 0.85rem; color: var(--white); }
.q-card-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 10px; }
.neg-reminder { font-family: var(--font-mono); font-size: 0.57rem; color: var(--dim); }
.skip-note { color: rgba(120,220,120,0.6); }
.clear-btn { font-family: var(--font-mono); font-size: 0.6rem; border: 1px solid var(--border); background: transparent; color: var(--dim); padding: 4px 10px; cursor: pointer; transition: all 0.15s; }
.clear-btn:hover { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.7); }

/* ─── SUBMIT BAR ─────────────────────────────────────────────────────────── */
.submit-bar { display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-bright); background: rgba(240,240,234,0.02); padding: 18px 22px; margin-top: 16px; box-shadow: 5px 5px 0 0 rgba(240,240,234,0.04); gap: 16px; }
.submit-stats { display: flex; gap: 20px; font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); }
.submit-stats strong { color: var(--white); }
.submit-actions { display: flex; align-items: center; gap: 14px; }
.submit-written-note { font-family: var(--font-mono); font-size: 0.58rem; color: rgba(255,200,80,0.6); letter-spacing: 0.06em; }

/* ─── END MODAL ──────────────────────────────────────────────────────────── */
.end-title { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.16em; color: var(--white); margin-bottom: 6px; }
.end-sub   { font-family: var(--font-sans); font-size: 0.9rem; color: var(--gray); margin-bottom: 20px; }
.end-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); margin-bottom: 16px; }
.end-stat { background: var(--black); padding: 12px; text-align: center; }
.end-val { display: block; font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; margin-bottom: 3px; }
.end-stat span:last-child { font-family: var(--font-sans); font-size: 0.7rem; color: var(--gray); }
.answered-color { color: rgba(120,220,120,0.9); }
.flagged-color  { color: rgba(255,200,80,0.9); }
.skipped-color  { color: var(--gray); }
.end-warn { font-family: var(--font-sans); font-size: 0.78rem; color: rgba(255,200,80,0.8); background: rgba(255,200,80,0.05); border: 1px solid rgba(255,200,80,0.2); padding: 8px 12px; margin-bottom: 10px; }
.end-written-note { font-family: var(--font-sans); font-size: 0.78rem; color: rgba(255,200,80,0.8); padding: 8px 12px; margin-bottom: 10px; border: 1px solid rgba(255,200,80,0.2); background: rgba(255,200,80,0.04); }
.end-neg-note { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); letter-spacing: 0.06em; margin-bottom: 20px; }
.end-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── WRITTEN INTRO ──────────────────────────────────────────────────────── */
.written-intro-phase { display: flex; align-items: center; justify-content: center; min-height: 80vh; padding: 32px; }
.wi-container { max-width: 560px; width: 100%; border: 1px solid var(--border-bright); padding: 40px; box-shadow: 8px 8px 0 0 rgba(240,240,234,0.04); position: relative; }
.wi-icon { font-size: 2.5rem; margin-bottom: 12px; }
.wi-title { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.18em; color: rgba(255,200,80,0.9); margin-bottom: 6px; }
.wi-subtitle { font-family: var(--font-mono); font-size: 1.2rem; color: var(--white); margin-bottom: 28px; }
.wi-meta-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); margin-bottom: 24px; }
.wi-meta-item { background: var(--black); padding: 14px; text-align: center; }
.wi-meta-val { font-family: var(--font-mono); font-size: 1.8rem; font-weight: 700; color: var(--white); }
.wi-meta-lbl { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.1em; color: var(--dim); margin-top: 4px; }
.wi-rules { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.wi-rule { font-family: var(--font-sans); font-size: 0.82rem; color: var(--gray); padding-left: 4px; }
.wi-question-preview { border: 1px solid var(--border); margin-bottom: 28px; }
.wi-preview-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.12em; color: var(--dim); padding: 8px 12px; border-bottom: 1px solid var(--border); }
.wi-preview-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--border); }
.wi-preview-item:last-child { border-bottom: none; }
.wi-preview-num { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--white); border: 1px solid var(--border); padding: 2px 8px; background: rgba(240,240,234,0.05); }
.wi-preview-subj { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); border: 1px solid var(--border); padding: 2px 7px; }
.wi-preview-type { font-family: var(--font-mono); font-size: 0.56rem; padding: 2px 7px; border: 1px solid; }
.type-creative { color: rgba(255,200,80,0.8); border-color: rgba(255,200,80,0.3); background: rgba(255,200,80,0.04); }
.type-short    { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.3); background: rgba(120,220,120,0.04); }
.wi-preview-marks { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); margin-left: auto; }
.wi-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── WRITTEN PHASE ──────────────────────────────────────────────────────── */
.written-phase { }
.written-topbar { }
.written-q-nav { display: flex; gap: 6px; padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--black); flex-wrap: wrap; }
.wq-nav-btn {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700;
  padding: 7px 14px; border: 1px solid var(--border); background: transparent;
  color: var(--dim); cursor: pointer; transition: all 0.15s;
}
.wq-nav-btn:hover { border-color: var(--border-bright); color: var(--white); }
.wq-nav-active { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.04); }
.wq-nav-answered { border-color: rgba(255,200,80,0.5); color: rgba(255,200,80,0.8); }
.wq-nav-marks { font-size: 0.5rem; color: var(--dim); }
.wq-nav-active .wq-nav-marks, .wq-nav-answered .wq-nav-marks { color: inherit; opacity: 0.7; }

.written-question-area { padding: 24px 0 60px; }
.wq-card {
  position: relative; background: var(--black); border: 1px solid var(--border);
  border-left: 3px solid rgba(255,200,80,0.5); padding: 28px;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
}
.wq-card-corner { position: absolute; width: 10px; height: 10px; }
.wq-card-corner.tl { top:6px;left:6px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.wq-card-corner.br { bottom:6px;right:6px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.wq-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.wq-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.wq-num { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: var(--white); background: rgba(240,240,234,0.06); padding: 2px 8px; border: 1px solid var(--border); }
.wq-subject, .wq-chapter, .wq-year { font-family: var(--font-mono); font-size: 0.56rem; color: var(--dim); border: 1px solid var(--border); padding: 2px 6px; }
.wq-marks-badge { font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700; color: rgba(255,200,80,0.9); border: 1px solid rgba(255,200,80,0.3); padding: 3px 10px; background: rgba(255,200,80,0.05); flex-shrink: 0; }
.wq-text { font-family: var(--font-sans); font-size: 0.95rem; color: var(--white); line-height: 1.7; margin-bottom: 22px; white-space: pre-line; }

.wq-answer-section { margin-bottom: 22px; }
.wq-answer-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); display: block; margin-bottom: 8px; }
.wq-textarea {
  width: 100%; font-family: var(--font-sans); font-size: 0.9rem; color: var(--white);
  background: rgba(240,240,234,0.02); border: 1px solid var(--border);
  padding: 14px 16px; resize: vertical; outline: none;
  transition: border-color 0.2s; line-height: 1.6; min-height: 180px;
}
.wq-textarea:focus { border-color: rgba(255,200,80,0.4); background: rgba(240,240,234,0.03); }
.wq-char-count { font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); text-align: right; margin-top: 4px; }

.wq-image-section { margin-bottom: 24px; }
.wq-image-label { display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px; }
.wq-image-label span:first-child { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; color: var(--dim); }
.wq-image-hint { font-family: var(--font-sans); font-size: 0.7rem; color: var(--dim); }
.wq-image-dropzone {
  border: 1px dashed rgba(240,240,234,0.15); padding: 28px; text-align: center;
  cursor: pointer; transition: all 0.2s; background: rgba(240,240,234,0.01);
}
.wq-image-dropzone:hover { border-color: rgba(255,200,80,0.3); background: rgba(255,200,80,0.02); }
.wq-dropzone-icon { font-size: 1.5rem; margin-bottom: 8px; }
.wq-dropzone-text { font-family: var(--font-mono); font-size: 0.68rem; color: var(--white); margin-bottom: 4px; }
.wq-dropzone-hint { font-family: var(--font-sans); font-size: 0.7rem; color: var(--dim); }
.wq-image-preview { position: relative; }
.wq-preview-img { max-width: 100%; max-height: 300px; display: block; border: 1px solid var(--border); }
.wq-remove-image { position: absolute; top: 8px; right: 8px; font-family: var(--font-mono); font-size: 0.6rem; background: rgba(8,8,8,0.9); border: 1px solid var(--border-bright); color: var(--white); padding: 4px 10px; cursor: pointer; transition: all 0.15s; }
.wq-remove-image:hover { background: rgba(255,100,100,0.15); border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.9); }

.wq-nav-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 24px; border-top: 1px solid var(--border); padding-top: 20px; }
.wq-nav-dots { display: flex; gap: 8px; }
.wq-nav-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(240,240,234,0.12); transition: all 0.2s; }
.wq-dot-active { background: var(--white); transform: scale(1.2); }
.wq-dot-answered { background: rgba(255,200,80,0.5); }

/* ─── RESULTS PHASE ──────────────────────────────────────────────────────── */
.score-hero {
  position: relative; display: flex; gap: 32px; align-items: flex-start;
  border: 1px solid var(--border-bright); background: rgba(240,240,234,0.02);
  padding: 32px; margin-bottom: 28px; box-shadow: 6px 6px 0 0 rgba(240,240,234,0.04);
}
.score-hero-corner { position: absolute; width: 14px; height: 14px; }
.score-hero-corner.tl { top:8px;left:8px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.score-hero-corner.br { bottom:8px;right:8px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.score-hero-left { flex: 1; }
.score-exam-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); margin-bottom: 8px; }
.score-badge-row { display: flex; gap: 6px; margin-bottom: 10px; }
.score-section-tag { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.1em; padding: 2px 8px; border: 1px solid rgba(120,220,120,0.3); color: rgba(120,220,120,0.8); background: rgba(120,220,120,0.04); }
.score-section-written { color: rgba(255,200,80,0.8); border-color: rgba(255,200,80,0.3); background: rgba(255,200,80,0.04); }
.score-pct { font-family: var(--font-mono); font-size: 4rem; font-weight: 700; line-height: 1; margin-bottom: 10px; }
.score-pct-sym { font-size: 2rem; }
.grade-high { color: rgba(120,220,120,0.95); }
.grade-mid  { color: rgba(255,200,80,0.95); }
.grade-low  { color: rgba(255,150,80,0.95); }
.grade-fail { color: rgba(255,100,100,0.95); }
.score-raw { font-family: var(--font-mono); font-size: 0.78rem; color: var(--gray); margin-bottom: 6px; }
.score-raw strong { color: var(--white); }
.score-calc { margin-bottom: 14px; }
.score-calc-text { font-family: var(--font-mono); font-size: 0.64rem; color: var(--dim); border: 1px solid var(--border); padding: 4px 10px; display: inline-block; }
.score-status { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.1em; padding: 6px 14px; display: inline-block; }
.status-pass { color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3); background: rgba(120,220,120,0.06); }
.status-fail { color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.3); background: rgba(255,100,100,0.06); }
.score-hero-right { text-align: center; min-width: 200px; }
.grade-badge { font-family: var(--font-mono); font-size: 4rem; font-weight: 700; line-height: 1; margin-bottom: 4px; }
.grade-label { font-family: var(--font-sans); font-size: 0.8rem; color: var(--gray); margin-bottom: 18px; }
.score-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); }
.smc { background: var(--black); padding: 12px 8px; }
.smc-val { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--white); }
.smc-lbl { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); letter-spacing: 0.08em; margin-bottom: 3px; }
.smc-mark { font-family: var(--font-mono); font-size: 0.62rem; }
.correct-card .smc-val { color: rgba(120,220,120,0.9); }
.correct-mark { color: rgba(120,220,120,0.7); }
.wrong-card .smc-val { color: rgba(255,100,100,0.9); }
.wrong-mark { color: rgba(255,100,100,0.7); }
.skipped-card .smc-val { color: var(--gray); }

/* ─── SUBJECT BREAKDOWN ──────────────────────────────────────────────────── */
.subject-perf-header {
  display: flex; align-items: center; justify-content: space-between;
  border: 1px solid var(--border); padding: 12px 16px; margin-bottom: 0;
  cursor: pointer; transition: border-color 0.2s; background: rgba(240,240,234,0.01);
}
.subject-perf-header:hover { border-color: var(--border-bright); }
.section-title-label { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.14em; color: var(--dim); }
.toggle-breakdown-btn { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); background: transparent; border: none; cursor: pointer; padding: 0; }
.subject-breakdown-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); gap: 1px; background: var(--border); margin-bottom: 24px; }
.sb-card { background: var(--black); padding: 16px; }
.sb-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.sb-name { font-family: var(--font-mono); font-size: 0.65rem; color: var(--white); }
.sb-pct { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; }
.sb-high { color: rgba(120,220,120,0.9); }
.sb-mid  { color: rgba(255,200,80,0.9); }
.sb-low  { color: rgba(255,100,100,0.9); }
.sb-stats-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.sb-stat { font-family: var(--font-mono); font-size: 0.58rem; }
.sb-stat.correct { color: rgba(120,220,120,0.7); }
.sb-stat.wrong   { color: rgba(255,100,100,0.7); }
.sb-stat.skip    { color: var(--dim); }
.sb-total { font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); margin-left: auto; }
.sb-bar-track { height: 3px; background: rgba(240,240,234,0.06); }
.sb-bar-fill { height: 100%; transition: width 0.5s; }
.sb-high-fill { background: rgba(120,220,120,0.5); }
.sb-mid-fill  { background: rgba(255,200,80,0.5); }
.sb-low-fill  { background: rgba(255,100,100,0.5); }

/* ─── WRITTEN SUMMARY ────────────────────────────────────────────────────── */
.written-summary { border: 1px solid rgba(255,200,80,0.2); padding: 20px; margin-bottom: 28px; background: rgba(255,200,80,0.02); }
.ws-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 1px; background: rgba(255,200,80,0.1); }
.ws-card { background: var(--black); padding: 16px; }
.ws-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.ws-qnum { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--white); background: rgba(240,240,234,0.06); padding: 2px 7px; border: 1px solid var(--border); }
.ws-subj { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); border: 1px solid var(--border); padding: 2px 6px; }
.ws-marks { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(255,200,80,0.8); border: 1px solid rgba(255,200,80,0.25); padding: 2px 6px; margin-left: auto; }
.ws-answer-preview { font-family: var(--font-sans); font-size: 0.8rem; color: var(--gray); line-height: 1.5; margin-bottom: 8px; }
.ws-has-image { font-family: var(--font-mono); font-size: 0.56rem; color: rgba(120,220,120,0.7); }
.ws-no-image  { font-family: var(--font-mono); font-size: 0.56rem; color: var(--dim); }

/* ─── MCQ REVIEW ─────────────────────────────────────────────────────────── */
.review-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; margin-top: 28px; }
.review-tabs { display: flex; gap: 1px; background: var(--border); }
.rev-tab { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em; padding: 6px 14px; background: var(--black); border: none; color: var(--dim); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
.rev-tab:hover { color: var(--white); }
.rev-tab.active { color: var(--white); background: rgba(240,240,234,0.05); }
.rev-count { font-size: 0.55rem; background: rgba(240,240,234,0.08); padding: 1px 5px; }
.review-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
.rc-card { border: 1px solid var(--border); border-left: 3px solid var(--border); padding: 18px; background: var(--black); }
.rc-correct { border-left-color: rgba(120,220,120,0.5); }
.rc-wrong   { border-left-color: rgba(255,100,100,0.5); }
.rc-skipped { border-left-color: var(--border); }
.rc-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.rc-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.rc-qnum { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--white); background: rgba(240,240,234,0.05); padding: 2px 7px; border: 1px solid var(--border); }
.rc-subj, .rc-chapter { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); border: 1px solid var(--border); padding: 2px 5px; }
.rc-diff { font-family: var(--font-mono); font-size: 0.52rem; padding: 2px 5px; border: 1px solid; }
.rc-badge { font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700; padding: 2px 8px; border: 1px solid; }
.rc-badge-correct { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); background: rgba(120,220,120,0.05); }
.rc-badge-wrong   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.05); }
.rc-badge-skip    { color: var(--dim); border-color: var(--border); }
.rc-question { font-family: var(--font-sans); font-size: 0.88rem; color: var(--white); line-height: 1.6; margin-bottom: 12px; }
.rc-options { display: flex; flex-direction: column; gap: 5px; }
.rc-opt { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--border); }
.rc-correct { border-color: rgba(120,220,120,0.4); background: rgba(120,220,120,0.04); }
.rc-wrong   { border-color: rgba(255,100,100,0.4); background: rgba(255,100,100,0.04); }
.rc-opt-letter { font-family: var(--font-mono); font-size: 0.6rem; width: 20px; height: 20px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--white); flex-shrink: 0; }
.rc-correct .rc-opt-letter { background: rgba(120,220,120,0.25); border-color: rgba(120,220,120,0.5); }
.rc-wrong   .rc-opt-letter { background: rgba(255,100,100,0.25); border-color: rgba(255,100,100,0.5); }
.rc-opt-text { font-family: var(--font-sans); font-size: 0.82rem; color: var(--white); flex: 1; }
.rc-tag-correct, .rc-tag-wrong { font-family: var(--font-mono); font-size: 0.54rem; padding: 2px 5px; border: 1px solid; flex-shrink: 0; }
.rc-tag-correct { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); }
.rc-tag-wrong   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); }
.rc-skipped-note { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; }

/* ─── RESULTS ACTIONS ────────────────────────────────────────────────────── */
.results-actions { display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 24px; flex-wrap: wrap; }

/* ─── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .exam-page { padding: 24px 16px 80px; }
  .page-header { flex-direction: column; gap: 16px; }
  .tier-badge { max-width: 100%; width: 100%; }
  .type-grid { grid-template-columns: 1fr; }
  .group-grid { grid-template-columns: 1fr; }
  .cta-bar { flex-direction: column; align-items: stretch; gap: 12px; bottom: 0; left: 0; right: 0; border-left: none; border-right: none; border-bottom: none; padding: 16px; }
  .cta-right { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .score-hero { flex-direction: column; gap: 24px; padding: 22px; }
  .score-hero-right { min-width: unset; width: 100%; }
  .expect-grid { grid-template-columns: 1fr; }
  .wi-meta-grid { grid-template-columns: repeat(3,1fr); }
}

@media (max-width: 600px) {
  .exam-page { padding: 12px 10px 90px; }
  .page-title { font-size: 1.5rem; }
  .tier-badge { flex-wrap: wrap; gap: 8px; }
  .type-grid, .group-grid { grid-template-columns: 1fr; }
  .exam-topbar { flex-wrap: wrap; gap: 8px; padding: 8px 10px; }
  .topbar-center { order: 3; width: 100%; flex: unset; }
  .topbar-left { gap: 6px; flex-wrap: wrap; }
  .q-palette-wrap { padding: 6px 10px; }
  .q-palette { gap: 3px; max-height: 64px; }
  .q-dot { width: 22px; height: 18px; font-size: 0.5rem; }
  .q-card { padding: 14px 12px; scroll-margin-top: 160px; }
  .q-card-header { flex-direction: column; gap: 8px; align-items: flex-start; }
  .q-opt { padding: 8px 10px; }
  .submit-bar { flex-direction: column; align-items: stretch; gap: 12px; padding: 14px; }
  .submit-stats { flex-wrap: wrap; gap: 10px; }
  .submit-actions { flex-direction: column; }
  .submit-actions .iso-btn { width: 100%; justify-content: center; }
  .score-hero { padding: 16px; }
  .score-pct { font-size: 2.8rem; }
  .review-header { flex-direction: column; align-items: flex-start; }
  .review-tabs { width: 100%; display: grid; grid-template-columns: repeat(4,1fr); }
  .rev-tab { justify-content: center; font-size: 0.52rem; padding: 6px 2px; }
  .results-actions { flex-direction: column; gap: 8px; }
  .results-actions .iso-btn { width: 100%; justify-content: center; }
  .cta-right { grid-template-columns: 1fr 1fr; gap: 6px; }
  .wi-container { padding: 24px 18px; }
  .subject-breakdown-grid { grid-template-columns: repeat(2,1fr); }
  .wq-card { padding: 18px 14px; }
  .written-q-nav { padding: 8px 10px; gap: 4px; }
  .wq-nav-btn { padding: 6px 10px; font-size: 0.56rem; }
  .end-modal .end-actions { flex-direction: column; }
  .end-modal .end-actions .iso-btn { width: 100%; justify-content: center; }
  .neg-modal-actions { flex-direction: column; gap: 8px; }
  .neg-modal-actions .iso-btn { width: 100%; justify-content: center; }
}
</style>
