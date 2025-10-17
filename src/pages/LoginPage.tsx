import React, { useState } from "react";
import { useHistory } from 'react-router-dom'; // ← Changé ici
import { 
  IonPage, 
  IonContent, 
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon
} from "@ionic/react";
import { mail, lockClosed, flameSharp } from "ionicons/icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory(); // ← Changé ici

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Tous les champs sont requis");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Format d'email invalide");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setTimeout(() => {
        history.push("/dashboard"); // ← Changé ici
      }, 500);
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      
      if (error.code === "auth/invalid-email") {
        setMessage("Adresse email invalide");
      } else if (error.code === "auth/user-not-found") {
        setMessage("Aucun compte trouvé avec cet email");
      } else if (error.code === "auth/wrong-password") {
        setMessage("Email ou mot de passe incorrect");
      } else if (error.code === "auth/too-many-requests") {
        setMessage("Trop de tentatives. Réessayez plus tard");
      } else if (error.code === "auth/invalid-credential") {
        setMessage("Email ou mot de passe incorrect");
      } else {
        setMessage("Erreur de connexion. Veuillez réessayer");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        
        {/* Background Gradient */}
        <div className="gradient-bg"></div>
        
        <IonGrid className="main-grid">
          <IonRow className="ion-justify-content-center ion-align-items-center full-height">
            <IonCol size="12" sizeMd="8" sizeLg="5" sizeXl="4">
              
              {/* Logo Header */}
              <div className="logo-header">
                <div className="flame-container">
                  <IonIcon icon={flameSharp} className="flame-logo" />
                </div>
                <h1 className="app-name">Aura</h1>
              </div>

              {/* Main Title */}
              <div className="main-title-section">
                <h2 className="login-title">Bon retour !</h2>
                <p className="login-subtitle">Connectez-vous pour continuer votre aventure</p>
              </div>

              {/* Form Container */}
              <div className="form-wrapper">
                
                {/* Email Field */}
                <div className="input-field">
                  <div className="input-icon">
                    <IonIcon icon={mail} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="custom-text-input"
                  />
                </div>

                {/* Password Field */}
                <div className="input-field">
                  <div className="input-icon">
                    <IonIcon icon={lockClosed} />
                  </div>
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="custom-text-input"
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="forgot-password">
                  <button 
                    onClick={() => history.push("/forgot-password")} // ← Changé ici
                    className="forgot-btn"
                    disabled={loading}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Error Message */}
                {message && (
                  <div className="error-banner">
                    <span>{message}</span>
                  </div>
                )}

                {/* Login Button */}
                <button 
                  onClick={handleLogin} 
                  disabled={loading}
                  className="login-btn"
                >
                  {loading ? "Connexion..." : "SE CONNECTER"}
                </button>

                {/* Divider */}
                <div className="divider">
                  <span>OU</span>
                </div>

                {/* Social Login Buttons */}
                <button className="social-btn google-btn" disabled={loading}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </button>

                <button className="social-btn apple-btn" disabled={loading}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continuer avec Apple
                </button>
              </div>

              {/* Register Link */}
              <div className="register-redirect">
                <p>Nouveau sur Aura ?</p>
                <button 
                  onClick={() => history.push("/register")} // ← Changé ici
                  disabled={loading}
                  className="register-link-btn"
                >
                  CRÉER UN COMPTE
                </button>
              </div>

            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading 
          isOpen={loading} 
          message="Connexion en cours..." 
          spinner="crescent"
          cssClass="custom-loader"
        />
      </IonContent>

      <style>{`
        /* ====================================== */
        /*        TINDER LOGIN - MODERN DESIGN    */
        /* ====================================== */

        * {
          -webkit-tap-highlight-color: transparent;
        }

        .login-content {
          --background: #FFFFFF;
        }

        /* Background Gradient */
        .gradient-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 45vh;
          background: linear-gradient(180deg, #FF6B9D 0%, #FE3C72 50%, #E8325F 100%);
          z-index: 0;
        }

        .main-grid {
          position: relative;
          z-index: 1;
          height: 100%;
          padding: 0;
          margin: 0;
        }

        .full-height {
          min-height: 100vh;
          padding: 20px 16px;
        }

        /* Logo Header */
        .logo-header {
          text-align: center;
          margin-bottom: 32px;
          animation: fadeInDown 0.8s ease-out;
        }

        .flame-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          backdrop-filter: blur(10px);
          margin-bottom: 12px;
          animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .flame-logo {
          font-size: 48px;
          color: #FFFFFF;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
          animation: flicker 2s ease-in-out infinite;
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }

        .app-name {
          font-size: 42px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0;
          letter-spacing: -1px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* Main Title Section */
        .main-title-section {
          text-align: center;
          margin-bottom: 32px;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .login-title {
          font-size: 32px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.5;
          font-weight: 400;
          padding: 0 20px;
        }

        /* Form Wrapper */
        .form-wrapper {
          background: #FFFFFF;
          border-radius: 24px;
          padding: 32px 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.8s ease-out 0.3s both;
        }

        /* Input Fields */
        .input-field {
          position: relative;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          background: #F6F6F6;
          border-radius: 16px;
          padding: 0 16px;
          height: 60px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .input-field:focus-within {
          background: #FFFFFF;
          border-color: #FE3C72;
          box-shadow: 0 0 0 4px rgba(254, 60, 114, 0.1);
        }

        .input-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: #8E8E93;
          font-size: 20px;
        }

        .input-field:focus-within .input-icon {
          color: #FE3C72;
        }

        .custom-text-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
          font-weight: 500;
          color: #1C1C1E;
          outline: none;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .custom-text-input::placeholder {
          color: #8E8E93;
          font-weight: 400;
        }

        .custom-text-input:disabled {
          opacity: 0.5;
        }

        /* Forgot Password */
        .forgot-password {
          text-align: right;
          margin-bottom: 20px;
        }

        .forgot-btn {
          background: transparent;
          border: none;
          color: #FE3C72;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 0;
          transition: opacity 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .forgot-btn:hover:not(:disabled) {
          opacity: 0.7;
        }

        .forgot-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Error Banner */
        .error-banner {
          background: #FFF5F5;
          color: #E53E3E;
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          border-left: 4px solid #E53E3E;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        /* Login Button */
        .login-btn {
          width: 100%;
          height: 60px;
          background: linear-gradient(135deg, #FF6B9D 0%, #FE3C72 100%);
          border: none;
          border-radius: 30px;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(254, 60, 114, 0.4);
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(254, 60, 114, 0.5);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: #8E8E93;
          font-size: 13px;
          font-weight: 600;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #E5E5EA;
        }

        .divider span {
          padding: 0 16px;
        }

        /* Social Buttons */
        .social-btn {
          width: 100%;
          height: 56px;
          border-radius: 28px;
          border: 2px solid #E5E5EA;
          background: #FFFFFF;
          color: #1C1C1E;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .social-btn:hover:not(:disabled) {
          background: #F6F6F6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .social-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .apple-btn {
          background: #000000;
          color: #FFFFFF;
          border-color: #000000;
        }

        .apple-btn:hover:not(:disabled) {
          background: #1C1C1E;
        }

        /* Register Redirect */
        .register-redirect {
          text-align: center;
          margin-top: 24px;
          animation: fadeIn 0.8s ease-out 0.5s both;
        }

        .register-redirect p {
          font-size: 15px;
          color: #FFFFFF;
          margin: 0 0 12px 0;
          font-weight: 500;
        }

        .register-link-btn {
          background: transparent;
          border: 2px solid #FFFFFF;
          color: #FFFFFF;
          padding: 14px 40px;
          border-radius: 30px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .register-link-btn:hover:not(:disabled) {
          background: #FFFFFF;
          color: #FE3C72;
          transform: scale(1.05);
        }

        .register-link-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Custom Loader */
        .custom-loader {
          --background: rgba(0, 0, 0, 0.85);
          --spinner-color: #FE3C72;
          backdrop-filter: blur(10px);
        }

        /* Animations */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* ====================================== */
        /*            RESPONSIVE DESIGN           */
        /* ====================================== */

        @media (max-width: 576px) {
          .full-height {
            padding: 16px 12px;
          }

          .flame-container {
            width: 70px;
            height: 70px;
          }

          .flame-logo {
            font-size: 42px;
          }

          .app-name {
            font-size: 36px;
          }

          .login-title {
            font-size: 28px;
          }

          .login-subtitle {
            font-size: 15px;
          }

          .form-wrapper {
            padding: 28px 20px;
          }

          .input-field {
            height: 56px;
          }

          .login-btn {
            height: 56px;
            font-size: 15px;
          }

          .social-btn {
            height: 52px;
            font-size: 14px;
          }
        }

        @media (min-width: 768px) {
          .gradient-bg {
            height: 50vh;
          }

          .full-height {
            padding: 40px 24px;
          }

          .form-wrapper {
            padding: 40px 32px;
          }

          .main-title-section {
            margin-bottom: 40px;
          }
        }

        @media (min-width: 992px) {
          .form-wrapper {
            padding: 48px 40px;
          }

          .input-field {
            height: 64px;
          }

          .login-btn {
            height: 64px;
            font-size: 17px;
          }

          .social-btn {
            height: 58px;
          }
        }

        @media (max-height: 700px) {
          .logo-header {
            margin-bottom: 24px;
          }

          .main-title-section {
            margin-bottom: 24px;
          }

          .flame-container {
            width: 60px;
            height: 60px;
          }

          .flame-logo {
            font-size: 36px;
          }

          .app-name {
            font-size: 32px;
          }
        }

        @media (min-width: 768px) and (max-height: 800px) {
          .full-height {
            padding: 32px 24px;
          }
        }
      `}</style>
    </IonPage>
  );
};

export default LoginPage;