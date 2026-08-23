export interface Badge {
  name: string;
  requiredAchievements: number;
}

export const rewardBadges: Badge[] = [
  { name: 'beginner', requiredAchievements: 1 },
  { name: 'bronze', requiredAchievements: 3 },
  { name: 'silver', requiredAchievements: 5 },
  { name: 'advanced', requiredAchievements: 8 },
  { name: 'gold', requiredAchievements: 12 },
];
