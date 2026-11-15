// 100 Technically Accurate Civil Engineering Questions (10 per subject)
export const QUESTIONS_BANK = [
  // ==========================================
  // 1. STRUCTURAL ANALYSIS (CE-301) - 10 Questions
  // ==========================================
  {
    id: 'Q-SA-001',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'What is the kinematic indeterminacy of a plane pin-jointed truss with j joints and r number of external reaction components, assuming members are axially elastic?',
    questionType: 'mcq',
    options: ['2j - r', '3j - r', 'j - 2r', '2j + r'],
    correctAnswer: 0,
    explanation: 'In a 2D pin-jointed truss, each joint has 2 degrees of freedom (horizontal and vertical translation). With external reactions r restraining displacements, the total kinematic indeterminacy (Dk) is 2j - r.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-SA-002',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'According to Castigliano\'s First Theorem, the first partial derivative of the total strain energy of a structure with respect to any particular displacement gives:',
    questionType: 'mcq',
    options: ['The rotation at that point', 'The corresponding external force in the direction of displacement', 'The flexural rigidity EI', 'The complementary energy'],
    correctAnswer: 1,
    explanation: 'Castigliano\'s 1st theorem states that ∂U/∂Δ_i = P_i, where the first partial derivative of strain energy with respect to displacement Δ_i gives the corresponding generalized force P_i.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-SA-003',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'In Hardy Cross Moment Distribution Method, the carry-over factor to a far end that is rigidly fixed for a prismatic member of length L is:',
    questionType: 'mcq',
    options: ['0', '+0.5', '-0.5', '1.0'],
    correctAnswer: 1,
    explanation: 'For a prismatic beam of uniform flexural stiffness EI, introducing a moment M at the near end induces a moment of +M/2 at the far fixed end. Thus, the carry-over factor is +0.5.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-SA-004',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'Müller-Breslau principle for constructing influence line diagrams states that the influence line for any internal stress resultant is proportional to:',
    questionType: 'mcq',
    options: [
      'The bending moment diagram under self weight',
      'The deflected shape obtained by removing the restraint and introducing a unit corresponding displacement',
      'The shear force envelope under rolling loads',
      'The reciprocal of axial stiffness AE/L'
    ],
    correctAnswer: 1,
    explanation: 'Müller-Breslau\'s principle is based on Betti\'s reciprocal theorem: the ILD for any stress resultant or reaction is proportional to the deflected shape of the structure obtained by removing that restraint and applying a unit generalized displacement.',
    difficulty: 'Medium',
    marks: 2
  },
  {
    id: 'Q-SA-005',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'What is the static indeterminacy (Ds) of a propped cantilever beam subjected to a general transverse vertical load?',
    questionType: 'mcq',
    options: ['0 (Determinate)', '1', '2', '3'],
    correctAnswer: 1,
    explanation: 'A propped cantilever has a fixed support (providing vertical reaction and moment for transverse loads) and a roller support (providing 1 vertical reaction). Reactions = 3, Equilibrium equations available = 2 (ΣFy = 0, ΣM = 0). Ds = 3 - 2 = 1.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-SA-006',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'In the Slope Deflection equations, the basic equation for the end moment M_AB of a prismatic member AB without sway and with no span loads is given by:',
    questionType: 'mcq',
    options: [
      'M_AB = (2EI/L) [2θ_A + θ_B]',
      'M_AB = (4EI/L) [θ_A + θ_B]',
      'M_AB = (EI/L) [θ_A + 2θ_B]',
      'M_AB = (3EI/L) [θ_A - θ_B]'
    ],
    correctAnswer: 0,
    explanation: 'The standard slope deflection equation is M_AB = M_F,AB + (2EI/L)[2θ_A + θ_B - 3δ/L]. Without span loads (M_F,AB = 0) and without sway (δ = 0), M_AB = (2EI/L)[2θ_A + θ_B].',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-SA-007',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'The shape factor for a standard solid rectangular cross-section in plastic analysis is equal to:',
    questionType: 'mcq',
    options: ['1.00', '1.18', '1.50', '1.70'],
    correctAnswer: 2,
    explanation: 'Shape factor S = Plastic Section Modulus (Zp) / Elastic Section Modulus (Ze). For a rectangle of width b and depth d, Zp = b(d/2)^2 = bd^2/4, while Ze = bd^2/6. Thus S = (bd^2/4) / (bd^2/6) = 1.50.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-SA-008',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'For a symmetrical parabolic three-hinged arch of span L and central rise h subjected to a uniformly distributed load w across the entire span, the bending moment at any cross-section is:',
    questionType: 'mcq',
    options: ['Zero throughout the arch', 'wL^2 / 8', 'wL^2 / 12', 'wL^2 / 16'],
    correctAnswer: 0,
    explanation: 'The parabolic shape matches the thrust line (funicular polygon) for a uniform full-span distributed load. Hence, the beam moment is exactly balanced by the arch thrust moment (M = M_beam - H*y = 0) everywhere.',
    difficulty: 'Hard',
    marks: 2
  },
  {
    id: 'Q-SA-009',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'In the Flexibility matrix method of structural analysis, the primary unknowns to be solved are:',
    questionType: 'mcq',
    options: ['Joint rotations', 'Redundant forces / reactions', 'Nodal displacements', 'Curvature gradients'],
    correctAnswer: 1,
    explanation: 'The Flexibility Method (or Force Method) takes static redundants (forces and moments) as primary unknowns, enforcing geometric compatibility at the cuts/releases.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-SA-010',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: 'A continuous beam has two equal spans L with flexural rigidity EI. A concentrated load W is placed at midspan of the left span. The bending moment at the central continuous support is:',
    questionType: 'mcq',
    options: ['WL / 8', '3WL / 32', 'WL / 16', '3WL / 16'],
    correctAnswer: 1,
    explanation: 'Applying Three-Moment Equation: M_A*L + 2*M_B*(L + L) + M_C*L = -(6*a1*x1)/L = -(6/L)*(W*L^2/8)*(L/2). Since M_A = M_C = 0, 4*L*M_B = -(3/8)*W*L^2 => M_B = -3WL/32.',
    difficulty: 'Hard',
    marks: 2
  },

  // ==========================================
  // 2. SURVEYING (CE-202) - 10 Questions
  // ==========================================
  {
    id: 'Q-SUR-001',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'Reciprocal levelling is primarily employed to completely eliminate the errors caused by:',
    questionType: 'mcq',
    options: [
      'Graduation errors of the levelling staff',
      'Earth curvature, atmospheric refraction, and collimation error of the instrument',
      'Parallax and centering discrepancies',
      'Temperature expansion of the invar tape'
    ],
    correctAnswer: 1,
    explanation: 'Reciprocal levelling cancels out errors due to curvature of the earth and line of collimation adjustment completely, and minimizes non-uniform refraction when sights are taken across large rivers or valleys.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-SUR-002',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'The combined correction for curvature and atmospheric refraction (in meters) for a sight distance D (in kilometers) is given by:',
    questionType: 'mcq',
    options: ['-0.0785 D^2', '-0.0673 D^2', '+0.0673 D^2', '-0.0112 D^2'],
    correctAnswer: 1,
    explanation: 'Curvature correction is Cc = -0.0785 D^2 (subtracts) and refraction correction is Cr = +0.0112 D^2 (adds). Combined correction C = Cc + Cr = -0.0673 D^2 meters.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-SUR-003',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'In a closed theodolite traverse, Bowditch\'s rule (compass rule) is applied for balancing when:',
    questionType: 'mcq',
    options: [
      'Linear measurements are more precise than angular measurements',
      'Angular measurements are more precise than linear measurements',
      'Linear and angular measurements are made with equal precision',
      'The traverse is run strictly along magnetic meridians'
    ],
    correctAnswer: 2,
    explanation: 'Bowditch\'s rule assumes accidental errors in linear measurements are proportional to √L and errors in angular measurements are inversely proportional to √L (equal precision).',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-SUR-004',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'Contour lines that cross each other or unite into a single line indicate the presence of which topographic feature?',
    questionType: 'mcq',
    options: ['A vertical cliff or an overhanging cliff / cave', 'A uniform gentle slope', 'A ridge line or valley line', 'A depression with no drainage'],
    correctAnswer: 0,
    explanation: 'Contour lines cannot cross each other except in the rare case of an overhanging cliff or cave. When contour lines merge into a single line, it indicates a vertical cliff.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-SUR-005',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'In tachometric surveying, if an anallatic lens is fitted in the telescope, the multiplying constant (k) and additive constant (c) are ideally:',
    questionType: 'mcq',
    options: ['k = 100, c = 0', 'k = 0, c = 100', 'k = 100, c = 0.3', 'k = 50, c = 0'],
    correctAnswer: 0,
    explanation: 'An anallatic lens places the optical center at the vertical axis, reducing the additive constant c = (f + d) to 0, while standard diaphragm spacing provides a multiplying constant k = (f / i) = 100.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-SUR-006',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'The sensitivity of a bubble tube on a surveyor\'s level increases when:',
    questionType: 'mcq',
    options: [
      'The radius of curvature of the internal tube decreases',
      'The viscosity and surface tension of the liquid increase',
      'The radius of curvature of the internal tube increases',
      'The length of the bubble is shortened'
    ],
    correctAnswer: 2,
    explanation: 'Sensitivity α = s / (n * R). Bubble sensitivity increases with a larger radius of curvature R, larger tube diameter, lower liquid viscosity and surface tension, and a longer bubble.',
    difficulty: 'Medium',
    marks: 2
  },
  {
    id: 'Q-SUR-007',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'The method of resection in plane table surveying is used for:',
    questionType: 'mcq',
    options: [
      'Locating the details surrounding a known station',
      'Establishing the position of the plane table station on the sheet using known ground points',
      'Plotting contour lines on steep terrain',
      'Measuring inaccessible horizontal angles'
    ],
    correctAnswer: 1,
    explanation: 'Resection is the process of determining the plotted position of the instrument station itself on the map by sighting points whose positions are already plotted.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-SUR-008',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'If the whole circle bearing (WCB) of a survey line AB is 245° 30\', its corresponding reduced Quadrantal Bearing (QB) is:',
    questionType: 'mcq',
    options: ['S 65° 30\' W', 'S 24° 30\' W', 'W 65° 30\' S', 'N 65° 30\' W'],
    correctAnswer: 0,
    explanation: '245°30\' lies in the 3rd quadrant (SW). Reduced Bearing = WCB - 180° = 245° 30\' - 180° 00\' = S 65° 30\' W.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-SUR-009',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'The length of a standard Gunter\'s chain is:',
    questionType: 'mcq',
    options: ['100 feet with 100 links', '66 feet with 100 links', '33 feet with 16 links', '20 meters with 100 links'],
    correctAnswer: 1,
    explanation: 'Gunter\'s chain (surveyor\'s chain) is 66 feet long and consists of 100 links, with each link measuring 0.66 ft (7.92 inches). 10 square chains equal 1 acre.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-SUR-010',
    subjectId: 'CE-202',
    subjectName: 'Surveying',
    questionText: 'In a horizontal circular curve of radius R and deflection angle Δ, the tangent length T is given by:',
    questionType: 'mcq',
    options: ['R * tan(Δ / 2)', 'R * sin(Δ / 2)', '2R * sin(Δ / 2)', 'R * cos(Δ / 2)'],
    correctAnswer: 0,
    explanation: 'From curve geometry, the tangent distance from the point of intersection (PI) to either tangent point (PC or PT) is T = R tan(Δ/2).',
    difficulty: 'Easy',
    marks: 1
  },

  // ==========================================
  // 3. CONCRETE TECHNOLOGY (CE-204) - 10 Questions
  // ==========================================
  {
    id: 'Q-CT-001',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'According to Abrams\' Law, the compressive strength of fully compacted concrete at a given age depends primarily upon:',
    questionType: 'mcq',
    options: [
      'The aggregate-to-cement ratio',
      'The water-to-cement ratio by mass',
      'The fineness modulus of fine aggregate',
      'The maximum nominal size of coarse aggregate'
    ],
    correctAnswer: 1,
    explanation: 'Abrams\' law states that for fully compacted concrete, compressive strength S = k1 / (k2^(w/c)), inversely dependent solely on the water-cement ratio.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-CT-002',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'The Le Chatelier apparatus is used to determine which critical property of Portland cement?',
    questionType: 'mcq',
    options: ['Compressive strength', 'Fineness of grinding', 'Soundness due to free lime', 'Initial and final setting times'],
    correctAnswer: 2,
    explanation: 'Le Chatelier apparatus measures the unconfined expansion (soundness) of Portland cement caused by excess free uncombined lime (CaO).',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-CT-003',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'Which Bogue compound is primarily responsible for the 28-day and later progressive long-term strength gain of Ordinary Portland Cement?',
    questionType: 'mcq',
    options: ['Tricalcium Aluminate (C3A)', 'Tetracalcium Aluminoferrite (C4AF)', 'Tricalcium Silicate (C3S)', 'Dicalcium Silicate (C2S)'],
    correctAnswer: 3,
    explanation: 'C3S hydrates rapidly and imparts early strength (up to 7-14 days). C2S hydrates slowly, generating less heat of hydration, and contributes to strength after 28 days and over months/years.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-CT-004',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'For heavily reinforced concrete bridge sections and congested column beam joints, what is the recommended slump range as per IS 456:2000?',
    questionType: 'mcq',
    options: ['0 – 25 mm', '25 – 75 mm', '100 – 150 mm', 'Over 200 mm'],
    correctAnswer: 2,
    explanation: 'As per IS 456 Clause 7.1, heavily reinforced sections in slabs, beams, and congested walls require high workability with a slump of 100 - 150 mm.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-CT-005',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'In the slump test, if the cone of concrete shears off along an inclined plane and slips sideways, the slump is recorded as:',
    questionType: 'mcq',
    options: ['True slump', 'Shear slump (test must be repeated)', 'Collapse slump', 'Zero slump'],
    correctAnswer: 1,
    explanation: 'A shear slump indicates a lack of cohesion in the mix. The test must be discarded and repeated on a fresh sample. If shear slump persists, the mix design lacks fines or cohesion.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-CT-006',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'What is the characteristic 28-day compressive strength (fck) represented by grade M30 concrete in IS 456:2000?',
    questionType: 'mcq',
    options: [
      '30 MPa on 150 mm cubes with not more than 5% of results falling below it',
      '30 MPa on 150 mm diameter x 300 mm cylinders',
      'Average strength of at least 30 MPa across 3 samples',
      '30 kg/cm2 on 100 mm cubes'
    ],
    correctAnswer: 0,
    explanation: 'In the Indian standard system, M30 designates a mix having a characteristic 28-day compressive strength of 30 N/mm2 (MPa) tested on standard 150 mm cubes with a 95% confidence interval.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-CT-007',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'Polycarboxylate ether (PCE) based superplasticizers achieve extraordinary water reduction through which primary mechanism?',
    questionType: 'mcq',
    options: ['Electrostatic repulsion only', 'Steric hindrance mechanism', 'Air entrainment foaming', 'Acceleration of C3A hydration'],
    correctAnswer: 1,
    explanation: 'Unlike traditional sulfonated naphthalene or melamine superplasticizers that rely on electrostatic charge, PCE polymers have long polyether side chains that provide steric hindrance.',
    difficulty: 'Hard',
    marks: 2
  },
  {
    id: 'Q-CT-008',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'The bulking of fine aggregate (sand) reaches its maximum percentage at a moisture content of approximately:',
    questionType: 'mcq',
    options: ['1% to 2%', '4% to 6%', '12% to 15%', '20% to 25%'],
    correctAnswer: 1,
    explanation: 'Moisture creates a thin surface tension meniscus around sand particles, pushing them apart. Bulking peaks at about 4% to 6% moisture content by weight and drops to zero when sand is fully submerged.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-CT-009',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'The Rebound Hammer (Schmidt Hammer) test is classified as what category of testing for hardened concrete?',
    questionType: 'mcq',
    options: ['Destructive test', 'Non-Destructive Test (NDT) measuring surface hardness', 'Ultrasonic pulse velocity test', 'Core sampling verification'],
    correctAnswer: 1,
    explanation: 'The Schmidt rebound hammer is a non-destructive testing (NDT) method governed by IS 13311 (Part 2) that measures surface hardness to estimate near-surface compressive strength.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-CT-010',
    subjectId: 'CE-204',
    subjectName: 'Concrete Technology',
    questionText: 'As per IS 10262:2019, the target mean compressive strength (f\'ck) for concrete mix design is calculated as:',
    questionType: 'mcq',
    options: ['f\'ck = fck + 1.65 * s', 'f\'ck = fck + 2.00 * s', 'f\'ck = fck - 1.65 * s', 'f\'ck = 1.15 * fck'],
    correctAnswer: 0,
    explanation: 'Target mean strength f\'ck = fck + 1.65s, where s is the standard deviation for the specified grade of concrete from IS 10262 table to ensure only 5% of test results fall below fck.',
    difficulty: 'Medium',
    marks: 2
  },

  // ==========================================
  // 4. GEOTECHNICAL ENGINEERING (CE-302) - 10 Questions
  // ==========================================
  {
    id: 'Q-GEO-001',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'If a soil sample has a void ratio e = 0.50, its porosity (n) is:',
    questionType: 'mcq',
    options: ['0.25 (25%)', '0.333 (33.3%)', '0.50 (50%)', '0.667 (66.7%)'],
    correctAnswer: 1,
    explanation: 'The relationship between porosity n and void ratio e is n = e / (1 + e). For e = 0.50, n = 0.50 / (1 + 0.50) = 0.50 / 1.50 = 0.333 or 33.3%.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-GEO-002',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'Darcy\'s Law for one-dimensional laminar fluid flow through saturated soils is expressed as v = k * i. In this equation, what does "v" represent?',
    questionType: 'mcq',
    options: ['True seepage velocity', 'Discharge velocity (apparent superficial velocity)', 'Pore water pressure gradient', 'Permeability coefficient'],
    correctAnswer: 1,
    explanation: 'v is the superficial discharge velocity (q/A). The actual average velocity through the tortuous interconnected pore channels is the seepage velocity vs = v / n.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-GEO-003',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'According to the Mohr-Coulomb failure criterion, the shear strength (τf) of a soil on any failure plane is defined by:',
    questionType: 'mcq',
    options: ['τf = c + σ * tan(φ)', 'τf = c * tan(φ) + σ', 'τf = c - σ * sin(φ)', 'τf = σ * cos(φ)'],
    correctAnswer: 0,
    explanation: 'Mohr-Coulomb failure criterion: τf = c + σ tan φ, where c is apparent cohesion, σ is normal stress on the failure plane, and φ is the angle of internal friction.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-GEO-004',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'In Casagrande\'s plasticity chart for soil classification (USCS and IS 1498), the equation of the "A-line" is given by:',
    questionType: 'mcq',
    options: ['PI = 0.73 * (LL - 20)', 'PI = 0.90 * (LL - 8)', 'PI = 0.50 * (LL - 15)', 'PI = 0.65 * (LL - 25)'],
    correctAnswer: 0,
    explanation: 'The A-line is PI = 0.73(LL - 20). Inorganic clays plot above the A-line, while organic soils and inorganic silts plot below the A-line.',
    difficulty: 'Medium',
    marks: 2
  },
  {
    id: 'Q-GEO-005',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'Quick sand condition occurs in saturated cohesionless soils when the critical hydraulic gradient (icr) equals:',
    questionType: 'mcq',
    options: ['icr = (G - 1) / (1 + e)', 'icr = (G + 1) / (1 + e)', 'icr = (G - 1) * (1 + e)', 'icr = 1.00 always'],
    correctAnswer: 0,
    explanation: 'The upward seepage force equals the submerged unit weight γ\' = (G - 1)γw / (1 + e). Critical hydraulic gradient icr = γ\' / γw = (G - 1) / (1 + e), typically ~1.0 for sand.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-GEO-006',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'Terzaghi\'s ultimate bearing capacity equation for a continuous strip footing on c-φ soil with horizontal ground is:',
    questionType: 'mcq',
    options: [
      'qu = c*Nc + q*Nq + 0.5*γ*B*Nγ',
      'qu = 1.3*c*Nc + q*Nq + 0.4*γ*B*Nγ',
      'qu = 1.2*c*Nc + q*Nq + 0.3*γ*B*Nγ',
      'qu = c*Nc + 2*q*Nq + γ*B*Nγ'
    ],
    correctAnswer: 0,
    explanation: 'For a general shear failure beneath a continuous strip footing, Terzaghi\'s formula is qu = c Nc + q Nq + 0.5 γ B Nγ, where Nc, Nq, Nγ are non-dimensional bearing capacity factors.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-GEO-007',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'Terzaghi\'s one-dimensional consolidation theory assumes that:',
    questionType: 'mcq',
    options: [
      'Water and soil grains are incompressible, and flow is 1D vertical obeying Darcy\'s law',
      'Soil is partially saturated and undergoes 3D lateral strain',
      'Permeability increases as void ratio decreases',
      'Consolidation takes place instantaneously without hydrodynamic lag'
    ],
    correctAnswer: 0,
    explanation: 'Terzaghi\'s classic 1D consolidation assumptions: soil is fully saturated and homogeneous, solid particles and water are incompressible, Darcy\'s law holds, and strain is 1D vertical.',
    difficulty: 'Medium',
    marks: 2
  },
  {
    id: 'Q-GEO-008',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'The active earth pressure coefficient (Ka) for a smooth vertical retaining wall supporting level cohesionless backfill with friction angle φ is:',
    questionType: 'mcq',
    options: ['(1 - sin φ) / (1 + sin φ)', '(1 + sin φ) / (1 - sin φ)', '1 / tan φ', 'tan(45° + φ/2)'],
    correctAnswer: 0,
    explanation: 'Rankine\'s active coefficient Ka = (1 - sin φ)/(1 + sin φ) = tan^2(45° - φ/2). Passive earth pressure coefficient Kp = 1/Ka.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-GEO-009',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'In the Standard Proctor Compaction test (IS 2720 Part 7), the mass of the rammer and free drop height are:',
    questionType: 'mcq',
    options: ['2.6 kg with 310 mm drop', '4.89 kg with 450 mm drop', '1.5 kg with 200 mm drop', '3.5 kg with 400 mm drop'],
    correctAnswer: 0,
    explanation: 'Standard Proctor compaction uses a 2.6 kg rammer dropped through 310 mm into a 1000 cc mould in 3 layers (25 blows each). Heavy/Modified compaction uses 4.89 kg dropped 450 mm in 5 layers.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-GEO-010',
    subjectId: 'CE-302',
    subjectName: 'Geotechnical Engineering',
    questionText: 'The Over-Consolidation Ratio (OCR) of a soil deposit is defined as:',
    questionType: 'mcq',
    options: [
      'Maximum past effective overburden pressure / Current existing effective overburden pressure',
      'Current effective overburden pressure / Maximum past effective pressure',
      'Total stress / Effective stress',
      'Plasticity index / Liquidity index'
    ],
    correctAnswer: 0,
    explanation: 'OCR = σ\'_p / σ\'_0. If OCR = 1, soil is normally consolidated (NC); if OCR > 1, soil is over-consolidated (OC).',
    difficulty: 'Medium',
    marks: 1
  },

  // ==========================================
  // 5. BUILDING MATERIALS (CE-103) - 10 Questions
  // ==========================================
  {
    id: 'Q-BM-001',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'As per IS 1077, what is the maximum water absorption permitted for First Class building bricks after 24 hours immersion in cold water?',
    questionType: 'mcq',
    options: ['10% by dry weight', '20% by dry weight', '25% by dry weight', '30% by dry weight'],
    correctAnswer: 1,
    explanation: 'According to IS 1077, First Class clay bricks shall not absorb more than 20% of their dry weight after 24 hours of cold water immersion (Second class: 22%).',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-BM-002',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'Efflorescence in burnt clay building bricks is caused by the presence of:',
    questionType: 'mcq',
    options: ['Alumina and silica', 'Soluble alkaline salts (sulfates of sodium, potassium, and calcium)', 'Iron oxide', 'Excess organic matter'],
    correctAnswer: 1,
    explanation: 'Efflorescence is the unsightly white crystalline deposition on brick surfaces caused by soluble alkaline salts (Na2SO4, K2SO4, CaSO4) leaching out during drying.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-BM-003',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'The central longitudinal core of a tree trunk, consisting of soft spongy dead cells around which annular rings develop, is called the:',
    questionType: 'mcq',
    options: ['Sapwood', 'Heartwood', 'Pith (or Medulla)', 'Cambium layer'],
    correctAnswer: 2,
    explanation: 'The pith (or medulla) is the innermost central core of the tree stem. It is the oldest part composed of soft cellular tissue.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-BM-004',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'Fineness of Portland cement is officially measured in the laboratory using Blaine\'s Air Permeability Apparatus to find its:',
    questionType: 'mcq',
    options: ['Specific surface area (m2/kg)', 'Vicat penetration depth', 'Soundness expansion index', 'Autoclave percentage expansion'],
    correctAnswer: 0,
    explanation: 'Blaine\'s air permeability test (IS 4031 Part 2) determines the specific surface area of cement expressed in m2/kg (minimum 225 m2/kg for OPC).',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-BM-005',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'Gypsum (CaSO4 · 2H2O) is added during the final grinding of cement clinker specifically to:',
    questionType: 'mcq',
    options: [
      'Increase the 28-day compressive strength',
      'Retard the flash setting time of C3A and allow sufficient placing time',
      'Impart grey color to the concrete',
      'Decrease the heat of hydration'
    ],
    correctAnswer: 1,
    explanation: 'Gypsum reacts with tricalcium aluminate (C3A) to form calcium sulfoaluminate (ettringite), preventing instantaneous flash set and regulating initial setting time.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-BM-006',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'Which class of fly ash possesses both pozzolanic and self-cementing properties due to high calcium oxide content (CaO > 10%)?',
    questionType: 'mcq',
    options: ['Class F Fly Ash', 'Class C Fly Ash', 'Condensed Silica Fume', 'Rice Husk Ash'],
    correctAnswer: 1,
    explanation: 'Class C fly ash, produced from burning sub-bituminous or lignite coal, has higher calcium content (>10-20% CaO) and exhibits self-cementitious hydraulic properties.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-BM-007',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'In structural timber, the moisture content corresponding to saturated cell walls with completely empty cell cavities is known as the:',
    questionType: 'mcq',
    options: ['Equilibrium Moisture Content (EMC)', 'Fiber Saturation Point (FSP)', 'Free Water Threshold', 'Dry Oven State'],
    correctAnswer: 1,
    explanation: 'The Fiber Saturation Point (FSP) occurs at roughly 25% to 30% moisture content in timber. Shrinkage and strength gains begin only below this point.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-BM-008',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'The nominal standard dimensions of a modular burnt clay brick as per Bureau of Indian Standards (IS 1077) are:',
    questionType: 'mcq',
    options: ['190 mm x 90 mm x 90 mm', '200 mm x 100 mm x 100 mm', '225 mm x 112 mm x 75 mm', '230 mm x 115 mm x 75 mm'],
    correctAnswer: 0,
    explanation: 'Standard modular size of brick without mortar is 190 mm x 90 mm x 90 mm. With 10 mm mortar joints, the nominal modular size becomes 200 mm x 100 mm x 100 mm.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-BM-009',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'Thermo-Mechanically Treated (TMT) steel reinforcement bars achieve their superior ductility and high tensile yield strength through:',
    questionType: 'mcq',
    options: [
      'Alloying with high percentages of chromium and nickel',
      'Rapid water quenching forming a tempered martensite outer ring and ductile ferrite-pearlite core',
      'Cold twisting and drawing at room temperature',
      'Annealing at high temperatures in vacuum ovens'
    ],
    correctAnswer: 1,
    explanation: 'TMT process involves controlled water quenching of red-hot rebar, creating a hard tempered martensitic outer skin with high yield strength and a soft ductile ferrite-pearlite inner core.',
    difficulty: 'Hard',
    marks: 2
  },
  {
    id: 'Q-BM-010',
    subjectId: 'CE-103',
    subjectName: 'Building Materials',
    questionText: 'Granite is geologically classified as what type of rock?',
    questionType: 'mcq',
    options: ['Plutonic igneous rock', 'Volcanic igneous rock', 'Sedimentary calcareous rock', 'Foliated metamorphic rock'],
    correctAnswer: 0,
    explanation: 'Granite is a plutonic (intrusive) igneous rock formed by the slow cooling and crystallization of magma deep beneath the Earth\'s crust, giving it an unstratified crystalline texture.',
    difficulty: 'Easy',
    marks: 1
  },

  // ==========================================
  // 6. ESTIMATION & COSTING (CE-401) - 10 Questions
  // ==========================================
  {
    id: 'Q-EST-001',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'In building estimation, the carpet area represents:',
    questionType: 'mcq',
    options: [
      'Total built-up plinth area including wall thicknesses',
      'The usable covered floor area inside apartments excluding walls, columns, stairs, and corridors',
      'The plot area inside boundary walls',
      'The gross floor area minus external setbacks'
    ],
    correctAnswer: 1,
    explanation: 'Carpet area is the net usable floor area where a carpet can be laid, excluding wall thicknesses, balconies, verandas, common stairs, lift wells, and utility ducts.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-EST-002',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'In the Center Line method of building estimation, when two walls intersect at an L-junction (corner), the deduction from the total center line length is:',
    questionType: 'mcq',
    options: ['Zero deduction', 'Half the wall thickness', 'Full wall thickness', 'Double the wall thickness'],
    correctAnswer: 0,
    explanation: 'At an L-corner junction, no deduction is required because the center line length naturally accounts for the turn. For T-junctions, half the wall thickness (b/2) is deducted.',
    difficulty: 'Medium',
    marks: 2
  },
  {
    id: 'Q-EST-003',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'What standard percentage is typically added to a detailed estimate to cover unforeseen expenses and contingencies?',
    questionType: 'mcq',
    options: ['0.5% to 1%', '3% to 5%', '10% to 15%', '20% to 25%'],
    correctAnswer: 1,
    explanation: 'In public works engineering estimates (CPWD/PWD), 3% to 5% of the estimated cost of works is added as a provision for contingencies and unforeseen items.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-EST-004',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'The value of a dismantled building structure or scrap material at the end of its useful design life without further utility is known as:',
    questionType: 'mcq',
    options: ['Salvage value', 'Scrap value (junk value)', 'Book value', 'Market replacement value'],
    correctAnswer: 1,
    explanation: 'Scrap value is the value of dismantled materials (steel, bricks, scrap wood) when an asset is broken up. Salvage value is the utility value of an asset without dismantling.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-EST-005',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'What is the standard unit of measurement for damp proof course (DPC) in civil engineering works as per IS 1200?',
    questionType: 'mcq',
    options: ['Cubic meters (m3)', 'Square meters (m2)', 'Running meters (m)', 'Metric tonnes (t)'],
    correctAnswer: 1,
    explanation: 'As per IS 1200 (Part 2), Damp Proof Course (DPC) is measured in square meters (m2) with the thickness explicitly specified in the item description.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-EST-006',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'In Bar Bending Schedules (BBS), the cutting length of a bar with a standard 90° bend is calculated by deducting:',
    questionType: 'mcq',
    options: ['1d (where d = diameter of bar)', '2d', '3d', '4d'],
    correctAnswer: 1,
    explanation: 'Standard BBS bend deductions: for 45° bend deduct 1d; for 90° bend deduct 2d; for 135° bend deduct 3d; for 180° hook deduct 4d.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-EST-007',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'In rate analysis for building works, the standard allowance for Contractor\'s Profit and Overhead combined is typically taken as:',
    questionType: 'mcq',
    options: ['5%', '10%', '15%', '25%'],
    correctAnswer: 1,
    explanation: 'In standard CPWD rate analysis, 10% is conventionally added on the cost of materials and labor to cover contractor profit and overheads.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-EST-008',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'Under the straight-line method of depreciation, annual depreciation (D) of a property with initial cost C, scrap value S, and useful life n years is:',
    questionType: 'mcq',
    options: ['D = (C - S) / n', 'D = (C + S) / n', 'D = C / (n * S)', 'D = (C - S) * n'],
    correctAnswer: 0,
    explanation: 'Straight-line depreciation assumes uniform loss of value over life: Annual Depreciation D = (Original Cost C - Scrap Value S) / Design Life n.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-EST-009',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'The volume of dry mortar required for 1 cubic meter of standard brickwork is approximately:',
    questionType: 'mcq',
    options: ['0.10 m3', '0.30 m3', '0.55 m3', '0.75 m3'],
    correctAnswer: 1,
    explanation: 'Standard modular brickwork requires about 500 bricks per cubic meter. The wet mortar volume is ~0.23 m3, which corresponds to roughly 0.30 m3 of dry mortar (adding ~30% for voids and waste).',
    difficulty: 'Medium',
    marks: 2
  },
  {
    id: 'Q-EST-010',
    subjectId: 'CE-401',
    subjectName: 'Estimation & Costing',
    questionText: 'Earnest Money Deposit (EMD) submitted by a contractor alongside a tender typically ranges between what percentage of the estimated contract value?',
    questionType: 'mcq',
    options: ['0.1% to 0.5%', '1% to 2%', '10% to 15%', '20% to 25%'],
    correctAnswer: 1,
    explanation: 'EMD guarantees the bona fide nature of the bidder and prevents frivolous bidding. In CPWD tenders, it typically ranges between 1% and 2% of the estimated cost of work put to tender.',
    difficulty: 'Medium',
    marks: 1
  },

  // ==========================================
  // 7. TRANSPORTATION ENGINEERING (CE-305) - 10 Questions
  // ==========================================
  {
    id: 'Q-TE-001',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'As per IRC:73 guidelines, the design driver reaction time (t) for calculating Stopping Sight Distance (SSD) on Indian rural highways is:',
    questionType: 'mcq',
    options: ['1.0 second', '2.5 seconds', '4.0 seconds', '5.0 seconds'],
    correctAnswer: 1,
    explanation: 'IRC recommends a perception-reaction time of 2.5 seconds for SSD design based on PIEV (Perception, Intellection, Emotion, Volition) theory.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-TE-002',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'What is the maximum limit of super-elevation (e_max) permitted by the Indian Roads Congress (IRC) on plain and rolling highway terrain?',
    questionType: 'mcq',
    options: ['4% (0.04)', '7% (0.07)', '10% (0.10)', '12% (0.12)'],
    correctAnswer: 1,
    explanation: 'As per IRC:73, maximum super-elevation is 7% for plain and rolling terrain, 10% for hilly areas not bound by snow, and 4% for urban roads with frequent intersections.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-TE-003',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'The California Bearing Ratio (CBR) test on highway subgrade evaluates soil strength by penetrating a plunger at a standard rate of:',
    questionType: 'mcq',
    options: ['0.5 mm/min', '1.25 mm/min', '5.0 mm/min', '10 mm/min'],
    correctAnswer: 1,
    explanation: 'The standard CBR test (IS 2720 Part 16) pushes a 50 mm diameter cylindrical plunger into soil at a controlled strain rate of 1.25 mm/min, comparing loads at 2.5 mm and 5.0 mm penetration.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-TE-004',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'In geometric design of highways, extra widening on a horizontal curve of radius R with number of lanes n and wheelbase length l consists of mechanical widening (Wm) equal to:',
    questionType: 'mcq',
    options: ['n * l^2 / (2R)', 'V / (9.5 * √R)', 'n * l / R', 'l^2 / R'],
    correctAnswer: 0,
    explanation: 'Mechanical off-tracking widening Wm = n l^2 / (2R). Psychological widening Wps = V / (9.5 √R). Total extra widening We = Wm + Wps.',
    difficulty: 'Medium',
    marks: 2
  },
  {
    id: 'Q-TE-005',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'In the Marshall stability test for bituminous concrete mix design, the cylindrical specimen is maintained in a water bath at what standard temperature before loading?',
    questionType: 'mcq',
    options: ['25°C for 2 hours', '60°C for 30 to 40 minutes', '100°C for 15 minutes', '0°C for 1 hour'],
    correctAnswer: 1,
    explanation: 'Marshall specimens are immersed in a water bath at 60°C ± 1°C for 30 to 40 minutes to simulate maximum pavement operating temperature under summer traffic.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-TE-006',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'The Los Angeles abrasion value for aggregate used in wearing surfaces of bituminous concrete roads should not exceed:',
    questionType: 'mcq',
    options: ['15%', '30%', '50%', '65%'],
    correctAnswer: 1,
    explanation: 'IRC specifies that coarse aggregate used in surface wearing courses (BC/SDBC) must have a Los Angeles abrasion value not exceeding 30% to withstand high tire wear.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-TE-007',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'The ideal shape recommended for a transition curve on highways to ensure uniform rate of introduction of centrifugal acceleration is a:',
    questionType: 'mcq',
    options: ['Clothoid (Euler spiral)', 'Cubic parabola', 'Lemniscate', 'Compound circular arc'],
    correctAnswer: 0,
    explanation: 'The Euler spiral (clothoid) is the ideal transition curve because its radius of curvature decreases linearly with arc length (L * R = constant), introducing super-elevation and centrifugal force uniformly.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-TE-008',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'Equilibrium super-elevation for a railway broad gauge (1.676 m) track travelling at design speed V (in km/h) on a curve of radius R (in m) is given by:',
    questionType: 'mcq',
    options: ['C = G * V^2 / (127 * R)', 'C = V^2 / (225 * R)', 'C = G * V / (127 * √R)', 'C = 1.676 * V^2 / R'],
    correctAnswer: 0,
    explanation: 'Cant C = G V^2 / (127 R), where G is dynamic gauge (1.75 m for broad gauge), V is speed in km/h, and R is curve radius in meters.',
    difficulty: 'Hard',
    marks: 2
  },
  {
    id: 'Q-TE-009',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'What is the purpose of providing dowel bars across transverse joints in cement concrete pavements?',
    questionType: 'mcq',
    options: [
      'To prevent longitudinal cracking',
      'To transfer wheel loads across adjacent slabs while allowing longitudinal expansion and contraction',
      'To hold lane markings in position',
      'To anchor the slab to the granular subbase'
    ],
    correctAnswer: 1,
    explanation: 'Dowel bars are smooth round steel bars placed across transverse expansion/contraction joints to transfer wheel loads effectively between adjoining slabs without restricting horizontal thermal movement.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-TE-0010',
    subjectId: 'CE-305',
    subjectName: 'Transportation Engineering',
    questionText: 'An aggregate is classified as "flaky" if its least dimension (thickness) is less than what fraction of its mean sieve dimension?',
    questionType: 'mcq',
    options: ['0.3 (3/10)', '0.6 (3/5)', '0.8 (4/5)', '0.5 (1/2)'],
    correctAnswer: 1,
    explanation: 'As per IS 2386 (Part 1), an aggregate particle is flaky if its thickness is less than 0.6 (three-fifths) of its mean sieve dimension.',
    difficulty: 'Easy',
    marks: 1
  },

  // ==========================================
  // 8. FLUID MECHANICS (CE-201) - 10 Questions
  // ==========================================
  {
    id: 'Q-FM-001',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'Bernoulli\'s equation along a streamline for steady, incompressible, frictionless (inviscid) fluid flow represents the conservation of:',
    questionType: 'mcq',
    options: ['Total linear momentum', 'Total mechanical energy per unit weight', 'Mass continuity', 'Angular momentum'],
    correctAnswer: 1,
    explanation: 'Bernoulli\'s theorem p/γ + v^2/(2g) + z = constant is an expression of the conservation of mechanical energy per unit weight (pressure energy + kinetic energy + potential energy).',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-FM-002',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'For fluid flow through circular pipes, the flow is definitively considered laminar when the Reynolds number (Re) is:',
    questionType: 'mcq',
    options: ['Less than 2,000', 'Between 2,000 and 4,000', 'Greater than 4,000', 'Greater than 10,000'],
    correctAnswer: 0,
    explanation: 'For internal pipe flow, the lower critical Reynolds number is 2,000. Flow is laminar for Re < 2,000, transitional between 2,000 and 4,000, and turbulent for Re > 4,000.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-FM-003',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'In a venturimeter, the typical value of the discharge coefficient (Cd) ranges between:',
    questionType: 'mcq',
    options: ['0.60 to 0.65', '0.70 to 0.75', '0.82 to 0.88', '0.96 to 0.98'],
    correctAnswer: 3,
    explanation: 'Because of smooth gradual convergent-divergent boundaries and minimal boundary layer separation, head losses in a venturimeter are very low, resulting in a high Cd of 0.96 to 0.98.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-FM-004',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'The head loss due to sudden expansion in a pipe flow where fluid velocity drops from V1 to V2 is given by:',
    questionType: 'mcq',
    options: ['(V1 - V2)^2 / (2g)', '0.5 * V1^2 / (2g)', '(V1^2 - V2^2) / (2g)', 'V1 * V2 / (2g)'],
    correctAnswer: 0,
    explanation: 'By applying momentum and continuity equations across sudden expansion eddies, Borda-Carnot formula yields h_L = (V1 - V2)^2 / (2g).',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-FM-005',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'A hydraulic jump occurs in an open channel flow when the flow transitions from:',
    questionType: 'mcq',
    options: [
      'Subcritical flow (Froude Fr < 1) to Supercritical flow (Fr > 1)',
      'Supercritical flow (Froude Fr > 1) to Subcritical flow (Fr < 1)',
      'Laminar state to transitional state',
      'Uniform flow to gradually varied flow'
    ],
    correctAnswer: 1,
    explanation: 'A hydraulic jump is a rapidly varied flow phenomenon where shooting supercritical flow (Fr > 1) abruptly slows down and dissipates energy into tranquil subcritical flow (Fr < 1).',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-FM-006',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'In Manning\'s formula for open channel uniform flow V = (1/n) * R^(2/3) * S^(1/2), what does "R" represent?',
    questionType: 'mcq',
    options: ['Channel roughness coefficient', 'Hydraulic radius = Area (A) / Wetted Perimeter (P)', 'Reynolds number', 'Radius of pipe cross section'],
    correctAnswer: 1,
    explanation: 'R is the hydraulic radius defined as the cross-sectional flow area (A) divided by the wetted perimeter (P) in contact with the fluid.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-FM-007',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'The center of pressure on an inclined submerged plane surface always lies:',
    questionType: 'mcq',
    options: ['Above the centroid of the area', 'Below the centroid of the area', 'At the centroid of the area', 'At the free liquid surface'],
    correctAnswer: 1,
    explanation: 'Since hydrostatic pressure increases linearly with depth, the resultant force vector acts through the center of pressure, which is always located below the centroid of the submerged surface.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-FM-008',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'For a floating body to remain in stable equilibrium, its Metacentric Height (GM) must be:',
    questionType: 'mcq',
    options: ['Positive (Metacenter M lies above Center of Gravity G)', 'Zero', 'Negative (Metacenter M lies below G)', 'Equal to the center of buoyancy'],
    correctAnswer: 0,
    explanation: 'When Metacenter M is above G (GM > 0), a restoring righting couple is generated upon tilting, ensuring stable equilibrium.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-FM-009',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'Darcy-Weisbach friction factor (f) for fully developed laminar flow in a smooth circular pipe is calculated as:',
    questionType: 'mcq',
    options: ['f = 16 / Re', 'f = 64 / Re', 'f = 0.079 / Re^(0.25)', 'f = 0.316 / Re^(0.25)'],
    correctAnswer: 1,
    explanation: 'From Hagen-Poiseuille law for laminar pipe flow, hf = 32 μ v L / (γ D^2). Comparing with Darcy-Weisbach equation hf = f L v^2 / (2g D) gives f = 64 / Re.',
    difficulty: 'Medium',
    marks: 2
  },
  {
    id: 'Q-FM-010',
    subjectId: 'CE-201',
    subjectName: 'Fluid Mechanics',
    questionText: 'What is the most hydraulically efficient cross-section for an open channel having a trapezoidal shape with side slopes 1:m (vertical:horizontal)?',
    questionType: 'mcq',
    options: [
      'Semi-hexagon with side slope of 60° to the horizontal (m = 1/√3)',
      'Rectangular section with width = depth',
      'Triangular section with 90° vertex angle',
      'Trapezoid with 45° side slope'
    ],
    correctAnswer: 0,
    explanation: 'The most efficient trapezoidal section is a half-hexagon where hydraulic radius R = y/2 and sides make a 60° angle with the horizontal (m = 1/√3).',
    difficulty: 'Hard',
    marks: 2
  },

  // ==========================================
  // 9. RCC DESIGN (CE-304) - 10 Questions
  // ==========================================
  {
    id: 'Q-RCC-001',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'As per IS 456:2000, what is the maximum compressive strain in concrete under axial flexural compression at the extreme compression fiber?',
    questionType: 'mcq',
    options: ['0.0020', '0.0035', '0.0045', '0.0050'],
    correctAnswer: 1,
    explanation: 'Clause 38.1(b) of IS 456:2000 specifies that the maximum compressive strain in concrete at the outermost compression fiber in bending is taken as 0.0035.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-RCC-002',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'According to IS 456:2000, what is the minimum percentage of tensile reinforcement (Ast,min) required in a rectangular beam?',
    questionType: 'mcq',
    options: [
      'Ast / (b * d) = 0.85 / fy',
      'Ast / (b * d) = 0.12%',
      'Ast / (b * d) = 0.40 / fy',
      'Ast / (b * d) = 4.0%'
    ],
    correctAnswer: 0,
    explanation: 'IS 456:2000 Clause 26.5.1.1 dictates that minimum tensile steel in beams shall be: (Ast / bd) >= 0.85 / fy to prevent brittle failure upon concrete cracking.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-RCC-003',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'For Fe 415 grade steel bars, the limiting neutral axis depth ratio (xu,max / d) in limit state flexural design is:',
    questionType: 'mcq',
    options: ['0.53', '0.48', '0.46', '0.42'],
    correctAnswer: 1,
    explanation: 'From strain compatibility: xu,max/d = 0.0035 / (0.0055 + 0.87*fy/Es). For Fe 250: 0.53; for Fe 415: 0.48; for Fe 500: 0.46.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-RCC-004',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'The basic development length (Ld) of a tension reinforcement bar of diameter φ is given by IS 456:2000 as:',
    questionType: 'mcq',
    options: [
      'Ld = (φ * 0.87 * fy) / (4 * τbd)',
      'Ld = (φ * fy) / (2 * τbd)',
      'Ld = (φ * 0.87 * fy) / (8 * τbd)',
      'Ld = 40 * φ always'
    ],
    correctAnswer: 0,
    explanation: 'Equating tensile force in bar to bond resistance over length Ld: (π φ^2 / 4)(0.87 fy) = π φ Ld τbd => Ld = (φ * 0.87 * fy) / (4 * τbd).',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-RCC-005',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'What is the maximum spacing of shear stirrups permitted by IS 456:2000 along the axis of an RCC beam?',
    questionType: 'mcq',
    options: ['0.75 d or 300 mm, whichever is less', '1.0 d or 450 mm', '0.50 d or 200 mm', '300 mm strictly'],
    correctAnswer: 0,
    explanation: 'Clause 26.5.1.5 of IS 456 specifies that the maximum spacing of vertical stirrups along the axis of the beam shall not exceed 0.75 d or 300 mm, whichever is less.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-RCC-006',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'An RCC column is considered a "short column" as per IS 456:2000 if both its slenderness ratios (lex/D and ley/b) are:',
    questionType: 'mcq',
    options: ['Less than 12', 'Less than 24', 'Between 12 and 18', 'Less than 30'],
    correctAnswer: 0,
    explanation: 'As per Clause 25.1.2 of IS 456, a compression member is classified as a short column when the effective length divided by lateral dimension ratio is less than 12.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-RCC-007',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'The nominal concrete cover to meet "Moderate" environmental durability exposure conditions for RCC structures as per Table 16 of IS 456 is:',
    questionType: 'mcq',
    options: ['20 mm', '30 mm', '45 mm', '50 mm'],
    correctAnswer: 1,
    explanation: 'IS 456 Table 16 minimum nominal cover: Mild = 20 mm, Moderate = 30 mm, Severe = 45 mm, Very Severe = 50 mm, Extreme = 75 mm.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-RCC-008',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'In a two-way slab supported on four edges with corners held down, torsion reinforcement must be provided at any corner where both edges are discontinuous. The area of corner torsion steel shall be:',
    questionType: 'mcq',
    options: [
      'Three-fourths (75%) of the maximum mid-span positive moment steel',
      'Half (50%) of the mid-span steel',
      'Equal to the minimum temperature steel (0.12%)',
      'Double the mid-span steel'
    ],
    correctAnswer: 0,
    explanation: 'Clause D-1.8 of Annex D of IS 456:2000 states that corner torsion reinforcement equal to 0.75 times the maximum mid-span moment steel must be provided in both top and bottom meshes over a square area of Lx/5.',
    difficulty: 'Hard',
    marks: 2
  },
  {
    id: 'Q-RCC-009',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'What is the modulus of elasticity of concrete (Ec) in MPa as recommended by IS 456:2000 in terms of characteristic cube strength fck?',
    questionType: 'mcq',
    options: ['Ec = 5000 * √fck', 'Ec = 5700 * √fck', 'Ec = 4500 * √fck', 'Ec = 2000 * fck'],
    correctAnswer: 0,
    explanation: 'Clause 6.2.3.1 of IS 456:2000 defines short-term static modulus of elasticity of concrete as Ec = 5000 √fck (note: earlier 1978 version was 5700 √fck).',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-RCC-010',
    subjectId: 'CE-304',
    subjectName: 'RCC Design',
    questionText: 'In limit state design of beams, when the actual neutral axis depth xu is greater than the limiting depth xu,max, the section is termed as:',
    questionType: 'mcq',
    options: [
      'Under-reinforced section (ductile steel yield failure)',
      'Over-reinforced section (brittle explosive concrete crushing failure)',
      'Balanced section',
      'Secondary compression section'
    ],
    correctAnswer: 1,
    explanation: 'When xu > xu,max, steel does not yield before concrete reaches its ultimate strain 0.0035. The section is over-reinforced and fails suddenly without warning, which IS 456 explicitly prohibits.',
    difficulty: 'Medium',
    marks: 1
  },

  // ==========================================
  // 10. ENVIRONMENTAL ENGINEERING (CE-306) - 10 Questions
  // ==========================================
  {
    id: 'Q-ENV-001',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'Standard Biochemical Oxygen Demand (BOD5) test of water and wastewater samples is officially incubated at what conditions?',
    questionType: 'mcq',
    options: ['20°C for 5 days', '25°C for 3 days', '37°C for 24 hours', '100°C for 2 hours'],
    correctAnswer: 0,
    explanation: 'The standard BOD5 test measures the dissolved oxygen consumed by aerobic microorganisms decomposing organic matter incubated in dark at 20°C for 5 days.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-ENV-002',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'Why is the Chemical Oxygen Demand (COD) value of municipal wastewater virtually always higher than its BOD5 value?',
    questionType: 'mcq',
    options: [
      'COD measures only nitrogenous oxygen demand',
      'COD chemically oxidizes both biologically biodegradable and non-biodegradable organic matter using strong potassium dichromate',
      'BOD test is inhibited by heavy metals',
      'COD is measured at sub-zero temperatures'
    ],
    correctAnswer: 1,
    explanation: 'COD uses boiling potassium dichromate (K2Cr2O7) in concentrated sulfuric acid, oxidising almost all organic matter including refractory compounds that biological organisms cannot digest in 5 days.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-ENV-003',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'Breakpoint chlorination in water purification represents the point on the residual chlorine curve where:',
    questionType: 'mcq',
    options: [
      'Chlorine demand is first detected',
      'All ammonia chloramines and reducing compounds are completely oxidized, and free residual chlorine begins to appear linearly',
      'Trihalomethanes reach toxic concentration',
      'Disinfection efficacy drops to zero'
    ],
    correctAnswer: 1,
    explanation: 'At the breakpoint, all combined chlorine (mono/di-chloramines) is destroyed. Beyond the breakpoint, any added chlorine appears directly as free available residual chlorine (HOCl/OCl-).',
    difficulty: 'Medium',
    marks: 2
  },
  {
    id: 'Q-ENV-004',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'What is the typical filtration rate of a Rapid Sand Gravity Filter compared to a Slow Sand Filter?',
    questionType: 'mcq',
    options: [
      'Rapid sand filter is approximately 30 times faster (3,000 - 6,000 L/m2/h vs 100 - 200 L/m2/h)',
      'Both filter at the same rate',
      'Rapid sand filter is 5 times slower',
      'Rapid sand filter filters 1,000 times faster'
    ],
    correctAnswer: 0,
    explanation: 'Slow sand filters operate at 100 to 200 L/m2/hr through biological Schmutzdecke layer. Rapid sand filters operate at 3,000 to 6,000 L/m2/hr (roughly 30 times faster).',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-ENV-005',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'The self-purification and oxygen sag curve of a river receiving municipal wastewater discharge is mathematically governed by the:',
    questionType: 'mcq',
    options: ['Streeter-Phelps Equation', 'Darcy-Weisbach Equation', 'Hazen-Williams Formula', 'Fanning Friction Model'],
    correctAnswer: 0,
    explanation: 'The Streeter-Phelps oxygen sag equation balances deoxygenation due to biochemical oxidation of organic pollutants (K1) against reaeration from atmospheric oxygen transfer (K2).',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-ENV-006',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'Total hardness in potable municipal water is primarily caused by dissolved divalent cations of:',
    questionType: 'mcq',
    options: ['Calcium (Ca2+) and Magnesium (Mg2+)', 'Sodium (Na+) and Potassium (K+)', 'Lead (Pb2+) and Arsenic (As3+)', 'Iron (Fe2+) only'],
    correctAnswer: 0,
    explanation: 'Water hardness is primarily caused by multivalent metallic cations, predominantly calcium (Ca2+) and magnesium (Mg2+) associated with bicarbonates (temporary) and chlorides/sulfates (permanent).',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-ENV-007',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'In the Activated Sludge Process (ASP) of sewage treatment, the Sludge Volume Index (SVI) is a standard diagnostic test used to evaluate:',
    questionType: 'mcq',
    options: [
      'The settling characteristics and bulking tendency of the mixed liquor biological floc',
      'The pathogen mortality rate in aeration basins',
      'The concentration of dissolved heavy metals',
      'The nitrogen-to-phosphorus ratio'
    ],
    correctAnswer: 0,
    explanation: 'SVI is the volume in mL occupied by 1 g of activated sludge after 30 min settling in a 1-liter cylinder. An SVI > 150 mL/g indicates filamentous sludge bulking and poor settling.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-ENV-008',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'As per the Bureau of Indian Standards (IS 10500:2012 Drinking Water Specification), the acceptable limit for fluoride in drinking water is:',
    questionType: 'mcq',
    options: ['1.0 mg/L (permissible up to 1.5 mg/L in absence of alternate source)', '5.0 mg/L', '0.01 mg/L', '10.0 mg/L'],
    correctAnswer: 0,
    explanation: 'IS 10500 specifies an acceptable limit of 1.0 mg/L for fluoride. Concentrations above 1.5 mg/L cause dental fluorosis (mottling of enamel) and skeletal fluorosis.',
    difficulty: 'Easy',
    marks: 1
  },
  {
    id: 'Q-ENV-009',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'The typical design surface overflow rate (SOR) for a primary sedimentation tank in municipal sewage treatment is:',
    questionType: 'mcq',
    options: ['25 – 35 m3/m2/day', '100 – 150 m3/m2/day', '5 – 10 m3/m2/day', '200 – 300 m3/m2/day'],
    correctAnswer: 0,
    explanation: 'Standard design surface overflow rate for primary settling tanks treating raw wastewater is 25 to 35 m3/m2/day (peak flow up to 45-50 m3/m2/day) with detention time ~2 hours.',
    difficulty: 'Medium',
    marks: 1
  },
  {
    id: 'Q-ENV-010',
    subjectId: 'CE-306',
    subjectName: 'Environmental Engineering',
    questionText: 'Which mathematical formula is recommended by the CPHEEO manual for calculating hydraulic friction head loss in pressurized municipal water transmission pipelines?',
    questionType: 'mcq',
    options: ['Hazen-Williams formula', 'Euler Bernoulli equation', 'Kutter formula', 'Prony equation'],
    correctAnswer: 0,
    explanation: 'The CPHEEO water supply manual uses the Hazen-Williams equation V = 0.849 C R^0.63 S^0.54 for pressure pipes because of its empirical accuracy and ease of use for water flow.',
    difficulty: 'Easy',
    marks: 1
  }
];

