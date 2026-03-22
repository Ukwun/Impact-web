# ImpactApp Web Platform

A full-stack digital platform for the NCDF ImpactKnowledge ecosystem - enabling financial literacy, entrepreneurship education, and professional networking across Nigeria.

## 🎯 Project Status: MVP Phase (70% Complete)

**Last Updated:** March 6, 2024
- ✅ UI/UX Design System (100%)
- ✅ Authentication System (95% - real database integration)
- ✅ Role-Based Dashboards (100% - all 7 roles)
- ✅ LMS Components (80% - UI complete, API routes ready)
- ✅ Database Design (100% - Prisma schema)
- 🔄 API Integration (60% - routes created, component wiring in progress)
- ⏳ File Upload (0% - queued)
- ⏳ Email Service (0% - queued)

## ✨ Key Features

- 🎓 **Learning Management System (LMS)**
  - Video lesson player with transcript and materials
  - Interactive quizzes (MCQ, True/False, Short Answer)
  - Assignment submission with file upload
  - Progress tracking and completion tracking

- � **Payment Processing** ✨ NEW
  - Flutterwave integration (cards, mobile money)
  - Bank transfer support
  - Secure payment verification
  - Webhook handling for Flutterwave

- �👥 **Role-Based Dashboards**
  - Student: Learning progress, courses, assignments
  - Facilitator: Class management, student progress, grading
  - Parent: Child's learning overview and alerts
  - Mentor: Mentee tracking and session management
  - School Admin: Institutional analytics and oversight
  - Professional (Circle): Networking and opportunities
  - Platform Admin: System-wide analytics

- 📅 **Events Management**
  - Event creation and management
  - Registration tracking
  - Attendance management
  - National, State, School, and Circle events

- 💼 **Professional Network (ImpactCircle)**
  - Connection management
  - Social feed
  - Job/opportunity board
  - Professional community

- 🏆 **Certificates & Achievements**
  - Automatic certificate generation on course completion
  - Achievement badges
  - QR code verification
  - Shareable credentials

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or pnpm

### Setup (5 steps)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Setup Prisma packages
npm install -D prisma @prisma/client ts-node

# 3. Configure .env.local (template provided)
cp .env.example .env.local
# Edit DATABASE_URL and JWT_SECRET

# 4. Initialize database
npm run db:push
npm run db:seed

# 5. Start development server
npm run dev
```

**Demo Credentials:**
- Email: `student@example.com`
- Password: `Test@1234`

Visit `http://localhost:3000`

> 📚 **Full Setup Guide:** See [SETUP.md](SETUP.md) for detailed instructions

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── auth/              # Auth pages
├── components/            # React components
│   ├── dashboard/         # 7 role-specific dashboards
│   ├── lms/              # LessonPlayer, QuizComponent, AssignmentComponent
│   ├── sections/         # Page sections
│   └── ui/               # Reusable UI components
├── context/              # Zustand state management
├── lib/                  # Utilities
│   ├── auth.ts          # JWT & password helpers
│   └── prisma.ts        # Prisma client
├── types/               # TypeScript definitions
└── styles/              # Global CSS
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Hook Form + Zod
- Lucide React (icons)

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs (password hashing)

**Deployment Ready:**
- Vercel (recommended)
- Docker support planned
- Environment-based configuration

## 📊 Database Schema

20+ models supporting:
- User management (8 roles)
- Courses, Modules, Lessons
- Quizzes, Assignments, Submissions
- Enrollments, Progress tracking
- Grades, Certificates
- Events, Registrations
- Mentoring sessions, Notifications

> 📋 View full schema in [prisma/schema.prisma](prisma/schema.prisma)

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Protected API routes
- ✅ Input validation
- ✅ SQL injection prevention (Prisma)
- ✅ Secure session management
- 🔄 CORS configuration (in progress)
- 🔄 Rate limiting (planned)

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/login
POST /api/auth/register
```

### Learning
```bash
GET  /api/courses
GET  /api/lessons/[id]
GET  /api/quizzes/[id]
POST /api/quizzes/[id]            # Submit quiz
GET  /api/assignments/[id]
POST /api/assignments/[id]        # Submit assignment
```

### Progress
```bash
GET /api/progress                 # User progress & enrollments
```

> 📖 Full API docs in [SETUP.md](SETUP.md#-api-documentation)

## 🎓 Available Dashboards

| Role | Features | Status |
|------|----------|--------|
| Student | Course progress, assignments, goals | ✅ Complete |
| Facilitator | Classes, student progress, grading | ✅ Complete |
| Parent | Child progress, alerts, metrics | ✅ Complete |
| Mentor | Mentee tracking, sessions | ✅ Complete |
| School Admin | Institutional analytics, users | ✅ Complete |
| Circle Member | Networking, opportunities | ✅ Complete |
| Admin | Platform analytics, system management | ✅ Complete |

## 🧪 Testing Quick Commands

```bash
# Start server
npm run dev

# Check types
npm run type-check

# Format code
npm run format

# Lint
npm run lint

# Database
npm run db:studio         # Prisma Studio (visual browser)
npm run db:reset         # Reset database (⚠️ destructive)
npm run db:seed          # Seed sample data
```

## 🚦 Development Workflow

1. **Create schema changes** → `schema.prisma`
2. **Create migration** → `npm run db:migrate`
3. **Implement feature** → Components + API routes
4. **Test locally** → `npm run dev`
5. **Run type check** → `npm run type-check`
6. **Format code** → `npm run format`
7. **Commit** → Ready for PR

## 📈 Roadmap

### Phase 1: MVP (Current - 75%)
- [x] Authentication system
- [x] All 7 role dashboards
- [x] Forgot-password & reset-password pages
- [x] Payment processing (Flutterwave & Bank Transfer) ✨ NEW
- [x] Payment UI and forms ✨ NEW
- [x] Leaderboard & achievements placeholder
- [ ] Sentry error monitoring (configure NEXT_PUBLIC_SENTRY_DSN)
- [x] LMS UI components
- [x] API routes for LMS
- [x] Database schema & seeding
- [ ] File upload to cloud
- [ ] Email notifications
- [ ] Load testing execution

### Phase 2: Enhancement (Next 4 weeks)
- [ ] Quiz & assignment grading
- [ ] Certificate generation
- [ ] Analytics improvements
- [ ] Event management backend
- [ ] Mobile responsive optimization
- [ ] Webhook verification for payments

### Phase 3: Advanced (8+ weeks)
- [ ] Mobile app (React Native)
- [ ] Advanced search & recommendations
- [ ] Recurring payments/subscriptions
- [ ] Venture Lab module
- [ ] Safeguarding tools


## 🤝 Contributing

1. Create a feature branch
2. Make changes with type safety
3. Run `npm run type-check && npm run format`
4. Test thoroughly
5. Submit PR with description

## 📞 Support

For issues or questions:
1. Check [SETUP.md](SETUP.md#-troubleshooting) troubleshooting
2. Review existing issues
3. Open a new issue with details

## 📄 License

Proprietary - NCDF ImpactKnowledge

---

**Made with ❤️ for educational impact across Nigeria**
