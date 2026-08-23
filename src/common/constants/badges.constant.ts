export interface Badge {
  name: string;
  requiredAchievements: number;
}

export const rewardBadges: Badge[] = [
  { name: 'novice', requiredAchievements: 1 },
  { name: 'enthusiast', requiredAchievements: 3 },
  { name: 'professional', requiredAchievements: 5 },
  { name: 'expert', requiredAchievements: 8 },
  { name: 'legend', requiredAchievements: 12 },
];
