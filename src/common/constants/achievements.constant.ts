export interface Achievement {
  name: string;
  threshold: number;
}

export interface AchievementGroup {
  key: string;
  achievements: Achievement[];
}

export const rewardAchievements: AchievementGroup[] = [
  {
    key: 'purchases',
    achievements: [
      { name: 'first purchase', threshold: 1 },
      { name: '5 purchases', threshold: 5 },
      { name: '10 purchases', threshold: 10 },
      { name: '25 purchases', threshold: 25 },
      { name: '50 purchases', threshold: 50 },
    ],
  },
];
