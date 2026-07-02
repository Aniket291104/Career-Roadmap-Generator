const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-career-roadmap';

const defaultTasks = {
  1: [
    {
      dayNumber: 4,
      title: 'Deep Dive & Practice',
      description: 'Review the topics learned from Day 1-3, write comprehensive notes, and debug existing practices.',
      codingPractice: 'Refactor week code snippets to improve runtime performance.',
      status: 'pending',
      links: [
        { title: 'JavaScript Best Practices Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'docs' }
      ]
    },
    {
      dayNumber: 5,
      title: 'Practical Mini-Project',
      description: 'Build a small prototype applying the week concepts in a sandbox environment.',
      codingPractice: 'Implement a console application integrating configuration and modular scripts.',
      status: 'pending',
      links: [
        { title: 'Project Design Basics Guide', url: 'https://devhints.io', type: 'notes' }
      ]
    },
    {
      dayNumber: 6,
      title: 'Weekly Assessment & Review',
      description: 'Assess week knowledge, log unresolved questions, and document lessons learned.',
      codingPractice: 'Draft a summary README of the week learnings in markdown format.',
      status: 'pending',
      links: [
        { title: 'Developer Reference Notes', url: 'https://devhints.io', type: 'notes' }
      ]
    }
  ],
  2: [
    {
      dayNumber: 4,
      title: 'Database Schema Optimization',
      description: 'Analyze indexes and test queries with large mock datasets.',
      codingPractice: 'Write compound indexing rules for performance testing.',
      status: 'pending',
      links: [
        { title: 'MongoDB Indexing Guide', url: 'https://www.mongodb.com/docs/manual/indexes/', type: 'docs' }
      ]
    },
    {
      dayNumber: 5,
      title: 'Model Validation Testing',
      description: 'Verify schema constraints, required attributes, and handle duplicate errors.',
      codingPractice: 'Write custom validation hooks and try-catch database query handlers.',
      status: 'pending',
      links: [
        { title: 'Mongoose Validation Manual', url: 'https://mongoosejs.com/docs/validation.html', type: 'docs' }
      ]
    },
    {
      dayNumber: 6,
      title: 'Weekly DB Integration Review',
      description: 'Design ER diagrams, query flows, and map application access permissions.',
      codingPractice: 'Write a seed script to prepopulate development database collections.',
      status: 'pending',
      links: [
        { title: 'MongoDB Data Models', url: 'https://www.mongodb.com/docs/manual/core/data-modeling-introduction/', type: 'docs' }
      ]
    }
  ],
  3: [
    {
      dayNumber: 4,
      title: 'Security Auditing & Logging',
      description: 'Implement secure cors limits and log bad login attempts.',
      codingPractice: 'Add limit rules using express-rate-limit library.',
      status: 'pending',
      links: [
        { title: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org', type: 'docs' }
      ]
    },
    {
      dayNumber: 5,
      title: 'OAuth Integration Study',
      description: 'Study how Google/GitHub login flows verify identities asynchronously.',
      codingPractice: 'Implement a verification endpoint mock handling third-party access tokens.',
      status: 'pending',
      links: [
        { title: 'Google Identity login video', url: 'https://www.youtube.com/watch?v=dH7Zp71J_L4', type: 'youtube' }
      ]
    },
    {
      dayNumber: 6,
      title: 'Security Flow E2E Check',
      description: 'Test session tokens expiration, login OTP, and cookie configurations.',
      codingPractice: 'Write unit tests asserting invalid JWT keys return 401 statuses.',
      status: 'pending',
      links: [
        { title: 'JWT Debugging Guide', url: 'https://jwt.io', type: 'docs' }
      ]
    }
  ],
  4: [
    {
      dayNumber: 4,
      title: 'Containerization Best Practices',
      description: 'Configure small multi-stage Docker build files.',
      codingPractice: 'Build a container context ignoring node_modules assets.',
      status: 'pending',
      links: [
        { title: 'Docker Node Guide', url: 'https://docs.docker.com/language/nodejs/containerize/', type: 'docs' }
      ]
    },
    {
      dayNumber: 5,
      title: 'Continuous Deployment Prep',
      description: 'Configure automated build hooks and check target service health endpoints.',
      codingPractice: 'Implement a /health route returning process uptime status.',
      status: 'pending',
      links: [
        { title: 'Render Deployment Guides', url: 'https://render.com/docs/web-services', type: 'docs' }
      ]
    },
    {
      dayNumber: 6,
      title: 'E2E System Benchmarking',
      description: 'Execute load tests simulating user logins and database query workloads.',
      codingPractice: 'Update package.json test scripts with load runners.',
      status: 'pending',
      links: [
        { title: 'Docker Compose Guide video', url: 'https://www.youtube.com/watch?v=HUpYoLq9Y7U', type: 'youtube' }
      ]
    }
  ]
};

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB. Migrating old roadmaps...');
  const roadmapsCollection = mongoose.connection.db.collection('roadmaps');
  const roadmaps = await roadmapsCollection.find().toArray();

  let count = 0;
  for (const r of roadmaps) {
    let modified = false;
    if (r.timeline) {
      r.timeline.forEach(m => {
        if (m.weeks) {
          m.weeks.forEach(w => {
            if (w.dailyTasks && w.dailyTasks.length < 6) {
              const currentDays = w.dailyTasks.map(d => d.dayNumber);
              const weekNum = w.weekNumber || 1;
              const defaults = defaultTasks[weekNum] || defaultTasks[1];
              
              defaults.forEach(defTask => {
                if (!currentDays.includes(defTask.dayNumber)) {
                  w.dailyTasks.push({
                    dayNumber: defTask.dayNumber,
                    title: defTask.title,
                    description: defTask.description,
                    codingPractice: defTask.codingPractice,
                    status: defTask.status,
                    links: defTask.links
                  });
                  modified = true;
                }
              });

              // Sort dailyTasks by dayNumber
              w.dailyTasks.sort((a, b) => a.dayNumber - b.dayNumber);
            }
          });
        }
      });
    }

    if (modified) {
      await roadmapsCollection.updateOne({ _id: r._id }, { $set: { timeline: r.timeline } });
      console.log(`Migrated Roadmap ID: ${r._id} (${r.title})`);
      count++;
    }
  }

  console.log(`Migration complete. Successfully upgraded ${count} roadmaps.`);
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
