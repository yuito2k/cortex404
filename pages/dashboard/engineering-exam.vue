<script setup>
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ─── MOCK USER TIER ──────────────────────────────────────────────────────────
const isPaid = ref(false) // toggle for demo — wire to Supabase user metadata

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
const questionBank = {

  // ── BUET ──────────────────────────────────────────────────────────────────
  buet: {
    physics: [
      { id: 'bu-phy-1', text: 'A projectile is launched at 45° with initial speed v₀. What is the maximum range on flat ground?', options: ['v₀²/g', 'v₀²/2g', '2v₀²/g', 'v₀²/4g'], answer: 0, chapter: 'Projectile Motion', year: '2023', difficulty: 'medium', explanation: 'Range R = v₀²sin(2θ)/g. At θ = 45°, sin(90°) = 1, so R_max = v₀²/g. This is the angle that maximises range on a horizontal surface.' },
      { id: 'bu-phy-2', text: 'The magnetic force on a charge q moving with velocity v in magnetic field B is:', options: ['qvB sinθ', 'qvB cosθ', 'qvB tanθ', 'q²vB'], answer: 0, chapter: 'Electromagnetism', year: '2022', difficulty: 'easy', explanation: 'F = qv × B. The magnitude is F = qvB sinθ where θ is the angle between v and B. Maximum force occurs at θ = 90° (perpendicular motion). No force when moving parallel to B (θ = 0).' },
      { id: 'bu-phy-3', text: 'In simple harmonic motion, which quantity is NOT constant?', options: ['Amplitude', 'Time period', 'Frequency', 'Total energy'], answer: 3, chapter: 'Oscillations', year: '2023', difficulty: 'medium', explanation: 'Total energy in SHM = ½mω²A² is constant. However, kinetic and potential energies continuously exchange — KE is maximum at equilibrium, PE is maximum at amplitude. So energy distribution, not total energy, varies.' },
      { id: 'bu-phy-4', text: 'The de Broglie wavelength of a particle with momentum p is:', options: ['h/p', 'hp', 'h/p²', 'p/h'], answer: 0, chapter: 'Modern Physics', year: '2022', difficulty: 'medium', explanation: 'λ = h/p (de Broglie relation). This links wave-particle duality: every particle has an associated wavelength inversely proportional to its momentum. Verified by electron diffraction experiments.' },
      { id: 'bu-phy-5', text: 'A capacitor of capacitance C is charged to voltage V. The energy stored is:', options: ['CV', '½CV²', 'CV²', '2CV²'], answer: 1, chapter: 'Electrostatics', year: '2023', difficulty: 'easy', explanation: 'Energy stored in a capacitor = ½CV² = Q²/2C = ½QV. The factor of ½ arises because the voltage builds from 0 to V during charging — the average voltage during charging is V/2.' },
      { id: 'bu-phy-6', text: 'Which of the following demonstrates the photoelectric effect?', options: ['Diffraction of X-rays', 'Emission of electrons when light hits metal', 'Scattering of photons by electrons', 'Pair production'], answer: 1, chapter: 'Modern Physics', year: '2021', difficulty: 'easy', explanation: 'The photoelectric effect is the emission of electrons from a metal surface when light above a threshold frequency strikes it. Einstein explained this using photons (E = hf), earning him the Nobel Prize.' },
      { id: 'bu-phy-7', text: 'The moment of inertia of a solid sphere of mass M and radius R about its diameter is:', options: ['⅔MR²', '⅖MR²', '½MR²', '¾MR²'], answer: 1, chapter: 'Rotational Mechanics', year: '2023', difficulty: 'hard', explanation: 'I = (2/5)MR² for a solid sphere about a diameter. Compare: hollow sphere = (2/3)MR², thin ring = MR², solid disk = ½MR². For BUET these must be memorised or derivable.' },
      { id: 'bu-phy-8', text: 'Snell\'s law of refraction states that n₁sinθ₁ =', options: ['n₂cosθ₂', 'n₂sinθ₂', 'n₁sinθ₂', 'n₂tanθ₂'], answer: 1, chapter: 'Optics', year: '2022', difficulty: 'easy', explanation: 'Snell\'s Law: n₁sinθ₁ = n₂sinθ₂. Light bends towards the normal when entering a denser medium (higher n). Critical angle θ_c = arcsin(n₂/n₁) when θ₂ = 90°.' },
    ],
    chemistry: [
      { id: 'bu-chem-1', text: 'The hybridisation of carbon in benzene (C₆H₆) is:', options: ['sp', 'sp²', 'sp³', 'sp³d'], answer: 1, chapter: 'Organic Chemistry', year: '2023', difficulty: 'medium', explanation: 'Benzene carbons are sp² hybridised. Each carbon forms 3 σ-bonds (2 C-C and 1 C-H) using sp² orbitals; the unhybridised p orbital contributes to the delocalised π system giving benzene its stability.' },
      { id: 'bu-chem-2', text: 'The pH of a 0.01 M strong acid solution is:', options: ['1', '2', '3', '0.01'], answer: 1, chapter: 'Acids & Bases', year: '2022', difficulty: 'easy', explanation: 'For a strong acid: [H⁺] = 0.01 M = 10⁻² M. pH = -log[H⁺] = -log(10⁻²) = 2. Strong acids fully dissociate so concentration equals [H⁺] directly.' },
      { id: 'bu-chem-3', text: 'Which of the following is an electrophile?', options: ['OH⁻', 'NH₃', 'NO₂⁺', 'CN⁻'], answer: 2, chapter: 'Reaction Mechanisms', year: '2023', difficulty: 'medium', explanation: 'NO₂⁺ (nitronium ion) is an electrophile — it is electron-deficient and seeks electrons. OH⁻, NH₃, and CN⁻ are nucleophiles (electron-rich, donate electrons). Electrophilic aromatic substitution involves electrophiles attacking benzene.' },
      { id: 'bu-chem-4', text: 'In the periodic table, which property increases along a period left to right?', options: ['Atomic radius', 'Metallic character', 'Ionisation energy', 'Reactivity with water'], answer: 2, chapter: 'Periodic Table', year: '2022', difficulty: 'easy', explanation: 'Ionisation energy increases left to right across a period due to increasing nuclear charge with same shielding. Atomic radius decreases, metallic character decreases, and reactivity with water generally decreases across period 2 and 3.' },
      { id: 'bu-chem-5', text: 'The number of σ (sigma) bonds in ethyne (C₂H₂) is:', options: ['2', '3', '4', '5'], answer: 1, chapter: 'Chemical Bonding', year: '2023', difficulty: 'medium', explanation: 'Ethyne (HC≡CH): 1 C-H σ bond + 1 C-C σ bond + 1 C-C σ bond... Wait: H-C≡C-H has 2 C-H σ bonds + 1 C-C σ bond = 3 σ bonds total. The triple bond = 1σ + 2π.' },
      { id: 'bu-chem-6', text: 'Fehling\'s solution is used to detect:', options: ['Amino acids', 'Aldehydes', 'Carboxylic acids', 'Esters'], answer: 1, chapter: 'Organic Chemistry', year: '2021', difficulty: 'medium', explanation: 'Fehling\'s solution (Cu²⁺ in alkaline solution) is a test for reducing sugars and aldehydes. The blue Cu²⁺ is reduced to brick-red Cu₂O precipitate by the aldehyde group. Ketones (except methylketones) do not reduce Fehling\'s.' },
    ],
    math: [
      { id: 'bu-math-1', text: 'The value of ∫₀¹ x² dx is:', options: ['1/2', '1/3', '1/4', '2/3'], answer: 1, chapter: 'Integration', year: '2023', difficulty: 'easy', explanation: '∫x² dx = x³/3 + C. Evaluating from 0 to 1: [x³/3]₀¹ = 1/3 - 0 = 1/3. This is the fundamental theorem of calculus applied to a polynomial.' },
      { id: 'bu-math-2', text: 'If A is a 3×3 matrix with determinant 2, what is det(2A)?', options: ['4', '8', '16', '6'], answer: 2, chapter: 'Matrices', year: '2022', difficulty: 'medium', explanation: 'det(kA) = kⁿ det(A) for an n×n matrix. Here n=3, k=2: det(2A) = 2³ × det(A) = 8 × 2 = 16. Scaling all rows of A by k multiplies determinant by kⁿ.' },
      { id: 'bu-math-3', text: 'The general solution of dy/dx = y is:', options: ['y = Cx', 'y = Ce^x', 'y = C/x', 'y = C ln(x)'], answer: 1, chapter: 'Differential Equations', year: '2023', difficulty: 'medium', explanation: 'Separating variables: dy/y = dx → ln|y| = x + C₁ → y = e^(x+C₁) = Ce^x. This ODE means the function equals its own derivative, which is the definition of the exponential function.' },
      { id: 'bu-math-4', text: 'The angle between vectors a = (1,0,0) and b = (0,1,0) is:', options: ['0°', '45°', '90°', '180°'], answer: 2, chapter: 'Vectors', year: '2022', difficulty: 'easy', explanation: 'cosθ = (a·b)/(|a||b|). a·b = 1×0 + 0×1 + 0×0 = 0. Since cosθ = 0, θ = 90°. Unit vectors i and j are perpendicular (orthogonal) — they form the basis of a Cartesian coordinate system.' },
      { id: 'bu-math-5', text: 'The sum of an infinite geometric series with first term a and ratio r (|r|<1) is:', options: ['a/(1-r)', 'a/(1+r)', 'a·r', 'a(1-r)'], answer: 0, chapter: 'Series', year: '2023', difficulty: 'medium', explanation: 'S∞ = a/(1-r) for |r| < 1. Derivation: S = a + ar + ar² + ... → rS = ar + ar² + ... → S - rS = a → S(1-r) = a → S = a/(1-r).' },
      { id: 'bu-math-6', text: 'The number of ways to choose 3 items from 8 (order does not matter) is:', options: ['24', '56', '336', '512'], answer: 1, chapter: 'Combinatorics', year: '2021', difficulty: 'easy', explanation: 'C(8,3) = 8!/(3!×5!) = (8×7×6)/(3×2×1) = 336/6 = 56. Remember: Combinations = C(n,r), Permutations = P(n,r) = n!/(n-r)!. Choose when order doesn\'t matter.' },
    ],
    english: [
      { id: 'bu-eng-1', text: 'Choose the word most similar in meaning to "meticulous":', options: ['Careless', 'Thorough', 'Hasty', 'Vague'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'medium', explanation: '"Meticulous" means showing great attention to detail; very careful and precise. Synonyms: thorough, painstaking, scrupulous, precise. Antonyms: careless, sloppy, negligent.' },
      { id: 'bu-eng-2', text: 'Identify the correct sentence:', options: ['He has went there.', 'He has gone there.', 'He have gone there.', 'He gone there.'], answer: 1, chapter: 'Grammar', year: '2022', difficulty: 'easy', explanation: '"Has gone" is correct — present perfect using has/have + past participle. "Gone" is the past participle of "go"; "went" is the simple past. With he/she/it use "has", with I/you/we/they use "have".' },
      { id: 'bu-eng-3', text: 'The word "enervate" means:', options: ['To energise', 'To weaken or exhaust', 'To strengthen', 'To excite'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'hard', explanation: '"Enervate" means to weaken someone\'s vitality. Often confused with "energise" — they\'re near-antonyms. Root: Latin "enervare" (to remove the sinews/nerve). Used in writing: "the heat enervated the workers".' },
    ],
  },

  // ── RUET ──────────────────────────────────────────────────────────────────
  ruet: {
    physics: [
      { id: 'ru-phy-1', text: 'A body of mass m moving with velocity v collides and sticks to a stationary body of mass 2m. Final velocity is:', options: ['v/2', 'v/3', '2v/3', 'v/4'], answer: 1, chapter: 'Momentum', year: '2023', difficulty: 'medium', explanation: 'Perfectly inelastic collision: momentum conserved. mv + 0 = (m + 2m)v_f → mv = 3m·v_f → v_f = v/3. Kinetic energy is NOT conserved in inelastic collisions.' },
      { id: 'ru-phy-2', text: 'Which law is equivalent to conservation of angular momentum?', options: ['Newton\'s 1st Law', 'Newton\'s 2nd Law in rotation', 'Newton\'s 3rd Law', 'Kepler\'s 3rd Law'], answer: 1, chapter: 'Rotational Mechanics', year: '2022', difficulty: 'medium', explanation: 'Rotational Newton\'s 2nd Law: τ = dL/dt. When net torque τ = 0, dL/dt = 0, meaning L (angular momentum) is constant — conserved. Example: ice skater spinning faster when arms are pulled in.' },
      { id: 'ru-phy-3', text: 'What is the escape velocity from Earth\'s surface? (g=9.8m/s², R=6400km)', options: ['7.9 km/s', '11.2 km/s', '16.8 km/s', '3.4 km/s'], answer: 1, chapter: 'Gravitation', year: '2023', difficulty: 'medium', explanation: 'v_esc = √(2gR) = √(2×9.8×6.4×10⁶) ≈ √(125.44×10⁶) ≈ 11,200 m/s = 11.2 km/s. This is the minimum speed to escape Earth\'s gravity without further propulsion.' },
      { id: 'ru-phy-4', text: 'A convex mirror always forms an image that is:', options: ['Real, inverted, diminished', 'Virtual, erect, diminished', 'Virtual, erect, magnified', 'Real, erect, diminished'], answer: 1, chapter: 'Optics', year: '2022', difficulty: 'easy', explanation: 'Convex mirrors always produce virtual, erect (upright), and diminished images regardless of object position. They are used as rear-view mirrors because they give a wide field of view.' },
      { id: 'ru-phy-5', text: 'In Young\'s double slit experiment, fringe width β = λD/d. If λ is doubled and d is halved, β becomes:', options: ['Same', '2× original', '4× original', 'Half original'], answer: 2, chapter: 'Wave Optics', year: '2023', difficulty: 'hard', explanation: 'β = λD/d. New β = (2λ)D/(d/2) = 4λD/d = 4β. Doubling λ doubles β; halving d also doubles β. Combined effect: β increases 4 times.' },
      { id: 'ru-phy-6', text: 'Radioactive decay follows:', options: ['Linear decay', 'Exponential decay', 'Inverse square decay', 'Polynomial decay'], answer: 1, chapter: 'Nuclear Physics', year: '2021', difficulty: 'easy', explanation: 'N = N₀e^(-λt). Radioactive decay is exponential — the rate of decay is proportional to the number of atoms present. This gives a characteristic half-life t½ = ln2/λ ≈ 0.693/λ.' },
    ],
    chemistry: [
      { id: 'ru-chem-1', text: 'Which type of isomerism is shown by glucose and fructose?', options: ['Chain isomerism', 'Position isomerism', 'Functional isomerism', 'Optical isomerism'], answer: 2, chapter: 'Isomerism', year: '2023', difficulty: 'medium', explanation: 'Glucose (aldehyde group) and fructose (ketone group) are functional group isomers — same molecular formula C₆H₁₂O₆ but different functional groups. Both are hexose sugars but one is an aldose, the other a ketose.' },
      { id: 'ru-chem-2', text: 'Which gas is produced when zinc reacts with dilute H₂SO₄?', options: ['O₂', 'SO₂', 'H₂', 'H₂S'], answer: 2, chapter: 'Acid-Metal Reactions', year: '2022', difficulty: 'easy', explanation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑. Zinc displaces hydrogen from dilute acids (zinc is above hydrogen in the reactivity series). With concentrated H₂SO₄, SO₂ is produced instead.' },
      { id: 'ru-chem-3', text: 'The number of moles in 44g of CO₂ (molar mass = 44 g/mol) is:', options: ['0.5', '1', '2', '22'], answer: 1, chapter: 'Mole Concept', year: '2023', difficulty: 'easy', explanation: 'Moles = mass / molar mass = 44g / 44 g/mol = 1 mol. One mole of any substance contains 6.022×10²³ particles (Avogadro\'s number) and at STP, 1 mol gas occupies 22.4 L.' },
      { id: 'ru-chem-4', text: 'A catalyst in a reaction:', options: ['Is consumed in the reaction', 'Increases activation energy', 'Lowers activation energy', 'Changes equilibrium position'], answer: 2, chapter: 'Chemical Kinetics', year: '2022', difficulty: 'medium', explanation: 'A catalyst lowers the activation energy, providing an alternative reaction pathway. It is NOT consumed and does NOT change the equilibrium position — only the rate at which equilibrium is reached. Catalyst increases BOTH forward and reverse rates equally.' },
    ],
    math: [
      { id: 'ru-math-1', text: 'lim(x→0) [sin(x)/x] equals:', options: ['0', '∞', '1', 'x'], answer: 2, chapter: 'Limits', year: '2023', difficulty: 'medium', explanation: 'This is a fundamental limit: lim(x→0) sin(x)/x = 1. Proof via L\'Hôpital\'s rule: d(sinx)/dx / d(x)/dx = cosx/1 → cos(0) = 1. This limit is central to calculus and trigonometry.' },
      { id: 'ru-math-2', text: 'The equation of a circle with centre (3, -2) and radius 5 is:', options: ['(x-3)²+(y+2)²=5', '(x-3)²+(y+2)²=25', '(x+3)²+(y-2)²=25', '(x-3)²-(y+2)²=25'], answer: 1, chapter: 'Coordinate Geometry', year: '2022', difficulty: 'easy', explanation: 'Standard form: (x-h)² + (y-k)² = r². Centre (h,k) = (3,-2), r = 5 → (x-3)² + (y-(-2))² = 5² → (x-3)² + (y+2)² = 25.' },
      { id: 'ru-math-3', text: 'The value of cos(60°) + sin(30°) is:', options: ['0', '½', '1', '√3/2'], answer: 2, chapter: 'Trigonometry', year: '2023', difficulty: 'easy', explanation: 'cos(60°) = 1/2 and sin(30°) = 1/2. Sum = 1/2 + 1/2 = 1. Key values: sin/cos 0°,30°,45°,60°,90° = 0,½,1/√2,√3/2,1 and 1,√3/2,1/√2,½,0 respectively.' },
      { id: 'ru-math-4', text: 'If a complex number z = 3 + 4i, then |z| =', options: ['3', '4', '5', '7'], answer: 2, chapter: 'Complex Numbers', year: '2022', difficulty: 'easy', explanation: '|z| = √(a² + b²) = √(3² + 4²) = √(9 + 16) = √25 = 5. The modulus is the distance from the origin on the Argand plane. This is the classic 3-4-5 right triangle.' },
      { id: 'ru-math-5', text: 'The eigenvalues of matrix [[2,0],[0,3]] are:', options: ['2, 3', '1, 6', '0, 5', '2, 2'], answer: 0, chapter: 'Matrices', year: '2023', difficulty: 'medium', explanation: 'For a diagonal matrix, the eigenvalues are simply the diagonal entries: λ₁ = 2, λ₂ = 3. This can be verified: det(A - λI) = (2-λ)(3-λ) = 0 → λ = 2 or λ = 3.' },
    ],
    english: [
      { id: 'ru-eng-1', text: 'Choose the antonym of "verbose":', options: ['Talkative', 'Concise', 'Lengthy', 'Detailed'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'medium', explanation: '"Verbose" means using more words than needed (long-winded). Antonym: "concise" — expressing much in few words. Other antonyms: terse, brief, succinct. Synonyms for verbose: wordy, prolix, long-winded.' },
      { id: 'ru-eng-2', text: 'Which sentence is in the passive voice?', options: ['The engineer designed the bridge.', 'The bridge was designed by the engineer.', 'The engineer is designing the bridge.', 'The engineer had designed the bridge.'], answer: 1, chapter: 'Grammar', year: '2022', difficulty: 'easy', explanation: '"The bridge was designed by the engineer" — passive voice (subject receives the action). Pattern: object + was/were + past participle + by + agent. Active: "The engineer designed" (subject performs action).' },
    ],
  },

  // ── KUET ──────────────────────────────────────────────────────────────────
  kuet: {
    physics: [
      { id: 'ku-phy-1', text: 'The work done by a force F = (3i + 4j) N over displacement d = (2i + 3j) m is:', options: ['17 J', '18 J', '20 J', '14 J'], answer: 1, chapter: 'Work & Energy', year: '2023', difficulty: 'medium', explanation: 'W = F · d = Fₓdₓ + Fᵧdᵧ = 3×2 + 4×3 = 6 + 12 = 18 J. Dot product gives scalar work. Cross product would give torque. W = Fd cosθ also applies.' },
      { id: 'ku-phy-2', text: 'Which of the following has the highest electrical conductivity?', options: ['Silver', 'Copper', 'Gold', 'Aluminium'], answer: 0, chapter: 'Electricity', year: '2022', difficulty: 'easy', explanation: 'Silver has the highest electrical conductivity (6.3×10⁷ S/m), followed by copper (5.96×10⁷), gold (4.1×10⁷), and aluminium (3.8×10⁷). Copper is used in wiring for cost reasons despite silver being better.' },
      { id: 'ku-phy-3', text: 'If a wire of resistance R is stretched to twice its length (volume constant), the new resistance is:', options: ['R', '2R', '4R', 'R/4'], answer: 2, chapter: 'Electricity', year: '2023', difficulty: 'hard', explanation: 'R = ρL/A. If L doubles to 2L, and volume (LA) is constant, then A halves to A/2. New R = ρ(2L)/(A/2) = 4ρL/A = 4R. Stretching a wire increases resistance by 4× when length doubles.' },
      { id: 'ku-phy-4', text: 'The threshold frequency in the photoelectric effect depends on:', options: ['Intensity of light', 'The metal surface', 'Speed of light', 'Temperature'], answer: 1, chapter: 'Modern Physics', year: '2022', difficulty: 'medium', explanation: 'Threshold frequency (f₀) depends on the work function (φ) of the metal: hf₀ = φ. Different metals have different work functions. Above f₀, electrons are emitted regardless of intensity; below f₀, no emission even with high intensity.' },
    ],
    chemistry: [
      { id: 'ku-chem-1', text: 'How many electrons does the outermost shell of Neon contain?', options: ['2', '6', '8', '10'], answer: 2, chapter: 'Electronic Configuration', year: '2023', difficulty: 'easy', explanation: 'Neon (Z=10) configuration: 1s²2s²2p⁶. Outermost shell (n=2) contains 2+6 = 8 electrons. Noble gases have full outer shells — this makes them chemically inert (stable).' },
      { id: 'ku-chem-2', text: 'The process of converting a mineral to its oxide by heating in excess air is called:', options: ['Smelting', 'Calcination', 'Roasting', 'Reduction'], answer: 2, chapter: 'Metallurgy', year: '2022', difficulty: 'medium', explanation: 'Roasting = heating a sulphide ore in excess air to convert it to an oxide (e.g. 2ZnS + 3O₂ → 2ZnO + 2SO₂). Calcination = heating a carbonate ore to decompose it (e.g. CaCO₃ → CaO + CO₂).' },
      { id: 'ku-chem-3', text: 'In an exothermic reaction, which statement is TRUE?', options: ['Reactants have lower energy than products', 'Energy is absorbed from surroundings', 'ΔH is negative', 'Activation energy = 0'], answer: 2, chapter: 'Thermochemistry', year: '2023', difficulty: 'medium', explanation: 'ΔH = H_products − H_reactants. In exothermic reactions, products have lower energy than reactants → ΔH < 0 (negative). Energy is released to surroundings. Examples: combustion, neutralisation, respiration.' },
    ],
    math: [
      { id: 'ku-math-1', text: 'The slope of the line 3x − 4y + 8 = 0 is:', options: ['3/4', '4/3', '-3/4', '-4/3'], answer: 0, chapter: 'Straight Lines', year: '2023', difficulty: 'easy', explanation: 'Rearranging to y = mx + c: -4y = -3x - 8 → y = (3/4)x + 2. Slope m = 3/4. Always rewrite to slope-intercept form: y = mx + c to read off slope m directly.' },
      { id: 'ku-math-2', text: 'The nth term of an arithmetic sequence with first term a and common difference d is:', options: ['a + nd', 'a + (n-1)d', 'a × dⁿ', 'a + d^(n-1)'], answer: 1, chapter: 'Sequences & Series', year: '2022', difficulty: 'easy', explanation: 'aₙ = a + (n-1)d. The first term (n=1) gives a + 0 = a ✓. The nth term is reached by adding d exactly (n-1) times to the first term. Sum of n terms: Sₙ = n/2[2a + (n-1)d].' },
      { id: 'ku-math-3', text: 'The derivative of ln(x) is:', options: ['1/x²', '1/x', 'x', 'e^x'], answer: 1, chapter: 'Differentiation', year: '2023', difficulty: 'easy', explanation: 'd/dx [ln(x)] = 1/x for x > 0. Equivalently, d/dx [ln(ax)] = 1/x (the constant a disappears). From this, ∫(1/x)dx = ln|x| + C.' },
      { id: 'ku-math-4', text: 'How many different 4-digit numbers can be formed using digits 1,2,3,4 without repetition?', options: ['16', '24', '64', '256'], answer: 1, chapter: 'Permutations', year: '2022', difficulty: 'easy', explanation: 'P(4,4) = 4! = 4×3×2×1 = 24. For each position, we have one fewer choice. Without repetition: 4 choices for 1st digit × 3 × 2 × 1 = 24. With repetition it would be 4⁴ = 256.' },
    ],
    english: [
      { id: 'ku-eng-1', text: 'A "prerequisite" is something that is:', options: ['Rare and valuable', 'Required beforehand', 'Unnecessary', 'Easily available'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'medium', explanation: '"Prerequisite" — a condition required before something else can happen (pre = before). Example: "Mathematics is a prerequisite for the engineering programme." From Latin: praerequisitus (required in advance).' },
      { id: 'ku-eng-2', text: 'Fill in: "Neither the students __ the teacher was present."', options: ['or', 'and', 'nor', 'but'], answer: 2, chapter: 'Grammar', year: '2022', difficulty: 'medium', explanation: '"Neither...nor" is the correct correlative conjunction pair. "Either...or" is for positive choices; "neither...nor" for negative. Rule: verb agrees with the nearer subject — "teacher" (singular) → "was".' },
    ],
  },

  // ── CUET ──────────────────────────────────────────────────────────────────
  cuet: {
    physics: [
      { id: 'cu-phy-1', text: 'The electric field inside a hollow charged conductor is:', options: ['Equal to surface field', 'Double the surface field', 'Zero', 'Maximum at centre'], answer: 2, chapter: 'Electrostatics', year: '2023', difficulty: 'medium', explanation: 'By Gauss\'s Law, the electric field inside a hollow conductor is zero (Faraday cage effect). Charges reside only on the outer surface. This is why car interiors are safe during lightning — the metal body shields the inside.' },
      { id: 'cu-phy-2', text: 'Which colour of visible light has the highest frequency?', options: ['Red', 'Yellow', 'Violet', 'Green'], answer: 2, chapter: 'Electromagnetic Spectrum', year: '2022', difficulty: 'easy', explanation: 'Violet light has the highest frequency (≈750 THz) in the visible spectrum, followed by blue, green, yellow, orange, and red (≈430 THz). Higher frequency = shorter wavelength. ROYGBIV in order of increasing frequency.' },
      { id: 'cu-phy-3', text: 'A body in uniform circular motion has:', options: ['Constant velocity and speed', 'Constant speed but changing velocity', 'Constant velocity but changing speed', 'Neither constant speed nor velocity'], answer: 1, chapter: 'Circular Motion', year: '2023', difficulty: 'easy', explanation: 'In uniform circular motion, speed is constant (magnitude of velocity) but velocity direction continuously changes. Since velocity has both magnitude and direction, changing direction means velocity is not constant. Acceleration (centripetal) is always directed toward the centre.' },
      { id: 'cu-phy-4', text: 'The Doppler effect describes the change in observed:', options: ['Amplitude of a wave', 'Speed of a wave', 'Frequency of a wave', 'Wavelength and frequency equally'], answer: 2, chapter: 'Waves', year: '2022', difficulty: 'easy', explanation: 'The Doppler effect is the change in perceived frequency when source and observer have relative motion. Sound appears higher pitched when approaching, lower when receding. Same principle applies to light (redshift/blueshift).' },
    ],
    chemistry: [
      { id: 'cu-chem-1', text: 'The IUPAC name of CH₃CH₂OH is:', options: ['Methanol', 'Ethanol', 'Propanol', 'Butanol'], answer: 1, chapter: 'Nomenclature', year: '2023', difficulty: 'easy', explanation: 'CH₃CH₂OH = 2-carbon chain (eth-) + alcohol (-anol) = Ethanol. IUPAC naming: identify longest carbon chain, add suffix -ol for alcohols, number from end nearest the OH group.' },
      { id: 'cu-chem-2', text: 'Which bond is the strongest in organic molecules?', options: ['C-C single bond', 'C=C double bond', 'C≡C triple bond', 'C-H bond'], answer: 2, chapter: 'Chemical Bonding', year: '2022', difficulty: 'medium', explanation: 'C≡C triple bond has the highest bond energy (~835 kJ/mol) vs C=C (~614 kJ/mol) vs C-C (~347 kJ/mol) vs C-H (~413 kJ/mol). More bonds between the same atoms = stronger and shorter bond.' },
      { id: 'cu-chem-3', text: 'Galvanisation is coating iron with:', options: ['Tin', 'Chromium', 'Zinc', 'Copper'], answer: 2, chapter: 'Metallurgy & Corrosion', year: '2023', difficulty: 'easy', explanation: 'Galvanisation coats iron/steel with zinc to prevent rusting. Zinc acts as a sacrificial anode — even if the zinc coating is scratched, zinc corrodes preferentially protecting the iron beneath. Used in roofing sheets, buckets, etc.' },
    ],
    math: [
      { id: 'cu-math-1', text: 'The area bounded by y = x² and y = x from x=0 to x=1 is:', options: ['1/6', '1/3', '1/2', '1'], answer: 0, chapter: 'Definite Integration', year: '2023', difficulty: 'hard', explanation: 'Area = ∫₀¹ (x - x²) dx = [x²/2 - x³/3]₀¹ = (1/2 - 1/3) - 0 = 3/6 - 2/6 = 1/6. Subtract lower curve from upper curve: y=x is above y=x² on [0,1].' },
      { id: 'cu-math-2', text: 'The principal argument of the complex number z = -1 + i is:', options: ['π/4', '3π/4', '-π/4', '-3π/4'], answer: 1, chapter: 'Complex Numbers', year: '2022', difficulty: 'medium', explanation: 'z = -1 + i is in the 2nd quadrant (Re < 0, Im > 0). Reference angle = arctan(1/1) = π/4. Principal argument = π - π/4 = 3π/4. Principal argument ∈ (-π, π].' },
      { id: 'cu-math-3', text: 'If f(x) = x³ - 3x, the function is increasing when:', options: ['x < -1', 'x < -1 or x > 1', '-1 < x < 1', 'x > -1'], answer: 1, chapter: 'Applications of Derivatives', year: '2023', difficulty: 'hard', explanation: 'f\'(x) = 3x² - 3 = 3(x²-1) = 3(x-1)(x+1). f\'(x) > 0 when x < -1 or x > 1. f\'(x) < 0 when -1 < x < 1 (decreasing). Critical points at x = ±1.' },
    ],
    english: [
      { id: 'cu-eng-1', text: 'Choose the correct indirect speech: He said, "I am very tired."', options: ['He said that he was very tired.', 'He said that he is very tired.', 'He told he was very tired.', 'He said that I was very tired.'], answer: 0, chapter: 'Grammar', year: '2023', difficulty: 'medium', explanation: '"Said that he was" — indirect speech rules: (1) "said" with no object stays as "said", (2) present "am" → past "was" (backshift), (3) first person "I" → third person "he". "Told" requires an object: "told me".' },
      { id: 'cu-eng-2', text: 'Which figure of speech is used in "The wind whispered through the trees"?', options: ['Simile', 'Metaphor', 'Personification', 'Hyperbole'], answer: 2, chapter: 'Literature', year: '2022', difficulty: 'easy', explanation: 'Personification gives human qualities to non-human things. The wind (not human) is given the human action of "whispering". Simile uses "like/as", metaphor makes a direct comparison without "like/as", hyperbole is exaggeration.' },
    ],
  },
}

// ─── WRITTEN QUESTIONS (paid only) ───────────────────────────────────────────
const writtenQuestions = {
  buet: [
    { id: 'w-bu-1', type: 'short', marks: 5, text: 'Derive the equation of motion v² = u² + 2as from first principles using calculus. What are the assumptions made?', subject: 'Physics', chapter: 'Kinematics', year: '2023' },
    { id: 'w-bu-2', type: 'creative', marks: 10, text: 'Extended Problem: Circular Motion & Gravitation\n\n(a) State Newton\'s Law of Universal Gravitation. (b) Derive an expression for the orbital velocity of a satellite at height h above Earth\'s surface. (c) Calculate the orbital speed of a satellite at h = 400 km (R_E = 6400 km, g = 9.8 m/s²). (d) Explain why astronauts in the ISS feel weightless despite being in Earth\'s gravity.', subject: 'Physics', chapter: 'Gravitation', year: '2023' },
    { id: 'w-bu-3', type: 'creative', marks: 10, text: 'Integration Problem Set\n\n(a) Evaluate ∫ x·eˣ dx using integration by parts. (b) Find the area enclosed between y = sinx and the x-axis from 0 to π. (c) Solve the differential equation dy/dx = 2xy with initial condition y(0) = 1. (d) Discuss the physical significance of definite integrals in engineering problems.', subject: 'Math', chapter: 'Integration', year: '2022' },
  ],
  ruet: [
    { id: 'w-ru-1', type: 'short', marks: 5, text: 'Explain the working principle of a transformer. Derive the relationship between primary and secondary voltages in terms of turns ratio. Why is AC used for long-distance power transmission?', subject: 'Physics', chapter: 'Electromagnetism', year: '2023' },
    { id: 'w-ru-2', type: 'creative', marks: 10, text: 'Chemical Bonding Analysis\n\n(a) Draw the Lewis structure of SO₃. (b) Using VSEPR theory, predict the shape and bond angles of SO₃. (c) Explain the resonance structures of SO₃ and their significance. (d) Compare the bonding in SO₃ and SO₄²⁻ and explain why sulphate ion is more stable.', subject: 'Chemistry', chapter: 'Chemical Bonding', year: '2023' },
    { id: 'w-ru-3', type: 'short', marks: 5, text: 'Prove that the sum of first n natural numbers is n(n+1)/2 using the method of mathematical induction. Then use this result to find the sum 1+2+3+...+100.', subject: 'Math', chapter: 'Mathematical Induction', year: '2022' },
  ],
  kuet: [
    { id: 'w-ku-1', type: 'short', marks: 5, text: 'A uniform rod of mass M and length L is pivoted at one end. Derive the expression for its moment of inertia about the pivot using integration. Then find the angular acceleration when it is released from horizontal.', subject: 'Physics', chapter: 'Rotational Mechanics', year: '2023' },
    { id: 'w-ku-2', type: 'creative', marks: 10, text: 'Thermochemistry Problem\n\n(a) State Hess\'s Law of constant heat summation. (b) Given: C + O₂ → CO₂ (ΔH = -393 kJ), CO + ½O₂ → CO₂ (ΔH = -283 kJ), calculate ΔH for C + ½O₂ → CO. (c) Define bond enthalpy and explain how it can be used to estimate ΔH. (d) Why are exothermic reactions generally favoured at lower temperatures?', subject: 'Chemistry', chapter: 'Thermochemistry', year: '2022' },
  ],
  cuet: [
    { id: 'w-cu-1', type: 'short', marks: 5, text: 'Explain Lenz\'s Law and its connection to conservation of energy. A rectangular coil of 200 turns and area 0.01 m² is placed in a magnetic field that changes from 0.5T to 0.1T in 0.02 seconds. Calculate the induced EMF.', subject: 'Physics', chapter: 'Electromagnetic Induction', year: '2023' },
    { id: 'w-cu-2', type: 'creative', marks: 10, text: 'Coordinate Geometry Extended Problem\n\n(a) Find the equation of a circle passing through points (1,0), (0,1), and (0,0). (b) Determine the centre and radius of the circle x²+y²-4x+6y-3=0 by completing the square. (c) Find the length of the tangent from point (5,7) to the circle x²+y²=25. (d) State and prove the condition for two circles to be orthogonal.', subject: 'Math', chapter: 'Circles', year: '2022' },
  ],
}

// ─── EXAM CONFIGURATIONS ────────────────────────────────────────────────────
const examTypes = {
  buet: {
    label: 'BUET', fullLabel: 'Bangladesh University of Engineering & Technology',
    icon: '🏛️', authority: 'BUET Admission Test',
    totalMcq: 24, mcqDuration: 60,
    writtenQuestions: 3, writtenDuration: 180,
    passScore: 40,
    subject_distribution: 'Physics 8Q · Chemistry 6Q · Math 6Q · English 4Q',
    groups: [
      {
        key: 'buet', label: 'Engineering (all departments)', icon: '⚙️',
        subjects: { physics: 8, chemistry: 6, math: 6, english: 4 }
      },
    ]
  },
  ruet: {
    label: 'RUET', fullLabel: 'Rajshahi University of Engineering & Technology',
    icon: '🔧', authority: 'RUET Admission Test',
    totalMcq: 24, mcqDuration: 55,
    writtenQuestions: 3, writtenDuration: 150,
    passScore: 40,
    subject_distribution: 'Physics 8Q · Chemistry 6Q · Math 7Q · English 3Q',
    groups: [
      {
        key: 'ruet', label: 'Engineering (all departments)', icon: '⚙️',
        subjects: { physics: 8, chemistry: 6, math: 7, english: 3 }
      },
    ]
  },
  kuet: {
    label: 'KUET', fullLabel: 'Khulna University of Engineering & Technology',
    icon: '🔩', authority: 'KUET Admission Test',
    totalMcq: 24, mcqDuration: 55,
    writtenQuestions: 2, writtenDuration: 120,
    passScore: 40,
    subject_distribution: 'Physics 8Q · Chemistry 6Q · Math 7Q · English 3Q',
    groups: [
      {
        key: 'kuet', label: 'Engineering (all departments)', icon: '⚙️',
        subjects: { physics: 8, chemistry: 6, math: 7, english: 3 }
      },
    ]
  },
  cuet: {
    label: 'CUET', fullLabel: 'Chittagong University of Engineering & Technology',
    icon: '🏗️', authority: 'CUET Admission Test',
    totalMcq: 24, mcqDuration: 55,
    writtenQuestions: 2, writtenDuration: 120,
    passScore: 40,
    subject_distribution: 'Physics 8Q · Chemistry 6Q · Math 6Q · English 4Q',
    groups: [
      {
        key: 'cuet', label: 'Engineering (all departments)', icon: '⚙️',
        subjects: { physics: 8, chemistry: 6, math: 6, english: 4 }
      },
    ]
  },
}

const subjectLabels = {
  physics: 'Physics', chemistry: 'Chemistry', math: 'Math', english: 'English',
}

// ─── STATE ────────────────────────────────────────────────────────────────────
const phase = ref('setup')          // 'setup' | 'mcq' | 'written_intro' | 'written' | 'results'
const selectedExamType = ref(null)  // 'buet' | 'ruet' | 'kuet' | 'cuet'
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
const subjectFilter = ref('all')

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
</script>

<template>
  <div class="exam-page">

    <!-- ══════════════════ SETUP PHASE ══════════════════ -->
    <div v-if="phase === 'setup'" class="setup-phase">
      <div class="page-header">
        <div>
          <span class="page-chip"><span class="chip-dot"></span>ENGINEERING ADMISSION</span>
          <h1 class="page-title">Engineering <span class="text-outline">Entrance Exam</span></h1>
          <p class="page-desc">Full mock exams for BUET, RUET, KUET & CUET — Physics, Chemistry, Math and English. Free members get MCQ. Pro members get MCQ + Written.</p>
        </div>
        <div class="tier-badge" :class="isPaid ? 'tier-pro' : 'tier-free'">
          <div class="tier-icon">{{ isPaid ? '⭐' : '🔓' }}</div>
          <div>
            <div class="tier-label">{{ isPaid ? 'PRO MEMBER' : 'FREE MEMBER' }}</div>
            <div class="tier-sub">{{ isPaid ? 'MCQ + Written sections' : 'MCQ only · Upgrade for Written' }}</div>
          </div>
          <button class="tier-toggle iso-btn iso-btn--ghost" @click="isPaid = !isPaid">
            {{ isPaid ? 'Demo: Switch to Free' : 'Demo: Switch to Pro' }}
          </button>
        </div>
      </div>

      <!-- University Selection -->
      <div class="type-section">
        <div class="section-label-row">
          <span class="section-pill">SELECT UNIVERSITY</span>
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
            <div class="type-subject-dist">{{ config.subject_distribution }}</div>
            <div class="type-meta-row">
              <span class="meta-pill">{{ config.totalMcq }}Q MCQ</span>
              <span class="meta-pill">{{ config.mcqDuration }} min</span>
              <span v-if="isPaid" class="meta-pill meta-pill--written">+Written {{ config.writtenDuration }}min</span>
              <span class="meta-pill">Pass: {{ config.passScore }}%</span>
            </div>
            <div class="type-sections-row">
              <span class="section-tag-item">1 Group</span>
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

      <!-- Department Group Selection -->
      <transition name="slide-down">
        <div v-if="selectedExamType" class="group-section">
          <div class="section-label-row">
            <span class="section-pill">SELECT DEPARTMENT GROUP</span>
            <div class="section-line"></div>
          </div>
          <div class="group-grid group-grid--single">
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

      <!-- Exam Structure Panel -->
      <div v-if="selectedGroupKey" class="expect-panel">
        <div class="expect-header">EXAM STRUCTURE — {{ examConfig.label }}</div>
        <div class="expect-grid">
          <div class="expect-item">
            <div class="expect-label">SECTION 1 — MCQ</div>
            <div class="expect-val">{{ examConfig.totalMcq }} Questions</div>
            <div class="expect-sub">{{ examConfig.mcqDuration }} min · No negative marking · {{ examConfig.subject_distribution }}</div>
          </div>
          <div class="expect-item" :class="{ 'expect-item--locked': !isPaid }">
            <div class="expect-label">SECTION 2 — WRITTEN {{ !isPaid ? '🔒 PRO' : '' }}</div>
            <div class="expect-val">{{ examConfig.writtenQuestions }} Questions</div>
            <div class="expect-sub">{{ examConfig.writtenDuration }} min · Short answer & derivation questions · Diagram upload allowed</div>
          </div>
        </div>
      </div>

      <!-- CTA Bar -->
      <div v-if="canStart" class="cta-bar">
        <div class="cta-left">
          <div class="cta-name">{{ examConfig.label }} — Engineering Entrance</div>
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
              <span class="free-note">MCQ only (Free)</span>
            </template>
          </div>
        </div>
        <div class="cta-right">
          <button class="iso-btn iso-btn--ghost" @click="resetToSetup">Reset</button>
          <button class="iso-btn iso-btn--fill" @click="showStartModal = true">
            Start Exam →
          </button>
        </div>
      </div>
    </div><!-- /setup -->

    <!-- ══════════════════ START MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showStartModal && phase === 'setup'" class="modal-backdrop" @click.self="showStartModal = false">
        <div class="modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="start-modal-icon">🏛️</div>
          <div class="start-modal-title">READY TO START?</div>
          <div class="start-modal-exam">{{ examConfig?.label }} — Engineering Entrance</div>
          <div class="start-modal-grid">
            <div class="sm-stat"><span class="sm-val">{{ examConfig?.totalMcq }}</span><span>MCQ Questions</span></div>
            <div class="sm-stat"><span class="sm-val">{{ examConfig?.mcqDuration }}</span><span>Minutes (MCQ)</span></div>
            <div v-if="isPaid" class="sm-stat"><span class="sm-val">{{ examConfig?.writtenQuestions }}</span><span>Written Questions</span></div>
            <div v-if="isPaid" class="sm-stat"><span class="sm-val">{{ examConfig?.writtenDuration }}</span><span>Minutes (Written)</span></div>
            <div v-if="!isPaid" class="sm-stat"><span class="sm-val">{{ examConfig?.passScore }}%</span><span>Pass Score</span></div>
            <div v-if="!isPaid" class="sm-stat"><span class="sm-val">MCQ</span><span>Section Only</span></div>
          </div>
          <div class="start-modal-rules">
            <div class="sm-rule">✓ Questions are randomised from our question bank</div>
            <div class="sm-rule">✓ No negative marking — attempt all questions</div>
            <div class="sm-rule">✓ Flag uncertain questions to review before submitting</div>
            <div v-if="isPaid" class="sm-rule sm-rule--written">✓ Written section will begin immediately after MCQ</div>
            <div v-else class="sm-rule sm-rule--free">✓ Free exam — MCQ section only</div>
          </div>
          <div class="start-modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="showStartModal = false">Cancel</button>
            <button class="iso-btn iso-btn--fill" @click="startExam">Begin Exam →</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════ MCQ PHASE ══════════════════ -->
    <div v-if="phase === 'mcq'" class="mcq-phase">

      <!-- Sticky Topbar -->
      <div class="exam-topbar">
        <div class="topbar-left">
          <span class="topbar-chip">{{ examConfig?.label }}</span>
          <span class="topbar-section-badge">MCQ</span>
          <span class="topbar-prog">{{ answeredCount }}/{{ questions.length }} answered</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-bar-track">
            <div class="topbar-bar-fill" :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-timer" :class="timerClass">⏱ {{ timerDisplay }}</div>
          <button class="iso-btn iso-btn--ghost topbar-end-btn" @click="showEndModal = true">End Exam</button>
        </div>
      </div>

      <!-- Question Palette -->
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
          <div class="end-sub">{{ examConfig?.label }} — Engineering Entrance</div>
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
          <div class="wi-rule">✓ Mix of short derivation and extended problem questions</div>
          <div class="wi-rule">✓ You may upload a diagram or working for any question</div>
          <div class="wi-rule">✓ Show all steps for full marks</div>
          <div class="wi-rule">✓ Answers are saved automatically as you type</div>
        </div>
        <div class="wi-question-preview">
          <div class="wi-preview-label">QUESTION PREVIEW</div>
          <div v-for="(q, i) in writtenQuestionsList" :key="q.id" class="wi-preview-item">
            <span class="wi-preview-num">Q{{ i+1 }}</span>
            <span class="wi-preview-subj">{{ q.subject }}</span>
            <span class="wi-preview-type" :class="q.type === 'creative' ? 'type-creative' : 'type-short'">{{ q.type === 'creative' ? 'Extended' : 'Short' }}</span>
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
      <div class="exam-topbar written-topbar">
        <div class="topbar-left">
          <span class="topbar-chip">{{ examConfig?.label }}</span>
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
                {{ q.type === 'creative' ? 'Extended Problem' : 'Short Answer' }}
              </span>
              <span class="wq-year">{{ q.year }}</span>
            </div>
            <span class="wq-marks-badge">{{ q.marks }} marks</span>
          </div>
          <div class="wq-text">{{ q.text }}</div>
          <div class="wq-answer-section">
            <label class="wq-answer-label">YOUR ANSWER / WORKING</label>
            <textarea
              class="wq-textarea"
              :placeholder="q.type === 'creative'
                ? 'Show all working for each sub-part. Clearly label (a), (b), (c), (d)...'
                : 'Show all steps and derivations. State formulas before using them...'"
              v-model="writtenAnswers[q.id].text"
              rows="8"
            ></textarea>
            <div class="wq-char-count">{{ writtenAnswers[q.id]?.text?.length || 0 }} characters</div>
          </div>
          <div class="wq-image-section">
            <div class="wq-image-label">
              <span>ATTACH DIAGRAM / WORKING</span>
              <span class="wq-image-hint">Optional — upload a handwritten diagram or derivation</span>
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
            <input :id="`img-input-${q.id}`" type="file" accept="image/*" style="display:none" @change="handleImageUpload(q.id, $event)" />
          </div>
        </div>

        <div class="submit-bar written-submit-bar">
          <div class="submit-stats">
            <span>Answered: <strong>{{ writtenQuestionsList.filter(q => writtenAnswers[q.id]?.text?.length > 5).length }}</strong></span>
            <span>With diagram: <strong>{{ writtenQuestionsList.filter(q => writtenAnswers[q.id]?.imageUrl).length }}</strong></span>
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
          <div class="score-exam-label">{{ examConfig?.label }} — Engineering Entrance</div>
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

      <!-- Subject Breakdown -->
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

      <!-- Written Summary -->
      <div v-if="isPaid && writtenQuestionsList.length > 0" class="written-summary">
        <div class="section-title-label" style="margin-bottom:12px;">WRITTEN SECTION — SUBMITTED</div>
        <div class="ws-grid">
          <div v-for="(q, i) in writtenQuestionsList" :key="q.id" class="ws-card">
            <div class="ws-header">
              <span class="ws-qnum">Q{{ i+1 }}</span>
              <span class="ws-subj">{{ q.subject }}</span>
              <span :class="['ws-type', q.type === 'creative' ? 'type-creative' : 'type-short']">{{ q.type === 'creative' ? 'Extended' : 'Short' }}</span>
              <span class="ws-marks">{{ q.marks }} marks</span>
            </div>
            <div class="ws-answer-preview">
              {{ writtenAnswers[q.id]?.text?.slice(0, 120) || 'No answer written.' }}{{ writtenAnswers[q.id]?.text?.length > 120 ? '...' : '' }}
            </div>
            <div v-if="writtenAnswers[q.id]?.imageUrl" class="ws-has-image">📎 Diagram attached</div>
            <div v-else class="ws-no-image">No diagram attached</div>
          </div>
        </div>
      </div>

      <!-- MCQ Review -->
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
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 24px; margin-bottom: 40px;
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
  max-width: 300px; flex-shrink: 0;
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
.type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); }

.type-card {
  position: relative; background: var(--black); padding: 22px; cursor: pointer;
  border: 1px solid transparent; transition: all 0.2s;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
}
.type-card:hover { border-color: var(--border-bright); border-left: 2px solid var(--border-bright); transform: translate(-1px,-1px); }
.type-card--active { border-color: var(--white) !important; border-left: 3px solid var(--white) !important; }
.type-card-corner { position: absolute; width: 10px; height: 10px; }
.type-card-corner.tl { top:6px;left:6px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.type-card-corner.br { bottom:6px;right:6px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.type-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.type-icon { font-size: 1.6rem; }
.type-label { font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700; color: var(--white); }
.type-full { font-family: var(--font-mono); font-size: 0.64rem; color: var(--white); margin-bottom: 3px; line-height: 1.4; }
.type-authority { font-family: var(--font-sans); font-size: 0.7rem; color: var(--dim); margin-bottom: 8px; }
.type-subject-dist { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.04em; color: var(--dim); margin-bottom: 12px; line-height: 1.6; }
.type-meta-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
.meta-pill {
  font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.04em;
  color: var(--dim); border: 1px solid var(--border); padding: 2px 7px;
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
.group-grid--single { grid-template-columns: 1fr; max-width: 480px; }

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

/* ─── END MODAL ──────────────────────────────────────────────────────────── */
.end-title { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.18em; color: var(--white); margin-bottom: 4px; }
.end-sub { font-family: var(--font-sans); font-size: 0.85rem; color: var(--gray); margin-bottom: 20px; }
.end-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); margin-bottom: 16px; }
.end-stat { background: var(--black); padding: 12px; text-align: center; display: flex; flex-direction: column; gap: 4px; }
.end-val { font-family: var(--font-mono); font-size: 1.8rem; font-weight: 700; }
.end-stat span:last-child { font-family: var(--font-sans); font-size: 0.7rem; color: var(--gray); }
.answered-color { color: rgba(120,220,120,0.8); }
.flagged-color { color: rgba(255,200,80,0.8); }
.skipped-color { color: rgba(240,240,234,0.4); }
.end-warn { font-family: var(--font-mono); font-size: 0.65rem; color: rgba(255,200,80,0.8); margin-bottom: 10px; }
.end-written-note { font-family: var(--font-mono); font-size: 0.65rem; color: rgba(255,200,80,0.7); margin-bottom: 8px; }
.end-neg-note { font-family: var(--font-sans); font-size: 0.78rem; color: var(--dim); margin-bottom: 22px; }
.end-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── EXAM TOPBAR ────────────────────────────────────────────────────────── */
.exam-topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 16px;
  background: var(--black); border-bottom: 1px solid var(--border);
  padding: 10px 16px;
}
.topbar-left { display: flex; align-items: center; gap: 10px; }
.topbar-chip { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; color: var(--white); border: 1px solid var(--border-bright); padding: 3px 10px; }
.topbar-section-badge { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; padding: 2px 8px; border: 1px solid; color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.3); }
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
.topbar-timer.critical { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.4); animation: blink 0.8s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }
.topbar-end-btn { font-size: 0.6rem !important; padding: 5px 12px !important; }

/* ─── QUESTION PALETTE ───────────────────────────────────────────────────── */
.q-palette-wrap {
  position: sticky; top: 44px; z-index: 40;
  background: var(--black); border-bottom: 1px solid var(--border);
  padding: 8px 16px;
}
.q-palette { display: flex; flex-wrap: wrap; gap: 4px; max-height: 80px; overflow-y: auto; margin-bottom: 6px; }
.q-dot {
  width: 26px; height: 20px; font-family: var(--font-mono); font-size: 0.52rem;
  border: 1px solid var(--border); background: transparent; color: var(--dim);
  cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center;
}
.q-dot:hover { border-color: var(--border-bright); color: var(--white); }
.q-dot.answered { background: rgba(240,240,234,0.1); border-color: rgba(240,240,234,0.3); color: var(--white); }
.q-dot.flagged { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.8); }
.q-dot.current { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.08); }
.palette-legend { display: flex; gap: 16px; align-items: center; }
.legend-item { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); display: flex; align-items: center; gap: 5px; }
.legend-dot { width: 8px; height: 8px; border: 1px solid var(--border); }
.legend-dot.answered { background: rgba(240,240,234,0.1); border-color: rgba(240,240,234,0.3); }
.legend-dot.flagged { border-color: rgba(255,200,80,0.6); }
.palette-next-hint { font-family: var(--font-mono); font-size: 0.54rem; color: rgba(255,200,80,0.6); margin-left: auto; }

/* ─── QUESTION CARDS ─────────────────────────────────────────────────────── */
.questions-list { padding: 16px 0 60px; display: flex; flex-direction: column; gap: 12px; }
.q-card {
  background: var(--black); border: 1px solid var(--border);
  border-left: 3px solid transparent; padding: 22px;
  scroll-margin-top: 100px; transition: border-left-color 0.2s;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.02);
}
.card-answered { border-left-color: rgba(120,220,120,0.4); }
.card-flagged { border-left-color: rgba(255,200,80,0.5) !important; }
.card-current { border-color: var(--border-bright); }

.q-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 10px; }
.q-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.q-num { font-family: var(--font-mono); font-size: 0.6rem; color: var(--white); letter-spacing: 0.1em; }
.q-subject { font-family: var(--font-mono); font-size: 0.56rem; color: var(--dim); border: 1px solid var(--border); padding: 1px 6px; }
.q-chapter { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); }
.q-year { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); }
.q-diff { font-family: var(--font-mono); font-size: 0.52rem; padding: 1px 5px; letter-spacing: 0.06em; }
.diff-easy { color: rgba(120,220,120,0.7); border: 1px solid rgba(120,220,120,0.2); }
.diff-med  { color: rgba(255,200,80,0.7);  border: 1px solid rgba(255,200,80,0.2);  }
.diff-hard { color: rgba(255,100,100,0.7); border: 1px solid rgba(255,100,100,0.2); }

.flag-btn {
  font-family: var(--font-mono); font-size: 0.58rem; background: transparent;
  border: 1px solid var(--border); color: var(--dim); padding: 3px 8px; cursor: pointer;
  transition: all 0.15s; white-space: nowrap;
}
.flag-btn:hover { border-color: rgba(255,200,80,0.4); color: rgba(255,200,80,0.7); }
.flag-btn.flag-active { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); background: rgba(255,200,80,0.06); }

.q-text { font-family: var(--font-sans); font-size: 0.9rem; color: var(--white); margin-bottom: 16px; line-height: 1.6; }
.q-options { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
.q-opt {
  display: flex; align-items: center; gap: 10px;
  background: transparent; border: 1px solid var(--border); padding: 10px 14px;
  cursor: pointer; text-align: left; transition: all 0.15s; width: 100%;
}
.q-opt:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.03); }
.q-opt.opt-selected { border-color: var(--white); background: rgba(240,240,234,0.06); }
.opt-letter {
  font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim);
  border: 1px solid var(--border); width: 22px; height: 20px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.q-opt.opt-selected .opt-letter { border-color: var(--white); color: var(--white); }
.opt-text { font-family: var(--font-sans); font-size: 0.85rem; color: var(--gray); }
.q-opt.opt-selected .opt-text { color: var(--white); }

.q-card-footer { display: flex; align-items: center; justify-content: space-between; }
.q-answered-note { font-family: var(--font-mono); font-size: 0.57rem; color: rgba(120,220,120,0.7); }
.q-unanswered-note { font-family: var(--font-mono); font-size: 0.57rem; color: var(--dim); }
.clear-btn {
  font-family: var(--font-mono); font-size: 0.55rem; background: transparent;
  border: 1px solid var(--border); color: var(--dim); padding: 2px 7px; cursor: pointer;
}
.clear-btn:hover { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.6); }

/* ─── SUBMIT BAR ─────────────────────────────────────────────────────────── */
.submit-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  border: 1px solid var(--border-bright); background: var(--black);
  padding: 18px 22px; margin-top: 8px;
}
.submit-stats { display: flex; gap: 20px; font-family: var(--font-sans); font-size: 0.82rem; color: var(--gray); }
.submit-stats strong { font-family: var(--font-mono); color: var(--white); }
.submit-actions { display: flex; align-items: center; gap: 12px; }
.submit-written-note { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(255,200,80,0.7); }

/* ─── WRITTEN INTRO ──────────────────────────────────────────────────────── */
.written-intro-phase { display: flex; justify-content: center; padding: 60px 20px; }
.wi-container {
  max-width: 540px; width: 100%; border: 1px solid var(--border-bright); padding: 40px 36px;
  background: rgba(240,240,234,0.01); box-shadow: 6px 6px 0 0 rgba(240,240,234,0.03);
  text-align: center;
}
.wi-icon { font-size: 2.4rem; margin-bottom: 14px; }
.wi-title { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.2em; color: var(--white); margin-bottom: 6px; }
.wi-subtitle { font-family: var(--font-sans); font-size: 0.9rem; color: var(--gray); margin-bottom: 28px; }
.wi-meta-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); margin-bottom: 24px; }
.wi-meta-item { background: var(--black); padding: 16px; text-align: center; }
.wi-meta-val { font-family: var(--font-mono); font-size: 1.8rem; font-weight: 700; color: var(--white); margin-bottom: 4px; }
.wi-meta-lbl { font-family: var(--font-sans); font-size: 0.7rem; color: var(--gray); }
.wi-rules { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; text-align: left; }
.wi-rule { font-family: var(--font-sans); font-size: 0.82rem; color: var(--gray); }
.wi-question-preview { border: 1px solid var(--border); padding: 16px; margin-bottom: 24px; text-align: left; }
.wi-preview-label { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.12em; color: var(--dim); margin-bottom: 10px; }
.wi-preview-item { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--border); }
.wi-preview-item:last-child { border-bottom: none; }
.wi-preview-num { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); }
.wi-preview-subj { font-family: var(--font-mono); font-size: 0.6rem; color: var(--white); flex: 1; }
.wi-preview-type { font-family: var(--font-mono); font-size: 0.54rem; padding: 1px 6px; border: 1px solid; }
.wi-preview-marks { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }
.type-creative { color: rgba(255,200,80,0.8); border-color: rgba(255,200,80,0.3); }
.type-short { color: rgba(120,220,120,0.7); border-color: rgba(120,220,120,0.25); }
.wi-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── WRITTEN PHASE ──────────────────────────────────────────────────────── */
.written-scroll-list { padding: 20px 0 80px; display: flex; flex-direction: column; gap: 20px; }
.wq-card {
  position: relative; background: var(--black); border: 1px solid var(--border);
  border-left: 3px solid rgba(255,200,80,0.3); padding: 28px;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03); transition: border-left-color 0.2s;
}
.wq-card--answered { border-left-color: rgba(120,220,120,0.5); }
.wq-card-corner { position: absolute; width: 8px; height: 8px; }
.wq-card-corner.tl { top:5px;left:5px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.wq-card-corner.br { bottom:5px;right:5px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.wq-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 10px; }
.wq-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.wq-num { font-family: var(--font-mono); font-size: 0.6rem; color: var(--white); }
.wq-subject { font-family: var(--font-mono); font-size: 0.58rem; border: 1px solid var(--border); padding: 1px 7px; color: var(--dim); }
.wq-chapter { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); }
.wq-type { font-family: var(--font-mono); font-size: 0.54rem; padding: 1px 6px; border: 1px solid; }
.wq-year { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); }
.wq-marks-badge { font-family: var(--font-mono); font-size: 0.62rem; padding: 3px 10px; border: 1px solid rgba(255,200,80,0.35); color: rgba(255,200,80,0.8); flex-shrink: 0; }
.wq-text { font-family: var(--font-sans); font-size: 0.9rem; color: var(--white); line-height: 1.7; margin-bottom: 20px; white-space: pre-line; }
.wq-answer-section { margin-bottom: 18px; }
.wq-answer-label { display: block; font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.12em; color: var(--dim); margin-bottom: 8px; }
.wq-textarea {
  width: 100%; background: rgba(240,240,234,0.02); border: 1px solid var(--border);
  border-left: 2px solid rgba(255,200,80,0.3); color: var(--white); font-family: var(--font-sans);
  font-size: 0.88rem; padding: 12px 14px; resize: vertical; min-height: 140px; line-height: 1.6;
  transition: border-color 0.2s;
}
.wq-textarea:focus { outline: none; border-color: var(--border-bright); border-left-color: rgba(255,200,80,0.5); }
.wq-char-count { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); text-align: right; margin-top: 4px; }
.wq-image-section { margin-top: 4px; }
.wq-image-label { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.wq-image-label span:first-child { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.1em; color: var(--dim); }
.wq-image-hint { font-family: var(--font-sans); font-size: 0.7rem; color: var(--dim); }
.wq-image-dropzone {
  border: 1px dashed var(--border); padding: 20px; text-align: center; cursor: pointer;
  transition: border-color 0.15s; background: rgba(240,240,234,0.01);
}
.wq-image-dropzone:hover { border-color: var(--border-bright); }
.wq-dropzone-icon { font-size: 1.4rem; margin-bottom: 6px; }
.wq-dropzone-text { font-family: var(--font-mono); font-size: 0.62rem; color: var(--dim); margin-bottom: 3px; }
.wq-dropzone-hint { font-family: var(--font-sans); font-size: 0.68rem; color: var(--dim); opacity: 0.6; }
.wq-image-preview { position: relative; }
.wq-preview-img { max-width: 100%; max-height: 280px; border: 1px solid var(--border); display: block; }
.wq-remove-image {
  font-family: var(--font-mono); font-size: 0.58rem; background: rgba(255,100,100,0.08);
  border: 1px solid rgba(255,100,100,0.3); color: rgba(255,100,100,0.7);
  padding: 4px 10px; cursor: pointer; margin-top: 8px;
}
.written-submit-bar { margin-top: 8px; }

/* ─── SCORE HERO ─────────────────────────────────────────────────────────── */
.score-hero {
  position: relative; border: 1px solid var(--border-bright); padding: 32px;
  display: flex; gap: 40px; margin-bottom: 28px;
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.04);
}
.score-hero-corner { position: absolute; width: 14px; height: 14px; }
.score-hero-corner.tl { top:8px;left:8px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.score-hero-corner.br { bottom:8px;right:8px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.score-hero-left { flex: 1; }
.score-exam-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); margin-bottom: 8px; }
.score-badge-row { display: flex; gap: 8px; margin-bottom: 12px; }
.score-section-tag { font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 8px; border: 1px solid rgba(120,220,120,0.4); color: rgba(120,220,120,0.8); }
.score-section-written { border-color: rgba(255,200,80,0.4); color: rgba(255,200,80,0.8); }
.score-pct { font-family: var(--font-mono); font-size: 4rem; font-weight: 700; line-height: 1; margin-bottom: 8px; }
.score-pct-sym { font-size: 2rem; opacity: 0.6; }
.grade-high { color: rgba(120,220,120,0.9); }
.grade-mid { color: rgba(255,200,80,0.9); }
.grade-low { color: rgba(255,150,80,0.9); }
.grade-fail { color: rgba(255,100,100,0.9); }
.score-raw { font-family: var(--font-mono); font-size: 0.82rem; color: var(--gray); margin-bottom: 10px; }
.score-raw strong { color: var(--white); }
.score-status { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; padding: 4px 10px; border: 1px solid; display: inline-block; }
.status-pass { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); }
.status-fail { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.3); }
.score-hero-right { min-width: 220px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.grade-badge { font-family: var(--font-mono); font-size: 2.8rem; font-weight: 700; }
.grade-label { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.12em; color: var(--gray); margin-bottom: 8px; }
.score-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); width: 100%; }
.smc { background: var(--black); padding: 10px; text-align: center; }
.smc-val { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--white); }
.smc-lbl { font-family: var(--font-sans); font-size: 0.64rem; color: var(--gray); margin: 2px 0; }
.smc-mark { font-family: var(--font-mono); font-size: 0.56rem; color: var(--dim); }
.correct-card .smc-val { color: rgba(120,220,120,0.8); }
.wrong-card .smc-val { color: rgba(255,100,100,0.7); }
.correct-mark { color: rgba(120,220,120,0.6); }

/* ─── SUBJECT BREAKDOWN ──────────────────────────────────────────────────── */
.sb-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; }
.section-title-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); }
.sb-filter-hint { font-family: var(--font-sans); font-size: 0.75rem; color: var(--dim); }
.sb-filter-active-hint { color: var(--gray); }
.sb-filter-active-hint strong { color: var(--white); font-family: var(--font-mono); }
.subject-breakdown-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); margin-bottom: 28px; }
.sb-card {
  background: var(--black); padding: 16px; cursor: pointer;
  border: 1px solid transparent; transition: all 0.15s;
}
.sb-card:hover { border-color: var(--border-bright); }
.sb-card--active { border-color: var(--white) !important; border-left: 3px solid var(--white); }
.sb-card--dim { opacity: 0.45; }
.sb-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.sb-name { font-family: var(--font-mono); font-size: 0.65rem; color: var(--white); }
.sb-tab-count { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; color: var(--white); display: flex; align-items: baseline; gap: 3px; }
.sb-tab-label { font-size: 0.55rem; color: var(--dim); }
.sb-tab-correct { color: rgba(120,220,120,0.9); }
.sb-tab-wrong { color: rgba(255,100,100,0.9); }
.sb-tab-skipped { color: rgba(240,240,234,0.4); }
.sb-stats-row { display: flex; gap: 10px; margin-bottom: 10px; }
.sb-stat { font-family: var(--font-mono); font-size: 0.6rem; }
.sb-stat.correct { color: rgba(120,220,120,0.7); }
.sb-stat.wrong { color: rgba(255,100,100,0.6); }
.sb-stat.skip { color: rgba(240,240,234,0.3); }
.sb-bar-track { height: 3px; background: rgba(240,240,234,0.06); margin-bottom: 10px; }
.sb-bar-fill { height: 100%; transition: width 0.5s; }
.sb-high-fill { background: rgba(120,220,120,0.5); }
.sb-mid-fill { background: rgba(255,200,80,0.5); }
.sb-low-fill { background: rgba(255,100,100,0.45); }
.sb-card-footer { display: flex; align-items: center; justify-content: space-between; }
.sb-pct { font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; }
.sb-high { color: rgba(120,220,120,0.9); }
.sb-mid { color: rgba(255,200,80,0.9); }
.sb-low { color: rgba(255,100,100,0.8); }
.sb-filter-cta { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); }
.sb-card--active .sb-filter-cta { color: var(--gray); }

/* ─── WRITTEN SUMMARY ────────────────────────────────────────────────────── */
.written-summary { margin-bottom: 28px; }
.ws-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--border); }
.ws-card { background: var(--black); padding: 18px; }
.ws-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.ws-qnum { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); }
.ws-subj { font-family: var(--font-mono); font-size: 0.6rem; color: var(--white); }
.ws-type { font-family: var(--font-mono); font-size: 0.54rem; padding: 1px 6px; border: 1px solid; }
.ws-marks { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(255,200,80,0.7); margin-left: auto; }
.ws-answer-preview { font-family: var(--font-sans); font-size: 0.8rem; color: var(--gray); line-height: 1.55; margin-bottom: 8px; }
.ws-has-image { font-family: var(--font-mono); font-size: 0.58rem; color: rgba(120,220,120,0.6); }
.ws-no-image { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); }

/* ─── REVIEW ─────────────────────────────────────────────────────────────── */
.review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
.review-header-left { display: flex; align-items: center; gap: 10px; }
.review-subject-chip { font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 8px; border: 1px solid var(--border-bright); color: var(--white); display: inline-flex; align-items: center; gap: 6px; }
.review-clear-subj { background: none; border: none; color: var(--gray); cursor: pointer; font-size: 0.7rem; padding: 0; }
.review-tabs { display: flex; gap: 4px; }
.rev-tab {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  background: transparent; border: 1px solid var(--border); color: var(--dim);
  padding: 5px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s;
}
.rev-tab:hover { border-color: var(--border-bright); color: var(--gray); }
.rev-tab.active { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.04); }
.rev-count { font-family: var(--font-mono); font-size: 0.56rem; padding: 1px 5px; border: 1px solid var(--border); }
.rev-tab.active .rev-count { border-color: rgba(240,240,234,0.3); }
.review-empty { display: flex; align-items: center; gap: 16px; padding: 24px; border: 1px dashed var(--border); margin-bottom: 16px; }
.review-empty-icon { font-family: var(--font-mono); font-size: 1.4rem; color: var(--dim); }
.review-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
.rc-card {
  background: var(--black); border: 1px solid var(--border); border-left: 3px solid var(--border);
  padding: 20px; transition: border-left-color 0.2s;
}
.rc-card.rc-correct { border-left-color: rgba(120,220,120,0.5); }
.rc-card.rc-wrong   { border-left-color: rgba(255,100,100,0.5); }
.rc-card.rc-skipped { border-left-color: rgba(240,240,234,0.15); }
.rc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 10px; flex-wrap: wrap; }
.rc-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rc-qnum { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); }
.rc-subj { font-family: var(--font-mono); font-size: 0.58rem; border: 1px solid var(--border); padding: 1px 6px; color: var(--dim); }
.rc-chapter { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); }
.rc-diff { font-family: var(--font-mono); font-size: 0.52rem; padding: 1px 5px; letter-spacing: 0.06em; }
.rc-badge { font-family: var(--font-mono); font-size: 0.58rem; padding: 3px 9px; border: 1px solid; }
.rc-badge-correct { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); }
.rc-badge-wrong   { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.3); }
.rc-badge-skip    { color: rgba(240,240,234,0.4); border-color: rgba(240,240,234,0.15); }
.rc-question { font-family: var(--font-sans); font-size: 0.9rem; color: var(--white); line-height: 1.6; margin-bottom: 14px; }
.rc-options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.rc-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border: 1px solid var(--border);
  background: transparent; transition: none;
}
.rc-opt.rc-correct { background: rgba(120,220,120,0.05); border-color: rgba(120,220,120,0.35); }
.rc-opt.rc-wrong   { background: rgba(255,100,100,0.05); border-color: rgba(255,100,100,0.35); }
.rc-opt-letter {
  font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim);
  border: 1px solid var(--border); width: 22px; height: 20px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.rc-opt.rc-correct .rc-opt-letter { border-color: rgba(120,220,120,0.5); color: rgba(120,220,120,0.9); }
.rc-opt.rc-wrong   .rc-opt-letter { border-color: rgba(255,100,100,0.5); color: rgba(255,100,100,0.8); }
.rc-opt-text { font-family: var(--font-sans); font-size: 0.84rem; color: var(--gray); flex: 1; }
.rc-opt.rc-correct .rc-opt-text { color: var(--white); }
.rc-tag-correct { font-family: var(--font-mono); font-size: 0.54rem; color: rgba(120,220,120,0.8); margin-left: auto; }
.rc-tag-wrong   { font-family: var(--font-mono); font-size: 0.54rem; color: rgba(255,100,100,0.7); margin-left: auto; }
.rc-skipped-note { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); margin-bottom: 8px; }

/* ─── EXPLANATION ────────────────────────────────────────────────────────── */
.rc-explanation { margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px; }
.exp-label {
  display: block; font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.16em;
  color: rgba(255,200,80,0.7); margin-bottom: 7px;
  border-left: 2px solid rgba(255,200,80,0.4); padding-left: 8px;
}
.exp-text {
  font-family: var(--font-sans); font-size: 0.83rem; color: var(--gray);
  line-height: 1.65; margin: 0; padding-left: 10px;
  border-left: 2px solid rgba(255,200,80,0.15);
}

/* ─── RESULTS ACTIONS ────────────────────────────────────────────────────── */
.results-actions { display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 24px; flex-wrap: wrap; }

/* ─── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .type-grid { grid-template-columns: repeat(2, 1fr); }
  .subject-breakdown-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .exam-page { padding: 24px 16px 80px; }
  .page-header { flex-direction: column; gap: 16px; }
  .tier-badge { max-width: 100%; width: 100%; }
  .type-grid { grid-template-columns: 1fr 1fr; }
  .group-grid--single { max-width: 100%; }
  .cta-bar { flex-direction: column; align-items: stretch; gap: 12px; bottom: 0; left: 0; right: 0; border-left: none; border-right: none; border-bottom: none; padding: 16px; }
  .cta-right { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .score-hero { flex-direction: column; gap: 24px; padding: 22px; }
  .score-hero-right { min-width: unset; width: 100%; }
  .expect-grid { grid-template-columns: 1fr; }
  .wi-meta-grid { grid-template-columns: repeat(3,1fr); }
  .ws-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .exam-page { padding: 12px 10px 90px; }
  .page-title { font-size: 1.5rem; }
  .type-grid { grid-template-columns: 1fr; }
  .subject-breakdown-grid { grid-template-columns: repeat(2, 1fr); }
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
  .wq-card { padding: 18px 14px; }
  .end-modal .end-actions { flex-direction: column; }
  .end-modal .end-actions .iso-btn { width: 100%; justify-content: center; }
  .start-modal-actions { flex-direction: column; gap: 8px; }
  .start-modal-actions .iso-btn { width: 100%; justify-content: center; }
}
</style>
