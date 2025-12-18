import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ username = "John" }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">🍽️ At My Table</div>

        <ul className="nnavbar-links">
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="user">Your Kitchen</a>
          </li>
          <li>
            <a href="recipes">Recipes</a>
          </li>
          <li className="navbar-user">Hi, {username}</li>
        </ul>
      </div>
    </nav>
  );
}
