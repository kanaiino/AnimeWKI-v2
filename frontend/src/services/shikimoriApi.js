const BASE_URL = 'https://shikimori.one/api';

const headers = {
  'User-Agent': 'animewki'
};

async function request(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);

  const finalParams = { ...params };

  if (endpoint === '/animes' || endpoint.startsWith('/animes/') === false) {
    if (endpoint === '/animes') {
      finalParams.censored = true;
      if (!finalParams.rating) {
        finalParams.rating = '!rx';
      }
    }
  }

  Object.keys(finalParams).forEach(key => {
    const val = finalParams[key];
    if (val !== undefined && val !== '' && val !== null) {
      if (Array.isArray(val)) {
        url.searchParams.append(key, val.join(','));
      } else {
        url.searchParams.append(key, String(val));
      }
    }
  });

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export const animeApi = {
  getList: (filters = {}, page = 1, limit = 24) =>
    request('/animes', { ...filters, page, limit }),

  getById: (id) => request(`/animes/${id}`),

  getSimilar: (id, extraParams = {}) =>
    request(`/animes/${id}/similar`, extraParams),

  getRoles: (id) => request(`/animes/${id}/roles`),

  getRelated: (id) => request(`/animes/${id}/related`),

  getPopular: (params = {}) =>
    request('/animes', { order: 'popularity', limit: 12, ...params }),

  getOngoing: (params = {}) =>
    request('/animes', { status: 'ongoing', order: 'ranked', limit: 12, ...params }),

  getTopRated: (params = {}) =>
    request('/animes', { order: 'ranked', limit: 12, score: 8, ...params }),

  getNew: (params = {}) =>
    request('/animes', { order: 'aired_on', limit: 12, status: 'released', ...params }),

  getAllPages: async (filters = {}, limitPerPage = 50, maxPages = 20) => {
    const allData = [];
    let page = 1;
    let hasMore = true;
    while (hasMore && page <= maxPages) {
      const data = await request('/animes', { ...filters, limit: limitPerPage, page });
      if (data.length === 0) break;
      allData.push(...data);
      if (data.length < limitPerPage) hasMore = false;
      page++;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    return allData;
  },
};

export const genresApi = {
  getAll: () => request('/genres'),
  getAnimeGenres: async () => {
    const all = await request('/genres');
    const EXCLUDED = ['Hentai', 'Erotica', 'Yaoi', 'Yuri'];
    return all.filter(genre =>
      genre.entry_type === 'Anime' &&
      !EXCLUDED.includes(genre.name)
    );
  }
};

export const getAnimeById = (id) =>
  fetch(`https://shikimori.one/api/animes/${id}`, {
    headers: { 'User-Agent': 'AnimeWki/1.0' }
  }).then(res => res.json());