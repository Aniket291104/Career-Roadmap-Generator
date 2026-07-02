const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-career-roadmap';

const correctTimeline = [
  {
    monthNumber: 1,
    title: 'Foundational Mastery',
    description: 'Acquire and refine core principles matching your learning style.',
    weeks: [
      {
        weekNumber: 1,
        title: 'Module 1: Setting up Systems',
        description: 'Focus on setting up workspace templates and coding structures.',
        learningGoals: ['Understand core folder layouts', 'Write clean configuration files'],
        dailyTasks: [
          {
            dayNumber: 1,
            title: 'Config settings',
            description: 'Setup env files, package manifests, and TS settings.',
            codingPractice: 'Write a basic script loading environment profiles.',
            links: [
              { title: 'Node.js Env Variables Docs', url: 'https://nodejs.org/docs/latest/api/cli.html', type: 'docs' },
              { title: 'System Environment Setup Notes', url: 'https://devhints.io/bash', type: 'notes' }
            ]
          },
          {
            dayNumber: 2,
            title: 'Express routes',
            description: 'Design modular endpoints using routers.',
            codingPractice: 'Create a ping/status path handling JSON request payloads.',
            links: [
              { title: 'Express Routing Guide Docs', url: 'https://expressjs.com/en/guide/routing.html', type: 'docs' }
            ]
          },
          {
            dayNumber: 3,
            title: 'State trackers',
            description: 'Create memory states and caching helpers.',
            codingPractice: 'Setup a cache Map with expiration keys.',
            links: [
              { title: 'ES6 Map & Set Quick Reference Notes', url: 'https://cheatsheets.shecodes.io/javascript/maps', type: 'notes' }
            ]
          },
          {
            dayNumber: 4,
            title: 'Middleware logging',
            description: 'Implement logging request interceptors using morgan or custom logs.',
            codingPractice: 'Write a log format middleware printing method and duration.',
            links: [
              { title: 'Express Middleware Docs', url: 'https://expressjs.com/en/guide/using-middleware.html', type: 'docs' }
            ]
          },
          {
            dayNumber: 5,
            title: 'Error handling',
            description: 'Build a global uncaught exception error handler.',
            codingPractice: 'Define an error class extending Error and returning custom status codes.',
            links: [
              { title: 'Express Error Handling Docs', url: 'https://expressjs.com/en/guide/error-handling.html', type: 'docs' }
            ]
          },
          {
            dayNumber: 6,
            title: 'Environment verification',
            description: 'Validate required system configurations on start.',
            codingPractice: 'Assert database URI presence in early process boot.',
            links: [
              { title: 'Node.js Process Env Docs', url: 'https://nodejs.org/api/process.html#processenv', type: 'docs' },
              { title: 'Express App Setup (Chai aur Code)', url: 'https://www.youtube.com/watch?v=EH3vGeqe5B4', type: 'youtube' }
            ]
          }
        ],
        projects: [
          {
            title: 'Module Sandbox API',
            description: 'Construct a boilerplate service featuring logging and authentication middleware.',
            techStack: ['TypeScript', 'Express', 'Node.js'],
            difficulty: 'beginner',
            estimatedHours: 6,
            folderStructure: 'src/\n  config/\n  routes/\n  app.ts',
            deploymentGuide: 'Compile typescript (tsc) and launch npm start'
          }
        ]
      },
      {
        weekNumber: 2,
        title: 'Module 2: Database Schemas',
        description: 'Connect databases and organize collection indices.',
        learningGoals: ['Create models with validator hooks', 'Define relations'],
        dailyTasks: [
          {
            dayNumber: 1,
            title: 'Design database entities',
            description: 'Create database collection schemas with Mongoose or SQL guides.',
            codingPractice: 'Define schema validation for email fields.',
            links: [
              { title: 'MongoDB Data Modeling Guide', url: 'https://www.mongodb.com/docs/manual/core/data-modeling-introduction/', type: 'docs' },
              { title: 'Mongoose Schema Cheat Sheet Guide', url: 'https://devhints.io/mongoose', type: 'notes' }
            ]
          },
          {
            dayNumber: 2,
            title: 'Querying records',
            description: 'Construct sorting, paging and search aggregates.',
            codingPractice: 'Build a search query resolving terms with regex filters.',
            links: [
              { title: 'Mongoose Queries Manual', url: 'https://mongoosejs.com/docs/queries.html', type: 'docs' }
            ]
          },
          {
            dayNumber: 3,
            title: 'Redis cache layering',
            description: 'Add cache layers to database query routes.',
            codingPractice: 'Write an express route checking cache before database queries.',
            links: [
              { title: 'Redis with Node.js in Hindi (Piyush Garg)', url: 'https://www.youtube.com/watch?v=jgpVdJ2S4SI', type: 'youtube' }
            ]
          },
          {
            dayNumber: 4,
            title: 'Schema validator hooks',
            description: 'Add lifecycle validation hooks checking for duplicates.',
            codingPractice: 'Write pre-save checks in Mongoose schema.',
            links: [
              { title: 'Mongoose Middleware Manual', url: 'https://mongoosejs.com/docs/middleware.html', type: 'docs' }
            ]
          },
          {
            dayNumber: 5,
            title: 'Indexing optimization',
            description: 'Setup custom database indices to speed up common reads.',
            codingPractice: 'Create a compound index on userId and createdAt.',
            links: [
              { title: 'MongoDB Indexes Guide', url: 'https://www.mongodb.com/docs/manual/indexes/', type: 'docs' }
            ]
          },
          {
            dayNumber: 6,
            title: 'Connection resilience',
            description: 'Configure auto-reconnect logic and connection timeouts.',
            codingPractice: 'Set mongoose option serverSelectionTimeoutMS to 5000.',
            links: [
              { title: 'Mongoose Connections Guide', url: 'https://mongoosejs.com/docs/connections.html', type: 'docs' }
            ]
          }
        ],
        projects: [
          {
            title: 'Data Store API',
            description: 'Build a relational CRUD manager with indexing logs and secure JWT verification.',
            techStack: ['Mongoose', 'MongoDB', 'JWT'],
            difficulty: 'intermediate',
            estimatedHours: 8,
            folderStructure: 'models/\n  User.ts\n  Task.ts',
            deploymentGuide: 'Link MongoDB Atlas URI and run development npm run dev'
          }
        ]
      },
      {
        weekNumber: 3,
        title: 'Module 3: Authentication & Security',
        description: 'Ensure route security and session state validation.',
        learningGoals: ['Understand token rotation', 'Implement password hashing', 'Add security headers'],
        dailyTasks: [
          {
            dayNumber: 1,
            title: 'JWT tokens setup',
            description: 'Configure token generation and sign mechanisms.',
            codingPractice: 'Sign JWT access and refresh payloads.',
            links: [
              { title: 'JWT Authentication Guide (Hitesh Choudhary)', url: 'https://www.youtube.com/watch?v=dH7Zp71J_L4', type: 'youtube' }
            ]
          },
          {
            dayNumber: 2,
            title: 'Cookies security',
            description: 'Implement HttpOnly and Secure cookie flags.',
            codingPractice: 'Attach cookie tokens to response object with strict security settings.',
            links: [
              { title: 'MDN Secure Cookies Manual', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies', type: 'docs' },
              { title: 'Web Security Cheatsheet Notes', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Cheatsheet', type: 'notes' }
            ]
          },
          {
            dayNumber: 3,
            title: 'CORS permissions',
            description: 'Allow secure origins dynamic validation checks.',
            codingPractice: 'Configure express cors middleware with dynamic origin resolver.',
            links: [
              { title: 'MDN CORS Configuration Manual', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS', type: 'docs' }
            ]
          },
          {
            dayNumber: 4,
            title: 'Password encryption',
            description: 'Hash user passwords safely before database storage.',
            codingPractice: 'Use bcrypt to salt and hash incoming password updates.',
            links: [
              { title: 'Bcrypt Library Documentation', url: 'https://github.com/kelektiv/node.bcrypt.js#readme', type: 'docs' }
            ]
          },
          {
            dayNumber: 5,
            title: 'Rate limit configs',
            description: 'Add request rate limit filters to protect auth routes.',
            codingPractice: 'Deploy express-rate-limit to lock route abuse.',
            links: [
              { title: 'Express Rate Limit Docs', url: 'https://github.com/express-rate-limit/express-rate-limit#readme', type: 'docs' }
            ]
          },
          {
            dayNumber: 6,
            title: 'Auth flow testing',
            description: 'Verify end-to-end token sign-in and token refresh lifecycle.',
            codingPractice: 'Write unit assertion verifying expired access token returns 401.',
            links: [
              { title: 'Jest API Testing Guide video', url: 'https://www.youtube.com/watch?v=FKnzS_icp20', type: 'youtube' }
            ]
          }
        ],
        projects: [
          {
            title: 'Auth Identity Gate',
            description: 'Construct secure user login endpoints featuring email-OTP validation checks.',
            techStack: ['Express', 'JWT', 'Nodemailer'],
            difficulty: 'intermediate',
            estimatedHours: 8,
            folderStructure: 'src/\n  middlewares/\n    auth.ts\n  controllers/\n    auth.controller.ts',
            deploymentGuide: 'Set up SMTP credentials and test route logs.'
          }
        ]
      },
      {
        weekNumber: 4,
        title: 'Module 4: API Assembly & Deployment',
        description: 'Finalize server features and build deployment bundles.',
        learningGoals: ['Assemble router paths', 'Prepare Docker configurations', 'Launch deployment packages'],
        dailyTasks: [
          {
            dayNumber: 1,
            title: 'Integrate routes',
            description: 'Hook up all modules to the primary express app entrypoint.',
            codingPractice: 'Mount routes as middleware sub-paths.',
            links: [
              { title: 'Clean Architecture Guide', url: 'https://softwareonroad.com/clean-architecture-node-js-express/', type: 'docs' }
            ]
          },
          {
            dayNumber: 2,
            title: 'Build scripts configuration',
            description: 'Define compiler target rules and postbuild assets compiling scripts.',
            codingPractice: 'Update package.json and tsconfig.json build settings.',
            links: [
              { title: 'TSConfig Reference Manual', url: 'https://www.typescriptlang.org/docs/handbook/tsconfig-json.html', type: 'docs' }
            ]
          },
          {
            dayNumber: 3,
            title: 'Docker containers config',
            description: 'Write multi-stage Docker build containers.',
            codingPractice: 'Create a local Dockerfile compiling node resources.',
            links: [
              { title: 'Dockerizing Node.js Guide', url: 'https://docs.docker.com/language/nodejs/containerize/', type: 'docs' },
              { title: 'Docker Engine Command Notes Guide', url: 'https://devhints.io/docker', type: 'notes' }
            ]
          },
          {
            dayNumber: 4,
            title: 'Deploying to Render',
            description: 'Configure public hosting environment parameters.',
            codingPractice: 'Commit production env files securely to render web console.',
            links: [
              { title: 'Render Hosting Guide Docs', url: 'https://render.com/docs/web-services', type: 'docs' }
            ]
          },
          {
            dayNumber: 5,
            title: 'Load testing APIs',
            description: 'Benchmark request latency limits and database speed tests.',
            codingPractice: 'Simulate high load targets to test mongoose response times.',
            links: [
              { title: 'Artillery Benchmarking Docs', url: 'https://www.artillery.io/docs', type: 'docs' }
            ]
          },
          {
            dayNumber: 6,
            title: 'Monitoring logs setup',
            description: 'Integrate system logging tools to capture runtime failures.',
            codingPractice: 'Log runtime errors to database error collections.',
            links: [
              { title: 'Winston Logger Manual', url: 'https://github.com/winstonjs/winston#readme', type: 'docs' },
              { title: 'Docker Containerization in Hindi (CodeWithHarry)', url: 'https://www.youtube.com/watch?v=3c-iQqcrNyw', type: 'youtube' }
            ]
          }
        ],
        projects: [
          {
            title: 'Production Bundle Launch',
            description: 'Synthesize the completed application and deploy live on cloud services.',
            techStack: ['Node.js', 'Docker', 'Vercel', 'Render'],
            difficulty: 'advanced',
            estimatedHours: 10,
            folderStructure: 'docker-compose.yml\nDockerfile\nsrc/\n  app.ts',
            deploymentGuide: 'Run docker-compose up --build to launch container local cluster.'
          }
        ]
      }
    ]
  }
];

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB. Overwriting timelines of short roadmaps...');
  const roadmapsCollection = mongoose.connection.db.collection('roadmaps');
  const roadmaps = await roadmapsCollection.find().toArray();

  let count = 0;
  for (const r of roadmaps) {
    let needsOverwrite = false;
    
    // Check total tasks count
    let totalTasks = 0;
    if (r.timeline) {
      r.timeline.forEach(m => {
        if (m.weeks) {
          m.weeks.forEach(w => {
            if (w.dailyTasks) totalTasks += w.dailyTasks.length;
          });
        }
      });
    }

    if (totalTasks < 24 || !r.timeline || r.timeline.length < 1 || r.timeline[0].weeks.length < 4) {
      needsOverwrite = true;
    }

    if (needsOverwrite) {
      await roadmapsCollection.updateOne(
        { _id: r._id },
        { $set: { timeline: correctTimeline } }
      );
      console.log(`Overwrote and updated Roadmap ID: ${r._id} (${r.title})`);
      count++;
    }
  }

  console.log(`Overwrite complete. Successfully restored ${count} roadmaps to full 4-week, 6-day structures.`);
  process.exit(0);
}).catch(err => {
  console.error('Database script failed:', err);
  process.exit(1);
});
