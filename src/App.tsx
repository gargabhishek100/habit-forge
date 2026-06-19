import { useState, useEffect} from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { 
  getTodayDate,
  calculateDailyStars,
  calculateStreak
} from './utils/habitUtils';
import type { Habit, Log } from './utils/habitUtils';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp
} from 'firebase/firestore';
import { 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  BarChart3, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit2, 
  // TrendingUp, 
  // Download, 
  // BookOpen, 
  Activity, 
  // Moon, 
  // Briefcase, 
  // BrainCircuit,
  // Flame,
  Star,
  Copy,
  Check
} from 'lucide-react';

// --- CONFIGURATION SECTION ---

let firebaseConfig;
let appId = 'default-app-id';

// 1. Auto-detect environment (Preview vs Local)
try {
  const globalConfig = (window as unknown as { __firebase_config?: string }).__firebase_config;
  const globalAppId = (window as unknown as { __app_id?: string }).__app_id;
  if (typeof globalConfig !== 'undefined' && globalConfig) {
    firebaseConfig = JSON.parse(globalConfig);
    appId = typeof globalAppId !== 'undefined' ? globalAppId : 'default-app-id';
  }
} catch {
  console.log("Local mode detected.");
}

// 2. If not in Preview, use these keys (FOR YOUR PC)
if (!firebaseConfig) {
  // PASTE YOUR FIREBASE CONSOLE KEYS HERE WHEN RUNNING LOCALLY
  firebaseConfig = {
  apiKey: "AIzaSyAbxmTUaQ9OsLmScSmmjk2k64x7s0FCtgY",
  authDomain: "habitforge-eeea8.firebaseapp.com",
  projectId: "habitforge-eeea8",
  storageBucket: "habitforge-eeea8.firebasestorage.app",
  messagingSenderId: "357668454579",
  appId: "1:357668454579:web:b18b56a7962b9b5b5ab0c6",
  measurementId: "G-JHRSWMX2R6"
  };
  appId = 'my-habit-tracker';
}

// Sanitize appId to ensure no slashes break the Firestore path (CRITICAL FIX)
if (appId) {
  appId = appId.replace(/\//g, '_');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- Constants & Utilities ---
const SUGGESTED_HABITS = [
  { name: "Chanting Hare Krsna (16 rounds)", category: "Spiritual", frequency: "Daily" },
  { name: "Book Reading", category: "Personal Growth", frequency: "Daily" },
  { name: "M.Tech Course Work", category: "Career/Education", frequency: "Daily" },
  { name: "Quant Engineering (DSA/Math/Fin)", category: "Skill Dev", frequency: "Daily" },
  { name: "Badminton / Exercise / Sleep", category: "Health", frequency: "Daily" },
];

// --- Components ---

export default function HabitForge() {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [view, setView] = useState<'dashboard' | 'checkin' | 'habits' | 'insights'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('General');
  const [copied, setCopied] = useState(false);

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Hybrid Auth: Tries custom token (for preview) then anonymous (for local)
        const initialAuthToken = (window as unknown as { __initial_auth_token?: string }).__initial_auth_token;
        if (typeof initialAuthToken !== 'undefined' && initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error (Check your Firebase Config if running locally):", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Use a path specific to the logged-in user
    const habitsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'habits');
    
    const unsubHabits = onSnapshot(habitsRef, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      habitsData.sort((a, b) => {
        const timeA = a.createdAt?.seconds ?? Infinity;
        const timeB = b.createdAt?.seconds ?? Infinity;
        return timeA - timeB;
      });
      setHabits(habitsData);
      setLoading(false);
    }, (error) => console.error("Habits fetch error (Check Firestore Rules):", error));

    const logsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'logs');
    const unsubLogs = onSnapshot(logsRef, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Log));
      setLogs(logsData);
    }, (error) => console.error("Logs fetch error:", error));

    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [user]);

  // --- Logic ---

  const addHabit = async (name: string, category: string) => {
    if (!user || !name.trim()) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), {
        name,
        category,
        frequency: 'Daily',
        streak: 0,
        totalCompletions: 0,
        createdAt: serverTimestamp()
      });
      setNewHabitName('');
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding habit:", err);
    }
  };

  const importSuggestedHabits = async () => {
    if (!user) return;
    for (const h of SUGGESTED_HABITS) {
      const exists = habits.some(existing => existing.name === h.name);
      if (!exists) {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), {
          ...h,
          streak: 0,
          totalCompletions: 0,
          createdAt: serverTimestamp()
        });
      }
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    if (confirm('Delete this habit?')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', id));
    }
  };

  const logHabit = async (habitId: string, status: 'completed' | 'partial' | 'skipped') => {
    if (!user) return;
    const today = getTodayDate();
    
    const existingLog = logs.find(l => l.habitId === habitId && l.date === today);

    if (existingLog) {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'logs', existingLog.id), {
        status,
        timestamp: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'logs'), {
        habitId,
        date: today,
        status,
        timestamp: serverTimestamp()
      });
    }
  };

  // --- Calculations ---
  
  const today = getTodayDate();
  
  const habitsWithStatus = habits.map(h => {
    const log = logs.find(l => l.habitId === h.id && l.date === today);
    return { ...h, todayStatus: log?.status };
  });

  const todayStars = calculateDailyStars(logs, today);
  const maxStars = habits.length > 0 ? habits.length : 5;

  // --- Copy to Clipboard Logic ---
  const copyToClipboard = () => {
    const statuses = habits.map(h => {
       // Find the log for this specific habit and today's date
       const log = logs.find(l => l.habitId === h.id && l.date === today);
       const status = log?.status;
       return status ? (status.charAt(0).toUpperCase() + status.slice(1)) : 'Pending';
    });
    
    const rowString = `${today}\t${statuses.join('\t')}\t${todayStars}`;
    
    // Robust copy for modern browsers
    navigator.clipboard.writeText(rowString).then(() => {
       setCopied(true);
       setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
        // Fallback for older envs
        const textArea = document.createElement("textarea");
        textArea.value = rowString;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  // --- UI Sections ---

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column on large screens: Star Card + Daily Sync Card */}
      <div className="lg:col-span-1 space-y-6">
        {/* Star Score Card */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Star size={120} fill="white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
              <Star size={24} fill="white" className="text-white" />
              <span className="font-semibold text-yellow-50">Today's Score</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-bold">{todayStars}</span>
              <span className="text-xl text-yellow-100">/ {maxStars} Stars</span>
            </div>
            <div className="mt-4 w-full bg-black/20 rounded-full h-2.5">
              <div 
                className="bg-white h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(todayStars / maxStars) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Daily Sync card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-700">Daily Sync</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Today</span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Update your habits, then copy the row to paste into your Google Sheet.
          </p>
          <button 
            onClick={copyToClipboard}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${
              copied ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Copied Row!' : 'Copy Row for Google Sheets'}</span>
          </button>
        </div>
      </div>

      {/* Right Column: Quick Status list */}
      <div className="lg:col-span-2 space-y-3">
        <h3 className="font-semibold text-slate-700 ml-1">Quick Status</h3>
        {habitsWithStatus.length === 0 ? (
           <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
             <button 
               onClick={importSuggestedHabits}
               className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
             >
               Load My 5 Habits
             </button>
           </div>
        ) : (
          habitsWithStatus.map(habit => (
            <div key={habit.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-slate-800">{habit.name}</h4>
                <div className="text-xs text-slate-500 mt-1 flex items-center">
                  {habit.todayStatus === 'completed' && <span className="text-yellow-500 flex items-center mr-2"><Star size={10} fill="currentColor" className="mr-1"/> +1.0</span>}
                  {habit.todayStatus === 'partial' && <span className="text-yellow-500 flex items-center mr-2"><Star size={10} className="mr-1"/> +0.5</span>}
                  {(!habit.todayStatus || habit.todayStatus === 'skipped') && <span className="text-slate-400 mr-2">+0.0</span>}
                  <span className="text-slate-300">| Streak: {calculateStreak(logs, habit.id)}</span>
                </div>
              </div>
              <div className="flex space-x-1">
                 {/* Mini toggles for dashboard */}
                 <button onClick={() => logHabit(habit.id, 'completed')} className={`p-1.5 rounded ${habit.todayStatus==='completed'?'bg-green-100 text-green-600':'text-slate-300'}`}><CheckCircle2 size={20}/></button>
                 <button onClick={() => logHabit(habit.id, 'partial')} className={`p-1.5 rounded ${habit.todayStatus==='partial'?'bg-yellow-100 text-yellow-600':'text-slate-300'}`}><MinusCircle size={20}/></button>
                 <button onClick={() => logHabit(habit.id, 'skipped')} className={`p-1.5 rounded ${habit.todayStatus==='skipped'?'bg-red-100 text-red-600':'text-slate-300'}`}><XCircle size={20}/></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCheckIn = () => (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Check-in & Earn Stars</h2>
        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
          <Star size={12} fill="currentColor" className="mr-1" />
          {todayStars} / {maxStars}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitsWithStatus.map(habit => (
          <div key={habit.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
             <div className="mb-4">
                <h3 className="font-semibold text-lg text-slate-800">{habit.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{habit.category}</span>
                </div>
             </div>
             
             <div className="grid grid-cols-3 gap-3 mt-auto">
               <button 
                onClick={() => logHabit(habit.id, 'completed')}
                className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                  habit.todayStatus === 'completed' 
                    ? 'bg-green-100 border-2 border-green-500 text-green-700 shadow-sm' 
                    : 'bg-slate-50 border border-slate-200 text-slate-600 opacity-60 hover:opacity-100'
                }`}
               >
                 <div className="flex items-center mb-1">
                   <Star size={16} fill={habit.todayStatus === 'completed' ? "currentColor" : "none"} />
                   <span className="ml-1 text-xs font-bold">+1.0</span>
                 </div>
                 <span className="text-xs">Done</span>
               </button>

               <button 
                onClick={() => logHabit(habit.id, 'partial')}
                className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                  habit.todayStatus === 'partial' 
                    ? 'bg-yellow-100 border-2 border-yellow-500 text-yellow-700 shadow-sm' 
                    : 'bg-slate-50 border border-slate-200 text-slate-600 opacity-60 hover:opacity-100'
                }`}
               >
                 <div className="flex items-center mb-1">
                   <Star size={16} className="text-yellow-600" />
                   <span className="ml-1 text-xs font-bold">+0.5</span>
                 </div>
                 <span className="text-xs">Partial</span>
               </button>

               <button 
                onClick={() => logHabit(habit.id, 'skipped')}
                className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                  habit.todayStatus === 'skipped' 
                    ? 'bg-red-100 border-2 border-red-500 text-red-700 shadow-sm' 
                    : 'bg-slate-50 border border-slate-200 text-slate-600 opacity-60 hover:opacity-100'
                }`}
               >
                 <div className="flex items-center mb-1">
                   <span className="text-xs font-bold">0.0</span>
                 </div>
                 <span className="text-xs">Skip</span>
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHabitsManager = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Manage Habits</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 shadow-md transition-all lg:hidden"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Creation Panel (visible always on desktop, modal toggled on mobile) */}
        <div className={`lg:col-span-1 space-y-4 ${showAddModal ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-3">Add New Habit</h3>
            <input 
              type="text" 
              placeholder="Habit Name"
              className="w-full p-2.5 border border-slate-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
            />
            <select 
              className="w-full p-2.5 border border-slate-200 rounded-lg mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Career/Education">Career & Education</option>
              <option value="Health">Health & Fitness</option>
              <option value="Spiritual">Spiritual</option>
              <option value="Skill Dev">Skill Development</option>
            </select>
            <div className="flex space-x-2">
              <button 
                onClick={() => addHabit(newHabitName, newHabitCategory)}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Save Habit
              </button>
              {showAddModal && (
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 lg:hidden"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Active habits list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-semibold text-slate-700 ml-1 hidden lg:block">Active Habits</h3>
          {habits.length === 0 && (
             <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
               <button 
                 onClick={importSuggestedHabits}
                 className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
               >
                 Import Priority List
               </button>
             </div>
          )}

          <div className="space-y-3">
            {habits.map(habit => (
              <div key={habit.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                 <div className="flex items-center space-x-3">
                   <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                     <Activity size={18} />
                   </div>
                   <div>
                      <h4 className="font-medium text-slate-800">{habit.name}</h4>
                      <p className="text-xs text-slate-400">{habit.category}</p>
                   </div>
                 </div>
                 <button onClick={() => deleteHabit(habit.id)} className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors">
                   <Trash2 size={18} />
                 </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50 text-indigo-600">
      <div className="animate-spin mr-2"><Activity /></div> Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Activity className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-slate-800">HabitForge</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setView('dashboard')} 
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
              view === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BarChart3 size={20} />
            <span>Progress</span>
          </button>
          
          <button 
            onClick={() => setView('checkin')} 
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
              view === 'checkin' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Calendar size={20} />
            <span>Check-in</span>
          </button>
          
          <button 
            onClick={() => setView('habits')} 
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
              view === 'habits' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Edit2 size={20} />
            <span>Habits</span>
          </button>
        </nav>
        
        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100">
            <div className="flex items-center">
              <Star size={16} className="text-yellow-500 mr-2" fill="currentColor" />
              <span className="text-sm font-semibold text-yellow-800">Today's Stars</span>
            </div>
            <span className="text-sm font-bold text-yellow-700">{todayStars}</span>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Activity className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-slate-800">HabitForge</span>
            </div>
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
              <Star size={14} className="text-yellow-500 mr-1" fill="currentColor" />
              <span className="text-xs font-bold text-yellow-700">{todayStars} Stars</span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-w-5xl w-full mx-auto">
          {view === 'dashboard' && renderDashboard()}
          {view === 'checkin' && renderCheckIn()}
          {view === 'habits' && renderHabitsManager()}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 pb-6 md:hidden z-10">
          <button onClick={() => setView('dashboard')} className={`flex flex-col items-center space-y-1 ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <BarChart3 size={24} />
            <span className="text-[10px] font-medium">Progress</span>
          </button>
          <button onClick={() => setView('checkin')} className={`flex flex-col items-center space-y-1 ${view === 'checkin' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Calendar size={24} />
            <span className="text-[10px] font-medium">Check-in</span>
          </button>
          <button onClick={() => setView('habits')} className={`flex flex-col items-center space-y-1 ${view === 'habits' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Edit2 size={24} />
            <span className="text-[10px] font-medium">Habits</span>
          </button>
        </nav>
      </div>
    </div>
  );
}