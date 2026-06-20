# 🔥 Habit Forge

> **AI-Powered Habit Tracking & Formation** — Build better habits, break bad ones, and transform your life with intelligent tracking, insights, and personalized recommendations.

**First Version Released:** January 20, 2026 🎉

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [💡 How It Works](#-how-it-works)
- [🏗️ Architecture](#-architecture)
- [🛠️ Development](#-development)
- [⚙️ Configuration](#-configuration)
- [📊 Data Models](#-data-models)
- [🧪 Testing](#-testing)
- [🔒 Security](#-security)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎯 Core Functionality

- **✅ Daily Habit Tracking** - Log habits and track streaks
- **📊 Visual Progress** - Charts and graphs showing your progress
- **🎯 Smart Reminders** - Customizable notifications and alerts
- **📈 Analytics Dashboard** - Deep insights into your habits
- **🏆 Streak Counter** - Motivating visual representation of consistency
- **💪 Habit Categories** - Organize habits (health, work, learning, etc.)
- **📱 Mobile Responsive** - Works on all devices
- **⚡ Real-time Sync** - Firebase Firestore integration
- **🔐 Secure Storage** - Encrypted data with security rules
- **🌙 Dark Mode** - Eye-friendly interface

### 🤖 Intelligent Features

- **AI Recommendations** - Personalized habit suggestions
- **Pattern Recognition** - Detect success patterns
- **Smart Notifications** - Context-aware reminders
- **Motivational Insights** - Encouraging messages and tips
- **Adaptive Difficulty** - Adjusts based on your performance

### 👥 Community Features

- **Share Progress** - Share achievements with friends
- **Accountability Partners** - Pair with others for motivation
- **Leaderboards** - Friendly competition
- **Community Challenges** - Join group challenges
- **Social Support** - Encouragement from community

---

## 🚀 Quick Start

### For End Users

1. Visit the live application (deployment link TBA)
2. Sign up with email or social login
3. Create your first habit
4. Log daily to build streaks
5. Track progress with analytics

### For Developers

```bash
# Clone repository
git clone https://github.com/gargabhishek100/habit-forge.git
cd habit-forge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit with your Firebase credentials

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## 📦 Installation

### Prerequisites

- **Node.js** v18.0 or higher
- **npm** v9.0 or higher
- **Firebase Account** (free tier available)
- Git
- Modern web browser

### Step-by-Step Guide

```bash
# 1. Clone the repository
git clone https://github.com/gargabhishek100/habit-forge.git
cd habit-forge

# 2. Install dependencies
npm install

# 3. Set up Firebase
# - Create account at firebase.google.com
# - Create new project
# - Enable Authentication (Email/Password, Google)
# - Create Firestore Database
# - Copy project credentials

# 4. Configure environment
cp .env.example .env.local

# Edit .env.local with your Firebase config:
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# 5. Start development server
npm run dev

# 6. Open in browser
# Navigate to http://localhost:5173
```

### Firebase Setup Guide

**Step 1: Create Firebase Project**
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started"
3. Create new project (free tier)
4. Name it "Habit Forge" (or your preference)
5. Enable Google Analytics (optional)

**Step 2: Enable Authentication**
1. Go to Authentication in Firebase console
2. Click "Get Started"
3. Enable "Email/Password" provider
4. Enable "Google" provider (optional, for social login)
5. Copy your credentials to `.env.local`

**Step 3: Create Firestore Database**
1. Go to Firestore Database in Firebase console
2. Click "Create Database"
3. Start in **production mode** for security
4. Choose your region (closest to you recommended)
5. Wait for database to initialize

**Step 4: Set Firestore Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Allow users to read/write their habits
    match /habits/{habitId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Allow users to read/write their logs
    match /logs/{logId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 💡 How It Works

### User Journey

```
Sign Up / Login
    ↓
Create Your First Habit
    ↓
Set Goals & Reminders
    ↓
Log Daily Progress
    ↓
View Analytics & Insights
    ↓
Build Streaks
    ↓
Share & Celebrate
```

### Habit Creation

1. **Define Habit**
   - Name (e.g., "Morning Exercise")
   - Category (Health, Work, Learning, etc.)
   - Description/Motivation

2. **Set Goals**
   - Frequency (Daily, Weekly, etc.)
   - Time of day
   - Target duration

3. **Enable Reminders**
   - Push notifications
   - Email reminders
   - Custom reminder times

4. **Start Tracking**
   - Log completion daily
   - View streak
   - Get achievements

### Tracking Progress

- **Daily Log**: Click to mark habit complete for the day
- **Streak**: Consecutive days completed
- **Statistics**: Overall completion rate
- **Chart**: Visual progress over time

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 19.2.0 |
| **Language** | TypeScript | Latest |
| **Build Tool** | Vite | Latest |
| **Database** | Firebase Firestore | Latest |
| **Auth** | Firebase Authentication | Latest |
| **Styling** | Tailwind CSS | 4.1.14 |
| **Charts** | Chart.js / Recharts | Latest |
| **State Mgmt** | Firebase SDK | Latest |
| **Testing** | Vitest | Latest |

### Project Structure

```
habit-forge/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Top navigation
│   │   ├── HabitCard.tsx           # Individual habit display
│   │   ├── HabitForm.tsx           # Create/edit habits
│   │   ├── ProgressChart.tsx       # Progress visualization
│   │   ├── DailyLogger.tsx         # Log completion
│   │   └── Analytics.tsx           # Statistics dashboard
│   ├── pages/
│   │   ├── Home.tsx                # Main dashboard
│   │   ├── Habits.tsx              # Habit management
│   │   ├── Analytics.tsx           # Analytics page
│   │   ├── Settings.tsx            # User settings
│   │   └── Auth.tsx                # Login/signup
│   ├── services/
│   │   ├── firebase.ts             # Firebase config
│   │   ├── authService.ts          # Authentication
│   │   ├── habitService.ts         # Habit operations
│   │   ├── logService.ts           # Progress logging
│   │   └── storageService.ts       # Data persistence
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth hook
│   │   ├── useHabits.ts            # Habits hook
│   │   ├── useAnalytics.ts         # Analytics hook
│   │   └── useTheme.ts             # Theme hook
│   ├── types/
│   │   ├── habit.ts                # Habit types
│   │   ├── user.ts                 # User types
│   │   └── index.ts                # All type exports
│   ├── styles/
│   │   ├── globals.css             # Global styles
│   │   └── components.css          # Component styles
│   ├── utils/
│   │   ├── validators.ts           # Input validation
│   │   ├── formatters.ts           # Data formatting
│   │   ├── calculations.ts         # Stat calculations
│   │   └── notifications.ts        # Push notifications
│   ├── App.tsx                     # Main app component
│   └── main.tsx                    # Entry point
├── public/
│   ├── icons/
│   └── assets/
├── tests/
│   ├── components/                 # Component tests
│   └── services/                   # Service tests
├── .env.example                    # Environment template
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
├── package.json
└── README.md
```

### Data Models

#### Habit Document
```typescript
{
  id: string;
  userId: string;
  name: string;
  description: string;
  category: 'health' | 'work' | 'learning' | 'personal' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDaysPerWeek?: number;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  icon: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  goal?: string;
  targetDuration?: number; // minutes
  archived: boolean;
}
```

#### Log Document
```typescript
{
  id: string;
  userId: string;
  habitId: string;
  date: Date;
  completed: boolean;
  duration?: number; // minutes
  notes?: string;
  createdAt: Date;
}
```

#### User Document
```typescript
{
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailDigest: boolean;
  };
  statistics: {
    totalHabits: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🛠️ Development

### Development Setup

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run test suite |
| `npm run test:ui` | Run tests with UI |
| `npm run lint` | Check code quality |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Check TypeScript types |

### Code Style

```typescript
// Use TypeScript for type safety
interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
}

// Use async/await
async function fetchHabits(userId: string): Promise<Habit[]> {
  return await db.collection('habits')
    .where('userId', '==', userId)
    .get()
    .then(snap => snap.docs.map(doc => doc.data()));
}

// Use arrow functions
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US');
};

// Add JSDoc comments
/**
 * Calculates streak for a habit
 * @param logs - Array of logs for the habit
 * @returns Current streak count
 */
const calculateStreak = (logs: Log[]): number => {
  // Implementation
};
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# App Configuration
VITE_APP_NAME=Habit Forge
VITE_APP_VERSION=1.0.0
VITE_APP_URL=http://localhost:5173

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_AI_RECOMMENDATIONS=false
```

### Firebase Security Rules

See Firebase Setup Guide section above for complete security rules.

---

## 📊 Data Models

### Firestore Collections

**users/**
- Stores user profiles and preferences
- Document ID = User UID
- Private collection (only user can read/write own data)

**habits/**
- Stores habit definitions
- Document ID = Auto-generated
- Owner can read/write their habits

**logs/**
- Stores daily completion logs
- Document ID = Auto-generated
- Owner can read/write their logs

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run specific test file
npm run test -- habitService.test.ts

# Run with coverage
npm run test:coverage
```

### Test Examples

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateStreak } from '../utils/calculations';

describe('Streak Calculation', () => {
  it('should calculate correct streak', () => {
    const logs = [
      { date: new Date('2026-06-20'), completed: true },
      { date: new Date('2026-06-19'), completed: true },
      { date: new Date('2026-06-18'), completed: true }
    ];
    
    expect(calculateStreak(logs)).toBe(3);
  });
  
  it('should reset on missing day', () => {
    const logs = [
      { date: new Date('2026-06-20'), completed: true },
      { date: new Date('2026-06-18'), completed: true }
    ];
    
    expect(calculateStreak(logs)).toBe(1);
  });
});
```

---

## 🔒 Security

### Security Features

✅ **Authentication**
- Firebase Authentication (email, Google)
- Secure password handling
- Session management

✅ **Data Protection**
- Firestore security rules
- User data isolation
- Encryption in transit (HTTPS)

✅ **Input Validation**
- Form validation
- Sanitization of user input
- Type checking with TypeScript

✅ **Privacy**
- GDPR compliant
- User data export capability
- Account deletion option

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Firebase config not loaded"
```bash
✓ Check .env.local has all Firebase variables
✓ Verify VITE_ prefix on environment variables
✓ Restart dev server after .env changes
```

#### ❌ "Authentication errors"
```bash
✓ Verify Firebase Authentication is enabled
✓ Check email/password provider is active
✓ Clear browser cache and cookies
```

#### ❌ "Firestore errors"
```bash
✓ Verify Firestore database exists
✓ Check security rules allow your user access
✓ Test with Firestore emulator: npm run emulate
```

#### ❌ "Changes not syncing"
```bash
✓ Check internet connection
✓ Verify Firestore rules allow write access
✓ Check browser console for errors
✓ Restart development server
```

---

## 🤝 Contributing

Contributions welcome! Help us improve Habit Forge.

### Contributing Steps

1. **Fork Repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/habit-forge.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow code style
   - Add tests for new features
   - Update documentation

4. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

5. **Commit & Push**
   ```bash
   git commit -m "feat: add amazing feature"
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Clear description
   - Link related issues
   - Include test results

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Related Projects
- **[Contract Extraction Client](https://github.com/gargabhishek100/contract-extraction-client)**
- **[The Journey](https://github.com/gargabhishek100/The-Journey)**
- **[Portfolio](https://github.com/gargabhishek100/portfolio)**

---

## 📞 Contact & Support

- **GitHub**: [@gargabhishek100](https://github.com/gargabhishek100)
- **Portfolio**: [portfolio-ecru-phi-97.vercel.app](https://portfolio-ecru-phi-97.vercel.app)
- **Issues**: [GitHub Issues](https://github.com/gargabhishek100/habit-forge/issues)

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Firebase**

This was my first completed app with Google Gemini assistance on **January 20, 2026**

[⭐ Star us on GitHub](https://github.com/gargabhishek100/habit-forge)

**Last Updated:** June 20, 2026

</div>