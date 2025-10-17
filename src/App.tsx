import React, { useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

/* Pages */
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfile from "./pages/EditProfile";
import ForgotPassword from "./pages/ForgotPassword";
import LoadingPage from "./pages/LoadingPage";
import MatchesPages from "./pages/MatchesPages";
import ChatPage from "./pages/ChatPage";

/* Ionic setup */
import "./theme/variables.css";
import "@ionic/react/css/core.css";

setupIonicReact();

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Routes publiques */}
          <Route exact path="/login">
            <LoginPage />
          </Route>
          <Route exact path="/register">
            <RegisterPage />
          </Route>
          <Route exact path="/forgot-password">
            <ForgotPassword />
          </Route>

          {/* Routes protégées */}
          <Route exact path="/dashboard">
            {user ? <DashboardPage /> : <Redirect to="/login" />}
          </Route>
          <Route exact path="/profile">
            {user ? <ProfilePage /> : <Redirect to="/login" />}
          </Route>
          <Route exact path="/edit-profile">
            {user ? <EditProfile /> : <Redirect to="/login" />}
          </Route>
          <Route exact path="/matches">
            {user ? <MatchesPages /> : <Redirect to="/login" />}
          </Route>
          <Route exact path="/chat">
            {user ? <ChatPage /> : <Redirect to="/login" />}
          </Route>

          {/* Redirect par défaut */}
          <Route exact path="/">
            <Redirect to={user ? "/dashboard" : "/login"} />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;