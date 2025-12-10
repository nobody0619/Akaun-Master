
import { LeaderboardEntry } from '../types';
import { GOOGLE_SCRIPT_URL } from '../constants';

const LOCAL_STORAGE_KEY = 'akaun_master_scores';

// 保存分数
export const saveScore = async (entry: LeaderboardEntry) => {
  // 1. 存本地备份
  const current = getLocalScores();
  current.push(entry);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));

  // 2. 发送给 Google Sheet
  if (GOOGLE_SCRIPT_URL) {
    try {
      // 使用 no-cors 模式，确保发送成功且不报跨域错误
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      console.log("Score sent to cloud.");
    } catch (error) {
      console.error("Cloud save failed:", error);
    }
  }
};

// 获取分数
export const getScores = async (): Promise<LeaderboardEntry[]> => {
  if (GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      console.error("Cloud fetch failed, using local:", error);
    }
  }
  // 如果云端失败，返回本地
  return getLocalScores();
};

const getLocalScores = (): LeaderboardEntry[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};
