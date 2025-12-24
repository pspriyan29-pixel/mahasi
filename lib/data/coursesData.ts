// Comprehensive Course Data with Full Content
export const coursesData = [
    {
        id: 1,
        title: 'Full-Stack Web Development Bootcamp',
        slug: 'fullstack-web-development',
        description: 'Belajar membangun aplikasi web modern dari frontend hingga backend dengan React, Node.js, dan PostgreSQL. Bootcamp intensif 12 minggu dengan project-based learning.',
        longDescription: `Bootcamp komprehensif yang akan mengajarkan kamu semua skill yang dibutuhkan untuk menjadi Full-Stack Web Developer profesional. Mulai dari HTML/CSS dasar hingga deployment aplikasi production-ready.

**Apa yang akan kamu pelajari:**
- Frontend Development dengan React dan Next.js
- Backend Development dengan Node.js dan Express
- Database Design dengan PostgreSQL
- Authentication & Authorization
- RESTful API Development
- Deployment & DevOps
- Best Practices & Design Patterns

**Siapa yang cocok:**
- Pemula yang ingin menjadi web developer
- Developer yang ingin upgrade skill
- Mahasiswa IT yang ingin praktek real-world project
- Career switcher ke tech industry`,
        category: 'web',
        level: 'Beginner',
        duration: '12 minggu',
        totalHours: 120,
        students: 2847,
        rating: 4.9,
        reviews: 456,
        price: 0,
        originalPrice: 2500000,
        instructor: {
            id: 1,
            name: 'Ahmad Rizki',
            title: 'Senior Full-Stack Developer',
            company: 'Tokopedia',
            avatar: '/instructors/ahmad-rizki.jpg',
            bio: '8+ tahun experience sebagai Full-Stack Developer di perusahaan unicorn Indonesia. Passionate dalam mengajar dan sharing knowledge.',
            students: 5000,
            courses: 3,
            rating: 4.9
        },
        tags: ['React', 'Node.js', 'PostgreSQL', 'Next.js', 'Express', 'TypeScript'],
        thumbnail: '/courses/fullstack-web.jpg',
        thumbnailGradient: 'from-purple-500 to-pink-500',
        syllabus: [
            {
                moduleId: 1,
                title: 'Fundamental Web Development',
                duration: '2 minggu',
                lessons: [
                    {
                        id: 1,
                        title: 'Introduction to Web Development',
                        duration: '45 menit',
                        type: 'video',
                        description: 'Pengenalan dunia web development, tools yang dibutuhkan, dan roadmap pembelajaran',
                        videoUrl: '/videos/lesson-1-1.mp4',
                        resources: [
                            { name: 'Slide Presentation', url: '/resources/intro-web-dev.pdf' },
                            { name: 'Setup Guide', url: '/resources/setup-guide.md' }
                        ],
                        completed: false
                    },
                    {
                        id: 2,
                        title: 'HTML Fundamentals',
                        duration: '1 jam 30 menit',
                        type: 'video',
                        description: 'Belajar struktur HTML, semantic elements, forms, dan best practices',
                        videoUrl: '/videos/lesson-1-2.mp4',
                        resources: [
                            { name: 'HTML Cheat Sheet', url: '/resources/html-cheatsheet.pdf' },
                            { name: 'Practice Exercises', url: '/resources/html-exercises.zip' }
                        ],
                        completed: false
                    },
                    {
                        id: 3,
                        title: 'CSS Styling & Layouts',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Master CSS selectors, flexbox, grid, dan responsive design',
                        videoUrl: '/videos/lesson-1-3.mp4',
                        resources: [
                            { name: 'CSS Grid Guide', url: '/resources/css-grid.pdf' },
                            { name: 'Flexbox Cheatsheet', url: '/resources/flexbox.pdf' }
                        ],
                        completed: false
                    },
                    {
                        id: 4,
                        title: 'JavaScript Basics',
                        duration: '2 jam 30 menit',
                        type: 'video',
                        description: 'Variables, data types, functions, loops, dan DOM manipulation',
                        videoUrl: '/videos/lesson-1-4.mp4',
                        resources: [
                            { name: 'JavaScript Fundamentals', url: '/resources/js-basics.pdf' }
                        ],
                        completed: false
                    },
                    {
                        id: 5,
                        title: 'Assignment: Build a Landing Page',
                        duration: '4 jam',
                        type: 'assignment',
                        description: 'Buat landing page responsive untuk sebuah produk menggunakan HTML, CSS, dan JavaScript',
                        requirements: [
                            'Responsive design (mobile, tablet, desktop)',
                            'Semantic HTML',
                            'CSS Grid atau Flexbox untuk layout',
                            'Interactive elements dengan JavaScript',
                            'Form validation'
                        ],
                        deadline: '7 hari',
                        points: 100,
                        completed: false
                    }
                ]
            },
            {
                moduleId: 2,
                title: 'Modern JavaScript & ES6+',
                duration: '2 minggu',
                lessons: [
                    {
                        id: 6,
                        title: 'ES6+ Features',
                        duration: '1 jam 45 menit',
                        type: 'video',
                        description: 'Arrow functions, destructuring, spread operator, template literals',
                        videoUrl: '/videos/lesson-2-1.mp4',
                        completed: false
                    },
                    {
                        id: 7,
                        title: 'Async JavaScript',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Promises, async/await, fetch API, error handling',
                        videoUrl: '/videos/lesson-2-2.mp4',
                        completed: false
                    },
                    {
                        id: 8,
                        title: 'Working with APIs',
                        duration: '1 jam 30 menit',
                        type: 'video',
                        description: 'REST APIs, HTTP methods, JSON, authentication',
                        videoUrl: '/videos/lesson-2-3.mp4',
                        completed: false
                    },
                    {
                        id: 9,
                        title: 'Quiz: JavaScript Mastery',
                        duration: '30 menit',
                        type: 'quiz',
                        description: 'Test pemahaman kamu tentang modern JavaScript',
                        questions: 20,
                        passingScore: 80,
                        completed: false
                    }
                ]
            },
            {
                moduleId: 3,
                title: 'React Fundamentals',
                duration: '3 minggu',
                lessons: [
                    {
                        id: 10,
                        title: 'Introduction to React',
                        duration: '1 jam',
                        type: 'video',
                        description: 'React basics, JSX, components, props',
                        videoUrl: '/videos/lesson-3-1.mp4',
                        completed: false
                    },
                    {
                        id: 11,
                        title: 'State & Lifecycle',
                        duration: '1 jam 30 menit',
                        type: 'video',
                        description: 'useState, useEffect, component lifecycle',
                        videoUrl: '/videos/lesson-3-2.mp4',
                        completed: false
                    },
                    {
                        id: 12,
                        title: 'React Hooks Deep Dive',
                        duration: '2 jam',
                        type: 'video',
                        description: 'useContext, useReducer, custom hooks',
                        videoUrl: '/videos/lesson-3-3.mp4',
                        completed: false
                    },
                    {
                        id: 13,
                        title: 'React Router & Navigation',
                        duration: '1 jam 30 menit',
                        type: 'video',
                        description: 'Client-side routing, dynamic routes, protected routes',
                        videoUrl: '/videos/lesson-3-4.mp4',
                        completed: false
                    },
                    {
                        id: 14,
                        title: 'Project: Todo App with React',
                        duration: '6 jam',
                        type: 'assignment',
                        description: 'Build a full-featured todo application dengan React',
                        requirements: [
                            'CRUD operations',
                            'Local storage persistence',
                            'Filter & search functionality',
                            'Responsive UI',
                            'Component composition'
                        ],
                        deadline: '10 hari',
                        points: 150,
                        completed: false
                    }
                ]
            },
            {
                moduleId: 4,
                title: 'Backend Development with Node.js',
                duration: '3 minggu',
                lessons: [
                    {
                        id: 15,
                        title: 'Node.js Fundamentals',
                        duration: '1 jam 30 menit',
                        type: 'video',
                        description: 'Node.js runtime, modules, npm, package.json',
                        videoUrl: '/videos/lesson-4-1.mp4',
                        completed: false
                    },
                    {
                        id: 16,
                        title: 'Express.js Framework',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Routing, middleware, request/response handling',
                        videoUrl: '/videos/lesson-4-2.mp4',
                        completed: false
                    },
                    {
                        id: 17,
                        title: 'Building RESTful APIs',
                        duration: '2 jam 30 menit',
                        type: 'video',
                        description: 'REST principles, CRUD operations, status codes',
                        videoUrl: '/videos/lesson-4-3.mp4',
                        completed: false
                    },
                    {
                        id: 18,
                        title: 'Authentication & Authorization',
                        duration: '2 jam',
                        type: 'video',
                        description: 'JWT, bcrypt, session management, OAuth',
                        videoUrl: '/videos/lesson-4-4.mp4',
                        completed: false
                    }
                ]
            },
            {
                moduleId: 5,
                title: 'Database & PostgreSQL',
                duration: '2 minggu',
                lessons: [
                    {
                        id: 19,
                        title: 'Database Design Principles',
                        duration: '1 jam 30 menit',
                        type: 'video',
                        description: 'Relational databases, normalization, ER diagrams',
                        videoUrl: '/videos/lesson-5-1.mp4',
                        completed: false
                    },
                    {
                        id: 20,
                        title: 'SQL Fundamentals',
                        duration: '2 jam',
                        type: 'video',
                        description: 'SELECT, INSERT, UPDATE, DELETE, JOINs',
                        videoUrl: '/videos/lesson-5-2.mp4',
                        completed: false
                    },
                    {
                        id: 21,
                        title: 'PostgreSQL with Node.js',
                        duration: '1 jam 45 menit',
                        type: 'video',
                        description: 'pg library, connection pooling, transactions',
                        videoUrl: '/videos/lesson-5-3.mp4',
                        completed: false
                    },
                    {
                        id: 22,
                        title: 'ORM with Prisma',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Prisma setup, schema, migrations, queries',
                        videoUrl: '/videos/lesson-5-4.mp4',
                        completed: false
                    }
                ]
            },
            {
                moduleId: 6,
                title: 'Final Project: Full-Stack Application',
                duration: '2 minggu',
                lessons: [
                    {
                        id: 23,
                        title: 'Project Planning & Architecture',
                        duration: '1 jam',
                        type: 'video',
                        description: 'System design, database schema, API planning',
                        videoUrl: '/videos/lesson-6-1.mp4',
                        completed: false
                    },
                    {
                        id: 24,
                        title: 'Final Project: E-Commerce Platform',
                        duration: '40 jam',
                        type: 'assignment',
                        description: 'Build a complete e-commerce platform dengan semua fitur yang sudah dipelajari',
                        requirements: [
                            'User authentication & authorization',
                            'Product catalog dengan search & filter',
                            'Shopping cart functionality',
                            'Order management',
                            'Admin dashboard',
                            'Responsive design',
                            'RESTful API',
                            'PostgreSQL database',
                            'Deployment ke production'
                        ],
                        deadline: '14 hari',
                        points: 500,
                        completed: false
                    }
                ]
            }
        ],
        prerequisites: [
            'Komputer/laptop dengan internet',
            'Tidak perlu pengalaman programming sebelumnya',
            'Motivasi tinggi untuk belajar'
        ],
        learningOutcomes: [
            'Mampu membuat aplikasi web full-stack dari nol',
            'Menguasai React untuk frontend development',
            'Menguasai Node.js & Express untuk backend',
            'Memahami database design dengan PostgreSQL',
            'Bisa deploy aplikasi ke production',
            'Portfolio dengan 3+ real-world projects',
            'Siap untuk interview Full-Stack Developer'
        ],
        certificate: {
            available: true,
            requirements: [
                'Menyelesaikan semua lessons',
                'Mengumpulkan semua assignments',
                'Nilai rata-rata minimal 80%',
                'Final project approved'
            ]
        },
        faqs: [
            {
                question: 'Apakah cocok untuk pemula?',
                answer: 'Ya! Bootcamp ini dirancang untuk pemula. Kami mulai dari dasar HTML/CSS dan secara bertahap meningkat ke topik advanced.'
            },
            {
                question: 'Berapa lama waktu belajar per minggu?',
                answer: 'Direkomendasikan 10-15 jam per minggu untuk hasil optimal. Tapi kamu bisa belajar sesuai pace kamu sendiri.'
            },
            {
                question: 'Apakah ada sertifikat?',
                answer: 'Ya! Kamu akan mendapatkan sertifikat digital setelah menyelesaikan semua requirements.'
            },
            {
                question: 'Apakah lifetime access?',
                answer: 'Ya! Sekali enroll, kamu punya akses selamanya ke semua materi dan update.'
            }
        ]
    },
    {
        id: 2,
        title: 'Python for Data Science & Machine Learning',
        slug: 'python-data-science-ml',
        description: 'Kuasai Python untuk analisis data, visualisasi, dan machine learning dengan Pandas, NumPy, Matplotlib, dan Scikit-learn',
        longDescription: `Kursus komprehensif yang mengajarkan Python untuk Data Science dari dasar hingga advanced. Termasuk hands-on projects dengan real-world datasets.

**Apa yang akan kamu pelajari:**
- Python Programming Fundamentals
- Data Analysis dengan Pandas & NumPy
- Data Visualization dengan Matplotlib & Seaborn
- Statistical Analysis
- Machine Learning Algorithms
- Model Evaluation & Optimization
- Deep Learning Introduction

**Siapa yang cocok:**
- Pemula yang ingin masuk ke Data Science
- Analyst yang ingin upgrade skill
- Mahasiswa yang tertarik dengan AI/ML
- Professional yang ingin career switch`,
        category: 'data',
        level: 'Intermediate',
        duration: '10 minggu',
        totalHours: 100,
        students: 1923,
        rating: 4.8,
        reviews: 312,
        price: 0,
        originalPrice: 2000000,
        instructor: {
            id: 2,
            name: 'Siti Nurhaliza',
            title: 'Data Scientist',
            company: 'Gojek',
            avatar: '/instructors/siti-nurhaliza.jpg',
            bio: '6+ tahun experience sebagai Data Scientist. Passionate dalam machine learning dan AI.',
            students: 3500,
            courses: 2,
            rating: 4.8
        },
        tags: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'TensorFlow', 'Scikit-learn'],
        thumbnail: '/courses/python-datascience.jpg',
        thumbnailGradient: 'from-cyan-500 to-blue-500',
        syllabus: [
            {
                moduleId: 1,
                title: 'Python Fundamentals',
                duration: '2 minggu',
                lessons: [
                    {
                        id: 1,
                        title: 'Python Basics',
                        duration: '1 jam 30 menit',
                        type: 'video',
                        description: 'Variables, data types, operators, control flow',
                        completed: false
                    },
                    {
                        id: 2,
                        title: 'Functions & Modules',
                        duration: '1 jam 45 menit',
                        type: 'video',
                        description: 'Functions, lambda, modules, packages',
                        completed: false
                    },
                    {
                        id: 3,
                        title: 'Object-Oriented Programming',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Classes, objects, inheritance, polymorphism',
                        completed: false
                    }
                ]
            },
            {
                moduleId: 2,
                title: 'Data Analysis with Pandas',
                duration: '2 minggu',
                lessons: [
                    {
                        id: 4,
                        title: 'Introduction to Pandas',
                        duration: '1 jam 30 menit',
                        type: 'video',
                        description: 'Series, DataFrames, basic operations',
                        completed: false
                    },
                    {
                        id: 5,
                        title: 'Data Cleaning & Preprocessing',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Handling missing data, duplicates, data types',
                        completed: false
                    },
                    {
                        id: 6,
                        title: 'Data Manipulation',
                        duration: '2 jam 30 menit',
                        type: 'video',
                        description: 'Filtering, grouping, merging, pivoting',
                        completed: false
                    },
                    {
                        id: 7,
                        title: 'Assignment: Exploratory Data Analysis',
                        duration: '5 jam',
                        type: 'assignment',
                        description: 'Analyze a real-world dataset dan extract insights',
                        points: 120,
                        completed: false
                    }
                ]
            },
            {
                moduleId: 3,
                title: 'Data Visualization',
                duration: '2 minggu',
                lessons: [
                    {
                        id: 8,
                        title: 'Matplotlib Fundamentals',
                        duration: '1 jam 30 menit',
                        type: 'video',
                        description: 'Line plots, scatter plots, bar charts',
                        completed: false
                    },
                    {
                        id: 9,
                        title: 'Advanced Visualization with Seaborn',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Statistical plots, heatmaps, pair plots',
                        completed: false
                    },
                    {
                        id: 10,
                        title: 'Interactive Dashboards with Plotly',
                        duration: '1 jam 45 menit',
                        type: 'video',
                        description: 'Interactive charts, dashboards',
                        completed: false
                    }
                ]
            },
            {
                moduleId: 4,
                title: 'Machine Learning Fundamentals',
                duration: '3 minggu',
                lessons: [
                    {
                        id: 11,
                        title: 'Introduction to Machine Learning',
                        duration: '1 jam',
                        type: 'video',
                        description: 'ML concepts, types, workflow',
                        completed: false
                    },
                    {
                        id: 12,
                        title: 'Supervised Learning: Regression',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Linear regression, polynomial regression',
                        completed: false
                    },
                    {
                        id: 13,
                        title: 'Supervised Learning: Classification',
                        duration: '2 jam 30 menit',
                        type: 'video',
                        description: 'Logistic regression, decision trees, random forest',
                        completed: false
                    },
                    {
                        id: 14,
                        title: 'Model Evaluation & Optimization',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Cross-validation, hyperparameter tuning, metrics',
                        completed: false
                    },
                    {
                        id: 15,
                        title: 'Project: Predictive Model',
                        duration: '8 jam',
                        type: 'assignment',
                        description: 'Build dan optimize a predictive model',
                        points: 200,
                        completed: false
                    }
                ]
            },
            {
                moduleId: 5,
                title: 'Deep Learning Introduction',
                duration: '1 minggu',
                lessons: [
                    {
                        id: 16,
                        title: 'Neural Networks Basics',
                        duration: '2 jam',
                        type: 'video',
                        description: 'Perceptrons, activation functions, backpropagation',
                        completed: false
                    },
                    {
                        id: 17,
                        title: 'TensorFlow & Keras',
                        duration: '2 jam 30 menit',
                        type: 'video',
                        description: 'Building neural networks with Keras',
                        completed: false
                    }
                ]
            }
        ],
        prerequisites: [
            'Basic programming knowledge (any language)',
            'Basic mathematics (algebra, statistics)',
            'Komputer dengan Python installed'
        ],
        learningOutcomes: [
            'Menguasai Python untuk Data Science',
            'Mampu melakukan data analysis dengan Pandas',
            'Bisa membuat visualisasi data yang insightful',
            'Memahami machine learning algorithms',
            'Bisa build & deploy ML models',
            'Portfolio dengan data science projects'
        ],
        certificate: {
            available: true,
            requirements: [
                'Menyelesaikan semua lessons',
                'Mengumpulkan semua assignments',
                'Nilai rata-rata minimal 75%'
            ]
        }
    }
];

export default coursesData;
