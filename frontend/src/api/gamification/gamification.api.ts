import client from '../client';

export type GamificationResponse = {
  xp: number;
  level: number;
  streak: {
    current: number;
    best: number;
    lastActiveISO?: string;
  };
  modules?: Record<string, number>;
  updatedAt?: string;
};

const gamificationApi = {
  async me(): Promise<GamificationResponse> {
    const { data } = await client.get<GamificationResponse>('/gamification/me');
    return data;
  },
};

export default gamificationApi;
