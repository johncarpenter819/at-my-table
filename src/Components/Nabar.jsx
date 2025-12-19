import { Link, NavLink } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Navbar.css";

export default function Navbar({ session }) {
  const username = session?.user?.email?.split("@")[0] || "Guest";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      Navigate("/");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">🍽️ At My Table</div>

        <ul className="navbar-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/user">Your Kitchen</Link>
          </li>
          <li>
            <Link to="/recipes">Recipes</Link>
          </li>
          <li className="navbar-user">Hi, {username}</li>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </ul>
      </div>
    </nav>
  );
}
