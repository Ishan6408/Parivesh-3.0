import express from "express";
import path from "path";
import Database from "better-sqlite3";
import Groq from "groq-sdk";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";


// Load .env from current dir or parent dir
// Load .env
dotenv.config();
if (fs.existsSync('../.env')) {
  dotenv.config({ path: '../.env' });
}

const db = new Database("parivesh3.db");

const JWT_SECRET = process.env.JWT_SECRET || "parivesh3_super_secret_key_2026";

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT,
    organization TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    applicant TEXT,
    status TEXT,
    lat REAL,
    lng REAL,
    riskScore INTEGER,
    riskSummary TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    type TEXT,
    content TEXT,
    summary TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    author TEXT,
    content TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    regulatorId INTEGER,
    status TEXT,
    comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    type TEXT,
    severity TEXT,
    message TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    documentType TEXT,
    fileName TEXT,
    filePath TEXT,
    status TEXT DEFAULT 'Uploaded',
    uploadedBy TEXT,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deficiencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER,
    item TEXT,
    comment TEXT,
    status TEXT DEFAULT 'Pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );


`);

// Seed some initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };
if (count.count === 0) {
  const insertProject = db.prepare("INSERT INTO projects (title, description, applicant, status, lat, lng, riskScore, riskSummary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  insertProject.run("Green Valley Wind Farm", "A 50MW wind farm project in the western ghats.", "EcoEnergy Ltd", "Pending", 19.0760, 72.8777, 35, "Low risk. Minimal deforestation expected. Wildlife impact is moderate due to bird migration routes.");
  insertProject.run("Riverfront Development", "Commercial development along the river bank.", "Urban Infra", "Approved", 28.7041, 77.1025, 78, "High risk. Significant impact on water quality and local ecosystem. Requires strict monitoring.");
  insertProject.run("Solar Park Alpha", "100 acres of solar panels in arid region.", "SunPower Inc", "Under Review", 26.9124, 75.7873, 15, "Very low risk. Land is mostly barren. Positive environmental impact.");
}

// Seed some initial users if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync("password123", salt);
  const insertUser = db.prepare("INSERT INTO users (name, email, password_hash, role, organization) VALUES (?, ?, ?, ?, ?)");
  insertUser.run("Admin User", "admin@parivesh3.com", hash, "Regulator", "Ministry of Environment");
  insertUser.run("Test Applicant", "applicant@test.com", hash, "Applicant", "Test Corp");
  insertUser.run("Test Regulator", "regulator@test.com", hash, "Regulator", "Ministry");
  insertUser.run("Test Citizen", "citizen@test.com", hash, "Citizen", "Public");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  };

  const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }
      next();
    };
  };

  // Auth Routes
  app.post("/api/auth/register", async (req: any, res: any) => {
    try {
      const { name, email, password, role, organization } = req.body;
      
      const allowedRoles = ['Applicant', 'Regulator', 'Citizen'];
      const allowedStatuses = ['Draft', 'Submitted', 'Under review', 'Deficiency raised', 'Applicant response', 'Committee review', 'Approved', 'Rejected'];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role selected" });
      }

      // Check if user exists
      const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Insert user
      const insert = db.prepare("INSERT INTO users (name, email, password_hash, role, organization) VALUES (?, ?, ?, ?, ?)");
      const info = insert.run(name, email, password_hash, role, organization);

      // Generate token
      const token = jwt.sign({ id: info.lastInsertRowid, email, role }, JWT_SECRET, { expiresIn: "24h" });

      res.status(201).json({ 
        token, 
        user: { id: info.lastInsertRowid, name, email, role, organization } 
      });
    } catch (error: any) {
      console.error("Registration error details:", error.message || error);
      res.status(500).json({ error: "Registration failed: " + (error.message || "Unknown error") });
    }
  });

  app.post("/api/auth/login", async (req: any, res: any) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });

      res.json({ 
        token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role, organization: user.organization } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/profile", authenticateToken, (req: any, res: any) => {
    try {
      const user = db.prepare("SELECT id, name, email, role, organization, created_at FROM users WHERE id = ?").get(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // API Routes
  app.get("/api/projects", authenticateToken, (req: any, res: any) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY createdAt DESC").all();
    res.json(projects);
  });

  app.get("/api/projects/:id", authenticateToken, (req: any, res: any) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  });

  app.post("/api/projects", authenticateToken, authorizeRoles('Applicant'), async (req: any, res: any) => {
    const { title, description, applicant, lat, lng, type, area, forestLand, waterUsage, cost, employment, distProtectedArea, emissions, wastewater, solidWaste } = req.body;
    
    let riskScore = 0;
    let riskSummary = '';
    
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
        throw new Error("Invalid or missing GROQ_API_KEY");
      }
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Analyze the following environmental project description and provide a highly accurate risk score from 0 to 100 (where 100 is highest environmental risk) based on the provided metrics. Provide a brief 3-sentence summary of the risks regarding deforestation, water depletion, pollution, and wildlife impact. Factor in the distance to protected areas heavily.
        
        Project Title: ${title}
        Type: ${type || 'N/A'}
        Estimated Project Cost: ₹${cost || 'N/A'} Cr
        Estimated Employment: ${employment || 'N/A'} Persons
        Estimated Area: ${area || 'N/A'} Hectares
        Requires Forest Land: ${forestLand || 'No'}
        Distance to Nearest Protected Area/Wildlife Sanctuary: ${distProtectedArea || 'N/A'} km
        Estimated Water Usage: ${waterUsage || 'N/A'} Liters/Day
        Wastewater Generation: ${wastewater || 'N/A'} Liters/Day
        Solid Waste Generation: ${solidWaste || 'N/A'} Tons/Day
        Expected Air Emissions: ${emissions || 'None'}
        Project Description: ${description}
        
        Return the response strictly as JSON with keys "score" (number) and "summary" (string).`
        }],
        response_format: { type: "json_object" }
      });
      
      try {
        const result = JSON.parse(response.choices[0]?.message?.content || "{}");
        riskScore = result.score || 0;
        riskSummary = result.summary || '';
      } catch (parseError) {
        console.error("AI Response Parse Error:", parseError);
        riskScore = 50;
        riskSummary = "AI response format error. Using fallback summary.";
      }
    } catch (error: any) {
      if (error?.status === 401 || error?.message?.includes('API key') || error?.message?.includes('Invalid or missing')) {
        console.warn("⚠️ Groq API Key is missing or invalid. Using fallback risk analysis.");
        riskScore = Math.floor(Math.random() * 100);
        riskSummary = "Fallback AI Summary: The project requires manual review. Please configure a valid Groq API key in the Secrets panel for accurate AI analysis.";
      } else {
        console.error("AI Analysis Error during project creation:", error);
        riskScore = 50;
        riskSummary = "Error generating AI summary. Please try again later.";
      }
    }

    const insert = db.prepare("INSERT INTO projects (title, description, applicant, status, lat, lng, riskScore, riskSummary) VALUES (?, ?, ?, 'Pending', ?, ?, ?, ?)");
    const info = insert.run(title, description, applicant, lat, lng, riskScore, riskSummary);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/projects/:id/status", authenticateToken, authorizeRoles('Regulator'), (req: any, res: any) => {
    const { status, comment } = req.body;
    const update = db.prepare("UPDATE projects SET status = ? WHERE id = ?");
    update.run(status, req.params.id);

    const insertDecision = db.prepare("INSERT INTO decisions (projectId, regulatorId, status, comment) VALUES (?, ?, ?, ?)");
    insertDecision.run(req.params.id, (req as any).user.id, status, comment || "");

    res.json({ success: true });
  });

  app.get("/api/projects/:id/decisions", authenticateToken, (req: any, res: any) => {
    const decisions = db.prepare("SELECT * FROM decisions WHERE projectId = ? ORDER BY createdAt DESC").all(req.params.id);
    res.json(decisions);
  });

  app.get("/api/alerts", authenticateToken, (req: any, res: any) => {
    const alerts = db.prepare(`
      SELECT a.*, p.title as projectTitle 
      FROM alerts a 
      JOIN projects p ON a.projectId = p.id 
      ORDER BY a.createdAt DESC
    `).all();
    res.json(alerts);
  });

  app.get("/api/reports/:projectId", authenticateToken, (req: any, res: any) => {
    const reports = db.prepare("SELECT * FROM reports WHERE projectId = ?").all(req.params.projectId);
    res.json(reports);
  });

  app.post("/api/projects/:id/comments", authenticateToken, authorizeRoles('Citizen'), (req: any, res: any) => {
    const { content } = req.body;
    const author = (req as any).user.name;
    const insert = db.prepare("INSERT INTO comments (projectId, author, content) VALUES (?, ?, ?)");
    insert.run(req.params.id, author, content);
    res.json({ success: true });
  });

  // --- DOCUMENT UPLOAD SYSTEM ---
  
  // Configure Multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = 'uploads';
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only PDF, PNG, JPG, DOC, DOCX allowed."));
      }
    }
  });

  app.post("/api/documents/upload", authenticateToken, upload.single('file'), (req: any, res: any) => {
    try {
      const { applicationId, documentType } = req.body;
      const file = req.file;

      if (!file) return res.status(400).json({ error: "No file uploaded" });

      // Clean up previous uploads of same type for this project
      const deleteOld = db.prepare("DELETE FROM documents WHERE projectId = ? AND documentType = ?");
      deleteOld.run(applicationId, documentType);

      const insert = db.prepare(`
        INSERT INTO documents (projectId, documentType, fileName, filePath, uploadedBy) 
        VALUES (?, ?, ?, ?, ?)
      `);
      insert.run(applicationId, documentType, file.originalname, file.path, req.user.name);

      res.status(201).json({ success: true, message: "Document uploaded successfully" });
    } catch (error: any) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  app.get("/api/projects/:id/documents", authenticateToken, (req: any, res: any) => {
    const docs = db.prepare("SELECT * FROM documents WHERE projectId = ?").all(req.params.id);
    res.json(docs);
  });

  app.put("/api/documents/:id/status", authenticateToken, authorizeRoles('Regulator'), (req: any, res: any) => {
    const { status } = req.body;
    const update = db.prepare("UPDATE documents SET status = ? WHERE id = ?");
    update.run(status, req.params.id);
    res.json({ success: true });
  });

  // --- DEFICIENCY SYSTEM (EDS) ---
  
  app.post("/api/projects/:id/deficiencies", authenticateToken, authorizeRoles('Regulator'), (req: any, res: any) => {
    const { items, comment } = req.body;
    const projectId = req.params.id;

    const insertDecision = db.prepare("INSERT INTO decisions (projectId, status, comment) VALUES (?, ?, ?)");
    insertDecision.run(projectId, 'Deficiency raised', comment);

    const updateProject = db.prepare("UPDATE projects SET status = 'Deficiency raised' WHERE id = ?");
    updateProject.run(projectId);

    const insertDeficiency = db.prepare("INSERT INTO deficiencies (projectId, item, comment) VALUES (?, ?, ?)");
    for (const item of items) {
      insertDeficiency.run(projectId, item, comment);
    }

    res.json({ success: true });
  });

  app.get("/api/projects/:id/deficiencies", authenticateToken, (req: any, res: any) => {
    const deficiencies = db.prepare("SELECT * FROM deficiencies WHERE projectId = ?").all(req.params.id);
    res.json(deficiencies);
  });

  app.patch("/api/deficiencies/:id/status", authenticateToken, (req: any, res: any) => {
    const { status } = req.body;
    const update = db.prepare("UPDATE deficiencies SET status = ? WHERE id = ?");
    update.run(status, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/deficiencies", authenticateToken, (req: any, res: any) => {
    let deficiencies;
    if (req.user.role === 'Applicant') {
      deficiencies = db.prepare(`
        SELECT d.*, p.title as projectName 
        FROM deficiencies d 
        JOIN projects p ON d.projectId = p.id 
        WHERE p.applicant = ?
      `).all(req.user.organization); // Assuming applicant is stored as organization name
    } else {
      deficiencies = db.prepare(`
        SELECT d.*, p.title as projectName 
        FROM deficiencies d 
        JOIN projects p ON d.projectId = p.id
      `).all();
    }
    res.json(deficiencies);
  });

  app.get("/api/stats/deficiencies", authenticateToken, (req: any, res: any) => {

    const stats = db.prepare(
      "SELECT " +
      "COUNT(*) as total, " +
      "SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending, " +
      "SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved " +
      "FROM deficiencies"
    ).get();
    res.json(stats);
  });

  // Serve uploads statically

  app.use('/uploads', express.static('uploads'));


  // AI Routes
  app.post("/api/ai/analyze-risk", authenticateToken, authorizeRoles('Regulator', 'Applicant'), async (req: any, res: any) => {
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
        return res.json({ score: 50, summary: "Fallback AI Summary: Please configure a valid Groq API key in the Secrets panel." });
      }
      const { description } = req.body;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Analyze the following environmental project description and provide a risk score from 0 to 100 (where 100 is highest risk) and a brief 2-sentence summary of the risks regarding deforestation, water, and wildlife.
        
        Project Description: ${description}
        
        Return the response strictly as JSON with keys "score" (number) and "summary" (string).`
        }],
        response_format: { type: "json_object" }
      });
      
      try {
        const result = JSON.parse(response.choices[0]?.message?.content || "{}");
        res.json(result);
      } catch (parseError) {
        console.error("AI Analysis Parse Error:", parseError);
        res.status(500).json({ error: "Failed to parse AI response" });
      }
    } catch (error: any) {
      if (error?.status === 401 || error?.message?.includes('API key')) {
        console.warn("⚠️ Groq API Key is missing or invalid.");
        return res.json({ score: 50, summary: "Fallback AI Summary: Please configure a valid Groq API key in the Secrets panel." });
      }
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze risk" });
    }
  });

  app.post("/api/ai/chat", async (req: any, res: any) => {
    try {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.flushHeaders();

      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
        res.write("I'm sorry, but my AI capabilities are currently offline. Please configure a valid Groq API key in the Secrets panel.");
        return res.end();
      }
      
      const { message, language } = req.body;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const stream = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "system",
          content: `You are the Official AI Assistant for Parivesh 3.0 (PARIVESH 3.0), the environmental clearance portal for the Ministry of Environment, Forest and Climate Change (MoEFCC), Government of India.
        
        Your role is to assist project proponents, regulators, and citizens with queries related to Environmental Impact Assessments (EIA), Forest Clearances, Wildlife Clearances, Coastal Regulation Zone (CRZ) rules, and pollution control norms.
        
        Guidelines:
        1. Maintain a highly professional, formal, and objective tone suitable for a government representative. Avoid slang or overly casual language.
        2. Provide accurate, structured, and easy-to-understand information.
        3. If you do not know the answer with absolute certainty, advise the user to consult official government notifications or contact the ministry directly. Do not invent regulations.
        4. Keep responses concise unless detailed explanations are requested. Use bullet points for readability.
        
        Requested Language: ${language || 'English'}`
        }, {
          role: "user",
          content: message
        }],
        stream: true
      });
      
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          res.write(text);
        }
      }
      res.end();
    } catch (error: any) {
      console.error("AI Chat Error:", error?.message || error);
      res.write("\n\nI'm sorry, I couldn't process your request right now. Please try again in a moment.");
      res.end();
    }
  });

  // --- NEW PARIVESH 3.0 AI ENDPOINTS ---

  app.post("/api/ai/permission-advisor", authenticateToken, authorizeRoles('Applicant'), async (req: any, res: any) => {
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
        return res.json({ 
          approvals: ["Environmental Clearance", "Forest Clearance", "Wildlife Clearance"],
          advice: "Fallback Advice: Groq API key missing. Showing default mock clearances."
        });
      }
      const { idea } = req.body;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `You are the Parivesh 3.0 Permit Advisor AI. The user has an idea for a project in India: "${idea}".
        List the required environmental approvals (e.g., Environmental Clearance, Forest Clearance, Wildlife Clearance, CRZ Clearance, Consent to Establish/Operate).
        Return purely a JSON object: { "approvals": ["Approval 1", "Approval 2"], "advice": "Brief reasoning." }`
        }],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("AI Advisor Error:", error.message || error);
      res.status(500).json({ error: "Failed to advise permissions: " + (error.message || "Unknown error") });
    }
  });

  app.post("/api/ai/pollution-predictor", authenticateToken, authorizeRoles('Applicant', 'Regulator'), async (req: any, res: any) => {
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
         return res.json({ air: 45, water: 20, co2: 1200, summary: "Mock risk values generated due to missing API key." });
      }
      const { projectData } = req.body;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `As an Environmental AI, predict pollution risks for: ${JSON.stringify(projectData)}.
        Return a JSON object: { "air": <0-100 risk score>, "water": <0-100 risk score>, "co2": <estimated tons per year>, "summary": "Short explanation" }`
        }],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Pollution Predictor Error:", error.message || error);
      res.status(500).json({ error: "Failed to predict pollution." });
    }
  });

  app.post("/api/ai/meeting-gist", authenticateToken, async (req: any, res: any) => {
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
         return res.json({ summary: "Mock Meeting Note: The project review resulted in a request for additional hydrology data. Deadline extended by 14 days." });
      }
      const { transcript } = req.body;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Summarize this environmental review meeting transcript into concise action items and key decisions: "${transcript}"`
        }]
      });
      res.json({ summary: response.choices[0]?.message?.content || "" });
    } catch (error: any) {
      console.error("Meeting Gist Error:", error.message || error);
      res.status(500).json({ error: "Failed to generate meeting gist." });
    }
  });

  app.post("/api/ai/analyze-document", authenticateToken, authorizeRoles('Applicant', 'Regulator'), async (req: any, res: any) => {
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
         return res.json({ 
             missingFiles: ["Hydrology Report", "Public Hearing Minutes"],
             duplicateSections: [],
             copiedContent: [{ page: 12, source: "Generic Wikipedia template missing specifics" }],
             overallIntegrityScore: 65,
             summary: "Mock verification run."
         });
      }
      const { pdfUrl } = req.body;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      // Simulation: Realistic document text based on the filename
      const documentText = `This is a sample text extracted from ${pdfUrl}. 
      The water usage projection for this project is estimated at 50,000 liters per day. 
      However, the local hydrology study suggests a limit of 30,000 liters. 
      This project follows the Buffer Zone guidelines established in the 2006 EIA notification.
      (Note: This is simulated text for AI analysis demo).`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `You are an AI document verification system for EIA reports. Analyze this document excerpt: "${documentText}"
        Identify missing standard EIA appendices, detect potentially generic/plagiarized text, and score the integrity.
        Return JSON object with these EXACT keys: 
        { 
          "missingFiles": ["List of missing required documents"], 
          "copiedContent": [{ "text": "The plagiarized text", "source": "Source Name" }], 
          "score": 85, 
          "summary": "Brief explanation of the assessment" 
        }`
        }],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Document Analysis Error:", error.message || error);
      res.status(500).json({ error: "Failed to analyze document." });
    }
  });

  app.post("/api/ai/verify-complaint", authenticateToken, authorizeRoles('Citizen', 'Regulator'), async (req: any, res: any) => {
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
         return res.json({ validityScore: 88, verificationStatus: "High Confidence", details: "Mock validation: Visual data matches description. Probable illegal discharge detected." });
      }
      const { evidenceDesc, complaintText } = req.body;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `You are an AI Complaint Verification assistant for a public environmental portal.
        A citizen submitted a complaint with text: "${complaintText}" and described the evidence (e.g. photo details) as: "${evidenceDesc}".
        Evaluate the coherence and logical validity of this complaint.
        Return JSON object: { "validityScore": <0-100>, "verificationStatus": "High Confidence" | "Needs Manual Review" | "Low Confidence", "details": "explanation" }`
        }],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Complaint Verification Error:", error.message || error);
      res.status(500).json({ error: "Failed to verify complaint." });
    }
  });
  
  // Mock IoT / GIS Data Endpoints
  app.get("/api/monitoring/data", authenticateToken, (req: any, res: any) => {
    // Generate simulated real-time IoT data
    const sensors = Array.from({length: 5}).map((_, i) => ({
      id: `sensor-${i}`,
      lat: 20 + Math.random() * 5,
      lng: 75 + Math.random() * 5,
      type: Math.random() > 0.5 ? 'air_quality' : 'water_quality',
      value: Math.floor(Math.random() * 200),
      threshold: 150,
      timestamp: new Date().toISOString(),
    }));
    
    // Simulate satellite change detection
    const satelliteChanges = Array.from({length: 3}).map((_, i) => ({
      id: `change-${i}`,
      lat: 19 + Math.random() * 6,
      lng: 74 + Math.random() * 6,
      type: 'Deforestation Detected',
      severity: Math.random() > 0.7 ? 'High' : 'Medium',
      areaImpactedHectares: Math.floor(Math.random() * 50) + 1,
    }));
    
    res.json({ sensors, satelliteChanges });
  });
  
  // --- STATIC FILE SERVING FOR PRODUCTION ---
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Go up from backend/dist or backend/ (depending on how it's run) to find the root
  let rootPath = path.resolve(__dirname, '..');
  if (__dirname.endsWith('dist')) {
    rootPath = path.resolve(__dirname, '../..');
  }
  
  const distPath = path.resolve(rootPath, 'frontend/dist');
  
  console.log(`[Diagnostics] CWD: ${process.cwd()}`);
  console.log(`[Diagnostics] __dirname: ${__dirname}`);
  console.log(`[Diagnostics] rootPath: ${rootPath}`);
  console.log(`[Diagnostics] distPath: ${distPath}`);
  
  if (fs.existsSync(distPath)) {
    console.log(`[Diagnostics] distPath exists. Contents: ${fs.readdirSync(distPath).join(', ')}`);
  } else {
    console.warn(`[Diagnostics] distPath NOT FOUND: ${distPath}`);
    // Try one more fallback: look for frontend/dist in current directory or parent
    const fallbackPath = path.resolve(process.cwd(), 'frontend/dist');
    if (fs.existsSync(fallbackPath)) {
        console.log(`[Diagnostics] Found distPath via fallback: ${fallbackPath}`);
    }
  }
  
  app.use(express.static(distPath));
  
  // Catch-all to serve index.html for SPA
  app.get("*", (req: any, res: any) => {
    // Only serve index.html if it's not an API call
    if (!req.path.startsWith('/api')) {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send(`Frontend not found. Expected index.html at: ${indexPath}`);
      }
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
