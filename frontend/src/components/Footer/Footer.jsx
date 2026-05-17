import "./Footer.scss";

function Footer({ isActive }) {
  return (
    <div
      className={`footer ${isActive ? "aside--padding2" : "aside--padding"}`}
    >
      © kanaiino 2026
    </div>
  );
}

export default Footer;
