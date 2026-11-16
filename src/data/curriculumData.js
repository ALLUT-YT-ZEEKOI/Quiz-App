// CohesionTech - Curriculum & Assessment Dataset
// Hierarchy: Subjects -> Modules -> Videos & Questions (Easy / Medium / Hard)

export const INITIAL_CURRICULUM = [
  {
    id: 'sub-malayalam',
    name: 'Malayalam (മലയാളം)',
    code: 'MAL-101',
    category: 'Language & Grammar',
    description: 'Foundations of Malayalam language, alphabet (അക്ഷരമാല), sandhi (സന്ധികൾ), grammar rules, and reading comprehension.',
    color: '#059669', // Emerald
    icon: 'BookOpen',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    modules: [
      {
        id: 'mod-mal-1',
        title: 'Module 1: Aksharamala & Swarangal (അക്ഷരമാല & സ്വരങ്ങൾ)',
        description: 'Vowels, consonants, chillu letters, and proper phonetic pronunciation rules in Malayalam.',
        duration: '45 mins',
        videos: [
          {
            id: 'vid-mal-101',
            title: 'Lesson 1: Swarangal (സ്വരങ്ങൾ) - 15 Vowels & Pronunciation',
            duration: '12:30',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Comprehensive phonetic guide covering all 15 Malayalam vowels with visual mouth positions.',
            notes: 'Practice: അ, ആ, ഇ, ഈ, ഉ, ഊ, ഋ, ഌ, എ, ഏ, ഐ, ഒ, ഓ, ഔ, അം, അഃ'
          },
          {
            id: 'vid-mal-102',
            title: 'Lesson 2: Chillezhuthukal (ചില്ലക്ഷരങ്ങൾ) & Their Usage',
            duration: '14:15',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Understanding the 5 primary chillu letters: ൽ, ൾ, ൻ, ൺ, ർ and their writing conventions.',
            notes: 'Chillu letters do not require a virama (ചന്ദ്രക്കല) when standing alone.'
          }
        ],
        questions: [
          {
            id: 'q-mal-101',
            question: 'മലയാള അക്ഷരമാലയിലെ ആദ്യത്തെ സ്വരാക്ഷരം ഏതാണ്? (Which is the first vowel?)',
            difficulty: 'Easy',
            options: ['അ (A)', 'ആ (Aa)', 'ഇ (I)', 'ഉ (U)'],
            correctAnswer: 0,
            explanation: 'മലയാള അക്ഷരമാലയിലെ ആദ്യ സ്വരാക്ഷരം "അ" ആണ്.'
          },
          {
            id: 'q-mal-102',
            question: 'താഴെ കൊടുത്തിട്ടുള്ളവയിൽ ചില്ലക്ഷരം (Chillu letter) ഏതാണ്?',
            difficulty: 'Easy',
            options: ['ക', 'ൽ', 'മ', 'ത'],
            correctAnswer: 1,
            explanation: '"ൽ" എന്നത് മലയാളത്തിലെ പ്രധാനപ്പെട്ട ഒരു ചില്ലക്ഷരമാണ്.'
          },
          {
            id: 'q-mal-103',
            question: 'മലയാളത്തിൽ ആകെ എത്ര പ്രധാന ചില്ലക്ഷരങ്ങൾ ഉണ്ട്? (How many primary chillu letters?)',
            difficulty: 'Medium',
            options: ['3', '5', '7', '10'],
            correctAnswer: 1,
            explanation: 'മലയാളത്തിൽ പ്രധാനമായും 5 ചില്ലക്ഷരങ്ങളാണ് ഉള്ളത് (ൽ, ൾ, ൻ, ൺ, ർ).'
          },
          {
            id: 'q-mal-104',
            question: '"അമ്മ" എന്ന പദത്തിൽ വരുന്ന "മ്മ" ഏതു തരം അക്ഷരക്കൂട്ടാണ്?',
            difficulty: 'Medium',
            options: ['സ്വരസന്ധി', 'ദ്വിത്വം (സംയുക്താക്ഷരം)', 'ചില്ല്', 'വിസർഗ്ഗം'],
            correctAnswer: 1,
            explanation: '"മ് + മ = മ്മ" എന്നത് ഒരേ വ്യഞ്ജനം ഇരട്ടിച്ചു വരുന്ന ദ്വിത്വമാണ്.'
          },
          {
            id: 'q-mal-105',
            question: 'താഴെ പറയുന്നവയിൽ "ലോപസന്ധി" (Lopasandhi) ക്ക് ഉദാഹരണം ഏതാണ്?',
            difficulty: 'Hard',
            options: ['കാറ്റടിക്കുന്നു (കാറ്റ് + അടിക്കുന്നു)', 'മൺപാത്രം (മൺ + പാത്രം)', 'തിരുമേനി (തിരു + മേനി)', 'പാലപ്പം (പാൽ + അപ്പം)'],
            correctAnswer: 0,
            explanation: 'കാറ്റ് + അടിക്കുന്നു = കാറ്റടിക്കുന്നു. ഇതിൽ "കാറ്റ്" എന്നതിലെ "ഉ" സ്വരം ലോപിച്ചു പോകുന്നതിനാൽ ഇത് ലോപസന്ധിയാണ്.'
          }
        ]
      },
      {
        id: 'mod-mal-2',
        title: 'Module 2: Sandhi & Vyakarana Niyamangal (സന്ധികളും വ്യാകരണവും)',
        description: 'Lopasandhi, Aagamasandhi, Aadeshasandhi, and Dvitvasandhi in Malayalam grammar.',
        duration: '50 mins',
        videos: [
          {
            id: 'vid-mal-201',
            title: 'Lesson 1: The Four Main Sandhis Explained with Examples',
            duration: '16:40',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Clear breakdown of Lopam, Aagamam, Aadesham, and Dvitvam with sentence context.',
            notes: 'Formula: Lopam = disappearing sound; Aagamam = arriving sound; Aadesham = replacement sound.'
          }
        ],
        questions: [
          {
            id: 'q-mal-201',
            question: 'രണ്ട് പദങ്ങൾ കൂടിച്ചേരുമ്പോൾ ഒരു പുതിയ അക്ഷരം വന്നുചേരുന്ന സന്ധി ഏതാണ്?',
            difficulty: 'Easy',
            options: ['ആഗമസന്ധി', 'ലോപസന്ധി', 'ആദേശസന്ധി', 'ദ്വിത്വസന്ധി'],
            correctAnswer: 0,
            explanation: 'രണ്ട് വാക്കുകൾ ചേരുമ്പോൾ ഇടയിൽ പുതിയൊരു വർണ്ണം ആഗമിക്കുന്നത് "ആഗമസന്ധി" ആണ് (ഉദാ: തിരു + അരുൾ = തിരുവരുൾ).'
          },
          {
            id: 'q-mal-202',
            question: '"പൂഞ്ചോല" (പൂ + ചോല) എന്ന പദത്തിൽ നടക്കുന്ന സന്ധി ഏതാണ്?',
            difficulty: 'Medium',
            options: ['ലോപസന്ധി', 'ആഗമസന്ധി', 'ആദേശസന്ധി', 'വിസർഗ്ഗസന്ധി'],
            correctAnswer: 1,
            explanation: 'പൂ + ചോല കൂടുമ്പോൾ "ഞ്" എന്ന അക്ഷരം പുതിയതായി വരുന്നതിനാൽ ഇത് ആഗമസന്ധിയാണ്.'
          },
          {
            id: 'q-mal-203',
            question: '"മണ്ണപ്പം" (മണ്ണ് + അപ്പം) എന്നതിൽ "ണ്ണ്" എന്നതിലെ "ഉ" പോയി "മണ്ണപ്പം" ആകുന്ന സന്ധിയുടെ തത്വം എന്താണ്?',
            difficulty: 'Hard',
            options: ['പൂർവ്വപദത്തിലെ അന്ത്യസ്വരം ലോപിക്കുന്നു', 'ഉത്തരപദത്തിലെ ആദിസ്വരം ലോപിക്കുന്നു', 'രണ്ടു സ്വരങ്ങളും ദീർഘമാകുന്നു', 'വ്യഞ്ജനാദേശമുണ്ടാകുന്നു'],
            correctAnswer: 0,
            explanation: 'പൂർവ്വപദമായ "മണ്ണ്" എന്നതിലെ അവസാന സ്വരമായ സംവൃതോകാരം ("്") ലോപിച്ചു പോയി ഉത്തരപദത്തിലെ "അ" ചേരുന്നു.'
          }
        ]
      }
    ]
  },
  {
    id: 'sub-english',
    name: 'English Grammar & Composition',
    code: 'ENG-201',
    category: 'Language & Communication',
    description: 'Master English verb tenses, active vs passive voice, prepositions, direct/indirect speech, and sentence structure.',
    color: '#2563EB', // Royal Blue
    icon: 'Languages',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600',
    modules: [
      {
        id: 'mod-eng-1',
        title: 'Module 1: Verb Tenses & Aspect Mastery',
        description: 'Complete breakdown of Simple, Continuous, Perfect, and Perfect Continuous tenses with real-world examples.',
        duration: '50 mins',
        videos: [
          {
            id: 'vid-eng-101',
            title: 'Lesson 1: Mastering All 12 English Tenses in One Session',
            duration: '18:10',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Visual timeline showing when to use simple past vs present perfect and future forms.',
            notes: 'Remember: Present Perfect connects past actions directly with the present moment.'
          },
          {
            id: 'vid-eng-102',
            title: 'Lesson 2: Common Tense Errors & How to Avoid Them',
            duration: '11:45',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Correcting frequent errors with "since" vs "for" and irregular past participles.',
            notes: 'Use "since" with specific points in time, and "for" with durations.'
          }
        ],
        questions: [
          {
            id: 'q-eng-101',
            question: 'Which of the following sentences is in the Present Continuous Tense?',
            difficulty: 'Easy',
            options: [
              'She is writing an engineering report.',
              'She wrote an engineering report.',
              'She writes an engineering report daily.',
              'She has written an engineering report.'
            ],
            correctAnswer: 0,
            explanation: '"is writing" uses the auxiliary verb "is" + present participle (-ing), denoting Present Continuous.'
          },
          {
            id: 'q-eng-102',
            question: 'Choose the correct form: "They _____ in Kochi since 2018."',
            difficulty: 'Easy',
            options: ['have lived', 'are living', 'lived', 'lives'],
            correctAnswer: 0,
            explanation: 'Actions that started in the past and continue into the present with "since" require Present Perfect ("have lived").'
          },
          {
            id: 'q-eng-103',
            question: 'Identify the sentence with correct subject-verb agreement:',
            difficulty: 'Medium',
            options: [
              'Neither the teacher nor the students was present.',
              'Neither the teacher nor the students were present.',
              'Either the books or the pen are mine.',
              'The team of engineers are winning.'
            ],
            correctAnswer: 1,
            explanation: 'With "neither... nor", the verb agrees with the subject closest to it ("the students were").'
          },
          {
            id: 'q-eng-104',
            question: 'Which sentence correctly represents the Third Conditional (unreal past situation)?',
            difficulty: 'Hard',
            options: [
              'If he studied hard, he will pass.',
              'If he had studied hard, he would have passed the exam.',
              'If he studies hard, he passes the exam.',
              'If he were studying, he would pass.'
            ],
            correctAnswer: 1,
            explanation: 'Third conditional pattern: If + Past Perfect, would have + Past Participle.'
          }
        ]
      },
      {
        id: 'mod-eng-2',
        title: 'Module 2: Active vs Passive Voice Transformation',
        description: 'Rules for converting statements, questions, and imperatives from active to passive voice.',
        duration: '40 mins',
        videos: [
          {
            id: 'vid-eng-201',
            title: 'Lesson 1: Voice Transformation Rules & Transitive Verbs',
            duration: '15:30',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Why passive voice is essential in scientific and academic writing.',
            notes: 'Object of active sentence becomes subject of passive sentence.'
          }
        ],
        questions: [
          {
            id: 'q-eng-201',
            question: 'What is the passive form of: "The engineer inspected the bridge"?',
            difficulty: 'Easy',
            options: [
              'The bridge was inspected by the engineer.',
              'The bridge is inspected by the engineer.',
              'The bridge has inspected the engineer.',
              'The bridge had inspected by the engineer.'
            ],
            correctAnswer: 0,
            explanation: 'Past simple active ("inspected") becomes "was inspected" in passive voice.'
          },
          {
            id: 'q-eng-202',
            question: 'Transform to passive: "Someone has stolen my calculator."',
            difficulty: 'Medium',
            options: [
              'My calculator is stolen.',
              'My calculator has been stolen.',
              'My calculator was being stolen.',
              'My calculator had stolen.'
            ],
            correctAnswer: 1,
            explanation: 'Present perfect active ("has stolen") becomes "has been stolen" in passive.'
          },
          {
            id: 'q-eng-203',
            question: 'Identify the sentence where passive voice CANNOT be formed:',
            difficulty: 'Hard',
            options: [
              'She wrote a letter.',
              'They built a cantilever truss.',
              'The child slept peacefully for eight hours.',
              'The government paved the highway.'
            ],
            correctAnswer: 2,
            explanation: '"Sleep" is an intransitive verb and does not take a direct object, so it cannot be changed into passive voice.'
          }
        ]
      }
    ]
  },
  {
    id: 'sub-civil',
    name: 'Civil Engineering (Structural & Concrete)',
    code: 'CE-301',
    category: 'Engineering & Technology',
    description: 'Structural Analysis, IS 456 / IS 800 codal specifications, beam deflection, and concrete mix design.',
    color: '#0284C7', // Sky Blue
    icon: 'Building2',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&q=80&w=600',
    modules: [
      {
        id: 'mod-ce-1',
        title: 'Module 1: Structural Analysis & Determinate Trusses',
        description: 'Method of Joints, Method of Sections, zero-force members, and Castigliano theorem.',
        duration: '60 mins',
        videos: [
          {
            id: 'vid-ce-101',
            title: 'Lesson 1: Method of Joints for Plane Trusses',
            duration: '16:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Step-by-step resolution of equilibrium equations at each pin joint.',
            notes: 'Only two equilibrium equations (ΣFx = 0, ΣFy = 0) are available at any planar pin joint.'
          },
          {
            id: 'vid-ce-102',
            title: 'Lesson 2: Zero Force Member Identification Rules',
            duration: '12:20',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Two-member and three-member inspection rules for instantly identifying zero-force truss members.',
            notes: 'If two non-collinear members meet at an unloaded joint, both carry zero force.'
          }
        ],
        questions: [
          {
            id: 'q-ce-101',
            question: 'For a statically determinate plane truss with m members and j joints, the relationship is:',
            difficulty: 'Easy',
            options: ['m = 2j - 3', 'm = 3j - 2', 'm = j - 3', 'm = 2j + 3'],
            correctAnswer: 0,
            explanation: 'The standard determinacy condition for a 2D plane truss is m = 2j - 3.'
          },
          {
            id: 'q-ce-102',
            question: 'At an unloaded joint where two non-collinear members meet, the force in each member is:',
            difficulty: 'Easy',
            options: ['Tensile', 'Compressive', 'Zero', 'Equal to half the reaction'],
            correctAnswer: 2,
            explanation: 'By equilibrium perpendicular to either member, the internal force in both members must be zero.'
          },
          {
            id: 'q-ce-103',
            question: 'What is the kinematic indeterminacy of a 2D propped cantilever beam (neglecting axial deformation)?',
            difficulty: 'Medium',
            options: ['1', '2', '3', '0'],
            correctAnswer: 0,
            explanation: 'At fixed support degrees of freedom are 0; at simple roller support, only rotation theta is free. Hence KI = 1.'
          },
          {
            id: 'q-ce-104',
            question: 'According to Castigliano\'s second theorem, the partial derivative of total strain energy with respect to a load equals:',
            difficulty: 'Hard',
            options: [
              'Deflection in the direction of that load',
              'Internal bending moment',
              'Shear stress',
              'Total complementary work'
            ],
            correctAnswer: 0,
            explanation: 'Castigliano\'s Second Theorem states that ∂U/∂P_i = Δ_i (deflection at the point of load in its direction).'
          }
        ]
      },
      {
        id: 'mod-ce-2',
        title: 'Module 2: Concrete Technology & IS 456 Design Fundamentals',
        description: 'Compressive strength testing, water-cement ratio, slump test, and limit state design of beams.',
        duration: '55 mins',
        videos: [
          {
            id: 'vid-ce-201',
            title: 'Lesson 1: Limit State Method Principles (IS 456:2000)',
            duration: '18:50',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Partial safety factors for materials and characteristic stress-strain curves of concrete and steel.',
            notes: 'Partial safety factor for concrete is 1.5, and for reinforcing steel is 1.15.'
          }
        ],
        questions: [
          {
            id: 'q-ce-201',
            question: 'As per IS 456:2000, what is the partial safety factor for concrete in the limit state of collapse?',
            difficulty: 'Easy',
            options: ['1.15', '1.50', '1.20', '1.65'],
            correctAnswer: 1,
            explanation: 'IS 456 assigns γ_m = 1.50 for concrete due to higher variability in mixing, compaction, and curing.'
          },
          {
            id: 'q-ce-202',
            question: 'What is the maximum compressive strain in concrete in axial compression as per IS 456?',
            difficulty: 'Medium',
            options: ['0.002', '0.0035', '0.0015', '0.004'],
            correctAnswer: 0,
            explanation: 'In axial compression, maximum strain is limited to 0.002; in flexural compression it reaches 0.0035.'
          },
          {
            id: 'q-ce-203',
            question: 'For an M25 grade concrete, what is the design shear strength (tau_c) determined from?',
            difficulty: 'Hard',
            options: [
              'Percentage of longitudinal tension reinforcement (pt) and concrete grade',
              'Only water-cement ratio',
              'Beam span-to-depth ratio',
              'Nominal diameter of stirrups only'
            ],
            correctAnswer: 0,
            explanation: 'Table 19 of IS 456:2000 provides design shear strength based on pt = 100*As/(b*d) and concrete characteristic strength fck.'
          }
        ]
      }
    ]
  },
  {
    id: 'sub-math',
    name: 'Mathematics & Engineering Calculus',
    code: 'MATH-101',
    category: 'Applied Mathematics',
    description: 'Calculus, differential equations, matrix eigenvalues, and statistical distributions for engineers.',
    color: '#8B5CF6', // Purple
    icon: 'Calculator',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600',
    modules: [
      {
        id: 'mod-math-1',
        title: 'Module 1: Differential Equations & First-Order Models',
        description: 'Separable variables, integrating factors for linear first-order equations, and orthogonal trajectories.',
        duration: '45 mins',
        videos: [
          {
            id: 'vid-math-101',
            title: 'Lesson 1: Integrating Factor Method for Linear ODEs',
            duration: '14:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Solving dy/dx + P(x)y = Q(x) using the integrating factor I.F. = e^(∫P dx).',
            notes: 'Multiply the entire equation by I.F. to rewrite left hand side as d/dx(y * I.F.).'
          }
        ],
        questions: [
          {
            id: 'q-math-101',
            question: 'What is the integrating factor for the linear ODE: dy/dx + (2/x)y = x³ ?',
            difficulty: 'Easy',
            options: ['x²', '2ln(x)', 'e^(2x)', '1/x²'],
            correctAnswer: 0,
            explanation: 'I.F. = e^(∫(2/x)dx) = e^(2 ln x) = e^(ln x²) = x².'
          },
          {
            id: 'q-math-102',
            question: 'The order and degree of the differential equation [1 + (dy/dx)²]^(3/2) = d²y/dx² are:',
            difficulty: 'Medium',
            options: [
              'Order 2, Degree 2',
              'Order 2, Degree 1',
              'Order 1, Degree 3',
              'Order 3, Degree 2'
            ],
            correctAnswer: 0,
            explanation: 'Squaring both sides removes fractional power: [1 + (dy/dx)²]³ = (d²y/dx²)². Highest derivative is 2nd order, raised to power 2.'
          },
          {
            id: 'q-math-103',
            question: 'For a 3x3 square matrix A, if the eigenvalues are 1, -2, and 4, what is the determinant |A|?',
            difficulty: 'Hard',
            options: ['-8', '3', '0', '7'],
            correctAnswer: 0,
            explanation: 'The determinant of any square matrix equals the product of its eigenvalues: 1 * (-2) * 4 = -8.'
          }
        ]
      }
    ]
  }
];

export const INITIAL_CURRICULUM_ATTEMPTS = [
  {
    id: 'att-cur-001',
    studentId: 'STU001',
    studentName: 'Adithyan S.',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    subjectId: 'sub-malayalam',
    subjectName: 'Malayalam (മലയാളം)',
    moduleId: 'mod-mal-1',
    moduleTitle: 'Module 1: Aksharamala & Swarangal',
    difficultyMode: 'All Questions',
    totalQuestions: 5,
    correctCount: 5,
    scorePct: 100,
    status: 'Passed',
    timeTaken: '03:45',
    date: '2026-11-16 19:30'
  },
  {
    id: 'att-cur-002',
    studentId: 'STU001',
    studentName: 'Adithyan S.',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    subjectId: 'sub-english',
    subjectName: 'English Grammar & Composition',
    moduleId: 'mod-eng-1',
    moduleTitle: 'Module 1: Verb Tenses & Aspect Mastery',
    difficultyMode: 'Medium',
    totalQuestions: 2,
    correctCount: 2,
    scorePct: 100,
    status: 'Passed',
    timeTaken: '02:10',
    date: '2026-11-16 20:15'
  },
  {
    id: 'att-cur-003',
    studentId: 'STU002',
    studentName: 'Meera Nambiar',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    subjectId: 'sub-civil',
    subjectName: 'Civil Engineering (Structural & Concrete)',
    moduleId: 'mod-ce-1',
    moduleTitle: 'Module 1: Structural Analysis & Determinate Trusses',
    difficultyMode: 'Hard',
    totalQuestions: 2,
    correctCount: 2,
    scorePct: 100,
    status: 'Passed',
    timeTaken: '02:40',
    date: '2026-11-16 20:45'
  }
];
