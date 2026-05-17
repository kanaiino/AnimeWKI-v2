import "./Card.scss";

const typeMap = {
  tv: "ТВ сериал",
  movie: "Фильм",
  ova: "OVA",
  ona: "ONA",
  special: "Спешл",
  tv_special: "ТВ Спешл",
  music: "Музыка"
};

function Card({ title, image, type }) {
  const displayType = typeMap[type] || type?.toUpperCase() || "";

  return (
    <div className="card">
      <img src={image} alt={title} className="card-image" onError={(e) => (e.target.src = "/placeholder.jpg")} />
      {displayType && <div className="card-type">{displayType}</div>}
      <div className="card-title">{title}</div>
    </div>
  );
}

export default Card;