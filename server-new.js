require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supabase = require("./config/supabase");
const { analyzeMoodTrend, generateTherapyContent } = require("./config/gemini");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS, images, etc.)
app.use(express.static(__dirname));

// ===================== AUTHENTICATION & USER MANAGEMENT =====================

// Role-based Login (auto-detects if role not provided)
app.post("/login", async (req, res) => {
  const { email, role } = req.body;

  try {
    let userData = null;
    let userRole = role;
    let userId = null;

    // If role is specified, check that table
    if (role) {
      let table;
      if (role === 'admin') table = 'admins';
      else if (role === 'doctor') table = 'doctors';
      else table = 'users';

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('email', email)
        .single();

      if (data) {
        userData = data;
        userId = data[table === 'admins' ? 'admin_id' : table === 'doctors' ? 'doctor_id' : 'user_id'];
      }
    } else {
      // Auto-detect: check all tables
      // Check admins first
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();
      
      if (adminData) {
        userData = adminData;
        userRole = 'admin';
        userId = adminData.admin_id;
      } else {
        // Check doctors
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('*')
          .eq('email', email)
          .single();
        
        if (doctorData) {
          userData = doctorData;
          userRole = 'doctor';
          userId = doctorData.doctor_id;
        } else {
          // Check users (patients)
          const { data: patientData } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
          
          if (patientData) {
            userData = patientData;
            userRole = 'patient';
            userId = patientData.user_id;
          }
        }
      }
    }

    if (!userData) {
      return res.status(404).json({
        message: "User not found. Please check your email or sign up.",
      });
    }

    res.status(200).json({
      message: "User found",
      userId: userId,
      role: userRole,
      user: userData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
});

// Get User Details
app.get("/getUserDetails/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Add User (Signup)
app.post("/addUser", async (req, res) => {
  const { name, email, age, phone, gender } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        { email, name, age, phone_number: phone, gender, role: 'patient' }
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      message: "User added successfully!",
      userId: data.user_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update User
app.post("/updateUser", async (req, res) => {
  const { userId, name, email, phone, age, gender } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name, email, age, gender, phone_number: phone })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      message: "User updated successfully!",
      userId: data.user_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================== MOOD TRACKING =====================

// Get User Moods
app.get("/getUserMoods/:id", async (req, res) => {
  const userId = req.params.id;
  const logDate = new Date().toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', logDate);

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No mood logs" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Mood History for Trend Analysis
app.get("/getMoodHistory/:id", async (req, res) => {
  const userId = req.params.id;
  const days = req.query.days || 30;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add/Update Mood (supports multiple moods per hour)
app.post("/addMood", async (req, res) => {
  const { userId, logDate, logHour, moods } = req.body;

  try {
    // Delete existing moods for this hour
    await supabase
      .from('mood_logs')
      .delete()
      .eq('user_id', userId)
      .eq('log_date', logDate)
      .eq('log_hour', logHour);

    // Insert new moods
    const moodEntries = moods.map(mood => ({
      user_id: userId,
      log_date: logDate,
      log_hour: logHour,
      mood_type: mood
    }));

    const { data, error } = await supabase
      .from('mood_logs')
      .insert(moodEntries)
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      message: "Moods added successfully!",
      userId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// AI Mood Analysis
app.post("/analyzeMood/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(100);

    if (error || !data) {
      return res.status(500).json({ error: "Database error" });
    }

    const analysis = await analyzeMoodTrend(data);
    
    res.status(200).json({
      analysis,
      needsProfessionalHelp: analysis.includes('YES')
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== JOURNAL ENTRIES =====================

// Add Journal Entry
app.post("/addJournalEntry", async (req, res) => {
  const { userId, date, text, title, mood } = req.body;

  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([
        { user_id: userId, entry_date: date, content: text, title, mood }
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      message: "Journal Entry added successfully!",
      entryId: data.entry_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Journal Entries
app.get("/getJournalEntries/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== DOCTOR MANAGEMENT =====================

// Get All Doctors
app.get("/getDoctors", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Doctor Details
app.get("/getDoctorDetails/:id", async (req, res) => {
  const doctorId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('doctor_id', doctorId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Book Appointment
app.post("/bookAppointment", async (req, res) => {
  const { userId, doctorId, appointmentDate, notes } = req.body;

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          user_id: userId,
          doctor_id: doctorId,
          appointment_date: appointmentDate,
          notes,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      message: "Appointment booked successfully!",
      appointmentId: data.appointment_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Appointments
app.get("/getAppointments/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors (name, specialty, profile_image)
      `)
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== DOCTOR CONTENT =====================

// Get Doctor Posts
app.get("/getDoctorPosts", async (req, res) => {
  const limit = req.query.limit || 20;

  try {
    const { data, error } = await supabase
      .from('doctor_posts')
      .select(`
        *,
        doctors (name, specialty, profile_image)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Like Doctor Post
app.post("/likePost", async (req, res) => {
  const { userId, postId } = req.body;

  try {
    const { data, error } = await supabase
      .from('post_likes')
      .insert([{ user_id: userId, post_id: postId }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({ message: "Post liked successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================== ART THERAPY =====================

// Save Art Creation
app.post("/saveArt", async (req, res) => {
  const { userId, artType, artData } = req.body;

  try {
    const { data, error } = await supabase
      .from('art_creations')
      .insert([
        { user_id: userId, art_type: artType, art_data: artData }
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      message: "Art saved successfully!",
      artId: data.art_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Art
app.get("/getUserArt/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('art_creations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== ADMIN FUNCTIONS =====================

// Get All Users
app.get("/admin/users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get All Doctors (Admin)
app.get("/admin/doctors", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Toggle User Status
app.post("/admin/toggleUserStatus", async (req, res) => {
  const { userId, isActive } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully!`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================== DOCTOR DASHBOARD FUNCTIONS =====================

// Get Doctor Patients
app.get("/doctor/patients/:doctorId", async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        users (user_id, name, email, age, gender)
      `)
      .eq('doctor_id', doctorId)
      .eq('status', 'confirmed');

    if (error) {
      return res.status(500).json({ error: "Database error" });
    }

    // Extract unique patients
    const patients = data?.map(apt => apt.users).filter((user, index, self) =>
      index === self.findIndex(u => u.user_id === user.user_id)
    ) || [];

    res.status(200).json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create Doctor Post
app.post("/doctor/createPost", async (req, res) => {
  const { doctorId, title, content, category, tags } = req.body;

  try {
    const { data, error } = await supabase
      .from('doctor_posts')
      .insert([
        {
          doctor_id: doctorId,
          title,
          content,
          category,
          tags,
          is_published: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      message: "Post created successfully!",
      postId: data.post_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================== AI-POWERED FEATURES =====================

// Generate Therapy Content
app.post("/ai/generateContent", async (req, res) => {
  const { topic } = req.body;

  try {
    const content = await generateTherapyContent(topic);
    res.status(200).json({ content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

// ===================== USER SETTINGS =====================

// Update User Settings
app.post("/updateSettings", async (req, res) => {
  const { userId, settings } = req.body;

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      message: "Settings updated successfully!",
      settings: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Settings
app.get("/getSettings/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(data || {
      theme: 'default',
      soundEnabled: true,
      voiceEnabled: true,
      colorScheme: 'light'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== TEST ENDPOINTS =====================

// Test database connection
app.get("/test/db", async (req, res) => {
  try {
    const { data: admins, error: adminError } = await supabase.from('admins').select('*');
    const { data: users, error: userError } = await supabase.from('users').select('*');
    const { data: doctors, error: doctorError } = await supabase.from('doctors').select('*');
    
    res.json({
      success: true,
      admins: { count: admins?.length || 0, data: admins, error: adminError },
      users: { count: users?.length || 0, data: users, error: userError },
      doctors: { count: doctors?.length || 0, data: doctors, error: doctorError }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
  console.log(`📦 Database: Supabase`);
  console.log(`🤖 AI: Gemini API`);
});
