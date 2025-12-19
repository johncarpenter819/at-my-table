import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./global.css";
import LandingPage from "./Pages/LandingPage/LandingPage";
import UserLandingPage from "./Pages/UserLandingPage/UserLandingPage";
import RecipesPage from "./Pages/Recipes/RecipesPage";
import Navbar from "./Components/Nabar";
import Auth from "./Components/Auth";
import { supabase } from "./supabaseClient";

function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wakeUpSever = async () => {
      try {
        await fetch("https://at-my-table.onrender.com/api/recipes/health");
        console.log("Backend spinning up...");
      } catch (err) {
        console.log("Server wake-up ping sent.");
      }
    };

    wakeUpSever();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handStartTrial = () => setShowAuth(true);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <>
      <Navbar session={session} />
      {showAuth && !session && <Auth onBack={() => setShowAuth(false)} />}
      <Routes>
        <Route
          path="/"
          element={<LandingPage onStartTrial={handStartTrial} />}
        />
        <Route
          path="/user"
          element={session ? <UserLandingPage /> : <Navigate to="/" />}
        />
        <Route
          path="/recipes"
          element={
            session ? (
              <RecipesPage
                session={session}
                username={session.user.email?.split("@")[0]}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
