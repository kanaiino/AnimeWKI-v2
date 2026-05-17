import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Card from "../Card/Card";
import "./CardSwiper.scss";

function CardSwiper({ title, linkTo, items = [] }) {
  if (!items.length) return null;

  const getPosterUrl = (anime) => {
    const posterPath = anime.poster?.mainUrl || anime.image?.original;
    if (!posterPath) return null;
    return posterPath.startsWith("http")
      ? posterPath
      : `https://shikimori.one${posterPath}`;
  };

  return (
    <div className="home__container swiper">
        <Link to={linkTo} className="swiper-title">
          {title} ⭢
        </Link>
        <Swiper
          modules={[Navigation]}
          slidesPerView={2}
          spaceBetween={16}
          navigation
          breakpoints={{
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 5, spaceBetween: 24 },
            1440: { slidesPerView: 9, spaceBetween: 24 },
          }}
          className="swiper-cards"
        >
          {items.map((anime) => (
            <SwiperSlide key={anime.id}>
              <Link to={`/anime/${anime.id}`} className="anime-card-link">
                <Card
                  title={anime.russian || anime.name}
                  image={getPosterUrl(anime)}
                  type={anime.kind}
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
    </div>
  );
}

export default CardSwiper;
