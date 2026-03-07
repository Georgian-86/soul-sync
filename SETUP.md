# 🚀 Quick Setup Guide for Mind Tracker

## ⚡ Fastest Way to Get Started

### Step 1: Set Up Supabase (5 minutes)

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Wait for the project to initialize (~2 minutes)
4. Copy the following values (you'll need them soon):
   - **Project URL**: Found in Project Settings > API
   - **Anon Key**: Found in Project Settings > API > anon/public
   - **Service Role Key**: Found in Project Settings > API > service_role (keep this secret!)

5. Go to SQL Editor in Supabase
6. Copy and paste the entire contents of `Database/supabase_schema.sql`
7. Click "Run" to create all tables

### Step 2: Get Gemini API Key (2 minutes)

1. Visit [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 3: Configure Environment (1 minute)

1. Copy the `.env.example` file and rename it to `.env`
2. Open `.env` and fill in your values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

### Step 4: Install & Run (2 minutes)

```bash
# Open terminal in project folder
cd "c:\Users\golu kumar\Desktop\Docker\Mind_Tracker-main\Mind_Tracker-main"

# Dependencies are already installed, just start the server
npm start
```

Or use the new enhanced server:
```bash
node server-new.js
```

### Step 5: Access the Application

Open your browser and go to:
- **Main App**: [http://localhost:3000](http://localhost:3000)
- Use `index.html` as entry point

---

## 🔑 Test Logins

After running the SQL schema, you'll have these test accounts:

### Admin:
- Email: `admin@mindtracker.com`
- Role: Admin

### Doctors:
- Email: `dr.smith@mindtracker.com`
- Email: `dr.johnson@mindtracker.com`
- Role: Doctor

### Patient:
- Sign up yourself or use existing data from old database

---

## 🗂️ Key Files Changed/Created

### ✅ Created New Files:
1. `server-new.js` - Enhanced backend with Supabase
2. `config/supabase.js` - Database connection
3. `config/gemini.js` - AI integration
4. `Database/supabase_schema.sql` - New database schema
5. `login-new.html` - Role-based login
6. `questionnaire-info.html` - Pre-questionnaire page
7. `admin-dashboard.html` - Admin control panel
8. `.env.example` - Environment template
9. `README.md` - Full documentation
10. `SETUP.md` - This quick guide

### 📝 Modified Files:
1. `package.json` - Updated dependencies

### 🔄 Files to Replace:
- Use `login-new.html` instead of `login.html`
- Use `server-new.js` instead of `server.js`

---

## 📋 What's Implemented

✅ **Backend:**
- Supabase integration (replacing MySQL)
- 20+ new API endpoints
- Gemini AI mood analysis
- Role-based authentication
- Content management system

✅ **Frontend:**
- Role-based login (Patient/Doctor/Admin)
- Admin dashboard with user management
- Pre-questionnaire information page
- Voice instruction system
- Responsive design maintained

✅ **Database:**
- Complete Supabase schema
- 11 tables with relationships
- Sample data for testing
- Indexes for performance

---

## 🚧 Still To Implement

### High Priority:
1. **Doctor Dashboard** (`doctor-dashboard.html`) - Not yet created
2. **Enhanced Patient Dashboard** - Needs updates:
   - Multiple mood selection per hour
   - AI mood analysis display
   - Doctor browsing section
   - Appointment booking UI
3. **More Games** - Currently only Bubble Pop
4. **Enhanced Profile** - Settings, themes, history sections

### Medium Priority:
5. Art therapy save functionality
6. Music themes
7. Doctor content creation UI
8. Reminder system

### Low Priority:
9. Notification system
10. Export data feature
11. Mobile responsiveness optimization

---

## 🎯 Next Steps After Setup

1. **Create Doctor Dashboard**:
   - Copy `admin-dashboard.html` as template
   - Modify for doctor-specific features
   - Add patient list, appointments, content creation

2. **Enhance Patient Dashboard**:
   - Update mood selection to allow multiple moods
   - Add AI analysis section
   - Add doctor discovery cards
   - Add appointment history

3. **Add More Games**:
   - Breathing exercise
   - Memory match
   - Meditation timer

4. **Test Everything**:
   - Test each role's login
   - Test API endpoints with Postman
   - Test UI on different screen sizes

---

## 🐛 Troubleshooting

### Server won't start:
```bash
# Check if port 3000 is free
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process_id> /F

# Try different port in .env
PORT=3001
```

### Database errors:
- Verify .env file exists (not .env.example)
- Check Supabase project is running
- Verify SQL schema executed successfully
- Check browser console for errors

### API errors:
- Check Gemini API quota (60 requests/minute free)
- Verify API keys are correct
- Check browser Network tab for failed requests

---

## 📚 For Your Project Report/Viva

### Project Title:
**Mind Tracker - AI-Powered Mental Wellness Platform**

### Technologies Used:
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: Supabase (PostgreSQL)
- AI: Google Gemini API
- Architecture: REST API, Role-Based Access Control

### Key Features:
1. Multi-user system (Patients, Doctors, Admins)
2. AI-powered mood analysis
3. Comprehensive therapy tools
4. Professional consultation booking
5. Real-time data synchronization

### Achievements:
- Migrated from local MySQL to cloud Supabase
- Integrated AI for mental health insights
- Implemented role-based access control
- Created professional admin interface
- Added accessibility features (voice instructions)

### Future Scope:
- Mobile application (React Native)
- Video consultation feature
- Group therapy sessions
- Crisis intervention hotline
- Wearable device integration

---

## 💡 Tips for Demo

1. **Prepare Test Data**: Create sample patients, appointments, journal entries
2. **Start with Overview**: Show landing page, explain the need
3. **Role-Based Demo**: 
   - Login as patient → Show mood tracking → Journal → Games
   - Login as doctor → Show patient list → Create post
   - Login as admin → Show user management → Analytics
4. **Highlight AI**: Demonstrate mood analysis feature
5. **Show Accessibility**: Toggle voice instructions
6. **Discuss Architecture**: Show database schema, API structure

---

## 📞 Need Help?

### Documentation:
- Supabase: [https://supabase.com/docs](https://supabase.com/docs)
- Gemini API: [https://ai.google.dev/docs](https://ai.google.dev/docs)
- Express.js: [https://expressjs.com](https://expressjs.com)

### Common Resources:
- Stack Overflow for specific errors
- GitHub Issues for package problems
- Supabase Discord for database help

---

**Good Luck with Your Project! 🎓**

Remember: Focus on demonstrating the complete workflow and the value it provides to mental health management.
