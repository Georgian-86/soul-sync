require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const supabase = require("./config/supabase");
const { analyzeMoodTrend, generateTherapyContent, analyzeQuestionnaire } = require("./config/gemini");

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from parent directory (for local dev)
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '..')));
}

// ===================== RBAC MIDDLEWARE =====================
// Simple session store (in production use Redis/JWT)
const sessions = new Map();

function createSession(userId, role) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { userId, role, createdAt: Date.now() });
  return token;
}

function requireAuth(allowedRoles = []) {
  return (req, res, next) => {
    const token = req.headers["x-auth-token"];
    if (!token || !sessions.has(token)) {
      return res.status(401).json({ message: "Unauthorized. Please login." });
    }
    const session = sessions.get(token);
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    req.user = session;
    next();
  };
}

// ===================== AUTHENTICATION =====================

// Login with password + role
app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;
  console.log('🔐 Login attempt:', { email, role, hasPassword: !!password });
  
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required." });
  }

  try {
    const tableMap = { admin: "admins", doctor: "doctors", patient: "users" };
    const idMap = { admin: "admin_id", doctor: "doctor_id", patient: "user_id" };
    const table = tableMap[role];
    if (!table) return res.status(400).json({ message: "Invalid role." });

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      console.log('❌ Login failed: User not found', { email, role, error });
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check password if the column exists and has a value
    if (data.password && data.password !== password) {
      console.log('❌ Login failed: Wrong password', { email, role });
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (data.is_active === false) {
      console.log('❌ Login failed: Account deactivated', { email, role });
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    const userId = data[idMap[role]];
    const token = createSession(userId, role);

    console.log('✅ Login successful:', { email, role, userId });
    res.json({
      message: "Login successful",
      token,
      userId,
      role,
      user: { name: data.name, email: data.email }
    });
  } catch (err) {
    console.error("💥 Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Signup
app.post("/api/signup", async (req, res) => {
  const { name, email, password, age, gender, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password required." });
  }

  try {
    // Check if email exists in any table
    for (const table of ["users", "doctors", "admins"]) {
      const { data } = await supabase.from(table).select("email").eq("email", email).single();
      if (data) return res.status(409).json({ message: "Email already registered." });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password, age: age || null, gender: gender || null, phone_number: phone || null }])
      .select()
      .single();

    if (error) return res.status(500).json({ message: "Registration failed." });

    const token = createSession(data.user_id, "patient");
    res.json({ message: "Registration successful!", token, userId: data.user_id, role: "patient" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Legacy addUser
app.post("/addUser", async (req, res) => {
  const { name, email, age, phone, gender } = req.body;
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, name, age, phone_number: phone, gender, password: "default123" }])
      .select().single();
    if (error) return res.status(500).json({ message: "Database error" });
    res.json({ message: "User added successfully!", userId: data.user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify session
app.get("/api/verify", (req, res) => {
  const token = req.headers["x-auth-token"];
  if (!token || !sessions.has(token)) return res.status(401).json({ valid: false });
  const session = sessions.get(token);
  res.json({ valid: true, userId: session.userId, role: session.role });
});

// Logout
app.post("/api/logout", (req, res) => {
  const token = req.headers["x-auth-token"];
  if (token) sessions.delete(token);
  res.json({ message: "Logged out" });
});

// ===================== PATIENT ENDPOINTS =====================

// Get user details
app.get("/getUserDetails/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users").select("*").eq("user_id", req.params.id).single();
    if (error || !data) return res.status(404).json({ message: "User not found" });
    const { password, ...safe } = data;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update user
app.post("/updateUser", async (req, res) => {
  const { userId, name, email, phone, age, gender } = req.body;
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ name, email, age, gender, phone_number: phone })
      .eq("user_id", userId).select().single();
    if (error) return res.status(500).json({ message: "Database error" });
    res.json({ message: "User updated successfully!", userId: data.user_id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile picture
app.post("/updateProfilePicture", async (req, res) => {
  const { userId, profilePicture } = req.body;
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ profile_picture: profilePicture })
      .eq("user_id", userId).select().single();
    if (error) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Profile picture updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user moods (today)
app.get("/getUserMoods/:id", async (req, res) => {
  const logDate = new Date().toISOString().split("T")[0];
  try {
    const { data, error } = await supabase
      .from("mood_logs").select("*").eq("user_id", req.params.id).eq("log_date", logDate);
    if (error) return res.status(500).json({ error: "Database error" });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get mood history
app.get("/getMoodHistory/:id", async (req, res) => {
  const days = req.query.days || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  try {
    const { data, error } = await supabase
      .from("mood_logs").select("*")
      .eq("user_id", req.params.id)
      .gte("log_date", startDate.toISOString().split("T")[0])
      .order("log_date", { ascending: true });
    if (error) return res.status(500).json({ error: "Database error" });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add mood
app.post("/addMood", async (req, res) => {
  const { userId, logDate, logHour, mood, moods } = req.body;
  try {
    await supabase.from("mood_logs").delete()
      .eq("user_id", userId).eq("log_date", logDate).eq("log_hour", logHour);

    const moodList = moods || [mood];
    const entries = moodList.map(m => ({
      user_id: userId, log_date: logDate, log_hour: logHour, mood_type: m
    }));

    const { error } = await supabase.from("mood_logs").insert(entries);
    if (error) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Mood logged!", userId });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Journal endpoints
app.post("/addJournalEntry", async (req, res) => {
  const { userId, date, text, title, mood } = req.body;
  try {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert([{ user_id: userId, entry_date: date, content: text, title, mood }])
      .select().single();
    if (error) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Journal Entry added!", entryId: data.entry_id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getJournalEntries/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("journal_entries").select("*")
      .eq("user_id", req.params.id)
      .order("entry_date", { ascending: false });
    if (error) return res.status(500).json({ error: "Database error" });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Art therapy
app.post("/saveArt", async (req, res) => {
  const { userId, artType, artData } = req.body;
  try {
    const { data, error } = await supabase
      .from("art_creations")
      .insert([{ user_id: userId, art_type: artType, art_data: artData }])
      .select().single();
    if (error) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Art saved!", artId: data.art_id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getUserArt/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("art_creations").select("*")
      .eq("user_id", req.params.id)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: "Database error" });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Doctor listing for patients
app.get("/getDoctors", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("doctors").select("doctor_id, name, specialty, bio, experience_years, rating, profile_image")
      .eq("is_active", true)
      .order("rating", { ascending: false });
    if (error) return res.status(500).json({ error: "Database error" });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/getDoctorDetails/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("doctor_id, name, email, specialty, bio, education, experience_years, rating, profile_image")
      .eq("doctor_id", req.params.id).single();
    if (error || !data) return res.status(404).json({ message: "Doctor not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Appointments
app.post("/bookAppointment", async (req, res) => {
  const { userId, doctorId, appointmentDate, notes } = req.body;
  
  try {
    const { data, error } = await supabase
      .from("appointments")
      .insert([{ user_id: userId, doctor_id: doctorId, appointment_date: appointmentDate, notes, status: "pending" }])
      .select().single();
    
    if (error) {
      console.error('Failed to book appointment:', error);
      return res.status(500).json({ message: "Database error", error: error.message });
    }
    
    res.json({ message: "Appointment booked!", appointmentId: data.appointment_id });
  } catch (err) {
    console.error('Booking appointment error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getAppointments/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('>>> BACKEND: Loading appointments for PATIENT ID:', userId);
    
    const { data, error } = await supabase
      .from("appointments")
      .select("*, doctors(name, specialty, profile_image)")
      .eq("user_id", userId)
      .order("appointment_date", { ascending: true });
    
    if (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ error: "Database error" });
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

// AI analysis
app.post("/analyzeMood/:id", async (req, res) => {
  try {
    const { data } = await supabase
      .from("mood_logs").select("*")
      .eq("user_id", req.params.id)
      .order("log_date", { ascending: false }).limit(100);
    if (!data || data.length === 0) return res.json({ analysis: "Not enough mood data yet. Start logging your moods daily!" });
    const analysis = await analyzeMoodTrend(data);
    res.json({ analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

// Doctor posts for patients
app.get("/getDoctorPosts", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("doctor_posts")
      .select("*, doctors(name, specialty)")
      .eq("is_published", true)
      .order("created_at", { ascending: false }).limit(20);
    if (error) return res.status(500).json({ error: "Database error" });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== DOCTOR ENDPOINTS (Protected) =====================

app.get("/api/doctor/dashboard/:id", async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    const { data: doctor } = await supabase
      .from("doctors").select("*").eq("doctor_id", doctorId).single();
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const { data: appointments } = await supabase
      .from("appointments")
      .select("*, users(user_id, name, email, age, gender)")
      .eq("doctor_id", doctorId)
      .order("appointment_date", { ascending: true });

    const { data: posts } = await supabase
      .from("doctor_posts").select("*")
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false });

    const pending = (appointments || []).filter(a => a.status === "pending").length;
    const confirmed = (appointments || []).filter(a => a.status === "confirmed").length;
    const uniquePatients = [...new Set((appointments || []).map(a => a.user_id))];

    const { password, ...safeDoc } = doctor;
    res.json({
      doctor: safeDoc,
      stats: { totalAppointments: (appointments || []).length, pending, confirmed, totalPatients: uniquePatients.length, totalPosts: (posts || []).length },
      appointments: appointments || [],
      posts: posts || []
    });
  } catch (err) {
    console.error('Doctor dashboard error:', err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/doctor/appointment/update", async (req, res) => {
  const { appointmentId, status } = req.body;
  try {
    const { error } = await supabase
      .from("appointments").update({ status }).eq("appointment_id", appointmentId);
    if (error) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Appointment updated!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/doctor/post/create", async (req, res) => {
  const { doctorId, title, content, category } = req.body;
  try {
    const { data, error } = await supabase
      .from("doctor_posts")
      .insert([{ doctor_id: doctorId, title, content, category, is_published: true }])
      .select().single();
    if (error) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Post published!", postId: data.post_id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/doctor/patient/:patientId/moods", async (req, res) => {
  try {
    const { data } = await supabase
      .from("mood_logs").select("*")
      .eq("user_id", req.params.patientId)
      .order("log_date", { ascending: false }).limit(60);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== ADMIN ENDPOINTS (Protected) =====================

app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    const { data: doctors } = await supabase.from("doctors").select("*").order("created_at", { ascending: false });
    const { data: appointments } = await supabase.from("appointments").select("*");
    const { data: moods } = await supabase.from("mood_logs").select("*").order("log_date", { ascending: false }).limit(2000);
    const { data: journals } = await supabase.from("journal_entries").select("entry_id");

    const safeUsers = (users || []).map(u => { const { password, ...s } = u; return s; });
    const safeDocs = (doctors || []).map(d => { const { password, ...s } = d; return s; });

    res.json({
      stats: {
        totalUsers: safeUsers.length,
        activeUsers: safeUsers.filter(u => u.is_active).length,
        totalDoctors: safeDocs.length,
        activeDoctors: safeDocs.filter(d => d.is_active).length,
        totalAppointments: (appointments || []).length,
        pendingAppointments: (appointments || []).filter(a => a.status === "pending").length,
        totalMoodLogs: (moods || []).length,
        totalJournals: (journals || []).length
      },
      users: safeUsers,
      doctors: safeDocs,
      recentMoods: moods || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Legacy admin endpoints
app.get("/admin/users", async (req, res) => {
  try {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    res.json((data || []).map(u => { const { password, ...s } = u; return s; }));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/admin/doctors", async (req, res) => {
  try {
    const { data } = await supabase.from("doctors").select("*").order("created_at", { ascending: false });
    res.json((data || []).map(d => { const { password, ...s } = d; return s; }));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/admin/toggleUserStatus", async (req, res) => {
  const { userId, isActive } = req.body;
  try {
    await supabase.from("users").update({ is_active: isActive }).eq("user_id", userId);
    res.json({ message: `User ${isActive ? "activated" : "deactivated"}!` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/admin/toggleDoctorStatus", async (req, res) => {
  const { doctorId, isActive } = req.body;
  try {
    await supabase.from("doctors").update({ is_active: isActive }).eq("doctor_id", doctorId);
    res.json({ message: `Doctor ${isActive ? "activated" : "deactivated"}!` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/admin/addDoctor", async (req, res) => {
  const { name, email, password, specialty, bio, experience_years } = req.body;
  try {
    const { data, error } = await supabase
      .from("doctors")
      .insert([{ name, email, password: password || "doctor123", specialty, bio, experience_years }])
      .select().single();
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: "Doctor added!", doctorId: data.doctor_id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/admin/deleteUser/:id", async (req, res) => {
  try {
    await supabase.from("users").delete().eq("user_id", req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Questionnaire: Save answers and analyze with AI
app.post("/api/questionnaire/submit", async (req, res) => {
  const { userId, answers } = req.body;
  if (!userId || !answers) return res.status(400).json({ message: "Missing data" });
  try {
    // Mark questionnaire as completed
    await supabase.from("users").update({ questionnaire_completed: true }).eq("user_id", userId);

    // Analyze with Gemini AI
    const aiResult = await analyzeQuestionnaire(answers);
    let analysis = null;
    if (aiResult) {
      try {
        const cleaned = aiResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysis = JSON.parse(cleaned);
      } catch (e) {
        analysis = { summary: aiResult, overallScore: 50, category: "Assessment Complete" };
      }
    }

    res.json({ message: "Questionnaire submitted!", analysis });
  } catch (err) {
    console.error("Questionnaire error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// AI content generation
app.post("/ai/generateContent", async (req, res) => {
  try {
    const content = await generateTherapyContent(req.body.topic);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: "AI generation failed" });
  }
});

// Settings
app.post("/updateSettings", async (req, res) => {
  const { userId, settings } = req.body;
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() })
      .select().single();
    if (error) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Settings updated!", settings: data });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getSettings/:id", async (req, res) => {
  try {
    const { data } = await supabase
      .from("user_settings").select("*").eq("user_id", req.params.id).single();
    res.json(data || { theme: "default", sound_enabled: true, voice_enabled: true, color_scheme: "light" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Test endpoint
app.get("/test/db", async (req, res) => {
  try {
    const { data: admins } = await supabase.from("admins").select("admin_id, email, name");
    const { data: users } = await supabase.from("users").select("user_id, email, name");
    const { data: doctors } = await supabase.from("doctors").select("doctor_id, email, name");
    res.json({ success: true, admins: admins || [], users: users || [], doctors: doctors || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve index.html for root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n  ✅ Soul-Sync Server running at http://localhost:${PORT}`);
    console.log(`  📦 Database: Supabase`);
    console.log(`  🤖 AI: Gemini API\n`);
  });
}

// Export for Vercel serverless
module.exports = app;
