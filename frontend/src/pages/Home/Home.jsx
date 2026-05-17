import "./Home.scss";
import { useState, useEffect } from "react";
import { animeApi } from "../../services/shikimoriApi";
import CardSwiper from "../../components/CardSwiper/CardSwiper";
import PageLoader from "../../components/PageLoader/PageLoader";

function Home({ isActive }) {
  const [recommended, setRecommended] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const pop = await animeApi.getPopular();
      await new Promise((r) => setTimeout(r, 500));
      const ong = await animeApi.getOngoing();
      await new Promise((r) => setTimeout(r, 500));
      const rec = await animeApi.getTopRated();
      setPopular(pop);
      setOngoing(ong);
      setRecommended(rec);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <PageLoader isActive={isActive} error={error} onRetry={fetchData} />;
  return (
    <div className={`home ${isActive ? "aside--padding2" : "aside--padding"}`}>
      <CardSwiper
        title="Вам может понравится"
        linkTo="/catalog?sort=ranked"
        items={recommended}
      />
      <CardSwiper
        title="Свежие онгоинги"
        linkTo="/catalog?status=ongoing&sort=aired_on"
        items={ongoing}
      />
      <CardSwiper
        title="Популярное"
        linkTo="/catalog?sort=popularity"
        items={popular}
      />
    </div>
  );
}

export default Home;
