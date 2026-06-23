<script setup>
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
const questionBank = {
  medical: {
    biology: [
      { id: 'm-bio-1', text: 'Which of the following is NOT a function of the liver?', options: ['Bile secretion', 'Insulin production', 'Glycogen storage', 'Detoxification'], answer: 1, chapter: 'Digestive System', year: '2023', difficulty: 'medium',
        explanation: 'Insulin is produced by the beta cells of the islets of Langerhans in the pancreas, not the liver. The liver performs bile secretion (for fat digestion), glycogen storage (energy reserve), and detoxification (filtering toxins from blood).' },
      { id: 'm-bio-2', text: 'The site of fertilization in the human female reproductive system is:', options: ['Uterus', 'Ovary', 'Fallopian tube', 'Cervix'], answer: 2, chapter: 'Reproduction', year: '2022', difficulty: 'easy',
        explanation: 'Fertilization normally occurs in the ampulla region of the fallopian tube (oviduct). The egg is released from the ovary during ovulation and travels into the fallopian tube where it meets the sperm. If implantation occurs outside the uterus (e.g. in the tube), it is called an ectopic pregnancy.' },
      { id: 'm-bio-3', text: 'Which blood group is known as the "universal donor"?', options: ['A+', 'B+', 'O−', 'AB+'], answer: 2, chapter: 'Circulatory System', year: '2023', difficulty: 'easy',
        explanation: 'O− (O negative) is the universal donor because its red blood cells lack A, B, and Rh antigens on their surface. This means O− blood can be transfused to patients of any blood group without triggering an immune reaction. AB+ is the universal recipient.' },
      { id: 'm-bio-4', text: 'The functional unit of the kidney is:', options: ['Glomerulus', 'Nephron', 'Bowman\'s capsule', 'Loop of Henle'], answer: 1, chapter: 'Excretion', year: '2022', difficulty: 'easy',
        explanation: 'The nephron is the structural and functional unit of the kidney. Each kidney contains about 1 million nephrons. A nephron consists of the Bowman\'s capsule, glomerulus, proximal convoluted tubule, loop of Henle, and distal convoluted tubule — all of which are parts of the nephron, not independent units.' },
      { id: 'm-bio-5', text: 'Myelin sheath is produced by which cells in the peripheral nervous system?', options: ['Astrocytes', 'Schwann cells', 'Oligodendrocytes', 'Microglia'], answer: 1, chapter: 'Nervous System', year: '2021', difficulty: 'hard',
        explanation: 'In the peripheral nervous system (PNS), Schwann cells wrap around individual axons to form the myelin sheath. In the central nervous system (CNS), this role is performed by oligodendrocytes. Astrocytes provide structural and nutritional support, while microglia are the immune cells of the CNS.' },
      { id: 'm-bio-6', text: 'During aerobic respiration, the net gain of ATP from one molecule of glucose is:', options: ['2 ATP', '4 ATP', '36-38 ATP', '24 ATP'], answer: 2, chapter: 'Cell Biology', year: '2023', difficulty: 'medium',
        explanation: 'Aerobic respiration of one glucose molecule yields a net gain of 36–38 ATP. This comes from: glycolysis (net 2 ATP), Krebs cycle (2 ATP), and oxidative phosphorylation via the electron transport chain (32–34 ATP). Anaerobic respiration only yields 2 net ATP.' },
      { id: 'm-bio-7', text: 'Which hormone is responsible for the "fight or flight" response?', options: ['Cortisol', 'Adrenaline (Epinephrine)', 'Thyroxine', 'Insulin'], answer: 1, chapter: 'Endocrine System', year: '2022', difficulty: 'easy',
        explanation: 'Adrenaline (epinephrine), secreted by the adrenal medulla, triggers the fight-or-flight response. It increases heart rate, dilates airways, increases blood glucose, and redirects blood to muscles. Cortisol is a stress hormone from the adrenal cortex that works more slowly over longer periods.' },
      { id: 'm-bio-8', text: 'The process by which plants make their own food is called:', options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Fermentation'], answer: 2, chapter: 'Plant Biology', year: '2023', difficulty: 'easy',
        explanation: 'Photosynthesis is the process by which plants, algae, and cyanobacteria convert light energy (usually from the sun) into chemical energy stored as glucose, using CO₂ and water: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Transpiration is water loss through stomata; respiration releases energy.' },
    ],
    chemistry: [
      { id: 'm-chem-1', text: 'The pH of blood is maintained at approximately:', options: ['6.4–6.8', '7.35–7.45', '7.8–8.0', '6.0–7.0'], answer: 1, chapter: 'Acids & Bases', year: '2023', difficulty: 'medium',
        explanation: 'Normal human blood pH is maintained within the narrow range of 7.35–7.45 (slightly alkaline). This is regulated by buffer systems (bicarbonate, phosphate, protein), the lungs (CO₂ elimination), and the kidneys. A pH below 7.35 is acidosis; above 7.45 is alkalosis — both are life-threatening.' },
      { id: 'm-chem-2', text: 'Which of the following is an example of a noble gas?', options: ['Fluorine', 'Nitrogen', 'Argon', 'Chlorine'], answer: 2, chapter: 'Periodic Table', year: '2022', difficulty: 'easy',
        explanation: 'Noble gases (Group 18) are helium (He), neon (Ne), argon (Ar), krypton (Kr), xenon (Xe), and radon (Rn). They have full outer electron shells making them chemically inert. Fluorine and Chlorine are halogens (Group 17); Nitrogen is a Group 15 nonmetal.' },
      { id: 'm-chem-3', text: 'Haemoglobin contains which metal ion?', options: ['Zinc (Zn²⁺)', 'Copper (Cu²⁺)', 'Iron (Fe²⁺)', 'Magnesium (Mg²⁺)'], answer: 2, chapter: 'Coordination Chemistry', year: '2023', difficulty: 'easy',
        explanation: 'Haemoglobin contains iron (Fe²⁺) at the centre of the haem group (a porphyrin ring). Each haemoglobin molecule has 4 haem groups, each capable of binding one O₂ molecule. Iron deficiency causes anaemia. Note: Chlorophyll contains Mg²⁺, and many enzymes use Zn²⁺ or Cu²⁺.' },
      { id: 'm-chem-4', text: 'The hybridization of carbon in methane (CH₄) is:', options: ['sp', 'sp²', 'sp³', 'sp³d'], answer: 2, chapter: 'Organic Chemistry', year: '2021', difficulty: 'medium',
        explanation: 'In methane (CH₄), carbon forms 4 single bonds with no double/triple bonds and no lone pairs. This requires sp³ hybridization — mixing one s orbital with three p orbitals to form 4 equivalent sp³ hybrid orbitals arranged tetrahedrally (109.5° bond angles). sp = linear; sp² = trigonal planar (e.g. ethene).' },
    ],
    physics: [
      { id: 'm-phy-1', text: 'Which principle explains why blood pressure is measured in mmHg?', options: ['Archimedes\' Principle', 'Pascal\'s Law', 'Bernoulli\'s Principle', 'Boyle\'s Law'], answer: 1, chapter: 'Fluid Mechanics', year: '2023', difficulty: 'hard',
        explanation: 'Pascal\'s Law states that pressure applied to a confined fluid is transmitted equally in all directions. Blood pressure measurement relies on this — a mercury column (sphygmomanometer) measures the pressure exerted by blood on vessel walls. The unit mmHg refers to the height of a mercury column that the pressure can support.' },
      { id: 'm-phy-2', text: 'The unit of electric potential difference is:', options: ['Ampere', 'Ohm', 'Volt', 'Watt'], answer: 2, chapter: 'Electricity', year: '2022', difficulty: 'easy',
        explanation: 'The Volt (V) is the SI unit of electric potential difference (voltage). 1 Volt = 1 Joule per Coulomb (J/C). Ampere (A) measures current (charge per second), Ohm (Ω) measures resistance, and Watt (W) measures power. Ohm\'s Law: V = IR.' },
      { id: 'm-phy-3', text: 'X-rays are part of which spectrum?', options: ['Sound waves', 'Electromagnetic spectrum', 'Mechanical waves', 'Matter waves'], answer: 1, chapter: 'Modern Physics', year: '2023', difficulty: 'easy',
        explanation: 'X-rays are a form of electromagnetic radiation with wavelengths of 0.01–10 nm, sitting between ultraviolet and gamma rays on the electromagnetic spectrum. They travel at the speed of light (3×10⁸ m/s) and require no medium. Sound and mechanical waves need a medium; matter waves (de Broglie) describe particle wave-like behaviour.' },
    ],
  },
  varsity: {
    bangla: [
      { id: 'v-ban-1', text: '"আমার সোনার বাংলা" কবিতাটি কে রচনা করেছেন?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জীবনানন্দ দাশ', 'মাইকেল মধুসূদন দত্ত'], answer: 1, chapter: 'বাংলা সাহিত্য', year: '2023', difficulty: 'easy',
        explanation: '"আমার সোনার বাংলা" কবিতাটি রবীন্দ্রনাথ ঠাকুর ১৯০৫ সালে বঙ্গভঙ্গ আন্দোলনের পরিপ্রেক্ষিতে রচনা করেন। এটি ১৯৭১ সালে বাংলাদেশের জাতীয় সংগীত হিসেবে গৃহীত হয়। প্রথম দশটি লাইন সংগীত হিসেবে ব্যবহৃত হয়।' },
      { id: 'v-ban-2', text: '"বিদ্রোহী" কবিতাটি কোন কবির রচনা?', options: ['রবীন্দ্রনাথ ঠাকুর', 'শামসুর রাহমান', 'কাজী নজরুল ইসলাম', 'সুফিয়া কামাল'], answer: 2, chapter: 'বাংলা কবিতা', year: '2022', difficulty: 'easy',
        explanation: '"বিদ্রোহী" কবিতাটি কাজী নজরুল ইসলাম ১৯২১ সালে রচনা করেন এবং ১৯২২ সালে বিজলী পত্রিকায় প্রকাশিত হয়। এটি বাংলা সাহিত্যের অন্যতম বিখ্যাত কবিতা। নজরুল ইসলাম "বিদ্রোহী কবি" নামে পরিচিত এবং বাংলাদেশের জাতীয় কবি।' },
      { id: 'v-ban-3', text: 'বাংলা ব্যাকরণ অনুযায়ী "সন্ধি" কত প্রকার?', options: ['২ প্রকার', '৩ প্রকার', '৪ প্রকার', '৫ প্রকার'], answer: 1, chapter: 'বাংলা ব্যাকরণ', year: '2023', difficulty: 'medium',
        explanation: 'বাংলা ব্যাকরণে সন্ধি তিন প্রকার: (১) স্বরসন্ধি — দুটি স্বরবর্ণের মিলন, (২) ব্যঞ্জনসন্ধি — ব্যঞ্জনবর্ণের সাথে স্বর বা ব্যঞ্জনের মিলন, এবং (৩) বিসর্গসন্ধি — বিসর্গের সাথে স্বর বা ব্যঞ্জনের মিলন।' },
      { id: 'v-ban-4', text: '"পদ্মা নদীর মাঝি" উপন্যাসটির রচয়িতা কে?', options: ['শরৎচন্দ্র চট্টোপাধ্যায়', 'রবীন্দ্রনাথ ঠাকুর', 'মানিক বন্দ্যোপাধ্যায়', 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়'], answer: 2, chapter: 'বাংলা উপন্যাস', year: '2022', difficulty: 'easy',
        explanation: '"পদ্মা নদীর মাঝি" মানিক বন্দ্যোপাধ্যায়ের বিখ্যাত উপন্যাস, ১৯৩৬ সালে প্রকাশিত। এটি পদ্মা নদীর জেলেদের জীবন নিয়ে রচিত। মানিক বন্দ্যোপাধ্যায় বাংলা সাহিত্যের একজন প্রথিতযশা কথাসাহিত্যিক, যিনি মার্কসীয় দর্শনে বিশ্বাসী ছিলেন।' },
    ],
    english: [
      { id: 'v-eng-1', text: 'Choose the correct passive form of: "The teacher teaches the students."', options: ['The students are taught by the teacher.', 'The students were taught by the teacher.', 'The students have been taught by the teacher.', 'The students is taught by the teacher.'], answer: 0, chapter: 'Grammar', year: '2023', difficulty: 'medium',
        explanation: 'The active sentence uses simple present tense ("teaches"). The passive of simple present is: Subject + am/is/are + past participle + by + agent. Since "students" is plural, we use "are taught". Option B uses past tense; C uses present perfect; D incorrectly uses "is" with a plural subject.' },
      { id: 'v-eng-2', text: 'What is the synonym of "Eloquent"?', options: ['Silent', 'Fluent', 'Dull', 'Harsh'], answer: 1, chapter: 'Vocabulary', year: '2022', difficulty: 'medium',
        explanation: '"Eloquent" means expressing ideas fluently and persuasively in speech or writing. Its synonym is "Fluent" — both describe a smooth, effortless command of language. "Silent" is the antonym; "Dull" means boring or lacking excitement; "Harsh" means rough or unpleasant.' },
      { id: 'v-eng-3', text: 'Which of the following is a correct sentence?', options: ['She don\'t know the answer.', 'She doesn\'t knows the answer.', 'She doesn\'t know the answer.', 'She not know the answer.'], answer: 2, chapter: 'Grammar', year: '2023', difficulty: 'easy',
        explanation: 'With third person singular subjects (he/she/it) in simple present tense, we use "doesn\'t" (does not) with the base form of the verb. Option A is wrong ("don\'t" is for I/you/we/they). Option B is wrong (double marking: "doesn\'t knows"). Option D is missing the auxiliary verb.' },
    ],
    math: [
      { id: 'v-math-1', text: 'If log₂8 = x, what is the value of x?', options: ['2', '3', '4', '6'], answer: 1, chapter: 'Logarithm', year: '2023', difficulty: 'easy',
        explanation: 'log₂8 = x means 2ˣ = 8. Since 2³ = 8, x = 3. Remember: logₐb = c means aᶜ = b. Key logarithm rule: log₂(2ⁿ) = n. Here, 8 = 2³, so log₂8 = 3.' },
      { id: 'v-math-2', text: 'The roots of the equation x² − 5x + 6 = 0 are:', options: ['2 and 3', '1 and 6', '−2 and −3', '2 and −3'], answer: 0, chapter: 'Algebra', year: '2022', difficulty: 'easy',
        explanation: 'Factorising x² − 5x + 6 = 0: we need two numbers that multiply to +6 and add to −5. Those numbers are −2 and −3: (x − 2)(x − 3) = 0. So x = 2 or x = 3. Verify: 2+3=5 ✓ and 2×3=6 ✓.' },
      { id: 'v-math-3', text: 'The value of sin²θ + cos²θ is always equal to:', options: ['0', '2', '1', 'Depends on θ'], answer: 2, chapter: 'Trigonometry', year: '2023', difficulty: 'easy',
        explanation: 'sin²θ + cos²θ = 1 is the fundamental Pythagorean trigonometric identity. It holds for all values of θ and can be derived from the Pythagorean theorem applied to a unit circle (radius = 1). Other identities: 1 + tan²θ = sec²θ and 1 + cot²θ = cosec²θ.' },
      { id: 'v-math-4', text: 'What is the derivative of f(x) = x³ + 2x² − 5?', options: ['3x² + 4x', '3x² + 4x − 5', 'x² + 4x', '3x + 4'], answer: 0, chapter: 'Calculus', year: '2022', difficulty: 'medium',
        explanation: 'Using the power rule d/dx(xⁿ) = nxⁿ⁻¹: d/dx(x³) = 3x², d/dx(2x²) = 4x, d/dx(−5) = 0 (constant). So f\'(x) = 3x² + 4x. Common mistake: carrying the constant −5 into the derivative (option B). Constants always differentiate to zero.' },
    ],
    ict: [
      { id: 'v-ict-1', text: 'Which of the following is NOT a programming language?', options: ['Python', 'HTML', 'Java', 'C++'], answer: 1, chapter: 'Programming', year: '2023', difficulty: 'easy',
        explanation: 'HTML (HyperText Markup Language) is a markup language, not a programming language. It defines the structure and content of web pages using tags but has no logic, conditions, or loops. Python, Java, and C++ are full programming languages with variables, control flow, and functions.' },
      { id: 'v-ict-2', text: 'The binary equivalent of decimal number 10 is:', options: ['1010', '1100', '1001', '0110'], answer: 0, chapter: 'Number System', year: '2022', difficulty: 'medium',
        explanation: 'Convert 10 to binary by successive division by 2: 10÷2=5 R0, 5÷2=2 R1, 2÷2=1 R0, 1÷2=0 R1. Reading remainders bottom to top: 1010. Verify: 1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8+0+2+0 = 10 ✓.' },
    ],
    general_knowledge: [
      { id: 'v-gk-1', text: 'Bangladesh gained independence in which year?', options: ['1947', '1952', '1971', '1975'], answer: 2, chapter: 'Bangladesh Affairs', year: '2023', difficulty: 'easy',
        explanation: 'Bangladesh gained independence on 26 March 1971, when Sheikh Mujibur Rahman declared independence. The Liberation War lasted until 16 December 1971 (Victory Day), when Pakistani forces surrendered. 1947 was the partition of British India; 1952 was the Language Movement; 1975 was the political upheaval after independence.' },
      { id: 'v-gk-2', text: 'The capital of Australia is:', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], answer: 2, chapter: 'World Geography', year: '2022', difficulty: 'medium',
        explanation: 'Canberra is the capital of Australia, chosen as a compromise between the rival cities of Sydney and Melbourne. It was purpose-built as the capital and became the seat of government in 1927. Sydney is the largest city and Melbourne is the second largest — a common confusion.' },
    ],
  }
}

// ─── EXAM CONFIGURATIONS ────────────────────────────────────────────────────
const examConfigs = {
  mbbs: {
    label: 'MBBS', fullLabel: 'MBBS Admission', icon: '🩺',
    authority: 'DGHS Bangladesh', color: 'rgba(120,220,120,0.12)',
    totalQuestions: 100, duration: 60,
    subjects: { biology: 30, chemistry: 25, physics: 20, english: 15, general_knowledge: 10 },
    subjectLabels: { biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', english: 'English', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Medical & Dental Colleges under DGHS'
  },
  bds: {
    label: 'BDS', fullLabel: 'BDS Admission', icon: '🦷',
    authority: 'DGHS Bangladesh', color: 'rgba(120,220,120,0.12)',
    totalQuestions: 100, duration: 60,
    subjects: { biology: 30, chemistry: 25, physics: 20, english: 15, general_knowledge: 10 },
    subjectLabels: { biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', english: 'English', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Bachelor of Dental Surgery Admissions'
  },
  afmc: {
    label: 'AFMC', fullLabel: 'Armed Forces Medical', icon: '⭐',
    authority: 'Bangladesh Army', color: 'rgba(120,220,120,0.12)',
    totalQuestions: 100, duration: 90,
    subjects: { biology: 25, chemistry: 25, physics: 25, english: 15, general_knowledge: 10 },
    subjectLabels: { biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', english: 'English', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 50, description: 'Armed Forces Medical College, Dhaka'
  },
  du: {
    label: 'DU', fullLabel: 'Dhaka University', icon: '🏛️',
    authority: 'University of Dhaka', color: 'rgba(255,200,80,0.10)',
    duration: 60, negativeMarking: 0.25, passScore: 40,
    requiresUnit: true,
    description: 'University of Dhaka – Select your unit below',
    units: [
      {
        key: 'ka', label: 'Ka Unit', sublabel: 'Science',
        totalQuestions: 100,
        requiresOptionals: true,
        optionalCount: 2,
        compulsory: { physics: 30, chemistry: 25 },
        compulsoryLabels: { physics: 'Physics', chemistry: 'Chemistry' },
        optionalSubjects: [
          { key: 'math',    label: 'Math',    questions: 25, description: 'Higher Mathematics' },
          { key: 'biology', label: 'Biology', questions: 25, description: 'Zoology & Botany' },
          { key: 'english', label: 'English', questions: 10, description: 'English Language' },
          { key: 'bangla',  label: 'বাংলা',   questions: 10, description: 'Bengali Language' },
        ],
        // subjects/subjectLabels/totalQuestions are computed dynamically based on optional picks
        subjects: { physics: 30, chemistry: 25, math: 25, biology: 20 }, // fallback display
        subjectLabels: { physics: 'Physics', chemistry: 'Chemistry', math: 'Math', biology: 'Biology', english: 'English', bangla: 'বাংলা' },
        totalQuestions: 100,
      },
      {
        key: 'kha', label: 'Kha Unit', sublabel: 'Humanities',
        totalQuestions: 100,
        subjects: { bangla: 35, english: 35, general_knowledge: 30 },
        subjectLabels: { bangla: 'বাংলা', english: 'English', general_knowledge: 'GK' },
      },
      {
        key: 'ga', label: 'Ga Unit', sublabel: 'Commerce',
        totalQuestions: 100,
        subjects: { bangla: 20, english: 20, math: 30, general_knowledge: 30 },
        subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', general_knowledge: 'GK' },
      },
      {
        key: 'gha', label: 'Gha Unit', sublabel: 'Fine Arts',
        totalQuestions: 100,
        subjects: { bangla: 30, english: 30, general_knowledge: 40 },
        subjectLabels: { bangla: 'বাংলা', english: 'English', general_knowledge: 'GK' },
      },
    ],
    // fallback for display before unit is chosen
    subjects: { bangla: 25, english: 25, math: 25, general_knowledge: 25 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', general_knowledge: 'GK' },
    totalQuestions: 100,
  },
  cu: {
    label: 'CU', fullLabel: 'Chittagong University', icon: '🏔️',
    authority: 'University of Chittagong', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 20, english: 20, math: 20, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'University of Chittagong'
  },
  ju: {
    label: 'JU', fullLabel: 'Jahangirnagar University', icon: '🌿',
    authority: 'Jahangirnagar University', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 20, english: 20, math: 20, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Jahangirnagar University, Savar'
  },
  ru: {
    label: 'RU', fullLabel: 'Rajshahi University', icon: '🏫',
    authority: 'University of Rajshahi', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 20, english: 20, math: 20, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'University of Rajshahi'
  },
  ku: {
    label: 'KU', fullLabel: 'Khulna University', icon: '🌊',
    authority: 'Khulna University', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 20, english: 20, math: 20, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Khulna University'
  },
  sust: {
    label: 'SUST', fullLabel: 'Shahjalal Uni. of Sci. & Tech.', icon: '🔬',
    authority: 'SUST Sylhet', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 15, english: 20, math: 25, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Shahjalal University of Science & Technology'
  },
}

// ─── STATE ───────────────────────────────────────────────────────────────────
const phase = ref('setup')           // 'setup' | 'exam' | 'results'
const selectedExam = ref(null)       // key of examConfigs
const selectedUnit = ref('')
const kaOptionalSubjects = ref([])   // up to 2 optional subject keys for Ka unit
const questions = ref([])
const answers = ref({})              // { questionId: optionIndex }
const flagged = ref(new Set())
const currentIdx = ref(0)
const timeLeft = ref(0)
const timerInterval = ref(null)
const showEndModal = ref(false)
const showNegativeWarning = ref(false)
const filterTab = ref('all')         // results filter: all | correct | wrong | skipped
const subjectFilter = ref('all')     // results subject filter: 'all' | subject key

// ─── COMPUTED ────────────────────────────────────────────────────────────────
const config = computed(() => selectedExam.value ? examConfigs[selectedExam.value] : null)

// For DU: the currently selected unit object (or null)
const activeUnitConfig = computed(() => {
  if (!config.value?.requiresUnit || !selectedUnit.value) return null
  return config.value.units.find(u => u.key === selectedUnit.value) || null
})

// Subjects/labels/total to actually use — reactive to unit + optional selection
const activeSubjects = computed(() => {
  if (!activeUnitConfig.value) return config.value?.subjects || {}
  const u = activeUnitConfig.value
  if (u.requiresOptionals) {
    // Build from compulsory + chosen optionals
    const result = { ...u.compulsory }
    kaOptionalSubjects.value.forEach(key => {
      const opt = u.optionalSubjects.find(o => o.key === key)
      if (opt) result[key] = opt.questions
    })
    return result
  }
  return u.subjects
})
const activeSubjectLabels = computed(() => {
  if (activeUnitConfig.value) return activeUnitConfig.value.subjectLabels
  return config.value?.subjectLabels || {}
})
const activeTotalQuestions = computed(() => {
  if (!activeUnitConfig.value) return config.value?.totalQuestions || 0
  const u = activeUnitConfig.value
  if (u.requiresOptionals) {
    const compTotal = Object.values(u.compulsory).reduce((a, b) => a + b, 0)
    const optTotal = kaOptionalSubjects.value.reduce((sum, key) => {
      const opt = u.optionalSubjects.find(o => o.key === key)
      return sum + (opt ? opt.questions : 0)
    }, 0)
    return compTotal + optTotal
  }
  return u.totalQuestions
})

// Can the user start?
const canStart = computed(() => {
  if (!selectedExam.value) return false
  if (config.value?.requiresUnit && !selectedUnit.value) return false
  if (activeUnitConfig.value?.requiresOptionals) {
    if (kaOptionalSubjects.value.length < activeUnitConfig.value.optionalCount) return false
  }
  return true
})

const timerClass = computed(() => {
  if (!timeLeft.value) return ''
  if (timeLeft.value <= 30) return 'critical'
  if (timeLeft.value <= 120) return 'warning'
  return ''
})

const timerDisplay = computed(() => {
  const t = timeLeft.value
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = (t % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const answeredCount = computed(() => Object.keys(answers.value).length)
const flaggedCount = computed(() => flagged.value.size)
const progressPct = computed(() => questions.value.length ? (answeredCount.value / questions.value.length) * 100 : 0)

// Score calculation with negative marking
const scoreData = computed(() => {
  if (!config.value) return {}
  let correct = 0, wrong = 0, skipped = 0
  questions.value.forEach(q => {
    if (answers.value[q.id] === undefined) { skipped++ }
    else if (answers.value[q.id] === q.answer) { correct++ }
    else { wrong++ }
  })
  const raw = correct - (wrong * config.value.negativeMarking)
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
  let list = questions.value
  // subject filter
  if (subjectFilter.value !== 'all') list = list.filter(q => q.subject === subjectFilter.value)
  // result filter
  if (filterTab.value === 'correct') return list.filter(q => answers.value[q.id] === q.answer)
  if (filterTab.value === 'wrong')   return list.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer)
  if (filterTab.value === 'skipped') return list.filter(q => answers.value[q.id] === undefined)
  return list
})

// Tab badge counts — scoped to subjectFilter only, never to filterTab
// So switching tabs doesn't change the counts shown on other tabs
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

// Subject breakdown for results
const subjectBreakdown = computed(() => {
  if (!config.value) return []
  const labels = activeSubjectLabels.value
  return Object.keys(activeSubjects.value).map(subj => {
    const qs = questions.value.filter(q => q.subject === subj)
    const correct = qs.filter(q => answers.value[q.id] === q.answer).length
    const wrong = qs.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer).length
    const skipped = qs.filter(q => answers.value[q.id] === undefined).length
    const total = qs.length
    const pct = total ? ((correct - wrong * 0.25) / total * 100).toFixed(1) : 0
    // count relevant to current filterTab, for the badge on card
    const tabCount = filterTab.value === 'correct' ? correct
      : filterTab.value === 'wrong' ? wrong
      : filterTab.value === 'skipped' ? skipped
      : total
    return { subj, label: labels[subj] || subj, correct, wrong, skipped, total, pct, tabCount }
  })
})

// ─── EXAM LOGIC ─────────────────────────────────────────────────────────────
function selectExam(key) {
  selectedExam.value = key
  selectedUnit.value = ''
  kaOptionalSubjects.value = []
}

function selectUnit(key) {
  selectedUnit.value = key
  kaOptionalSubjects.value = []   // reset optionals whenever unit changes
}

function toggleKaOptional(key) {
  const idx = kaOptionalSubjects.value.indexOf(key)
  if (idx !== -1) {
    // deselect
    kaOptionalSubjects.value = kaOptionalSubjects.value.filter(k => k !== key)
  } else {
    const max = activeUnitConfig.value?.optionalCount || 2
    if (kaOptionalSubjects.value.length < max) {
      kaOptionalSubjects.value = [...kaOptionalSubjects.value, key]
    }
  }
}

function buildQuestions() {
  const bank = selectedExam.value.startsWith('m') || selectedExam.value === 'afmc' ? questionBank.medical : questionBank.varsity
  // Use activeSubjects — for DU this is already the unit-specific map
  const subjectsToUse = activeSubjects.value
  const pool = []
  Object.keys(subjectsToUse).forEach(subj => {
    const needed = subjectsToUse[subj]
    const available = bank[subj] || []
    const tagged = available.map(q => ({ ...q, subject: subj }))
    const shuffled = [...tagged].sort(() => Math.random() - 0.5)
    pool.push(...shuffled.slice(0, needed))
  })
  questions.value = pool.sort(() => Math.random() - 0.5)
}

function startExam() {
  showNegativeWarning.value = false
  buildQuestions()
  answers.value = {}
  flagged.value = new Set()
  currentIdx.value = 0
  timeLeft.value = config.value.duration * 60
  phase.value = 'exam'
  nextTick(() => setupObserver())
  startTimer()
}

function startTimer() {
  clearInterval(timerInterval.value)
  timerInterval.value = setInterval(() => {
    if (timeLeft.value <= 0) { submitExam(); return }
    timeLeft.value--
  }, 1000)
}

function stopTimer() { clearInterval(timerInterval.value) }

function submitExam() {
  stopTimer()
  showEndModal.value = false
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

// IntersectionObserver
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

function resetToSetup() {
  stopTimer()
  phase.value = 'setup'
  selectedExam.value = null
  selectedUnit.value = ''
  kaOptionalSubjects.value = []
  questions.value = []
  answers.value = {}
  flagged.value = new Set()
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const medicalExams = ['mbbs', 'bds', 'afmc']
const varsityExams = ['du', 'cu', 'ju', 'ru', 'ku', 'sust']

function diffClass(d) {
  if (d === 'easy') return 'diff-easy'
  if (d === 'hard') return 'diff-hard'
  return 'diff-med'
}

function optClass(q, idx) {
  if (answers.value[q.id] === undefined) return ''
  if (idx === q.answer) return 'opt-correct'
  if (answers.value[q.id] === idx) return 'opt-wrong'
  return ''
}

function reviewOptClass(q, idx) {
  if (idx === q.answer) return 'rc-correct'
  if (answers.value[q.id] === idx && idx !== q.answer) return 'rc-wrong'
  return ''
}

const pct = (v) => `${v}%`

// ════════════════════════════════════════════════════════════════════════════
// PATCH for: pages/dashboard/admission-exam.vue  (FIXED)
// PURPOSE:   Auto-start from query params when launched by exams.vue
//
// WHERE TO ADD:
//   Inside script setup, paste this block AFTER the existing helper
//   functions section (after `const pct = (v) => ...` near line 493),
//   but BEFORE the closing /script tag.
//
// NOTE: Do NOT paste inside an existing function — this is top-level code.
// ════════════════════════════════════════════════════════════════════════════
 
// ─── QUERY PARAM AUTO-START ──────────────────────────────────────────────────
//
// exams.vue passes these query params via navigateTo():
//   stream    — 'medical' | 'varsity'
//   group     — 'medical' | 'varsity' (generic) or a specific key like 'mbbs', 'du'
//   autostart — '1'
//   examId    — preset exam id (optional, for analytics)
//   title     — preset exam title (optional, display only)
//
// Mapping from exams.vue `group` values → actual examConfigs keys:
//   'medical'  → 'mbbs'   (default medical exam)
//   'varsity'  → 'du'     (default varsity exam — most attended)
//   any specific key ('mbbs', 'bds', 'afmc', 'du', 'cu', 'ju' etc.) → use directly
//
// ─────────────────────────────────────────────────────────────────────────────
 
const _route = useRoute()
 
const _groupToExamKey = {
  // Generic values from exams.vue catalogue
  medical:  'mbbs',
  varsity:  'du',
  // Specific keys passed directly (future-proof)
  mbbs:     'mbbs',
  bds:      'bds',
  afmc:     'afmc',
  du:       'du',
  cu:       'cu',
  ju:       'ju',
  ru:       'ru',
  ku:       'ku',
  sust:     'sust',
}
 
onMounted(() => {
  const q = _route.query
  if (q.autostart !== '1') return
 
  // Resolve which examConfigs key to use
  const examKey = _groupToExamKey[q.group] || _groupToExamKey[q.stream]
  if (!examKey || !examConfigs[examKey]) return
 
  // Step 1: set selectedExam (mirrors selectExam())
  selectedExam.value = examKey
  selectedUnit.value = ''
  kaOptionalSubjects.value = []
 
  const cfg = examConfigs[examKey]
 
  // Step 2: wait for Vue to flush reactivity so `canStart` and `config`
  // computed values are updated before we try to show anything
  nextTick(() => {
    if (cfg.requiresUnit) {
      // DU requires a unit — we can't fully auto-start.
      // Pre-select the exam and scroll the unit picker into view.
      // The student picks a unit, then hits "Start Exam →" themselves.
      setTimeout(() => {
        const unitEl = document.querySelector('.unit-selector')
        if (unitEl) unitEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    } else {
      // Non-DU exams: canStart is now true, show the negative marking modal.
      // Another nextTick ensures the DOM has fully rendered with the new state.
      nextTick(() => {
        showNegativeWarning.value = true
      })
    }
  })
})
 
// Optional: expose preset title for display in template
// Usage in template: {{ _presetTitle || 'Admission Mock Tests' }}
const _presetTitle = computed(() => _route.query.title || null)
</script>

<template>
  <div class="admission-page">

    <!-- ══════════════════ SETUP PHASE ══════════════════ -->
    <div v-if="phase === 'setup'" class="setup-phase">

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <span class="page-chip">
            <span class="chip-dot"></span>
            ADMISSION EXAM
          </span>
          <h1 class="page-title">Admission <span class="text-outline">Mock Tests</span></h1>
          <p class="page-desc">Full-length mock exams for Medical & University Admission with exact negative marking rules (−0.25 per wrong answer).</p>
        </div>
        <div class="page-header-right">
          <div class="neg-mark-badge">
            <span class="neg-mark-icon">⚠</span>
            <div>
              <div class="neg-mark-title">NEGATIVE MARKING ACTIVE</div>
              <div class="neg-mark-sub">−0.25 marks per wrong answer · Skip = 0</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Medical Section -->
      <div class="exam-section">
        <div class="section-label">
          <span class="section-pill medical-pill">🩺 MEDICAL ADMISSION</span>
          <div class="section-line"></div>
        </div>

        <div class="exam-grid medical-grid">
          <div
            v-for="key in medicalExams"
            :key="key"
            class="exam-card"
            :class="{ 'exam-card--active': selectedExam === key }"
            @click="selectExam(key)"
          >
            <div class="exam-card-corner tl"></div>
            <div class="exam-card-corner br"></div>
            <div class="exam-card-top">
              <span class="exam-icon">{{ examConfigs[key].icon }}</span>
              <div class="exam-badge-row">
                <span class="exam-label">{{ examConfigs[key].label }}</span>
                <span class="exam-neg-badge">−0.25</span>
              </div>
            </div>
            <div class="exam-card-name">{{ examConfigs[key].fullLabel }}</div>
            <div class="exam-card-authority">{{ examConfigs[key].authority }}</div>
            <div class="exam-card-desc">{{ examConfigs[key].description }}</div>
            <div class="exam-card-meta">
              <span class="meta-pill">{{ examConfigs[key].totalQuestions }}Q</span>
              <span class="meta-pill">{{ examConfigs[key].duration }} min</span>
              <span class="meta-pill">Pass: {{ examConfigs[key].passScore }}%</span>
            </div>
            <div class="exam-subject-bars">
              <div
                v-for="(count, subj) in examConfigs[key].subjects"
                :key="subj"
                class="subj-bar-wrap"
                :title="`${examConfigs[key].subjectLabels[subj]}: ${count}Q`"
              >
                <div class="subj-bar-label">{{ examConfigs[key].subjectLabels[subj] }}</div>
                <div class="subj-bar-track">
                  <div class="subj-bar-fill" :style="{ width: (count / examConfigs[key].totalQuestions * 100) + '%' }"></div>
                </div>
                <div class="subj-bar-count">{{ count }}</div>
              </div>
            </div>
            <div class="exam-card-select">
              <span v-if="selectedExam === key">✓ SELECTED</span>
              <span v-else>SELECT →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Varsity Section -->
      <div class="exam-section">
        <div class="section-label">
          <span class="section-pill varsity-pill">🎓 VARSITY ADMISSION</span>
          <div class="section-line"></div>
        </div>

        <div class="exam-grid varsity-grid">
          <div
            v-for="key in varsityExams"
            :key="key"
            class="exam-card"
            :class="{ 'exam-card--active': selectedExam === key }"
            @click="selectExam(key)"
          >
            <div class="exam-card-corner tl"></div>
            <div class="exam-card-corner br"></div>
            <div class="exam-card-top">
              <span class="exam-icon">{{ examConfigs[key].icon }}</span>
              <div class="exam-badge-row">
                <span class="exam-label">{{ examConfigs[key].label }}</span>
                <span class="exam-neg-badge">−0.25</span>
              </div>
            </div>
            <div class="exam-card-name">{{ examConfigs[key].fullLabel }}</div>
            <div class="exam-card-authority">{{ examConfigs[key].authority }}</div>
            <div class="exam-card-desc">{{ examConfigs[key].description }}</div>

            <!-- Unit selector — only shown for exams that requiresUnit (DU) when this card is selected -->
            <div v-if="examConfigs[key].requiresUnit && selectedExam === key" class="unit-selector">
              <div class="unit-selector-header">
                <div class="unit-label">SELECT UNIT <span class="unit-required">*required</span></div>
              </div>
              <div class="unit-pills">
                <button
                  v-for="u in examConfigs[key].units"
                  :key="u.key"
                  class="unit-pill"
                  :class="{ active: selectedUnit === u.key }"
                  @click.stop="selectUnit(u.key)"
                >
                  <span class="unit-pill-label">{{ u.label }}</span>
                  <span class="unit-pill-sub">{{ u.sublabel }}</span>
                </button>
              </div>
              <!-- Unit not selected warning -->
              <div v-if="!selectedUnit" class="unit-warning">
                ⚠ Please select a unit to continue
              </div>

              <!-- Ka Unit optional subject picker -->
              <div v-if="selectedUnit && activeUnitConfig?.requiresOptionals" class="optional-picker">
                <div class="optional-picker-header">
                  <div class="optional-label">
                    CHOOSE {{ activeUnitConfig.optionalCount }} OPTIONAL SUBJECTS
                    <span class="optional-required">*required</span>
                  </div>
                  <div class="optional-progress">
                    <span
                      v-for="n in activeUnitConfig.optionalCount"
                      :key="n"
                      class="opt-progress-dot"
                      :class="{ filled: n <= kaOptionalSubjects.length }"
                    ></span>
                    <span class="opt-progress-text">{{ kaOptionalSubjects.length }} / {{ activeUnitConfig.optionalCount }} selected</span>
                  </div>
                </div>

                <div class="optional-compulsory-note">
                  <span class="comp-tag">COMPULSORY</span>
                  <span v-for="(count, subj) in activeUnitConfig.compulsory" :key="subj" class="comp-subj">
                    {{ activeUnitConfig.compulsoryLabels[subj] }} ({{ count }}Q)
                  </span>
                </div>

                <div class="optional-subjects-grid">
                  <button
                    v-for="opt in activeUnitConfig.optionalSubjects"
                    :key="opt.key"
                    class="opt-subj-card"
                    :class="{
                      'opt-selected': kaOptionalSubjects.includes(opt.key),
                      'opt-disabled': !kaOptionalSubjects.includes(opt.key) && kaOptionalSubjects.length >= activeUnitConfig.optionalCount
                    }"
                    :disabled="!kaOptionalSubjects.includes(opt.key) && kaOptionalSubjects.length >= activeUnitConfig.optionalCount"
                    @click.stop="toggleKaOptional(opt.key)"
                  >
                    <div class="opt-subj-top">
                      <span class="opt-subj-name">{{ opt.label }}</span>
                      <span class="opt-subj-check">{{ kaOptionalSubjects.includes(opt.key) ? '✓' : '+' }}</span>
                    </div>
                    <div class="opt-subj-desc">{{ opt.description }}</div>
                    <div class="opt-subj-count">{{ opt.questions }}Q</div>
                  </button>
                </div>

                <div v-if="kaOptionalSubjects.length < activeUnitConfig.optionalCount" class="optional-warning">
                  ⚠ Select {{ activeUnitConfig.optionalCount - kaOptionalSubjects.length }} more optional subject{{ activeUnitConfig.optionalCount - kaOptionalSubjects.length > 1 ? 's' : '' }} to continue
                </div>
                <div v-else class="optional-confirmed">
                  ✓ Optional subjects confirmed — Physics + Chemistry + {{ kaOptionalSubjects.map(k => activeUnitConfig.optionalSubjects.find(o => o.key === k)?.label).join(' + ') }}
                </div>
              </div>
            </div>

            <div class="exam-card-meta">
              <!-- For DU selected with unit: show unit-specific Q count; else default -->
              <span class="meta-pill">
                {{ (selectedExam === key && activeUnitConfig) ? activeUnitConfig.totalQuestions : examConfigs[key].totalQuestions }}Q
              </span>
              <span class="meta-pill">{{ examConfigs[key].duration }} min</span>
              <span class="meta-pill">Pass: {{ examConfigs[key].passScore }}%</span>
            </div>

            <!-- Subject bars: reactive to active unit when this card is selected + unit is picked -->
            <div class="exam-subject-bars">
              <template v-if="selectedExam === key && examConfigs[key].requiresUnit">
                <!-- DU selected: show unit subjects if unit picked, else a placeholder -->
                <template v-if="activeUnitConfig">
                  <template v-if="activeUnitConfig.requiresOptionals">
                    <!-- Compulsory subjects always shown -->
                    <div
                      v-for="(count, subj) in activeUnitConfig.compulsory"
                      :key="'comp-'+subj"
                      class="subj-bar-wrap"
                    >
                      <div class="subj-bar-label">{{ activeUnitConfig.compulsoryLabels[subj] }}</div>
                      <div class="subj-bar-track">
                        <div class="subj-bar-fill varsity-fill compulsory-fill" :style="{ width: (count / activeTotalQuestions * 100) + '%' }"></div>
                      </div>
                      <div class="subj-bar-count">{{ count }}</div>
                    </div>
                    <!-- Optional subjects: chosen ones shown, unchosen as placeholder -->
                    <div
                      v-for="opt in activeUnitConfig.optionalSubjects"
                      :key="'opt-'+opt.key"
                      class="subj-bar-wrap"
                      :class="{ 'bar-optional-inactive': !kaOptionalSubjects.includes(opt.key) }"
                    >
                      <div class="subj-bar-label">{{ opt.label }}</div>
                      <div class="subj-bar-track">
                        <div
                          class="subj-bar-fill varsity-fill"
                          :class="{ 'optional-fill': kaOptionalSubjects.includes(opt.key), 'placeholder-fill': !kaOptionalSubjects.includes(opt.key) }"
                          :style="{ width: kaOptionalSubjects.includes(opt.key) ? (opt.questions / activeTotalQuestions * 100) + '%' : '8%' }"
                        ></div>
                      </div>
                      <div class="subj-bar-count">{{ kaOptionalSubjects.includes(opt.key) ? opt.questions : '?' }}</div>
                    </div>
                  </template>
                  <template v-else>
                    <div
                      v-for="(count, subj) in activeUnitConfig.subjects"
                      :key="subj"
                      class="subj-bar-wrap"
                      :title="`${activeUnitConfig.subjectLabels[subj]}: ${count}Q`"
                    >
                      <div class="subj-bar-label">{{ activeUnitConfig.subjectLabels[subj] }}</div>
                      <div class="subj-bar-track">
                        <div class="subj-bar-fill varsity-fill" :style="{ width: (count / activeUnitConfig.totalQuestions * 100) + '%' }"></div>
                      </div>
                      <div class="subj-bar-count">{{ count }}</div>
                    </div>
                  </template>
                </template>
                <template v-else>
                  <!-- No unit selected yet: show greyed placeholder bars -->
                  <div class="subj-bars-placeholder">
                    <div v-for="i in 4" :key="i" class="subj-bar-wrap placeholder-bar">
                      <div class="subj-bar-label placeholder-text">─────</div>
                      <div class="subj-bar-track">
                        <div class="subj-bar-fill varsity-fill placeholder-fill" :style="{ width: '25%' }"></div>
                      </div>
                      <div class="subj-bar-count placeholder-text">?</div>
                    </div>
                    <div class="placeholder-hint">Subject breakdown shown after unit selection</div>
                  </div>
                </template>
              </template>
              <template v-else>
                <!-- Non-DU cards or DU not selected: static bars -->
                <div
                  v-for="(count, subj) in examConfigs[key].subjects"
                  :key="subj"
                  class="subj-bar-wrap"
                >
                  <div class="subj-bar-label">{{ examConfigs[key].subjectLabels[subj] }}</div>
                  <div class="subj-bar-track">
                    <div class="subj-bar-fill varsity-fill" :style="{ width: (count / examConfigs[key].totalQuestions * 100) + '%' }"></div>
                  </div>
                  <div class="subj-bar-count">{{ count }}</div>
                </div>
              </template>
            </div>

            <div class="exam-card-select">
              <span v-if="selectedExam === key && examConfigs[key].requiresUnit && !selectedUnit" class="select-unit-prompt">↑ SELECT A UNIT FIRST</span>
              <span v-else-if="selectedExam === key">✓ SELECTED</span>
              <span v-else>SELECT →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Bar -->
      <div v-if="selectedExam" class="cta-bar" :class="{ 'cta-bar--blocked': !canStart }">
        <div class="cta-bar-left">
          <div class="cta-exam-name">
            {{ config.fullLabel }}
            <span v-if="activeUnitConfig" class="cta-unit-badge">{{ activeUnitConfig.label }} · {{ activeUnitConfig.sublabel }}</span>
          </div>
          <div class="cta-meta">
            <span>{{ activeTotalQuestions }} Questions</span>
            <span>·</span>
            <span>{{ config.duration }} Minutes</span>
            <span>·</span>
            <span class="neg-warn">−0.25 Negative Marking</span>
            <template v-if="config.requiresUnit && !selectedUnit">
              <span>·</span>
              <span class="unit-missing-warn">⚠ No unit selected</span>
            </template>
            <template v-else-if="activeUnitConfig?.requiresOptionals && kaOptionalSubjects.length < activeUnitConfig.optionalCount">
              <span>·</span>
              <span class="unit-missing-warn">⚠ Choose {{ activeUnitConfig.optionalCount - kaOptionalSubjects.length }} more optional subject{{ activeUnitConfig.optionalCount - kaOptionalSubjects.length > 1 ? 's' : '' }}</span>
            </template>
            <template v-else-if="activeUnitConfig?.requiresOptionals">
              <span>·</span>
              <span class="optionals-confirmed">✓ {{ kaOptionalSubjects.map(k => activeUnitConfig.optionalSubjects.find(o => o.key === k)?.label).join(' + ') }}</span>
            </template>
          </div>
        </div>
        <div class="cta-bar-right">
          <button class="iso-btn iso-btn--ghost" @click="selectedExam = null; selectedUnit = ''">Cancel</button>
          <button
            class="iso-btn iso-btn--fill"
            :class="{ 'btn-disabled': !canStart }"
            :disabled="!canStart"
            @click="canStart && (showNegativeWarning = true)"
          >
            <span v-if="config.requiresUnit && !selectedUnit">Select Unit First</span>
            <span v-else-if="activeUnitConfig?.requiresOptionals && kaOptionalSubjects.length < activeUnitConfig.optionalCount">
              Choose {{ activeUnitConfig.optionalCount - kaOptionalSubjects.length }} More Subject{{ activeUnitConfig.optionalCount - kaOptionalSubjects.length > 1 ? 's' : '' }}
            </span>
            <span v-else>Start Exam →</span>
          </button>
        </div>
      </div>

    </div><!-- /setup -->

    <!-- ══════════════════ NEGATIVE MARKING WARNING MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showNegativeWarning" class="modal-backdrop" @click.self="showNegativeWarning = false">
        <div class="modal neg-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="neg-modal-icon">⚠</div>
          <div class="neg-modal-title">NEGATIVE MARKING RULES</div>
          <div class="neg-modal-exam">
            {{ config?.fullLabel }}
            <span v-if="activeUnitConfig" class="neg-modal-unit">— {{ activeUnitConfig.label }}</span>
          </div>
          <div class="neg-rules">
            <div class="neg-rule"><span class="neg-rule-icon correct-icon">✓</span><div><strong>Correct answer</strong><span>+1.00 mark</span></div></div>
            <div class="neg-rule"><span class="neg-rule-icon wrong-icon">✗</span><div><strong>Wrong answer</strong><span>−0.25 marks deducted</span></div></div>
            <div class="neg-rule"><span class="neg-rule-icon skip-icon">—</span><div><strong>Skipped / No answer</strong><span>0 marks (no penalty)</span></div></div>
          </div>
          <div class="neg-formula">
            <span class="neg-formula-label">SCORE FORMULA</span>
            <div class="neg-formula-eq">Score = (Correct × 1) − (Wrong × 0.25)</div>
          </div>
          <p class="neg-tip">💡 If unsure, it's safer to <strong>skip</strong> than guess randomly.</p>
          <div class="neg-modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="showNegativeWarning = false">Go Back</button>
            <button class="iso-btn iso-btn--fill" @click="startExam">I Understand — Start</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════ EXAM PHASE ══════════════════ -->
    <div v-if="phase === 'exam'" class="exam-phase">

      <!-- Sticky Topbar -->
      <div class="exam-topbar">
        <div class="topbar-left">
          <span class="topbar-exam-chip">
            {{ config.label }}
            <span v-if="activeUnitConfig"> · {{ activeUnitConfig.label }}</span>
          </span>
          <span class="topbar-neg">−0.25 NM</span>
          <span class="topbar-progress">{{ answeredCount }} / {{ questions.length }}</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-bar-track">
            <div class="topbar-bar-fill" :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-timer" :class="timerClass">
            <span class="timer-icon">⏱</span>
            {{ timerDisplay }}
          </div>
          <button class="iso-btn iso-btn--ghost topbar-end-btn" @click="showEndModal = true">End Exam</button>
        </div>
      </div>

      <!-- Sticky Q Palette -->
      <div class="q-palette-wrap">
        <div class="q-palette">
          <button
            v-for="(q, i) in questions"
            :key="q.id"
            class="q-dot"
            :class="{
              answered: answers[q.id] !== undefined,
              flagged: flagged.has(q.id),
              current: currentIdx === i
            }"
            @click="scrollToQuestion(i)"
            :title="`Q${i+1}${flagged.has(q.id) ? ' (Flagged)' : ''}`"
          >{{ i + 1 }}</button>
        </div>
        <div class="palette-legend">
          <span class="legend-item"><span class="legend-dot answered"></span>Answered</span>
          <span class="legend-item"><span class="legend-dot flagged"></span>Flagged</span>
          <span class="legend-item"><span class="legend-dot"></span>Unanswered</span>
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
          :class="{
            'card-answered': answers[q.id] !== undefined,
            'card-flagged': flagged.has(q.id),
            'card-current': currentIdx === i
          }"
        >
          <div class="q-card-header">
            <div class="q-meta">
              <span class="q-num">Q{{ i + 1 }}</span>
              <span class="q-subject">{{ config.subjectLabels[q.subject] }}</span>
              <span class="q-chapter">{{ q.chapter }}</span>
              <span :class="['q-diff', diffClass(q.difficulty)]">{{ q.difficulty.toUpperCase() }}</span>
              <span class="q-year">{{ q.year }}</span>
            </div>
            <div class="q-actions">
              <button
                class="flag-btn"
                :class="{ 'flag-active': flagged.has(q.id) }"
                @click="toggleFlag(q.id)"
                title="Flag for review"
              >{{ flagged.has(q.id) ? '🚩 Flagged' : '⚑ Flag' }}</button>
            </div>
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
            <div class="neg-reminder">
              <span v-if="answers[q.id] !== undefined">Selected — skip if unsure to avoid −0.25</span>
              <span v-else class="skip-note">Not answered — no penalty for skipping</span>
            </div>
            <button
              v-if="answers[q.id] !== undefined"
              class="clear-btn"
              @click="delete answers[q.id]"
            >✕ Clear</button>
          </div>
        </div>

        <!-- Submit Bar -->
        <div class="submit-bar">
          <div class="submit-bar-stats">
            <span>Answered: <strong>{{ answeredCount }}</strong></span>
            <span>Flagged: <strong>{{ flaggedCount }}</strong></span>
            <span>Skipped: <strong>{{ questions.length - answeredCount }}</strong></span>
          </div>
          <button class="iso-btn iso-btn--fill submit-btn" @click="showEndModal = true">
            Submit Exam →
          </button>
        </div>
      </div>

    </div><!-- /exam -->

    <!-- ══════════════════ END EXAM MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showEndModal" class="modal-backdrop" @click.self="showEndModal = false">
        <div class="modal end-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="end-modal-title">SUBMIT EXAM?</div>
          <div class="end-modal-sub">{{ config?.fullLabel }}</div>
          <div class="end-stats-grid">
            <div class="end-stat"><span class="end-stat-val answered-color">{{ answeredCount }}</span><span>Answered</span></div>
            <div class="end-stat"><span class="end-stat-val flagged-color">{{ flaggedCount }}</span><span>Flagged</span></div>
            <div class="end-stat"><span class="end-stat-val skipped-color">{{ questions.length - answeredCount }}</span><span>Skipped</span></div>
          </div>
          <div v-if="flaggedCount > 0" class="end-warn">⚠ You have {{ flaggedCount }} flagged question(s) still unanswered.</div>
          <div class="end-neg-note">Skipped questions carry no penalty. Wrong answers deduct 0.25 marks.</div>
          <div class="end-modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="showEndModal = false">Keep Going</button>
            <button class="iso-btn iso-btn--fill" @click="submitExam">Submit Now</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════ RESULTS PHASE ══════════════════ -->
    <div v-if="phase === 'results'" class="results-phase">

      <!-- Score Hero -->
      <div class="score-hero">
        <div class="score-hero-corner tl"></div>
        <div class="score-hero-corner br"></div>
        <div class="score-hero-left">
          <div class="score-exam-label">{{ config.fullLabel }}</div>
          <div class="score-hero-pct" :class="gradeInfo.cls">
            {{ scoreData.pct }}<span class="score-pct-sym">%</span>
          </div>
          <div class="score-raw">Raw Score: <strong>{{ scoreData.raw }} / {{ scoreData.total }}</strong></div>
          <div class="score-neg-note">
            <span class="score-neg-calc">
              ({{ scoreData.correct }} correct × 1) − ({{ scoreData.wrong }} wrong × 0.25) = {{ scoreData.raw }}
            </span>
          </div>
          <div class="score-status" :class="parseFloat(scoreData.pct) >= config.passScore ? 'status-pass' : 'status-fail'">
            {{ parseFloat(scoreData.pct) >= config.passScore ? '✓ PASSED' : '✗ FAILED' }}
            · Pass mark: {{ config.passScore }}%
          </div>
        </div>
        <div class="score-hero-right">
          <div class="grade-badge" :class="gradeInfo.cls">{{ gradeInfo.letter }}</div>
          <div class="grade-label">{{ gradeInfo.label }}</div>
          <div class="score-cards-grid">
            <div class="score-mini-card correct-card">
              <div class="smc-val">{{ scoreData.correct }}</div>
              <div class="smc-lbl">Correct</div>
              <div class="smc-mark">+{{ scoreData.correct }}</div>
            </div>
            <div class="score-mini-card wrong-card">
              <div class="smc-val">{{ scoreData.wrong }}</div>
              <div class="smc-lbl">Wrong</div>
              <div class="smc-mark">−{{ (scoreData.wrong * 0.25).toFixed(2) }}</div>
            </div>
            <div class="score-mini-card skipped-card">
              <div class="smc-val">{{ scoreData.skipped }}</div>
              <div class="smc-lbl">Skipped</div>
              <div class="smc-mark">±0</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subject Breakdown -->
      <div class="sb-section-header">
        <div class="result-section-title">SUBJECT BREAKDOWN</div>
        <div class="sb-filter-hint">
          <span v-if="subjectFilter === 'all'">↓ Click a subject to filter the review below</span>
          <span v-else class="sb-filter-active-hint">Showing questions for <strong>{{ activeSubjectLabels[subjectFilter] }}</strong> only</span>
        </div>
      </div>
      <div class="subject-breakdown-grid">
        <div
          v-for="sb in subjectBreakdown"
          :key="sb.subj"
          class="sb-card"
          :class="{
            'sb-card--active': subjectFilter === sb.subj,
            'sb-card--dim': subjectFilter !== 'all' && subjectFilter !== sb.subj
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
          <div class="sb-stats">
            <span class="sb-correct">✓ {{ sb.correct }}</span>
            <span class="sb-wrong">✗ {{ sb.wrong }}</span>
            <span class="sb-skipped">— {{ sb.skipped }}</span>
          </div>
          <div class="sb-bar-track">
            <div
              class="sb-bar-fill"
              :class="parseFloat(sb.pct) >= 60 ? 'sb-high' : parseFloat(sb.pct) >= 40 ? 'sb-mid' : 'sb-low'"
              :style="{ width: Math.max(0, parseFloat(sb.pct)) + '%' }"
            ></div>
          </div>
          <div class="sb-card-footer">
            <div class="sb-pct" :class="parseFloat(sb.pct) >= 60 ? 'sb-high' : parseFloat(sb.pct) >= 40 ? 'sb-mid' : 'sb-low'">{{ sb.pct }}%</div>
            <div class="sb-filter-cta">{{ subjectFilter === sb.subj ? '✕ clear' : 'filter →' }}</div>
          </div>
        </div>
      </div>

      <!-- Question Review -->
      <div class="review-header">
        <div class="result-section-title">QUESTION REVIEW
          <span v-if="subjectFilter !== 'all'" class="review-subject-chip">
            {{ activeSubjectLabels[subjectFilter] }}
            <button class="clear-subject-filter" @click="subjectFilter = 'all'">×</button>
          </span>
        </div>
        <div class="review-filter-tabs">
          <button
            v-for="t in ['all','correct','wrong','skipped']"
            :key="t"
            class="rev-tab"
            :class="{ active: filterTab === t }"
            @click="filterTab = t"
          >
            {{ t.toUpperCase() }}
            <span class="rev-tab-count">{{ filteredCounts[t] }}</span>
          </button>
        </div>
      </div>

      <div class="review-list">
        <div v-for="(q, i) in filteredReview" :key="q.id" class="rc-card"
          :class="{
            'rc-card-correct': answers[q.id] === q.answer,
            'rc-card-wrong': answers[q.id] !== undefined && answers[q.id] !== q.answer,
            'rc-card-skipped': answers[q.id] === undefined
          }"
        >
          <div class="rc-header">
            <div class="rc-meta">
              <span class="rc-qnum">Q{{ questions.indexOf(q) + 1 }}</span>
              <span class="rc-subj">{{ activeSubjectLabels[q.subject] || q.subject }}</span>
              <span class="rc-chapter">{{ q.chapter }}</span>
              <span :class="['rc-diff', diffClass(q.difficulty)]">{{ q.difficulty }}</span>
            </div>
            <div class="rc-result-badge">
              <span v-if="answers[q.id] === q.answer" class="rc-badge-correct">+1.00 ✓</span>
              <span v-else-if="answers[q.id] !== undefined" class="rc-badge-wrong">−0.25 ✗</span>
              <span v-else class="rc-badge-skipped">±0 skipped</span>
            </div>
          </div>
          <div class="rc-question">{{ q.text }}</div>
          <div class="rc-options">
            <div
              v-for="(opt, idx) in q.options"
              :key="idx"
              class="rc-opt"
              :class="reviewOptClass(q, idx)"
            >
              <span class="rc-opt-letter">{{ ['A','B','C','D'][idx] }}</span>
              <span class="rc-opt-text">{{ opt }}</span>
              <span v-if="idx === q.answer" class="rc-correct-tag">✓ Correct</span>
              <span v-else-if="answers[q.id] === idx && idx !== q.answer" class="rc-wrong-tag">✗ Your answer</span>
            </div>
          </div>
          <div v-if="answers[q.id] === undefined" class="rc-skipped-note">— You skipped this question. No marks deducted.</div>

          <!-- Explanation — always visible, matching mock-exam style -->
          <div class="rc-explanation">
            <span class="exp-label">EXPLANATION</span>
            <p class="exp-text">{{ q.explanation }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="results-actions">
        <button class="iso-btn iso-btn--ghost" @click="resetToSetup">← Back to Setup</button>
        <button class="iso-btn iso-btn--fill" @click="phase = 'setup'; nextTick(() => { showNegativeWarning = true })">
          Retake Exam
        </button>
      </div>

    </div><!-- /results -->

  </div><!-- /admission-page -->
</template>

<style scoped>
/* ─── PAGE SHELL ─────────────────────────────────────────────────────────── */
.admission-page {
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: var(--gray);
  border: 1px solid var(--border);
  padding: 4px 10px;
  margin-bottom: 14px;
}
.chip-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--border-bright);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
.page-title {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: var(--white);
  margin: 0 0 10px;
  line-height: 1.2;
}
.text-outline {
  -webkit-text-stroke: 1px var(--white);
  color: transparent;
}
.page-desc {
  font-family: var(--font-sans);
  color: var(--gray);
  font-size: 0.9rem;
  max-width: 480px;
  line-height: 1.6;
}
.neg-mark-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255,100,100,0.3);
  background: rgba(255,100,100,0.06);
  padding: 14px 18px;
  white-space: nowrap;
}
.neg-mark-icon {
  font-size: 1.4rem;
  color: rgba(255,120,120,0.8);
}
.neg-mark-title {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: rgba(255,120,120,0.9);
  margin-bottom: 4px;
}
.neg-mark-sub {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--gray);
}

/* ─── EXAM SECTION ───────────────────────────────────────────────────────── */
.exam-section { margin-bottom: 48px; }
.section-label {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.section-pill {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  padding: 4px 12px;
  border: 1px solid var(--border);
  white-space: nowrap;
}
.medical-pill { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.25); }
.varsity-pill  { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25); }
.section-line { flex: 1; height: 1px; background: var(--border); }

/* ─── EXAM GRIDS ─────────────────────────────────────────────────────────── */
.medical-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
.varsity-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }

/* ─── EXAM CARD ──────────────────────────────────────────────────────────── */
.exam-card {
  position: relative;
  background: var(--black);
  padding: 22px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
}
.exam-card:hover {
  border-color: var(--border-bright);
  border-left: 2px solid var(--border-bright);
  transform: translate(-1px,-1px);
  box-shadow: 5px 5px 0 0 rgba(240,240,234,0.05);
}
.exam-card--active {
  border-color: var(--white) !important;
  border-left: 3px solid var(--white) !important;
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.06);
}
.exam-card-corner {
  position: absolute;
  width: 10px; height: 10px;
}
.exam-card-corner.tl { top: 6px; left: 6px; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
.exam-card-corner.br { bottom: 6px; right: 6px; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }
.exam-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.exam-icon { font-size: 1.4rem; }
.exam-badge-row { display: flex; align-items: center; gap: 8px; }
.exam-label {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  color: var(--white);
}
.exam-neg-badge {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  color: rgba(255,100,100,0.7);
  border: 1px solid rgba(255,100,100,0.3);
  padding: 2px 6px;
}
.exam-card-name {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--white);
  margin-bottom: 4px;
}
.exam-card-authority {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  color: var(--dim);
  margin-bottom: 6px;
}
.exam-card-desc {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--gray);
  margin-bottom: 14px;
  line-height: 1.5;
}
.exam-card-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.meta-pill {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  color: var(--dim);
  border: 1px solid var(--border);
  padding: 2px 7px;
}

/* Subject bars */
.exam-subject-bars { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
.subj-bar-wrap { display: flex; align-items: center; gap: 8px; }
.subj-bar-label {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  color: var(--dim);
  width: 48px;
  text-align: right;
  letter-spacing: 0.06em;
}
.subj-bar-track {
  flex: 1;
  height: 3px;
  background: rgba(240,240,234,0.06);
  position: relative;
}
.subj-bar-fill {
  height: 100%;
  background: rgba(120,220,120,0.5);
  transition: width 0.4s;
}
.varsity-fill { background: rgba(255,200,80,0.5); }
.subj-bar-count {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  color: var(--dim);
  width: 18px;
}
.exam-card-select {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: var(--dim);
  text-align: right;
}
.exam-card--active .exam-card-select { color: var(--white); }

/* Unit selector */
.unit-selector { margin-bottom: 12px; }
.unit-selector-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.unit-label {
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  color: var(--dim);
}
.unit-required {
  color: rgba(255,100,100,0.7);
  margin-left: 4px;
}
.unit-pills { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; }
.unit-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: var(--font-mono);
  padding: 5px 10px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--gray);
  cursor: pointer;
  transition: all 0.15s;
  gap: 1px;
}
.unit-pill-label { font-size: 0.62rem; color: var(--white); letter-spacing: 0.04em; }
.unit-pill-sub   { font-size: 0.52rem; color: var(--dim); letter-spacing: 0.06em; }
.unit-pill.active {
  border-color: rgba(255,200,80,0.7);
  background: rgba(255,200,80,0.06);
}
.unit-pill.active .unit-pill-label { color: rgba(255,200,80,0.95); }
.unit-pill.active .unit-pill-sub   { color: rgba(255,200,80,0.6); }
.unit-pill:hover:not(.active) { border-color: var(--border-bright); color: var(--white); }
.unit-warning {
  font-family: var(--font-mono); font-size: 0.58rem;
  color: rgba(255,200,80,0.7);
  letter-spacing: 0.06em;
  padding: 4px 0;
}

/* Placeholder bars when no unit selected */
.placeholder-bar { opacity: 0.3; }
.placeholder-text { color: var(--dim) !important; font-size: 0.5rem !important; }
.placeholder-fill { background: rgba(240,240,234,0.15) !important; }
.placeholder-hint {
  font-family: var(--font-mono); font-size: 0.54rem;
  color: var(--dim); letter-spacing: 0.05em;
  margin-top: 4px; font-style: italic;
}

/* Select unit prompt on card footer */
.select-unit-prompt {
  color: rgba(255,200,80,0.7);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  animation: pulse-text 2s infinite;
}
@keyframes pulse-text { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* ─── CTA BAR ────────────────────────────────────────────────────────────── */
.cta-bar {
  position: sticky;
  bottom: 20px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: var(--black);
  border: 1px solid var(--border-bright);
  padding: 18px 24px;
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.05);
  animation: slideUp 0.3s ease;
  transition: border-color 0.2s;
}
.cta-bar--blocked {
  border-color: rgba(255,200,80,0.35);
  box-shadow: 6px 6px 0 0 rgba(255,200,80,0.04);
}
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.cta-exam-name {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--white);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.cta-unit-badge {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: rgba(255,200,80,0.9);
  border: 1px solid rgba(255,200,80,0.35);
  background: rgba(255,200,80,0.06);
  padding: 2px 8px;
}
.cta-meta {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--gray);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.neg-warn { color: rgba(255,120,120,0.8); }
.unit-missing-warn {
  color: rgba(255,200,80,0.8);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}
.cta-bar-right { display: flex; gap: 10px; flex-shrink: 0; }
.btn-disabled {
  opacity: 0.45;
  cursor: not-allowed !important;
  box-shadow: none !important;
  transform: none !important;
}

/* neg modal unit label */
.neg-modal-unit {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: rgba(255,200,80,0.8);
  display: block;
  margin-top: 4px;
}

/* ─── NEGATIVE MARKING MODAL ─────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(8,8,8,0.85);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.modal {
  position: relative;
  background: var(--black);
  border: 1px solid var(--border-bright);
  padding: 36px;
  max-width: 480px;
  width: 90%;
  box-shadow: 8px 8px 0 0 rgba(240,240,234,0.04);
  animation: modalPop 0.25s ease;
}
@keyframes modalPop { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
.modal-corner { position: absolute; width: 12px; height: 12px; }
.modal-corner.tl { top: 8px; left: 8px; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
.modal-corner.br { bottom: 8px; right: 8px; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }

.neg-modal-icon { font-size: 2.5rem; margin-bottom: 12px; }
.neg-modal-title {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  color: rgba(255,120,120,0.9);
  margin-bottom: 6px;
}
.neg-modal-exam {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--white);
  margin-bottom: 24px;
}
.neg-rules { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.neg-rule {
  display: flex; align-items: center; gap: 14px;
  border: 1px solid var(--border);
  padding: 12px 14px;
  font-family: var(--font-sans); font-size: 0.85rem;
}
.neg-rule div { display: flex; flex-direction: column; gap: 2px; }
.neg-rule strong { color: var(--white); }
.neg-rule span { color: var(--gray); font-size: 0.78rem; }
.neg-rule-icon {
  font-size: 1.1rem;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid;
  font-weight: bold;
  flex-shrink: 0;
}
.correct-icon { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); }
.wrong-icon   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); }
.skip-icon    { color: var(--gray); border-color: var(--border); }
.neg-formula {
  border: 1px solid var(--border);
  padding: 14px 16px;
  margin-bottom: 16px;
  background: rgba(240,240,234,0.02);
}
.neg-formula-label {
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  color: var(--dim);
  display: block;
  margin-bottom: 6px;
}
.neg-formula-eq {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--white);
}
.neg-tip {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--gray);
  margin-bottom: 24px;
}
.neg-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── EXAM TOPBAR ────────────────────────────────────────────────────────── */
.exam-topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 16px;
  background: var(--black);
  border-bottom: 1px solid var(--border);
  padding: 10px 16px;
}
.topbar-left { display: flex; align-items: center; gap: 10px; }
.topbar-exam-chip {
  font-family: var(--font-mono); font-size: 0.65rem;
  letter-spacing: 0.1em; color: var(--white);
  border: 1px solid var(--border-bright);
  padding: 3px 10px;
}
.topbar-neg {
  font-family: var(--font-mono); font-size: 0.6rem;
  color: rgba(255,100,100,0.7);
  border: 1px solid rgba(255,100,100,0.25);
  padding: 2px 7px;
}
.topbar-progress {
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray);
}
.topbar-center { flex: 1; }
.topbar-bar-track {
  height: 3px; background: rgba(240,240,234,0.08); border-radius: 0;
}
.topbar-bar-fill {
  height: 100%; background: var(--white);
  transition: width 0.3s; max-width: 100%;
}
.topbar-right { display: flex; align-items: center; gap: 12px; }
.topbar-timer {
  font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700;
  color: var(--white); display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border: 1px solid var(--border);
  transition: all 0.3s;
}
.topbar-timer.warning { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.4); }
.topbar-timer.critical {
  color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.4);
  animation: blink 0.6s infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }
.topbar-end-btn { font-size: 0.7rem; padding: 6px 14px; }
.timer-icon { font-size: 0.8rem; }

/* ─── Q PALETTE ──────────────────────────────────────────────────────────── */
.q-palette-wrap {
  position: sticky; top: 45px; z-index: 40;
  background: var(--black);
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
}
.q-palette {
  display: flex; flex-wrap: wrap; gap: 4px;
  max-height: 80px; overflow-y: auto;
  margin-bottom: 6px;
}
.q-dot {
  width: 26px; height: 22px;
  font-family: var(--font-mono); font-size: 0.55rem;
  border: 1px solid var(--border);
  background: transparent; color: var(--dim);
  cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.q-dot:hover { border-color: var(--border-bright); color: var(--white); }
.q-dot.answered { background: rgba(240,240,234,0.08); color: var(--white); border-color: rgba(240,240,234,0.3); }
.q-dot.flagged  { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); }
.q-dot.current  { border-color: var(--white); color: var(--white); font-weight: 700; }
.palette-legend { display: flex; gap: 14px; }
.legend-item {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.55rem;
  color: var(--dim); letter-spacing: 0.06em;
}
.legend-dot {
  width: 10px; height: 8px; border: 1px solid var(--border);
  background: transparent;
}
.legend-dot.answered { background: rgba(240,240,234,0.1); border-color: rgba(240,240,234,0.3); }
.legend-dot.flagged  { border-color: rgba(255,200,80,0.5); }

/* ─── QUESTIONS LIST ─────────────────────────────────────────────────────── */
.questions-list { padding: 20px 0; }
.q-card {
  background: var(--black);
  border: 1px solid var(--border);
  border-left: 3px solid transparent;
  margin-bottom: 12px;
  padding: 22px;
  scroll-margin-top: 140px;
  transition: border-color 0.2s;
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.02);
}
.q-card.card-answered { border-left-color: rgba(240,240,234,0.4); }
.q-card.card-flagged  { border-left-color: rgba(255,200,80,0.6); }
.q-card.card-current  { border-left-color: var(--white); }
.q-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.q-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.q-num {
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700;
  color: var(--white); background: rgba(240,240,234,0.06);
  padding: 2px 8px; border: 1px solid var(--border);
}
.q-subject, .q-chapter, .q-year {
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.06em; color: var(--dim);
  border: 1px solid var(--border); padding: 2px 7px;
}
.q-diff {
  font-family: var(--font-mono); font-size: 0.56rem;
  letter-spacing: 0.08em; padding: 2px 7px; border: 1px solid;
}
.diff-easy { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.25); background: rgba(120,220,120,0.05); }
.diff-med  { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25);  background: rgba(255,200,80,0.05); }
.diff-hard { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); background: rgba(255,100,100,0.05); }

.flag-btn {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.06em;
  border: 1px solid var(--border); background: transparent;
  color: var(--dim); padding: 4px 10px; cursor: pointer; transition: all 0.15s;
}
.flag-btn:hover { border-color: rgba(255,200,80,0.5); color: rgba(255,200,80,0.8); }
.flag-btn.flag-active { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); background: rgba(255,200,80,0.06); }

.q-text {
  font-family: var(--font-sans); font-size: 0.95rem;
  color: var(--white); line-height: 1.65; margin-bottom: 18px;
}
.q-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.q-opt {
  display: flex; align-items: center; gap: 12px;
  border: 1px solid var(--border);
  background: transparent;
  padding: 10px 14px;
  cursor: pointer; text-align: left;
  transition: all 0.15s;
  width: 100%;
}
.q-opt:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.q-opt.opt-selected { border-color: var(--white); background: rgba(240,240,234,0.04); }
.opt-letter {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  width: 22px; height: 22px;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--white); flex-shrink: 0;
}
.opt-selected .opt-letter { background: var(--white); color: var(--black); border-color: var(--white); }
.opt-text { font-family: var(--font-sans); font-size: 0.85rem; color: var(--white); }

.q-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  border-top: 1px solid var(--border); padding-top: 10px;
}
.neg-reminder {
  font-family: var(--font-mono); font-size: 0.58rem;
  color: var(--dim); letter-spacing: 0.05em;
}
.skip-note { color: rgba(120,220,120,0.6); }
.clear-btn {
  font-family: var(--font-mono); font-size: 0.6rem;
  border: 1px solid var(--border); background: transparent;
  color: var(--dim); padding: 4px 10px; cursor: pointer;
  transition: all 0.15s;
}
.clear-btn:hover { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.7); }

/* ─── SUBMIT BAR ─────────────────────────────────────────────────────────── */
.submit-bar {
  display: flex; align-items: center; justify-content: space-between;
  border: 1px solid var(--border-bright);
  background: rgba(240,240,234,0.02);
  padding: 18px 22px; margin-top: 20px;
  box-shadow: 5px 5px 0 0 rgba(240,240,234,0.04);
}
.submit-bar-stats {
  display: flex; gap: 20px;
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray);
}
.submit-bar-stats strong { color: var(--white); }
.submit-btn { font-size: 0.8rem; }

/* ─── END MODAL ──────────────────────────────────────────────────────────── */
.end-modal-title {
  font-family: var(--font-mono); font-size: 0.7rem;
  letter-spacing: 0.16em; color: var(--white); margin-bottom: 6px;
}
.end-modal-sub {
  font-family: var(--font-sans); font-size: 0.9rem;
  color: var(--gray); margin-bottom: 24px;
}
.end-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); margin-bottom: 18px; }
.end-stat { background: var(--black); padding: 14px; text-align: center; }
.end-stat-val { display: block; font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
.end-stat span:last-child { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }
.answered-color { color: rgba(120,220,120,0.9); }
.flagged-color  { color: rgba(255,200,80,0.9); }
.skipped-color  { color: var(--gray); }
.end-warn {
  font-family: var(--font-sans); font-size: 0.8rem;
  color: rgba(255,200,80,0.8); background: rgba(255,200,80,0.05);
  border: 1px solid rgba(255,200,80,0.2); padding: 8px 12px; margin-bottom: 10px;
}
.end-neg-note {
  font-family: var(--font-mono); font-size: 0.6rem;
  color: var(--dim); letter-spacing: 0.06em; margin-bottom: 24px;
}
.end-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── RESULTS PHASE ──────────────────────────────────────────────────────── */
.score-hero {
  position: relative;
  display: flex; gap: 32px; align-items: flex-start;
  border: 1px solid var(--border-bright);
  background: rgba(240,240,234,0.02);
  padding: 32px; margin-bottom: 32px;
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.04);
}
.score-hero-corner { position: absolute; width: 14px; height: 14px; }
.score-hero-corner.tl { top: 8px; left: 8px; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
.score-hero-corner.br { bottom: 8px; right: 8px; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }
.score-hero-left { flex: 1; }
.score-exam-label {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.14em; color: var(--dim); margin-bottom: 10px;
}
.score-hero-pct {
  font-family: var(--font-mono); font-size: 4rem; font-weight: 700;
  line-height: 1; margin-bottom: 10px;
}
.score-pct-sym { font-size: 2rem; }
.grade-high { color: rgba(120,220,120,0.95); }
.grade-mid  { color: rgba(255,200,80,0.95); }
.grade-low  { color: rgba(255,150,80,0.95); }
.grade-fail { color: rgba(255,100,100,0.95); }
.score-raw {
  font-family: var(--font-mono); font-size: 0.78rem;
  color: var(--gray); margin-bottom: 6px;
}
.score-raw strong { color: var(--white); }
.score-neg-note { margin-bottom: 14px; }
.score-neg-calc {
  font-family: var(--font-mono); font-size: 0.65rem;
  color: var(--dim); letter-spacing: 0.05em;
  border: 1px solid var(--border); padding: 5px 10px;
  display: inline-block;
}
.score-status {
  font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.1em;
  padding: 6px 14px; display: inline-block;
}
.status-pass { color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3); background: rgba(120,220,120,0.06); }
.status-fail { color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.3); background: rgba(255,100,100,0.06); }

.score-hero-right { text-align: center; min-width: 200px; }
.grade-badge {
  font-family: var(--font-mono); font-size: 4rem; font-weight: 700;
  line-height: 1; margin-bottom: 4px;
}
.grade-label { font-family: var(--font-sans); font-size: 0.8rem; color: var(--gray); margin-bottom: 20px; }
.score-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); }
.score-mini-card { background: var(--black); padding: 12px 8px; }
.smc-val { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--white); }
.smc-lbl { font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); letter-spacing: 0.08em; margin-bottom: 4px; }
.smc-mark { font-family: var(--font-mono); font-size: 0.65rem; }
.correct-card .smc-val { color: rgba(120,220,120,0.9); }
.correct-card .smc-mark { color: rgba(120,220,120,0.7); }
.wrong-card .smc-val   { color: rgba(255,100,100,0.9); }
.wrong-card .smc-mark  { color: rgba(255,100,100,0.7); }
.skipped-card .smc-val { color: var(--gray); }
.skipped-card .smc-mark{ color: var(--dim); }

/* Subject breakdown */
.result-section-title {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.14em; color: var(--dim);
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}
.sb-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.sb-filter-hint {
  font-family: var(--font-mono);
  font-size: 0.57rem;
  letter-spacing: 0.05em;
  color: var(--dim);
}
.sb-filter-active-hint { color: rgba(255,200,80,0.8); }
.sb-filter-active-hint strong { color: rgba(255,200,80,0.95); }

.subject-breakdown-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); gap: 1px; background: var(--border); margin-bottom: 32px; }

.sb-card {
  background: var(--black);
  padding: 14px 16px;
  cursor: pointer;
  border: 1px solid transparent;
  border-left: 2px solid transparent;
  transition: all 0.15s;
}
.sb-card:hover { border-left-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.sb-card--active { border-left-color: rgba(255,200,80,0.8) !important; background: rgba(255,200,80,0.04) !important; }
.sb-card--dim { opacity: 0.38; }

.sb-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 8px; }
.sb-name { font-family: var(--font-mono); font-size: 0.68rem; color: var(--white); }
.sb-card--active .sb-name { color: rgba(255,200,80,0.95); }

.sb-tab-count {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--white);
  text-align: right;
  line-height: 1;
}
.sb-tab-label {
  display: block;
  font-size: 0.48rem;
  color: var(--dim);
  font-weight: 400;
  letter-spacing: 0.08em;
  text-align: right;
  margin-top: 2px;
}
.sb-tab-correct .sb-tab-count { color: rgba(120,220,120,0.9); }
.sb-tab-wrong   .sb-tab-count { color: rgba(255,100,100,0.9); }
.sb-tab-skipped .sb-tab-count { color: var(--gray); }

.sb-stats { display: flex; gap: 8px; margin-bottom: 8px; }
.sb-correct { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(120,220,120,0.8); }
.sb-wrong   { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(255,100,100,0.8); }
.sb-skipped { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); }
.sb-bar-track { height: 3px; background: rgba(240,240,234,0.06); margin-bottom: 8px; }
.sb-bar-fill { height: 100%; transition: width 0.5s; }
.sb-high { background: rgba(120,220,120,0.5); color: rgba(120,220,120,0.9); }
.sb-mid  { background: rgba(255,200,80,0.5);  color: rgba(255,200,80,0.9); }
.sb-low  { background: rgba(255,100,100,0.5); color: rgba(255,100,100,0.9); }

.sb-card-footer { display: flex; align-items: center; justify-content: space-between; }
.sb-pct { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; }
.sb-filter-cta {
  font-family: var(--font-mono); font-size: 0.52rem;
  letter-spacing: 0.08em; color: var(--dim); transition: color 0.15s;
}
.sb-card:hover .sb-filter-cta { color: var(--border-bright); }
.sb-card--active .sb-filter-cta { color: rgba(255,200,80,0.7); }

/* Review subject active chip */
.review-subject-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.57rem; letter-spacing: 0.08em;
  color: rgba(255,200,80,0.9);
  border: 1px solid rgba(255,200,80,0.35);
  background: rgba(255,200,80,0.06);
  padding: 2px 8px; margin-left: 10px; vertical-align: middle;
}
.clear-subject-filter {
  background: none; border: none;
  color: rgba(255,200,80,0.7); cursor: pointer;
  font-size: 0.75rem; padding: 0; line-height: 1; transition: color 0.15s;
}
.clear-subject-filter:hover { color: rgba(255,100,100,0.8); }

/* Review */
.review-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.review-filter-tabs { display: flex; gap: 1px; background: var(--border); }
.rev-tab {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em;
  padding: 6px 14px; background: var(--black);
  border: none; color: var(--dim); cursor: pointer;
  display: flex; align-items: center; gap: 6px; transition: all 0.15s;
}
.rev-tab:hover { color: var(--white); }
.rev-tab.active { color: var(--white); background: rgba(240,240,234,0.05); }
.rev-tab-count {
  font-size: 0.55rem; background: rgba(240,240,234,0.08);
  padding: 1px 5px;
}
.review-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
.rc-card {
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  padding: 20px; background: var(--black);
}
.rc-card-correct { border-left-color: rgba(120,220,120,0.5); }
.rc-card-wrong   { border-left-color: rgba(255,100,100,0.5); }
.rc-card-skipped { border-left-color: var(--border); }
.rc-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.rc-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rc-qnum {
  font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700;
  color: var(--white); background: rgba(240,240,234,0.05);
  padding: 2px 8px; border: 1px solid var(--border);
}
.rc-subj, .rc-chapter {
  font-family: var(--font-mono); font-size: 0.56rem;
  color: var(--dim); border: 1px solid var(--border); padding: 2px 6px;
}
.rc-diff { font-family: var(--font-mono); font-size: 0.54rem; padding: 2px 6px; border: 1px solid; }
.rc-result-badge {}
.rc-badge-correct {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3);
  padding: 3px 8px; background: rgba(120,220,120,0.06);
}
.rc-badge-wrong {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.3);
  padding: 3px 8px; background: rgba(255,100,100,0.06);
}
.rc-badge-skipped {
  font-family: var(--font-mono); font-size: 0.65rem;
  color: var(--dim); border: 1px solid var(--border); padding: 3px 8px;
}
.rc-question {
  font-family: var(--font-sans); font-size: 0.9rem; color: var(--white);
  line-height: 1.6; margin-bottom: 14px;
}
.rc-options { display: flex; flex-direction: column; gap: 6px; }
.rc-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border: 1px solid var(--border);
  position: relative;
}
.rc-correct { border-color: rgba(120,220,120,0.4); background: rgba(120,220,120,0.05); }
.rc-wrong   { border-color: rgba(255,100,100,0.4); background: rgba(255,100,100,0.05); }
.rc-opt-letter {
  font-family: var(--font-mono); font-size: 0.6rem;
  width: 20px; height: 20px; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--white); flex-shrink: 0;
}
.rc-correct .rc-opt-letter { background: rgba(120,220,120,0.3); border-color: rgba(120,220,120,0.5); }
.rc-wrong   .rc-opt-letter { background: rgba(255,100,100,0.3); border-color: rgba(255,100,100,0.5); }
.rc-opt-text { font-family: var(--font-sans); font-size: 0.82rem; color: var(--white); flex: 1; }
.rc-correct-tag, .rc-wrong-tag {
  font-family: var(--font-mono); font-size: 0.55rem;
  letter-spacing: 0.06em; padding: 2px 6px;
}
.rc-correct-tag { color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3); }
.rc-wrong-tag   { color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.3); }
.rc-skipped-note {
  font-family: var(--font-mono); font-size: 0.6rem;
  color: var(--dim); letter-spacing: 0.06em;
  border-top: 1px solid var(--border); padding-top: 10px; margin-top: 10px;
}

/* ─── RESULTS ACTIONS ────────────────────────────────────────────────────── */
.results-actions {
  display: flex; gap: 12px; justify-content: flex-end;
  border-top: 1px solid var(--border); padding-top: 24px;
}

/* ─── EXPLANATION BLOCK ──────────────────────────────────────────────────── */
.rc-explanation {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.exp-label {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  color: var(--gray);
}
.exp-text {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--dim);
  line-height: 1.65;
}

/* ─── OPTIONAL SUBJECT PICKER ────────────────────────────────────────────── */
.optional-picker {
  margin-top: 10px;
  border: 1px solid rgba(255,200,80,0.25);
  background: rgba(255,200,80,0.03);
  padding: 12px;
  animation: slideDown 0.2s ease;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

.optional-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.optional-label {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  color: rgba(255,200,80,0.9);
}
.optional-required {
  color: rgba(255,100,100,0.7);
  margin-left: 5px;
}
.optional-progress {
  display: flex;
  align-items: center;
  gap: 5px;
}
.opt-progress-dot {
  width: 8px; height: 8px;
  border: 1px solid rgba(255,200,80,0.4);
  background: transparent;
  transition: background 0.2s;
}
.opt-progress-dot.filled {
  background: rgba(255,200,80,0.8);
  border-color: rgba(255,200,80,0.8);
}
.opt-progress-text {
  font-family: var(--font-mono);
  font-size: 0.54rem;
  color: var(--dim);
  letter-spacing: 0.06em;
}

.optional-compulsory-note {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 6px 8px;
  background: rgba(240,240,234,0.03);
  border: 1px solid var(--border);
  margin-bottom: 8px;
}
.comp-tag {
  font-family: var(--font-mono);
  font-size: 0.52rem;
  letter-spacing: 0.1em;
  color: var(--dim);
  border: 1px solid var(--border);
  padding: 1px 6px;
}
.comp-subj {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  color: var(--white);
  padding: 1px 6px;
  border: 1px solid rgba(240,240,234,0.15);
  background: rgba(240,240,234,0.04);
}

.optional-subjects-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  margin-bottom: 8px;
}
.opt-subj-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 10px;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  position: relative;
}
.opt-subj-card:hover:not(:disabled) {
  border-color: rgba(255,200,80,0.4);
  background: rgba(255,200,80,0.04);
}
.opt-subj-card.opt-selected {
  border-color: rgba(255,200,80,0.7);
  background: rgba(255,200,80,0.08);
}
.opt-subj-card.opt-disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.opt-subj-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.opt-subj-name {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--white);
  letter-spacing: 0.04em;
}
.opt-subj-check {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--dim);
  transition: color 0.15s;
}
.opt-subj-card.opt-selected .opt-subj-check { color: rgba(255,200,80,0.9); }
.opt-subj-card.opt-selected .opt-subj-name { color: rgba(255,200,80,0.95); }
.opt-subj-desc {
  font-family: var(--font-sans);
  font-size: 0.62rem;
  color: var(--dim);
}
.opt-subj-count {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  color: var(--dim);
  letter-spacing: 0.06em;
}
.opt-subj-card.opt-selected .opt-subj-count { color: rgba(255,200,80,0.6); }

.optional-warning {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  color: rgba(255,200,80,0.7);
  padding: 5px 0;
}
.optional-confirmed {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  color: rgba(120,220,120,0.8);
  padding: 5px 0;
}

/* Bar styles for Ka unit */
.compulsory-fill { background: rgba(200,200,234,0.5); }
.optional-fill   { background: rgba(255,200,80,0.5); }
.bar-optional-inactive .subj-bar-label { color: var(--dim); opacity: 0.5; }
.bar-optional-inactive .subj-bar-count { opacity: 0.4; }

/* CTA optionals confirmed text */
.optionals-confirmed {
  color: rgba(120,220,120,0.8);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}

/* ─── RESPONSIVE ─────────────────────────────────────────────────────────── */

/* ── Tablet (≤ 900px) ── */
@media (max-width: 900px) {
  .admission-page { padding: 24px 16px 80px; }

  /* Header */
  .page-header { flex-direction: column; gap: 16px; }
  .neg-mark-badge { width: 100%; box-sizing: border-box; }

  /* Exam grids: 2 col */
  .medical-grid, .varsity-grid { grid-template-columns: repeat(2, 1fr); }

  /* CTA bar: stack vertically */
  .cta-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    bottom: 0;
    left: 0; right: 0;
    border-left: none; border-right: none; border-bottom: none;
    padding: 16px;
  }
  .cta-bar-left { width: 100%; }
  .cta-exam-name { font-size: 0.8rem; flex-wrap: wrap; }
  .cta-meta { flex-wrap: wrap; gap: 6px; font-size: 0.72rem; }
  .cta-bar-right {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }
  .cta-bar-right .iso-btn { width: 100%; justify-content: center; text-align: center; }

  /* Score hero */
  .score-hero { flex-direction: column; gap: 24px; padding: 22px; }
  .score-hero-right { min-width: unset; width: 100%; }
  .score-cards-grid { grid-template-columns: repeat(3, 1fr); }
}

/* ── Mobile (≤ 600px) ── */
@media (max-width: 600px) {
  .admission-page { padding: 14px 10px 90px; }

  /* Page header */
  .page-title { font-size: 1.5rem; }
  .neg-mark-badge { flex-direction: column; gap: 8px; padding: 12px 14px; }
  .neg-mark-icon { font-size: 1.1rem; }

  /* Exam grids: single column */
  .medical-grid, .varsity-grid { grid-template-columns: 1fr; }

  /* Exam card */
  .exam-card { padding: 16px; }
  .exam-card-top { margin-bottom: 8px; }
  .exam-icon { font-size: 1.1rem; }
  .exam-label { font-size: 0.85rem; }

  /* Unit pills — 2 per row */
  .unit-pills { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .unit-pill { padding: 7px 10px; }
  .unit-pill-label { font-size: 0.6rem; }
  .unit-pill-sub   { font-size: 0.5rem; }

  /* Subject bars: tighter */
  .subj-bar-label { width: 38px; font-size: 0.5rem; }
  .subj-bar-count { font-size: 0.5rem; }

  /* CTA bar: tighter single-column buttons */
  .cta-bar { padding: 12px; gap: 10px; }
  .cta-exam-name { font-size: 0.75rem; }
  .cta-unit-badge { font-size: 0.55rem; }
  .cta-meta { font-size: 0.65rem; gap: 4px; }
  .unit-missing-warn { font-size: 0.62rem; }
  .cta-bar-right { grid-template-columns: 1fr 1fr; gap: 6px; }

  /* Exam topbar */
  .exam-topbar {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 10px;
  }
  .topbar-left { gap: 6px; flex-wrap: wrap; }
  .topbar-exam-chip { font-size: 0.6rem; padding: 2px 8px; }
  .topbar-neg { font-size: 0.55rem; padding: 2px 5px; }
  .topbar-progress { font-size: 0.62rem; }
  .topbar-center { order: 3; width: 100%; flex: unset; }
  .topbar-right { gap: 8px; }
  .topbar-timer { font-size: 0.78rem; padding: 3px 8px; }
  .topbar-end-btn { font-size: 0.62rem; padding: 5px 10px; }

  /* Question palette */
  .q-palette-wrap { top: auto; padding: 6px 10px; }
  .q-palette { gap: 3px; max-height: 64px; }
  .q-dot { width: 22px; height: 18px; font-size: 0.5rem; }
  .palette-legend { gap: 10px; }
  .legend-item { font-size: 0.5rem; }

  /* Question cards */
  .q-card { padding: 14px 12px; scroll-margin-top: 160px; }
  .q-card-header { flex-direction: column; gap: 8px; align-items: flex-start; }
  .q-meta { gap: 5px; }
  .q-num { font-size: 0.65rem; }
  .q-subject, .q-chapter, .q-year { font-size: 0.52rem; padding: 2px 5px; }
  .q-text { font-size: 0.88rem; margin-bottom: 14px; }
  .q-opt { padding: 9px 10px; gap: 10px; }
  .opt-text { font-size: 0.8rem; }
  .q-card-footer { flex-wrap: wrap; gap: 8px; }
  .neg-reminder { font-size: 0.54rem; }

  /* Submit bar */
  .submit-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px;
  }
  .submit-bar-stats {
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.65rem;
    justify-content: space-between;
  }
  .submit-btn { width: 100%; justify-content: center; }

  /* End modal */
  .modal { padding: 24px 18px; }
  .end-stat-val { font-size: 1.3rem; }

  /* Results: score hero */
  .score-hero { padding: 16px; gap: 20px; }
  .score-hero-pct { font-size: 2.6rem; }
  .score-pct-sym { font-size: 1.6rem; }
  .score-neg-calc { font-size: 0.58rem; word-break: break-all; }
  .score-cards-grid { grid-template-columns: repeat(3, 1fr); }
  .smc-val { font-size: 1.1rem; }

  /* Subject breakdown */
  .subject-breakdown-grid { grid-template-columns: repeat(2, 1fr); }

  /* Review */
  .review-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .review-filter-tabs { width: 100%; display: grid; grid-template-columns: repeat(4, 1fr); }
  .rev-tab { justify-content: center; padding: 6px 4px; font-size: 0.54rem; }
  .rc-card { padding: 14px 12px; }
  .rc-header { flex-direction: column; gap: 6px; align-items: flex-start; }
  .rc-opt { padding: 7px 10px; gap: 8px; }
  .rc-opt-text { font-size: 0.78rem; }
  .rc-correct-tag, .rc-wrong-tag { font-size: 0.5rem; }

  /* Results actions */
  .results-actions {
    flex-direction: column;
    gap: 8px;
  }
  .results-actions .iso-btn { width: 100%; justify-content: center; text-align: center; }

  /* Negative marking modal */
  .neg-modal-icon { font-size: 2rem; }
  .neg-modal-title { font-size: 0.64rem; }
  .neg-modal-exam { font-size: 0.95rem; }
  .neg-rule { padding: 10px 12px; gap: 10px; }
  .neg-formula-eq { font-size: 0.74rem; }
  .neg-modal-actions { flex-direction: column; gap: 8px; }
  .neg-modal-actions .iso-btn { width: 100%; justify-content: center; }

  /* Optional subject picker */
  .optional-subjects-grid { grid-template-columns: 1fr 1fr; gap: 4px; }
  .opt-subj-card { padding: 8px; }
  .opt-subj-name { font-size: 0.6rem; }
  .optional-picker-header { flex-direction: column; align-items: flex-start; gap: 5px; }
  .optional-compulsory-note { flex-wrap: wrap; gap: 5px; }
}
</style>
