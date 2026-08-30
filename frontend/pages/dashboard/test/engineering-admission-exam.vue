<script setup>
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ─── MOCK USER TIER ──────────────────────────────────────────────────────────
const isPaid = ref(false)

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
const questionBank = {

  // ── BUET (Bangladesh University of Engineering & Technology) ──────────────
  buet: {
    physics: [
      { id: 'bu-phy-1', text: 'A projectile is launched at 45° to the horizontal with speed u. The range is maximum when:', options: ['θ = 30°', 'θ = 45°', 'θ = 60°', 'θ = 90°'], answer: 1, chapter: 'Projectile Motion', year: '2023', difficulty: 'easy', explanation: 'Range R = u²sin(2θ)/g. This is maximum when sin(2θ) = 1, i.e., 2θ = 90°, so θ = 45°. At 45° the horizontal and vertical components of velocity are equal, yielding maximum range.' },
      { id: 'bu-phy-2', text: 'A particle moves in a circle of radius r with constant angular velocity ω. The centripetal acceleration is:', options: ['ωr', 'ω²r', 'ω/r', 'ω²/r'], answer: 1, chapter: 'Circular Motion', year: '2022', difficulty: 'easy', explanation: 'Centripetal acceleration a = v²/r = (ωr)²/r = ω²r. The centripetal acceleration points inward toward the center and is responsible for changing the direction of velocity.' },
      { id: 'bu-phy-3', text: 'The electric field inside a uniformly charged spherical shell is:', options: ['Maximum at center', 'Proportional to r', 'Zero everywhere inside', 'Equal to surface value'], answer: 2, chapter: 'Electrostatics', year: '2023', difficulty: 'medium', explanation: 'By Gauss\'s Law, for a uniformly charged shell, the enclosed charge inside any Gaussian surface within the shell is zero. Hence E = 0 everywhere inside. This is the electrostatic shielding principle.' },
      { id: 'bu-phy-4', text: 'Two capacitors C₁ and C₂ are connected in series. The equivalent capacitance is:', options: ['C₁ + C₂', 'C₁C₂/(C₁+C₂)', '(C₁+C₂)/C₁C₂', '√(C₁C₂)'], answer: 1, chapter: 'Capacitance', year: '2022', difficulty: 'medium', explanation: 'In series: 1/C = 1/C₁ + 1/C₂ → C = C₁C₂/(C₁+C₂). In series, same charge Q appears on each capacitor but voltage divides. In parallel, C = C₁+C₂ and voltage is shared.' },
      { id: 'bu-phy-5', text: 'Which of the following correctly describes Lenz\'s law?', options: ['Induced EMF magnitude is proportional to flux change rate', 'Induced current direction opposes the change causing it', 'EMF = NBA for a coil', 'Flux is always conserved'], answer: 1, chapter: 'Electromagnetic Induction', year: '2023', difficulty: 'medium', explanation: 'Lenz\'s Law states that the induced current flows in a direction that opposes the change in flux that caused it. This is a consequence of energy conservation and is expressed by the negative sign in Faraday\'s law: EMF = -dΦ/dt.' },
      { id: 'bu-phy-6', text: 'The de Broglie wavelength of a particle with momentum p is:', options: ['λ = ph', 'λ = h/p', 'λ = p/h', 'λ = h²/p'], answer: 1, chapter: 'Modern Physics', year: '2022', difficulty: 'medium', explanation: 'de Broglie proposed λ = h/p, where h is Planck\'s constant (6.626×10⁻³⁴ J·s) and p is momentum. This wave-particle duality applies to all matter. For an electron accelerated through voltage V: λ = h/√(2meV).' },
      { id: 'bu-phy-7', text: 'In simple harmonic motion, at the equilibrium position the:', options: ['Velocity is zero', 'Acceleration is maximum', 'Velocity is maximum', 'Displacement is maximum'], answer: 2, chapter: 'Oscillations', year: '2023', difficulty: 'easy', explanation: 'At the equilibrium position, displacement x = 0. Since a = -ω²x, acceleration = 0. From energy conservation, all energy is kinetic, so velocity is maximum: v_max = ωA. At extreme positions, velocity = 0 and |acceleration| is maximum.' },
      { id: 'bu-phy-8', text: 'The photoelectric effect proves that light has:', options: ['Wave nature', 'Particle (quantum) nature', 'Both wave and particle nature', 'Neither wave nor particle nature'], answer: 1, chapter: 'Modern Physics', year: '2021', difficulty: 'easy', explanation: 'The photoelectric effect (Einstein, 1905) demonstrates that light comes in discrete packets called photons with energy E = hf. The instantaneous emission and threshold frequency cannot be explained by wave theory — only particle (quantum) nature accounts for these observations.' },
    ],
    chemistry: [
      { id: 'bu-chem-1', text: 'The hybridisation of carbon in benzene (C₆H₆) is:', options: ['sp', 'sp²', 'sp³', 'sp³d'], answer: 1, chapter: 'Organic Chemistry', year: '2023', difficulty: 'easy', explanation: 'In benzene each carbon forms 3 σ bonds (2 C-C and 1 C-H) using sp² hybrid orbitals in a trigonal planar arrangement (120°). The remaining unhybridised p orbital on each C contributes to the delocalized π system above and below the ring.' },
      { id: 'bu-chem-2', text: 'Which of the following is an SN2 reaction characteristic?', options: ['First-order kinetics', 'Inversion of configuration', 'Carbocation intermediate', 'Favoured by tertiary substrates'], answer: 1, chapter: 'Organic Mechanisms', year: '2022', difficulty: 'hard', explanation: 'SN2 (bimolecular nucleophilic substitution): one-step backside attack; second-order kinetics (rate = k[substrate][nucleophile]); complete inversion of configuration (Walden inversion); favoured by primary substrates. Tertiary substrates are hindered; SN1 is favoured for those.' },
      { id: 'bu-chem-3', text: 'The IUPAC name of CH₃-CH(OH)-CH₂-CH₃ is:', options: ['1-butanol', '2-butanol', '3-butanol', 'sec-butanol'], answer: 1, chapter: 'Nomenclature', year: '2023', difficulty: 'medium', explanation: '2-butanol: the OH is on C2 of a 4-carbon chain. Number from the end closer to the OH group: C1-C2(OH)-C3-C4. sec-butanol is a common name for the same compound; IUPAC name is butan-2-ol (or 2-butanol).' },
      { id: 'bu-chem-4', text: 'Le Chatelier\'s principle predicts that for N₂ + 3H₂ ⇌ 2NH₃ (exothermic), increasing temperature will:', options: ['Increase NH₃ yield', 'Decrease NH₃ yield', 'Have no effect on yield', 'Increase rate but not yield'], answer: 1, chapter: 'Chemical Equilibrium', year: '2022', difficulty: 'medium', explanation: 'For an exothermic forward reaction, adding heat (increasing T) shifts the equilibrium left (toward reactants) to absorb the excess heat. This decreases NH₃ yield. Industrial Haber process uses moderate temperature (~450°C) as a compromise between yield (lower T is better) and rate (higher T is better).' },
      { id: 'bu-chem-5', text: 'Which quantum number determines the shape of an orbital?', options: ['Principal (n)', 'Azimuthal (l)', 'Magnetic (mₗ)', 'Spin (ms)'], answer: 1, chapter: 'Atomic Structure', year: '2023', difficulty: 'easy', explanation: 'The azimuthal (angular momentum) quantum number l determines orbital shape: l=0 → s (spherical), l=1 → p (dumbbell), l=2 → d (cloverleaf), l=3 → f. n determines energy and size; mₗ determines orientation; ms determines spin direction.' },
      { id: 'bu-chem-6', text: 'The oxidation state of Mn in KMnO₄ is:', options: ['+ 4', '+5', '+6', '+7'], answer: 3, chapter: 'Redox Chemistry', year: '2021', difficulty: 'easy', explanation: 'In KMnO₄: K = +1, O = −2 (×4 = −8). Total charge = 0: +1 + Mn + (−8) = 0 → Mn = +7. KMnO₄ is a strong oxidizing agent. In acidic solution Mn⁷⁺ → Mn²⁺ (colorless); in neutral Mn⁴⁺ (MnO₂); in basic Mn⁶⁺ (MnO₄²⁻).' },
    ],
    math: [
      { id: 'bu-math-1', text: 'The value of lim(x→0) (sin x)/x is:', options: ['0', '∞', '1', 'undefined'], answer: 2, chapter: 'Limits', year: '2023', difficulty: 'easy', explanation: 'lim(x→0) (sin x)/x = 1 is a fundamental limit. It can be proved geometrically or using L\'Hôpital\'s rule: differentiating numerator and denominator → lim(x→0) cos(x)/1 = cos(0) = 1. This limit is essential in deriving the derivative of sin(x).' },
      { id: 'bu-math-2', text: 'The determinant of the 2×2 matrix [[a,b],[c,d]] is:', options: ['ab - cd', 'ad - bc', 'ac - bd', 'ab + cd'], answer: 1, chapter: 'Matrices & Determinants', year: '2022', difficulty: 'easy', explanation: 'det([[a,b],[c,d]]) = ad - bc. This is the product of the main diagonal minus the product of the anti-diagonal. For a 3×3 matrix, cofactor expansion is used. Determinant = 0 implies the matrix is singular (no inverse).' },
      { id: 'bu-math-3', text: '∫ e^x dx equals:', options: ['e^x + C', 'xe^x + C', 'e^(x+1)/(x+1) + C', 'e^x/x + C'], answer: 0, chapter: 'Integration', year: '2023', difficulty: 'easy', explanation: '∫ eˣ dx = eˣ + C. The exponential function eˣ is its own derivative and its own antiderivative — a unique property. This follows from d/dx(eˣ) = eˣ, so by definition of antiderivative, ∫ eˣ dx = eˣ + C.' },
      { id: 'bu-math-4', text: 'The equation of a circle with centre (h,k) and radius r is:', options: ['(x+h)² + (y+k)² = r²', '(x-h)² + (y-k)² = r²', 'x² + y² = r²', '(x-h)² - (y-k)² = r²'], answer: 1, chapter: 'Coordinate Geometry', year: '2022', difficulty: 'easy', explanation: '(x-h)² + (y-k)² = r² is the standard form. It represents all points (x,y) at distance r from centre (h,k). When h=k=0, it becomes x²+y²=r² (circle centred at origin). Expanding gives the general form x²+y²+Dx+Ey+F=0.' },
      { id: 'bu-math-5', text: 'The derivative of ln(x) is:', options: ['1/x²', 'x', '1/x', 'e^x'], answer: 2, chapter: 'Differentiation', year: '2023', difficulty: 'easy', explanation: 'd/dx[ln(x)] = 1/x for x > 0. This follows from the inverse relationship between ln and e: if y = ln(x), then eʸ = x. Differentiating implicitly: eʸ(dy/dx) = 1 → dy/dx = 1/eʸ = 1/x. Chain rule: d/dx[ln(f(x))] = f\'(x)/f(x).' },
      { id: 'bu-math-6', text: 'The sum of the first n terms of an arithmetic progression with first term a and common difference d is:', options: ['n(a + l)/2', 'n/2 × [2a + (n-1)d]', 'Both A and B', 'a × rⁿ/(r-1)'], answer: 2, chapter: 'Sequences & Series', year: '2022', difficulty: 'medium', explanation: 'Sₙ = n/2 × [2a + (n-1)d] = n(a+l)/2 where l = a+(n-1)d is the last term. Both forms are equivalent and correct. The formula arises from pairing first and last terms: (a + l) appears n/2 times. For GP: Sₙ = a(rⁿ - 1)/(r-1).' },
      { id: 'bu-math-7', text: 'The value of sin(π/6) is:', options: ['√3/2', '1/2', '1/√2', '√3/3'], answer: 1, chapter: 'Trigonometry', year: '2023', difficulty: 'easy', explanation: 'sin(π/6) = sin(30°) = 1/2. Key values: sin(0°)=0, sin(30°)=1/2, sin(45°)=1/√2, sin(60°)=√3/2, sin(90°)=1. Remember the mnemonic: 0, 1, √2, √3, 2 divided by 2 for sin(0°,30°,45°,60°,90°).' },
      { id: 'bu-math-8', text: 'If f(x) = x³ − 3x, the critical points occur at:', options: ['x = 0 only', 'x = ±1', 'x = ±√3', 'x = 3'], answer: 1, chapter: 'Calculus — Extrema', year: '2022', difficulty: 'medium', explanation: 'f\'(x) = 3x² − 3 = 0 → x² = 1 → x = ±1. At x = −1: f\'\'(−1) = 6(−1) = −6 < 0 → local maximum. At x = 1: f\'\'(1) = 6 > 0 → local minimum. f(−1) = 2, f(1) = −2.' },
    ],
    english: [
      { id: 'bu-eng-1', text: 'Choose the correct sentence:', options: ['The data is conclusive.', 'The data are conclusive.', 'The datas are conclusive.', 'The datum are conclusive.'], answer: 1, chapter: 'Grammar', year: '2023', difficulty: 'medium', explanation: '"Data" is the plural of "datum" and traditionally takes a plural verb: "The data are conclusive." In informal usage "data is" is accepted, but in scientific and formal writing "data are" is preferred and is the standard answer in exam contexts.' },
      { id: 'bu-eng-2', text: 'The word "photovoltaic" contains the prefix meaning:', options: ['light', 'electricity', 'heat', 'force'], answer: 0, chapter: 'Vocabulary & Word Formation', year: '2022', difficulty: 'easy', explanation: '"Photo-" comes from Greek "phōs/phōtos" meaning light. Photovoltaic = light + voltage-producing. Other "photo-" words: photosynthesis (light + putting together), photograph (light + writing), photon (light particle). "Volt-" refers to voltage/electricity.' },
    ],
    gk: [
      { id: 'bu-gk-1', text: 'BUET was established in which year?', options: ['1947', '1960', '1962', '1971'], answer: 2, chapter: 'General Knowledge', year: '2023', difficulty: 'easy', explanation: 'BUET (Bangladesh University of Engineering and Technology) was established in 1962 as the East Pakistan University of Engineering and Technology (EPUET). After independence in 1971, it was renamed BUET. It is located in Dhaka and is the premier engineering university of Bangladesh.' },
      { id: 'bu-gk-2', text: 'Which programming language is most commonly used for embedded systems in engineering?', options: ['Python', 'Java', 'C/C++', 'JavaScript'], answer: 2, chapter: 'Engineering Fundamentals', year: '2022', difficulty: 'easy', explanation: 'C and C++ are the dominant languages for embedded systems because they offer low-level hardware control, minimal overhead, and direct memory management. Python is too slow for time-critical embedded tasks; Java has a heavy runtime; JavaScript is web-focused.' },
    ],
  },

  // ── KUET (Khulna University of Engineering & Technology) ──────────────────
  kuet: {
    physics: [
      { id: 'ku-phy-1', text: 'The dimensional formula of pressure is:', options: ['MLT⁻²', 'ML⁻¹T⁻²', 'ML²T⁻²', 'ML⁻²T⁻¹'], answer: 1, chapter: 'Dimensional Analysis', year: '2023', difficulty: 'easy', explanation: 'Pressure = Force/Area = [MLT⁻²]/[L²] = [ML⁻¹T⁻²]. Always derive dimensions from fundamental definitions: Force = ma = [M][LT⁻²]; Area = L². Dimensional analysis is essential for checking formula correctness and unit conversion.' },
      { id: 'ku-phy-2', text: 'The efficiency of a Carnot engine operating between temperatures T_H and T_C is:', options: ['T_C/T_H', '1 - T_H/T_C', '1 - T_C/T_H', '(T_H - T_C)/T_C'], answer: 2, chapter: 'Thermodynamics', year: '2022', difficulty: 'medium', explanation: 'Carnot efficiency η = 1 − T_C/T_H = (T_H − T_C)/T_H, where temperatures are in Kelvin. This is the maximum possible efficiency for any heat engine. No real engine can exceed Carnot efficiency. Increasing T_H or decreasing T_C improves efficiency.' },
      { id: 'ku-phy-3', text: 'Which electromagnetic wave has the shortest wavelength?', options: ['Radio waves', 'Microwaves', 'X-rays', 'Gamma rays'], answer: 3, chapter: 'Electromagnetic Spectrum', year: '2023', difficulty: 'easy', explanation: 'Gamma rays (λ < 0.01 nm) have the shortest wavelength and highest frequency/energy in the EM spectrum. Order: Radio > Microwave > Infrared > Visible > UV > X-rays > Gamma rays (wavelength decreasing). Gamma rays originate from nuclear decay.' },
      { id: 'ku-phy-4', text: 'Snell\'s law of refraction states:', options: ['n₁sinθ₁ = n₂sinθ₂', 'n₁cosθ₁ = n₂cosθ₂', 'sinθ₁/sinθ₂ = n₁/n₂ only', 'θ₁ = θ₂ always'], answer: 0, chapter: 'Optics', year: '2022', difficulty: 'easy', explanation: 'Snell\'s Law: n₁sinθ₁ = n₂sinθ₂, where n₁, n₂ are refractive indices and θ₁, θ₂ are angles to the normal. When light enters a denser medium (n₂ > n₁), it bends toward the normal (θ₂ < θ₁). Critical angle sinθ_c = n₂/n₁ for total internal reflection.' },
      { id: 'ku-phy-5', text: 'The half-life of a radioactive element is 10 years. After 30 years, the fraction remaining is:', options: ['1/2', '1/4', '1/8', '1/16'], answer: 2, chapter: 'Nuclear Physics', year: '2023', difficulty: 'medium', explanation: '30 years = 3 half-lives. Fraction remaining = (1/2)³ = 1/8. After each half-life the amount halves: 100% → 50% → 25% → 12.5%. Formula: N = N₀(1/2)^(t/t½). For BUET/KUET problems, always find number of half-lives = t/t½ first.' },
      { id: 'ku-phy-6', text: 'The magnetic force on a moving charge q with velocity v in field B at angle θ is:', options: ['F = qvB', 'F = qvBsinθ', 'F = qvBcosθ', 'F = qv/B'], answer: 1, chapter: 'Electromagnetism', year: '2022', difficulty: 'medium', explanation: 'F = qvBsinθ (Lorentz force). The force is maximum when v ⊥ B (θ=90°) and zero when v ∥ B (θ=0°). Direction given by F = q(v × B) using right-hand rule. This force is centripetal when a charge moves perpendicular to a uniform B field, producing circular motion.' },
    ],
    chemistry: [
      { id: 'ku-chem-1', text: 'The functional group −CONH₂ is called:', options: ['Ester', 'Amide', 'Amine', 'Carboxyl'], answer: 1, chapter: 'Organic Functional Groups', year: '2023', difficulty: 'easy', explanation: '−CONH₂ is the amide (primary amide) functional group, also written −C(=O)NH₂. Amides are formed from carboxylic acids + amines with loss of water. They have high melting points due to H-bonding. Nylon and proteins contain amide bonds (peptide bonds).' },
      { id: 'ku-chem-2', text: 'According to VSEPR theory, the shape of NH₃ is:', options: ['Trigonal planar', 'Pyramidal (trigonal pyramidal)', 'Tetrahedral', 'Linear'], answer: 1, chapter: 'Molecular Geometry', year: '2022', difficulty: 'medium', explanation: 'NH₃ has 4 electron pairs around N (3 bonding + 1 lone pair) — tetrahedral electron geometry. With one lone pair, the molecular shape is trigonal pyramidal. The lone pair repels bonding pairs, giving a bond angle of 107° (less than 109.5° in ideal tetrahedron).' },
      { id: 'ku-chem-3', text: 'The pH of a 0.01 mol/L HCl solution is:', options: ['1', '2', '3', '12'], answer: 1, chapter: 'Acids, Bases & pH', year: '2023', difficulty: 'easy', explanation: 'HCl is a strong acid — fully dissociates: [H⁺] = 0.01 M = 10⁻² M. pH = −log[H⁺] = −log(10⁻²) = 2. Remember: pH + pOH = 14 at 25°C. For weak acids, use Ka and ICE tables to find [H⁺].' },
      { id: 'ku-chem-4', text: 'The number of σ and π bonds in ethyne (C₂H₂) respectively are:', options: ['2σ, 2π', '3σ, 2π', '3σ, 1π', '2σ, 1π'], answer: 1, chapter: 'Chemical Bonding', year: '2022', difficulty: 'medium', explanation: 'Ethyne H−C≡C−H: 1 C-H σ + 1 C-C σ + 2 C-C π + 1 C-H σ = 3σ bonds and 2π bonds. Triple bond = 1σ + 2π. Rule: all single bonds are σ; double bond = 1σ+1π; triple bond = 1σ+2π. First bond between atoms is always σ.' },
    ],
    math: [
      { id: 'ku-math-1', text: 'The number of ways to arrange 5 books on a shelf is:', options: ['25', '120', '60', '720'], answer: 1, chapter: 'Permutations & Combinations', year: '2023', difficulty: 'easy', explanation: '5! = 5×4×3×2×1 = 120. The number of permutations of n distinct objects in a row is n!. If some objects are identical, divide by the factorial of repetitions. For circular arrangements: (n−1)! = 4! = 24.' },
      { id: 'ku-math-2', text: 'The binomial coefficient C(6,2) is:', options: ['12', '15', '30', '36'], answer: 1, chapter: 'Combinatorics', year: '2022', difficulty: 'easy', explanation: 'C(6,2) = 6!/(2!×4!) = (6×5)/(2×1) = 15. C(n,r) = n!/[r!(n−r)!]. This counts the number of ways to choose r items from n without regard to order. C(6,2) also appears as the coefficient of x² in (1+x)⁶.' },
      { id: 'ku-math-3', text: 'If the roots of x² − 5x + 6 = 0 are α and β, then α+β and αβ respectively are:', options: ['6 and 5', '5 and 6', '−5 and 6', '5 and −6'], answer: 1, chapter: 'Quadratic Equations', year: '2023', difficulty: 'easy', explanation: 'For ax² + bx + c = 0: sum of roots = −b/a = 5/1 = 5; product of roots = c/a = 6/1 = 6. Vieta\'s formulas. Check: x² − 5x + 6 = (x−2)(x−3), so roots are 2 and 3: 2+3=5, 2×3=6. ✓' },
      { id: 'ku-math-4', text: 'The slope of the line passing through (1,2) and (3,6) is:', options: ['1', '2', '3', '4'], answer: 1, chapter: 'Coordinate Geometry', year: '2022', difficulty: 'easy', explanation: 'Slope m = (y₂−y₁)/(x₂−x₁) = (6−2)/(3−1) = 4/2 = 2. A slope of 2 means for every 1 unit increase in x, y increases by 2. The equation of this line: y − 2 = 2(x − 1) → y = 2x.' },
    ],
    english: [
      { id: 'ku-eng-1', text: 'Choose the word most opposite in meaning to "diligent":', options: ['Hardworking', 'Lazy', 'Smart', 'Clever'], answer: 1, chapter: 'Vocabulary', year: '2023', difficulty: 'easy', explanation: '"Diligent" means hardworking and careful — its antonym is "lazy" (idle, indolent). "Hardworking" is a synonym. "Smart" and "clever" relate to intelligence, not work ethic. In competitive exams, know both synonyms and antonyms of common adjectives.' },
      { id: 'ku-eng-2', text: 'The sentence "Had I known earlier, I would have helped" is in which conditional form?', options: ['Zero conditional', 'First conditional', 'Second conditional', 'Third conditional'], answer: 3, chapter: 'Grammar — Conditionals', year: '2022', difficulty: 'medium', explanation: 'Third conditional: past perfect in if-clause + would have + past participle in main clause. It describes an impossible/hypothetical past situation and its imagined consequence. "Had I known" = "If I had known" — inversion used for formality.' },
    ],
    gk: [
      { id: 'ku-gk-1', text: 'KUET is located in which district?', options: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi'], answer: 2, chapter: 'General Knowledge', year: '2023', difficulty: 'easy', explanation: 'KUET (Khulna University of Engineering & Technology) is located in Khulna, the third largest city of Bangladesh. It was established in 1967 as Khulna Engineering College and later upgraded to a full university.' },
    ],
  },

  // ── RUET (Rajshahi University of Engineering & Technology) ─────────────────
  ruet: {
    physics: [
      { id: 'ru-phy-1', text: 'In Young\'s double slit experiment, the fringe width β is given by:', options: ['β = λD/d', 'β = λd/D', 'β = Dd/λ', 'β = λ/dD'], answer: 0, chapter: 'Wave Optics', year: '2023', difficulty: 'medium', explanation: 'Fringe width β = λD/d, where λ = wavelength, D = distance from slits to screen, d = slit separation. Increasing D or λ increases fringe spacing; increasing d decreases it. This experiment demonstrates the wave nature of light through constructive and destructive interference.' },
      { id: 'ru-phy-2', text: 'The moment of inertia of a uniform thin rod of mass M and length L about its center is:', options: ['ML²/12', 'ML²/3', 'ML²/6', 'ML²/4'], answer: 0, chapter: 'Rotational Dynamics', year: '2022', difficulty: 'medium', explanation: 'I = ML²/12 for a thin rod about its center. About one end: I = ML²/3. Using parallel axis theorem: I_end = I_center + M(L/2)² = ML²/12 + ML²/4 = ML²/3. These are standard results to memorise for engineering entrance exams.' },
      { id: 'ru-phy-3', text: 'A transformer steps up voltage by a factor of 10. The current in the secondary coil compared to the primary is:', options: ['10 times greater', '10 times smaller', '100 times smaller', 'Equal'], answer: 1, chapter: 'Electromagnetic Induction', year: '2023', difficulty: 'easy', explanation: 'In an ideal transformer: V₂/V₁ = N₂/N₁ = I₁/I₂. Power is conserved: P = V₁I₁ = V₂I₂. If voltage is stepped up 10×, current is stepped down 10×. This is why power is transmitted at high voltage — lower current means lower I²R heating losses.' },
      { id: 'ru-phy-4', text: 'The energy of a photon with frequency f is:', options: ['hf²', 'h/f', 'hf', 'h²f'], answer: 2, chapter: 'Quantum Physics', year: '2022', difficulty: 'easy', explanation: 'E = hf (Planck-Einstein relation), where h = 6.626×10⁻³⁴ J·s is Planck\'s constant. Since c = fλ, E = hc/λ. Higher frequency (shorter wavelength) → higher energy per photon. UV photons carry more energy than visible light, which is why UV causes more biological damage.' },
      { id: 'ru-phy-5', text: 'The specific heat capacity of water is 4200 J/kg·K. The heat required to raise 2 kg of water by 5°C is:', options: ['4200 J', '8400 J', '21000 J', '42000 J'], answer: 3, chapter: 'Thermal Physics', year: '2023', difficulty: 'easy', explanation: 'Q = mcΔT = 2 × 4200 × 5 = 42000 J = 42 kJ. Specific heat capacity c tells us heat needed per kg per degree. Water\'s high specific heat (4200 J/kg·K) makes it an excellent coolant — it can absorb large amounts of heat with little temperature change.' },
    ],
    chemistry: [
      { id: 'ru-chem-1', text: 'Which gas is produced when calcium carbonate reacts with dilute HCl?', options: ['H₂', 'O₂', 'CO₂', 'SO₂'], answer: 2, chapter: 'Reactions of Metals & Carbonates', year: '2023', difficulty: 'easy', explanation: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑. Carbonates react with acids to produce salt, water, and carbon dioxide. CO₂ turns limewater (Ca(OH)₂) milky — this is the limewater test. The reaction is also used in the manufacture of cement and glass.' },
      { id: 'ru-chem-2', text: 'The number of moles in 44 g of CO₂ (molar mass = 44 g/mol) is:', options: ['0.5', '1', '2', '44'], answer: 1, chapter: 'Mole Concept', year: '2022', difficulty: 'easy', explanation: 'Moles = mass/molar mass = 44/44 = 1 mol. 1 mole of any substance contains 6.022×10²³ particles (Avogadro\'s number). 1 mol CO₂ = 6.022×10²³ molecules. Molar mass of CO₂ = 12 + 2×16 = 44 g/mol.' },
      { id: 'ru-chem-3', text: 'Electronegativity increases along a period (left to right) because:', options: ['Atomic size increases', 'Nuclear charge increases and atomic radius decreases', 'Electron affinity decreases', 'More shells are added'], answer: 1, chapter: 'Periodic Trends', year: '2023', difficulty: 'medium', explanation: 'Across a period: nuclear charge (protons) increases while electrons are added to the same shell (similar shielding). The increased effective nuclear charge pulls the electron cloud closer, reducing atomic radius and increasing the atom\'s ability to attract shared electrons (electronegativity).' },
    ],
    math: [
      { id: 'ru-math-1', text: 'The number of complex roots of a polynomial of degree 5 is:', options: ['At most 3', 'Exactly 5', 'At most 5', 'Exactly 3'], answer: 1, chapter: 'Complex Numbers', year: '2023', difficulty: 'medium', explanation: 'By the Fundamental Theorem of Algebra, every polynomial of degree n (with complex coefficients) has exactly n complex roots (counting multiplicity). So degree 5 → exactly 5 complex roots (which may include real roots, since reals are a subset of complex numbers).' },
      { id: 'ru-math-2', text: 'The area bounded by y = x² and y = x between x = 0 and x = 1 is:', options: ['1/6', '1/3', '1/2', '2/3'], answer: 0, chapter: 'Definite Integration', year: '2022', difficulty: 'medium', explanation: 'Area = ∫₀¹ (x − x²) dx = [x²/2 − x³/3]₀¹ = (1/2 − 1/3) − 0 = 3/6 − 2/6 = 1/6. Since y=x ≥ y=x² for 0≤x≤1, we integrate (upper − lower). Always sketch the region to identify which function is on top.' },
      { id: 'ru-math-3', text: 'If tan θ = 3/4 and θ is in the first quadrant, then sin θ is:', options: ['3/4', '3/5', '4/5', '4/3'], answer: 1, chapter: 'Trigonometry', year: '2023', difficulty: 'medium', explanation: 'Draw right triangle: opposite = 3, adjacent = 4, hypotenuse = √(3²+4²) = √25 = 5. sin θ = opp/hyp = 3/5. This is the classic 3-4-5 Pythagorean triple. If tan = 3/4, sin = 3/5, cos = 4/5, all positive in Q1.' },
    ],
    english: [
      { id: 'ru-eng-1', text: 'Select the correctly spelled word:', options: ['Occassion', 'Occasion', 'Ocasion', 'Ocassion'], answer: 1, chapter: 'Spelling', year: '2023', difficulty: 'easy', explanation: '"Occasion" — double c, single s. Common misspelling: "occassion" (double s). Memory aid: think "it is a special OCC-asion" — two c\'s make it special. Other tricky doubles: accommodate (2c, 2m), necessary (1c, 2s), committee (2m, 2t, 2e).' },
    ],
    gk: [
      { id: 'ru-gk-1', text: 'The first engineering university established in Bangladesh (then East Pakistan) was:', options: ['BUET', 'KUET', 'RUET', 'CUET'], answer: 0, chapter: 'General Knowledge', year: '2023', difficulty: 'easy', explanation: 'BUET (originally EPUET, established 1962 in Dhaka) was the first engineering university in East Pakistan/Bangladesh. RUET was established in 1964 as Rajshahi Engineering College. KUET in 1967 as Khulna Engineering College. CUET in 1968 as Chittagong Engineering College.' },
    ],
  },

  // ── CUET (Chittagong University of Engineering & Technology) ───────────────
  cuet: {
    physics: [
      { id: 'cu-phy-1', text: 'A body of mass 5 kg is moving at 10 m/s. Its kinetic energy is:', options: ['50 J', '250 J', '100 J', '500 J'], answer: 1, chapter: 'Work, Energy & Power', year: '2023', difficulty: 'easy', explanation: 'KE = ½mv² = ½ × 5 × (10)² = ½ × 5 × 100 = 250 J. Kinetic energy is scalar; it depends on v² (doubling speed quadruples KE). Work-energy theorem: net work done = change in KE. Units: Joule = kg·m²·s⁻².' },
      { id: 'cu-phy-2', text: 'The escape velocity from Earth\'s surface is approximately:', options: ['7.9 km/s', '11.2 km/s', '3.0 km/s', '16.7 km/s'], answer: 1, chapter: 'Gravitation', year: '2022', difficulty: 'easy', explanation: 'Escape velocity v_e = √(2gR) = √(2×9.8×6.4×10⁶) ≈ 11.2 km/s. This is the minimum velocity needed for an object to escape Earth\'s gravitational field without further propulsion. For the Moon (smaller g and R): ~2.4 km/s.' },
      { id: 'cu-phy-3', text: 'When two resistors R₁ and R₂ are connected in parallel, the equivalent resistance is:', options: ['R₁ + R₂', 'R₁R₂/(R₁+R₂)', '(R₁+R₂)/R₁R₂', '√(R₁R₂)'], answer: 1, chapter: 'Electric Circuits', year: '2023', difficulty: 'easy', explanation: '1/R_eq = 1/R₁ + 1/R₂ → R_eq = R₁R₂/(R₁+R₂). Parallel equivalent is always less than the smallest individual resistance. In parallel, same voltage across each, current divides. In series: R_eq = R₁+R₂ and current is same through each.' },
      { id: 'cu-phy-4', text: 'The speed of sound in air at 0°C is approximately:', options: ['300 m/s', '331 m/s', '343 m/s', '360 m/s'], answer: 1, chapter: 'Sound Waves', year: '2022', difficulty: 'easy', explanation: 'Speed of sound in air at 0°C ≈ 331 m/s; at 25°C ≈ 343 m/s. It varies with temperature: v = 331√(T/273) m/s where T is in Kelvin. Sound travels faster in warmer air and much faster in liquids and solids (e.g. ~1480 m/s in water, ~5000 m/s in steel).' },
    ],
    chemistry: [
      { id: 'cu-chem-1', text: 'Which of the following is NOT a colligative property?', options: ['Osmotic pressure', 'Boiling point elevation', 'Optical rotation', 'Freezing point depression'], answer: 2, chapter: 'Solutions & Colligative Properties', year: '2023', difficulty: 'medium', explanation: 'Colligative properties depend on the number of solute particles, not their identity: vapour pressure lowering, boiling point elevation, freezing point depression, osmotic pressure. Optical rotation (how a solution rotates plane-polarized light) depends on the chemical structure of the solute, not just the number of particles.' },
      { id: 'cu-chem-2', text: 'The conjugate base of H₂SO₄ is:', options: ['SO₄²⁻', 'HSO₄⁻', 'H₃SO₄⁺', 'OH⁻'], answer: 1, chapter: 'Brønsted-Lowry Acid-Base Theory', year: '2022', difficulty: 'medium', explanation: 'Conjugate base is formed by removing one H⁺ from the acid: H₂SO₄ − H⁺ → HSO₄⁻. HSO₄⁻ is the conjugate base of H₂SO₄. HSO₄⁻ can further donate another H⁺ to give SO₄²⁻ (conjugate base of HSO₄⁻). H₂SO₄ is diprotic.' },
      { id: 'cu-chem-3', text: 'What is the product when ethanol undergoes dehydration with excess H₂SO₄ at 170°C?', options: ['Diethyl ether', 'Acetic acid', 'Ethylene', 'Acetaldehyde'], answer: 2, chapter: 'Organic Reactions', year: '2023', difficulty: 'medium', explanation: 'At 170°C (excess H₂SO₄): CH₃CH₂OH → CH₂=CH₂ (ethylene) + H₂O — intramolecular dehydration (elimination). At 130°C (excess ethanol): 2C₂H₅OH → C₂H₅OC₂H₅ (diethyl ether) + H₂O — intermolecular dehydration. Temperature is the key difference.' },
    ],
    math: [
      { id: 'cu-math-1', text: 'The value of ∫₀^π sin(x) dx is:', options: ['0', '1', '2', 'π'], answer: 2, chapter: 'Definite Integrals', year: '2023', difficulty: 'medium', explanation: '∫₀^π sin(x) dx = [−cos(x)]₀^π = −cos(π) − (−cos(0)) = −(−1) + 1 = 1 + 1 = 2. The area under sin(x) from 0 to π is exactly 2 square units. Note: ∫₀^{2π} sin(x) dx = 0 because positive area [0,π] and negative area [π,2π] cancel.' },
      { id: 'cu-math-2', text: 'The eccentricity of a circle is:', options: ['0', '1', 'Greater than 1', 'Between 0 and 1'], answer: 0, chapter: 'Conic Sections', year: '2022', difficulty: 'medium', explanation: 'Eccentricity e: circle e=0 (all radii equal), ellipse 0<e<1, parabola e=1, hyperbola e>1. For an ellipse: e = c/a where c² = a² − b²; for hyperbola: e = c/a where c² = a² + b². Eccentricity measures how much a conic deviates from a circle.' },
      { id: 'cu-math-3', text: 'The general solution of dy/dx = y is:', options: ['y = Cx', 'y = Ce^x', 'y = C/x', 'y = ln(x) + C'], answer: 1, chapter: 'Differential Equations', year: '2023', difficulty: 'medium', explanation: 'dy/dx = y → dy/y = dx → ∫dy/y = ∫dx → ln|y| = x + C₁ → y = e^(x+C₁) = e^{C₁}·e^x = Ce^x. This is the separable ODE for exponential growth/decay. If y(0) = y₀, then y = y₀e^x.' },
    ],
    english: [
      { id: 'cu-eng-1', text: 'Identify the passive voice: "The bridge was built by engineers in 1990."', options: ['Active voice', 'Passive voice', 'Imperative', 'Interrogative'], answer: 1, chapter: 'Voice', year: '2023', difficulty: 'easy', explanation: 'This is passive voice: subject ("the bridge") receives the action; agent ("by engineers") is optional. Active: "Engineers built the bridge in 1990." Passive is used when the doer is unknown, unimportant, or we want to emphasize the receiver of the action.' },
    ],
    gk: [
      { id: 'cu-gk-1', text: 'The unit of electric power is:', options: ['Volt', 'Ampere', 'Watt', 'Ohm'], answer: 2, chapter: 'Engineering Basics', year: '2023', difficulty: 'easy', explanation: 'Watt (W) is the SI unit of power. P = VI = I²R = V²/R. Named after James Watt. 1 W = 1 J/s. Kilowatt-hour (kWh) is the unit used by electricity companies for billing: 1 kWh = 3.6×10⁶ J. Volt = potential difference, Ampere = current, Ohm = resistance.' },
      { id: 'cu-gk-2', text: 'Which of the following is a renewable energy source?', options: ['Coal', 'Natural gas', 'Solar energy', 'Petroleum'], answer: 2, chapter: 'Energy & Environment', year: '2022', difficulty: 'easy', explanation: 'Solar energy is renewable — it is continuously replenished by the sun. Coal, natural gas, and petroleum are fossil fuels — non-renewable resources formed over millions of years from organic matter. Other renewables: wind, hydro, geothermal, tidal, biomass.' },
    ],
  },

  // ── MIXED (Combined Practice across all 4 universities) ──────────────────
  mixed: {
    physics: [
      { id: 'mx-phy-1', text: 'Kirchhoff\'s Current Law (KCL) states that at any node:', options: ['Sum of voltages = 0', 'Sum of currents entering = sum of currents leaving', 'Resistance is constant', 'Power = voltage × resistance'], answer: 1, chapter: 'Circuit Analysis', year: '2023', difficulty: 'easy', explanation: 'KCL: algebraic sum of currents at a node = 0 (charge conservation). Currents in = currents out. Kirchhoff\'s Voltage Law (KVL): sum of EMFs = sum of voltage drops around any closed loop (energy conservation). Both are fundamental tools for circuit analysis.' },
      { id: 'mx-phy-2', text: 'The root-mean-square (rms) value of a sinusoidal voltage with peak value V₀ is:', options: ['V₀', 'V₀/2', 'V₀/√2', '2V₀'], answer: 2, chapter: 'AC Circuits', year: '2022', difficulty: 'medium', explanation: 'V_rms = V₀/√2 ≈ 0.707V₀ for a sinusoidal wave. The rms value is the equivalent DC voltage that delivers the same average power. Similarly I_rms = I₀/√2. Household voltage is quoted as rms: 220V rms → peak voltage = 220√2 ≈ 311V.' },
      { id: 'mx-phy-3', text: 'A convex mirror always forms an image that is:', options: ['Real and inverted', 'Virtual and magnified', 'Virtual, erect and diminished', 'Real and magnified'], answer: 2, chapter: 'Optics', year: '2023', difficulty: 'easy', explanation: 'Convex mirror: focal length negative, diverging. Always forms virtual, erect, diminished images behind the mirror — regardless of object position. Used as rear-view mirrors because they give a wider field of view. Concave mirrors can form real or virtual images depending on object distance.' },
    ],
    chemistry: [
      { id: 'mx-chem-1', text: 'The Markovnikov rule predicts that in HBr addition to propene (CH₃CH=CH₂), bromine adds to:', options: ['The carbon with more hydrogens (C1)', 'The carbon with fewer hydrogens (C2)', 'Both equally', 'Only terminal carbon always'], answer: 1, chapter: 'Organic Reactions — Addition', year: '2023', difficulty: 'hard', explanation: 'Markovnikov\'s rule: H⁺ adds to the carbon with more H (C1), and Br⁻ adds to C2 (fewer H). Product: CH₃CHBrCH₃ (2-bromopropane). Reason: C2 carbocation (secondary) is more stable than C1 (primary). Anti-Markovnikov addition occurs via radical mechanism (peroxides).' },
      { id: 'mx-chem-2', text: 'Which of the following is an example of a π bond?', options: ['The bond in H₂', 'The second bond in ethylene (C=C)', 'The bond in NaCl', 'The O-H bond in water'], answer: 1, chapter: 'Chemical Bonding', year: '2022', difficulty: 'medium', explanation: 'A π bond is formed by lateral (sideways) overlap of unhybridised p orbitals above and below the molecular axis. The double bond C=C consists of 1σ (end-to-end overlap) + 1π (lateral overlap). H₂ has only 1σ bond; NaCl has ionic bond; O-H is a polar σ bond.' },
    ],
    math: [
      { id: 'mx-math-1', text: 'The dot product of vectors A = (3,4) and B = (1,2) is:', options: ['5', '11', '7', '14'], answer: 1, chapter: 'Vectors', year: '2023', difficulty: 'easy', explanation: 'A·B = A_xB_x + A_yB_y = 3×1 + 4×2 = 3 + 8 = 11. The dot product gives a scalar. A·B = |A||B|cosθ, so cosθ = 11/(5×√5) = 11/(5√5). If A·B = 0, vectors are perpendicular. Cross product A×B gives a vector perpendicular to both.' },
      { id: 'mx-math-2', text: 'The general term of a geometric progression with first term a and common ratio r is:', options: ['a + (n-1)d', 'arⁿ', 'arⁿ⁻¹', 'a(n-1)r'], answer: 2, chapter: 'Sequences & Series', year: '2022', difficulty: 'easy', explanation: 'General term (nth term) of GP: Tₙ = arⁿ⁻¹. T₁ = ar⁰ = a, T₂ = ar¹, T₃ = ar². For AP: Tₙ = a + (n-1)d. Sum of GP: Sₙ = a(rⁿ−1)/(r−1) for r≠1. If |r|<1 and n→∞: S∞ = a/(1−r).' },
    ],
    english: [
      { id: 'mx-eng-1', text: 'The phrase "to burn the midnight oil" means:', options: ['To waste electricity', 'To work late into the night', 'To set things on fire', 'To cook at night'], answer: 1, chapter: 'Idioms & Phrases', year: '2023', difficulty: 'easy', explanation: '"Burn the midnight oil" = to work or study late into the night. Origin: before electricity, people used oil lamps to work at night — burning oil past midnight signified very late work. Engineering exam candidates will recognise this idiom all too well!' },
    ],
    gk: [
      { id: 'mx-gk-1', text: 'The speed of light in vacuum is approximately:', options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10¹² m/s'], answer: 1, chapter: 'Physical Constants', year: '2023', difficulty: 'easy', explanation: 'c ≈ 3×10⁸ m/s = 300,000 km/s. More precisely: c = 2.998×10⁸ m/s. Light takes ~8.3 minutes to travel from the Sun to Earth (1.5×10¹¹ m). In glass with refractive index n=1.5: speed = c/n = 2×10⁸ m/s.' },
      { id: 'mx-gk-2', text: 'How many bits are in one byte?', options: ['4', '8', '16', '32'], answer: 1, chapter: 'Digital Technology', year: '2022', difficulty: 'easy', explanation: '1 Byte = 8 bits. A bit (binary digit) is 0 or 1. A byte can store 2⁸ = 256 different values. Storage: 1 KB = 1024 B, 1 MB = 1024 KB, 1 GB = 1024 MB. Modern computers are 64-bit, meaning the CPU processes 64 bits (8 bytes) at a time.' },
    ],
  },
}

// ─── WRITTEN QUESTIONS (paid only) ───────────────────────────────────────────
const writtenQuestions = {
  buet: [
    { id: 'w-bu-1', type: 'short', marks: 5, text: 'State and derive the equation for the range of a projectile launched at angle θ with initial speed u on level ground. For what angle is range maximum? Show all working.', subject: 'Physics', chapter: 'Projectile Motion', year: '2023' },
    { id: 'w-bu-2', type: 'creative', marks: 10, text: 'Stem: A 10 μF capacitor is charged to 100V, then connected in parallel with an uncharged 5 μF capacitor.\n\n(a) What was the initial energy stored in the first capacitor? (b) Find the common voltage after connection. (c) Calculate the final energy. (d) Account for the energy difference — where does it go?', subject: 'Physics', chapter: 'Capacitance', year: '2022' },
    { id: 'w-bu-3', type: 'creative', marks: 10, text: 'Stem: Consider the reaction: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) ΔH = −92 kJ/mol\n\n(a) Define Le Chatelier\'s Principle. (b) What happens to the equilibrium if pressure is increased? (c) How does temperature affect the yield of NH₃? (d) Explain why the Haber process uses a catalyst, moderate temperature and high pressure — and the engineering trade-offs involved.', subject: 'Chemistry', chapter: 'Chemical Equilibrium', year: '2023' },
  ],
  kuet: [
    { id: 'w-ku-1', type: 'short', marks: 5, text: 'A resistance of 4Ω and 6Ω are connected in parallel. This combination is connected in series with a 2Ω resistor and a battery of EMF 12V (internal resistance 0.4Ω). Calculate: (i) equivalent resistance, (ii) total current, (iii) voltage across the parallel combination.', subject: 'Physics', chapter: 'Electric Circuits', year: '2023' },
    { id: 'w-ku-2', type: 'creative', marks: 10, text: 'Stem: The position-time equation of a particle is: x = 3t³ − 12t² + 9t + 2 (x in metres, t in seconds)\n\n(a) Find the velocity at t = 2s. (b) Find the acceleration at t = 3s. (c) At what times is the particle momentarily at rest? (d) Determine the displacement between t = 1s and t = 4s and comment on whether the particle changes direction.', subject: 'Math/Physics', chapter: 'Kinematics & Calculus', year: '2022' },
  ],
  ruet: [
    { id: 'w-ru-1', type: 'short', marks: 5, text: 'Explain Young\'s double slit experiment. Derive the expression for fringe width. How would you use this experiment to determine the wavelength of a light source?', subject: 'Physics', chapter: 'Wave Optics', year: '2023' },
    { id: 'w-ru-2', type: 'creative', marks: 10, text: 'Stem: Balance the following redox reaction in acidic medium by the half-reaction method:\nMnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺\n\n(a) Identify which species is oxidised and which is reduced. (b) Write the separate half-reactions. (c) Balance each half-reaction for mass and charge. (d) Combine to give the balanced ionic equation and state the stoichiometric ratio of MnO₄⁻ to Fe²⁺.', subject: 'Chemistry', chapter: 'Redox Reactions', year: '2022' },
  ],
  cuet: [
    { id: 'w-cu-1', type: 'short', marks: 5, text: 'Evaluate the definite integral ∫₀^{π/2} sin²(x) dx using the identity sin²x = (1 − cos2x)/2. Hence find ∫₀^{π/2} cos²(x) dx without further integration.', subject: 'Math', chapter: 'Integration', year: '2023' },
    { id: 'w-cu-2', type: 'creative', marks: 10, text: 'Stem: A block of mass 2 kg on a frictionless incline at 30° is connected via a massless string over a frictionless pulley to a hanging mass of 1 kg.\n\n(a) Draw the free-body diagrams for both masses. (b) Write Newton\'s second law equations for each mass. (c) Find the acceleration of the system. (d) Find the tension in the string. (e) If the incline has a coefficient of kinetic friction μ_k = 0.1, how does the acceleration change?', subject: 'Physics', chapter: 'Newton\'s Laws & Friction', year: '2022' },
  ],
  mixed: [
    { id: 'w-mx-1', type: 'short', marks: 5, text: 'Find the equation of the tangent and normal to the curve y = x³ − 2x + 1 at the point (1, 0). Show all steps and verify your answer.', subject: 'Math', chapter: 'Differentiation Applications', year: '2023' },
    { id: 'w-mx-2', type: 'creative', marks: 10, text: 'Stem: Compare and contrast the four main engineering universities in Bangladesh — BUET, KUET, RUET and CUET.\n\n(a) List the admission test subjects for each university. (b) Compare their founding years and locations. (c) What engineering disciplines are they most known for? (d) If you could attend any one and why — make a reasoned argument based on academic strengths, location, and career prospects.', subject: 'General Knowledge', chapter: 'Engineering Education in Bangladesh', year: '2022' },
  ],
}

// ─── EXAM CONFIGURATIONS ─────────────────────────────────────────────────────
const examTypes = {
  buet: {
    label: 'BUET', fullLabel: 'Bangladesh Univ. of Engineering & Technology',
    icon: '🏛', authority: 'Dhaka — Admission Test',
    totalMcq: 30, mcqDuration: 60,
    writtenQuestions: 3, writtenDuration: 120,
    passScore: 40,
    color: '#2563eb',
    subjects: { physics: 8, chemistry: 6, math: 8, english: 2, gk: 2 },
    subjectWeights: { physics: '40%', chemistry: '30%', math: '30%' },
    noteText: 'Negative marking: −0.25 per wrong answer',
    hasNegativeMarking: true,
  },
  kuet: {
    label: 'KUET', fullLabel: 'Khulna Univ. of Engineering & Technology',
    icon: '⚙️', authority: 'Khulna — Admission Test',
    totalMcq: 28, mcqDuration: 55,
    writtenQuestions: 2, writtenDuration: 90,
    passScore: 40,
    color: '#059669',
    subjects: { physics: 8, chemistry: 6, math: 8, english: 2, gk: 1 },
    subjectWeights: { physics: '40%', chemistry: '30%', math: '30%' },
    noteText: 'Negative marking: −0.25 per wrong answer',
    hasNegativeMarking: true,
  },
  ruet: {
    label: 'RUET', fullLabel: 'Rajshahi Univ. of Engineering & Technology',
    icon: '🔬', authority: 'Rajshahi — Admission Test',
    totalMcq: 28, mcqDuration: 55,
    writtenQuestions: 2, writtenDuration: 90,
    passScore: 40,
    color: '#d97706',
    subjects: { physics: 8, chemistry: 6, math: 8, english: 1, gk: 1 },
    subjectWeights: { physics: '40%', chemistry: '30%', math: '30%' },
    noteText: 'Negative marking: −0.25 per wrong answer',
    hasNegativeMarking: true,
  },
  cuet: {
    label: 'CUET', fullLabel: 'Chittagong Univ. of Engineering & Technology',
    icon: '🌊', authority: 'Chittagong — Admission Test',
    totalMcq: 28, mcqDuration: 55,
    writtenQuestions: 2, writtenDuration: 90,
    passScore: 40,
    color: '#7c3aed',
    subjects: { physics: 7, chemistry: 5, math: 8, english: 1, gk: 2 },
    subjectWeights: { physics: '40%', chemistry: '30%', math: '30%' },
    noteText: 'Negative marking: −0.25 per wrong answer',
    hasNegativeMarking: true,
  },
  mixed: {
    label: 'MIXED', fullLabel: 'Combined Practice — All 4 Universities',
    icon: '🎯', authority: 'All Engineering Universities',
    totalMcq: 30, mcqDuration: 60,
    writtenQuestions: 2, writtenDuration: 90,
    passScore: 40,
    color: '#0f172a',
    subjects: { physics: 8, chemistry: 6, math: 8, english: 2, gk: 2 },
    subjectWeights: { physics: '40%', chemistry: '30%', math: '30%' },
    noteText: 'Negative marking: −0.25 per wrong answer',
    hasNegativeMarking: true,
  },
}

const subjectLabels = {
  physics: 'Physics', chemistry: 'Chemistry', math: 'Mathematics',
  english: 'English', gk: 'General Knowledge',
}

const subjectIcons = {
  physics: '⚡', chemistry: '⚗️', math: '∑', english: '📝', gk: '🌐',
}

// ─── STATE ───────────────────────────────────────────────────────────────────
const phase = ref('setup')
const selectedUnivKey = ref(null)
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

const writtenAnswers = ref({})
const writtenTimeLeft = ref(0)
const writtenTimerInterval = ref(null)
const writtenQuestionsList = ref([])

// ─── COMPUTED ────────────────────────────────────────────────────────────────
const examConfig = computed(() => selectedUnivKey.value ? examTypes[selectedUnivKey.value] : null)

const canStart = computed(() => !!selectedUnivKey.value)

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
  const rawScore = correct - (examConfig.value.hasNegativeMarking ? wrong * 0.25 : 0)
  const pct = total ? Math.max(0, (rawScore / total) * 100) : 0
  return { correct, wrong, skipped, total, rawScore: rawScore.toFixed(2), pct: pct.toFixed(1) }
})

const gradeInfo = computed(() => {
  const p = parseFloat(scoreData.value.pct || 0)
  if (p >= 85) return { letter: 'A+', label: 'Outstanding', cls: 'grade-high' }
  if (p >= 75) return { letter: 'A', label: 'Excellent', cls: 'grade-high' }
  if (p >= 65) return { letter: 'B+', label: 'Very Good', cls: 'grade-mid' }
  if (p >= 55) return { letter: 'B', label: 'Good', cls: 'grade-mid' }
  if (p >= 40) return { letter: 'C', label: 'Pass', cls: 'grade-low' }
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
  if (!examConfig.value) return []
  return Object.keys(examConfig.value.subjects).map(subj => {
    const qs = questions.value.filter(q => q.subject === subj)
    const correct = qs.filter(q => answers.value[q.id] === q.answer).length
    const wrong = qs.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer).length
    const skipped = qs.filter(q => answers.value[q.id] === undefined).length
    const total = qs.length
    const pct = total ? (correct / total * 100).toFixed(1) : '0.0'
    return { subj, label: subjectLabels[subj] || subj, icon: subjectIcons[subj] || '•', correct, wrong, skipped, total, pct }
  }).filter(s => s.total > 0)
})

const writtenTotalMarks = computed(() => writtenQuestionsList.value.reduce((sum, q) => sum + q.marks, 0))

// ─── EXAM LOGIC ──────────────────────────────────────────────────────────────
function buildMcqQuestions() {
  const bank = questionBank[selectedUnivKey.value] || {}
  const pool = []
  const subjects = examConfig.value.subjects
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
  const wqs = writtenQuestions[selectedUnivKey.value] || []
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
  selectedUnivKey.value = null
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
          <h1 class="page-title">University <span class="text-outline">Admission Test</span></h1>
          <p class="page-desc">Full mock admission tests for BUET, KUET, RUET, CUET & combined practice. Covers Physics, Chemistry, Mathematics, English and GK with negative marking simulation.</p>
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

      <!-- Negative Marking Alert -->
      <div class="neg-marking-alert">
        <span class="neg-icon">⚠</span>
        <span>All engineering university exams apply <strong>negative marking: −0.25 per wrong answer</strong>. Think before you guess!</span>
      </div>

      <!-- University Selection -->
      <div class="type-section">
        <div class="section-label-row">
          <span class="section-pill">SELECT UNIVERSITY / MODE</span>
          <div class="section-line"></div>
        </div>
        <div class="univ-grid">
          <div
            v-for="(config, key) in examTypes"
            :key="key"
            class="univ-card"
            :class="{ 'univ-card--active': selectedUnivKey === key }"
            :style="selectedUnivKey === key ? `--univ-accent: ${config.color}` : ''"
            @click="selectedUnivKey = key"
          >
            <div class="univ-card-corner tl"></div>
            <div class="univ-card-corner br"></div>
            <div class="univ-top">
              <span class="univ-icon">{{ config.icon }}</span>
              <div>
                <div class="univ-label">{{ config.label }}</div>
                <div class="univ-authority">{{ config.authority }}</div>
              </div>
              <span v-if="selectedUnivKey === key" class="univ-check">✓</span>
            </div>
            <div class="univ-full">{{ config.fullLabel }}</div>
            <div class="univ-meta-row">
              <span class="meta-pill">{{ config.totalMcq }}Q MCQ</span>
              <span class="meta-pill">{{ config.mcqDuration }} min</span>
              <span class="meta-pill meta-pill--neg">−¼ negative</span>
              <span v-if="isPaid" class="meta-pill meta-pill--written">+Written</span>
            </div>
            <div class="univ-subjects">
              <span v-for="(count, subj) in config.subjects" :key="subj" class="subj-chip">
                {{ subjectIcons[subj] }} {{ subjectLabels[subj] }} ×{{ count }}
              </span>
            </div>
            <div class="univ-select-label">
              <span v-if="selectedUnivKey === key">✓ SELECTED</span>
              <span v-else>SELECT →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Exam Structure Preview -->
      <transition name="slide-down">
        <div v-if="selectedUnivKey" class="expect-panel">
          <div class="expect-header">EXAM STRUCTURE — {{ examConfig.label }}</div>
          <div class="expect-grid">
            <div class="expect-item">
              <div class="expect-label">SECTION 1 — MCQ</div>
              <div class="expect-val">{{ examConfig.totalMcq }} Questions</div>
              <div class="expect-sub">{{ examConfig.mcqDuration }} min · Negative marking (−0.25)</div>
            </div>
            <div class="expect-item" :class="{ 'expect-item--locked': !isPaid }">
              <div class="expect-label">SECTION 2 — WRITTEN {{ !isPaid ? '🔒 PRO' : '' }}</div>
              <div class="expect-val">{{ examConfig.writtenQuestions }} Questions</div>
              <div class="expect-sub">{{ examConfig.writtenDuration }} min · Short answer & structured problems · Image upload</div>
            </div>
          </div>
          <div class="subject-weight-row">
            <span class="sw-label">SUBJECT WEIGHTAGE:</span>
            <span v-for="(w, s) in examConfig.subjectWeights" :key="s" class="sw-chip">
              {{ subjectLabels[s] || s }}: <strong>{{ w }}</strong>
            </span>
          </div>
        </div>
      </transition>

      <!-- CTA Bar -->
      <div v-if="canStart" class="cta-bar">
        <div class="cta-left">
          <div class="cta-name">{{ examConfig.label }} — {{ examConfig.fullLabel }}</div>
          <div class="cta-meta">
            <span>{{ examConfig.totalMcq }} MCQ Questions</span>
            <span>·</span>
            <span>{{ examConfig.mcqDuration }} min</span>
            <span>·</span>
            <span class="neg-note">⚠ −0.25 negative marking</span>
            <template v-if="isPaid">
              <span>·</span>
              <span class="written-note">+Written {{ examConfig.writtenDuration }} min</span>
            </template>
          </div>
        </div>
        <div class="cta-right">
          <button class="iso-btn iso-btn--ghost" @click="selectedUnivKey = null">Cancel</button>
          <button class="iso-btn iso-btn--fill" @click="showStartModal = true">Start Exam →</button>
        </div>
      </div>
    </div><!-- /setup -->

    <!-- ══════════════════ START MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showStartModal" class="modal-backdrop" @click.self="showStartModal = false">
        <div class="modal start-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="start-modal-icon">⚙️</div>
          <div class="start-modal-title">READY TO START?</div>
          <div class="start-modal-exam">{{ examConfig?.label }} — {{ examConfig?.fullLabel }}</div>
          <div class="start-modal-grid">
            <div class="sm-stat"><span class="sm-val">{{ examConfig?.totalMcq }}</span><span>MCQ Questions</span></div>
            <div class="sm-stat"><span class="sm-val">{{ examConfig?.mcqDuration }}</span><span>Minutes (MCQ)</span></div>
            <div v-if="isPaid" class="sm-stat"><span class="sm-val">{{ examConfig?.writtenQuestions }}</span><span>Written Qs</span></div>
            <div v-if="isPaid" class="sm-stat"><span class="sm-val">{{ examConfig?.writtenDuration }}</span><span>Minutes (Written)</span></div>
          </div>
          <div class="start-modal-rules">
            <div class="sm-rule">✓ Each correct answer = +1 mark</div>
            <div class="sm-rule sm-rule--neg">✗ Each wrong answer = −0.25 mark (negative marking!)</div>
            <div class="sm-rule">○ Skipped answers = 0 marks (safe)</div>
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
      <div class="exam-topbar">
        <div class="topbar-left">
          <span class="topbar-chip">{{ examConfig.label }}</span>
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

      <!-- Question Palette -->
      <div class="q-palette-wrap">
        <div class="q-palette">
          <button
            v-for="(q, i) in questions"
            :key="q.id"
            class="q-dot"
            :class="{ answered: answers[q.id] !== undefined, flagged: flagged.has(q.id), current: currentIdx === i }"
            @click="scrollToQuestion(i)"
            :title="`Q${i+1}: ${subjectLabels[q.subject]}`"
          >{{ i+1 }}</button>
        </div>
        <div class="palette-legend">
          <span class="legend-item"><span class="legend-dot answered"></span>Answered</span>
          <span class="legend-item"><span class="legend-dot flagged"></span>Flagged</span>
          <span class="legend-item"><span class="legend-dot"></span>Unanswered</span>
          <span class="palette-neg-hint">⚠ Skip if unsure — wrong = −0.25</span>
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
              <span class="q-subject-icon">{{ subjectIcons[q.subject] }}</span>
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
            <span class="q-unanswered-note" v-else>Not yet answered · skipping is safe</span>
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
          <div class="end-sub">{{ examConfig?.label }} Admission Test</div>
          <div class="end-stats-grid">
            <div class="end-stat"><span class="end-val answered-color">{{ answeredCount }}</span><span>Answered</span></div>
            <div class="end-stat"><span class="end-val flagged-color">{{ flaggedCount }}</span><span>Flagged</span></div>
            <div class="end-stat"><span class="end-val skipped-color">{{ questions.length - answeredCount }}</span><span>Skipped</span></div>
          </div>
          <div v-if="flaggedCount > 0" class="end-warn">⚠ {{ flaggedCount }} flagged question(s) still pending.</div>
          <div class="end-neg-note">⚠ Negative marking applies — wrong answers deduct 0.25 marks each.</div>
          <div v-if="isPaid" class="end-written-note">Written section begins immediately after MCQ submission.</div>
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
        <div class="wi-subtitle">Now starting the Written / Structured Section</div>
        <div class="wi-meta-grid">
          <div class="wi-meta-item"><div class="wi-meta-val">{{ writtenQuestionsList.length }}</div><div class="wi-meta-lbl">Questions</div></div>
          <div class="wi-meta-item"><div class="wi-meta-val">{{ examConfig.writtenDuration }}</div><div class="wi-meta-lbl">Minutes</div></div>
          <div class="wi-meta-item"><div class="wi-meta-val">{{ writtenTotalMarks }}</div><div class="wi-meta-lbl">Total Marks</div></div>
        </div>
        <div class="wi-rules">
          <div class="wi-rule">✓ Mix of short answer and structured multi-part problems</div>
          <div class="wi-rule">✓ You may upload a diagram or working image for any question</div>
          <div class="wi-rule">✓ No negative marking in the written section</div>
          <div class="wi-rule">✓ Show all working clearly for full marks</div>
        </div>
        <div class="wi-question-preview">
          <div class="wi-preview-label">QUESTION PREVIEW</div>
          <div v-for="(q, i) in writtenQuestionsList" :key="q.id" class="wi-preview-item">
            <span class="wi-preview-num">Q{{ i+1 }}</span>
            <span class="wi-preview-subj">{{ q.subject }}</span>
            <span class="wi-preview-type" :class="q.type === 'creative' ? 'type-creative' : 'type-short'">{{ q.type === 'creative' ? 'Structured' : 'Short Answer' }}</span>
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
          <span class="topbar-chip">{{ examConfig.label }}</span>
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
              <span :class="['wq-type', q.type === 'creative' ? 'type-creative' : 'type-short']">{{ q.type === 'creative' ? 'Structured' : 'Short Answer' }}</span>
              <span class="wq-year">{{ q.year }}</span>
            </div>
            <span class="wq-marks-badge">{{ q.marks }} marks</span>
          </div>
          <div class="wq-text">{{ q.text }}</div>
          <div class="wq-answer-section">
            <label class="wq-answer-label">YOUR SOLUTION</label>
            <textarea
              class="wq-textarea"
              :placeholder="q.type === 'creative'
                ? 'Write your solution here. Address each part (a), (b), (c), (d) clearly. Show all working steps...'
                : 'Write your answer here. Show all derivations and working...'"
              v-model="writtenAnswers[q.id].text"
              rows="9"
            ></textarea>
            <div class="wq-char-count">{{ writtenAnswers[q.id]?.text?.length || 0 }} characters</div>
          </div>
          <div class="wq-image-section">
            <div class="wq-image-label">
              <span>ATTACH DIAGRAM / WORKING</span>
              <span class="wq-image-hint">Optional — upload handwritten working or a diagram</span>
            </div>
            <div v-if="!writtenAnswers[q.id]?.imageUrl" class="wq-image-dropzone" @click="triggerImageUpload(q.id)">
              <div class="wq-dropzone-icon">📎</div>
              <div class="wq-dropzone-text">Click to upload image</div>
              <div class="wq-dropzone-hint">JPG, PNG — max 5MB</div>
            </div>
            <div v-else class="wq-image-preview">
              <img :src="writtenAnswers[q.id].imageUrl" alt="Uploaded working" class="wq-preview-img" />
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
          <div class="score-exam-label">{{ examConfig?.label }} Admission Test</div>
          <div class="score-badge-row">
            <span class="score-section-tag">MCQ</span>
            <span v-if="isPaid && writtenQuestionsList.length > 0" class="score-section-tag score-section-written">+ Written</span>
            <span class="score-section-tag score-neg-tag">−¼ Negative</span>
          </div>
          <div class="score-pct" :class="gradeInfo.cls">
            {{ scoreData.pct }}<span class="score-pct-sym">%</span>
          </div>
          <div class="score-raw">
            Raw Score: <strong>{{ scoreData.rawScore }} / {{ scoreData.total }}</strong>
            <span class="score-raw-sub">(+{{ scoreData.correct }} correct, −{{ (scoreData.wrong * 0.25).toFixed(2) }} penalty)</span>
          </div>
          <div class="score-status" :class="parseFloat(scoreData.pct) >= examConfig.passScore ? 'status-pass' : 'status-fail'">
            {{ parseFloat(scoreData.pct) >= examConfig.passScore ? '✓ QUALIFIED' : '✗ NOT QUALIFIED' }} · Cutoff: {{ examConfig.passScore }}%
          </div>
        </div>
        <div class="score-hero-right">
          <div class="grade-display" :class="gradeInfo.cls">
            <div class="grade-letter">{{ gradeInfo.letter }}</div>
            <div class="grade-label">{{ gradeInfo.label }}</div>
          </div>
          <div class="score-breakdown">
            <div class="sc-item"><span class="sc-dot correct-dot"></span><span>Correct</span><strong>{{ scoreData.correct }}</strong></div>
            <div class="sc-item"><span class="sc-dot wrong-dot"></span><span>Wrong</span><strong>{{ scoreData.wrong }}</strong></div>
            <div class="sc-item"><span class="sc-dot skip-dot"></span><span>Skipped</span><strong>{{ scoreData.skipped }}</strong></div>
          </div>
        </div>
      </div>

      <!-- Subject Breakdown -->
      <div class="subject-breakdown-section">
        <div class="section-label-row">
          <span class="section-pill">SUBJECT PERFORMANCE</span>
          <div class="section-line"></div>
        </div>
        <div class="subject-breakdown-grid">
          <div v-for="s in subjectBreakdown" :key="s.subj" class="sb-card">
            <div class="sb-icon">{{ s.icon }}</div>
            <div class="sb-label">{{ s.label }}</div>
            <div class="sb-pct" :class="parseFloat(s.pct) >= 60 ? 'grade-high' : parseFloat(s.pct) >= 40 ? 'grade-mid' : 'grade-fail'">{{ s.pct }}%</div>
            <div class="sb-bar-track"><div class="sb-bar" :style="{ width: s.pct + '%' }"></div></div>
            <div class="sb-stats">
              <span class="sb-correct">✓{{ s.correct }}</span>
              <span class="sb-wrong">✗{{ s.wrong }}</span>
              <span class="sb-skip">○{{ s.skipped }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Section -->
      <div class="review-section">
        <div class="review-header">
          <div class="section-label-row">
            <span class="section-pill">QUESTION REVIEW</span>
            <div class="section-line"></div>
          </div>
          <div class="review-filters">
            <!-- Subject filter -->
            <div class="subject-filter-bar">
              <button class="sf-btn" :class="{ 'sf-btn--active': subjectFilter === 'all' }" @click="subjectFilter = 'all'">All Subjects</button>
              <button
                v-for="(count, subj) in examConfig.subjects" :key="subj"
                class="sf-btn"
                :class="{ 'sf-btn--active': subjectFilter === subj }"
                @click="subjectFilter = subj"
              >{{ subjectIcons[subj] }} {{ subjectLabels[subj] }}</button>
            </div>
            <!-- Tab filter -->
            <div class="review-tabs">
              <button class="rev-tab" :class="{ 'rev-tab--active': filterTab === 'all' }" @click="filterTab = 'all'">All <span class="rev-count">{{ filteredCounts.all }}</span></button>
              <button class="rev-tab rev-correct" :class="{ 'rev-tab--active': filterTab === 'correct' }" @click="filterTab = 'correct'">Correct <span class="rev-count">{{ filteredCounts.correct }}</span></button>
              <button class="rev-tab rev-wrong" :class="{ 'rev-tab--active': filterTab === 'wrong' }" @click="filterTab = 'wrong'">Wrong <span class="rev-count">{{ filteredCounts.wrong }}</span></button>
              <button class="rev-tab rev-skip" :class="{ 'rev-tab--active': filterTab === 'skipped' }" @click="filterTab = 'skipped'">Skipped <span class="rev-count">{{ filteredCounts.skipped }}</span></button>
            </div>
          </div>
        </div>

        <div class="review-list">
          <div v-for="(q, i) in filteredReview" :key="q.id" class="rev-card"
            :class="{
              'rev-correct': answers[q.id] === q.answer,
              'rev-wrong': answers[q.id] !== undefined && answers[q.id] !== q.answer,
              'rev-skip': answers[q.id] === undefined
            }"
          >
            <div class="rev-card-header">
              <div class="rev-meta">
                <span class="rv-status-icon">{{ answers[q.id] === q.answer ? '✓' : answers[q.id] !== undefined ? '✗' : '○' }}</span>
                <span class="q-subject-icon">{{ subjectIcons[q.subject] }}</span>
                <span class="q-subject">{{ subjectLabels[q.subject] || q.subject }}</span>
                <span class="q-chapter">{{ q.chapter }}</span>
                <span :class="['q-diff', diffClass(q.difficulty)]">{{ q.difficulty.toUpperCase() }}</span>
                <span class="q-year">{{ q.year }}</span>
              </div>
              <div v-if="answers[q.id] !== undefined && answers[q.id] !== q.answer" class="rev-neg-badge">−0.25 penalty</div>
            </div>
            <div class="rev-q-text">{{ q.text }}</div>
            <div class="rev-options">
              <div v-for="(opt, idx) in q.options" :key="idx" class="rev-opt" :class="reviewOptClass(q, idx)">
                <span class="opt-letter">{{ ['A','B','C','D'][idx] }}</span>
                <span class="opt-text">{{ opt }}</span>
                <span v-if="idx === q.answer" class="rc-correct-label">✓ Correct</span>
                <span v-if="answers[q.id] === idx && idx !== q.answer" class="rc-wrong-label">✗ Your answer</span>
              </div>
            </div>
            <div class="exp-block">
              <div class="exp-label">EXPLANATION</div>
              <div class="exp-text">{{ q.explanation }}</div>
            </div>
          </div>
        </div>

        <div class="results-actions">
          <button class="iso-btn iso-btn--ghost" @click="resetToSetup">← Back to Setup</button>
          <button class="iso-btn iso-btn--fill" @click="startExam">Retry Exam →</button>
        </div>
      </div>
    </div><!-- /results -->

  </div>
</template>

<style scoped>
/* ─── CSS VARIABLES ─────────────────────────────────────────────────────────── */
:root {
  --bg: #0a0e1a;
  --surface: #0f1525;
  --surface2: #151d2e;
  --border: #1e2d47;
  --border-light: #243552;
  --accent: #3b82f6;
  --accent2: #06b6d4;
  --accent-glow: rgba(59,130,246,0.15);
  --green: #22c55e;
  --red: #ef4444;
  --orange: #f59e0b;
  --text: #e8edf5;
  --gray: #94a3b8;
  --dim: #64748b;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-sans: 'IBM Plex Sans', 'DM Sans', system-ui, sans-serif;
  --font-display: 'Space Grotesk', 'IBM Plex Sans', sans-serif;
  --univ-accent: var(--accent);
}

/* ─── BASE ─────────────────────────────────────────────────────────────────── */
.exam-page {
  max-width: 900px; margin: 0 auto;
  padding: 32px 20px 100px;
  font-family: var(--font-sans); color: var(--text);
  background: var(--bg); min-height: 100vh;
}

/* ─── PAGE HEADER ─────────────────────────────────────────────────────────── */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 28px;
}
.page-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.15em;
  color: var(--accent2); text-transform: uppercase; margin-bottom: 8px;
}
.chip-dot { width: 6px; height: 6px; background: var(--accent2); border-radius: 50%; animation: pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
.page-title {
  font-family: var(--font-display); font-size: 2.2rem; font-weight: 700; line-height: 1.1;
  margin: 0 0 8px; color: var(--text); letter-spacing: -0.02em;
}
.text-outline {
  -webkit-text-stroke: 1px var(--accent); color: transparent;
}
.page-desc { font-size: 0.82rem; color: var(--gray); line-height: 1.6; max-width: 520px; }

/* ─── TIER BADGE ──────────────────────────────────────────────────────────── */
.tier-badge {
  display: flex; align-items: center; gap: 12px; padding: 14px 18px;
  border: 1px solid var(--border); border-radius: 8px; background: var(--surface); min-width: 240px;
}
.tier-pro { border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.06); }
.tier-free { border-color: var(--border); }
.tier-icon { font-size: 1.3rem; }
.tier-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; color: var(--accent); }
.tier-sub { font-size: 0.7rem; color: var(--dim); margin-top: 2px; }
.tier-toggle { font-size: 0.55rem !important; padding: 5px 10px !important; margin-left: auto; white-space: nowrap; }

/* ─── NEGATIVE MARKING ALERT ─────────────────────────────────────────────── */
.neg-marking-alert {
  display: flex; align-items: center; gap: 10px;
  background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.3);
  border-radius: 8px; padding: 12px 16px; margin-bottom: 28px;
  font-size: 0.8rem; color: var(--orange); line-height: 1.5;
}
.neg-icon { font-size: 1rem; flex-shrink: 0; }
.neg-marking-alert strong { font-weight: 700; }

/* ─── SECTION LABELS ─────────────────────────────────────────────────────── */
.section-label-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.section-pill {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.18em;
  color: var(--dim); white-space: nowrap; text-transform: uppercase;
}
.section-line { flex: 1; height: 1px; background: var(--border); }
.type-section { margin-bottom: 28px; }

/* ─── UNIVERSITY GRID ───────────────────────────────────────────────────── */
.univ-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px;
}
.univ-card {
  position: relative; padding: 20px; background: var(--surface);
  border: 1px solid var(--border); border-radius: 10px; cursor: pointer;
  transition: all 0.2s ease; overflow: hidden;
}
.univ-card:hover { border-color: var(--border-light); background: var(--surface2); }
.univ-card--active {
  border-color: var(--univ-accent);
  background: color-mix(in srgb, var(--univ-accent) 8%, var(--surface));
  box-shadow: 0 0 0 1px var(--univ-accent), 0 4px 24px rgba(0,0,0,0.3);
}
.univ-card-corner {
  position: absolute; width: 12px; height: 12px;
  border-color: var(--border-light); border-style: solid;
}
.univ-card--active .univ-card-corner { border-color: var(--univ-accent); }
.univ-card-corner.tl { top: 4px; left: 4px; border-width: 1px 0 0 1px; }
.univ-card-corner.br { bottom: 4px; right: 4px; border-width: 0 1px 1px 0; }
.univ-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.univ-icon { font-size: 1.5rem; }
.univ-label { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text); }
.univ-authority { font-size: 0.65rem; color: var(--dim); }
.univ-check { margin-left: auto; font-size: 0.9rem; color: var(--univ-accent, var(--accent)); font-weight: 700; }
.univ-full { font-size: 0.72rem; color: var(--gray); margin-bottom: 12px; }
.univ-meta-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
.meta-pill {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.08em;
  padding: 3px 7px; border: 1px solid var(--border); border-radius: 4px; color: var(--dim);
}
.meta-pill--neg { border-color: rgba(239,68,68,0.3); color: var(--red); background: rgba(239,68,68,0.06); }
.meta-pill--written { border-color: rgba(59,130,246,0.3); color: var(--accent); background: rgba(59,130,246,0.06); }
.univ-subjects { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
.subj-chip {
  font-size: 0.6rem; padding: 2px 7px; background: rgba(255,255,255,0.04);
  border: 1px solid var(--border); border-radius: 20px; color: var(--gray);
}
.univ-select-label {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em;
  color: var(--dim); text-align: right;
}
.univ-card--active .univ-select-label { color: var(--univ-accent, var(--accent)); }

/* ─── EXPECT PANEL ───────────────────────────────────────────────────────── */
.expect-panel {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 20px; margin-bottom: 24px;
}
.expect-header {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.15em;
  color: var(--dim); margin-bottom: 16px; text-transform: uppercase;
}
.expect-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
.expect-item {
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 14px;
}
.expect-item--locked { opacity: 0.5; }
.expect-label { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.12em; color: var(--dim); margin-bottom: 6px; }
.expect-val { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.expect-sub { font-size: 0.68rem; color: var(--dim); }
.subject-weight-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; border-top: 1px solid var(--border); padding-top: 14px; }
.sw-label { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.1em; color: var(--dim); }
.sw-chip { font-size: 0.72rem; color: var(--gray); }
.sw-chip strong { color: var(--accent2); }

/* ─── CTA BAR ─────────────────────────────────────────────────────────────── */
.cta-bar {
  position: sticky; bottom: 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: var(--surface); border: 1px solid var(--border-light); border-radius: 10px;
  padding: 16px 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.5);
  backdrop-filter: blur(12px);
}
.cta-name { font-size: 0.88rem; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.cta-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 0.72rem; color: var(--dim); }
.neg-note { color: var(--orange); }
.written-note { color: var(--accent); }
.cta-right { display: flex; gap: 10px; flex-shrink: 0; }

/* ─── BUTTONS ─────────────────────────────────────────────────────────────── */
.iso-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.08em;
  padding: 8px 16px; border-radius: 6px; border: 1px solid; cursor: pointer;
  transition: all 0.15s ease; text-transform: uppercase; white-space: nowrap;
}
.iso-btn--ghost { color: var(--gray); border-color: var(--border); background: transparent; }
.iso-btn--ghost:hover { color: var(--text); border-color: var(--border-light); background: var(--surface2); }
.iso-btn--fill { color: #fff; border-color: var(--accent); background: var(--accent); }
.iso-btn--fill:hover { background: #2563eb; border-color: #2563eb; }

/* ─── SLIDE TRANSITION ───────────────────────────────────────────────────── */
.slide-down-enter-active { transition: all 0.25s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-8px); }

/* ─── EXAM TOPBAR ─────────────────────────────────────────────────────────── */
.exam-topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 12px;
  background: var(--surface); border-bottom: 1px solid var(--border);
  padding: 10px 16px; margin: -32px -20px 20px;
}
.topbar-left { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.topbar-chip {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em;
  background: var(--accent); color: #fff; padding: 3px 8px; border-radius: 4px;
}
.topbar-section-badge {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.12em;
  background: var(--surface2); border: 1px solid var(--border); color: var(--gray);
  padding: 2px 8px; border-radius: 4px;
}
.topbar-written-badge { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); color: var(--accent); }
.topbar-prog { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); }
.topbar-center { flex: 1; }
.topbar-bar-track { height: 4px; background: var(--surface2); border-radius: 2px; overflow: hidden; }
.topbar-bar-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s ease; }
.written-fill { background: var(--accent2); }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.topbar-timer {
  font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: var(--green);
  background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); padding: 4px 10px; border-radius: 5px;
}
.topbar-timer.warning { color: var(--orange); background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); }
.topbar-timer.critical { color: var(--red); background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); animation: blink-timer 0.8s infinite; }
@keyframes blink-timer { 0%,100%{opacity:1} 50%{opacity:0.5} }
.topbar-end-btn { font-size: 0.55rem !important; padding: 5px 10px !important; }

/* ─── QUESTION PALETTE ───────────────────────────────────────────────────── */
.q-palette-wrap {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 8px; padding: 8px 12px; margin-bottom: 18px;
}
.q-palette { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; max-height: 80px; overflow-y: auto; }
.q-dot {
  width: 26px; height: 20px; border-radius: 3px; border: 1px solid var(--border);
  background: var(--surface); font-family: var(--font-mono); font-size: 0.52rem;
  color: var(--dim); cursor: pointer; transition: all 0.1s; display: flex; align-items: center; justify-content: center;
}
.q-dot.answered { background: var(--accent); border-color: var(--accent); color: #fff; }
.q-dot.flagged { background: rgba(245,158,11,0.15); border-color: var(--orange); color: var(--orange); }
.q-dot.current { box-shadow: 0 0 0 2px var(--accent2); }
.palette-legend { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.62rem; color: var(--dim); }
.legend-dot { width: 10px; height: 8px; border-radius: 2px; border: 1px solid var(--border); background: var(--surface); }
.legend-dot.answered { background: var(--accent); border-color: var(--accent); }
.legend-dot.flagged { background: rgba(245,158,11,0.15); border-color: var(--orange); }
.palette-neg-hint { margin-left: auto; font-family: var(--font-mono); font-size: 0.55rem; color: var(--orange); }

/* ─── QUESTION CARDS ─────────────────────────────────────────────────────── */
.questions-list { display: flex; flex-direction: column; gap: 14px; }
.q-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 20px; scroll-margin-top: 140px;
  transition: border-color 0.2s;
}
.q-card.card-current { border-color: var(--border-light); }
.q-card.card-answered { border-color: rgba(59,130,246,0.25); }
.q-card.card-flagged { border-color: rgba(245,158,11,0.3); }

.q-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
.q-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.q-num { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: var(--accent); }
.q-subject-icon { font-size: 0.85rem; }
.q-subject { font-size: 0.68rem; font-weight: 600; color: var(--text); }
.q-chapter { font-size: 0.65rem; color: var(--dim); background: var(--surface2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; }
.q-diff { font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.1em; padding: 2px 6px; border-radius: 3px; }
.diff-easy { background: rgba(34,197,94,0.1); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
.diff-med  { background: rgba(245,158,11,0.1); color: var(--orange); border: 1px solid rgba(245,158,11,0.2); }
.diff-hard { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
.q-year { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); }

.flag-btn {
  font-size: 0.62rem; padding: 4px 10px; border-radius: 5px;
  border: 1px solid var(--border); background: transparent; color: var(--dim); cursor: pointer;
  transition: all 0.15s;
}
.flag-btn:hover { border-color: var(--orange); color: var(--orange); }
.flag-btn.flag-active { border-color: var(--orange); color: var(--orange); background: rgba(245,158,11,0.1); }

.q-text { font-size: 0.88rem; line-height: 1.65; color: var(--text); margin-bottom: 16px; }

.q-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.q-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 7px; border: 1px solid var(--border);
  background: var(--bg); cursor: pointer; text-align: left; transition: all 0.15s; width: 100%;
}
.q-opt:hover { border-color: var(--border-light); background: var(--surface2); }
.q-opt.opt-selected { border-color: var(--accent); background: rgba(59,130,246,0.1); }
.opt-letter {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  color: var(--accent); width: 20px; flex-shrink: 0;
}
.opt-text { font-size: 0.82rem; color: var(--text); }

.q-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border); }
.q-answered-note { font-size: 0.65rem; color: var(--green); }
.q-unanswered-note { font-size: 0.65rem; color: var(--dim); }
.clear-btn { font-size: 0.6rem; color: var(--dim); background: none; border: none; cursor: pointer; }
.clear-btn:hover { color: var(--red); }

/* ─── SUBMIT BAR ─────────────────────────────────────────────────────────── */
.submit-bar {
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.submit-stats { display: flex; gap: 18px; font-size: 0.78rem; color: var(--gray); }
.submit-stats strong { color: var(--text); }
.submit-actions { display: flex; align-items: center; gap: 12px; }
.submit-written-note { font-size: 0.65rem; color: var(--accent); }
.written-submit-bar { margin-top: 14px; }

/* ─── MODAL ──────────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
}
.modal {
  position: relative; background: var(--surface); border: 1px solid var(--border-light);
  border-radius: 12px; padding: 32px; max-width: 440px; width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.modal-corner {
  position: absolute; width: 14px; height: 14px; border-color: var(--accent); border-style: solid;
}
.modal-corner.tl { top: 6px; left: 6px; border-width: 1px 0 0 1px; }
.modal-corner.br { bottom: 6px; right: 6px; border-width: 0 1px 1px 0; }

.start-modal-icon { font-size: 2rem; margin-bottom: 12px; }
.start-modal-title { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.2em; color: var(--dim); margin-bottom: 6px; }
.start-modal-exam { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 20px; }
.start-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.sm-stat {
  background: var(--bg); border: 1px solid var(--border); border-radius: 7px; padding: 12px;
  text-align: center; font-size: 0.65rem; color: var(--dim);
}
.sm-val { display: block; font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
.start-modal-rules { display: flex; flex-direction: column; gap: 7px; margin-bottom: 24px; }
.sm-rule { font-size: 0.75rem; color: var(--gray); }
.sm-rule--neg { color: var(--orange); font-weight: 600; }
.sm-rule--written { color: var(--accent); }
.sm-rule--free { color: var(--dim); }
.start-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

.end-title { font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.2em; color: var(--text); margin-bottom: 6px; }
.end-sub { font-size: 0.78rem; color: var(--dim); margin-bottom: 20px; }
.end-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 16px; }
.end-stat { background: var(--bg); border: 1px solid var(--border); border-radius: 7px; padding: 12px; text-align: center; font-size: 0.68rem; color: var(--dim); }
.end-val { display: block; font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; margin-bottom: 4px; }
.answered-color { color: var(--accent); }
.flagged-color { color: var(--orange); }
.skipped-color { color: var(--dim); }
.end-warn { font-size: 0.72rem; color: var(--orange); margin-bottom: 8px; }
.end-neg-note { font-size: 0.72rem; color: var(--red); margin-bottom: 8px; }
.end-written-note { font-size: 0.72rem; color: var(--accent); margin-bottom: 16px; }
.end-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── WRITTEN INTRO ─────────────────────────────────────────────────────── */
.written-intro-phase { display: flex; justify-content: center; padding: 40px 0; }
.wi-container {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 36px 32px; max-width: 560px; width: 100%; text-align: center;
}
.wi-icon { font-size: 2.5rem; margin-bottom: 12px; }
.wi-title { font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.2em; color: var(--dim); margin-bottom: 6px; }
.wi-subtitle { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 24px; }
.wi-meta-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px; }
.wi-meta-item { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
.wi-meta-val { font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--accent); }
.wi-meta-lbl { font-size: 0.65rem; color: var(--dim); margin-top: 3px; }
.wi-rules { text-align: left; display: flex; flex-direction: column; gap: 7px; margin-bottom: 20px; }
.wi-rule { font-size: 0.75rem; color: var(--gray); }
.wi-question-preview { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-bottom: 20px; text-align: left; }
.wi-preview-label { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.15em; color: var(--dim); margin-bottom: 10px; }
.wi-preview-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.wi-preview-item:last-child { border-bottom: none; }
.wi-preview-num { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--accent); }
.wi-preview-subj { font-size: 0.72rem; color: var(--text); flex: 1; }
.wi-preview-type { font-size: 0.6rem; padding: 2px 7px; border-radius: 4px; }
.wi-preview-marks { font-family: var(--font-mono); font-size: 0.65rem; color: var(--accent2); }
.wi-actions { display: flex; gap: 10px; justify-content: center; }

/* ─── WRITTEN PHASE ─────────────────────────────────────────────────────── */
.written-scroll-list { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
.wq-card {
  position: relative; background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 22px; overflow: hidden;
}
.wq-card--answered { border-color: rgba(59,130,246,0.25); }
.wq-card-corner { position: absolute; width: 10px; height: 10px; border-color: var(--border-light); border-style: solid; }
.wq-card-corner.tl { top: 4px; left: 4px; border-width: 1px 0 0 1px; }
.wq-card-corner.br { bottom: 4px; right: 4px; border-width: 0 1px 1px 0; }
.wq-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
.wq-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.wq-num { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: var(--accent); }
.wq-subject { font-size: 0.7rem; font-weight: 600; color: var(--text); }
.wq-chapter { font-size: 0.63rem; color: var(--dim); background: var(--surface2); border: 1px solid var(--border); padding: 2px 6px; border-radius: 4px; }
.wq-type { font-size: 0.6rem; padding: 2px 7px; border-radius: 4px; }
.type-creative { background: rgba(59,130,246,0.1); color: var(--accent); border: 1px solid rgba(59,130,246,0.2); }
.type-short { background: rgba(34,197,94,0.1); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
.wq-year { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); }
.wq-marks-badge { font-family: var(--font-mono); font-size: 0.65rem; color: var(--accent2); background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); padding: 4px 10px; border-radius: 5px; }
.wq-text { font-size: 0.86rem; line-height: 1.65; color: var(--text); margin-bottom: 18px; white-space: pre-line; }
.wq-answer-section { margin-bottom: 16px; }
.wq-answer-label { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.15em; color: var(--dim); display: block; margin-bottom: 8px; }
.wq-textarea {
  width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 7px;
  padding: 12px 14px; color: var(--text); font-family: var(--font-sans); font-size: 0.82rem;
  line-height: 1.65; resize: vertical; outline: none; transition: border-color 0.15s; box-sizing: border-box;
}
.wq-textarea:focus { border-color: var(--accent); }
.wq-char-count { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); text-align: right; margin-top: 5px; }
.wq-image-section { }
.wq-image-label { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; font-size: 0.65rem; color: var(--dim); }
.wq-image-label span:first-child { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.12em; }
.wq-image-hint { font-size: 0.65rem; color: var(--dim); }
.wq-image-dropzone {
  border: 1px dashed var(--border-light); border-radius: 8px; padding: 20px;
  text-align: center; cursor: pointer; transition: all 0.15s;
}
.wq-image-dropzone:hover { border-color: var(--accent); background: rgba(59,130,246,0.04); }
.wq-dropzone-icon { font-size: 1.4rem; margin-bottom: 6px; }
.wq-dropzone-text { font-size: 0.75rem; color: var(--gray); margin-bottom: 3px; }
.wq-dropzone-hint { font-size: 0.62rem; color: var(--dim); }
.wq-image-preview { position: relative; }
.wq-preview-img { max-width: 100%; max-height: 200px; border-radius: 6px; border: 1px solid var(--border); }
.wq-remove-image {
  font-size: 0.62rem; color: var(--red); background: none; border: 1px solid rgba(239,68,68,0.3);
  border-radius: 4px; padding: 3px 8px; cursor: pointer; margin-top: 8px; display: block;
}

/* ─── RESULTS ─────────────────────────────────────────────────────────────── */
.score-hero {
  position: relative; background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 28px; display: flex; gap: 28px; margin-bottom: 28px; overflow: hidden;
}
.score-hero-corner { position: absolute; width: 16px; height: 16px; border-color: var(--accent); border-style: solid; }
.score-hero-corner.tl { top: 6px; left: 6px; border-width: 1px 0 0 1px; }
.score-hero-corner.br { bottom: 6px; right: 6px; border-width: 0 1px 1px 0; }
.score-hero-left { flex: 1; }
.score-exam-label { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.12em; color: var(--dim); margin-bottom: 8px; }
.score-badge-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.score-section-tag { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.1em; padding: 3px 8px; border-radius: 4px; background: var(--surface2); border: 1px solid var(--border); color: var(--dim); }
.score-section-written { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.3); color: var(--accent); }
.score-neg-tag { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.3); color: var(--orange); }
.score-pct { font-family: var(--font-display); font-size: 3.5rem; font-weight: 800; line-height: 1; margin-bottom: 8px; }
.score-pct-sym { font-size: 1.5rem; vertical-align: top; }
.grade-high { color: var(--green); }
.grade-mid  { color: var(--orange); }
.grade-low  { color: #fb923c; }
.grade-fail { color: var(--red); }
.score-raw { font-size: 0.8rem; color: var(--gray); margin-bottom: 4px; }
.score-raw-sub { font-size: 0.68rem; color: var(--dim); }
.score-status { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; padding: 5px 12px; border-radius: 5px; display: inline-block; margin-top: 10px; }
.status-pass { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: var(--green); }
.status-fail { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: var(--red); }
.score-hero-right { display: flex; flex-direction: column; gap: 16px; min-width: 160px; }
.grade-display { text-align: center; padding: 20px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
.grade-letter { font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; line-height: 1; }
.grade-label { font-size: 0.68rem; color: var(--dim); margin-top: 4px; }
.score-breakdown { display: flex; flex-direction: column; gap: 8px; }
.sc-item { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: var(--gray); }
.sc-item strong { margin-left: auto; color: var(--text); font-family: var(--font-mono); }
.sc-dot { width: 8px; height: 8px; border-radius: 50%; }
.correct-dot { background: var(--green); }
.wrong-dot { background: var(--red); }
.skip-dot { background: var(--dim); }

/* ─── SUBJECT BREAKDOWN ─────────────────────────────────────────────────── */
.subject-breakdown-section { margin-bottom: 28px; }
.subject-breakdown-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.sb-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
.sb-icon { font-size: 1.1rem; margin-bottom: 6px; }
.sb-label { font-size: 0.68rem; font-weight: 600; color: var(--text); margin-bottom: 6px; }
.sb-pct { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
.sb-bar-track { height: 3px; background: var(--bg); border-radius: 2px; overflow: hidden; margin-bottom: 8px; }
.sb-bar { height: 100%; background: var(--accent); border-radius: 2px; }
.sb-stats { display: flex; gap: 8px; font-family: var(--font-mono); font-size: 0.58rem; }
.sb-correct { color: var(--green); }
.sb-wrong { color: var(--red); }
.sb-skip { color: var(--dim); }

/* ─── REVIEW SECTION ─────────────────────────────────────────────────────── */
.review-section { }
.review-header { margin-bottom: 16px; }
.review-filters { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.subject-filter-bar { display: flex; gap: 6px; flex-wrap: wrap; }
.sf-btn {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.06em;
  padding: 5px 10px; border: 1px solid var(--border); border-radius: 5px;
  background: var(--surface); color: var(--dim); cursor: pointer; transition: all 0.15s;
}
.sf-btn:hover { border-color: var(--border-light); color: var(--gray); }
.sf-btn--active { background: var(--accent); border-color: var(--accent); color: #fff; }
.review-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.rev-tab {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.06em;
  padding: 5px 10px; border: 1px solid var(--border); border-radius: 5px;
  background: var(--surface); color: var(--dim); cursor: pointer; transition: all 0.15s;
}
.rev-tab--active { border-color: var(--border-light); color: var(--text); background: var(--surface2); }
.rev-correct.rev-tab--active { border-color: rgba(34,197,94,0.4); color: var(--green); }
.rev-wrong.rev-tab--active   { border-color: rgba(239,68,68,0.4); color: var(--red); }
.rev-skip.rev-tab--active    { border-color: rgba(148,163,184,0.3); color: var(--gray); }
.rev-count { font-size: 0.55rem; background: var(--bg); padding: 1px 5px; border-radius: 3px; }

.review-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.rev-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 18px; }
.rev-card.rev-correct { border-left: 3px solid var(--green); }
.rev-card.rev-wrong   { border-left: 3px solid var(--red); }
.rev-card.rev-skip    { border-left: 3px solid var(--dim); }
.rev-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.rev-meta { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.rv-status-icon { font-size: 0.85rem; }
.rev-neg-badge { font-family: var(--font-mono); font-size: 0.55rem; color: var(--red); background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); padding: 3px 8px; border-radius: 4px; }
.rev-q-text { font-size: 0.84rem; line-height: 1.6; color: var(--text); margin-bottom: 14px; }
.rev-options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.rev-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg);
}
.rev-opt.rc-correct { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.06); }
.rev-opt.rc-wrong   { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.06); }
.rc-correct-label { margin-left: auto; font-size: 0.62rem; color: var(--green); font-weight: 700; }
.rc-wrong-label   { margin-left: auto; font-size: 0.62rem; color: var(--red); font-weight: 700; }
.exp-block { background: var(--bg); border: 1px solid var(--border); border-radius: 7px; padding: 14px; }
.exp-label { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.18em; color: var(--dim); margin-bottom: 8px; }
.exp-text { font-family: var(--font-sans); font-size: 0.8rem; color: var(--dim); line-height: 1.65; }

/* ─── RESULTS ACTIONS ────────────────────────────────────────────────────── */
.results-actions { display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 24px; flex-wrap: wrap; }

/* ─── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .exam-page { padding: 24px 16px 80px; }
  .page-header { flex-direction: column; gap: 16px; }
  .tier-badge { max-width: 100%; width: 100%; }
  .univ-grid { grid-template-columns: 1fr 1fr; }
  .expect-grid { grid-template-columns: 1fr; }
  .score-hero { flex-direction: column; gap: 20px; padding: 20px; }
  .score-hero-right { min-width: unset; }
  .cta-bar { flex-direction: column; align-items: stretch; gap: 12px; bottom: 0; left: 0; right: 0; border-left: none; border-right: none; border-bottom: none; padding: 16px; border-radius: 0; }
  .cta-right { display: grid; grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .exam-page { padding: 12px 10px 90px; }
  .page-title { font-size: 1.6rem; }
  .univ-grid { grid-template-columns: 1fr; }
  .exam-topbar { flex-wrap: wrap; gap: 8px; padding: 8px 10px; }
  .topbar-center { order: 3; width: 100%; flex: unset; }
  .q-palette { gap: 3px; max-height: 64px; }
  .q-dot { width: 22px; height: 18px; font-size: 0.5rem; }
  .q-card { padding: 14px 12px; }
  .q-card-header { flex-direction: column; gap: 8px; align-items: flex-start; }
  .q-opt { padding: 8px 10px; }
  .submit-bar { flex-direction: column; align-items: stretch; gap: 12px; padding: 14px; }
  .submit-stats { flex-wrap: wrap; gap: 10px; }
  .submit-actions { flex-direction: column; }
  .submit-actions .iso-btn { width: 100%; justify-content: center; }
  .score-pct { font-size: 2.8rem; }
  .review-tabs { display: grid; grid-template-columns: repeat(4,1fr); }
  .rev-tab { justify-content: center; font-size: 0.5rem; padding: 5px 2px; }
  .results-actions { flex-direction: column; gap: 8px; }
  .results-actions .iso-btn { width: 100%; justify-content: center; }
  .subject-breakdown-grid { grid-template-columns: repeat(2,1fr); }
  .start-modal-actions { flex-direction: column; gap: 8px; }
  .start-modal-actions .iso-btn { width: 100%; justify-content: center; }
  .wi-container { padding: 24px 16px; }
  .wq-card { padding: 16px 12px; }
}
</style>
