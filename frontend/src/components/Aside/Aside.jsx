import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Aside.scss";

const IconHome = () => (
  <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
    <path d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z" />
  </svg>
);

const IconLib = () => (
  <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
    <path d="M296.5 69.2C311.4 62.3 328.6 62.3 343.5 69.2L562.1 170.2C570.6 174.1 576 182.6 576 192C576 201.4 570.6 209.9 562.1 213.8L343.5 314.8C328.6 321.7 311.4 321.7 296.5 314.8L77.9 213.8C69.4 209.8 64 201.3 64 192C64 182.7 69.4 174.1 77.9 170.2L296.5 69.2zM112.1 282.4L276.4 358.3C304.1 371.1 336 371.1 363.7 358.3L528 282.4L562.1 298.2C570.6 302.1 576 310.6 576 320C576 329.4 570.6 337.9 562.1 341.8L343.5 442.8C328.6 449.7 311.4 449.7 296.5 442.8L77.9 341.8C69.4 337.8 64 329.3 64 320C64 310.7 69.4 302.1 77.9 298.2L112 282.4zM77.9 426.2L112 410.4L276.3 486.3C304 499.1 335.9 499.1 363.6 486.3L527.9 410.4L562 426.2C570.5 430.1 575.9 438.6 575.9 448C575.9 457.4 570.5 465.9 562 469.8L343.4 570.8C328.5 577.7 311.3 577.7 296.4 570.8L77.9 469.8C69.4 465.8 64 457.3 64 448C64 438.7 69.4 430.1 77.9 426.2z" />
  </svg>
);

const IconUser = () => (
  <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
    <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
  </svg>
);

function Aside({ isActive, onClose, isMobile }) {
  const { user, logout } = useAuth();

  const handleLinkClick = () => {
    if (isMobile && typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <aside className={`aside ${isActive ? "aside--collapsed" : ""}`}>
      <div className="aside__container">
        <div className="aside__nav">
          <Link to="/" className="logo logo-green" onClick={handleLinkClick}>
            ANIMEWKI
          </Link>
          <Link to="/" className="aside__nav-item" onClick={handleLinkClick}>
            <IconHome />
            <span>Главная</span>
          </Link>
          <Link to="/catalog" className="aside__nav-item" onClick={handleLinkClick}>
            <IconLib />
            <span>Каталог</span>
          </Link>
          <Link to="/profile" className="aside__nav-item" onClick={handleLinkClick}>
            <IconUser />
            <span>Личный кабинет</span>
          </Link>
        </div>
        {isActive &&
          (user ? (
            <div className="aside__auth">
              <button onClick={logout} className="btn btn-red">
                Выйти
              </button>
            </div>
          ) : (
            <div className="aside__auth">
              <Link to="/login" className="btn btn-green" onClick={handleLinkClick}>
                Войти
              </Link>
            </div>
          ))}
      </div>
    </aside>
  );
}

export default Aside;