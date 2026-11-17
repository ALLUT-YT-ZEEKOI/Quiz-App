// CohesionTech Learning Suite - Live & Scheduled Examination Dataset
// High-fidelity Civil Engineering Examinations with 30 Technical Questions per Exam

import { QUESTIONS_BANK } from './questionsData';
import { STUDENTS } from './initialData';

// Generate 30 high-quality technical Civil Engineering questions for an examination
export const generateExamQuestions = (subjectId = 'CE-301', subjectName = 'Structural Analysis') => {
  // Take base questions from bank for this subject or related
  const baseFromBank = QUESTIONS_BANK.filter(
    (q) => q.subjectId === subjectId || q.subjectName.toLowerCase().includes(subjectName.toLowerCase())
  );

  const fallbackQuestions = [
    {
      id: `Q-EX-${subjectId}-01`,
      questionText: 'What is the kinematic indeterminacy of a plane pin-jointed truss with j joints and r external reactions?',
      options: ['2j - r', '3j - r', 'j - 2r', '2j + r'],
      correctAnswer: 0,
      explanation: 'In a 2D pin-jointed truss, each joint has 2 translational degrees of freedom. With r external reaction restraints, Dk = 2j - r.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-02`,
      questionText: 'According to Castigliano\'s First Theorem, the first partial derivative of total strain energy with respect to a displacement gives:',
      options: ['The rotation at that point', 'The corresponding external force in direction of displacement', 'The flexural rigidity EI', 'The complementary energy'],
      correctAnswer: 1,
      explanation: 'Castigliano\'s 1st theorem states that ∂U/∂Δ_i = P_i (generalized force in the direction of displacement Δ_i).',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-03`,
      questionText: 'In Hardy Cross Moment Distribution Method, the carry-over factor to a far end that is rigidly fixed for a prismatic member is:',
      options: ['0', '+0.5', '-0.5', '1.0'],
      correctAnswer: 1,
      explanation: 'For a uniform prismatic beam, applying a moment M at the near hinged/rotated end induces a carry-over moment of +M/2 at the far fixed end.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-04`,
      questionText: 'Müller-Breslau principle for constructing influence line diagrams states that the influence line for any internal stress resultant is proportional to:',
      options: ['The bending moment diagram under self weight', 'The deflected shape obtained by removing the restraint and introducing a unit displacement', 'The shear force envelope under rolling loads', 'The reciprocal of axial stiffness AE/L'],
      correctAnswer: 1,
      explanation: 'The principle uses Betti\'s reciprocal theorem: the ILD is proportional to the deflected shape upon introducing a unit generalized displacement.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-05`,
      questionText: 'What is the static indeterminacy (Ds) of a propped cantilever beam under general transverse vertical loads?',
      options: ['0 (Determinate)', '1', '2', '3'],
      correctAnswer: 1,
      explanation: 'A propped cantilever has 3 reactions under vertical loads (vertical & moment at fixed end, vertical at prop). Equations of equilibrium = 2. Ds = 3 - 2 = 1.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-06`,
      questionText: 'In Slope Deflection method, the basic equation for end moment M_AB of a prismatic member AB without sway is:',
      options: ['M_AB = (2EI/L)[2θ_A + θ_B] + M_F_AB', 'M_AB = (4EI/L)[θ_A + θ_B]', 'M_AB = (EI/L)[θ_A + 2θ_B]', 'M_AB = (6EI/L^2)Δ'],
      correctAnswer: 0,
      explanation: 'Standard slope-deflection equation: M_AB = M_F_AB + (2EI/L)(2θ_A + θ_B - 3Δ/L). Without sway, Δ = 0.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-07`,
      questionText: 'The ratio of plastic section modulus (Zp) to elastic section modulus (Ze) is known as:',
      options: ['Load factor', 'Shape factor', 'Stiffness factor', 'Ductility factor'],
      correctAnswer: 1,
      explanation: 'Shape factor S = Zp / Ze. For a standard rectangular cross section, S = 1.5; for an I-section, S is approximately 1.12 to 1.15.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-08`,
      questionText: 'In a three-hinged parabolic arch of span L and rise h carrying a uniformly distributed load w per unit horizontal length over the entire span, the horizontal thrust H is:',
      options: ['wL / 8h', 'wL^2 / 8h', 'wL^2 / 4h', 'wL^2 / 16h'],
      correctAnswer: 1,
      explanation: 'Taking moment about the crown hinge C for one half of the arch: H * h = (wL/2)*(L/4) - w(L/2)*(L/4)/2 = wL^2 / 8. Therefore H = wL^2 / (8h).',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-09`,
      questionText: 'What is the bending moment at any section of a three-hinged parabolic arch under full span uniformly distributed load?',
      options: ['wL^2 / 8', 'wL^2 / 12', 'Zero everywhere', 'Variable quadratic parabolic'],
      correctAnswer: 2,
      explanation: 'Under full-span UDL, the funicular arch matches the parabolic bending moment shape exactly, making the resultant bending moment zero at all sections.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-10`,
      questionText: 'The flexibility matrix [F] and stiffness matrix [K] of a stable linear elastic structure are related by:',
      options: ['[K] = [F]^T', '[K] = [F]^-1', '[K] * [F] = 0', '[K] = - [F]'],
      correctAnswer: 1,
      explanation: 'By definition of structural coordinate transformations, stiffness and flexibility matrices are the mathematical inverse of each other: [K] = [F]^-1.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-11`,
      questionText: 'For an overhanging beam, the point where the bending moment changes sign and passes through zero is called:',
      options: ['Neutral axis', 'Point of contraflexure', 'Elastic limit', 'Yield plateau'],
      correctAnswer: 1,
      explanation: 'A point of contraflexure (or point of inflection) is the location along the member axis where bending moment changes sign (curvature changes).',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-12`,
      questionText: 'Euler\'s critical crippling load for a column of length L and flexural rigidity EI fixed at both ends is:',
      options: ['π^2 EI / L^2', '2 π^2 EI / L^2', '4 π^2 EI / L^2', 'π^2 EI / (4 L^2)'],
      correctAnswer: 2,
      explanation: 'For both ends fixed, the effective buckling length Le = L/2. Hence Pcr = π^2 EI / (Le)^2 = 4 π^2 EI / L^2.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-13`,
      questionText: 'As per IS 456:2000, what is the maximum strain in concrete at the outermost compression fiber in limit state of flexure?',
      options: ['0.002', '0.0035', '0.004', '0.005'],
      correctAnswer: 1,
      explanation: 'Clause 38.1 of IS 456 specifies that the maximum compressive strain in concrete at the extreme fiber in bending compression is taken as 0.0035.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-14`,
      questionText: 'In limit state design of reinforced concrete beams, the neutral axis depth factor xu,max / d for Fe 415 grade steel is:',
      options: ['0.53', '0.48', '0.46', '0.42'],
      correctAnswer: 1,
      explanation: 'From strain compatibility in IS 456: xu,max / d = 0.53 for Fe 250, 0.48 for Fe 415, and 0.46 for Fe 500.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-15`,
      questionText: 'The minimum percentage of longitudinal reinforcement specified in IS 456:2000 for a rectangular column is:',
      options: ['0.4%', '0.8%', '1.0%', '0.12%'],
      correctAnswer: 1,
      explanation: 'As per IS 456 Clause 26.5.3.1, the cross-sectional area of longitudinal reinforcement in a column shall not be less than 0.8% of gross cross-sectional area.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-16`,
      questionText: 'What is the characteristic compressive strength fck of concrete defined as?',
      options: [
        'Strength below which not more than 5% of test results are expected to fall',
        'Average strength of 28-day cube specimens',
        'Strength below which 10% of results fall',
        'Strength at 7 days of moist curing'
      ],
      correctAnswer: 0,
      explanation: 'Characteristic strength fck is statistically defined in IS 456 as that value of strength below which not more than 5% of test results are expected to fall.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-17`,
      questionText: 'In prestressed concrete design, loss of prestress due to friction occurs in:',
      options: ['Pre-tensioned members only', 'Post-tensioned members with curved tendons', 'All pretensioned slabs', 'Only unbonded pretensioned wires'],
      correctAnswer: 1,
      explanation: 'Friction loss (wobble and curvature effects as per IS 1343) occurs in post-tensioned tendons during jacking along curved ducts.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-18`,
      questionText: 'Which Bogue compound is primarily responsible for the 28-day and long-term compressive strength of Portland cement?',
      options: ['Tricalcium Aluminate (C3A)', 'Dicalcium Silicate (C2S)', 'Tricalcium Silicate (C3S)', 'Tetracalcium Aluminoferrite (C4AF)'],
      correctAnswer: 1,
      explanation: 'C2S hydrates slowly and contributes significantly to the progressive strength gain beyond 28 days up to one year.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-19`,
      questionText: 'The standard size of concrete cube used for 28-day compressive strength testing according to IS 516 is:',
      options: ['100 mm x 100 mm x 100 mm', '150 mm x 150 mm x 150 mm', '200 mm x 200 mm x 200 mm', '70.6 mm x 70.6 mm x 70.6 mm'],
      correctAnswer: 1,
      explanation: 'IS 516 specifies 150 mm cube specimens as standard for coarse aggregates up to 38 mm size. 70.6 mm is for cement mortar cubes.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-20`,
      questionText: 'According to Terzaghi\'s 1D consolidation theory, the time factor Tv is mathematically expressed as:',
      options: ['Tv = Cv * t / d^2', 'Tv = Cv * d^2 / t', 'Tv = k / (mv * γw)', 'Tv = e0 / (1 + e)'],
      correctAnswer: 0,
      explanation: 'Non-dimensional time factor Tv = (Cv * t) / (d^2), where Cv is coefficient of consolidation and d is the drainage path length.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-21`,
      questionText: 'In Mohr-Coulomb shear strength criterion τ = c + σ tan(φ), the shear strength of normally consolidated pure clay in an undrained state is given by:',
      options: ['τ = c_u', 'τ = σ tan(φ)', 'τ = c + σ tan(45°)', 'τ = 2 c_u'],
      correctAnswer: 0,
      explanation: 'For saturated clays under undrained conditions (φu = 0° total stress concept), shear strength τ = cu (undrained cohesion).',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-22`,
      questionText: 'The ratio of plasticity index (Ip) to the percentage of clay-size particles (< 2 μm) is designated as:',
      options: ['Toughness index', 'Activity of clay', 'Liquidity index', 'Sensitivity'],
      correctAnswer: 1,
      explanation: 'Skempton defined Clay Activity A = Ip / (% clay fraction < 2 μm). Values > 1.25 denote active clays susceptible to high swelling.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-23`,
      questionText: 'In reciprocal levelling between two bench marks across a wide river, which of the following errors are completely eliminated?',
      options: ['Earth curvature and atmospheric refraction only', 'Collimation error only', 'Both curvature, refraction, and collimation errors', 'Index error of target rod'],
      correctAnswer: 2,
      explanation: 'Reciprocal levelling eliminates combined curvature-refraction errors and collimation axis inclination error completely by symmetry.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-24`,
      questionText: 'In transit theodolite survey, Bowditch rule (Compass rule) balances traverse errors under the assumption that:',
      options: [
        'Linear errors are proportional to √l and angular errors to 1/√l',
        'Linear and angular measurements are of equal precision',
        'Angles are measured much more accurately than distances',
        'Lengths are error-free and only bearings contain error'
      ],
      correctAnswer: 0,
      explanation: 'Bowditch rule assumes linear errors proportional to √l and angular errors proportional to 1/√l, adjusting latitudes and departures proportionally.',
      difficulty: 'Hard',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-25`,
      questionText: 'The ruling minimum radius of horizontal curve for a National Highway designed for 100 km/h with e_max = 0.07 and f = 0.15 is approximately:',
      options: ['220 m', '360 m', '450 m', '520 m'],
      correctAnswer: 1,
      explanation: 'R_min = V^2 / [127 * (e + f)] = 100^2 / [127 * (0.07 + 0.15)] = 10,000 / 27.94 ≈ 358 m (approx 360 m as per IRC:73).',
      difficulty: 'Hard',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-26`,
      questionText: 'According to IS 800:2007 (General Construction in Steel), the partial safety factor for material resistance against yielding γm0 is:',
      options: ['1.00', '1.10', '1.25', '1.50'],
      correctAnswer: 1,
      explanation: 'Table 5 of IS 800:2007 specifies γm0 = 1.10 for resistance governed by yielding, and γm1 = 1.25 for resistance governed by ultimate rupture.',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-27`,
      questionText: 'In a hydraulic jump formed in a horizontal rectangular channel, the relation between conjugate depths y1 and y2 is given by Belanger\'s equation:',
      options: [
        'y2/y1 = 0.5 * [-1 + √(1 + 8 Fr1^2)]',
        'y2/y1 = 0.5 * [1 + √(1 + 8 Fr1^2)]',
        'y2/y1 = 2 * [-1 + √(1 + 4 Fr1)]',
        'y2/y1 = Fr1^2 / 2'
      ],
      correctAnswer: 0,
      explanation: 'Belanger\'s hydraulic jump momentum balance gives y2/y1 = 0.5 * [-1 + √(1 + 8 Fr1^2)], where Fr1 is the upstream supercritical Froude number.',
      difficulty: 'Hard',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-28`,
      questionText: 'The Biochemical Oxygen Demand (BOD5) test of wastewater is conventionally conducted at a temperature of:',
      options: ['15 °C for 7 days', '20 °C for 5 days', '27 °C for 3 days', '37 °C for 24 hours'],
      correctAnswer: 1,
      explanation: 'Standard BOD5 test is incubated at 20 °C for 5 days. (In Indian Standard testing, 27 °C for 3 days is also recognized, but 20 °C 5 days is international standard).',
      difficulty: 'Easy',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-29`,
      questionText: 'In Critical Path Method (CPM) project scheduling, the \'Free Float\' of an activity is defined as:',
      options: [
        'Total float minus interfering float',
        'Amount of time by which activity completion can be delayed without affecting earliest start of successor activities',
        'Total time between earliest start and latest finish',
        'Time available when all predecessors start at latest times'
      ],
      correctAnswer: 1,
      explanation: 'Free Float FF = Ej - Ei - tij. It is the spare time available without delaying the earliest start time of any immediate succeeding activity.',
      difficulty: 'Medium',
      marks: 1
    },
    {
      id: `Q-EX-${subjectId}-30`,
      questionText: 'Under IS 1893:2016 for Earthquake Resistant Design, the Seismic Zone factor Z for Zone V (highest seismic risk) is:',
      options: ['0.10', '0.16', '0.24', '0.36'],
      correctAnswer: 3,
      explanation: 'IS 1893:2016 Zone factors: Zone II = 0.10, Zone III = 0.16, Zone IV = 0.24, and Zone V = 0.36.',
      difficulty: 'Easy',
      marks: 1
    }
  ];

  // Return exactly 30 questions
  return fallbackQuestions;
};

// 10 Comprehensive Scheduled, Live, and Completed Examinations
export const INITIAL_EXAMINATIONS = [
  {
    id: 'EXAM-2026-001',
    code: 'EX-CE301-M1',
    title: 'Structural Engineering – Module 01 Assessment',
    description: 'Mid-term scheduled examination covering kinematic indeterminacy, strain energy, slope-deflection, and moment distribution.',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    module: 'Module 01: Energy Theorems & Structural Indeterminacy',
    chapter: 'Chapters 1 to 4',
    faculty: 'Dr. Rajesh Sharma',
    type: 'Live', // 'Live', 'Scheduled', 'Practice'
    instructions: '1. Duration is strictly 60 minutes.\n2. Total Questions: 30 MCQ (1 mark each).\n3. Negative marking: -0.25 marks per wrong answer.\n4. Scientific calculators are permitted as per IS 456.\n5. Examination closes automatically at the configured closing time.',
    date: '2026-11-17',
    startTime: '17:00',
    endTime: '18:00',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: true,
    negativeMarkValue: 0.25,
    randomizeQuestions: true,
    randomizeOptions: false,
    allowLateEntry: true,
    lateEntryThresholdMinutes: 15,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'After Exam', // 'Immediately', 'After Exam', 'Manual'
    status: 'Live Now', // 'Live Now', 'Upcoming', 'Completed', 'Draft'
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-301', 'Structural Analysis'),
    createdAt: '2026-11-10T10:00:00Z'
  },
  {
    id: 'EXAM-2026-002',
    code: 'EX-CE204-M2',
    title: 'Concrete Technology – Mix Design & Rheology Assessment',
    description: 'Proctored live test assessing Abrams water-cement law, fresh concrete rheology, and IS 10262:2019 mix design calculations.',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    module: 'Module 02: Advanced Concrete Rheology & IS 10262',
    chapter: 'Chapters 2 & 3',
    faculty: 'Prof. Ananya Iyer',
    type: 'Live',
    instructions: '1. Exam time window: 60 Minutes.\n2. Review questions carefully before submitting.\n3. Negative marking applies (-0.25 per wrong answer).\n4. All 21 students must complete the attempt in a single session.',
    date: '2026-11-17',
    startTime: '15:30',
    endTime: '17:00',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: true,
    negativeMarkValue: 0.25,
    randomizeQuestions: false,
    randomizeOptions: false,
    allowLateEntry: false,
    lateEntryThresholdMinutes: 0,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'After Exam',
    status: 'Live Now',
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-204', 'Concrete Technology'),
    createdAt: '2026-11-12T14:30:00Z'
  },
  {
    id: 'EXAM-2026-003',
    code: 'EX-CE302-M1',
    title: 'Geotechnical Engineering – Soil Mechanics & Foundation Analysis',
    description: 'Scheduled final module test on shear strength parameters, Mohr-Coulomb failure envelopes, and Terzaghi bearing capacity equations.',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    module: 'Module 01: Soil Mechanics Fundamentals',
    chapter: 'Chapters 1 to 5',
    faculty: 'Prof. Ananya Iyer',
    type: 'Scheduled',
    instructions: '1. Calculator allowed.\n2. 30 objective questions.\n3. Examination opens at 10:00 AM on 18 Nov 2026.',
    date: '2026-11-18',
    startTime: '10:00',
    endTime: '11:30',
    durationMinutes: 90,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: true,
    negativeMarkValue: 0.25,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowLateEntry: true,
    lateEntryThresholdMinutes: 10,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'Immediately',
    status: 'Upcoming',
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-302', 'Geotechnical Engineering'),
    createdAt: '2026-11-14T09:15:00Z'
  },
  {
    id: 'EXAM-2026-004',
    code: 'EX-CE202-M1',
    title: 'Surveying – Total Station, Theodolite & Modern Geodesy',
    description: 'Scheduled assessment on reciprocal levelling, Bowditch balancing, horizontal curves, and Total Station survey principles.',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    module: 'Module 01: Advanced Geodetic Surveying',
    chapter: 'Chapters 3 to 6',
    faculty: 'Er. Vikramaditya Menon',
    type: 'Scheduled',
    instructions: 'Field log tables and trigonometrical formulas provided in question context.',
    date: '2026-11-20',
    startTime: '14:00',
    endTime: '15:15',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: false,
    negativeMarkValue: 0,
    randomizeQuestions: true,
    randomizeOptions: false,
    allowLateEntry: true,
    lateEntryThresholdMinutes: 15,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'After Exam',
    status: 'Upcoming',
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-202', 'Surveying'),
    createdAt: '2026-11-15T11:00:00Z'
  },
  {
    id: 'EXAM-2026-005',
    code: 'EX-CE103-M1',
    title: 'Building Materials – Polymers, Aggregates & Cement Hydration',
    description: 'Upcoming scheduled evaluation covering raw material testing, hydration chemistry, aggregate grading curves, and non-destructive testing.',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    module: 'Module 01: Materials & Mineral Admixtures',
    chapter: 'Chapters 1 to 4',
    faculty: 'Prof. Ananya Iyer',
    type: 'Scheduled',
    instructions: 'Mandatory for all S6 Civil Engineering students.',
    date: '2026-11-22',
    startTime: '16:00',
    endTime: '17:00',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: true,
    negativeMarkValue: 0.25,
    randomizeQuestions: true,
    randomizeOptions: false,
    allowLateEntry: true,
    lateEntryThresholdMinutes: 10,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'Manual',
    status: 'Upcoming',
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-103', 'Building Materials'),
    createdAt: '2026-11-15T15:30:00Z'
  },
  {
    id: 'EXAM-2026-006',
    code: 'EX-CE301-DYN',
    title: 'Structural Dynamics & Seismic Code IS 1893:2016',
    description: 'Completed examination on single degree of freedom systems, response spectrum method, and ductility provisions of IS 13920.',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    module: 'Module 04: Earthquake Engineering & Dynamics',
    chapter: 'Chapters 7 to 9',
    faculty: 'Dr. Rajesh Sharma',
    type: 'Scheduled',
    instructions: 'Completed on 14 Nov 2026. Official results published.',
    date: '2026-11-14',
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: true,
    negativeMarkValue: 0.25,
    randomizeQuestions: true,
    randomizeOptions: false,
    allowLateEntry: false,
    lateEntryThresholdMinutes: 0,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'After Exam',
    status: 'Completed',
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-301', 'Structural Analysis'),
    createdAt: '2026-11-05T09:00:00Z'
  },
  {
    id: 'EXAM-2026-007',
    code: 'EX-CE401-RCC',
    title: 'Advanced RCC Design & Detailing to IS 456:2000',
    description: 'Completed examination on doubly reinforced beams, shear design, bond and anchorage, and slender column design.',
    subjectId: 'CE-401',
    subjectName: 'Design of Concrete Structures',
    module: 'Module 03: Limit State Flexure & Shear Detailing',
    chapter: 'Chapters 4 to 6',
    faculty: 'Dr. Rajesh Sharma',
    type: 'Scheduled',
    instructions: 'Completed on 10 Nov 2026.',
    date: '2026-11-10',
    startTime: '14:00',
    endTime: '15:00',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: true,
    negativeMarkValue: 0.25,
    randomizeQuestions: true,
    randomizeOptions: false,
    allowLateEntry: true,
    lateEntryThresholdMinutes: 15,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'Immediately',
    status: 'Completed',
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-401', 'Design of Concrete Structures'),
    createdAt: '2026-11-01T10:00:00Z'
  },
  {
    id: 'EXAM-2026-008',
    code: 'EX-CE305-ENV',
    title: 'Environmental Engineering & Wastewater Treatment Systems',
    description: 'Completed examination on biological aeration tanks, sedimentation kinetics, and primary/secondary effluent standards.',
    subjectId: 'CE-305',
    subjectName: 'Environmental Engineering',
    module: 'Module 02: Wastewater Microbiology & Reactor Design',
    chapter: 'Chapters 3 & 4',
    faculty: 'Prof. Ananya Iyer',
    type: 'Scheduled',
    instructions: 'Completed on 05 Nov 2026.',
    date: '2026-11-05',
    startTime: '11:00',
    endTime: '12:00',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: true,
    negativeMarkValue: 0.25,
    randomizeQuestions: false,
    randomizeOptions: false,
    allowLateEntry: true,
    lateEntryThresholdMinutes: 10,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'After Exam',
    status: 'Completed',
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-305', 'Environmental Engineering'),
    createdAt: '2026-10-25T11:00:00Z'
  },
  {
    id: 'EXAM-2026-009',
    code: 'EX-CE304-TRN',
    title: 'Highway Geometric Design & Flexible Pavements to IRC:37',
    description: 'Completed examination covering sight distance criteria, super-elevation, transition curves, and CBR design method.',
    subjectId: 'CE-304',
    subjectName: 'Transportation Engineering',
    module: 'Module 01: Geometric Design of Highways',
    chapter: 'Chapters 1 to 3',
    faculty: 'Er. Vikramaditya Menon',
    type: 'Scheduled',
    instructions: 'Completed on 28 Oct 2026.',
    date: '2026-10-28',
    startTime: '15:00',
    endTime: '16:00',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: false,
    negativeMarkValue: 0,
    randomizeQuestions: true,
    randomizeOptions: false,
    allowLateEntry: false,
    lateEntryThresholdMinutes: 0,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'After Exam',
    status: 'Completed',
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-304', 'Transportation Engineering'),
    createdAt: '2026-10-15T12:00:00Z'
  },
  {
    id: 'EXAM-2026-010',
    code: 'EX-CE201-FM',
    title: 'Fluid Mechanics & Open Channel Flow Assessment',
    description: 'Completed examination covering continuity and momentum equations, venturimeter flow, and Belanger hydraulic jump.',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    module: 'Module 03: Hydrodynamics & Channel Flows',
    chapter: 'Chapters 4 to 6',
    faculty: 'Er. Vikramaditya Menon',
    type: 'Scheduled',
    instructions: 'Completed on 20 Oct 2026.',
    date: '2026-10-20',
    startTime: '09:30',
    endTime: '10:30',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    totalQuestions: 30,
    totalMarks: 30,
    passingMarks: 15,
    negativeMarking: true,
    negativeMarkValue: 0.25,
    randomizeQuestions: true,
    randomizeOptions: false,
    allowLateEntry: true,
    lateEntryThresholdMinutes: 10,
    maxAttempts: 1,
    autoSubmitTimeout: true,
    autoSubmitEndWindow: true,
    resultPublication: 'Immediately',
    status: 'Completed',
    assignedStudentIds: STUDENTS.map((s) => s.id),
    questions: generateExamQuestions('CE-201', 'Fluid Mechanics'),
    createdAt: '2026-10-10T08:00:00Z'
  }
];

// Generate realistic live monitoring sessions for the 21 students for EXAM-2026-001
export const generateLiveMonitoringData = (examId = 'EXAM-2026-001') => {
  return STUDENTS.map((student, idx) => {
    // Distribute realistic live states among the 21 students
    if (idx === 1 || idx === 4 || idx === 7 || idx === 15) {
      // Submitted students
      const answered = 30;
      const score = Math.floor(25 + Math.random() * 5); // 25 to 29
      return {
        studentId: student.id,
        rollNo: student.studentId,
        studentName: student.name,
        avatar: student.avatar,
        batch: student.batch,
        semester: student.semester,
        examId,
        status: 'Submitted', // 'In Progress', 'Submitted', 'Not Started'
        connectionStatus: 'Connected', // 'Connected', 'Idle', 'Disconnected'
        startTime: '17:02',
        submitTime: '17:48',
        answeredCount: answered,
        totalQuestions: 30,
        progressPct: 100,
        currentQuestionIndex: 29,
        markedForReviewCount: 2,
        lastActivityText: 'Submitted 12m ago',
        lastActivityTimestamp: Date.now() - 12 * 60 * 1000,
        ipAddress: `192.168.1.${10 + idx}`,
        device: 'Chrome / macOS',
        score,
        timeSpentMinutes: 46
      };
    } else if (idx === 18 || idx === 20) {
      // Not Started yet
      return {
        studentId: student.id,
        rollNo: student.studentId,
        studentName: student.name,
        avatar: student.avatar,
        batch: student.batch,
        semester: student.semester,
        examId,
        status: 'Not Started',
        connectionStatus: 'Disconnected',
        startTime: null,
        submitTime: null,
        answeredCount: 0,
        totalQuestions: 30,
        progressPct: 0,
        currentQuestionIndex: 0,
        markedForReviewCount: 0,
        lastActivityText: 'Offline',
        lastActivityTimestamp: null,
        ipAddress: '-',
        device: '-',
        score: null,
        timeSpentMinutes: 0
      };
    } else {
      // In Progress students
      const answered = Math.min(29, 12 + ((idx * 3) % 17));
      const progress = Math.round((answered / 30) * 100);
      const isIdle = idx === 11;
      return {
        studentId: student.id,
        rollNo: student.studentId,
        studentName: student.name,
        avatar: student.avatar,
        batch: student.batch,
        semester: student.semester,
        examId,
        status: 'In Progress',
        connectionStatus: isIdle ? 'Idle' : 'Connected',
        startTime: `17:0${(idx % 5) + 1}`,
        submitTime: null,
        answeredCount: answered,
        totalQuestions: 30,
        progressPct: progress,
        currentQuestionIndex: answered - 1,
        markedForReviewCount: (idx % 4) + 1,
        lastActivityText: isIdle ? 'Idle for 3 mins' : 'Active 14s ago',
        lastActivityTimestamp: Date.now() - (isIdle ? 180000 : 14000),
        ipAddress: `192.168.1.${10 + idx}`,
        device: idx % 2 === 0 ? 'Chrome / Windows 11' : 'Edge / Windows 10',
        score: null,
        timeSpentMinutes: 38
      };
    }
  });
};

// Generate realistic completed examination attempts for all 21 students for completed exams
export const generateCompletedExamAttempts = () => {
  const completedExams = ['EXAM-2026-006', 'EXAM-2026-007', 'EXAM-2026-008', 'EXAM-2026-009', 'EXAM-2026-010'];
  const attempts = [];

  completedExams.forEach((examId) => {
    STUDENTS.forEach((student, index) => {
      // Determine realistic score based on student's GPA and index
      const basePct = student.cgpa ? student.cgpa * 10 : 80;
      const variation = ((index * 7) % 15) - 7;
      const finalPct = Math.max(55, Math.min(98, Math.round(basePct + variation)));
      const totalQuestions = 30;
      const totalMarks = 30;
      const correctCount = Math.round((finalPct / 100) * totalQuestions);
      const unattempted = (index % 5 === 0) ? 1 : 0;
      const incorrectCount = totalQuestions - correctCount - unattempted;
      const score = Math.max(0, correctCount - (incorrectCount * 0.25));
      const passed = score >= 15;

      attempts.push({
        id: `ATT-${examId}-${student.id}`,
        examId,
        studentId: student.id,
        studentName: student.name,
        studentRollNo: student.studentId,
        batch: student.batch,
        semester: student.semester,
        avatar: student.avatar,
        totalQuestions,
        totalMarks,
        correctCount,
        incorrectCount,
        unattemptedCount: unattempted,
        score: Math.round(score * 10) / 10,
        percentage: Math.round((score / totalMarks) * 100),
        passed,
        timeSpentMinutes: Math.floor(40 + ((index * 3) % 18)),
        submittedAt: '2026-11-14T11:48:00Z',
        // Mock detailed answer responses
        answers: Array.from({ length: 30 }).map((_, qIdx) => ({
          questionIndex: qIdx,
          selectedOption: (qIdx < correctCount) ? 1 : (qIdx === 29 && unattempted ? null : 0),
          isCorrect: qIdx < correctCount,
          timeSpentSecs: Math.floor(60 + (qIdx * 4) % 60)
        }))
      });
    });
  });

  // Also add submitted attempts for the live exam EXAM-2026-001 (for students STU002, STU005, STU008, STU016)
  const submittedInLive = [
    { id: 'STU002', name: 'Meera Nambiar', score: 28, correct: 28, incorrect: 2 },
    { id: 'STU005', name: 'Kavya Raman', score: 29, correct: 29, incorrect: 1 },
    { id: 'STU008', name: 'Deepa Nair', score: 27, correct: 27, incorrect: 3 },
    { id: 'STU016', name: 'Sneha Hegde', score: 28, correct: 28, incorrect: 2 }
  ];

  submittedInLive.forEach((item) => {
    const student = STUDENTS.find((s) => s.id === item.id);
    attempts.push({
      id: `ATT-EXAM-2026-001-${item.id}`,
      examId: 'EXAM-2026-001',
      studentId: item.id,
      studentName: item.name,
      studentRollNo: student?.studentId || 'CE-2022-002',
      batch: student?.batch || '2022-2026',
      semester: student?.semester || 'S6',
      avatar: student?.avatar || '',
      totalQuestions: 30,
      totalMarks: 30,
      correctCount: item.correct,
      incorrectCount: item.incorrect,
      unattemptedCount: 0,
      score: item.score,
      percentage: Math.round((item.score / 30) * 100),
      passed: true,
      timeSpentMinutes: 47,
      submittedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      answers: Array.from({ length: 30 }).map((_, qIdx) => ({
        questionIndex: qIdx,
        selectedOption: qIdx < item.correct ? 0 : 2,
        isCorrect: qIdx < item.correct,
        timeSpentSecs: 75
      }))
    });
  });

  return attempts;
};
