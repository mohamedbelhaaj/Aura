import React, { useState } from "react";
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonInput, 
  IonButton, 
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonIcon
} from "@ionic/react";
import { person, mail, lockClosed, flameSharp, checkmarkCircle } from "ionicons/icons";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useHistory } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const history = useHistory();

  const validateForm = (): boolean => {
    if (!email || !password || !confirmPassword) {
      setMessage("Tous les champs sont requis");
      return false;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMessage("Format d'email invalide");
      return false;
    }

    if (password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName.trim()) {
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        });
      }

      setShowSuccessAlert(true);
      
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setMessage("Cet email est déjà utilisé");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Adresse email invalide");
      } else if (error.code === "auth/weak-password") {
        setMessage("Le mot de passe est trop faible");
      } else if (error.code === "auth/operation-not-allowed") {
        setMessage("L'inscription par email/mot de passe n'est pas activée");
      } else {
        setMessage("Erreur lors de l'inscription: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessAlert = () => {
    setShowSuccessAlert(false);
    history.push("/login");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="register-content">
        
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
                <h2 className="signup-title">Créer un compte</h2>
                <p className="signup-subtitle">Rejoignez des milliers de personnes qui trouvent l'amour sur Aura</p>
              </div>

              {/* Form Container */}
              <div className="form-wrapper">
                
                {/* Name Field */}
                <div className="input-field">
                  <div className="input-icon">
                    <IonIcon icon={person} />
                  </div>
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="custom-text-input"
                  />
                </div>

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

                {/* Confirm Password Field */}
                <div className="input-field">
                  <div className="input-icon">
                    <IonIcon icon={lockClosed} />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="custom-text-input"
                  />
                </div>

                {/* Error Message */}
                {message && (
                  <div className="error-banner">
                    <span>{message}</span>
                  </div>
                )}

                {/* Register Button */}
                <button 
                  onClick={handleRegister} 
                  disabled={loading}
                  className="register-btn"
                >
                  {loading ? "Création..." : "CRÉER MON COMPTE"}
                </button>

                {/* Terms */}
                <p className="terms">
                  En continuant, vous acceptez nos <span>Conditions</span> et notre <span>Politique de confidentialité</span>
                </p>
              </div>

              {/* Login Link */}
              <div className="login-redirect">
                <p>Vous avez déjà un compte ?</p>
                <button 
                  onClick={() => history.push("/login")}
                  disabled={loading}
                  className="login-link-btn"
                >
                  SE CONNECTER
                </button>
              </div>

            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading 
          isOpen={loading} 
          message="Création de votre compte..." 
          spinner="crescent"
          cssClass="custom-loader"
        />

        <IonAlert
          isOpen={showSuccessAlert}
          onDidDismiss={handleSuccessAlert}
          header="🎉 Bienvenue !"
          message="Votre compte a été créé. Commencez votre aventure maintenant !"
          buttons={[
            {
              text: 'COMMENCER',
              handler: handleSuccessAlert
            }
          ]}
          cssClass="success-alert"
        />
      </IonContent>

      <style>{`
        /* ====================================== */
        /*           TINDER MODERN DESIGN         */
        /* ====================================== */

        * {
          -webkit-tap-highlight-color: transparent;
        }

        .register-content {
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

        .signup-title {
          font-size: 32px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .signup-subtitle {
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

        /* Register Button */
        .register-btn {
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
          margin: 24px 0 16px 0;
          box-shadow: 0 8px 24px rgba(254, 60, 114, 0.4);
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .register-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(254, 60, 114, 0.5);
        }

        .register-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Terms */
        .terms {
          text-align: center;
          font-size: 12px;
          color: #8E8E93;
          line-height: 1.6;
          margin: 0;
          padding: 0 8px;
        }

        .terms span {
          color: #FE3C72;
          font-weight: 600;
          cursor: pointer;
        }

        /* Login Redirect */
        .login-redirect {
          text-align: center;
          margin-top: 24px;
          animation: fadeIn 0.8s ease-out 0.5s both;
        }

        .login-redirect p {
          font-size: 15px;
          color: #FFFFFF;
          margin: 0 0 12px 0;
          font-weight: 500;
        }

        .login-link-btn {
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

        .login-link-btn:hover:not(:disabled) {
          background: #FFFFFF;
          color: #FE3C72;
          transform: scale(1.05);
        }

        .login-link-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Custom Loader */
        .custom-loader {
          --background: rgba(0, 0, 0, 0.85);
          --spinner-color: #FE3C72;
          backdrop-filter: blur(10px);
        }

        /* Success Alert */
        .success-alert {
          --background: #FFFFFF;
          --max-width: 320px;
        }

        .success-alert .alert-button-group button {
          color: #FE3C72 !important;
          font-weight: 700 !important;
          font-size: 15px !important;
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

          .signup-title {
            font-size: 28px;
          }

          .signup-subtitle {
            font-size: 15px;
          }

          .form-wrapper {
            padding: 28px 20px;
          }

          .input-field {
            height: 56px;
          }

          .register-btn {
            height: 56px;
            font-size: 15px;
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

          .register-btn {
            height: 64px;
            font-size: 17px;
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
      `}</style>
    </IonPage>
  );
};

export default RegisterPage;