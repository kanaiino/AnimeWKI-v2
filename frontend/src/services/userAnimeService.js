const API_URL = 'http://localhost:5002';

export const getUserAnimeEntry = async (userId, animeId) => {
  const res = await fetch(`${API_URL}/userAnime`);
  const all = await res.json();
  return all.find(entry => String(entry.userId) === String(userId) && Number(entry.animeId) === Number(animeId)) || null;
};

export const getUserAnimeList = async (userId, status = null) => {
  const res = await fetch(`${API_URL}/userAnime`);
  const all = await res.json();
  let filtered = all.filter(entry => String(entry.userId) === String(userId));
  if (status) filtered = filtered.filter(entry => entry.status === status);
  return filtered;
};

export const addOrUpdateUserAnime = async (userId, animeId, status, score, lastEpisode) => {
  const entry = await getUserAnimeEntry(userId, animeId);
  const now = new Date().toISOString();
  const data = {
    userId: String(userId),
    animeId: Number(animeId),
    status: status !== undefined ? status : (entry?.status || ''),
    score: score !== undefined ? score : (entry?.score || null),
    lastWatchedEpisode: lastEpisode !== undefined ? lastEpisode : (entry?.lastWatchedEpisode || null),
    updatedAt: now,
  };
  if (entry) {
    await fetch(`${API_URL}/userAnime/${entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entry, ...data }),
    });
  } else {
    await fetch(`${API_URL}/userAnime`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id: Date.now() }),
    });
  }
};

export const removeUserAnime = async (userId, animeId) => {
  const entry = await getUserAnimeEntry(userId, animeId);
  if (entry) {
    await fetch(`${API_URL}/userAnime/${entry.id}`, { method: 'DELETE' });
  }
};