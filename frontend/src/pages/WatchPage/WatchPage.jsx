import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAnimeById } from "../../services/shikimoriApi";
import { addOrUpdateUserAnime } from "../../services/userAnimeService";
import VideoPlayerControls from "../../components/VideoPlayerControls/VideoPlayerControls";
import PageLoader from "../../components/PageLoader/PageLoader";
import "./WatchPage.scss";

function WatchPage({ isActive, isRightPanelOpen, isMobile }) {
  const { shikimoriId } = useParams();
  const { user } = useAuth();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [episodesCount, setEpisodesCount] = useState(0);
  const [translations, setTranslations] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [currentTranslation, setCurrentTranslation] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [playerError, setPlayerError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getAnimeById(shikimoriId)
      .then(setAnime)
      .catch(() => setError('Аниме не найдено'))
      .finally(() => setLoading(false));
  }, [shikimoriId]);

  const fetchKodikData = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/kodik/search?shikimori_id=${shikimoriId}`,
      );
      if (!res.ok) throw new Error('Не удалось загрузить данные плеера');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEpisodesCount(data.episodesCount);
      setTranslations(data.translations);
      if (data.translations.length > 0) {
        setCurrentTranslation(data.translations[0]);
      } else {
        setPlayerError('Озвучки не найдены');
      }
    } catch (err) {
      setPlayerError(err.message);
    } finally {
      setPlayerLoading(false);
    }
  }, [shikimoriId]);

  useEffect(() => {
    if (!user) return;
    const loadProgress = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/userAnime?userId=${user.id}&animeId=${shikimoriId}`,
        );
        const data = await res.json();
        if (data.length && data[0].lastWatchedEpisode) {
          setCurrentEpisode(data[0].lastWatchedEpisode);
        }
      } catch (err) {
        console.error('Ошибка загрузки прогресса:', err);
      }
    };
    loadProgress();
  }, [user, shikimoriId]);

  useEffect(() => {
    fetchKodikData();
  }, [fetchKodikData]);

  const saveProgress = useCallback(
    async (episode) => {
      if (!user) return;
      await addOrUpdateUserAnime(user.id, shikimoriId, undefined, undefined, episode);
    },
    [user, shikimoriId],
  );

  const handleEpisodeChange = (episode) => {
    setCurrentEpisode(episode);
    saveProgress(episode);
  };

  const handleTranslationChange = (translationId) => {
    const trans = translations.find((t) => String(t.id) === translationId);
    if (trans) setCurrentTranslation(trans);
  };

  if (loading) return <PageLoader />;
  if (error) return <div className="watch-page__error">{error}</div>;
  if (!anime) return null;

  let playerUrl = null;
  let isSerial = false;
  if (currentTranslation) {
    const rawLink = currentTranslation.link;
    const baseLink = rawLink.startsWith('//') ? 'https:' + rawLink : rawLink;
    isSerial = baseLink.includes('/serial/');
    playerUrl = isSerial
      ? `${baseLink}?episode=${currentEpisode}&episodes=0&translations=0`
      : baseLink;
  }
  
 const showRightPanel = !isMobile || isRightPanelOpen;

  return (
    <div className={`watch-page ${isActive ? "aside--padding2" : "aside--padding"} ${!showRightPanel ? "right-panel--collapsed" : "watch-page--padding"}`}>
      <div className="watch-page__header">
        <Link to={`/anime/${shikimoriId}`} className="watch-page-title">
          ← {anime?.russian || anime?.name}
        </Link>
      </div>
      <div className="watch-page__content">
        <div className="watch-page__video">
          {playerLoading && <PageLoader />}
          {playerError && <div className="watch-page__error">{playerError}</div>}
          {currentTranslation && (
            <iframe
              key={playerUrl}
              src={playerUrl}
              className="watch-page__iframe"
              allowFullScreen
              title="Видеоплеер"
            />
          )}
        </div>
        {showRightPanel && (
          <VideoPlayerControls
            episodesCount={isSerial ? episodesCount : 0}
            translations={translations}
            currentEpisode={currentEpisode}
            currentTranslation={currentTranslation}
            onEpisodeChange={handleEpisodeChange}
            onTranslationChange={handleTranslationChange}
          />
        )}
      </div>
    </div>
  );
}

export default WatchPage;