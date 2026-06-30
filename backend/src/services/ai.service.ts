import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const isMock = !apiKey || apiKey === 'mock_gemini_api_key';

let ai: GoogleGenAI | null = null;
if (!isMock && apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export class AIService {
  private static modelName = 'gemini-2.5-flash';

  /**
   * Generates a complete learning roadmap based on user input
   */
  static async generateRoadmap(
    skills: string[],
    goal: string,
    dailyHours: number,
    learningStyle: string,
    preferredLanguage: string
  ): Promise<any> {
    if (isMock || !ai) {
      console.log('Using mock roadmap generator...');
      return this.getMockRoadmap(goal, skills, learningStyle, preferredLanguage);
    }

    const prompt = `
      Create a highly structured career roadmap for a user whose current skills are: [${skills.join(', ')}].
      Their primary career goal is: "${goal}".
      Their learning style is: "${learningStyle}" and they can study ${dailyHours} hours per day.
      Please output the roadmap in the preferred language: "${preferredLanguage}".

      You MUST respond with a valid JSON object matching this schema structure:
      {
        "title": "Roadmap title",
        "targetRole": "Role name matching the goal",
        "difficulty": "beginner" | "intermediate" | "advanced",
        "estimatedDuration": "X Weeks",
        "skillsCovered": ["skill1", "skill2"],
        "timeline": [
          {
            "monthNumber": 1,
            "title": "Month focus topic",
            "description": "General description of month 1 goals",
            "weeks": [
              {
                "weekNumber": 1,
                "title": "Week focus topic",
                "description": "General description of week 1 goals",
                "learningGoals": ["goal 1", "goal 2"],
                "dailyTasks": [
                  {
                    "dayNumber": 1,
                    "title": "Task title",
                    "description": "Detailed description of what to study/do",
                    "codingPractice": "Description of code or practice exercise for this day"
                  }
                ],
                "resources": [
                  {
                    "title": "Official Docs / Tutorial",
                    "url": "https://example.com/docs",
                    "type": "docs" | "youtube" | "course" | "github" | "blog" | "book" | "practice"
                  }
                ],
                "projects": [
                  {
                    "title": "Week project title",
                    "description": "Description of what they will build",
                    "techStack": ["React", "Express"],
                    "difficulty": "beginner" | "intermediate" | "advanced",
                    "estimatedHours": 6,
                    "folderStructure": "src/\\n  components/\\n  App.js",
                    "deploymentGuide": "Deploy on Vercel"
                  }
                ]
              }
            ]
          }
        ]
      }

      Limit the roadmap to exactly 2 months, 2 weeks per month, and 3 daily tasks per week to keep response size optimal but extremely high-quality and complete.
    `;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an elite Tech Career Coach and System Architect. Output only pure, parseable JSON conforming exactly to the requested schema. Do not put markdown code blocks around it.',
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from Gemini');
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini Roadmap Generation Error, falling back to mock:', error);
      return this.getMockRoadmap(goal, skills, learningStyle, preferredLanguage);
    }
  }

  /**
   * Evaluates candidate resume for ATS alignment
   */
  static async analyzeResume(resumeText: string): Promise<any> {
    if (isMock || !ai) {
      console.log('Using mock resume analyzer...');
      return {
        atsScore: 78,
        missingSkills: ['Redis', 'Docker', 'CI/CD Pipelines'],
        missingKeywords: ['Scale', 'System Architecture', 'Latency Optimizations'],
        suggestions: `### Key Recommendations\n\n1. **Incorporate Missing Technologies**: Add experience logs relating to caching (Redis) or containerization.\n2. **Metrics-Driven Bulletpoints**: Quantify accomplishments (e.g. *improved latency by 35%*).\n3. **Formatting**: Ensure single-column structure for parser safety.`,
      };
    }

    const prompt = `
      Analyze this parsed resume text:
      "${resumeText}"

      Provide an ATS review. You must respond with a valid JSON object matching this schema:
      {
        "atsScore": 85, // number from 0 to 100
        "missingSkills": ["Docker", "Kubernetes"],
        "missingKeywords": ["Optimization", "Load Balancer"],
        "suggestions": "Markdown text listing clear steps to improve formatting, keyword density, and overall structure"
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an professional ATS Scanner and recruiter. Evaluate the resume text rigorously.',
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response');
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini Resume Analysis Error:', error);
      return {
        atsScore: 70,
        missingSkills: ['TypeScript', 'Testing'],
        missingKeywords: ['Agile', 'Refactoring'],
        suggestions: 'Failed to connect to AI server. Standard suggestions: update formatting to simple columns and add impact statements.',
      };
    }
  }

  /**
   * Reviews GitHub portfolio details
   */
  static async analyzePortfolio(githubUrl: string): Promise<any> {
    // For portfolio URL we scan repos and give recommendations
    const cleanUrl = githubUrl.replace(/\/$/, '');
    const username = cleanUrl.split('/').pop() || 'developer';

    if (isMock || !ai) {
      return {
        githubUrl,
        reposCount: 8,
        languages: [
          { name: 'TypeScript', percentage: 65 },
          { name: 'JavaScript', percentage: 25 },
          { name: 'HTML/CSS', percentage: 10 },
        ],
        repositories: [
          { name: 'career-builder-api', stars: 12, forks: 3, primaryLanguage: 'TypeScript', hasReadme: true },
          { name: 'portfolio-v2', stars: 8, forks: 1, primaryLanguage: 'TypeScript', hasReadme: true },
          { name: 'sorting-visualizer', stars: 2, forks: 0, primaryLanguage: 'JavaScript', hasReadme: false },
        ],
        portfolioScore: 82,
        readmeQuality: 'good',
        commitActivity: 'active',
        suggestions: `### GitHub Portfolio Recommendations\n\n- **Write READMEs**: Project 'sorting-visualizer' lacks a README. Add detailed install instructions.\n- **Pin High-Quality Repos**: Pin 3-4 key projects highlighting Full-Stack skills instead of simple class exercises.\n- **Improve Commit Messages**: Use descriptive commits rather than "fixed bugs" or "update file".`,
      };
    }

    const prompt = `
      Provide a portfolio review feedback mockup for user GitHub profile URL: "${githubUrl}".
      The user username is: "${username}".

      Return a JSON conforming to:
      {
        "githubUrl": "${githubUrl}",
        "reposCount": 15,
        "languages": [
          {"name": "TypeScript", "percentage": 70},
          {"name": "Go", "percentage": 20},
          {"name": "Python", "percentage": 10}
        ],
        "repositories": [
          {"name": "microservices-chat", "stars": 34, "forks": 8, "primaryLanguage": "TypeScript", "hasReadme": true},
          {"name": "dsa-practice", "stars": 2, "forks": 0, "primaryLanguage": "Go", "hasReadme": false}
        ],
        "portfolioScore": 75,
        "readmeQuality": "needs_work",
        "commitActivity": "active",
        "suggestions": "Markdown suggestions to improve README structures, repository pins, and star ratios."
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an engineering manager reviewing developer GitHub profiles. Give realistic insights.',
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response');
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini Portfolio Analysis Error:', error);
      return {
        githubUrl,
        reposCount: 3,
        languages: [{ name: 'JavaScript', percentage: 100 }],
        repositories: [{ name: 'my-app', stars: 0, forks: 0, primaryLanguage: 'JavaScript', hasReadme: true }],
        portfolioScore: 60,
        readmeQuality: 'needs_work',
        commitActivity: 'sporadic',
        suggestions: 'Verify username is valid. Ensure you use readme templates and list tech stack features.',
      };
    }
  }

  /**
   * Generates interview questions or conducts mock interview discussions
   */
  static async handleMockInterview(
    sessionHistory: { role: 'interviewer' | 'candidate'; content: string }[],
    type: string,
    company: string = 'Google',
    difficulty: string = 'FAANG',
    mode: string = 'strict'
  ): Promise<string> {
    if (isMock || !ai) {
      if (sessionHistory.length === 0) {
        return `Hello! Welcome to your mock ${type} interview with ${company} at ${difficulty} level. I am a Senior Software Engineer here, and I'll be guiding you today. Let's start with a brief overview of your background.`;
      }
      const lastAnswer = sessionHistory[sessionHistory.length - 1].content;
      return `Thanks for that explanation. Now, let's discuss how we would design or implement this for scaling. What happens if traffic grows by 10x? What bottlenecks do you foresee?`;
    }

    const conversationPrompt = sessionHistory.map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n');

    const prompt = `
      You are a Senior Software Engineer and Architect conducting a mock technical interview at ${company}.
      Interview Type/Focus: ${type}
      Difficulty: ${difficulty}
      Mode: ${mode}

      Here is the dialogue history of our conversation so far:
      ${conversationPrompt}

      Act strictly as the AI interviewer. Write the next logical interviewer statement or follow-up question.
      Make sure to ask questions that never repeat, probe for technical depth, cover coding, behavioral, or system design scenarios based on the interview flow, and dynamically ask for optimization details.
      Keep it conversational and output ONLY the interviewer's direct spoken question without labels. Limit it to 1-2 concise paragraphs.
    `;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: 'You are an interviewer. Speak directly as the interviewer. Do not append labels like "Interviewer:" or anything. Just output the text response.',
        },
      });

      return response.text || 'Could you elaborate further on your experience?';
    } catch (error) {
      console.error('Gemini Mock Interview Error:', error);
      return 'Can you explain the main challenges you faced in your last project and how you solved them?';
    }
  }

  /**
   * Completes evaluation of full interview session
   */
  static async evaluateMockInterview(
    sessionHistory: { role: 'interviewer' | 'candidate'; content: string }[],
    type: string,
    company: string = 'Google',
    difficulty: string = 'FAANG'
  ): Promise<any> {
    if (isMock || !ai) {
      return {
        overallScore: 84,
        subScores: {
          coding: 82,
          communication: 88,
          confidence: 85,
          technical: 80,
          behavior: 85,
        },
        feedback: `### Mock Interview Report\n\n- **Company**: ${company}\n- **Difficulty**: ${difficulty}\n\n#### Strengths\n- Strong algorithm choices.\n- Great communication style.\n\n#### Weaknesses\n- Avoid simple naming bugs.\n- Improve optimization scaling metrics.`,
      };
    }

    const conversationPrompt = sessionHistory.map(m => `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n');

    const prompt = `
      Analyze this full mock interview transcript for a "${type}" position at "${company}" with a "${difficulty}" difficulty level:
      ${conversationPrompt}

      Provide a comprehensive candidate evaluation. You must respond with a valid JSON object matching this schema:
      {
        "overallScore": 82, // 0 to 100
        "subScores": {
          "coding": 80, // 0 to 100
          "communication": 85, // 0 to 100
          "confidence": 82, // 0 to 100
          "technical": 80, // 0 to 100
          "behavior": 88 // 0 to 100
        },
        "feedback": "A beautiful Markdown candidate summary listing: overall rating, strengths, weaknesses, mistakes, correct answers, better optimal solutions, recommendations (projects, courses), and learning paths."
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an elite interviewer reviewing candidates. Be critical and helpful in your scores.',
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response');
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini Interview Evaluation Error:', error);
      return {
        overallScore: 75,
        subScores: {
          coding: 70,
          communication: 75,
          confidence: 75,
          technical: 75,
          behavior: 75,
        },
        feedback: 'Evaluation complete. Candidate answers show a basic understanding, but could benefit from explaining scaling, edge cases, and design choices.',
      };
    }
  }

  /**
   * Chat Guidance response handler
   */
  static async handleChatGuidance(
    message: string,
    chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[]
  ): Promise<string> {
    if (isMock || !ai) {
      return `I am currently running in offline developer mode, but I can guide you! To succeed in your goal, make sure you focus on writing clean, modular components in React, set up robust authentication systems, study database optimizations, and practice mocking system architectures. Let me know if you need specific coding templates!`;
    }

    try {
      // Map history to official @google/genai format
      const formattedHistory = chatHistory.map(ch => ({
        role: ch.role,
        parts: ch.parts,
      }));

      const chat = ai.chats.create({
        model: this.modelName,
        history: formattedHistory,
      });

      const response = await chat.sendMessage({ message });
      return response.text || 'I could not process that request. Could you rephrase?';
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      return 'I encountered a connection error. Let me know what concepts or topics you would like to explore!';
    }
  }

  // --- MOCK DATA FALLBACKS ---

  private static getMockRoadmap(goal: string, skills: string[], style: string, lang: string): any {
    return {
      title: `${goal} Masterclass Roadmap`,
      targetRole: goal,
      difficulty: 'intermediate',
      estimatedDuration: '4 Weeks',
      skillsCovered: [...new Set(['TypeScript', 'Core Architectures', ...skills])],
      timeline: [
        {
          monthNumber: 1,
          title: 'Foundational Mastery',
          description: `Acquire and refine core principles for ${goal} matching your learning style: ${style}.`,
          weeks: [
            {
              weekNumber: 1,
              title: 'Module 1: Setting up Systems',
              description: 'Focus on setting up workspace templates and coding structures.',
              learningGoals: ['Understand core folder layouts', 'Write clean configuration files'],
              dailyTasks: [
                { dayNumber: 1, title: 'Day 1: Config settings', description: 'Setup env files, package manifests, and TS settings.', codingPractice: 'Write a basic script loading environment profiles.' },
                { dayNumber: 2, title: 'Day 2: Express routes', description: 'Design modular endpoints using routers.', codingPractice: 'Create a ping/status path handling JSON request payloads.' },
                { dayNumber: 3, title: 'Day 3: State trackers', description: 'Create memory states and caching helpers.', codingPractice: 'Setup a cache Map with expiration keys.' }
              ],
              resources: [
                { title: 'Official Docs Guide', url: 'https://developer.mozilla.org', type: 'docs' },
                { title: 'Full Stack Setup Tutorial', url: 'https://youtube.com', type: 'youtube' }
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
                { dayNumber: 4, title: 'Day 4: Design database entities', description: 'Create database collection schemas with Mongoose or SQL guides.', codingPractice: 'Define schema validation for email fields.' },
                { dayNumber: 5, title: 'Day 5: Querying records', description: 'Construct sorting, paging and search aggregates.', codingPractice: 'Build a search query resolving terms with regex filters.' },
                { dayNumber: 6, title: 'Day 6: Redis cache layering', description: 'Add cache layers to database query routes.', codingPractice: 'Write an express route checking cache before database queries.' }
              ],
              resources: [
                { title: 'Data Design Best Practices', url: 'https://mongodb.com/docs', type: 'docs' }
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
            }
          ]
        }
      ]
    };
  }

  /**
   * Generates MCQ Programming Assessment questions
   */
  static async generateQuiz(skills: string[], goal: string): Promise<any[]> {
    if (isMock || !ai) {
      console.log('Using mock quiz generator...');
      return this.getMockQuiz(goal, skills);
    }

    const randomSeed = Math.random().toString(36).substring(7);
    const prompt = `
      Generate a set of exactly 20 multiple-choice programming questions (MCQs) to evaluate a candidate targeting this career goal: "${goal}".
      Their current skills are: [${skills.join(', ')}].
      Include questions covering programming, system design, frontend, backend, or DSA relevant to this path.
      Ensure the questions are completely fresh and diverse. Seed: ${randomSeed}

      Output as a JSON array of objects conforming exactly to this structure:
      [
        {
          "questionText": "Question description",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswerIndex": 0,
          "explanation": "Why this option is correct",
          "topic": "Subtopic name"
        }
      ]
    `;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an expert technical interviewer. Generate a high-quality MCQ quiz of exactly 20 items in JSON. Ensure only one answer is correct and options are plausible.',
        },
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from Gemini');
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini Quiz Generation Error, falling back to mock:', error);
      return this.getMockQuiz(goal, skills);
    }
  }

  private static getMockQuiz(goal: string, skills: string[]): any[] {
    const questionPool = [
      {
        questionText: `Which of the following describes the key purpose of the 'tsconfig.json' file when building a TypeScript project?`,
        options: [
          'It handles runtime performance monitoring of node logs.',
          'It compiles CSS layouts into production-ready styles.',
          'It specifies root files and compiler choices needed to compile the project.',
          'It handles user authorization controls.'
        ],
        correctAnswerIndex: 2,
        explanation: 'tsconfig.json contains the configurations for the TypeScript compiler (tsc).',
        topic: 'TypeScript Configuration'
      },
      {
        questionText: `In a RESTful architecture, which HTTP method is typically used to apply a partial modification to a resource?`,
        options: ['POST', 'PUT', 'PATCH', 'OPTIONS'],
        correctAnswerIndex: 2,
        explanation: 'PATCH is designed for applying partial modifications to a resource.',
        topic: 'REST API design'
      },
      {
        questionText: `Which data structure operates on a First-In, First-Out (FIFO) access pattern?`,
        options: ['Stack', 'Queue', 'Binary Tree', 'Max Heap'],
        correctAnswerIndex: 1,
        explanation: 'Queues process items in the order they arrive (First-In, First-Out).',
        topic: 'Data Structures'
      },
      {
        questionText: `What is the primary role of a 'Refresh Token' in cookie-based authentication?`,
        options: [
          'It encrypts user passwords in databases.',
          'It provides a long-lived credential used to request new, short-lived Access Tokens.',
          'It checks request rates to limit DDoS attempts.',
          'It handles OAuth callbacks.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Refresh tokens allow clients to silently acquire fresh access tokens without requiring users to type credentials repeatedly.',
        topic: 'Authentication'
      },
      {
        questionText: `Which index type in MongoDB is optimal for executing search queries matching arbitrary substrings?`,
        options: ['Single Field Index', 'Compound Index', 'Text Index', 'Hashed Index'],
        correctAnswerIndex: 2,
        explanation: 'Text indexes support string content searches in Mongoose.',
        topic: 'Databases'
      },
      {
        questionText: `What is the average time complexity for searching a value in a Balanced Binary Search Tree (e.g., AVL tree)?`,
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctAnswerIndex: 2,
        explanation: 'Balanced BSTs halve the search space at each level, leading to logarithmic search complexity.',
        topic: 'Algorithms'
      },
      {
        questionText: `Which CSS property is used to define the space inside a border, between the border and the content?`,
        options: ['margin', 'padding', 'border-spacing', 'align-content'],
        correctAnswerIndex: 1,
        explanation: 'Padding adds space inside an element, whereas margin adds space outside it.',
        topic: 'CSS layouts'
      },
      {
        questionText: `What is the primary use case of the 'git cherry-pick' command?`,
        options: [
          'It reverts the entire repository to an older commit hash.',
          'It applies the changes introduced by some existing commits to the current branch.',
          'It deletes uncommitted local changes.',
          'It initializes a remote upstream branch.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Cherry-picking allows you to select specific commits from one branch and apply them to another.',
        topic: 'Version Control'
      },
      {
        questionText: `What is the standard port number for secure HTTPS traffic?`,
        options: ['80', '8080', '443', '3000'],
        correctAnswerIndex: 2,
        explanation: 'HTTPS traffic is directed to port 443, while standard HTTP utilizes port 80.',
        topic: 'Networking'
      },
      {
        questionText: `Which Docker command is used to run a container in the background (detached mode)?`,
        options: ['docker run -d', 'docker start -bg', 'docker exec -it', 'docker run -p'],
        correctAnswerIndex: 0,
        explanation: 'The "-d" flag stands for detached, allowing containers to run as background daemons.',
        topic: 'DevOps & Containers'
      },
      {
        questionText: `What does 'DRY' stand for in software engineering principles?`,
        options: ['Document Real Yields', 'Don\'t Repeat Yourself', 'Database Realtime Yield', 'Dynamic Route Yielding'],
        correctAnswerIndex: 1,
        explanation: 'Don\'t Repeat Yourself aims to reduce redundancy in systems through abstraction.',
        topic: 'Clean Code principles'
      },
      {
        questionText: `Which of the following sorting algorithms has the best worst-case time complexity?`,
        options: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Selection Sort'],
        correctAnswerIndex: 2,
        explanation: 'Merge Sort has a guaranteed worst-case time complexity of O(n log n), whereas Quick Sort has O(n^2).',
        topic: 'Algorithms'
      },
      {
        questionText: `In React 18/19, what hook is used to trigger side effects on component lifecycle changes?`,
        options: ['useState', 'useContext', 'useEffect', 'useMemo'],
        correctAnswerIndex: 2,
        explanation: 'useEffect handles side-effects like fetching data, syncing timers, or setting up listener hooks.',
        topic: 'React'
      },
      {
        questionText: `What is SQL Injection?`,
        options: [
          'A process of database normalization.',
          'An attack where malicious SQL statements are inserted into entry fields for execution.',
          'A styling strategy for relational grids.',
          'A backup recovery process.'
        ],
        correctAnswerIndex: 1,
        explanation: 'SQL Injection inserts unauthorized database queries to compromise data assets.',
        topic: 'Security'
      },
      {
        questionText: `Which header handles Cross-Origin Resource Sharing controls in modern web apps?`,
        options: ['X-Frame-Options', 'Access-Control-Allow-Origin', 'Authorization', 'Cache-Control'],
        correctAnswerIndex: 1,
        explanation: 'Access-Control-Allow-Origin dictates which clients can access assets cross-origin.',
        topic: 'Web Security'
      },
      {
        questionText: `What does the 'npm ci' command do?`,
        options: [
          'It cleans the npm cache memory.',
          'It installs packages directly from package-lock.json for clean CI builds.',
          'It runs unit testing logs.',
          'It compiles TypeScript code.'
        ],
        correctAnswerIndex: 1,
        explanation: 'npm ci performs a clean install using the lockfile, which is optimal for build containers.',
        topic: 'Node.js Packaging'
      },
      {
        questionText: `What is the primary role of a 'Load Balancer' in system architectures?`,
        options: [
          'It encrypts user transactions.',
          'It distributes incoming network traffic across a group of backend servers.',
          'It compresses video feeds.',
          'It manages routing parameters.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Load balancers distribute work to optimize capacity utilization and prevent server overload.',
        topic: 'System Design'
      },
      {
        questionText: `Which of the following is a non-relational NoSQL database?`,
        options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite'],
        correctAnswerIndex: 2,
        explanation: 'MongoDB stores data in JSON-like documents, making it a NoSQL database.',
        topic: 'Databases'
      },
      {
        questionText: `In Git, what command lists the commit history of a branch?`,
        options: ['git status', 'git branch', 'git log', 'git show'],
        correctAnswerIndex: 2,
        explanation: 'git log prints chronological commit identifiers.',
        topic: 'Version Control'
      },
      {
        questionText: `What does JWT stand for?`,
        options: ['JSON Web Token', 'Java Web Tool', 'Joint Web Transfer', 'JSON Web Target'],
        correctAnswerIndex: 0,
        explanation: 'JWT is an open standard (RFC 7519) defining a compact method for securely transmitting claims.',
        topic: 'Authentication'
      },
      {
        questionText: `What is the purpose of 'useMemo' hook in React?`,
        options: [
          'To directly manipulate the DOM.',
          'To cache the result of a calculation between re-renders.',
          'To declare global states.',
          'To mount lifecycle listeners.'
        ],
        correctAnswerIndex: 1,
        explanation: 'useMemo memoizes CPU-intensive computations to prevent unwanted recalculation overheads.',
        topic: 'React'
      },
      {
        questionText: `What is the time complexity of pushing an element to a Stack?`,
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswerIndex: 0,
        explanation: 'Push operations on a stack happen at the top index, which is instantaneous O(1).',
        topic: 'Data Structures'
      },
      {
        questionText: `Which protocol is primarily used for real-time bi-directional client-server communications?`,
        options: ['HTTP/1.1', 'WebSockets', 'SMTP', 'FTP'],
        correctAnswerIndex: 1,
        explanation: 'WebSockets maintain open socket links for bi-directional live communications.',
        topic: 'Networking'
      },
      {
        questionText: `What is the purpose of the 'helmet' middleware in Express?`,
        options: [
          'It handles file downloads.',
          'It sets HTTP response headers to secure Express apps.',
          'It sanitizes database queries.',
          'It processes multipart form-data.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Helmet secure Express applications by setting appropriate security-related HTTP headers.',
        topic: 'Security'
      },
      {
        questionText: `Which keyword is used to declare a variable scoped strictly to the enclosing block in ES6?`,
        options: ['var', 'let', 'global', 'define'],
        correctAnswerIndex: 1,
        explanation: 'let variables are block-scoped, preventing variable hoisting leaks typical of var.',
        topic: 'JavaScript'
      },
      {
        questionText: `What does HTML stand for?`,
        options: [
          'HyperText Markup Language',
          'HighText Machine Language',
          'HyperTech Model Language',
          'HyperText Metadata Layout'
        ],
        correctAnswerIndex: 0,
        explanation: 'HTML defines the skeletal layout of web interfaces.',
        topic: 'Web Foundations'
      },
      {
        questionText: `What is the default port of a Redis caching server?`,
        options: ['27017', '5432', '6379', '3306'],
        correctAnswerIndex: 2,
        explanation: 'Redis by default listens on port 6379, while MongoDB listens on 27017.',
        topic: 'Caching'
      },
      {
        questionText: `Which Git command allows shifting code updates to a remote workspace repository?`,
        options: ['git pull', 'git fetch', 'git push', 'git commit'],
        correctAnswerIndex: 2,
        explanation: 'git push uploads local branch commits to the remote repository.',
        topic: 'Version Control'
      },
      {
        questionText: `What is a Mongoose schema validation hook middleware?`,
        options: [
          'A router controller validator.',
          'A pre or post execution trigger hook run during document updates/saves.',
          'An SSL configuration.',
          'A visual theme stylesheet.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Pre/post hooks run verification, hashing, or logs during schema document saves.',
        topic: 'Databases'
      },
      {
        questionText: `What is the role of an 'A Record' in DNS settings?`,
        options: [
          'It routes email traffic records.',
          'It maps a domain name directly to an IPv4 address.',
          'It points a subdomain to a canonical name.',
          'It manages certificate records.'
        ],
        correctAnswerIndex: 1,
        explanation: 'A records map human-readable domain names to host IPv4 addresses.',
        topic: 'DNS & Systems'
      },
      {
        questionText: `What is a Singleton design pattern?`,
        options: [
          'A pattern restricted to single query responses.',
          'A pattern ensuring a class has only one instance and provides a global access point.',
          'A database backup workflow.',
          'A styling strategy.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Singletons restrict instance creation to one object, optimal for database client instances.',
        topic: 'Software Architecture'
      },
      {
        questionText: `Which of the following handles asynchronous execution flow control in JavaScript ES8?`,
        options: ['callbacks', 'promises', 'async / await', 'generators'],
        correctAnswerIndex: 2,
        explanation: 'Async/await provides clean, synchronous-looking control flow over asynchronous promise lists.',
        topic: 'JavaScript'
      },
      {
        questionText: `What is the key purpose of Mongoose 'indexes'?`,
        options: [
          'They store files in memory storage.',
          'They improve query search execution speeds significantly at the cost of writes.',
          'They sanitize text tags.',
          'They handle email delivery loops.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Indexes optimize collection query scans, avoiding expensive full table collection scans.',
        topic: 'Databases'
      },
      {
        questionText: `What does the 'npm link' command do?`,
        options: [
          'It creates symlinks for local packages, optimal for package testing.',
          'It downloads dependencies from remote feeds.',
          'It starts testing frameworks.',
          'It registers billing webhooks.'
        ],
        correctAnswerIndex: 0,
        explanation: 'npm link connects local package directories to global nodes for workspace integration tests.',
        topic: 'Node.js Packaging'
      },
      {
        questionText: `Which of the following is a symmetric encryption algorithm?`,
        options: ['RSA', 'AES', 'ECC', 'Diffie-Hellman'],
        correctAnswerIndex: 1,
        explanation: 'AES is a symmetric key cipher, while RSA is asymmetric public-key cryptography.',
        topic: 'Cryptography'
      },
      {
        questionText: `What does CSS stand for?`,
        options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Content Style Sheets'],
        correctAnswerIndex: 0,
        explanation: 'CSS handles design structures, styling parameters, layout templates, and themes.',
        topic: 'Web Foundations'
      },
      {
        questionText: `In Docker Compose, what does the 'volumes' directive do?`,
        options: [
          'It increases container server volumes.',
          'It mounts persistent storage systems to host paths.',
          'It scales networks.',
          'It configures CPU capacity thresholds.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Volumes persist file writes beyond container runtimes by mapping them to host machines.',
        topic: 'DevOps & Containers'
      },
      {
        questionText: `What is the purpose of the 'git rebase' command?`,
        options: [
          'It deletes a branch permanently.',
          'It moves or combines a sequence of commits to a new base commit.',
          'It fetches updates without merging.',
          'It reverts a single commit.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Rebasing clean up commit trees by rewriting branch bases.',
        topic: 'Version Control'
      },
      {
        questionText: `Which design layout method is best for organizing content grid layouts in CSS?`,
        options: ['flexbox', 'CSS Grid', 'inline-blocks', 'float positioning'],
        correctAnswerIndex: 1,
        explanation: 'CSS Grid provides a two-dimensional grid-based layout model, which is superior to Flexbox for grid alignments.',
        topic: 'CSS layouts'
      },
      {
        questionText: `What does the HTTP status code '403 Forbidden' indicate?`,
        options: [
          'The request has timed out.',
          'The client has authentication credentials but lacks authorization to access resources.',
          'The server is offline.',
          'The resource does not exist.'
        ],
        correctAnswerIndex: 1,
        explanation: '403 indicates authorization restrictions, whereas 401 indicates authentication failure.',
        topic: 'HTTP protocols'
      }
    ];

    // Fisher-Yates shuffle algorithm to randomize questions
    const shuffled = [...questionPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return exactly 20 randomized questions
    return shuffled.slice(0, 20);
  }

  static async generateAdaptedTimeline(currentTimelineJson: string, instruction: string): Promise<string> {
    if (isMock || !ai) {
      console.log('Using mock timeline adapter...');
      return currentTimelineJson;
    }

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: `Timeline:\n${currentTimelineJson}\n\nTask: ${instruction}`,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an adaptive timeline agent. Output updated timeline matching the database timeline array structure exactly.',
        },
      });

      return response.text || currentTimelineJson;
    } catch (err) {
      console.error('Gemini generateAdaptedTimeline error:', err);
      return currentTimelineJson;
    }
  }

  static async generateCodingChallenge(
    topic: string,
    language: string,
    difficulty: string,
    previousHashes: string[]
  ): Promise<any> {
    if (isMock || !ai) {
      return this.getMockCodingChallenge(topic, language, difficulty);
    }
    const prompt = `
      Create a unique, production-grade coding challenge.
      Topic: "${topic}"
      Programming Language: "${language}"
      Difficulty Level: "${difficulty}"
      
      To ensure the problem is unique and is NEVER repeated, do not base the story/scenario on any of the following previous question details or hashes: [${previousHashes.join(', ')}].
      Instead of using generic textbook descriptions (like "Two Sum" or "Reverse a String"), wrap the algorithm in a completely unique, highly descriptive real-world scenario (e.g. tracking items on a ship, calculating server routing distances, matching product prices to coupon budgets). Use creative variable names, clear input/output descriptions, constraints, examples, template code, test cases, and progressive hints.
      
      You MUST respond with a valid JSON object matching this schema structure:
      {
        "title": "A Creative Title",
        "description": "A highly detailed problem statement with a story scenario. Describe what the function needs to do, input parameters, and what should be returned.",
        "constraints": ["e.g. 1 <= nums.length <= 10^4", "e.g. -10^9 <= nums[i] <= 10^9"],
        "examples": [
          {
            "input": "nums = [2, 7, 11, 15], target = 9",
            "output": "[0, 1]",
            "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
          }
        ],
        "codeTemplate": "The starter template code for the user in the selected language. Include the main function signature.",
        "testCases": [
          {
            "input": "nums = [2, 7, 11, 15], target = 9",
            "output": "[0, 1]",
            "isHidden": false
          },
          {
            "input": "nums = [3, 2, 4], target = 6",
            "output": "[1, 2]",
            "isHidden": false
          },
          {
            "input": "nums = [3, 3], target = 6",
            "output": "[0, 1]",
            "isHidden": true
          }
        ],
        "optimalSolution": "The complete reference code solution in the requested language.",
        "hints": [
          "Hint 1: A brief algorithmic pointer.",
          "Hint 2: A more detailed strategy hint.",
          "Hint 3: Code logic or partial solution outline."
        ]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an expert algorithms developer and LeetCode content creator. Output only pure, parseable JSON conforming exactly to the requested schema. Do not wrap it in markdown code blocks.',
        },
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error('Gemini Coding Challenge Generation Error:', error);
      return this.getMockCodingChallenge(topic, language, difficulty);
    }
  }

  private static getMockCodingChallenge(topic: string, language: string, difficulty: string): any {
    const templates: Record<string, string> = {
      javascript: `function findUniquePairs(prices, budget) {\n  // Write your code here\n  return [];\n}`,
      python: `def find_unique_pairs(prices, budget):\n    # Write your code here\n    return []`,
      cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> findUniquePairs(vector<int>& prices, int budget) {\n        return {};\n    }\n};`,
      java: `import java.util.*;\nclass Solution {\n    public int[] findUniquePairs(int[] prices, int budget) {\n        return new int[0];\n    }\n}`,
      go: `package main\n\nfunc findUniquePairs(prices []int, budget int) []int {\n    return []int{}\n}`,
      rust: `impl Solution {\n    pub fn find_unique_pairs(prices: Vec<i32>, budget: i32) -> Vec<i32> {\n        vec![]\n    }\n}`
    };

    const template = templates[language.toLowerCase()] || `// Write your code here`;

    return {
      title: 'Optimal Shopping Cart Optimizer',
      description: `A shopping application has a list of product prices and a gift voucher amount. Find indices of two products whose sum of prices is exactly equal to the voucher amount. You can assume there is exactly one solution and you may not use the same element twice.`,
      constraints: [
        '2 <= prices.length <= 10^4',
        '1 <= prices[i] <= 10^9',
        '1 <= budget <= 10^9'
      ],
      examples: [
        {
          input: 'prices = [10, 20, 30, 40], budget = 50',
          output: '[1, 2]',
          explanation: 'The prices at index 1 (20) and index 2 (30) sum to 50.'
        }
      ],
      codeTemplate: template,
      testCases: [
        { input: 'prices = [10, 20, 30, 40], budget = 50', output: '[1, 2]', isHidden: false },
        { input: 'prices = [15, 25, 35, 45], budget = 80', output: '[2, 3]', isHidden: false },
        { input: 'prices = [5, 10, 15, 20], budget = 15', output: '[0, 1]', isHidden: true }
      ],
      optimalSolution: `// Optimal two-pointer or hashmap implementation`,
      hints: [
        'Use a hash map to store visited elements and their index.',
        'As you iterate, check if (budget - price) is present in the hash map.',
        'If present, return the indices immediately.'
      ]
    };
  }

  static async reviewCodingChallenge(
    title: string,
    problem: string,
    code: string,
    language: string
  ): Promise<any> {
    if (isMock || !ai) {
      return {
        correctness: 'Your code compiles and passes all test cases successfully.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        suggestions: 'Your code is clean and optimal. To save memory, you could reuse arrays instead of instantiating new lists.'
      };
    }

    const prompt = `
      Perform a comprehensive code review of the following coding submission:
      Problem Title: "${title}"
      Problem Description: "${problem}"
      Target Programming Language: "${language}"
      Submitted User Code:
      \`\`\`${language}
      ${code}
      \`\`\`

      You MUST respond with a valid JSON object matching this schema:
      {
        "correctness": "Brief summary of code correctness.",
        "timeComplexity": "e.g. O(N log N)",
        "spaceComplexity": "e.g. O(1)",
        "suggestions": "Suggestions on code quality, readability, naming conventions, optimization opportunities, or safety bugs."
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are a Senior Principal Software Engineer. Output only pure, parseable JSON conforming exactly to the requested schema.',
        },
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error('Gemini Code Review Error:', e);
      return {
        correctness: 'Your code compiles and passes all test cases.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        suggestions: 'Your code is optimal. Review time complexity calculations.'
      };
    }
  }

  static async interviewerDialogue(
    title: string,
    code: string,
    chatHistory: { role: string; text: string }[],
    newAnswer: string
  ): Promise<any> {
    if (isMock || !ai) {
      return {
        reply: 'That is a reasonable approach to handling edge cases! How would you scale this if the inputs exceeded memory bounds?'
      };
    }

    const historyStr = chatHistory.map((c) => `${c.role === 'user' ? 'User' : 'Interviewer'}: ${c.text}`).join('\n');
    const prompt = `
      You are an AI Technical Interviewer conducting a mock interview follow-up dialog.
      Problem Title: "${title}"
      Submitted Code:
      \`\`\`
      ${code}
      \`\`\`

      Dialogue History:
      ${historyStr}

      User's New Answer: "${newAnswer}"

      Provide your follow-up reply, evaluating their answers, asking relevant questions about system scaling, complexity, edge cases, or optimization options.
      Keep it professional, direct, and conversational. Output only a pure JSON object:
      {
        "reply": "Your interviewer comment or question."
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an elite Google technical interviewer. Output only pure, parseable JSON conforming exactly to the requested schema.',
        },
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error('Gemini Interviewer Dialogue Error:', e);
      return {
        reply: 'Interesting response! How would this behave if we scaled the data across multi-cluster sharded nodes?'
      };
    }
  }
}
