export type QuestionType = "verbal" | "code";
export type DifficultyLevel = "intern" | "junior" | "associate";

export interface InterviewQuestion {
  text: string;
  type: QuestionType;
  source?: "core" | "resume";
}

export interface ResumeExtractedData {
  name?: string;
  skills?: string[];
  projects?: string[];
  education?: string[];
  internships?: string[];
  certifications?: string[];
}

const CODE_KEYWORDS =
  /\b(code|syntax|sql|query|write|implement|function|algorithm|pseudo|regex|api endpoint|schema|script|program)\b/i;

export function isCodeQuestion(text: string): boolean {
  return CODE_KEYWORDS.test(text);
}

export function normalizeDifficulty(level?: string): DifficultyLevel {
  const value = level?.toLowerCase();
  if (value === "intern" || value === "associate") return value;
  return "junior";
}

const difficultyLabels: Record<DifficultyLevel, string> = {
  intern: "Internship",
  junior: "Junior Developer",
  associate: "Associate Engineer",
};

export function getDifficultyLabel(level?: string): string {
  return difficultyLabels[normalizeDifficulty(level)];
}

/** Rich Role × difficulty question banks supporting up to 15 questions per session */
const questionsByRoleAndLevel: Record<string, Record<DifficultyLevel, InterviewQuestion[]>> = {
  "Graduate Software Engineer": {
    intern: [
      { text: "Tell me about yourself and what sparked your interest in software engineering.", type: "verbal" },
      { text: "What is the difference between frontend and backend in a modern web application?", type: "verbal" },
      { text: "Explain variables, loops, and functions using any programming language you know.", type: "verbal" },
      { text: "Write a program to print numbers from 1 to 20, replacing multiples of 3 with 'Fizz'.", type: "code" },
      { text: "What is the difference between an Array and a Linked List in terms of memory and access speed?", type: "verbal" },
      { text: "What is recursion and can you give a simple real-world or programming example?", type: "verbal" },
      { text: "Write a simple function to find the maximum number in an array of integers.", type: "code" },
      { text: "What is Git and why is version control critical for team development?", type: "verbal" },
      { text: "What is the difference between synchronous and asynchronous execution?", type: "verbal" },
      { text: "Explain the concept of basic debugging: how do you locate a bug in your code?", type: "verbal" },
      { text: "Write a function that takes two numbers and returns their sum, handling null or undefined inputs.", type: "code" },
      { text: "What is an HTTP request and what are status codes like 200, 404, and 500?", type: "verbal" },
      { text: "How do you organize your time when working on academic deadlines and coding assignments?", type: "verbal" },
      { text: "Write a code snippet to reverse a string without using built-in reverse functions.", type: "code" },
      { text: "Where do you see your technical skills progressing over the next 12 to 18 months?", type: "verbal" },
    ],
    junior: [
      { text: "Could you explain the difference between a process and a thread, and when multi-threading is beneficial?", type: "verbal" },
      { text: "Tell me about your final year project. What was your technical role, and what challenges did you overcome?", type: "verbal" },
      { text: "Write a function to detect if a string is a palindrome. Discuss your time and space complexity.", type: "code" },
      { text: "Explain the four core pillars of Object-Oriented Programming (OOP) with real-world examples.", type: "verbal" },
      { text: "What is the difference between SQL and NoSQL databases, and when would you choose each?", type: "verbal" },
      { text: "Write a function to find the first non-repeating character in a string.", type: "code" },
      { text: "What is RESTful API design? Explain key HTTP methods like GET, POST, PUT, PATCH, and DELETE.", type: "verbal" },
      { text: "How does garbage collection work in languages like Java, Python, or JavaScript?", type: "verbal" },
      { text: "Write a code snippet to remove duplicate values from an array while preserving order.", type: "code" },
      { text: "Explain the difference between stack memory and heap memory allocation.", type: "verbal" },
      { text: "If you are asked to learn an unfamiliar library or framework in one week, what is your approach?", type: "verbal" },
      { text: "Write a SQL query to find employees whose salary is greater than the average department salary.", type: "code" },
      { text: "What is CORS (Cross-Origin Resource Sharing) and why does the browser block certain requests?", type: "verbal" },
      { text: "How do you write unit tests, and what makes a good unit test versus an integration test?", type: "verbal" },
      { text: "Describe a situation where your code had a subtle bug. How did you identify the root cause?", type: "verbal" },
    ],
    associate: [
      { text: "Compare stack vs heap memory and explain how memory leaks occur in long-running services.", type: "verbal" },
      { text: "Design the high-level architecture for a scalable URL shortener like bit.ly.", type: "verbal" },
      { text: "Implement a function to find the longest substring without repeating characters in O(n) time.", type: "code" },
      { text: "How would you diagnose and resolve an issue where production API p99 latency suddenly jumps from 50ms to 2s?", type: "verbal" },
      { text: "Explain SOLID design principles and give a concrete refactoring example from a project you built.", type: "verbal" },
      { text: "Write a thread-safe singleton or an idempotent retry mechanism in code.", type: "code" },
      { text: "Compare optimistic vs pessimistic locking in relational databases with high concurrent writes.", type: "verbal" },
      { text: "What are the trade-offs between monolithic architecture and microservices for a growing engineering team?", type: "verbal" },
      { text: "Write an algorithm to merge two sorted arrays or linked lists in-place.", type: "code" },
      { text: "How do distributed caching layers (like Redis or Memcached) handle cache invalidation and stampedes?", type: "verbal" },
      { text: "Explain event-driven architectures with message queues like Kafka or RabbitMQ.", type: "verbal" },
      { text: "Write a SQL query using window functions (e.g. DENSE_RANK or ROW_NUMBER) for sales analytics.", type: "code" },
      { text: "How do you ensure zero-downtime database schema migrations in production?", type: "verbal" },
      { text: "What security measures do you implement to prevent SQL injection, XSS, and CSRF attacks?", type: "verbal" },
      { text: "How do you handle technical disagreements or architectural debates within a software engineering team?", type: "verbal" },
    ],
  },
  "Associate Frontend Developer": {
    intern: [
      { text: "What are HTML, CSS, and JavaScript, and how do they interact to render a webpage?", type: "verbal" },
      { text: "Have you built any webpage or UI in college? Walk me through what you created.", type: "verbal" },
      { text: "Write basic CSS to make a button styled with primary blue background, white text, and rounded corners.", type: "code" },
      { text: "What is responsive design and what are media queries used for?", type: "verbal" },
      { text: "Explain the difference between class selectors and ID selectors in CSS.", type: "verbal" },
      { text: "Write a JavaScript function to show or hide an element when a user clicks a button.", type: "code" },
      { text: "What is the Document Object Model (DOM) and how does JavaScript manipulate it?", type: "verbal" },
      { text: "What is the difference between 'let', 'const', and 'var' in modern JavaScript?", type: "verbal" },
      { text: "Write CSS Flexbox rules to center an item horizontally and vertically inside a container.", type: "code" },
      { text: "What are semantic HTML tags and why are they important for accessibility and SEO?", type: "verbal" },
      { text: "What is an event listener and how does event bubbling work in the browser?", type: "verbal" },
      { text: "Write a JavaScript snippet to fetch data from an API endpoint using fetch() and console.log the result.", type: "code" },
      { text: "What browser developer tools do you use most frequently when debugging front-end issues?", type: "verbal" },
      { text: "What is CSS Box Model? Explain margin, border, padding, and content.", type: "verbal" },
      { text: "What front-end frameworks or libraries are you most excited to master?", type: "verbal" },
    ],
    junior: [
      { text: "What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?", type: "verbal" },
      { text: "Write CSS using modern Flexbox or Grid to create a responsive 3-column card grid.", type: "code" },
      { text: "What is state management in React, and when do you use Context API versus local useState?", type: "verbal" },
      { text: "How do you optimize a website's Core Web Vitals and initial page load speed?", type: "verbal" },
      { text: "Write a custom React hook that debounces an input value for live search.", type: "code" },
      { text: "Explain the virtual DOM in React: how does reconciliation and diffing work?", type: "verbal" },
      { text: "What is the purpose of useEffect dependency arrays, and how do you prevent infinite re-render loops?", type: "verbal" },
      { text: "Write a React component for an accessible modal dialog with backdrop blur and close on Escape.", type: "code" },
      { text: "What is the difference between controlled and uncontrolled form inputs in React?", type: "verbal" },
      { text: "How do you handle loading states, error boundaries, and empty states in production UIs?", type: "verbal" },
      { text: "Write a JavaScript utility function to deep clone an object or format a currency amount.", type: "code" },
      { text: "What are CSS variables (custom properties) and how do they make dark mode theming maintainable?", type: "verbal" },
      { text: "How do you enforce accessibility (a11y) standards like ARIA labels, keyboard navigation, and contrast?", type: "verbal" },
      { text: "Explain the difference between localStorage, sessionStorage, and HTTP-only cookies on the client.", type: "verbal" },
      { text: "Walk me through the most complex interactive UI component you have built from scratch.", type: "verbal" },
    ],
    associate: [
      { text: "Explain React 19 / Server Components architecture: boundaries, serialization, and hydration trade-offs.", type: "verbal" },
      { text: "Write a TypeScript custom hook that manages paginated data fetching with abort controllers and caching.", type: "code" },
      { text: "How would you diagnose and fix Cumulative Layout Shift (CLS) and Long Animation Frames in production?", type: "verbal" },
      { text: "Compare micro-frontends vs monorepo design system packages for a team with multiple web properties.", type: "verbal" },
      { text: "Write a performant virtualized list component in React for rendering 50,000 items smoothly.", type: "code" },
      { text: "Explain the browser critical rendering path: DOM, CSSOM, Render Tree, Layout, Paint, and Composite.", type: "verbal" },
      { text: "How do you architect a reusable, theme-agnostic design system component library in TypeScript?", type: "verbal" },
      { text: "Write a code snippet to implement a drag-and-drop or intersection-observer based infinite scroll.", type: "code" },
      { text: "What strategies do you use for code-splitting, tree-shaking, and asset compression in modern bundlers like Vite/Webpack?", type: "verbal" },
      { text: "How do you manage client-side state synchronization with WebSocket or Server-Sent Events (SSE)?", type: "verbal" },
      { text: "Explain optimistic UI updates: how do you revert UI state gracefully if the backend mutation fails?", type: "verbal" },
      { text: "Write end-to-end and component test specifications using Playwright or Testing Library.", type: "code" },
      { text: "What security considerations apply to modern SPAs regarding XSS, Content Security Policy (CSP), and token storage?", type: "verbal" },
      { text: "How do you profile memory leaks and detached DOM nodes in Chrome DevTools?", type: "verbal" },
      { text: "Describe how you mentor junior frontend engineers and maintain code review standards across a team.", type: "verbal" },
    ],
  },
  "Associate Backend Developer": {
    intern: [
      { text: "What is an API and why do modern web and mobile applications rely on them?", type: "verbal" },
      { text: "Explain the fundamental difference between HTTP GET and POST requests.", type: "verbal" },
      { text: "Write a basic SQL query to select all users from a 'users' table whose status is active.", type: "code" },
      { text: "What is a relational database and what is a Primary Key?", type: "verbal" },
      { text: "Explain the concept of a client-server architecture in simple terms.", type: "verbal" },
      { text: "Write a simple Express.js or Node route that returns a JSON message 'Hello World'.", type: "code" },
      { text: "What is JSON and why has it become the universal data format for web APIs?", type: "verbal" },
      { text: "What is an environment variable and why should you never commit secrets or passwords into Git?", type: "verbal" },
      { text: "Write a SQL query to count total orders grouped by customer ID.", type: "code" },
      { text: "What is the difference between authentication (authn) and authorization (authz)?", type: "verbal" },
      { text: "What is middleware in a backend web framework?", type: "verbal" },
      { text: "Write a function that validates if a given string is a valid email format.", type: "code" },
      { text: "What happens when an unhandled error or exception occurs in a backend server?", type: "verbal" },
      { text: "What is an ORM (Object-Relational Mapping) tool and what are its benefits for beginners?", type: "verbal" },
      { text: "What backend language or framework (e.g. Node, Python, Java) are you most comfortable using and why?", type: "verbal" },
    ],
    junior: [
      { text: "What is the difference between SQL and NoSQL databases, and when would you choose MongoDB vs PostgreSQL?", type: "verbal" },
      { text: "Write a SQL query to find the second highest employee salary without using hardcoded limits.", type: "code" },
      { text: "What is database indexing? Explain B-Trees and how indexes accelerate queries versus table scans.", type: "verbal" },
      { text: "How does JWT (JSON Web Token) authentication work? What are access tokens and refresh tokens?", type: "verbal" },
      { text: "Write an Express middleware to verify JWT authorization headers and attach user payload to the request.", type: "code" },
      { text: "Explain database ACID properties (Atomicity, Consistency, Isolation, Durability) with a banking transfer example.", type: "verbal" },
      { text: "What is rate limiting and why is it essential for public-facing API endpoints?", type: "verbal" },
      { text: "Write a SQL query joining 'orders' and 'customers' to retrieve total spent per customer name.", type: "code" },
      { text: "How do you handle asynchronous operations in Node.js? Explain async/await vs Promises vs Event Loop.", type: "verbal" },
      { text: "What are database transactions and how do you rollback changes if a step fails?", type: "verbal" },
      { text: "Write a backend endpoint to handle file uploads securely with file type and size restrictions.", type: "code" },
      { text: "How do you structure database schemas with Foreign Keys and handle cascade deletes responsibly?", type: "verbal" },
      { text: "What logging practices and HTTP status codes do you follow when building production REST services?", type: "verbal" },
      { text: "Write a simple in-memory caching mechanism with Time-to-Live (TTL) expiration.", type: "code" },
      { text: "Walk me through the database schema and API endpoints you designed for your final year project or personal app.", type: "verbal" },
    ],
    associate: [
      { text: "Design REST and webhook architecture for a multi-tenant payment processing gateway.", type: "verbal" },
      { text: "Write a SQL query utilizing window functions (e.g. LAG/LEAD or SUM OVER) to compute rolling 7-day revenue.", type: "code" },
      { text: "Explain distributed caching strategies (Cache-Aside, Write-Through, Write-Behind) and solving cache stampedes.", type: "verbal" },
      { text: "How do you ensure idempotency for critical API endpoints like credit card billing or stock orders?", type: "verbal" },
      { text: "Write code to implement a token bucket or sliding-window rate limiter using Redis.", type: "code" },
      { text: "What are the trade-offs between database sharding, read replicas, and connection pooling under heavy load?", type: "verbal" },
      { text: "Explain the differences between REST, GraphQL, and gRPC: when would you choose gRPC for internal services?", type: "verbal" },
      { text: "Write a resilient background worker queue consumer with exponential backoff and dead-letter queues.", type: "code" },
      { text: "How do you design database migrations in continuous delivery environments to prevent lock contention?", type: "verbal" },
      { text: "Explain isolation levels in PostgreSQL/MySQL (Read Committed, Repeatable Read, Serializable) and phantom reads.", type: "verbal" },
      { text: "Write a query or code snippet to optimize an N+1 query problem commonly generated by ORMs.", type: "code" },
      { text: "How do you trace and profile memory leaks or CPU bottlenecks in Node.js or JVM production services?", type: "verbal" },
      { text: "Design a secure session management architecture capable of immediate remote logout across all user devices.", type: "verbal" },
      { text: "Explain distributed transactions: Two-Phase Commit (2PC) vs Saga pattern in microservice environments.", type: "verbal" },
      { text: "How do you establish disaster recovery, automated database backups, and point-in-time recovery (PITR)?", type: "verbal" },
    ],
  },
  "Full Stack Developer (Trainee)": {
    intern: [
      { text: "What does full stack development mean to you, and which part do you enjoy more?", type: "verbal" },
      { text: "Explain step-by-step what happens when a user types a URL into a browser and hits Enter.", type: "verbal" },
      { text: "Write an HTML form with username and password fields that submits via POST to /api/login.", type: "code" },
      { text: "Have you used Git in college? Explain git add, git commit, and git push.", type: "verbal" },
      { text: "What is an API and how does a frontend React app request data from a backend server?", type: "verbal" },
      { text: "Write a simple JavaScript function to validate that a password is at least 8 characters long.", type: "code" },
      { text: "What is the difference between client-side validation and server-side validation?", type: "verbal" },
      { text: "What is npm / yarn and what is the difference between dependencies and devDependencies?", type: "verbal" },
      { text: "Write a SQL query to insert a new user row into a 'users' table.", type: "code" },
      { text: "What is CSS Flexbox and how does it make aligning items on a screen easier?", type: "verbal" },
      { text: "Explain the difference between a synchronous function and a Promise in JavaScript.", type: "verbal" },
      { text: "Write a simple Express.js GET route that returns an array of sample products.", type: "code" },
      { text: "What are browser cookies and how are they different from localStorage?", type: "verbal" },
      { text: "What tools do you use to test your APIs (e.g. Postman, Thunder Client)?", type: "verbal" },
      { text: "Tell me about a web project or college assignment you built from end to end.", type: "verbal" },
    ],
    junior: [
      { text: "How do frontend and backend communicate across CORS boundaries? Explain the HTTP preflight request.", type: "verbal" },
      { text: "Write an Express.js route handler for user authentication that checks hashed passwords with bcrypt.", type: "code" },
      { text: "How do you manage state between the frontend and backend in modern full-stack apps (e.g. React Query / SWR)?", type: "verbal" },
      { text: "What are the trade-offs between Client-Side Rendering (SPA) and Server-Side Rendering (Next.js)?", type: "verbal" },
      { text: "Write a React component that fetches data from an API endpoint with loading and error states.", type: "code" },
      { text: "Explain how session management works using secure HTTP-only cookies versus JWT in Authorization headers.", type: "verbal" },
      { text: "How do you structure database schemas with Prisma or Mongoose to avoid data inconsistencies?", type: "verbal" },
      { text: "Write a SQL query using JOINs to fetch a user's profile alongside their recent 5 orders.", type: "code" },
      { text: "What is your Git branching strategy when working on features, bug fixes, and releases in a team?", type: "verbal" },
      { text: "How do you protect a full-stack application against common OWASP vulnerabilities like XSS and CSRF?", type: "verbal" },
      { text: "Write a reusable debounce or throttle function in TypeScript.", type: "code" },
      { text: "What is the difference between optimistic UI updates and pessimistic UI updates?", type: "verbal" },
      { text: "How do you deploy a full-stack application with environment variables across staging and production?", type: "verbal" },
      { text: "Write an API route that implements pagination with 'limit' and 'cursor' or 'offset' query parameters.", type: "code" },
      { text: "Walk me through your final year project or primary portfolio application from database schema to UI.", type: "verbal" },
    ],
    associate: [
      { text: "Design the complete authentication and session architecture for a modern Next.js / Node full-stack application.", type: "verbal" },
      { text: "Write a resilient Next.js Server Action or Express endpoint with transactional rollback for a multi-step checkout.", type: "code" },
      { text: "How do you structure a high-performance monorepo with shared TypeScript models, utilities, and UI tokens?", type: "verbal" },
      { text: "Compare Server Actions, traditional REST APIs, and tRPC for developer velocity and payload performance.", type: "verbal" },
      { text: "Write a custom WebSocket handler that broadcasts real-time chat notifications to subscribed users.", type: "code" },
      { text: "How do you optimize server-side database connection pools in serverless environments like AWS Lambda or Vercel?", type: "verbal" },
      { text: "Explain caching strategies at every layer: CDN, reverse proxy, Next.js Data Cache, Redis, and database buffers.", type: "verbal" },
      { text: "Write an automated integration test using Vitest/Jest and Supertest to verify full auth and data mutation flows.", type: "code" },
      { text: "How do you architect role-based access control (RBAC) and permissions from database tables to frontend UI components?", type: "verbal" },
      { text: "Describe how you would diagnose an out-of-memory crash or slow memory leak on a production Node.js cluster.", type: "verbal" },
      { text: "Write a resilient file upload pipeline that streams files directly to cloud storage (S3) with signed URLs.", type: "code" },
      { text: "What is your approach to automated CI/CD pipelines with linting, unit tests, preview deployments, and release tags?", type: "verbal" },
      { text: "How do you ensure audit logging, GDPR compliance, and sensitive data encryption at rest and in transit?", type: "verbal" },
      { text: "Explain database read/write replica routing in an enterprise full-stack application.", type: "verbal" },
      { text: "Describe a high-stakes technical decision or refactor you led. What were the trade-offs and business impact?", type: "verbal" },
    ],
  },
  "QA Test Analyst (Fresher)": {
    intern: [
      { text: "What is software testing and why is quality assurance critical in the software development lifecycle?", type: "verbal" },
      { text: "What is the fundamental difference between a software bug, a defect, and a feature request?", type: "verbal" },
      { text: "Write 3 positive and 3 negative test cases for a user login screen.", type: "code" },
      { text: "What testing tools or frameworks have you learned about or used in college (e.g. Postman, Selenium)?", type: "verbal" },
      { text: "Explain the difference between black-box testing and white-box testing.", type: "verbal" },
      { text: "Write test cases for an online shopping cart checkout button.", type: "code" },
      { text: "What is the Software Testing Life Cycle (STLC) and what are its main stages?", type: "verbal" },
      { text: "What is a test plan and what information does a test case document include?", type: "verbal" },
      { text: "Write boundary value analysis test cases for an age input field accepting values from 18 to 60.", type: "code" },
      { text: "What is regression testing and why is it performed whenever new code is committed?", type: "verbal" },
      { text: "What is the difference between functional testing and non-functional testing?", type: "verbal" },
      { text: "Write a bug report for a button that fails to respond when clicked on mobile screens.", type: "code" },
      { text: "How do you prioritize test cases when testing time is strictly limited before a release?", type: "verbal" },
      { text: "What is exploratory testing and when is it most valuable?", type: "verbal" },
      { text: "Why did you choose QA / Software Testing as your career direction?", type: "verbal" },
    ],
    junior: [
      { text: "What is the difference between unit testing, integration testing, end-to-end testing, and smoke testing?", type: "verbal" },
      { text: "Write detailed test cases for a multi-step user registration form with password strength rules.", type: "code" },
      { text: "Explain the concept of test automation: when should a team automate vs keep manual testing?", type: "verbal" },
      { text: "How do you test REST APIs using Postman or automated test suites? What assertions do you write?", type: "verbal" },
      { text: "Write an automated test script (using Selenium, Cypress, or Playwright syntax) to verify user login.", type: "code" },
      { text: "What is the difference between Bug Severity and Bug Priority? Provide clear real-world examples of each.", type: "verbal" },
      { text: "How do you approach cross-browser and cross-device testing across desktop, iOS, and Android?", type: "verbal" },
      { text: "Write SQL queries that a QA analyst would run to verify data consistency after a user transaction.", type: "code" },
      { text: "What is performance testing? Explain load testing, stress testing, and endurance testing.", type: "verbal" },
      { text: "How do you integrate automated test suites into CI/CD pipelines like GitHub Actions or Jenkins?", type: "verbal" },
      { text: "Write test assertions for an API endpoint returning a paginated list of items with status 200.", type: "code" },
      { text: "What is Page Object Model (POM) in test automation and why does it improve test maintenance?", type: "verbal" },
      { text: "How do you handle flaky automated tests that fail intermittently without real code changes?", type: "verbal" },
      { text: "Write test cases specifically covering edge cases for an OTP (One-Time Password) verification screen.", type: "code" },
      { text: "Tell me about a challenging bug you uncovered during college projects or personal testing.", type: "verbal" },
    ],
    associate: [
      { text: "Design a comprehensive end-to-end quality strategy for a SaaS application with web, mobile, and API microservices.", type: "verbal" },
      { text: "Write a Playwright or Cypress framework fixture with authentication state sharing and parallel execution.", type: "code" },
      { text: "Explain 'Shift-Left' testing philosophy and how QA engineers collaborate during early sprint planning and design.", type: "verbal" },
      { text: "How do you architect automated API contract testing using tools like Pact or OpenAPI schema validators?", type: "verbal" },
      { text: "Write a k6 or JMeter script scenario to simulate 5,000 concurrent users hitting an e-commerce flash sale.", type: "code" },
      { text: "How do you establish code coverage targets and ensure coverage metrics reflect meaningful test quality?", type: "verbal" },
      { text: "Describe your strategy for mock servers, synthetic test data generation, and test database resets in CI.", type: "verbal" },
      { text: "Write an automated script to test file upload endpoints with corrupted, oversized, and valid payloads.", type: "code" },
      { text: "How do you conduct security vulnerability scanning (DAST / SAST) as part of QA release gates?", type: "verbal" },
      { text: "Explain how you manage defect triage meetings with product managers and engineering leads when release deadlines loom.", type: "verbal" },
      { text: "Write code to validate accessibility standards (axe-core) programmatically in continuous testing.", type: "code" },
      { text: "What metrics (e.g. defect escape rate, mean time to detect, test execution velocity) do you track to measure QA effectiveness?", type: "verbal" },
      { text: "How do you test eventual consistency and message consumer failures in distributed event-driven systems?", type: "verbal" },
      { text: "Describe how you investigate production incidents, perform root cause analysis (RCA), and implement preventative test coverage.", type: "verbal" },
      { text: "How do you mentor junior QA analysts in writing robust automation scripts rather than fragile UI recordings?", type: "verbal" },
    ],
  },
  "Systems Engineer (IT Support)": {
    intern: [
      { text: "What is an operating system and what are its primary responsibilities on a workstation or server?", type: "verbal" },
      { text: "Walk me through how you would assist an employee whose laptop suddenly cannot connect to the Wi-Fi network.", type: "verbal" },
      { text: "Write a simple command (in PowerShell or Bash) to display network configuration and IP addresses.", type: "code" },
      { text: "What is the difference between an IP address, a MAC address, and a DNS domain name?", type: "verbal" },
      { text: "What is the difference between RAM and permanent hard drive storage?", type: "verbal" },
      { text: "Write a command to check if a remote server or website is reachable via ping.", type: "code" },
      { text: "How would you troubleshoot a computer that powers on but displays a black screen or beep codes?", type: "verbal" },
      { text: "What is malware, phishing, and ransomware, and how do you protect workplace devices against them?", type: "verbal" },
      { text: "Write a script or command to list all running processes on a computer.", type: "code" },
      { text: "What is DHCP and how does a router dynamically assign IP addresses to connected devices?", type: "verbal" },
      { text: "What steps do you take when a user reports that their printer is not responding or printing blank pages?", type: "verbal" },
      { text: "Write a command to check available disk space on a drive in Windows or Linux.", type: "code" },
      { text: "What is Remote Desktop (RDP / SSH) and why is it essential for IT system administrators?", type: "verbal" },
      { text: "How do you communicate with a non-technical colleague who is frustrated by computer downtime?", type: "verbal" },
      { text: "What motivates you to pursue systems administration and technical support engineering?", type: "verbal" },
    ],
    junior: [
      { text: "What is the difference between TCP and UDP protocols? Give practical examples where each is preferred.", type: "verbal" },
      { text: "Write a PowerShell or Bash script to verify connectivity across a list of server hostnames and log failures.", type: "code" },
      { text: "How do you diagnose an application or server that is freezing due to 100% CPU or high memory consumption?", type: "verbal" },
      { text: "What is Active Directory (AD) and LDAP? Explain domain controllers, Group Policies (GPO), and organizational units.", type: "verbal" },
      { text: "Write a script to check if a specific Windows or Linux service is running, and restart it if stopped.", type: "code" },
      { text: "What is virtualization? Compare hardware Hypervisors (Type 1 vs Type 2) with containerization (Docker).", type: "verbal" },
      { text: "Explain RAID levels (RAID 0, 1, 5, 10): what are the trade-offs between performance, redundancy, and cost?", type: "verbal" },
      { text: "Write a command or script to find files larger than 500MB occupying space on a server.", type: "code" },
      { text: "How do VPNs work, and what is the difference between full-tunnel VPN and split-tunnel VPN?", type: "verbal" },
      { text: "What is SSL/TLS certificate renewal? How do you troubleshoot an expired certificate error?", type: "verbal" },
      { text: "Write a PowerShell script to create a new user account with temporary password and home directory.", type: "code" },
      { text: "What security measures do you implement to enforce Multi-Factor Authentication (MFA) across an organization?", type: "verbal" },
      { text: "How do you investigate Windows Event Viewer logs or Linux syslog when a server unexpectedly reboots?", type: "verbal" },
      { text: "Write a command to check open network listening ports and active sockets (e.g. netstat / ss).", type: "code" },
      { text: "Walk me through an incident where you resolved a tricky hardware, networking, or OS issue.", type: "verbal" },
    ],
    associate: [
      { text: "Walk through end-to-end incident response when a ransomware alert is triggered on an employee workstation.", type: "verbal" },
      { text: "Write a Bash or PowerShell script to compress and archive log files older than 30 days and upload to backup storage.", type: "code" },
      { text: "How do you design identity and access management (IAM) using Azure AD / Okta with conditional access policies?", type: "verbal" },
      { text: "Design high-availability backup and disaster recovery (RTO/RPO) for 500 remote laptops and on-prem servers.", type: "verbal" },
      { text: "Write an automated Ansible playbook or Terraform configuration to provision a secure baseline Linux server.", type: "code" },
      { text: "Explain zero-trust network architecture (ZTNA) and how it supersedes legacy perimeter VPNs.", type: "verbal" },
      { text: "How do you detect and mitigate DNS spoofing, Man-in-the-Middle (MITM), and internal network pivoting attacks?", type: "verbal" },
      { text: "Write a monitoring script or Prometheus alert definition to track disk IOPS and memory pressure.", type: "code" },
      { text: "What is your patch management strategy for operating systems and third-party software across hybrid enterprise fleets?", type: "verbal" },
      { text: "How do you optimize network routing, VLAN segmentation, and firewall rules in an office with VoIP and guest Wi-Fi?", type: "verbal" },
      { text: "Write a script to audit inactive user accounts not logged into the domain for over 90 days and disable them.", type: "code" },
      { text: "Explain the architecture of SAN (Storage Area Network) vs NAS (Network Attached Storage) in enterprise datacenters.", type: "verbal" },
      { text: "How do you manage SOC2 / ISO 27001 audit requirements regarding physical, hardware, and account access logs?", type: "verbal" },
      { text: "Describe a major production outage you participated in troubleshooting. How was communication handled?", type: "verbal" },
      { text: "How do you establish standard operating procedures (SOPs) and automate routine IT tasks for Tier 1 support?", type: "verbal" },
    ],
  },
  "Junior Data Analyst": {
    intern: [
      { text: "What is data analysis and what business problems can data solve?", type: "verbal" },
      { text: "Explain the difference between mean, median, and mode using a simple salary example.", type: "verbal" },
      { text: "Write a SQL query to count total rows in a 'customers' table where country is 'India'.", type: "code" },
      { text: "What data visualization tools or spreadsheet software (Excel, Google Sheets, Tableau) have you used?", type: "verbal" },
      { text: "What is the difference between quantitative data and qualitative data?", type: "verbal" },
      { text: "Write an Excel formula or SQL query to find the maximum and minimum sales values.", type: "code" },
      { text: "What is a primary key and foreign key in relational databases, and why are they needed?", type: "verbal" },
      { text: "Explain what a scatter plot is and what kind of relationship it reveals between two variables.", type: "verbal" },
      { text: "Write a SQL query to select distinct product categories from a 'products' table.", type: "code" },
      { text: "What is data cleaning and why does it take up most of a data analyst's working time?", type: "verbal" },
      { text: "What is the difference between a bar chart and a histogram?", type: "verbal" },
      { text: "Write a SQL query to find the average order value from an 'orders' table.", type: "code" },
      { text: "How do you verify whether your data has null values or duplicate records?", type: "verbal" },
      { text: "What Python libraries for data analysis (e.g. Pandas, NumPy, Matplotlib) have you practiced with?", type: "verbal" },
      { text: "Tell me about a data dataset or project you explored in college or online.", type: "verbal" },
    ],
    junior: [
      { text: "Write a SQL query using INNER JOIN and GROUP BY to calculate total revenue per product category.", type: "code" },
      { text: "How do you detect, handle, and impute missing or anomalous values in a dataset before modeling?", type: "verbal" },
      { text: "Explain standard deviation and variance: what does a high standard deviation tell you about sales data?", type: "verbal" },
      { text: "What is the difference between correlation and causation? Give a relatable business example.", type: "verbal" },
      { text: "Write a SQL query using CASE WHEN to categorize customer spending into 'Low', 'Medium', and 'High' tiers.", type: "code" },
      { text: "Explain the difference between supervised and unsupervised learning algorithms.", type: "verbal" },
      { text: "How do you design an effective business dashboard? What principles keep it readable and actionable?", type: "verbal" },
      { text: "Write a Pandas code snippet to filter a DataFrame for rows where revenue > 1000 and group by month.", type: "code" },
      { text: "What are SQL window functions like ROW_NUMBER() and RANK()? When would you use them?", type: "verbal" },
      { text: "What is A/B testing? Explain hypothesis formulation, control vs variant groups, and p-values.", type: "verbal" },
      { text: "Write a SQL query using HAVING clause to filter groups with total orders exceeding 50.", type: "code" },
      { text: "How do you handle outliers in skewed distributions? Do you remove them or transform the data?", type: "verbal" },
      { text: "Explain the difference between star schema and snowflake schema in data warehousing.", type: "verbal" },
      { text: "Write a Python script using Matplotlib or Seaborn to generate a trendline of monthly churn.", type: "code" },
      { text: "Walk me through an analytical finding or insight from your college project that surprised you.", type: "verbal" },
    ],
    associate: [
      { text: "Write an advanced SQL query to calculate Month-over-Month (MoM) revenue growth and 3-month rolling averages.", type: "code" },
      { text: "How would you design an end-to-end KPI framework and attribution model for an omnichannel e-commerce platform?", type: "verbal" },
      { text: "Explain how to calculate statistical significance and minimum sample size for an A/B test with low baseline conversions.", type: "verbal" },
      { text: "Compare batch ETL pipelines (dbt, Airflow) vs real-time streaming analytics (Kafka, Flink) for financial reporting.", type: "verbal" },
      { text: "Write a SQL query using recursive Common Table Expressions (CTEs) to traverse an organizational hierarchy.", type: "code" },
      { text: "How do you diagnose and correct for Simpson's Paradox or selection bias when analyzing aggregated cohort data?", type: "verbal" },
      { text: "What techniques do you use for dimensionality reduction and feature selection on high-dimensional datasets?", type: "verbal" },
      { text: "Write a Python function to compute customer Lifetime Value (LTV) and churn probabilities across cohorts.", type: "code" },
      { text: "How do you govern data quality, schema drift, and lineage across multiple departmental data marts?", type: "verbal" },
      { text: "Explain time-series forecasting methods: ARIMA vs Prophet vs XGBoost with seasonal lags.", type: "verbal" },
      { text: "Write an optimized SQL query that eliminates full table scans on a partitioned 100-million row table.", type: "code" },
      { text: "How do you communicate complex statistical models or counter-intuitive findings to non-technical executives?", type: "verbal" },
      { text: "Describe how you would set up automated anomaly detection alerts for business-critical metric drops.", type: "verbal" },
      { text: "Write code to perform sentiment analysis or NLP categorization on open-text customer feedback surveys.", type: "code" },
      { text: "Tell me about a data project where your analytical insights directly drove a strategic business decision.", type: "verbal" },
    ],
  },
  "Cloud & DevOps Associate": {
    intern: [
      { text: "What is cloud computing and why do modern organizations migrate away from physical on-premise servers?", type: "verbal" },
      { text: "What is Docker and what does containerization accomplish in simple terms?", type: "verbal" },
      { text: "Write a basic Dockerfile that uses node:20-alpine and runs 'npm start'.", type: "code" },
      { text: "What is CI/CD (Continuous Integration / Continuous Deployment) and why is automated testing essential?", type: "verbal" },
      { text: "What is the difference between public cloud, private cloud, and hybrid cloud architectures?", type: "verbal" },
      { text: "Write a simple Bash command to pull and run an nginx container locally with Docker.", type: "code" },
      { text: "What are AWS S3 and EC2? Explain object storage versus virtual compute instances.", type: "verbal" },
      { text: "What is Git and how does branch-based development fit into deployment pipelines?", type: "verbal" },
      { text: "Write a simple command to view real-time container logs using the Docker CLI.", type: "code" },
      { text: "What is a load balancer and why is it placed in front of web application servers?", type: "verbal" },
      { text: "What is DNS and how does domain name resolution direct web traffic to cloud IP addresses?", type: "verbal" },
      { text: "Write a basic GitHub Actions workflow file that checks out code and runs 'npm test'.", type: "code" },
      { text: "What are environment secrets and why must cloud credentials never be hardcoded into code repositories?", type: "verbal" },
      { text: "What cloud certifications or platforms (AWS, Azure, GCP) are you actively studying?", type: "verbal" },
      { text: "What inspired your passion for DevOps and cloud infrastructure automation?", type: "verbal" },
    ],
    junior: [
      { text: "What is Infrastructure as Code (IaC)? Compare Terraform with manual cloud console provisioning.", type: "verbal" },
      { text: "Write a multi-stage Dockerfile that builds a frontend Next.js/React app and serves it with minimal image size.", type: "code" },
      { text: "Explain AWS VPC (Virtual Private Cloud): what is the difference between public subnets, private subnets, and NAT Gateways?", type: "verbal" },
      { text: "What is Kubernetes? Explain key objects: Pods, Deployments, Services, and Ingress Controllers.", type: "verbal" },
      { text: "Write a basic Terraform configuration block to create an AWS S3 bucket with private access.", type: "code" },
      { text: "What is the difference between Blue/Green deployment and Canary deployment strategies?", type: "verbal" },
      { text: "How do you monitor cloud application performance? Explain metrics, logs, and distributed traces.", type: "verbal" },
      { text: "Write a GitHub Actions CI pipeline step that builds a Docker image and pushes it to Amazon ECR or Docker Hub.", type: "code" },
      { text: "What is an Auto Scaling Group and how do CPU/memory thresholds trigger instance scale-out or scale-in?", type: "verbal" },
      { text: "How do you handle secret rotation and secure injection into cloud containers using HashiCorp Vault or AWS Secrets Manager?", type: "verbal" },
      { text: "Write a Kubernetes Pod or Deployment YAML manifest with resource requests, limits, and liveness probes.", type: "code" },
      { text: "What is the role of reverse proxies like Nginx or Traefik in managing SSL termination and path routing?", type: "verbal" },
      { text: "How do you configure backup schedules and multi-region replication for managed cloud databases (like RDS)?", type: "verbal" },
      { text: "Write a script to check cloud bill cost drivers or identify unattached EBS volumes.", type: "code" },
      { text: "Walk me through a deployment pipeline or cloud setup you built for your college or personal projects.", type: "verbal" },
    ],
    associate: [
      { text: "Design a multi-region, active-active high-availability architecture on AWS/GCP with low latency global routing.", type: "verbal" },
      { text: "Write a Terraform module with variables, outputs, and remote state locking for provisioning an EKS/GKE cluster.", type: "code" },
      { text: "How do you architect a secure GitOps deployment pipeline using ArgoCD or Flux for production Kubernetes clusters?", type: "verbal" },
      { text: "Explain Service Mesh (Istio / Linkerd): mTLS encryption, traffic shaping, distributed tracing, and overhead trade-offs.", type: "verbal" },
      { text: "Write a Helm chart template or Kustomize overlay to manage multi-environment configuration differences.", type: "code" },
      { text: "How do you implement progressive delivery with automated canary analysis using Flagger or Argo Rollouts?", type: "verbal" },
      { text: "Describe your strategy for container vulnerability scanning (Trivy, Snyk) and policy enforcement (OPA Gatekeeper) in CI/CD.", type: "verbal" },
      { text: "Write Prometheus alerting rules (PromQL) for detecting high error rates (HTTP 5xx) and SLO breaches.", type: "code" },
      { text: "How do you design disaster recovery for Kubernetes workloads with stateful storage and DNS failover?", type: "verbal" },
      { text: "Explain cloud FinOps: how do you analyze, allocate, and systematically reduce cloud infrastructure spend by 30%?", type: "verbal" },
      { text: "Write a resilient Bash script that handles graceful pod shutdown signals (SIGTERM) and connection draining.", type: "code" },
      { text: "How do you manage zero-trust network policies and IAM least privilege across cross-account AWS organizations?", type: "verbal" },
      { text: "Describe how you investigate and resolve a catastrophic CI/CD runner deadlock or broken deployment in production.", type: "verbal" },
      { text: "Explain chaos engineering principles and how you use tools like Chaos Mesh to test system resilience.", type: "verbal" },
      { text: "How do you foster a DevOps culture of blameless post-mortems and high deployment frequency across engineering squads?", type: "verbal" },
    ],
  },
};

const defaultQuestions = questionsByRoleAndLevel["Graduate Software Engineer"].junior;

/** Curated general fallback bank to ensure sessions always reach requested limit cleanly */
const generalFallbackQuestions: InterviewQuestion[] = [
  { text: "Walk me through how you approach breaking down a complex problem when requirements are unclear.", type: "verbal" },
  { text: "Write a function to check whether two strings are anagrams of each other.", type: "code" },
  { text: "What is technical debt, and how should an engineering team balance refactoring with new feature delivery?", type: "verbal" },
  { text: "Explain how you handle edge cases when designing an API endpoint or user input form.", type: "verbal" },
  { text: "Write a code snippet to implement a binary search algorithm on a sorted array.", type: "code" },
  { text: "How do you conduct code reviews? What specific aspects do you look for before approving a pull request?", type: "verbal" },
  { text: "Describe a project where you had to quickly learn an unfamiliar technology stack. What was your method?", type: "verbal" },
  { text: "Write a SQL query or code snippet to detect duplicate rows in a database table.", type: "code" },
  { text: "What is your testing strategy before deploying code to staging or production environments?", type: "verbal" },
  { text: "Where do you envision your engineering career developing over the next two years?", type: "verbal" },
];

export function getCoreQuestions(role: string, level?: string): InterviewQuestion[] {
  const difficulty = normalizeDifficulty(level);
  const roleBank = questionsByRoleAndLevel[role];
  if (!roleBank) return defaultQuestions;
  return roleBank[difficulty] ?? roleBank.junior;
}

function truncate(text: string, max = 120): string {
  return text.length <= max ? text : `${text.slice(0, max).trim()}…`;
}

/**
 * Builds questions specifically probing candidate resume entries:
 * - Focuses intensely on the Final Year Project, technologies, and individual contribution
 * - Probes internships, hands-on skills, and certifications
 */
export function buildResumeQuestions(data?: ResumeExtractedData | null, targetCount = 2): InterviewQuestion[] {
  if (!data) return [];

  const questions: InterviewQuestion[] = [];

  // 1. Final Year Project / Primary Project
  if (data.projects?.length) {
    const primaryProject = truncate(data.projects[0]);
    questions.push({
      text: `Your resume highlights your project "${primaryProject}". Walk me through your specific individual contribution, the architecture you designed, and the biggest technical hurdle you had to solve.`,
      type: "verbal",
      source: "resume",
    });

    if (data.projects.length > 1 && questions.length < targetCount) {
      const secondProject = truncate(data.projects[1]);
      questions.push({
        text: `Regarding your project "${secondProject}", what core technologies did you choose and why were they better suited than alternative options?`,
        type: "verbal",
        source: "resume",
      });
    }
  }

  // 2. Internship experience
  if (data.internships?.length && questions.length < targetCount) {
    const internship = truncate(data.internships[0]);
    questions.push({
      text: `Tell me about your internship experience at ${internship}. What deliverables did you ship, and what industry best practices did you take away?`,
      type: "verbal",
      source: "resume",
    });
  }

  // 3. Technical Skills Verification
  if (data.skills?.length && questions.length < targetCount) {
    const skillsList = data.skills.slice(0, 3).join(", ");
    questions.push({
      text: `Your resume lists proficiency in ${skillsList}. Pick one of these tools and explain an actual, hands-on problem you solved using it.`,
      type: "verbal",
      source: "resume",
    });
  }

  // 4. Certifications or coursework
  if (data.certifications?.length && questions.length < targetCount) {
    questions.push({
      text: `You have completed certification or coursework in ${truncate(data.certifications[0], 80)}. How did that training translate into your practical projects?`,
      type: "verbal",
      source: "resume",
    });
  }

  return questions.slice(0, targetCount);
}

/**
 * Combines core domain questions with mandatory resume questions,
 * guaranteeing EXACTLY questionLimit (5, 10, or 15) unique questions.
 */
export function buildInterviewQuestions(
  role: string,
  level?: string,
  resumeData?: ResumeExtractedData | null,
  resumeContextEnabled = false,
  generatedResumeQuestions?: InterviewQuestion[] | null,
  questionLimit = 5
): InterviewQuestion[] {
  const safeLimit = [5, 10, 15].includes(questionLimit) ? questionLimit : 5;

  // Determine how many resume questions to blend in based on total question count
  const resumeTarget = safeLimit === 15 ? 4 : safeLimit === 10 ? 3 : 2;

  let resumeQs: InterviewQuestion[] = [];
  if (resumeContextEnabled) {
    if (generatedResumeQuestions?.length) {
      resumeQs = generatedResumeQuestions.slice(0, resumeTarget).map((q) => ({
        ...q,
        type: q.type ?? "verbal",
        source: "resume" as const,
      }));
    } else {
      resumeQs = buildResumeQuestions(resumeData, resumeTarget);
    }
  }

  const coreList = getCoreQuestions(role, level).map((q) => ({
    ...q,
    source: q.source ?? ("core" as const),
  }));

  // Interleave resume questions into the interview flow naturally:
  // Q1: Core icebreaker / opening
  // Q2: Resume question (e.g. final year project)
  // Q3, Q4: Core technical questions
  // Q5: Resume question (e.g. internship / skills)
  // Subsequent questions: Core + remaining resume
  const blended: InterviewQuestion[] = [];
  const seenTexts = new Set<string>();

  const addUnique = (q: InterviewQuestion) => {
    const key = q.text.trim().toLowerCase();
    if (!seenTexts.has(key)) {
      seenTexts.add(key);
      blended.push(q);
    }
  };

  let coreIdx = 0;
  let resumeIdx = 0;

  // Slot 1: Core opening question
  if (coreIdx < coreList.length) {
    addUnique(coreList[coreIdx++]);
  }

  // Slot 2: Resume Question 1 (e.g. Final Year Project)
  if (resumeIdx < resumeQs.length) {
    addUnique(resumeQs[resumeIdx++]);
  }

  // Next batch of core questions
  while (blended.length < safeLimit) {
    // Insert resume question periodically if available
    if (
      resumeIdx < resumeQs.length &&
      (blended.length === 4 || blended.length === 8 || blended.length === 12)
    ) {
      addUnique(resumeQs[resumeIdx++]);
      continue;
    }

    if (coreIdx < coreList.length) {
      addUnique(coreList[coreIdx++]);
    } else {
      break;
    }
  }

  // Add any remaining resume questions if we still have room
  while (blended.length < safeLimit && resumeIdx < resumeQs.length) {
    addUnique(resumeQs[resumeIdx++]);
  }

  // Fill up from fallback pool if still under limit
  let fallbackIdx = 0;
  while (blended.length < safeLimit && fallbackIdx < generalFallbackQuestions.length) {
    addUnique(generalFallbackQuestions[fallbackIdx++]);
  }

  return blended.slice(0, safeLimit);
}

export const defaultFresherQuestions = defaultQuestions;

/** @deprecated Use buildInterviewQuestions instead */
export function getQuestionsForRole(role: string): InterviewQuestion[] {
  return getCoreQuestions(role, "junior");
}
