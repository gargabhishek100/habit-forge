import { describe, test, expect } from 'vitest';
import { formatDate, calculateDailyStars, calculateStreak } from './habitUtils';
import type { Log } from './habitUtils';

describe('habitUtils tests', () => {
  describe('formatDate', () => {
    test('formats local date correctly to YYYY-MM-DD', () => {
      // Month index is 0-indexed: 5 is June
      const date = new Date(2026, 5, 20);
      expect(formatDate(date)).toBe('2026-06-20');
    });

    test('adds leading zeros to month and day if needed', () => {
      const date = new Date(2026, 0, 5); // Jan 5th
      expect(formatDate(date)).toBe('2026-01-05');
    });
  });

  describe('calculateDailyStars', () => {
    test('sums stars correctly based on log status', () => {
      const logs: Log[] = [
        { id: '1', habitId: 'h1', date: '2026-06-20', status: 'completed' },
        { id: '2', habitId: 'h2', date: '2026-06-20', status: 'partial' },
        { id: '3', habitId: 'h3', date: '2026-06-20', status: 'skipped' },
        { id: '4', habitId: 'h4', date: '2026-06-19', status: 'completed' }, // different day
      ];

      expect(calculateDailyStars(logs, '2026-06-20')).toBe(1.5);
      expect(calculateDailyStars(logs, '2026-06-19')).toBe(1.0);
      expect(calculateDailyStars(logs, '2026-06-18')).toBe(0.0);
    });
  });

  describe('calculateStreak', () => {
    const refDate = new Date(2026, 5, 20); // June 20, 2026

    test('returns 0 when there are no logs', () => {
      expect(calculateStreak([], 'h1', refDate)).toBe(0);
    });

    test('calculates streak when user completed today and yesterday', () => {
      const logs: Log[] = [
        { id: '1', habitId: 'h1', date: '2026-06-20', status: 'completed' },
        { id: '2', habitId: 'h1', date: '2026-06-19', status: 'completed' },
        { id: '3', habitId: 'h1', date: '2026-06-18', status: 'completed' },
      ];
      expect(calculateStreak(logs, 'h1', refDate)).toBe(3);
    });

    test('calculates streak when user completed yesterday but has not logged today yet', () => {
      const logs: Log[] = [
        { id: '1', habitId: 'h1', date: '2026-06-19', status: 'completed' },
        { id: '2', habitId: 'h1', date: '2026-06-18', status: 'completed' },
      ];
      expect(calculateStreak(logs, 'h1', refDate)).toBe(2);
    });

    test('returns 0 streak when yesterday is skipped and today is not logged yet', () => {
      const logs: Log[] = [
        { id: '1', habitId: 'h1', date: '2026-06-18', status: 'completed' }, // June 19th is missing
      ];
      expect(calculateStreak(logs, 'h1', refDate)).toBe(0);
    });

    test('partial completions count towards the streak', () => {
      const logs: Log[] = [
        { id: '1', habitId: 'h1', date: '2026-06-20', status: 'partial' },
        { id: '2', habitId: 'h1', date: '2026-06-19', status: 'completed' },
      ];
      expect(calculateStreak(logs, 'h1', refDate)).toBe(2);
    });

    test('skipped status breaks the streak', () => {
      const logs: Log[] = [
        { id: '1', habitId: 'h1', date: '2026-06-20', status: 'completed' },
        { id: '2', habitId: 'h1', date: '2026-06-19', status: 'skipped' }, // breaks streak
        { id: '3', habitId: 'h1', date: '2026-06-18', status: 'completed' },
      ];
      expect(calculateStreak(logs, 'h1', refDate)).toBe(1);
    });

    test('ignores logs from other habits', () => {
      const logs: Log[] = [
        { id: '1', habitId: 'h1', date: '2026-06-20', status: 'completed' },
        { id: '2', habitId: 'h2', date: '2026-06-19', status: 'completed' }, // other habit
      ];
      expect(calculateStreak(logs, 'h1', refDate)).toBe(1);
    });
  });
});
