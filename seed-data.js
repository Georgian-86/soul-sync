/**
 * Seed script to insert realistic mock data into Supabase
 * Run once: node seed-data.js
 */
require("dotenv").config();
const supabase = require("./config/supabase");

const MOODS = ["joyful", "happy", "calm", "neutral", "stressed", "sad", "angry", "tired"];

function randomMood() { return MOODS[Math.floor(Math.random() * MOODS.length)]; }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split("T")[0]; }

async function seed() {
  console.log("🌱 Seeding mock data...\n");

  // ── 1. Mock Patients ──
  const patients = [
    { name: "Ananya Sharma", email: "ananya.sharma@email.com", password: "patient123", age: 24, gender: "female", phone_number: "9876543210" },
    { name: "Rohan Mehta", email: "rohan.mehta@email.com", password: "patient123", age: 28, gender: "male", phone_number: "9876543211" },
    { name: "Priya Kapoor", email: "priya.kapoor@email.com", password: "patient123", age: 22, gender: "female", phone_number: "9876543212" },
    { name: "Arjun Verma", email: "arjun.verma@email.com", password: "patient123", age: 30, gender: "male", phone_number: "9876543213" },
    { name: "Sneha Reddy", email: "sneha.reddy@email.com", password: "patient123", age: 26, gender: "female", phone_number: "9876543214" },
  ];

  const { data: insertedPatients, error: pErr } = await supabase
    .from("users").upsert(patients, { onConflict: "email" }).select();
  if (pErr) { console.error("Patient insert error:", pErr.message); return; }
  console.log(`✅ ${insertedPatients.length} patients inserted/updated`);

  // ── 2. Mock Doctors ──
  const doctors = [
    { name: "Dr. Sarah Smith", email: "dr.sarah@email.com", password: "doctor123", specialty: "Clinical Psychology", experience_years: 10, rating: 4.8, is_active: true },
    { name: "Dr. Ramesh Gupta", email: "dr.ramesh@email.com", password: "doctor123", specialty: "Cognitive Behavioral Therapy", experience_years: 15, rating: 4.9, is_active: true },
    { name: "Dr. Neha Iyer", email: "dr.neha@email.com", password: "doctor123", specialty: "Child Psychology", experience_years: 8, rating: 4.7, is_active: true },
  ];

  const { data: insertedDoctors, error: dErr } = await supabase
    .from("doctors").upsert(doctors, { onConflict: "email" }).select();
  if (dErr) { console.error("Doctor insert error:", dErr.message); return; }
  console.log(`✅ ${insertedDoctors.length} doctors inserted/updated`);

  // ── 3. Mock Admin ──
  const { error: aErr } = await supabase
    .from("admins").upsert([{ name: "Admin User", email: "admin@mindtracker.com", password: "admin123" }], { onConflict: "email" });
  if (aErr) console.error("Admin insert error:", aErr.message);
  else console.log("✅ Admin inserted/updated");

  // ── 4. Mood Logs (last 14 days for each patient) ──
  const moodEntries = [];
  for (const patient of insertedPatients) {
    for (let day = 0; day < 14; day++) {
      const logDate = daysAgo(day);
      // 3-6 mood entries per day at random hours
      const numMoods = 3 + Math.floor(Math.random() * 4);
      const usedHours = new Set();
      for (let m = 0; m < numMoods; m++) {
        let hour;
        do { hour = 6 + Math.floor(Math.random() * 18); } while (usedHours.has(hour));
        usedHours.add(hour);
        moodEntries.push({
          user_id: patient.user_id,
          log_date: logDate,
          log_hour: hour,
          mood_type: randomMood()
        });
      }
    }
  }

  // Insert in batches of 200
  for (let i = 0; i < moodEntries.length; i += 200) {
    const batch = moodEntries.slice(i, i + 200);
    const { error } = await supabase.from("mood_logs").insert(batch);
    if (error) { console.error(`Mood batch ${i} error:`, error.message); }
  }
  console.log(`✅ ${moodEntries.length} mood logs inserted`);

  // ── 5. Journal Entries ──
  const journalTexts = [
    { title: "A Good Start to the Week", mood: "happy", content: "Today was a productive day. I managed to complete my morning routine, went for a 30-minute walk, and felt genuinely positive. The weather was beautiful and I noticed the small things — birds chirping, flowers blooming. I want to hold onto this feeling." },
    { title: "Feeling Overwhelmed", mood: "stressed", content: "Work has been incredibly demanding lately. I have three deadlines this week and I'm struggling to keep up. I feel the pressure building in my chest. I need to remember to take breaks and breathe. Maybe I should try the breathing exercises Dr. Smith recommended." },
    { title: "Reflecting on Gratitude", mood: "calm", content: "Spent some quiet time this evening just reflecting. I'm grateful for my family, my health, and the small moments of peace I get. Journaling helps me process my thoughts. I realize I often focus on negatives, so today I'm choosing gratitude." },
    { title: "Difficult Conversation", mood: "sad", content: "Had a difficult conversation with a close friend today. We've been growing apart and it hurts to acknowledge that. I know people change, but the grief of losing closeness with someone you care about is real. I cried a little, and that's okay." },
    { title: "New Hobby Discovery", mood: "happy", content: "Started learning watercolor painting today! It was so relaxing. The colors blending on paper felt therapeutic. I wasn't trying to create a masterpiece — just letting the brush flow. Art therapy is really something. I painted a simple sunset and I love it." },
    { title: "Anxiety Before the Exam", mood: "anxious", content: "My exam is tomorrow and I can't stop the racing thoughts. What if I forget everything? What if I fail? I know these are just thoughts, not reality. I've studied well. I need to trust my preparation and get some rest tonight." },
    { title: "Weekend Reset", mood: "calm", content: "Spent the weekend doing absolutely nothing productive and it felt amazing. Sometimes we need permission to just exist without being productive. Read a book, made tea, listened to rain sounds. My mind feels clearer now." },
    { title: "Morning Meditation", mood: "calm", content: "Woke up early and meditated for 20 minutes. I used the guided meditation from the app and focused on body scan. Noticed tension in my shoulders that I hadn't been aware of. After the session, I felt lighter and more centered." },
    { title: "Family Dinner", mood: "happy", content: "Had a wonderful family dinner tonight. Mom made everyone's favorite dishes. We talked, laughed, and reminisced about old memories. These moments remind me what truly matters. I feel loved and connected." },
    { title: "Dealing with Insomnia", mood: "tired", content: "Another night of poor sleep. My mind just won't shut off. I keep replaying conversations and worrying about tomorrow. I've been tracking my sleep and it's clear the pattern is getting worse. Going to discuss this with my therapist next session." },
  ];

  const journalEntries = [];
  for (let pi = 0; pi < insertedPatients.length; pi++) {
    const patient = insertedPatients[pi];
    for (let i = 0; i < 4; i++) {
      const jt = journalTexts[(pi * 4 + i) % journalTexts.length];
      journalEntries.push({
        user_id: patient.user_id,
        entry_date: daysAgo(i * 2),
        title: jt.title,
        mood: jt.mood,
        content: jt.content
      });
    }
  }

  const { error: jErr } = await supabase.from("journal_entries").insert(journalEntries);
  if (jErr) console.error("Journal insert error:", jErr.message);
  else console.log(`✅ ${journalEntries.length} journal entries inserted`);

  // ── 6. Fetch ALL doctors (seeded + pre-existing) ──
  const { data: allDoctors, error: allDocErr } = await supabase
    .from("doctors").select("doctor_id, name, email").eq("is_active", true);
  if (allDocErr) { console.error("Fetch all doctors error:", allDocErr.message); return; }
  console.log(`📋 Found ${allDoctors.length} active doctors total`);

  // ── 7. Appointments — spread across ALL doctors ──
  const appointments = [];
  for (let i = 0; i < insertedPatients.length; i++) {
    const patient = insertedPatients[i];
    const doctor = allDoctors[i % allDoctors.length];
    appointments.push({
      user_id: patient.user_id,
      doctor_id: doctor.doctor_id,
      appointment_date: daysAgo(-3 - i), // future dates
      status: i === 0 ? "pending" : (i === 1 ? "confirmed" : "pending"),
      notes: `Initial consultation session. Patient reports ${["anxiety", "stress management needs", "sleep difficulties", "mood fluctuations", "general wellness check"][i % 5]}.`
    });
  }

  // Past appointments — give each doctor some
  for (let di = 0; di < allDoctors.length; di++) {
    for (let i = 0; i < 3; i++) {
      appointments.push({
        user_id: insertedPatients[i % insertedPatients.length].user_id,
        doctor_id: allDoctors[di].doctor_id,
        appointment_date: daysAgo(7 + i * 3 + di * 2),
        status: "confirmed",
        notes: "Follow-up session. Discussed coping strategies and progress."
      });
    }
  }

  const { error: apErr } = await supabase.from("appointments").insert(appointments);
  if (apErr) console.error("Appointment insert error:", apErr.message);
  else console.log(`✅ ${appointments.length} appointments inserted`);

  // ── 8. Doctor Posts — every doctor gets at least one ──
  const posts = [
    { title: "5 Mindfulness Techniques for Daily Life", category: "wellness", content: "Mindfulness doesn't require hours of meditation. Here are five simple techniques you can practice daily: 1) Mindful breathing for 2 minutes, 2) Body scan while waiting in line, 3) Mindful eating — savoring each bite, 4) Gratitude journaling before bed, 5) Walking meditation during your commute. Start with just one and build from there." },
    { title: "Understanding Anxiety: A Guide", category: "mental-health", content: "Anxiety is your body's natural response to stress. It becomes a disorder when it's persistent and interferes with daily life. Common symptoms include racing heart, excessive worry, difficulty concentrating, and sleep problems. Remember: anxiety is treatable. Cognitive behavioral therapy (CBT) and mindfulness-based interventions have shown excellent results." },
    { title: "The Power of Sleep Hygiene", category: "tips", content: "Good sleep starts hours before bedtime. Here are proven tips: Maintain a consistent schedule, avoid screens 1 hour before bed, keep your room cool and dark, limit caffeine after noon, try progressive muscle relaxation, and write down tomorrow's worries before bed so your mind can rest." },
    { title: "Managing Work-Life Balance", category: "wellness", content: "In today's fast-paced world, maintaining a healthy work-life balance is crucial for mental health. Set clear boundaries between work and personal time. Practice saying no to overtime when possible. Schedule regular breaks and use them for mindful activities. Remember: rest is productive too." },
    { title: "Building Emotional Resilience", category: "mental-health", content: "Emotional resilience is your ability to adapt and bounce back from adversity. Build it by practicing self-compassion, maintaining social connections, developing problem-solving skills, and accepting that change is part of life. Small daily habits compound into significant emotional strength over time." },
  ];

  for (let i = 0; i < allDoctors.length; i++) {
    const post = posts[i % posts.length];
    const { error } = await supabase.from("doctor_posts").insert({
      doctor_id: allDoctors[i].doctor_id,
      ...post
    });
    if (error) console.error(`Post ${i} error:`, error.message);
  }
  console.log(`✅ ${Math.min(allDoctors.length, posts.length)} doctor posts inserted (one per doctor)`);

  console.log("\n🎉 Seed complete! Mock data is ready.");
  console.log("\n📋 Login credentials:");
  console.log("   Patients: ananya.sharma@email.com / patient123");
  console.log("   Doctor:   dr.sarah@email.com / doctor123");
  console.log("   Admin:    admin@mindtracker.com / admin123");
}

seed().catch(console.error);
