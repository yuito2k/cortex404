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
      { id: 'hs-phy-1', text: 'A body moves with uniform acceleration. Which graph of velocity vs time is a straight line?', options: ['Parabola', 'Straight line through origin', 'Horizontal line', 'Hyperbola'], answer: 1, chapter: 'Kinematics', year: '2023', difficulty: 'easy', explanation: 'With uniform acceleration, velocity increases linearly with time (v = u + at). On a v-t graph this gives a straight line. A horizontal line would mean constant velocity (zero acceleration).' },
      { id: 'hs-phy-2', text: 'The SI unit of electric charge is:', options: ['Ampere', 'Volt', 'Coulomb', 'Ohm'], answer: 2, chapter: 'Electricity', year: '2022', difficulty: 'easy', explanation: 'The Coulomb (C) is the SI unit of electric charge. One Coulomb equals the charge transferred by a current of one Ampere flowing for one second.' },
      { id: 'hs-phy-3', text: 'Which law states that the pressure of a gas is inversely proportional to its volume at constant temperature?', options: ['Charles\'s Law', 'Boyle\'s Law', 'Gay-Lussac\'s Law', 'Avogadro\'s Law'], answer: 1, chapter: 'Thermodynamics', year: '2023', difficulty: 'medium', explanation: 'Boyle\'s Law (PV = constant at constant T) states that pressure and volume of a gas are inversely proportional. Charles\'s Law relates volume and temperature, while Gay-Lussac\'s Law relates pressure and temperature.' },
      { id: 'hs-phy-4', text: 'The focal length of a convex lens is positive. What does this indicate?', options: ['It is a diverging lens', 'It converges parallel rays to a point', 'It has no focal point', 'It only works in water'], answer: 1, chapter: 'Optics', year: '2022', difficulty: 'medium', explanation: 'A convex (converging) lens has a positive focal length. It refracts parallel rays so they converge at the principal focus on the other side of the lens. Concave lenses have negative focal lengths.' },
      { id: 'hs-phy-5', text: 'Newton\'s second law of motion states that force is equal to:', options: ['mass × velocity', 'mass × acceleration', 'mass × displacement', 'mass × time'], answer: 1, chapter: 'Dynamics', year: '2023', difficulty: 'easy', explanation: 'Newton\'s 2nd Law: F = ma. Force equals mass multiplied by acceleration. This is why heavier objects require more force to accelerate at the same rate as lighter ones.' },
      { id: 'hs-phy-6', text: 'Which type of wave does not require a medium for propagation?', options: ['Sound wave', 'Water wave', 'Electromagnetic wave', 'Seismic wave'], answer: 2, chapter: 'Waves', year: '2021', difficulty: 'easy', explanation: 'Electromagnetic waves (light, radio, X-rays etc.) are transverse waves that can travel through a vacuum. Sound, water, and seismic waves are mechanical waves and require a medium to propagate.' },
    ],
    chemistry: [
      { id: 'hs-chem-1', text: 'The atomic number of Carbon is:', options: ['6', '8', '12', '14'], answer: 0, chapter: 'Atomic Structure', year: '2023', difficulty: 'easy', explanation: 'Carbon (C) has atomic number 6, meaning it has 6 protons. Its mass number is 12 (6 protons + 6 neutrons). Oxygen has atomic number 8, Silicon has 14.' },
      { id: 'hs-chem-2', text: 'Which of the following is an example of an exothermic reaction?', options: ['Photosynthesis', 'Electrolysis', 'Combustion of methane', 'Dissolving ammonium nitrate'], answer: 2, chapter: 'Thermochemistry', year: '2022', difficulty: 'medium', explanation: 'Combustion releases energy as heat and light — exothermic (ΔH < 0). Photosynthesis and electrolysis absorb energy (endothermic). Dissolving NH₄NO₃ is also endothermic (used in instant ice packs).' },
      { id: 'hs-chem-3', text: 'What is the formula of sulphuric acid?', options: ['HCl', 'HNO₃', 'H₂SO₄', 'H₃PO₄'], answer: 2, chapter: 'Acids & Bases', year: '2023', difficulty: 'easy', explanation: 'H₂SO₄ is sulphuric acid. HCl = hydrochloric acid, HNO₃ = nitric acid, H₃PO₄ = phosphoric acid. Sulphuric acid is a diprotic strong acid used extensively in industry.' },
      { id: 'hs-chem-4', text: 'An organic compound containing a -COOH group is called a:', options: ['Alcohol', 'Ester', 'Carboxylic acid', 'Ketone'], answer: 2, chapter: 'Organic Chemistry', year: '2022', difficulty: 'medium', explanation: 'The -COOH (carboxyl) group defines carboxylic acids (e.g. acetic acid CH₃COOH). Alcohols have -OH, ketones have C=O between carbons, esters have -COO-.' },
      { id: 'hs-chem-5', text: 'The process of converting a liquid to vapour below its boiling point is:', options: ['Condensation', 'Sublimation', 'Evaporation', 'Distillation'], answer: 2, chapter: 'States of Matter', year: '2023', difficulty: 'easy', explanation: 'Evaporation occurs at the liquid surface at any temperature below boiling point. Sublimation is solid → gas directly. Condensation is gas → liquid. Distillation is a separation technique.' },
      { id: 'hs-chem-6', text: 'Which element is the most electronegative?', options: ['Oxygen', 'Chlorine', 'Fluorine', 'Nitrogen'], answer: 2, chapter: 'Periodic Table', year: '2021', difficulty: 'medium', explanation: 'Fluorine (F) is the most electronegative element (3.98 on Pauling scale). Electronegativity generally increases across a period and up a group. Oxygen is second-most electronegative.' },
    ],
    biology: [
      { id: 'hs-bio-1', text: 'Which organelle is responsible for cellular respiration?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'], answer: 2, chapter: 'Cell Biology', year: '2023', difficulty: 'easy', explanation: 'Mitochondria are the "powerhouses of the cell" where aerobic respiration occurs, producing ATP. The nucleus contains DNA, ribosomes make proteins, and vacuoles store water and waste.' },
      { id: 'hs-bio-2', text: 'The process by which plants lose water through leaves is called:', options: ['Osmosis', 'Transpiration', 'Diffusion', 'Absorption'], answer: 1, chapter: 'Plant Physiology', year: '2022', difficulty: 'easy', explanation: 'Transpiration is the evaporation of water from plant leaves through stomata. It drives water uptake from roots. Osmosis is water movement across membranes; diffusion is general particle movement.' },
      { id: 'hs-bio-3', text: 'DNA replication occurs during which phase of the cell cycle?', options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'], answer: 1, chapter: 'Genetics', year: '2023', difficulty: 'medium', explanation: 'S (Synthesis) phase is when DNA replication takes place, duplicating the entire genome. G1 = cell growth, G2 = preparation for division, M = mitosis (actual cell division).' },
      { id: 'hs-bio-4', text: 'Which blood cells are responsible for immunity?', options: ['Red blood cells', 'Platelets', 'White blood cells', 'Plasma cells'], answer: 2, chapter: 'Human Physiology', year: '2022', difficulty: 'easy', explanation: 'White blood cells (leukocytes) are the immune cells. Types include neutrophils, lymphocytes (B and T cells), and macrophages. Red blood cells carry oxygen; platelets aid clotting.' },
    ],
    math: [
      { id: 'hs-math-1', text: 'If f(x) = x² + 3x + 2, what is f(2)?', options: ['8', '10', '12', '6'], answer: 2, chapter: 'Functions', year: '2023', difficulty: 'easy', explanation: 'f(2) = (2)² + 3(2) + 2 = 4 + 6 + 2 = 12. Always substitute the given value into every term of the function.' },
      { id: 'hs-math-2', text: 'The value of log₁₀ 1000 is:', options: ['2', '3', '4', '10'], answer: 1, chapter: 'Logarithm', year: '2022', difficulty: 'easy', explanation: 'log₁₀ 1000 = log₁₀ 10³ = 3. Remember: log₁₀ 10 = 1, log₁₀ 100 = 2, log₁₀ 1000 = 3. Logarithm answers "to what power must the base be raised to give this number?".' },
      { id: 'hs-math-3', text: 'What is the derivative of sin(x)?', options: ['cos(x)', '-cos(x)', '-sin(x)', 'tan(x)'], answer: 0, chapter: 'Calculus', year: '2023', difficulty: 'medium', explanation: 'd/dx[sin(x)] = cos(x). Standard derivatives to memorise: d/dx[cos(x)] = -sin(x), d/dx[tan(x)] = sec²(x). These can be derived from first principles using the limit definition.' },
      { id: 'hs-math-4', text: 'If sin θ = 3/5, what is cos θ?', options: ['4/5', '3/4', '5/3', '1/2'], answer: 0, chapter: 'Trigonometry', year: '2022', difficulty: 'medium', explanation: 'Using sin²θ + cos²θ = 1: (3/5)² + cos²θ = 1 → cos²θ = 1 - 9/25 = 16/25 → cos θ = 4/5. This is the classic 3-4-5 right triangle.' },
    ],
    ict: [
      { id: 'hs-ict-1', text: 'The binary representation of decimal 15 is:', options: ['1010', '1111', '1101', '1100'], answer: 1, chapter: 'Number Systems', year: '2023', difficulty: 'easy', explanation: '15 in binary: 15 = 8+4+2+1 = 1×2³ + 1×2² + 1×2¹ + 1×2⁰ = 1111. 1010 = 10, 1101 = 13, 1100 = 12.' },
      { id: 'hs-ict-2', text: 'Which generation of computers used vacuum tubes?', options: ['Second', 'Third', 'First', 'Fourth'], answer: 2, chapter: 'Computer History', year: '2022', difficulty: 'easy', explanation: '1st generation computers (1940s-50s) used vacuum tubes as their primary electronic component. 2nd gen used transistors, 3rd gen used ICs, 4th gen used microprocessors.' },
    ],
    english: [
      { id: 'hs-eng-1', text: 'Choose the correct sentence:', options: ['He go to school.', 'He goes to school.', 'He going to school.', 'He gone to school.'], answer: 1, chapter: 'Grammar', year: '2023', difficulty: 'easy', explanation: '"He goes to school" is correct. With 3rd person singular subjects (he/she/it), add -s or -es to the verb in simple present tense. "He go" lacks the -s ending required.' },
      { id: 'hs-eng-2', text: 'The antonym of "benevolent" is:', options: ['Generous', 'Malevolent', 'Friendly', 'Kind'], answer: 1, chapter: 'Vocabulary', year: '2022', difficulty: 'medium', explanation: '"Malevolent" means wishing harm to others — the direct opposite of "benevolent" (wishing good). Both come from Latin: "bene" = good, "male" = bad, "volo" = wish.' },
    ],
  },

  // ── HSC ARTS ───────────────────────────────────────────────────────────────
  hsc_arts: {
    bangla: [
      { id: 'ha-ban-1', text: '"বিদ্রোহী" কবিতাটি প্রথম কোন পত্রিকায় প্রকাশিত হয়?', options: ['সওগাত', 'কল্লোল', 'বিজলী', 'প্রবাসী'], answer: 2, chapter: 'কাব্যসাহিত্য', year: '2023', difficulty: 'medium', explanation: '"বিদ্রোহী" কবিতাটি ১৯২২ সালে "বিজলী" পত্রিকায় প্রথম প্রকাশিত হয়। কবিতাটি কাজী নজরুল ইসলাম রচনা করেন এবং প্রকাশের সাথে সাথে ব্যাপক জনপ্রিয়তা লাভ করে।' },
      { id: 'ha-ban-2', text: '"সোনার তরী" কাব্যগ্রন্থের রচয়িতা কে?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জীবনানন্দ দাশ', 'সুকান্ত ভট্টাচার্য'], answer: 1, chapter: 'বাংলা সাহিত্য', year: '2022', difficulty: 'easy', explanation: '"সোনার তরী" রবীন্দ্রনাথ ঠাকুরের একটি বিখ্যাত কাব্যগ্রন্থ, ১৮৯৪ সালে প্রকাশিত। এটি রবীন্দ্রনাথের সৃষ্টির মধ্যভাগের একটি গুরুত্বপূর্ণ কাব্য সংকলন।' },
      { id: 'ha-ban-3', text: 'বাংলা ভাষায় মৌলিক স্বরধ্বনি কয়টি?', options: ['৫টি', '৬টি', '৭টি', '৮টি'], answer: 2, chapter: 'ব্যাকরণ', year: '2023', difficulty: 'medium', explanation: 'বাংলা ভাষায় মৌলিক স্বরধ্বনি ৭টি: অ, আ, ই, উ, এ, ও, অ্যা। এগুলো ব্যাকরণের দৃষ্টিকোণ থেকে মৌলিক কারণ এগুলো অন্য ধ্বনির সমন্বয়ে তৈরি নয়।' },
      { id: 'ha-ban-4', text: '"পথের পাঁচালী" উপন্যাসটি কার রচনা?', options: ['রবীন্দ্রনাথ ঠাকুর', 'মানিক বন্দ্যোপাধ্যায়', 'বিভূতিভূষণ বন্দ্যোপাধ্যায়', 'শরৎচন্দ্র চট্টোপাধ্যায়'], answer: 2, chapter: 'উপন্যাস', year: '2022', difficulty: 'easy', explanation: '"পথের পাঁচালী" বিভূতিভূষণ বন্দ্যোপাধ্যায় রচিত বিখ্যাত উপন্যাস (১৯২৯)। এটি অপু ট্রিলজির প্রথম অংশ। পরে সত্যজিৎ রায় এটি চলচ্চিত্রে রূপান্তরিত করেন।' },
    ],
    english: [
      { id: 'ha-eng-1', text: 'Who wrote "Hamlet"?', options: ['Charles Dickens', 'William Shakespeare', 'John Keats', 'George Orwell'], answer: 1, chapter: 'Literature', year: '2023', difficulty: 'easy', explanation: '"Hamlet" is a tragedy written by William Shakespeare around 1600-1601. It is one of the most famous plays in the English language, dealing with themes of revenge, mortality, and indecision.' },
      { id: 'ha-eng-2', text: 'The past tense of "write" is:', options: ['written', 'writed', 'wrote', 'writing'], answer: 2, chapter: 'Grammar', year: '2022', difficulty: 'easy', explanation: '"Write" is an irregular verb. Simple past = "wrote". Past participle = "written" (used with have/had). Never "writed" — that form does not exist in English.' },
      { id: 'ha-eng-3', text: 'Choose the correct passive voice: "She writes a letter":', options: ['A letter was written by her.', 'A letter is written by her.', 'A letter is being written by her.', 'A letter has been written by her.'], answer: 1, chapter: 'Grammar', year: '2023', difficulty: 'medium', explanation: 'Simple present active "writes" → simple present passive "is written". The formula is: object + is/am/are + past participle + by + subject. "Was written" is simple past passive.' },
    ],
    history: [
      { id: 'ha-his-1', text: 'মুক্তিযুদ্ধের সময় বাংলাদেশ কতটি সেক্টরে বিভক্ত ছিল?', options: ['৯টি', '১০টি', '১১টি', '১২টি'], answer: 2, chapter: 'বাংলাদেশের ইতিহাস', year: '2023', difficulty: 'easy', explanation: '১৯৭১ সালের মুক্তিযুদ্ধে বাংলাদেশকে মোট ১১টি সেক্টরে বিভক্ত করা হয়। প্রতিটি সেক্টরের নেতৃত্বে একজন সেক্টর কমান্ডার ছিলেন এবং তাঁরা মুক্তিযুদ্ধ সংগঠিত করেন।' },
      { id: 'ha-his-2', text: 'ছয় দফা কর্মসূচি কোন সালে ঘোষণা করা হয়?', options: ['১৯৬৪', '১৯৬৬', '১৯৬৮', '১৯৭০'], answer: 1, chapter: 'রাজনৈতিক ইতিহাস', year: '2022', difficulty: 'medium', explanation: '১৯৬৬ সালে শেখ মুজিবুর রহমান ছয় দফা দাবি উত্থাপন করেন। এই দাবিগুলো পূর্ব পাকিস্তানের স্বায়ত্তশাসনের ভিত্তি হয়ে ওঠে এবং বাংলাদেশের স্বাধীনতার পথ প্রশস্ত করে।' },
    ],
    civics: [
      { id: 'ha-civ-1', text: 'বাংলাদেশের সংবিধান কত সালে প্রণীত হয়?', options: ['১৯৭১', '১৯৭২', '১৯৭৩', '১৯৭৫'], answer: 1, chapter: 'সংবিধান', year: '2023', difficulty: 'easy', explanation: 'বাংলাদেশের সংবিধান ১৯৭২ সালের ৪ নভেম্বর গণপরিষদে গৃহীত হয় এবং ১৬ ডিসেম্বর ১৯৭২ থেকে কার্যকর হয়। এটি দেশের সর্বোচ্চ আইন।' },
      { id: 'ha-civ-2', text: 'জাতীয় সংসদে মোট আসন সংখ্যা কত?', options: ['২৫০', '৩০০', '৩৫০', '৪০০'], answer: 1, chapter: 'সংসদীয় ব্যবস্থা', year: '2022', difficulty: 'medium', explanation: 'বাংলাদেশের জাতীয় সংসদে মোট ৩৫০টি আসন রয়েছে — ৩০০টি সাধারণ আসন এবং ৫০টি সংরক্ষিত মহিলা আসন।' },
    ],
    ict: [
      { id: 'ha-ict-1', text: 'www stands for:', options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'], answer: 0, chapter: 'Internet', year: '2023', difficulty: 'easy', explanation: 'WWW = World Wide Web, invented by Tim Berners-Lee in 1989. It is a system of interlinked hypertext documents accessed via the internet using a web browser.' },
      { id: 'ha-ict-2', text: 'RAM stands for:', options: ['Read Access Memory', 'Random Access Memory', 'Remote Access Memory', 'Rapid Access Memory'], answer: 1, chapter: 'Hardware', year: '2022', difficulty: 'easy', explanation: 'RAM = Random Access Memory. It is the computer\'s short-term working memory, storing data currently in use. RAM is volatile — data is lost when power is off.' },
    ],
    economics: [
      { id: 'ha-eco-1', text: 'চাহিদার সূত্র অনুযায়ী দাম বাড়লে চাহিদা:', options: ['বাড়ে', 'কমে', 'অপরিবর্তিত থাকে', 'অনিশ্চিত'], answer: 1, chapter: 'চাহিদা ও যোগান', year: '2023', difficulty: 'easy', explanation: 'চাহিদার সূত্র অনুযায়ী দাম ও চাহিদার মধ্যে বিপরীত সম্পর্ক রয়েছে — দাম বাড়লে চাহিদা কমে, দাম কমলে চাহিদা বাড়ে। এটিকে চাহিদার বিপরীত সম্পর্ক বলে।' },
      { id: 'ha-eco-2', text: 'GDP এর পূর্ণরূপ কী?', options: ['Gross Domestic Product', 'General Domestic Product', 'Gross Development Product', 'Gross Domestic Price'], answer: 0, chapter: 'জাতীয় আয়', year: '2022', difficulty: 'easy', explanation: 'GDP = Gross Domestic Product — একটি নির্দিষ্ট সময়কালে কোনো দেশের মধ্যে উৎপাদিত সব পণ্য ও সেবার মোট বাজারমূল্য। এটি দেশের অর্থনৈতিক আকার পরিমাপের প্রধান সূচক।' },
    ],
  },

  // ── HSC COMMERCE ───────────────────────────────────────────────────────────
  hsc_commerce: {
    accounting: [
      { id: 'hc-acc-1', text: 'The accounting equation is:', options: ['Assets = Liabilities + Owner\'s Equity', 'Assets = Liabilities − Owner\'s Equity', 'Assets + Liabilities = Owner\'s Equity', 'Assets = Owner\'s Equity − Liabilities'], answer: 0, chapter: 'Accounting Fundamentals', year: '2023', difficulty: 'easy', explanation: 'The fundamental accounting equation: Assets = Liabilities + Owner\'s Equity. This means everything a business owns (assets) is financed either by creditors (liabilities) or owners (equity). It must always balance.' },
      { id: 'hc-acc-2', text: 'Depreciation is charged on:', options: ['Current assets', 'Fixed assets', 'Intangible assets only', 'Liquid assets'], answer: 1, chapter: 'Depreciation', year: '2022', difficulty: 'medium', explanation: 'Depreciation is the systematic allocation of the cost of fixed (tangible non-current) assets like machinery, buildings and vehicles over their useful lives. Current assets like inventory are not depreciated.' },
      { id: 'hc-acc-3', text: 'A credit entry in accounts always indicates:', options: ['An increase in assets', 'A decrease in expenses', 'An increase in liabilities or equity', 'A decrease in revenue'], answer: 2, chapter: 'Double Entry', year: '2023', difficulty: 'medium', explanation: 'In double-entry bookkeeping: Credit increases liabilities, equity, and revenue; Debit increases assets and expenses. Remember: DEAL — Debit = Expenses/Assets/Losses increase.' },
      { id: 'hc-acc-4', text: 'Bank reconciliation statement is prepared to:', options: ['Calculate profit', 'Reconcile cash book and bank passbook', 'Prepare balance sheet', 'Record sales'], answer: 1, chapter: 'Cash Book', year: '2022', difficulty: 'easy', explanation: 'A bank reconciliation statement explains differences between the cash book balance and the bank passbook balance. Differences arise due to timing differences like unpresented cheques or uncredited deposits.' },
    ],
    business_studies: [
      { id: 'hc-bus-1', text: 'Which type of business organisation has unlimited liability?', options: ['Private limited company', 'Public limited company', 'Sole proprietorship', 'Cooperative society'], answer: 2, chapter: 'Forms of Business', year: '2023', difficulty: 'easy', explanation: 'A sole proprietor has unlimited liability — personal assets can be seized to pay business debts. Limited companies (private/public) protect owners with limited liability; they only risk their investment.' },
      { id: 'hc-bus-2', text: 'SWOT analysis stands for:', options: ['Strength, Weakness, Opportunity, Threat', 'Strategy, Work, Output, Target', 'Strength, Work, Opportunity, Team', 'Sales, Workforce, Output, Trend'], answer: 0, chapter: 'Business Strategy', year: '2022', difficulty: 'easy', explanation: 'SWOT = Strengths, Weaknesses, Opportunities, Threats. It is a strategic planning tool. Strengths & Weaknesses are internal factors; Opportunities & Threats are external factors.' },
      { id: 'hc-bus-3', text: 'E-commerce refers to:', options: ['Electronic money', 'Buying/selling goods online', 'Email communication in business', 'Economic commerce'], answer: 1, chapter: 'Digital Business', year: '2023', difficulty: 'easy', explanation: 'E-commerce (electronic commerce) is the buying and selling of goods and services over the internet. Examples include online shopping (Daraz, Amazon), digital payment platforms, and online banking.' },
    ],
    finance: [
      { id: 'hc-fin-1', text: 'Which financial statement shows a company\'s financial position at a specific date?', options: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement', 'Statement of Retained Earnings'], answer: 1, chapter: 'Financial Statements', year: '2023', difficulty: 'easy', explanation: 'The Balance Sheet (Statement of Financial Position) shows assets, liabilities, and equity at a specific point in time — a "snapshot". The Income Statement covers a period; Cash Flow tracks cash movements.' },
      { id: 'hc-fin-2', text: 'Working capital is calculated as:', options: ['Fixed assets − Current liabilities', 'Current assets − Current liabilities', 'Total assets − Total liabilities', 'Revenue − Expenses'], answer: 1, chapter: 'Working Capital', year: '2022', difficulty: 'medium', explanation: 'Working Capital = Current Assets − Current Liabilities. It measures a company\'s short-term liquidity and operational efficiency. Positive working capital means the company can meet its short-term obligations.' },
    ],
    bangla: [
      { id: 'hc-ban-1', text: 'ব্যবসায়িক পত্রের মূল উদ্দেশ্য কোনটি?', options: ['সাহিত্যিক প্রকাশ', 'তথ্য আদান-প্রদান', 'কবিতা রচনা', 'ইতিহাস লেখা'], answer: 1, chapter: 'বাণিজ্যিক পত্র', year: '2023', difficulty: 'easy', explanation: 'ব্যবসায়িক পত্রের মূল উদ্দেশ্য তথ্য আদান-প্রদান করা — অর্ডার দেওয়া, অভিযোগ জানানো, চুক্তি করা বা যোগাযোগ রক্ষা করা। এটি সাহিত্যিক নয়, বরং কার্যকরী যোগাযোগের মাধ্যম।' },
      { id: 'hc-ban-2', text: '"বাণিজ্যের" বিপরীত শব্দ কী?', options: ['ব্যবসা', 'লেনদেন', 'ভোক্তা', 'অব্যবসায়িক'], answer: 3, chapter: 'ব্যাকরণ', year: '2022', difficulty: 'medium', explanation: '"বাণিজ্য" শব্দের বিপরীত হলো "অব্যবসায়িক" বা "অবাণিজ্যিক"। বাণিজ্য মানে কেনাবেচা বা ব্যবসায়িক লেনদেন, এর বিপরীত অর্থ বহনকারী শব্দ হলো অব্যবসায়িক।' },
    ],
    english: [
      { id: 'hc-eng-1', text: 'A formal business letter ends with:', options: ['Yours faithfully', 'Best regards', 'Take care', 'All the best'], answer: 0, chapter: 'Business Writing', year: '2023', difficulty: 'easy', explanation: '"Yours faithfully" is used when the salutation is "Dear Sir/Madam" (unknown recipient). "Yours sincerely" is used when the person\'s name is known (e.g. "Dear Mr. Ahmed"). "Best regards" is semi-formal.' },
      { id: 'hc-eng-2', text: 'The plural of "analysis" is:', options: ['analysises', 'analysis', 'analyses', 'analysys'], answer: 2, chapter: 'Grammar', year: '2022', difficulty: 'medium', explanation: '"Analyses" is the correct plural — words ending in -is (Greek/Latin origin) form their plural by changing -is to -es: analysis → analyses, basis → bases, crisis → crises, thesis → theses.' },
    ],
    ict: [
      { id: 'hc-ict-1', text: 'A spreadsheet application is primarily used for:', options: ['Writing documents', 'Numerical data and calculations', 'Creating presentations', 'Browsing the internet'], answer: 1, chapter: 'Office Applications', year: '2023', difficulty: 'easy', explanation: 'Spreadsheet software (e.g. Microsoft Excel, Google Sheets) is designed for numerical data, formulas, calculations, and data analysis. Word processors handle documents; presentation tools handle slides.' },
    ],
  },

  // ── SSC SCIENCE ────────────────────────────────────────────────────────────
  ssc_science: {
    physics: [
      { id: 'ss-phy-1', text: 'The speed of light in vacuum is approximately:', options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], answer: 1, chapter: 'Light', year: '2023', difficulty: 'easy', explanation: 'The speed of light in vacuum is approximately 3×10⁸ m/s (300,000 km/s). This is a universal constant denoted as "c". Nothing can travel faster than light in a vacuum.' },
      { id: 'ss-phy-2', text: 'Which of the following is a vector quantity?', options: ['Speed', 'Mass', 'Time', 'Velocity'], answer: 3, chapter: 'Motion', year: '2022', difficulty: 'easy', explanation: 'Velocity is a vector — it has both magnitude and direction (e.g. 60 km/h north). Speed is a scalar (just magnitude). Mass and time are also scalars — they have no direction.' },
      { id: 'ss-phy-3', text: 'Ohm\'s law states that V = I × ?', options: ['Power', 'Resistance', 'Frequency', 'Capacitance'], answer: 1, chapter: 'Electricity', year: '2023', difficulty: 'easy', explanation: 'Ohm\'s Law: V = IR (Voltage = Current × Resistance). This fundamental law states that voltage across a conductor is directly proportional to current, provided temperature is constant.' },
      { id: 'ss-phy-4', text: 'The unit of work is:', options: ['Newton', 'Watt', 'Joule', 'Pascal'], answer: 2, chapter: 'Work & Energy', year: '2022', difficulty: 'easy', explanation: 'Work = Force × Displacement. The unit is the Joule (J) = Newton × metre (N·m). Watt is the unit of power (Joules per second), Newton is force, Pascal is pressure.' },
    ],
    chemistry: [
      { id: 'ss-chem-1', text: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2, chapter: 'Elements', year: '2023', difficulty: 'easy', explanation: 'Gold\'s symbol Au comes from the Latin "Aurum". Ag (Silver) comes from "Argentum". These Latin-derived symbols are used because the elements were known in ancient times before modern naming conventions.' },
      { id: 'ss-chem-2', text: 'Water has the chemical formula:', options: ['H₂O₂', 'HO', 'H₂O', 'H₃O'], answer: 2, chapter: 'Chemical Formulas', year: '2022', difficulty: 'easy', explanation: 'Water is H₂O — two hydrogen atoms bonded to one oxygen atom. H₂O₂ is hydrogen peroxide (an antiseptic). H₃O⁺ is the hydronium ion formed when an acid dissolves in water.' },
      { id: 'ss-chem-3', text: 'An acid has a pH value:', options: ['Greater than 7', 'Equal to 7', 'Less than 7', 'Equal to 14'], answer: 2, chapter: 'Acids and Bases', year: '2023', difficulty: 'easy', explanation: 'Acids have pH < 7. pH 7 = neutral (pure water). pH > 7 = alkaline/basic. The pH scale runs from 0 to 14. Strong acids like HCl have pH close to 0; strong bases like NaOH have pH close to 14.' },
    ],
    biology: [
      { id: 'ss-bio-1', text: 'Photosynthesis occurs in which part of the plant cell?', options: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'], answer: 2, chapter: 'Plant Biology', year: '2023', difficulty: 'easy', explanation: 'Chloroplasts contain chlorophyll which captures sunlight to drive photosynthesis (6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂). Mitochondria are for respiration in both plant and animal cells.' },
      { id: 'ss-bio-2', text: 'The human heart has how many chambers?', options: ['2', '3', '4', '5'], answer: 2, chapter: 'Human Anatomy', year: '2022', difficulty: 'easy', explanation: 'The human heart has 4 chambers: right atrium, right ventricle, left atrium, left ventricle. The right side pumps deoxygenated blood to lungs; the left side pumps oxygenated blood to the body.' },
      { id: 'ss-bio-3', text: 'Which nutrient provides the most energy per gram?', options: ['Carbohydrates', 'Protein', 'Fat', 'Vitamins'], answer: 2, chapter: 'Nutrition', year: '2023', difficulty: 'medium', explanation: 'Fat provides 9 kcal/gram — more than double carbohydrates or protein (both ~4 kcal/gram). This is why fat is the body\'s main long-term energy storage. Vitamins provide no caloric energy.' },
    ],
    math: [
      { id: 'ss-math-1', text: 'The square root of 144 is:', options: ['11', '12', '13', '14'], answer: 1, chapter: 'Arithmetic', year: '2023', difficulty: 'easy', explanation: '√144 = 12 because 12 × 12 = 144. Key perfect squares to memorise: 1,4,9,16,25,36,49,64,81,100,121,144.' },
      { id: 'ss-math-2', text: 'If 2x + 4 = 10, then x =?', options: ['2', '3', '4', '5'], answer: 1, chapter: 'Algebra', year: '2022', difficulty: 'easy', explanation: 'Solve: 2x + 4 = 10 → 2x = 10 - 4 = 6 → x = 6/2 = 3. Always isolate the variable by performing inverse operations on both sides.' },
      { id: 'ss-math-3', text: 'The area of a circle with radius r is:', options: ['2πr', 'πr²', '2πr²', 'πr'], answer: 1, chapter: 'Geometry', year: '2023', difficulty: 'easy', explanation: 'Area of circle = πr². Circumference = 2πr. Key: area uses r², circumference uses r (just radius, not squared). π ≈ 3.14159.' },
    ],
    ict: [
      { id: 'ss-ict-1', text: 'CPU stands for:', options: ['Central Processing Unit', 'Computer Processing Unit', 'Central Program Unit', 'Central Power Unit'], answer: 0, chapter: 'Computer Basics', year: '2023', difficulty: 'easy', explanation: 'CPU = Central Processing Unit — the "brain" of the computer that performs all calculations and executes instructions. Modern CPUs have multiple cores to handle tasks in parallel.' },
      { id: 'ss-ict-2', text: '1 Byte = how many bits?', options: ['4', '8', '16', '32'], answer: 1, chapter: 'Data Storage', year: '2022', difficulty: 'easy', explanation: '1 Byte = 8 bits. Hierarchy: 8 bits = 1 Byte, 1024 Bytes = 1 KB, 1024 KB = 1 MB, 1024 MB = 1 GB. A bit is the smallest unit (0 or 1); a byte can represent 256 different values (2⁸).' },
    ],
    english: [
      { id: 'ss-eng-1', text: 'The plural of "child" is:', options: ['childs', 'childes', 'children', 'childre'], answer: 2, chapter: 'Grammar', year: '2023', difficulty: 'easy', explanation: '"Children" is the irregular plural of "child". Irregular plurals don\'t follow the standard -s/-es rule: child→children, man→men, woman→women, tooth→teeth, mouse→mice.' },
      { id: 'ss-eng-2', text: 'A word that describes a noun is called a:', options: ['Verb', 'Adverb', 'Adjective', 'Pronoun'], answer: 2, chapter: 'Parts of Speech', year: '2022', difficulty: 'easy', explanation: 'An adjective modifies (describes) a noun: "red apple", "tall building", "happy student". An adverb modifies a verb, adjective, or another adverb. Verbs show actions; pronouns replace nouns.' },
    ],
  },

  ssc_arts: {
    bangla: [
      { id: 'sa-ban-1', text: '"আমার ভাইয়ের রক্তে রাঙানো একুশে ফেব্রুয়ারী" গানটির রচয়িতা কে?', options: ['আবদুল গাফফার চৌধুরী', 'শামসুর রাহমান', 'কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর'], answer: 0, chapter: 'বাংলা সাহিত্য', year: '2023', difficulty: 'easy', explanation: '"আমার ভাইয়ের রক্তে রাঙানো একুশে ফেব্রুয়ারী" গানটি রচনা করেন আবদুল গাফফার চৌধুরী। ১৯৫২ সালের ভাষা আন্দোলনের প্রেক্ষাপটে লেখা এই গানটি পরে বাংলাদেশের ভাষাশহীদ দিবসের স্মরণসংগীত হয়ে ওঠে।' },
      { id: 'sa-ban-2', text: 'বাংলা ব্যঞ্জনবর্ণের সংখ্যা কত?', options: ['৩৯টি', '৪০টি', '৩৮টি', '৪১টি'], answer: 0, chapter: 'ব্যাকরণ', year: '2022', difficulty: 'easy', explanation: 'বাংলা বর্ণমালায় ব্যঞ্জনবর্ণ ৩৯টি। স্বরবর্ণ ১১টি। মোট বর্ণ ৫০টি। ব্যঞ্জনবর্ণগুলো ক থেকে হ পর্যন্ত এবং বিশেষ কিছু বর্ণ নিয়ে গঠিত।' },
      { id: 'sa-ban-3', text: '"একাত্তরের দিনগুলি" গ্রন্থটির লেখক কে?', options: ['হুমায়ূন আহমেদ', 'জাহানারা ইমাম', 'সেলিনা হোসেন', 'রাবেয়া খাতুন'], answer: 1, chapter: 'মুক্তিযুদ্ধের সাহিত্য', year: '2023', difficulty: 'medium', explanation: '"একাত্তরের দিনগুলি" জাহানারা ইমামের লেখা বিখ্যাত স্মৃতিগ্রন্থ। এটি ১৯৭১ সালের মুক্তিযুদ্ধের ব্যক্তিগত অভিজ্ঞতার দলিল। তিনি "শহীদ জননী" নামে পরিচিত।' },
    ],
    english: [
      { id: 'sa-eng-1', text: 'What is the capital of the United Kingdom?', options: ['Paris', 'Berlin', 'London', 'Madrid'], answer: 2, chapter: 'General Knowledge', year: '2023', difficulty: 'easy', explanation: 'London is the capital city of the United Kingdom. It is situated on the River Thames and is one of the world\'s major financial, cultural, and political centres.' },
      { id: 'sa-eng-2', text: 'The opposite of "ancient" is:', options: ['Old', 'Antique', 'Modern', 'Historic'], answer: 2, chapter: 'Vocabulary', year: '2022', difficulty: 'easy', explanation: '"Modern" is the antonym of "ancient" — ancient means very old or from long ago, modern means of the present or recent times. "Old" and "antique" are similar in meaning to ancient, not opposite.' },
    ],
    history: [
      { id: 'sa-his-1', text: 'ভাষা আন্দোলন কত সালে সংঘটিত হয়?', options: ['১৯৪৮', '১৯৫২', '১৯৫৪', '১৯৫৬'], answer: 1, chapter: 'ভাষা আন্দোলন', year: '2023', difficulty: 'easy', explanation: 'বাংলা ভাষা আন্দোলন ১৯৫২ সালের ২১ ফেব্রুয়ারি চূড়ান্ত রূপ ধারণ করে। এই দিনে পুলিশের গুলিতে রফিক, সালাম, বরকত সহ অনেক ভাষাসৈনিক শহীদ হন। এখন ২১ ফেব্রুয়ারি আন্তর্জাতিক মাতৃভাষা দিবস।' },
      { id: 'sa-his-2', text: 'বাংলাদেশের স্বাধীনতার ঘোষণাপত্র কোথায় পাঠ করা হয়?', options: ['ঢাকায়', 'চট্টগ্রামে', 'কুমিল্লায়', 'সিলেটে'], answer: 1, chapter: 'মুক্তিযুদ্ধ', year: '2022', difficulty: 'medium', explanation: '১৯৭১ সালের ২৬ মার্চ চট্টগ্রামের কালুরঘাট বেতার কেন্দ্র থেকে মেজর জিয়াউর রহমান স্বাধীনতার ঘোষণাপত্র পাঠ করেন। এর আগে ২৫ মার্চ রাতে ঢাকায় শেখ মুজিবুর রহমান স্বাধীনতার ঘোষণা দেন।' },
    ],
    civics: [
      { id: 'sa-civ-1', text: 'বাংলাদেশের জাতীয় সংগীতের রচয়িতা কে?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'সুকান্ত ভট্টাচার্য', 'জীবনানন্দ দাশ'], answer: 1, chapter: 'জাতীয় পরিচয়', year: '2023', difficulty: 'easy', explanation: '"আমার সোনার বাংলা" বাংলাদেশের জাতীয় সংগীত, রচয়িতা রবীন্দ্রনাথ ঠাকুর। ১৯০৫ সালে বঙ্গভঙ্গের প্রতিবাদে তিনি এটি লিখেছিলেন। স্বাধীনতার পর ১৯৭১ সালে এটি জাতীয় সংগীত হিসেবে গৃহীত হয়।' },
    ],
    ict: [
      { id: 'sa-ict-1', text: 'Email এর পূর্ণরূপ কী?', options: ['Electronic Mail', 'Easy Mail', 'External Mail', 'Express Mail'], answer: 0, chapter: 'ইন্টারনেট', year: '2023', difficulty: 'easy', explanation: 'Email = Electronic Mail। ইন্টারনেটের মাধ্যমে ডিজিটাল বার্তা আদান-প্রদানের মাধ্যম। ১৯৭১ সালে রে টমলিনসন প্রথম ই-মেইল পাঠান। @ চিহ্নের ব্যবহারও তাঁর প্রবর্তন।' },
    ],
    economics: [
      { id: 'sa-eco-1', text: 'বাংলাদেশের প্রধান রপ্তানি পণ্য কোনটি?', options: ['পাট', 'চা', 'তৈরি পোশাক', 'চামড়া'], answer: 2, chapter: 'বাংলাদেশের অর্থনীতি', year: '2023', difficulty: 'easy', explanation: 'তৈরি পোশাক (RMG — Ready Made Garments) বাংলাদেশের প্রধান রপ্তানি পণ্য। মোট রপ্তানি আয়ের প্রায় ৮০% আসে এই খাত থেকে। পাট একসময় প্রধান রপ্তানি পণ্য ছিল, তবে এখন পোশাক শিল্প এগিয়ে।' },
    ],
  },

  ssc_commerce: {
    accounting: [
      { id: 'sc-acc-1', text: 'Journal is also known as:', options: ['Ledger', 'Book of original entry', 'Trial balance', 'Balance sheet'], answer: 1, chapter: 'Basic Accounting', year: '2023', difficulty: 'easy', explanation: 'The journal is called the "book of original entry" because transactions are first recorded here chronologically. The ledger is the "book of secondary entry" where transactions are classified by account.' },
      { id: 'sc-acc-2', text: 'Debit means:', options: ['Credit side entry', 'Left side of an account', 'Right side of an account', 'Net balance'], answer: 1, chapter: 'Double Entry', year: '2022', difficulty: 'easy', explanation: 'In a T-account, the debit side is always the LEFT side and the credit side is the RIGHT side. Remember: "Debit = Left, Credit = Right" — the most fundamental rule of double-entry bookkeeping.' },
      { id: 'sc-acc-3', text: 'Gross profit = Net sales −', options: ['Operating expenses', 'Cost of goods sold', 'Net profit', 'Total expenses'], answer: 1, chapter: 'Trading Account', year: '2023', difficulty: 'easy', explanation: 'Gross Profit = Net Sales − Cost of Goods Sold (COGS). Net profit then deducts operating expenses from gross profit. COGS includes opening stock + purchases − closing stock.' },
    ],
    business_studies: [
      { id: 'sc-bus-1', text: 'The process of planning, organizing, leading and controlling is known as:', options: ['Marketing', 'Management', 'Economics', 'Finance'], answer: 1, chapter: 'Business Management', year: '2023', difficulty: 'easy', explanation: 'Management is defined as the process of Planning, Organising, Staffing, Directing (Leading), and Controlling (POSDC). These are the core functions every manager performs.' },
      { id: 'sc-bus-2', text: 'Which is NOT a function of an entrepreneur?', options: ['Innovation', 'Risk-taking', 'Consuming goods', 'Capital formation'], answer: 2, chapter: 'Entrepreneurship', year: '2022', difficulty: 'easy', explanation: 'Entrepreneurs innovate, take calculated risks, and form capital to start businesses. "Consuming goods" is the role of a consumer, not an entrepreneur. Entrepreneurs create and provide goods/services.' },
    ],
    bangla: [
      { id: 'sc-ban-1', text: 'বাণিজ্যিক পত্রে কতটি অংশ থাকে?', options: ['৫টি', '৭টি', '৬টি', '৮টি'], answer: 1, chapter: 'বাণিজ্যিক পত্র', year: '2023', difficulty: 'medium', explanation: 'একটি আদর্শ বাণিজ্যিক পত্রে সাধারণত ৭টি অংশ থাকে: শিরোনাম, তারিখ, প্রাপকের ঠিকানা, সম্বোধন, মূল বিষয়বস্তু, সমাপ্তি সম্ভাষণ ও স্বাক্ষর।' },
    ],
    english: [
      { id: 'sc-eng-1', text: 'In business writing, "B2B" means:', options: ['Back to Back', 'Business to Business', 'Buy to Buy', 'Brand to Brand'], answer: 1, chapter: 'Business Terms', year: '2023', difficulty: 'easy', explanation: 'B2B = Business to Business — transactions between businesses (e.g. a manufacturer selling to a wholesaler). B2C = Business to Consumer (e.g. a shop selling directly to customers). C2C = Consumer to Consumer.' },
    ],
    ict: [
      { id: 'sc-ict-1', text: 'Microsoft Excel is a:', options: ['Word processor', 'Database software', 'Spreadsheet application', 'Presentation tool'], answer: 2, chapter: 'Office Software', year: '2023', difficulty: 'easy', explanation: 'Microsoft Excel is a spreadsheet application used for calculations, data analysis, charts, and financial modelling. Word = word processor, Access = database, PowerPoint = presentation tool.' },
    ],
    math: [
      { id: 'sc-math-1', text: 'Simple interest formula is:', options: ['P × R × T', '(P × R × T) / 100', 'P + R + T', 'P × R / T'], answer: 1, chapter: 'Commercial Math', year: '2023', difficulty: 'easy', explanation: 'Simple Interest (SI) = (P × R × T) / 100, where P = Principal, R = Rate per annum (%), T = Time in years. For example: ৳1000 at 10% for 2 years → SI = (1000×10×2)/100 = ৳200.' },
      { id: 'sc-math-2', text: 'If profit % = 20% and cost price = 500, find selling price:', options: ['520', '580', '600', '540'], answer: 2, chapter: 'Profit & Loss', year: '2022', difficulty: 'medium', explanation: 'Profit = 20% of 500 = ৳100. Selling Price = Cost Price + Profit = 500 + 100 = ৳600. Formula: SP = CP × (1 + profit%/100) = 500 × 1.2 = 600.' },
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
    passScore: 33,
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
    passScore: 33,
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
const showStartModal = ref(false)
const filterTab = ref('all')
const subjectFilter = ref('all')     // 'all' | subject key — filters the review list

// Written section state
const writtenAnswers = ref({})
const writtenTimeLeft = ref(0)
const writtenTimerInterval = ref(null)
const writtenQuestionsList = ref([])

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
  const total = questions.value.length
  const pct = total ? (correct / total) * 100 : 0
  return { correct, wrong, skipped, total, pct: pct.toFixed(1) }
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
  let pool = questions.value
  if (subjectFilter.value !== 'all') pool = pool.filter(q => q.subject === subjectFilter.value)
  if (filterTab.value === 'correct') return pool.filter(q => answers.value[q.id] === q.answer)
  if (filterTab.value === 'wrong')   return pool.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer)
  if (filterTab.value === 'skipped') return pool.filter(q => answers.value[q.id] === undefined)
  return pool
})

// Counts scoped to current subjectFilter — used by review tab badges
const filteredCounts = computed(() => {
  let pool = questions.value
  if (subjectFilter.value !== 'all') pool = pool.filter(q => q.subject === subjectFilter.value)
  return {
    all:     pool.length,
    correct: pool.filter(q => answers.value[q.id] === q.answer).length,
    wrong:   pool.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer).length,
    skipped: pool.filter(q => answers.value[q.id] === undefined).length,
  }
})

const subjectBreakdown = computed(() => {
  if (!selectedGroup.value) return []
  return Object.keys(selectedGroup.value.subjects).map(subj => {
    const qs = questions.value.filter(q => q.subject === subj)
    const correct = qs.filter(q => answers.value[q.id] === q.answer).length
    const wrong = qs.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer).length
    const skipped = qs.filter(q => answers.value[q.id] === undefined).length
    const total = qs.length
    const pct = total ? (correct / total * 100).toFixed(1) : '0.0'
    const tabCount = filterTab.value === 'correct' ? correct
      : filterTab.value === 'wrong' ? wrong
      : filterTab.value === 'skipped' ? skipped
      : total
    return { subj, label: subjectLabels[subj] || subj, correct, wrong, skipped, total, pct, tabCount }
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
  showStartModal.value = false
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
    subjectFilter.value = 'all'
  }
}

function startWritten() {
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
  subjectFilter.value = 'all'
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

function triggerImageUpload(questionId) {
  const el = document.getElementById(`img-input-${questionId}`)
  if (el) el.click()
}

function handleImageUpload(questionId, event) {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { alert('File too large — max 5MB'); return }
  const reader = new FileReader()
  reader.onload = (e) => {
    writtenAnswers.value[questionId] = {
      ...writtenAnswers.value[questionId],
      imageBase64: e.target.result,
      imageUrl: e.target.result,
    }
  }
  reader.readAsDataURL(file)
  // Reset input so same file can be re-selected
  event.target.value = ''
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
  filterTab.value = 'all'
  subjectFilter.value = 'all'
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

// ════════════════════════════════════════════════════════════════════════════
// PATCH for: pages/dashboard/hsc-ssc-exam.vue
// PURPOSE:   Auto-start from query params when launched by exams.vue
//
// WHERE TO ADD:  Inside <script setup>, AFTER all the existing refs/state
//               declarations (after line ~280, before the computed section).
//               Add this entire block.
// ════════════════════════════════════════════════════════════════════════════
 
// ─── QUERY PARAM AUTO-START ──────────────────────────────────────────────────
// Reads query params set by exams.vue → navigateTo({ path, query: { ... } })
// Supported params:
//   stream    — 'hsc' | 'ssc'
//   group     — 'hsc_science' | 'hsc_arts' | 'hsc_commerce' | 'ssc_science' | etc.
//   autostart — '1' to skip setup and start the exam immediately
//   examId    — (optional) the preset exam id, stored for analytics later
//   title     — (optional) preset exam title shown in setup header
const route = useRoute()
 
onMounted(() => {
  const q = route.query
 
  // Only auto-configure if autostart=1 is present
  if (q.autostart !== '1') return
 
  // Map stream → exam type key used by examTypes object
  const streamToType = {
    hsc: 'hsc',
    ssc: 'ssc',
  }
 
  const examTypeKey  = streamToType[q.stream]  // 'hsc' | 'ssc'
  const groupKey     = q.group                  // e.g. 'hsc_science'
 
  // Validate — both must be valid for the auto-start to proceed
  if (!examTypeKey || !examTypes[examTypeKey]) return
  const typeConfig = examTypes[examTypeKey]
  const groupExists = typeConfig.groups.find(g => g.key === groupKey)
  if (!groupExists) return
 
  // Set selections (same as user tapping them in setup UI)
  selectedExamType.value  = examTypeKey
  selectedGroupKey.value  = groupKey
 
  // Show start modal briefly so user sees the exam config, then auto-start.
  // If you prefer to skip the modal entirely, call startExam() directly.
  nextTick(() => {
    // Small delay so the setup phase renders before modal appears
    setTimeout(() => {
      showStartModal.value = true
    }, 300)
  })
})
 
// ════════════════════════════════════════════════════════════════════════════
// OPTIONAL: If you also want to show the preset exam title in the setup header
// instead of the generic "Board Exam Prep", add this computed:
// ════════════════════════════════════════════════════════════════════════════
 
const presetExamTitle = computed(() => route.query.title || null)
 
// Then in the template, replace the hardcoded <p> description with:
// <p class="page-desc">{{ presetExamTitle || 'Full mock exams for HSC & SSC...' }}</p>
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
            <div class="expect-sub">{{ examConfig.mcqDuration }} min · No negative marking</div>
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
          <button class="iso-btn iso-btn--fill" @click="showStartModal = true">Start Exam →</button>
        </div>
      </div>
    </div><!-- /setup -->

    <!-- ══════════════════ START EXAM MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showStartModal" class="modal-backdrop" @click.self="showStartModal = false">
        <div class="modal start-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="start-modal-icon">📋</div>
          <div class="start-modal-title">READY TO START?</div>
          <div class="start-modal-exam">{{ examConfig?.label }} — {{ selectedGroup?.label }}</div>
          <div class="start-modal-grid">
            <div class="sm-stat"><span class="sm-val">{{ examConfig?.totalMcq }}</span><span>MCQ Questions</span></div>
            <div class="sm-stat"><span class="sm-val">{{ examConfig?.mcqDuration }}</span><span>Minutes (MCQ)</span></div>
            <div v-if="isPaid" class="sm-stat"><span class="sm-val">{{ examConfig?.writtenQuestions }}</span><span>Written Qs</span></div>
            <div v-if="isPaid" class="sm-stat"><span class="sm-val">{{ examConfig?.writtenDuration }}</span><span>Minutes (Written)</span></div>
          </div>
          <div class="start-modal-rules">
            <div class="sm-rule">✓ Each correct MCQ answer = 1 mark</div>
            <div class="sm-rule">✓ Wrong or skipped answers = 0 marks (no penalty)</div>
            <div v-if="isPaid" class="sm-rule sm-rule--written">✏ Written section starts automatically after MCQ</div>
            <div v-else class="sm-rule sm-rule--free">🔓 Written section available for Pro members</div>
          </div>
          <div class="start-modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="showStartModal = false">Go Back</button>
            <button class="iso-btn iso-btn--fill" @click="startExam">Begin Exam →</button>
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
            <span class="q-answered-note" v-if="answers[q.id] !== undefined">✓ Answer selected</span>
            <span class="q-unanswered-note" v-else>Not yet answered</span>
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
          <div class="end-neg-note">No negative marking — every attempt is risk-free.</div>
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
          <span class="topbar-prog">{{ writtenQuestionsList.filter(q => writtenAnswers[q.id]?.text?.length > 5).length }}/{{ writtenQuestionsList.length }} answered</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-bar-track">
            <div class="topbar-bar-fill written-fill" :style="{ width: (writtenQuestionsList.filter(q => writtenAnswers[q.id]?.text?.length > 5).length / writtenQuestionsList.length * 100) + '%' }"></div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-timer" :class="timerClass">⏱ {{ timerDisplay }}</div>
          <button class="iso-btn iso-btn--ghost topbar-end-btn" @click="submitWritten">Submit Written</button>
        </div>
      </div>

      <!-- Scrollable written questions list -->
      <div class="written-scroll-list">
        <div
          v-for="(q, i) in writtenQuestionsList"
          :key="q.id"
          class="wq-card"
          :class="{ 'wq-card--answered': writtenAnswers[q.id]?.text?.length > 5 }"
        >
          <div class="wq-card-corner tl"></div>
          <div class="wq-card-corner br"></div>

          <div class="wq-header">
            <div class="wq-meta">
              <span class="wq-num">Q{{ i+1 }}</span>
              <span class="wq-subject">{{ q.subject }}</span>
              <span class="wq-chapter">{{ q.chapter }}</span>
              <span :class="['wq-type', q.type === 'creative' ? 'type-creative' : 'type-short']">
                {{ q.type === 'creative' ? 'Creative' : 'Short Answer' }}
              </span>
              <span class="wq-year">{{ q.year }}</span>
            </div>
            <span class="wq-marks-badge">{{ q.marks }} marks</span>
          </div>

          <div class="wq-text">{{ q.text }}</div>

          <!-- Answer textarea -->
          <div class="wq-answer-section">
            <label class="wq-answer-label">YOUR ANSWER</label>
            <textarea
              class="wq-textarea"
              :placeholder="q.type === 'creative'
                ? 'Write your creative answer here. Address each part (ক/খ/গ/ঘ or a/b/c/d) clearly...'
                : 'Write your answer here. Be clear and concise...'"
              v-model="writtenAnswers[q.id].text"
              rows="8"
            ></textarea>
            <div class="wq-char-count">
              {{ writtenAnswers[q.id]?.text?.length || 0 }} characters
            </div>
          </div>

          <!-- Image upload — one input per question, identified by unique id -->
          <div class="wq-image-section">
            <div class="wq-image-label">
              <span>ATTACH DIAGRAM / IMAGE</span>
              <span class="wq-image-hint">Optional — upload a handwritten diagram or figure</span>
            </div>

            <div v-if="!writtenAnswers[q.id]?.imageUrl" class="wq-image-dropzone" @click="triggerImageUpload(q.id)">
              <div class="wq-dropzone-icon">📎</div>
              <div class="wq-dropzone-text">Click to upload image</div>
              <div class="wq-dropzone-hint">JPG, PNG — max 5MB</div>
            </div>

            <div v-else class="wq-image-preview">
              <img :src="writtenAnswers[q.id].imageUrl" alt="Uploaded diagram" class="wq-preview-img" />
              <button class="wq-remove-image" @click="removeImage(q.id)">✕ Remove</button>
            </div>

            <!-- Hidden file inputs — one per question, keyed by question id -->
            <input
              :id="`img-input-${q.id}`"
              type="file"
              accept="image/*"
              style="display:none"
              @change="handleImageUpload(q.id, $event)"
            />
          </div>
        </div>

        <!-- Submit bar at bottom -->
        <div class="submit-bar written-submit-bar">
          <div class="submit-stats">
            <span>Answered: <strong>{{ writtenQuestionsList.filter(q => writtenAnswers[q.id]?.text?.length > 5).length }}</strong></span>
            <span>With image: <strong>{{ writtenQuestionsList.filter(q => writtenAnswers[q.id]?.imageUrl).length }}</strong></span>
            <span>Total marks: <strong>{{ writtenTotalMarks }}</strong></span>
          </div>
          <div class="submit-actions">
            <button class="iso-btn iso-btn--fill" @click="submitWritten">Submit Written →</button>
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
          <div class="score-raw">Score: <strong>{{ scoreData.correct }} / {{ scoreData.total }}</strong></div>
          <div class="score-status" :class="parseFloat(scoreData.pct) >= examConfig.passScore ? 'status-pass' : 'status-fail'">
            {{ parseFloat(scoreData.pct) >= examConfig.passScore ? '✓ PASSED' : '✗ FAILED' }} · Pass: {{ examConfig.passScore }}%
          </div>
        </div>
        <div class="score-hero-right">
          <div class="grade-badge" :class="gradeInfo.cls">{{ gradeInfo.letter }}</div>
          <div class="grade-label">{{ gradeInfo.label }}</div>
          <div class="score-cards-grid">
            <div class="smc correct-card"><div class="smc-val">{{ scoreData.correct }}</div><div class="smc-lbl">Correct</div><div class="smc-mark correct-mark">+{{ scoreData.correct }}</div></div>
            <div class="smc wrong-card"><div class="smc-val">{{ scoreData.wrong }}</div><div class="smc-lbl">Wrong</div><div class="smc-mark">0</div></div>
            <div class="smc skipped-card"><div class="smc-val">{{ scoreData.skipped }}</div><div class="smc-lbl">Skipped</div><div class="smc-mark">0</div></div>
          </div>
        </div>
      </div>

      <!-- Subject Breakdown — filterable, matches admission-exam.vue -->
      <div class="sb-section-header">
        <div class="section-title-label">SUBJECT-WISE PERFORMANCE</div>
        <div class="sb-filter-hint">
          <span v-if="subjectFilter === 'all'">↓ Click a subject to filter the review below</span>
          <span v-else class="sb-filter-active-hint">Showing questions for <strong>{{ subjectLabels[subjectFilter] || subjectFilter }}</strong> only</span>
        </div>
      </div>
      <div class="subject-breakdown-grid">
        <div
          v-for="sb in subjectBreakdown"
          :key="sb.subj"
          class="sb-card"
          :class="{
            'sb-card--active': subjectFilter === sb.subj,
            'sb-card--dim':    subjectFilter !== 'all' && subjectFilter !== sb.subj
          }"
          @click="subjectFilter = subjectFilter === sb.subj ? 'all' : sb.subj"
        >
          <div class="sb-card-top">
            <div class="sb-name">{{ sb.label }}</div>
            <div class="sb-tab-count" :class="{
              'sb-tab-correct': filterTab === 'correct',
              'sb-tab-wrong':   filterTab === 'wrong',
              'sb-tab-skipped': filterTab === 'skipped',
            }">
              {{ sb.tabCount }}
              <span class="sb-tab-label">{{ filterTab === 'all' ? 'total' : filterTab }}</span>
            </div>
          </div>
          <div class="sb-stats-row">
            <span class="sb-stat correct">✓ {{ sb.correct }}</span>
            <span class="sb-stat wrong">✗ {{ sb.wrong }}</span>
            <span class="sb-stat skip">— {{ sb.skipped }}</span>
          </div>
          <div class="sb-bar-track">
            <div
              class="sb-bar-fill"
              :class="parseFloat(sb.pct) >= 60 ? 'sb-high-fill' : parseFloat(sb.pct) >= 40 ? 'sb-mid-fill' : 'sb-low-fill'"
              :style="{ width: Math.max(0, parseFloat(sb.pct)) + '%' }"
            ></div>
          </div>
          <div class="sb-card-footer">
            <div class="sb-pct" :class="parseFloat(sb.pct) >= 60 ? 'sb-high' : parseFloat(sb.pct) >= 40 ? 'sb-mid' : 'sb-low'">{{ sb.pct }}%</div>
            <div class="sb-filter-cta">{{ subjectFilter === sb.subj ? '✕ clear' : 'filter →' }}</div>
          </div>
        </div>
      </div>

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

      <!-- MCQ Question Review -->
      <div class="review-header">
        <div class="review-header-left">
          <span class="section-title-label">MCQ QUESTION REVIEW
            <span v-if="subjectFilter !== 'all'" class="review-subject-chip">
              {{ subjectLabels[subjectFilter] || subjectFilter }}
              <button class="review-clear-subj" @click="subjectFilter = 'all'">×</button>
            </span>
          </span>
        </div>
        <div class="review-tabs">
          <button
            v-for="t in ['all','correct','wrong','skipped']"
            :key="t"
            class="rev-tab"
            :class="{ active: filterTab === t }"
            @click="filterTab = t"
          >
            {{ t.toUpperCase() }}
            <span class="rev-count">{{ filteredCounts[t] }}</span>
          </button>
        </div>
      </div>

      <div v-if="filteredReview.length === 0" class="review-empty">
        <span class="review-empty-icon">—</span>
        <span>No questions match this filter.</span>
        <button class="iso-btn iso-btn--ghost" style="font-size:0.68rem;padding:6px 14px;" @click="filterTab = 'all'; subjectFilter = 'all'">Clear filters</button>
      </div>

      <div class="review-list">
        <div
          v-for="q in filteredReview"
          :key="q.id"
          class="rc-card"
          :class="{
            'rc-correct': answers[q.id] === q.answer,
            'rc-wrong':   answers[q.id] !== undefined && answers[q.id] !== q.answer,
            'rc-skipped': answers[q.id] === undefined
          }"
        >
          <div class="rc-header">
            <div class="rc-meta">
              <span class="rc-qnum">Q{{ questions.indexOf(q)+1 }}</span>
              <span class="rc-subj">{{ subjectLabels[q.subject] || q.subject }}</span>
              <span class="rc-chapter">{{ q.chapter }}</span>
              <span :class="['rc-diff', diffClass(q.difficulty)]">{{ q.difficulty }}</span>
            </div>
            <div class="rc-result-badge">
              <span v-if="answers[q.id] === q.answer" class="rc-badge rc-badge-correct">✓ Correct</span>
              <span v-else-if="answers[q.id] !== undefined" class="rc-badge rc-badge-wrong">✗ Wrong</span>
              <span v-else class="rc-badge rc-badge-skip">— Skipped</span>
            </div>
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
          <!-- Explanation — always visible -->
          <div v-if="q.explanation" class="rc-explanation">
            <span class="exp-label">EXPLANATION</span>
            <p class="exp-text">{{ q.explanation }}</p>
          </div>
        </div>
      </div>

      <!-- Results Actions -->
      <div class="results-actions">
        <NuxtLink to="/pricing" v-if="!isPaid" class="iso-btn iso-btn--ghost">Upgrade for Written →</NuxtLink>
        <button class="iso-btn iso-btn--ghost" @click="resetToSetup">← New Exam</button>
        <button class="iso-btn iso-btn--fill" @click="resetToSetup">Retake</button>
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
.written-note { color: rgba(255,200,80,0.8); font-family: var(--font-mono); font-size: 0.68rem; }
.free-note { color: rgba(120,220,120,0.6); font-family: var(--font-mono); font-size: 0.68rem; }
.cta-right { display: flex; gap: 10px; flex-shrink: 0; }

/* slide-down transition */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
.fade-expand-enter-active, .fade-expand-leave-active { transition: all 0.3s ease; }
.fade-expand-enter-from, .fade-expand-leave-to { opacity: 0; transform: scaleY(0.95); transform-origin: top; }

/* ─── MODAL BASE ─────────────────────────────────────────────────────────── */
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

/* ─── START MODAL ────────────────────────────────────────────────────────── */
.start-modal-icon { font-size: 2rem; margin-bottom: 10px; }
.start-modal-title { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.18em; color: var(--white); margin-bottom: 6px; }
.start-modal-exam { font-family: var(--font-mono); font-size: 1rem; color: var(--white); margin-bottom: 22px; }
.start-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); margin-bottom: 20px; }
.sm-stat { background: var(--black); padding: 14px; text-align: center; }
.sm-val { display: block; font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--white); margin-bottom: 3px; }
.sm-stat span:last-child { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }
.start-modal-rules { display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
.sm-rule { font-family: var(--font-sans); font-size: 0.82rem; color: var(--gray); padding-left: 2px; }
.sm-rule--written { color: rgba(255,200,80,0.8); font-family: var(--font-mono); font-size: 0.72rem; }
.sm-rule--free { color: rgba(120,220,120,0.7); font-family: var(--font-mono); font-size: 0.72rem; }
.start-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── EXPLANATION BLOCK ──────────────────────────────────────────────────── */
.rc-explanation {
  margin-top: 14px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
.rc-explanation-label {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.14em;
  color: rgba(255,200,80,0.7); display: block; margin-bottom: 6px;
  border-left: 2px solid rgba(255,200,80,0.4); padding-left: 8px;
}
.rc-explanation-text {
  font-family: var(--font-sans); font-size: 0.83rem; color: var(--gray);
  line-height: 1.65; margin: 0;
  padding-left: 10px;
  border-left: 2px solid rgba(255,200,80,0.2);
}

/* ─── SCROLLABLE WRITTEN LIST ────────────────────────────────────────────── */
.written-scroll-list {
  padding: 20px 0 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.wq-card {
  position: relative; background: var(--black); border: 1px solid var(--border);
  border-left: 3px solid rgba(255,200,80,0.3); padding: 28px;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
  transition: border-left-color 0.2s;
}
.wq-card--answered { border-left-color: rgba(120,220,120,0.5); }
.written-submit-bar { margin-top: 8px; }

/* ─── Q-CARD FOOTER ──────────────────────────────────────────────────────── */
.q-answered-note { font-family: var(--font-mono); font-size: 0.57rem; color: rgba(120,220,120,0.7); }
.q-unanswered-note { font-family: var(--font-mono); font-size: 0.57rem; color: var(--dim); }

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
.section-title-label {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.14em; color: var(--dim);
}
.sb-section-header {
  display: flex; align-items: baseline; justify-content: space-between;
  flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
}
.sb-filter-hint {
  font-family: var(--font-mono); font-size: 0.57rem;
  letter-spacing: 0.05em; color: var(--dim);
}
.sb-filter-active-hint { color: rgba(255,200,80,0.8); }
.sb-filter-active-hint strong { color: rgba(255,200,80,0.95); }

.subject-breakdown-grid {
  display: grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr));
  gap: 1px; background: var(--border); margin-bottom: 24px;
}
.sb-card {
  background: var(--black); padding: 14px 16px;
  cursor: pointer;
  border: 1px solid transparent; border-left: 2px solid transparent;
  transition: all 0.15s;
}
.sb-card:hover { border-left-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.sb-card--active { border-left-color: rgba(255,200,80,0.8) !important; background: rgba(255,200,80,0.04) !important; }
.sb-card--dim { opacity: 0.38; }

.sb-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 8px; }
.sb-name { font-family: var(--font-mono); font-size: 0.65rem; color: var(--white); }
.sb-card--active .sb-name { color: rgba(255,200,80,0.95); }

.sb-tab-count {
  font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700;
  color: var(--white); text-align: right; line-height: 1;
}
.sb-tab-label {
  display: block; font-size: 0.48rem; color: var(--dim);
  font-weight: 400; letter-spacing: 0.08em; text-align: right; margin-top: 2px;
}
.sb-tab-correct .sb-tab-count { color: rgba(120,220,120,0.9); }
.sb-tab-wrong   .sb-tab-count { color: rgba(255,100,100,0.9); }
.sb-tab-skipped .sb-tab-count { color: var(--gray); }

.sb-stats-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.sb-stat { font-family: var(--font-mono); font-size: 0.58rem; }
.sb-stat.correct { color: rgba(120,220,120,0.8); }
.sb-stat.wrong   { color: rgba(255,100,100,0.8); }
.sb-stat.skip    { color: var(--dim); }

.sb-bar-track { height: 3px; background: rgba(240,240,234,0.06); margin-bottom: 8px; }
.sb-bar-fill { height: 100%; transition: width 0.5s; }
.sb-high-fill { background: rgba(120,220,120,0.5); }
.sb-mid-fill  { background: rgba(255,200,80,0.5); }
.sb-low-fill  { background: rgba(255,100,100,0.5); }
.sb-high { color: rgba(120,220,120,0.9); }
.sb-mid  { color: rgba(255,200,80,0.9); }
.sb-low  { color: rgba(255,100,100,0.9); }

.sb-card-footer { display: flex; align-items: center; justify-content: space-between; }
.sb-pct { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; }
.sb-filter-cta {
  font-family: var(--font-mono); font-size: 0.52rem;
  letter-spacing: 0.08em; color: var(--dim); transition: color 0.15s;
}
.sb-card:hover .sb-filter-cta { color: var(--border-bright); }
.sb-card--active .sb-filter-cta { color: rgba(255,200,80,0.7); }

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
.review-header-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.review-subject-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.57rem; letter-spacing: 0.08em;
  color: rgba(255,200,80,0.9);
  border: 1px solid rgba(255,200,80,0.35); background: rgba(255,200,80,0.06);
  padding: 2px 8px; margin-left: 8px; vertical-align: middle;
}
.review-clear-subj {
  background: none; border: none;
  color: rgba(255,200,80,0.7); cursor: pointer;
  font-size: 0.78rem; padding: 0; line-height: 1; transition: color 0.15s;
}
.review-clear-subj:hover { color: rgba(255,100,100,0.8); }
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
.rc-result-badge {}
.rc-badge { font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700; padding: 3px 8px; border: 1px solid; }
.rc-badge-correct { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); background: rgba(120,220,120,0.05); }
.rc-badge-wrong   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.05); }
.rc-badge-skip    { color: var(--dim); border-color: var(--border); }
.rc-question { font-family: var(--font-sans); font-size: 0.88rem; color: var(--white); line-height: 1.6; margin-bottom: 12px; }
.rc-options { display: flex; flex-direction: column; gap: 5px; margin-bottom: 4px; }
.rc-opt { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--border); }
.rc-opt.rc-correct { border-color: rgba(120,220,120,0.4); background: rgba(120,220,120,0.04); }
.rc-opt.rc-wrong   { border-color: rgba(255,100,100,0.4); background: rgba(255,100,100,0.04); }
.rc-opt-letter { font-family: var(--font-mono); font-size: 0.6rem; width: 20px; height: 20px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--white); flex-shrink: 0; }
.rc-opt.rc-correct .rc-opt-letter { background: rgba(120,220,120,0.25); border-color: rgba(120,220,120,0.5); }
.rc-opt.rc-wrong   .rc-opt-letter { background: rgba(255,100,100,0.25); border-color: rgba(255,100,100,0.5); }
.rc-opt-text { font-family: var(--font-sans); font-size: 0.82rem; color: var(--white); flex: 1; }
.rc-tag-correct, .rc-tag-wrong { font-family: var(--font-mono); font-size: 0.54rem; padding: 2px 5px; border: 1px solid; flex-shrink: 0; }
.rc-tag-correct { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); }
.rc-tag-wrong   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); }
.rc-skipped-note { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; }

/* Explanation — always visible, admission-exam style */
.rc-explanation {
  display: flex; flex-direction: column; gap: 5px;
  margin-top: 4px; padding-top: 12px; border-top: 1px solid var(--border);
}
.exp-label {
  font-family: var(--font-mono); font-size: 0.55rem;
  letter-spacing: 0.18em; color: var(--gray);
}
.exp-text {
  font-family: var(--font-sans); font-size: 0.8rem;
  color: var(--dim); line-height: 1.65;
}

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
  .end-modal .end-actions { flex-direction: column; }
  .end-modal .end-actions .iso-btn { width: 100%; justify-content: center; }
  .start-modal-actions { flex-direction: column; gap: 8px; }
  .start-modal-actions .iso-btn { width: 100%; justify-content: center; }
}
</style>
