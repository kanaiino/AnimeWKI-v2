import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAnimeList } from '../../services/userAnimeService';
import { animeApi } from '../../services/shikimoriApi';
import AnimeGrid from '../AnimeGrid/AnimeGrid';
import PageLoader from '../PageLoader/PageLoader';
import './UserLists.scss';

const STATUS_OPTIONS = [
  { value: 'favorite', label: 'Избранное' },
  { value: 'watching', label: 'Смотрю' },
  { value: 'planned', label: 'В планах' },
  { value: 'completed', label: 'Просмотрено' },
  { value: 'on_hold', label: 'Отложено' },
  { value: 'dropped', label: 'Брошено' }
];

function UserLists() {
  const { user } = useAuth();
  const [activeStatus, setActiveStatus] = useState('favorite');
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchUserAnime = async () => {
      setLoading(true);
      setError(null);
      try {
        const records = await getUserAnimeList(user.id, activeStatus);
        if (records.length === 0) {
          setAnimeList([]);
          setLoading(false);
          return;
        }

        const animeIds = records.map(record => record.animeId);

        const allAnime = [];
        const batchSize = 50;
        for (let i = 0; i < animeIds.length; i += batchSize) {
          const batchIds = animeIds.slice(i, i + batchSize);
          const data = await animeApi.getList({ ids: batchIds.join(',') }, 1, batchSize);
          allAnime.push(...data);
          if (i + batchSize < animeIds.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        setAnimeList(allAnime);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAnime();
  }, [user, activeStatus]);

  return (
    <div className='user-lists'>
      <div className="user-lists__header">
        <div className='user-lists-title'>Тайтлы</div>
        <div className="status-tabs">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`btn-small ${activeStatus === opt.value ? 'active' : ''}`}
              onClick={() => setActiveStatus(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {loading && <PageLoader isActive={false} />}
      {error && <div className="error">Ошибка: {error}</div>}
      {!loading && !error && <AnimeGrid items={animeList} />}
      {!loading && !error && animeList.length === 0 && (
        <div className="empty-message">В этом списке пока нет аниме</div>
      )}
    </div>
  );
}

export default UserLists;