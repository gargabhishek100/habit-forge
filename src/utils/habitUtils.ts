export type Habit = {
  id: string;
  name: string;
  category: string;
  frequency: string;
  streak: number;
  totalCompletions: number;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

export type Log = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'partial' | 'skipped';
  timestamp?: { seconds: number; nanoseconds: number } | null;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const calculateDailyStars = (logs: Log[], dateStr: string): number => {
  const daysLogs = logs.filter(l => l.date === dateStr);
  let stars = 0;
  daysLogs.forEach(log => {
    if (log.status === 'completed') stars += 1;
    if (log.status === 'partial') stars += 0.5;
  });
  return stars;
};

export const calculateStreak = (logs: Log[], habitId: string, today: Date = new Date()): number => {
  let streak = 0;
  const habitLogs = logs
    .filter(l => l.habitId === habitId && (l.status === 'completed' || l.status === 'partial'))
    .sort((a, b) => b.date.localeCompare(a.date));
  
  if (habitLogs.length === 0) return 0;

  const checkDate = new Date(today);
  const todayStr = formatDate(checkDate);
  const hasToday = habitLogs.some(l => l.date === todayStr);
  
  if (!hasToday) checkDate.setDate(checkDate.getDate() - 1);

  while (true) {
    const dateStr = formatDate(checkDate);
    const hasLog = habitLogs.some(l => l.date === dateStr);
    if (hasLog) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};
