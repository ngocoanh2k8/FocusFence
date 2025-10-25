export interface DailyRewardStatus {
  date: string; // YYYY-MM-DD
  sessionsToday: number;
  claimed: boolean;
}

export interface StudentProfile {
  email: string;
  lastSeen: number;
  name: string;
  totalTreesPlanted: number;
  dailyReward: DailyRewardStatus;
}