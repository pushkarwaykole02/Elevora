import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { sendEmail } from './utils/mailer';

dotenv.config();

const app = express();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 5000;
const MAX_RESUMES_PER_USER = 2;

/** Map interview feedback category names to dashboard/analytics skill keys */
function normalizeSkillCategoryName(name: string): string | null {
  const aliases: Record<string, string> = {
    Communication: 'Communication',
    'Technical Depth': 'Technical Depth',
    'Technical Fundamentals': 'Technical Depth',
    'Leadership Presence': 'Leadership Presence',
    'Problem Solving': 'Leadership Presence',
    'Clarity Under Fire': 'Clarity Under Fire',
    'Clarity Under Pressure': 'Clarity Under Fire',
  };
  return aliases[name] ?? null;
}

function accumulateSkillScores(
  sessions: Array<{ feedbackJson: unknown }>,
  sums: Record<string, number>,
  counts: Record<string, number>
) {
  sessions.forEach((s) => {
    if (s.feedbackJson && typeof s.feedbackJson === 'object') {
      const feedback = s.feedbackJson as { categories?: Array<{ name: string; score?: number }> };
      if (Array.isArray(feedback.categories)) {
        feedback.categories.forEach((cat) => {
          const mappedName = normalizeSkillCategoryName(cat.name);
          if (mappedName && mappedName in sums) {
            sums[mappedName] += cat.score || 0;
            counts[mappedName]++;
          }
        });
      }
    }
  });
}

function buildSkillAverages(
  sums: Record<string, number>,
  counts: Record<string, number>
) {
  return [
    { name: 'Communication', score: counts.Communication > 0 ? Math.round(sums.Communication / counts.Communication) : 0, color: 'var(--color-primary)' },
    { name: 'Technical Depth', score: counts['Technical Depth'] > 0 ? Math.round(sums['Technical Depth'] / counts['Technical Depth']) : 0, color: 'var(--color-secondary)' },
    { name: 'Leadership Presence', score: counts['Leadership Presence'] > 0 ? Math.round(sums['Leadership Presence'] / counts['Leadership Presence']) : 0, color: 'var(--color-tertiary)' },
    { name: 'Clarity Under Fire', score: counts['Clarity Under Fire'] > 0 ? Math.round(sums['Clarity Under Fire'] / counts['Clarity Under Fire']) : 0, color: 'var(--color-primary-fixed)' },
  ];
}

const SKILL_KEYS = ['Communication', 'Technical Depth', 'Leadership Presence', 'Clarity Under Fire'] as const;

function emptySkillSums() {
  return Object.fromEntries(SKILL_KEYS.map((k) => [k, 0])) as Record<(typeof SKILL_KEYS)[number], number>;
}

/** Normalize category display names in stored feedback for consistent UI */
function normalizeFeedbackCategories(feedbackJson: Record<string, unknown>) {
  if (!Array.isArray(feedbackJson.categories)) return feedbackJson;
  const displayNames: Record<string, string> = {
    'Technical Fundamentals': 'Technical Depth',
    'Problem Solving': 'Leadership Presence',
    'Clarity Under Pressure': 'Clarity Under Fire',
  };
  return {
    ...feedbackJson,
    categories: (feedbackJson.categories as Array<{ name: string; score?: number; color?: string; notes?: string }>).map(
      (cat) => ({
        ...cat,
        name: displayNames[cat.name] || cat.name,
      })
    ),
  };
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Elevora Main Backend is running!' });
});

// Example: Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Sync user from NextAuth.js (Google/GitHub oauth login)
app.post('/api/auth/sync-user', async (req, res) => {
  const { id, email, name, avatarUrl } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        avatarUrl: avatarUrl || null,
      },
      create: {
        id: id || undefined,
        email,
        name,
        avatarUrl: avatarUrl || null,
      },
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user database record' });
  }
});

// Register a new user locally (Email/Password)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user locally (Email/Password)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Request Password Reset
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, don't reveal that user doesn't exist, just say email was sent
      return res.json({ success: true, message: 'Password reset link sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Store new token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Generate reset URL
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    console.log(`\n======================================================`);
    console.log(`PASSWORD RESET REQUESTED FOR: ${email}`);
    console.log(`RESET URL: ${resetUrl}`);
    console.log(`======================================================\n`);

    // Send reset link via email
    await sendEmail({
      to: email,
      subject: 'Reset Your Password - Elevora',
      text: `Hello,\n\nYou requested a password reset for your Elevora account. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this reset, please ignore this email.\n\nBest regards,\nElevora Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937;">
          <h2 style="color: #0d9488; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 0;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your Elevora account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;"><a href="${resetUrl}">${resetUrl}</a></p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
          <p style="margin-bottom: 0;">Best regards,<br/><strong>Elevora Team</strong></p>
        </div>
      `
    }).catch(err => console.error('Error sending forgot password email:', err));

    res.json({ success: true, message: 'Password reset link sent' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// Reset Password with token
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete token after successful use
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error in reset-password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET /api/users/:userId/dashboard
app.get('/api/users/:userId/dashboard', async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all sessions for this user
    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
    const totalSessions = sessions.length;

    // Calculate average score
    let avgScore = 0;
    if (completedSessions.length > 0) {
      const sum = completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0);
      avgScore = Math.round(sum / completedSessions.length);
    }

    // Calculate total hours
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1).replace(/\.0$/, ''); // e.g. 1.5 or 2 instead of 2.0

    // Calculate skills averages across completed sessions
    const skillSums = emptySkillSums();
    const skillCounts = emptySkillSums();
    accumulateSkillScores(completedSessions, skillSums, skillCounts);
    const skills = buildSkillAverages(skillSums, skillCounts);

    // Format recent sessions list
    // APEX -> Apex Systems
    // NOVA -> NovaTech
    // ORACLE -> Oracle Partners
    const personaToCompany: Record<string, string> = {
      'APEX': 'Apex Systems',
      'NOVA': 'NovaTech',
      'ORACLE': 'Oracle Partners'
    };

    const recentSessions = sessions.slice(0, 4).map(s => {
      let company = 'Elevora Labs';
      let persona = 'APEX';
      if (s.feedbackJson && typeof s.feedbackJson === 'object') {
        const feedback = s.feedbackJson as any;
        if (feedback.persona) {
          persona = feedback.persona.toUpperCase();
          company = personaToCompany[persona] || `${feedback.persona} Corp`;
        }
      }
      
      const date = new Date(s.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      return {
        id: s.id,
        role: s.domain,
        company,
        persona,
        score: s.overallScore || 0,
        status: s.status,
        date
      };
    });

    res.json({
      stats: {
        sessions: totalSessions,
        avgScore: `${avgScore}%`,
        skills,
        hours: `${totalHours}h`
      },
      recentSessions
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Helper: Extract baseline resume info via regex and dictionary (instant & offline safe)
function extractLocalResumeData(text: string) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].trim() : "";

  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,13}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  let name = "";
  for (const line of lines.slice(0, 6)) {
    const firstPart = line.split(/[|+—•\t\d]/)[0].trim();
    const words = firstPart.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && !/resume|cv|curriculum|profile|summary|contact|engineer|developer|education|experience|skills/i.test(firstPart)) {
      name = firstPart;
      break;
    }
  }

  const knownSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'PHP',
    'HTML', 'CSS', 'React', 'React.js', 'Next.js', 'Node.js', 'Express', 'Express.js',
    'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Vite', 'Redux', 'MongoDB',
    'PostgreSQL', 'MySQL', 'SQL', 'SQLite', 'Redis', 'Firebase', 'Supabase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'REST APIs',
    'GraphQL', 'Linux', 'Figma', 'Jest', 'Postman', 'XAMPP'
  ];

  const foundSkills = new Set<string>();
  for (const skill of knownSkills) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  }

  return {
    name,
    email,
    phone,
    skills: Array.from(foundSkills),
    projects: [] as string[],
    education: [] as string[],
    internships: [] as string[],
    certifications: [] as string[]
  };
}

// Helper: Parse buffer (PDF) and enrich with Gemini AI + local regex fallback
async function analyzeResumeBuffer(buffer: Buffer, filename: string, size?: string) {
  let extractedText = "";
  if (filename.toLowerCase().endsWith('.pdf')) {
    try {
      const pdfParseModule = require('pdf-parse');
      if (pdfParseModule.PDFParse) {
        const parser = new pdfParseModule.PDFParse({ data: buffer });
        if (typeof parser.load === 'function') await parser.load();
        const textResult = await parser.getText({ parseHyperlinks: true });
        extractedText = textResult?.text || "";
        if (typeof parser.destroy === 'function') parser.destroy();
      } else if (typeof pdfParseModule === 'function') {
        const pdfData = await pdfParseModule(buffer);
        extractedText = pdfData?.text || "";
      }
    } catch (pdfError) {
      console.error('Error parsing PDF content:', pdfError);
      extractedText = "";
    }
  }

  const localExtracted = extractLocalResumeData(extractedText);

  let parsedData: any = {
    atsScore: 75,
    keywordDensity: "Good",
    actionVerbs: 12,
    strengths: [
      "Clearly lists educational credentials.",
      "Structured layout with distinguishable headings.",
      "Contains relevant entry-level technical skills."
    ],
    missingSections: [
      "GitHub Link",
      "LinkedIn Link"
    ],
    suggestions: [
      "Include more quantifiable achievements with metrics (e.g. % improvement).",
      "List your technical skills clearly in a dedicated section.",
      "Ensure your resume matches standard single-column ATS-friendly layouts."
    ],
    extractedData: localExtracted,
    size: size || "100 KB"
  };

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey && extractedText.trim().length > 30) {
    const prompt = `
You are an expert Applicant Tracking System (ATS) resume scanner and career coach, specifically focused on evaluating college students and freshers.
Analyze the following resume text and provide a rigorous, honest, yet constructive evaluation.

Evaluation Guidelines:
1. Note: The target audience consists of college students and freshers. Do NOT tell them to remove SSC (10th) or HSC (12th) school details or marks, as these are standard and required academic credentials for entry-level placements in their region (e.g. India).
2. Do NOT penalize the user for having little or no formal work experience. Instead, focus the evaluation on their projects, internships, technical skills, certifications, academic achievements, and extracurricular/volunteer activities. Give these sections higher relative importance.
3. Evaluate the resume's ATS compatibility, formatting, readability, keyword optimization, and overall layout quality.
4. Suggest missing resume sections only if they are genuinely important and missing from the text (such as Projects, Skills, Certifications, Contact details, or links to GitHub/LinkedIn profiles). Keep suggestions concise, actionable, and under 100 characters each.

You MUST respond with a raw JSON object matching the following structure (do not wrap it in markdown code blocks, return ONLY the raw JSON):
{
  "atsScore": number (an integer between 0 and 100 representing formatting, readability, and content quality),
  "keywordDensity": "Fair" | "Good" | "Excellent" (rating based on professional skills match),
  "actionVerbs": number (the exact count of active, powerful verbs like designed, optimized, spearheaded),
  "strengths": [
    string (strength 1, max 100 characters),
    string (strength 2, max 100 characters),
    string (strength 3, max 100 characters)
  ],
  "missingSections": [
    string (missing section or link, e.g. "LinkedIn Profile", "Projects Section", "Certifications")
  ],
  "suggestions": [
    string (specific feedback item 1, max 100 characters),
    string (specific feedback item 2, max 100 characters),
    string (specific feedback item 3, max 100 characters)
  ],
  "extractedData": {
    "name": string (the candidate's full name, or empty string if not found),
    "email": string (the candidate's email, or empty string if not found),
    "phone": string (the candidate's phone number, or empty string if not found),
    "skills": [string] (list of key technical skills identified),
    "projects": [string] (list of project titles identified),
    "education": [string] (list of schools/degrees, e.g. "B.Tech in Computer Science at XYZ University"),
    "internships": [string] (list of internship titles/companies identified),
    "certifications": [string] (list of certifications/courses identified)
  }
}

Resume text:
${extractedText.substring(0, 10000)}
`;

    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    for (const model of candidateModels) {
      try {
        console.log(`Calling Gemini (${model}) for resume analysis (${filename})...`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
          signal: AbortSignal.timeout(12000),
        });

        if (response.ok) {
          const resJson: any = await response.json();
          const aiResponseText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiResponseText) {
            const aiData = JSON.parse(aiResponseText.trim());
            const rawExt = aiData.extractedData || {};

            const mergedExtractedData = {
              name: (typeof rawExt.name === 'string' && rawExt.name.trim()) ? rawExt.name.trim() : localExtracted.name,
              email: (typeof rawExt.email === 'string' && rawExt.email.trim()) ? rawExt.email.trim() : localExtracted.email,
              phone: (typeof rawExt.phone === 'string' && rawExt.phone.trim()) ? rawExt.phone.trim() : localExtracted.phone,
              skills: Array.isArray(rawExt.skills) && rawExt.skills.length > 0 ? rawExt.skills : localExtracted.skills,
              projects: Array.isArray(rawExt.projects) ? rawExt.projects : [],
              education: Array.isArray(rawExt.education) ? rawExt.education : [],
              internships: Array.isArray(rawExt.internships) ? rawExt.internships : [],
              certifications: Array.isArray(rawExt.certifications) ? rawExt.certifications : []
            };

            parsedData = {
              atsScore: typeof aiData.atsScore === 'number' ? aiData.atsScore : 75,
              keywordDensity: ['Fair', 'Good', 'Excellent'].includes(aiData.keywordDensity) ? aiData.keywordDensity : 'Good',
              actionVerbs: typeof aiData.actionVerbs === 'number' ? aiData.actionVerbs : 15,
              strengths: Array.isArray(aiData.strengths) ? aiData.strengths.slice(0, 5) : parsedData.strengths,
              missingSections: Array.isArray(aiData.missingSections) ? aiData.missingSections : parsedData.missingSections,
              suggestions: Array.isArray(aiData.suggestions) ? aiData.suggestions.slice(0, 5) : parsedData.suggestions,
              extractedData: mergedExtractedData,
              size: size || "100 KB"
            };
            break;
          }
        } else {
          console.warn(`Gemini (${model}) failed with status ${response.status}`);
        }
      } catch (geminiErr) {
        console.warn(`Error or timeout with Gemini (${model}):`, geminiErr);
      }
    }
  }

  return parsedData;
}

// GET /api/users/:userId/resumes
app.get('/api/users/:userId/resumes', async (req, res) => {
  const { userId } = req.params;
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' }
    });

    // Auto-heal any resume whose extractedData is missing or empty
    for (let i = 0; i < resumes.length; i++) {
      const r = resumes[i];
      const pd: any = r.parsedData || {};
      const ext = pd.extractedData;
      const needsHeal = !ext || (!ext.name && (!ext.skills || ext.skills.length === 0));
      if (needsHeal && r.fileUrl) {
        try {
          const filePath = path.join(__dirname, '..', r.fileUrl);
          if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            const healedParsedData = await analyzeResumeBuffer(buffer, r.fileUrl, pd.size);
            const updated = await prisma.resume.update({
              where: { id: r.id },
              data: { parsedData: healedParsedData as any }
            });
            resumes[i] = updated;
          }
        } catch (healErr) {
          console.error(`Failed to auto-heal resume ${r.id}:`, healErr);
        }
      }
    }

    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// POST /api/users/:userId/resumes/:resumeId/reanalyze (manually re-analyze a resume)
app.post('/api/users/:userId/resumes/:resumeId/reanalyze', async (req, res) => {
  const { userId, resumeId } = req.params;
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const filePath = path.join(__dirname, '..', resume.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Resume file not found on server' });
    }

    const buffer = fs.readFileSync(filePath);
    const existingParsed: any = resume.parsedData || {};
    const updatedParsedData = await analyzeResumeBuffer(buffer, resume.fileUrl, existingParsed.size);

    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: { parsedData: updatedParsedData as any }
    });

    res.json({ success: true, resume: updatedResume });
  } catch (error) {
    console.error('Error re-analyzing resume:', error);
    res.status(500).json({ error: 'Failed to re-analyze resume' });
  }
});

// POST /api/users/:userId/resumes (upload resume)
app.post('/api/users/:userId/resumes', async (req, res) => {
  const { userId } = req.params;
  const { name, dataUrl, size } = req.body;

  if (!name || !dataUrl) {
    return res.status(400).json({ error: 'Name and dataUrl are required' });
  }

  try {
    const existingCount = await prisma.resume.count({ where: { userId } });
    if (existingCount >= MAX_RESUMES_PER_USER) {
      return res.status(400).json({
        error: `Maximum of ${MAX_RESUMES_PER_USER} resumes allowed. Delete one to upload a new resume.`,
      });
    }

    // 1. Create uploads directory if not exists
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Decode base64 and write file to disk
    const uniqueName = `${Date.now()}_${name}`;
    const filePath = path.join(uploadDir, uniqueName);
    const base64Data = dataUrl.split(';base64,').pop();
    
    if (!base64Data) {
      return res.status(400).json({ error: 'Invalid file data' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    // 3. Analyze resume with robust extractor & AI
    const parsedData = await analyzeResumeBuffer(buffer, name, size);

    // 4. Set other resumes of this user to inactive if this will be active
    const resumeCount = await prisma.resume.count({ where: { userId } });
    const isActive = resumeCount === 0; // First resume uploaded is active by default

    if (isActive) {
      await prisma.resume.updateMany({
        where: { userId },
        data: { isActive: false }
      });
    }

    // 5. Create database record
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileUrl: `/uploads/${uniqueName}`,
        isActive,
        parsedData: parsedData as any
      }
    });

    res.status(201).json({ success: true, resume });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// PUT /api/users/:userId/resumes/:resumeId/active (set active)
app.put('/api/users/:userId/resumes/:resumeId/active', async (req, res) => {
  const { userId, resumeId } = req.params;

  try {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    await prisma.resume.updateMany({
      where: { userId },
      data: { isActive: false }
    });

    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: { isActive: true }
    });

    res.json({ success: true, resume: updatedResume });
  } catch (error) {
    console.error('Error activating resume:', error);
    res.status(500).json({ error: 'Failed to activate resume' });
  }
});

// DELETE /api/users/:userId/resumes/:resumeId
app.delete('/api/users/:userId/resumes/:resumeId', async (req, res) => {
  const { userId, resumeId } = req.params;

  try {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete file
    const filename = resume.fileUrl.replace('/uploads/', '');
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record
    await prisma.resume.delete({
      where: { id: resumeId }
    });

    // If it was the active one, mark the most recent remaining resume as active
    if (resume.isActive) {
      const remaining = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { uploadedAt: 'desc' }
      });
      if (remaining) {
        await prisma.resume.update({
          where: { id: remaining.id },
          data: { isActive: true }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Generate personalized resume-based interview questions via Gemini
async function generateResumeInterviewQuestions(
  domain: string,
  level: string,
  extractedData: Record<string, unknown> | null,
  targetCount = 2
): Promise<Array<{ text: string; type: string; source: string }>> {
  if (!extractedData) return [];

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const hasContent =
    (Array.isArray(extractedData.projects) && extractedData.projects.length > 0) ||
    (Array.isArray(extractedData.internships) && extractedData.internships.length > 0) ||
    (Array.isArray(extractedData.skills) && extractedData.skills.length > 0) ||
    (Array.isArray(extractedData.education) && extractedData.education.length > 0) ||
    (Array.isArray(extractedData.certifications) && extractedData.certifications.length > 0);

  if (!geminiApiKey || !hasContent) return [];

  const levelGuide: Record<string, string> = {
    intern: 'basic and exploratory — focus on learning, academic work, and motivation',
    junior: 'fundamentals-focused — probe understanding of projects, final year work, and skills claimed',
    associate: 'deeper and scenario-based — ask about architecture, trade-offs, and challenges faced',
  };
  const difficultyGuide = levelGuide[level.toLowerCase()] || levelGuide.junior;

  const prompt = `
You are an expert technical interviewer preparing personalized questions for a candidate interviewing for "${domain}" at "${level}" difficulty.

Generate exactly ${targetCount} unique verbal interview questions based ONLY on the candidate's resume data below.
ANTI-REPETITION & DIVERSITY GUIDELINES:
1. Ensure questions are fresh, non-repetitive, and varied.
2. If multiple projects are listed, probe different projects (e.g. project #2 or #3, not always project #1).
3. If multiple skills or technologies are listed, ask about different specific tools, databases, or frameworks.
4. Explore distinct technical angles: architectural design choices, challenging bugs, security considerations, and production deployment trade-offs.
5. Match ${level} difficulty: ${difficultyGuide}.
6. Be answerable verbally in 2–3 minutes each.
7. NOT ask them to write code (type must always be "verbal").

Resume data:
- Name: ${extractedData.name || 'Not provided'}
- Skills: ${JSON.stringify(extractedData.skills || [])}
- Projects (including Final Year Project): ${JSON.stringify(extractedData.projects || [])}
- Internships: ${JSON.stringify(extractedData.internships || [])}
- Education: ${JSON.stringify(extractedData.education || [])}
- Certifications: ${JSON.stringify(extractedData.certifications || [])}

Respond with ONLY raw JSON (no markdown):
{
  "questions": [
    { "text": "string — question sentence", "type": "verbal" }
  ]
}`;

  const candidateModels = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.8-flash'];
  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.85,
            },
          }),
          signal: AbortSignal.timeout(12000),
        }
      );

      if (!response.ok) {
        console.warn(`Gemini resume-questions error from model ${model}: ${response.status}`);
        continue;
      }

      const resJson: any = await response.json();
      const aiText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) continue;

      const parsed = JSON.parse(aiText.trim());
      if (!Array.isArray(parsed.questions)) continue;

      const questions = parsed.questions
        .filter((q: any) => typeof q.text === 'string' && q.text.trim().length > 10)
        .slice(0, targetCount)
        .map((q: any) => ({
          text: q.text.trim(),
          type: 'verbal',
          source: 'resume',
        }));

      if (questions.length > 0) {
        return questions;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed for resume questions:`, err?.message || err);
    }
  }

  return [];
}

function truncateResumeText(text: string, max = 120): string {
  return text.length <= max ? text : `${text.slice(0, max).trim()}…`;
}

/** Template fallback when Gemini is unavailable or returns nothing (randomized) */
function buildTemplateResumeQuestions(
  extractedData: Record<string, unknown> | null,
  maxCount = 2
): Array<{ text: string; type: string; source: string }> {
  if (!extractedData) return [];

  const rawProjects = Array.isArray(extractedData.projects) ? (extractedData.projects as string[]) : [];
  const rawInternships = Array.isArray(extractedData.internships) ? (extractedData.internships as string[]) : [];
  const rawSkills = Array.isArray(extractedData.skills) ? (extractedData.skills as string[]) : [];
  const rawCerts = Array.isArray(extractedData.certifications) ? (extractedData.certifications as string[]) : [];

  const shuffle = <T>(arr: T[]): T[] => {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };

  const projects = rawProjects.filter((p) => p && p.trim());
  const questions: Array<{ text: string; type: string; source: string }> = [];

  if (projects.length > 0) {
    questions.push({
      text: `I see on your resume you worked on "${truncateResumeText(projects[0])}". Walk me through your specific contribution, system architecture, and the biggest technical challenge you solved.`,
      type: 'verbal',
      source: 'resume',
    });
    if (projects.length > 1) {
      const otherProject = shuffle(projects.slice(1))[0];
      questions.push({
        text: `Tell me about your project "${truncateResumeText(otherProject)}". What technologies did you choose and why were they better suited than alternatives?`,
        type: 'verbal',
        source: 'resume',
      });
    }
  }

  if (rawInternships.length > 0) {
    const internship = shuffle(rawInternships)[0];
    questions.push({
      text: `Tell me about your experience at ${truncateResumeText(internship)}. What deliverables did you ship, and what industry best practices did you take away?`,
      type: 'verbal',
      source: 'resume',
    });
  }

  if (rawSkills.length > 0) {
    const sampledSkills = shuffle(rawSkills).slice(0, Math.min(3, rawSkills.length)).join(', ');
    questions.push({
      text: `Your resume highlights proficiency in ${sampledSkills}. Pick one and explain how you used it in a real project.`,
      type: 'verbal',
      source: 'resume',
    });
  }

  if (rawCerts.length > 0) {
    const cert = shuffle(rawCerts)[0];
    questions.push({
      text: `You hold a certification in ${truncateResumeText(cert, 80)}. How has this knowledge helped you in practical projects?`,
      type: 'verbal',
      source: 'resume',
    });
  }

  if (questions.length <= maxCount) return questions;
  const [first, ...rest] = questions;
  return [first, ...shuffle(rest)].slice(0, maxCount);
}

// POST /api/sessions (start session - resume is mandatory)
app.post('/api/sessions', async (req, res) => {
  const { userId, domain, level, persona, questionCount } = req.body;

  if (!userId || !domain || !level) {
    return res.status(400).json({ error: 'userId, domain, and level are required' });
  }

  const parsedQuestionCount = [5, 10, 15].includes(Number(questionCount))
    ? Number(questionCount)
    : 5;

  const calculatedDuration = parsedQuestionCount === 5 ? 15 : parsedQuestionCount === 10 ? 30 : 45;

  try {
    // 1. Mandatory Resume Requirement
    const activeResume = await prisma.resume.findFirst({
      where: { userId, isActive: true },
    });

    if (!activeResume) {
      return res.status(400).json({
        error: 'An active resume is required to start an interview. Please upload or activate your resume in Resume Manager.',
      });
    }

    let resumeSnapshot = null;
    let resumeQuestions: Array<{ text: string; type: string; source: string }> = [];

    if (activeResume.parsedData && typeof activeResume.parsedData === 'object') {
      const parsed = activeResume.parsedData as any;
      const extractedData = parsed.extractedData ?? null;
      const resumeFileName = path.basename(activeResume.fileUrl).replace(/^\d+_/, '') || 'Resume.pdf';
      resumeSnapshot = {
        resumeId: activeResume.id,
        filename: resumeFileName,
        fileUrl: activeResume.fileUrl,
        extractedData,
        skills: extractedData?.skills ?? [],
        projects: extractedData?.projects ?? [],
      };

      const requestedResumeQuestionsCount = parsedQuestionCount === 15 ? 4 : parsedQuestionCount === 10 ? 3 : 2;
      resumeQuestions = await generateResumeInterviewQuestions(
        domain,
        level,
        extractedData,
        requestedResumeQuestionsCount
      );

      let resumeQuestionsSource: string | null = null;
      if (resumeQuestions.length > 0) {
        resumeQuestionsSource = 'gemini';
        console.log(`Generated ${resumeQuestions.length} Gemini resume question(s) for session`);
      } else {
        resumeQuestions = buildTemplateResumeQuestions(extractedData, requestedResumeQuestionsCount);
        if (resumeQuestions.length > 0) {
          resumeQuestionsSource = 'template';
          console.log(`Using ${resumeQuestions.length} template resume question(s) for session`);
        }
      }

      const sessionFeedbackJson = {
        persona: persona || 'APEX',
        resumeContext: true,
        questionCount: parsedQuestionCount,
        resumeSnapshot,
        resumeQuestions,
        resumeQuestionsSource,
      };

      const session = await prisma.interviewSession.create({
        data: {
          userId,
          domain,
          level,
          status: 'IN_PROGRESS',
          duration: calculatedDuration,
          feedbackJson: sessionFeedbackJson as Prisma.InputJsonValue,
        },
      });

      res.status(201).json({
        success: true,
        sessionId: session.id,
        questionCount: parsedQuestionCount,
        duration: calculatedDuration,
      });
      return;
    }

    return res.status(400).json({
      error: 'Active resume does not have parsed content. Please re-upload your resume PDF in Resume Manager.',
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start interview session' });
  }
});

const CANDIDATE_GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.8-flash'];

async function callGeminiWithFallback(
  apiKey: string,
  prompt: string,
  timeoutMs = 15000
): Promise<{ overallScore: number; feedbackJson: any } | null> {
  for (const model of CANDIDATE_GEMINI_MODELS) {
    try {
      console.log(`[Gemini Eval] Attempting model: ${model}...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(timeoutMs),
        }
      );

      if (response.ok) {
        const resJson: any = await response.json();
        const aiResponseText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiResponseText) {
          const parsed = JSON.parse(aiResponseText);
          if (typeof parsed.overallScore === 'number' && parsed.feedbackJson) {
            console.log(`[Gemini Eval] Succeeded using ${model}`);
            return {
              overallScore: parsed.overallScore,
              feedbackJson: parsed.feedbackJson,
            };
          }
        }
      } else {
        console.warn(`[Gemini Eval] Model ${model} returned status ${response.status}`);
      }
    } catch (err: any) {
      console.warn(`[Gemini Eval] Model ${model} attempt error:`, err?.message || err);
    }
  }
  return null;
}

// Truthful, transcript-aware fallback evaluation
const generateFeedback = (
  role: string,
  difficulty: string,
  persona: string,
  transcript?: Array<{ speaker: string; text: string; timestamp?: string }> | null,
  proctoring?: { violationCount?: number; violations?: Array<{ message: string }>; facePresent?: boolean } | null,
  durationSeconds?: number
) => {
  const isFresher = ['junior', 'intern', 'associate'].includes(difficulty.toLowerCase());
  const techCategoryName = isFresher ? "Technical Fundamentals" : "Technical Depth";
  const leadCategoryName = isFresher ? "Problem Solving" : "Leadership Presence";

  const userLines = Array.isArray(transcript)
    ? transcript.filter(l => l.speaker !== 'AI Interviewer' && l.speaker !== 'interviewer')
    : [];

  const violationsCount = proctoring?.violationCount ?? (proctoring?.violations?.length || 0);

  let nonAnswersCount = 0;
  let substantiveAnswersCount = 0;
  let totalLength = 0;

  userLines.forEach(l => {
    const text = (l.text || '').trim().toLowerCase();
    totalLength += text.length;
    if (
      text.length === 0 ||
      text === "i don't know" ||
      text === "don't know" ||
      text === "idk" ||
      text === "no" ||
      text === "nah" ||
      text.length < 10 ||
      text.includes("eid mubarak") ||
      /^[^a-zA-Z0-9]+$/.test(text)
    ) {
      nonAnswersCount++;
    } else {
      substantiveAnswersCount++;
    }
  });

  const isLowQuality = userLines.length === 0 || (nonAnswersCount / Math.max(1, userLines.length)) >= 0.5;

  const qLines = Array.isArray(transcript)
    ? transcript.filter(l => l.speaker === 'AI Interviewer' || l.speaker === 'interviewer')
    : [];

  const totalSec = typeof durationSeconds === 'number' && durationSeconds > 0 ? durationSeconds : 180;
  const formatSec = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const getEventTime = (transcriptIdx: number, defaultFraction: number) => {
    if (Array.isArray(transcript) && transcript[transcriptIdx]?.timestamp) {
      return transcript[transcriptIdx].timestamp!;
    }
    return formatSec(Math.round(totalSec * defaultFraction));
  };

  // Case 1: ZERO responses submitted by candidate
  if (userLines.length === 0) {
    const categories = [
      {
        name: "Communication",
        score: 0,
        color: "var(--color-primary)",
        notes: "No candidate verbal or written responses were provided during the interview session (0 answers submitted)."
      },
      {
        name: techCategoryName,
        score: 0,
        color: "var(--color-secondary)",
        notes: `Candidate did not attempt or answer any ${isFresher ? 'technical fundamentals' : 'technical depth'} questions for the ${role} role.`
      },
      {
        name: leadCategoryName,
        score: 0,
        color: "var(--color-tertiary)",
        notes: "Unable to assess structured problem solving or coding ability because no candidate responses were provided."
      },
      {
        name: "Clarity Under Pressure",
        score: 0,
        color: "var(--color-error)",
        notes: violationsCount > 0
          ? `Session concluded with 0 answers submitted and ${violationsCount} proctoring violation(s) recorded.`
          : "Interview session ended with zero candidate answers submitted."
      }
    ];

    const highlights = [
      { time: "00:00", label: "Interview session initiated" },
      { time: getEventTime(0, 0.10), label: qLines[0] ? `Opening question presented to candidate` : "Interview question presented" },
      { time: formatSec(Math.min(totalSec, 30)), label: "No response received from candidate" },
      { time: formatSec(totalSec), label: `Session concluded (${formatSec(totalSec)}) with 0 responses submitted` }
    ];

    return {
      overallScore: 0,
      feedbackJson: {
        persona,
        categories,
        highlights
      }
    };
  }

  let commScore: number;
  let techScore: number;
  let probScore: number;
  let clarityScore: number;
  let notesComm: string;
  let notesTech: string;
  let notesLead: string;
  let notesClarity: string;
  let highlights: Array<{ time: string; label: string }> = [];

  if (isLowQuality) {
    commScore = substantiveAnswersCount === 0
      ? Math.max(0, Math.min(10, userLines.length * 2))
      : Math.max(5, Math.min(25, Math.round(5 + substantiveAnswersCount * 4)));
    techScore = substantiveAnswersCount === 0
      ? 0
      : Math.max(0, Math.min(20, Math.round(substantiveAnswersCount * 5)));
    probScore = substantiveAnswersCount === 0
      ? 0
      : Math.max(0, Math.min(20, Math.round(substantiveAnswersCount * 5)));
    clarityScore = Math.max(0, Math.min(25, 15 - Math.min(15, violationsCount * 3)));

    notesComm = "The candidate answered primarily with 'don't know', very brief phrases, or unrelated text. Articulation and engagement need significant improvement.";
    notesTech = substantiveAnswersCount === 0
      ? `The candidate was unable to answer core ${isFresher ? 'technical fundamentals' : 'technical depth'} questions for the ${role} role, responding with 'don't know' or skipping technical concepts.`
      : `The candidate struggled with core ${isFresher ? 'technical fundamentals' : 'technical depth'} questions for the ${role} role.`;
    notesLead = "Unable to assess structured problem solving or coding ability due to absent or incomplete answers.";
    notesClarity = violationsCount > 0
      ? `Struggled under interview pressure with ${violationsCount} proctoring violations recorded (e.g. face not visible on camera).`
      : "Showed hesitation and gave up on technical prompts rather than working through possible solutions.";

    highlights = [
      { time: getEventTime(0, 0.05), label: qLines[0] ? `Opening question: candidate provided brief/unrelated response` : "Interview session initiated" },
      { time: getEventTime(1, 0.35), label: qLines[1] ? `Candidate stated 'don't know' on technical probe` : "Candidate struggled with core concepts" },
      { time: getEventTime(2, 0.70), label: qLines[2] ? `Coding/technical challenge left incomplete or skipped` : "Problem solving probe unresolved" },
      { time: formatSec(totalSec), label: `Session completed (${formatSec(totalSec)}) with ${violationsCount} proctoring flag(s)` },
    ];
  } else {
    commScore = Math.min(88, Math.max(55, Math.round(50 + (totalLength / userLines.length) * 0.25)));
    techScore = Math.min(85, Math.max(50, Math.round(45 + substantiveAnswersCount * 8)));
    probScore = Math.min(85, Math.max(50, Math.round(45 + substantiveAnswersCount * 8)));
    clarityScore = Math.max(40, 75 - Math.min(30, violationsCount * 4));

    notesComm = `Engaged with questions and provided responses for ${role}. Work on conciseness and STAR formatting.`;
    notesTech = `Addressed interview prompts for ${role}. Focus on strengthening edge cases and performance trade-offs.`;
    notesLead = `Demonstrated reasonable problem-solving engagement appropriate for ${difficulty} level.`;
    notesClarity = violationsCount > 0
      ? `Completed questions but received ${violationsCount} proctoring flags during the session.`
      : "Maintained steady pace across interview questions.";

    highlights = [
      { time: getEventTime(0, 0.05), label: `Initial introduction and role overview for ${role}` },
      { time: getEventTime(1, 0.35), label: `Technical reasoning on primary domain question` },
      { time: getEventTime(2, 0.70), label: `Approach to coding and system design scenario` },
      { time: formatSec(totalSec), label: `Session conclusion and final responses (${formatSec(totalSec)})` },
    ];
  }

  const overallScore = Math.round((commScore + techScore + probScore + clarityScore) / 4);

  const categories = [
    { name: "Communication", score: commScore, color: "var(--color-primary)", notes: notesComm },
    { name: techCategoryName, score: techScore, color: "var(--color-secondary)", notes: notesTech },
    { name: leadCategoryName, score: probScore, color: "var(--color-tertiary)", notes: notesLead },
    { name: "Clarity Under Pressure", score: clarityScore, color: "var(--color-error)", notes: notesClarity }
  ];

  return {
    overallScore,
    feedbackJson: {
      persona,
      categories,
      highlights
    }
  };
};

// POST /api/sessions/:sessionId/complete
app.post('/api/sessions/:sessionId/complete', async (req, res) => {
  const { sessionId } = req.params;
  const { transcript, proctoring, durationSeconds, durationFormatted } = req.body || {};
  const force = req.query.force === 'true';

  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status === 'COMPLETED' && !force) {
      return res.json({ success: true, session });
    }

    // Get persona and resume context from feedbackJson
    let persona = 'APEX';
    let resumeContext = false;
    let resumeData = null;
    if (session.feedbackJson && typeof session.feedbackJson === 'object') {
      const fb = session.feedbackJson as any;
      if (fb.persona) persona = fb.persona;
      resumeContext = Boolean(fb.resumeContext);
      resumeData = fb.resumeSnapshot?.extractedData ?? null;
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    let feedback = null;

    const userLines = Array.isArray(transcript)
      ? transcript.filter((l: any) => l.speaker === 'user' || l.speaker === 'candidate' || l.speaker === 'You')
      : [];

    // If candidate submitted ZERO responses, award an unequivocal 0 score without hallucinated AI points
    if (userLines.length === 0) {
      console.log(`Candidate provided 0 responses for session ${sessionId}. Generating strict zero-score debrief.`);
      feedback = generateFeedback(session.domain, session.level, persona, transcript, proctoring, durationSeconds);
    } else if (geminiApiKey && transcript && Array.isArray(transcript) && transcript.length > 0) {
      try {
        console.log(`Running truthful interview evaluation for session ${sessionId}...`);
        const transcriptText = transcript
          .map((line: any) => {
            const timeTag = line.timestamp ? `[${line.timestamp}] ` : '';
            return `${timeTag}${line.speaker}: ${line.text}`;
          })
          .join('\n');
        
        const isFresher = ['junior', 'intern', 'associate'].includes(session.level.toLowerCase());
        const techCategoryName = isFresher ? "Technical Fundamentals" : "Technical Depth";
        const leadCategoryName = isFresher ? "Problem Solving" : "Leadership Presence";

        const violationsCount = proctoring?.violationCount ?? (proctoring?.violations?.length || 0);
        const violationSummaryText = Array.isArray(proctoring?.violations) && proctoring.violations.length > 0
          ? proctoring.violations.map((v: any) => v.message).join('; ')
          : 'None flagged';

        const resumeSection = resumeContext && resumeData
          ? `
Resume Context (enabled — check if answers align with claimed experience):
- Skills: ${(resumeData.skills || []).join(', ') || 'Not listed'}
- Projects: ${(resumeData.projects || []).join('; ') || 'Not listed'}
- Internships: ${(resumeData.internships || []).join('; ') || 'Not listed'}
- Education: ${(resumeData.education || []).join('; ') || 'Not listed'}
`
          : '';

        const actualDurationStr = durationFormatted || (typeof durationSeconds === 'number' && durationSeconds > 0
          ? `${String(Math.floor(durationSeconds / 60)).padStart(2, '0')}:${String(durationSeconds % 60).padStart(2, '0')}`
          : 'Unknown');

        const prompt = `
You are a rigorous, truthful technical interview evaluation engine.
Assess the candidate for the role "${session.domain}" (difficulty level: "${session.level}").

Total Recorded Interview Duration: ${actualDurationStr}

Full Interview Transcript (with recorded timestamps):
${transcriptText}

Proctoring integrity data:
- Flagged violations count: ${violationsCount}
- Violations summary: ${violationSummaryText}
- Face visible: ${proctoring?.facePresent !== false ? 'Yes' : 'No'}
${resumeSection}
STRICT & TRUTHFUL EVALUATION RULES:
1. STRICT TRUTHFUL SCORING & ZERO-TOLERANCE RULES:
   - Evaluate the candidate's ACTUAL answers strictly based on correctness, technical substance, and relevance.
   - RESUME & FINAL YEAR PROJECT GROUND-TRUTH VERIFICATION: Compare candidate responses directly against their resume data. Specifically evaluate their Final Year Project explanation: did the candidate demonstrate authentic personal contribution, architectural understanding, and clarity about their project stack, or was their answer vague, evasive, or inconsistent? Reflect this directly in ${techCategoryName} and ${leadCategoryName} feedback and score.
   - ZERO & NON-ANSWER PENALTY: For ANY category where the candidate did not answer, said "don't know", "idk", gave gibberish (e.g. "aqwr", "hello hi bye"), or skipped questions, award a score of EXACTLY 0 for that category!
   - Under NO circumstances award sympathy or pity points (e.g. 5, 8, 10, or 12) for unanswered questions or "don't know"!
   - NEVER fabricate answers or praise skills the candidate did not demonstrate! Under NO circumstances praise "good grasp of OOP" if the candidate answered "don't know" or gave no answer!
   - Communication: Rate actual verbal expression and responsiveness. Non-answers, silence, or irrelevant phrases must receive 0 (or 1-10 max if partially coherent).
   - ${techCategoryName}: Rate technical accuracy of answers given. If foundational questions were unanswered, wrong, or skipped, score 0.
   - ${leadCategoryName}: Rate problem-solving and algorithmic capability. If code/analytical questions were unanswered, wrong, or skipped, score 0.
   - Clarity Under Pressure: Penalize heavily for proctoring violations (${violationsCount} violations) and inability to answer under pressure (score 0-15).
   - Overall Score: The realistic weighted average of the four categories (0 if no valid answers were provided).
2. CONSTRUCTIVE & ACCURATE NOTES:
   - Honestly detail what questions the candidate failed to answer and specific topics they need to study.
3. SESSION HIGHLIGHTS:
   - Exactly 4 chronological milestones representing key moments that ACTUALLY occurred in the transcript.
   - REAL TIMESTAMPS: You MUST use the REAL [mm:ss] timestamps directly from the transcript lines above (when each question was asked or answered). Do NOT invent arbitrary or guessed timestamps (such as 00:15, 00:30, 00:45) when real timestamps are recorded in the transcript.
   - Timestamps MUST be in chronologically ascending order and must NEVER exceed the total recorded session duration (${actualDurationStr}).
   - The final highlight must represent the conclusion of the session at or near the final elapsed timestamp.
   - Highlights MUST reflect true events (e.g. candidate gave strong answer to question X, candidate skipped question Y, candidate hesitated/silent, etc.). NEVER invent imaginary topics!

Return ONLY a raw JSON object (no markdown, no backticks):
{
  "overallScore": number,
  "feedbackJson": {
    "persona": "${persona}",
    "categories": [
      {
        "name": "Communication",
        "score": number,
        "color": "var(--color-primary)",
        "notes": "string"
      },
      {
        "name": "${techCategoryName}",
        "score": number,
        "color": "var(--color-secondary)",
        "notes": "string"
      },
      {
        "name": "${leadCategoryName}",
        "score": number,
        "color": "var(--color-tertiary)",
        "notes": "string"
      },
      {
        "name": "Clarity Under Pressure",
        "score": number,
        "color": "var(--color-error)",
        "notes": "string"
      }
    ],
    "highlights": [
      { "time": "string", "label": "string" },
      { "time": "string", "label": "string" },
      { "time": "string", "label": "string" },
      { "time": "string", "label": "string" }
    ]
  }
}
`;

        feedback = await callGeminiWithFallback(geminiApiKey, prompt, 15000);
      } catch (geminiError) {
        console.error('Error during Gemini interview evaluation pipeline:', geminiError);
      }
    }

    // Fallback to truthful transcript-aware analysis if Gemini was unavailable
    if (!feedback) {
      console.log(`Using transcript-aware local analyzer for session ${sessionId}...`);
      feedback = generateFeedback(session.domain, session.level, persona, transcript, proctoring, durationSeconds);
    }

    const mergedFeedbackJson = normalizeFeedbackCategories({
      ...feedback.feedbackJson,
      persona: feedback.feedbackJson?.persona || persona,
      resumeContext,
      resumeSnapshot: session.feedbackJson && typeof session.feedbackJson === 'object'
        ? (session.feedbackJson as any).resumeSnapshot
        : null,
      resumeQuestions: session.feedbackJson && typeof session.feedbackJson === 'object'
        ? (session.feedbackJson as any).resumeQuestions
        : [],
      resumeQuestionsSource: session.feedbackJson && typeof session.feedbackJson === 'object'
        ? (session.feedbackJson as any).resumeQuestionsSource
        : null,
    });

    const storedTranscript =
      Array.isArray(transcript) && transcript.length > 0 ? transcript : null;
    const storedProctoring =
      proctoring && typeof proctoring === 'object' ? proctoring : null;

    const actualMinutes = typeof durationSeconds === 'number' && durationSeconds > 0
      ? Math.max(1, Math.round(durationSeconds / 60))
      : undefined;

    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        overallScore: feedback.overallScore,
        feedbackJson: mergedFeedbackJson as Prisma.InputJsonValue,
        transcript: storedTranscript as Prisma.InputJsonValue,
        proctoringJson: storedProctoring as Prisma.InputJsonValue,
        ...(actualMinutes ? { duration: actualMinutes } : {}),
      },
    });

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// GET /api/sessions/:sessionId
app.get('/api/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const feedback = session.feedbackJson && typeof session.feedbackJson === 'object'
      ? session.feedbackJson as any
      : {};

    res.json({
      ...session,
      resumeContext: Boolean(feedback.resumeContext),
      resumeData: feedback.resumeSnapshot?.extractedData ?? null,
      resumeQuestions: Array.isArray(feedback.resumeQuestions) ? feedback.resumeQuestions : [],
      resumeQuestionsSource: feedback.resumeQuestionsSource ?? null,
      questionCount: Number(feedback.questionCount) || 5,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, email, avatarUrl, password, currentPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
      updateData.email = email;
    }
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    if (password) {
      if (!currentPassword && user.password) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      if (user.password && currentPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ error: 'Incorrect current password' });
        }
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// GET /api/users/:userId/analytics
app.get('/api/users/:userId/analytics', async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Fetch completed interview sessions for the user ordered by creation date ascending
    const sessions = await prisma.interviewSession.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'asc' }
    });

    // 2. Default stats structures
    const categories = [
      { name: "Communication", score: 0, prev: 0, icon: "record_voice_over" },
      { name: "Technical Depth", score: 0, prev: 0, icon: "code" },
      { name: "Leadership Presence", score: 0, prev: 0, icon: "leaderboard" },
      { name: "Clarity Under Fire", score: 0, prev: 0, icon: "psychology" }
    ];

    const weeklyData = Array(12).fill(0); // 12 months: Jan to Dec

    if (sessions.length > 0) {
      const currentSums = emptySkillSums();
      const currentCounts = emptySkillSums();
      accumulateSkillScores(sessions, currentSums, currentCounts);

      categories.forEach((cat) => {
        const count = currentCounts[cat.name as keyof typeof currentCounts];
        cat.score = count > 0 ? Math.round(currentSums[cat.name as keyof typeof currentSums] / count) : 0;
      });

      if (sessions.length > 1) {
        const prevSessions = sessions.slice(0, -1);
        const prevSums = emptySkillSums();
        const prevCounts = emptySkillSums();
        accumulateSkillScores(prevSessions, prevSums, prevCounts);

        categories.forEach((cat) => {
          const count = prevCounts[cat.name as keyof typeof prevCounts];
          cat.prev = count > 0 ? Math.round(prevSums[cat.name as keyof typeof prevSums] / count) : 0;
        });
      } else {
        categories.forEach((cat) => {
          cat.prev = 0;
        });
      }

      const currentYear = new Date().getFullYear();
      const monthlySums = Array(12).fill(0);
      const monthlyCounts = Array(12).fill(0);

      sessions.forEach(s => {
        const date = new Date(s.createdAt);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth(); // 0 to 11
          monthlySums[month] += s.overallScore || 0;
          monthlyCounts[month]++;
        }
      });

      for (let i = 0; i < 12; i++) {
        weeklyData[i] = monthlyCounts[i] > 0 ? Math.round(monthlySums[i] / monthlyCounts[i]) : 0;
      }
    }

    res.json({
      skills: categories,
      weeklyData
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ error: 'Failed to fetch analytics stats' });
  }
});

// GET /api/users/:userId/sessions (get interview sessions)
app.get('/api/users/:userId/sessions', async (req, res) => {
  const { userId } = req.params;
  const limitParam = req.query.limit as string | undefined;
  const takeLimit = limitParam && limitParam !== 'all' ? parseInt(limitParam) : undefined;

  try {
    const allUserSessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = allUserSessions.length;
    const completedAll = allUserSessions.filter((s) => s.status === 'COMPLETED');

    const avgScoreAll = completedAll.length > 0
      ? Math.round(completedAll.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedAll.length)
      : 0;

    const totalMinutesAll = completedAll.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHoursAll = (totalMinutesAll / 60).toFixed(1).replace(/\.0$/, '');

    // Recent 5 stats
    const recent5 = allUserSessions.slice(0, 5);
    const completedRecent = recent5.filter((s) => s.status === 'COMPLETED');
    const avgScoreRecent = completedRecent.length > 0
      ? Math.round(completedRecent.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedRecent.length)
      : 0;
    const totalMinutesRecent = completedRecent.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHoursRecent = (totalMinutesRecent / 60).toFixed(1).replace(/\.0$/, '');

    const selectedSessions = takeLimit ? allUserSessions.slice(0, takeLimit) : allUserSessions;

    const formattedSessions = selectedSessions.map((s) => {
      let persona = 'APEX';
      if (s.feedbackJson && typeof s.feedbackJson === 'object') {
        const fb = s.feedbackJson as any;
        if (fb.persona) persona = String(fb.persona).toUpperCase();
      }
      return {
        id: s.id,
        role: s.domain,
        persona,
        difficulty: s.level,
        duration: `${s.duration || 30} min`,
        score: s.overallScore ?? 0,
        status: s.status,
        date: new Date(s.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    });

    res.json({
      sessions: formattedSessions,
      stats: {
        totalSessions: totalCount,
        averageScore: `${avgScoreAll}%`,
        hours: `${totalHoursAll}h`,
        recent: {
          totalSessions: recent5.length,
          completedSessions: completedRecent.length,
          averageScore: `${avgScoreRecent}%`,
          hours: `${totalHoursRecent}h`,
        },
        allTime: {
          totalSessions: totalCount,
          completedSessions: completedAll.length,
          averageScore: `${avgScoreAll}%`,
          hours: `${totalHoursAll}h`,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// POST /api/support (create support ticket)
app.post('/api/support', async (req, res) => {
  const { email, type, message } = req.body;

  if (!email || !type || !message) {
    return res.status(400).json({ error: 'Email, type, and message are required' });
  }

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        email,
        type,
        message
      }
    });

    console.log(`\n======================================================`);
    console.log(`NEW SUPPORT TICKET RECEIVED:`);
    console.log(`FROM: ${email}`);
    console.log(`TYPE: ${type}`);
    console.log(`MESSAGE: ${message}`);
    console.log(`======================================================\n`);

    // 1. Send confirmation email to the user
    await sendEmail({
      to: email,
      subject: `Support Ticket Received: #${ticket.id.slice(0, 8)}`,
      text: `Hello,\n\nWe have received your support request regarding "${type}".\n\nYour message:\n"${message}"\n\nOur support team will review this and get back to you shortly.\n\nBest regards,\nElevora Support Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937;">
          <h2 style="color: #0d9488; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 0;">Support Ticket Received</h2>
          <p>Hello,</p>
          <p>We have successfully received your support request (Ticket ID: <strong>#${ticket.id}</strong>).</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Issue Type:</strong> ${type}</p>
          <p><strong>Description:</strong></p>
          <blockquote style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #0d9488; margin: 0 0 20px 0; color: #374151; font-style: italic;">
            ${message.replace(/\n/g, '<br/>')}
          </blockquote>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 14px;">Our support team is reviewing your inquiry and will get back to you shortly.</p>
          <p style="margin-bottom: 0;">Best regards,<br/><strong>Elevora Support Team</strong></p>
        </div>
      `
    }).catch(err => console.error('Error sending confirmation email to user:', err));

    // 2. Notify the administrator
    if (process.env.SMTP_USER) {
      await sendEmail({
        to: process.env.SMTP_USER,
        subject: `[NEW TICKET] #${ticket.id.slice(0, 8)} - ${type}`,
        text: `New support ticket received.\n\nFrom: ${email}\nType: ${type}\nMessage:\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937;">
            <h2 style="color: #ea580c; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 0;">New Support Ticket Received</h2>
            <p><strong>Ticket ID:</strong> #${ticket.id}</p>
            <p><strong>From:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #ea580c; margin: 0 0 20px 0; color: #374151;">
              ${message.replace(/\n/g, '<br/>')}
            </blockquote>
          </div>
        `
      }).catch(err => console.error('Error sending notification email to admin:', err));
    }

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to submit support ticket' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

