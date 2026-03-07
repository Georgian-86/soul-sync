# Mind Tracker - Complete Project Documentation

## 🎯 Project Overview

Mind Tracker is a comprehensive mental health and wellness application designed to help users monitor their emotional well-being, connect with mental health professionals, and access therapeutic resources.

### Key Features

#### For Patients:
- ✅ **Mood Tracking**: Track multiple moods per hour with visual calendar
- ✅ **AI-Powered Mood Analysis**: Gemini AI analyzes patterns and suggests interventions
- ✅ **Journal Entries**: Save thoughts with mood tags and themes
- ✅ **Art Therapy**: Drawing canvas and coloring tools with save functionality
- ✅ **Music Therapy**: Curated relaxation playlists with themes
- ✅ **Stress Relief Games**: Multiple games (Bubble Pop, Breathing, Memory Match)
- ✅ **Doctor Discovery**: Browse and book appointments with therapists
- ✅ **Personalized Recommendations**: Based on mood trends
- ✅ **Voice Instructions**: Text-to-speech guidance on every page
- ✅ **Customizable Themes**: Multiple color schemes and soundscapes
- ✅ **Profile Management**: History, settings, liked content

#### For Doctors:
- ✅ **Patient Dashboard**: View registered patients
- ✅ **Create Content**: Post articles, exercises, and tips
- ✅ **Professional Profile**: Showcase credentials and success stories
- ✅ **Appointment Management**: View and manage bookings
- ✅ **Analytics**: Track engagement with posted content

#### For Admins:
- ✅ **User Management**: View, activate/deactivate users
- ✅ **Doctor Management**: Manage doctor accounts
- ✅ **System Analytics**: Usage statistics and metrics
- ✅ **Content Moderation**: Monitor system activity

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design with gradient themes
- Speech Synthesis API for voice instructions

**Backend:**
- Node.js with Express.js
- RESTful API architecture
- Environment-based configuration

**Database:**
- Supabase (PostgreSQL)
- Row-level security
- Real-time capabilities

**AI Integration:**
- Google Gemini API for mood analysis
- Content generation for therapy tips

---

## 📦 Installation Guide

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Google Gemini API key

### Step 1: Install Dependencies

```bash
cd "c:\Users\golu kumar\Desktop\Docker\Mind_Tracker-main\Mind_Tracker-main"
npm install
```

### Step 2: Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `Database/supabase_schema.sql` in the SQL Editor
3. Copy your project URL and API keys

### Step 3: Get Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
NODE_ENV=development
```

### Step 5: Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

---

## 📊 Database Schema

### Core Tables:

1. **users** - Patient accounts
2. **doctors** - Doctor profiles
3. **admins** - Admin accounts
4. **mood_logs** - Hourly mood tracking
5. **journal_entries** - User journal posts
6. **art_creations** - Saved artwork
7. **appointments** - Doctor bookings
8. **doctor_posts** - Educational content
9. **user_settings** - Preferences and themes
10. **games** - Available games
11. **post_likes** - Content engagement

---

## 🔐 Role-Based Access Control

### Login Flow:
1. User selects role (Patient/Doctor/Admin)
2. Enters email
3. System validates against respective table
4. Redirects to role-specific dashboard

### Access Levels:
- **Patients**: Full access to wellness features
- **Doctors**: Patient viewing, content creation
- **Admins**: Full system management

---

## 🎨 New Features Implemented

### 1. Multi-Mood Selection
- Users can select multiple moods per hour
- Calendar shows average mood when 3+ moods logged
- Enhanced mood trend visualization

### 2. AI Mood Analysis
Endpoint: `POST /analyzeMood/:userId`
- Analyzes 30-day mood history
- Identifies patterns and concerns
- Recommends professional help when needed
- Suggests coping strategies

### 3. Voice Instructions
- Toggle on/off on every page
- Guides users through forms and actions
- Preference saved in localStorage

### 4. Doctor Discovery Portal
Endpoint: `GET /getDoctors`
- Browse doctors by specialty
- View ratings and experience
- Read professional bios
- Book appointments

### 5. Enhanced Art Therapy
- Multiple modes: Drawing, Coloring, Mandala
- Save creations to gallery
- Export artwork
- Themed color palettes

### 6. Professional Themes
- Multiple color schemes
- Sound preferences
- Voice toggle
- Accessibility options

### 7. Doctor Content Platform
- Doctors post tips and exercises
- Users can like and save content
- Categories: Stress, Anxiety, Depression, etc.
- AI-generated content suggestions

---

## 🚀 API Endpoints

### Authentication
- `POST /login` - Role-based login
- `POST /addUser` - Patient signup
- `GET /getUserDetails/:id` - User profile

### Mood Tracking
- `POST /addMood` - Log mood(s)
- `GET /getUserMoods/:id` - Today's moods
- `GET /getMoodHistory/:id` - Historical data
- `POST /analyzeMood/:id` - AI analysis

### Journal
- `POST /addJournalEntry` - Create entry
- `GET /getJournalEntries/:id` - User entries

### Doctors
- `GET /getDoctors` - List all doctors
- `GET /getDoctorDetails/:id` - Doctor profile
- `POST /bookAppointment` - Book session
- `GET /getAppointments/:id` - User appointments

### Doctor Portal
- `GET /doctor/patients/:doctorId` - Patient list
- `POST /doctor/createPost` - Publish content
- `GET /getDoctorPosts` - All posts

### Art Therapy
- `POST /saveArt` - Save creation
- `GET /getUserArt/:id` - User gallery

### Admin
- `GET /admin/users` - All patients
- `GET /admin/doctors` - All doctors
- `POST /admin/toggleUserStatus` - Activate/deactivate

### AI Features
- `POST /ai/generateContent` - Generate therapy content

### Settings
- `POST /updateSettings` - Update preferences
- `GET /getSettings/:id` - Load preferences

---

## 📱 File Structure

```
Mind_Tracker-main/
├── config/
│   ├── supabase.js          # Supabase client configuration
│   └── gemini.js            # Gemini AI integration
├── Database/
│   ├── supabase_schema.sql  # Database schema
│   └── All_Tables_Creation.sql (legacy)
├── node_modules/
├── .env                      # Environment variables (create this)
├── .env.example             # Environment template
├── server-new.js            # Enhanced backend server
├── package.json             # Dependencies
├── index.html               # Landing page
├── login-new.html           # Role-based login
├── signup.html              # Patient signup
├── questionnaire-info.html  # Pre-questionnaire info
├── questionnaire.html       # Mental health assessment
├── dashboard.html           # Patient dashboard (to enhance)
├── admin-dashboard.html     # Admin control panel
├── doctor-dashboard.html    # Doctor portal (to create)
├── journal.html             # Journal entries
├── art.html                 # Art therapy
├── music.html               # Music therapy
├── game.html                # Stress relief games
├── profile.html             # User profile
└── style.css                # Global styles
```

---

## 🎯 Remaining Tasks

### Critical Implementation Needed:

1. **Doctor Dashboard** (Next Step)
   - Patient list view
   - Appointment calendar
   - Content creation interface
   - Profile management

2. **Enhanced Patient Dashboard**
   - Multiple mood selection UI
   - AI analysis display
   - Doctor cards with booking
   - Reminder system

3. **Additional Games**
   - Breathing exercise game
   - Memory match game
   - Puzzle games

4. **Profile Enhancements**
   - Journal history
   - Art gallery
   - Liked content section
   - Doctor consultation history
   - Settings panel (theme, sound, voice)

5. **Doctor Appointment System**
   - Calendar integration
   - Time slot selection
   - Confirmation emails

6. **Testing**
   - API endpoint testing
   - UI/UX testing
   - Accessibility testing
   - Performance optimization

---

## 🔧 Configuration Notes

### Supabase Setup:
- Enable Row Level Security (RLS)
- Configure authentication if using Supabase Auth
- Set up storage buckets for art/images

### Gemini API:
- Free tier: 60 requests/minute
- Consider caching analysis results
- Implement rate limiting

### Security:
- Use HTTPS in production
- Implement proper authentication
- Sanitize user inputs
- Enable CORS properly

---

## 📝 Usage Guide

### For Patients:
1. Sign up with email and basic info
2. Complete mental health questionnaire
3. Access dashboard to log moods
4. Explore therapy tools (journal, art, music)
5. Browse and book doctors
6. View AI-powered insights

### For Doctors:
1. Admin creates doctor account
2. Complete professional profile
3. View patient list
4. Create educational content
5. Manage appointments

### For Admins:
1. Login with admin credentials
2. Monitor user activity
3. Manage user/doctor accounts
4. View system analytics

---

## 🐛 Troubleshooting

### Common Issues:

**Server won't start:**
- Check .env file exists and has correct values
- Ensure port 3000 is not in use
- Verify all dependencies are installed

**Database connection fails:**
- Verify Supabase URL and keys
- Check internet connection
- Ensure SQL schema was executed

**AI features not working:**
- Verify Gemini API key
- Check API quota limits
- Review console for error messages

---

## 🎓 Project for Academic Presentation

### Viva Questions & Answers:

**Q: What is the main objective?**
A: To provide a comprehensive digital platform for mental health tracking and professional support.

**Q: Why Supabase over MySQL?**
A: Better scalability, built-in auth, real-time features, and easier deployment.

**Q: How does AI help?**
A: Gemini analyzes mood patterns to identify concerning trends and recommend interventions.

**Q: What makes this different?**
A: Combines self-tracking, professional support, therapeutic activities, and AI insights in one platform.

**Q: Future enhancements?**
A: Mobile app, video consultations, group therapy, crisis hotline integration.

---

## 📄 License

Educational project for academic purposes.

---

## 👥 Contributors

Developed as a Computer Science project demonstrating full-stack development, database design, API integration, and UI/UX principles.

---

## 📞 Support

For issues or questions related to setup, refer to:
- Supabase docs: https://supabase.com/docs
- Express.js docs: https://expressjs.com
- Gemini API docs: https://ai.google.dev/docs

---

**Last Updated:** March 6, 2026
**Status:** Development Phase - Core features implemented, enhancements in progress
