import { Link } from 'react-router-dom';
import Card from '../Card/Card';
import './AnimeGrid.scss';

const getPosterUrl = (anime) => {
  const path = anime.poster?.mainUrl || anime.image?.original;
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://shikimori.one${path}`;
};

function AnimeGrid({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="anime-grid">
      {items.map((anime) => (
        <Link
          to={`/anime/${anime.id}`}
          key={anime.id}
          className="anime-card-link"
        >
          <Card
            title={anime.russian || anime.name}
            image={getPosterUrl(anime) || '/placeholder.jpg'}
            type={anime.kind}
          />
        </Link>
      ))}
    </div>
  );
}

export default AnimeGrid;