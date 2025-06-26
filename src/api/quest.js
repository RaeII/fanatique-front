import api from '../lib/api';

const getQuestsByScope = async (scope) => {
  const response = await api.get(`/quest-user/all-quests/user?scope_id=${scope}`);
  return response.data?.content || null;
};

const completeQuest = async (questId, gameId) => {
  const response = await api.post(`/quest-user`, { status: 1, match_id: gameId, quest_id: questId });
  return response.data?.content || null;
};

export default {
  getQuestsByScope,
  completeQuest,
}; 