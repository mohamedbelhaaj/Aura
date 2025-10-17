import React, { useState } from "react";
import { 
  IonPage, 
  IonContent, 
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonAlert
} from "@ionic/react";
import  "../theme/EditProfile.css"
import { mail, lockClosed, flameSharp, arrowBack, checkmarkCircle } from "ionicons/icons";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useHistory } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Email, 2: Code + New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const history = useHistory();

  // Étape 1 : Envoyer le code de réinitialisation
  const handleSendCode = async () => {
    if (!email) {
      setMessage("Veuillez entrer votre email");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMessage("Format d'email invalide");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("");
      setStep(2);
    } catch (error: any) {
      console.error("Erreur d'envoi:", error);
      
      if (error.code === "auth/user-not-found") {
        setMessage("Aucun compte trouvé avec cet email");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Adresse email invalide");
      } else if (error.code === "auth/too-many-requests") {
        setMessage("Trop de tentatives. Réessayez plus tard");
      } else {
        setMessage("Erreur lors de l'envoi du code");
      }
    } finally {
      setLoading(false);
    }
  };

  // Étape 2 : Réinitialiser le mot de passe avec le code
  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      setMessage("Tous les champs sont requis");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await confirmPasswordReset(auth, code, newPassword);
      setShowSuccessAlert(true);
    } catch (error: any) {
      console.error("Erreur de réinitialisation:", error);
      
      if (error.code === "auth/invalid-action-code") {
        setMessage("Code invalide ou expiré");
      } else if (error.code === "auth/expired-action-code") {
        setMessage("Le code a expiré. Demandez-en un nouveau");
      } else if (error.code === "auth/weak-password") {
        setMessage("Le mot de passe est trop faible");
      } else {
        setMessage("Erreur lors de la réinitialisation");
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
      if (step === 1) {
        handleSendCode();
      } else {
        handleResetPassword();
      }
    }
  };

  const handleBackToLogin = () => {
    history.push("/login");
  };

  const handleResendCode = () => {
    setStep(1);
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="forgot-content">
        
        {/* Background Gradient */}
        <div className="gradient-bg"></div>
        
        <IonGrid className="main-grid">
          <IonRow className="ion-justify-content-center ion-align-items-center full-height">
            <IonCol size="12" sizeMd="8" sizeLg="5" sizeXl="4">
              
              {/* Back Button */}
              <button onClick={handleBackToLogin} className="back-btn" disabled={loading}>
                <IonIcon icon={arrowBack} />
                <span>Retour</span>
              </button>

              {/* Logo Header */}
              <div className="logo-header">
                <div className="flame-container">
                  <IonIcon icon={flameSharp} className="flame-logo" />
                </div>
                <h1 className="app-name">Aura</h1>
              </div>

              {/* Main Title */}
              <div className="main-title-section">
                {step === 1 ? (
                  <>
                    <h2 className="page-title">Mot de passe oublié ?</h2>
                    <p className="page-subtitle">Pas de souci ! Entrez votre email et nous vous enverrons un code de réinitialisation</p>
                  </>
                ) : (
                  <>
                    <h2 className="page-title">Vérifiez votre email</h2>
                    <p className="page-subtitle">Nous avons envoyé un code à <strong>{email}</strong></p>
                  </>
                )}
              </div>

              {/* Form Container */}
              <div className="form-wrapper">
                
                {step === 1 ? (
                  // STEP 1: Email Input
                  <>
                    <div className="input-field">
                      <div className="input-icon">
                        <IonIcon icon={mail} />
                      </div>
                      <input
                        type="email"
                        placeholder="Votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        className="custom-text-input"
                        autoFocus
                      />
                    </div>

                    {/* Error Message */}
                    {message && (
                      <div className="error-banner">
                        <span>{message}</span>
                      </div>
                    )}

                    {/* Send Code Button */}
                    <button 
                      onClick={handleSendCode} 
                      disabled={loading}
                      className="primary-btn"
                    >
                      {loading ? "Envoi en cours..." : "ENVOYER LE CODE"}
                    </button>
                  </>
                ) : (
                  // STEP 2: Code + New Password
                  <>
                    <div className="info-box">
                      <IonIcon icon={mail} className="info-icon" />
                      <p>Entrez le code à 6 chiffres envoyé à votre adresse email</p>
                    </div>

                    {/* Code Input */}
                    <div className="input-field">
                      <div className="input-icon">
                        <IonIcon icon={mail} />
                      </div>
                      <input
                        type="text"
                        placeholder="Code de vérification"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        className="custom-text-input"
                        maxLength={6}
                        autoFocus
                      />
                    </div>

                    {/* New Password Input */}
                    <div className="input-field">
                      <div className="input-icon">
                        <IonIcon icon={lockClosed} />
                      </div>
                      <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        className="custom-text-input"
                      />
                    </div>

                    {/* Confirm Password Input */}
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

                    {/* Reset Button */}
                    <button 
                      onClick={handleResetPassword} 
                      disabled={loading}
                      className="primary-btn"
                    >
                      {loading ? "Réinitialisation..." : "RÉINITIALISER"}
                    </button>

                    {/* Resend Code */}
                    <div className="resend-section">
                      <p>Vous n'avez pas reçu le code ?</p>
                      <button 
                        onClick={handleResendCode}
                        disabled={loading}
                        className="resend-btn"
                      >
                        Renvoyer le code
                      </button>
                    </div>
                  </>
                )}

              </div>

              {/* Footer Help */}
              <div className="help-section">
                <p>Besoin d'aide ? <span className="contact-link">Contactez-nous</span></p>
              </div>

            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading 
          isOpen={loading} 
          message={step === 1 ? "Envoi du code..." : "Réinitialisation..."}
          spinner="crescent"
          cssClass="custom-loader"
        />

        <IonAlert
          isOpen={showSuccessAlert}
          onDidDismiss={handleSuccessAlert}
          header="Mot de passe réinitialisé !"
          message="Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter."
          buttons={[
            {
              text: 'SE CONNECTER',
              handler: handleSuccessAlert
            }
          ]}
          cssClass="success-alert"
        />
      </IonContent>

      <style>{`
        /* ====================================== */
        /*     FORGOT PASSWORD - TINDER STYLE     */
        /* ====================================== */

        * {
          -webkit-tap-highlight-color: transparent;
        }

        .forgot-content {
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

        /* Back Button */
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          padding: 12px 0;
          margin-bottom: 20px;
          transition: opacity 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: fadeInLeft 0.6s ease-out;
        }

        .back-btn:hover:not(:disabled) {
          opacity: 0.8;
        }

        .back-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .back-btn ion-icon {
          font-size: 24px;
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

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
        }

        .page-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.6;
          font-weight: 400;
          padding: 0 20px;
        }

        .page-subtitle strong {
          font-weight: 600;
          color: #FFFFFF;
        }

        /* Form Wrapper */
        .form-wrapper {
          background: #FFFFFF;
          border-radius: 24px;
          padding: 32px 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.8s ease-out 0.3s both;
        }

        /* Info Box */
        .info-box {
          background: linear-gradient(135deg, #FFF5F7 0%, #FFE5EC 100%);
          border: 1px solid #FFD6E0;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-icon {
          font-size: 24px;
          color: #FE3C72;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-box p {
          margin: 0;
          font-size: 14px;
          color: #4A4A4A;
          line-height: 1.5;
          font-weight: 500;
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

        /* Primary Button */
        .primary-btn {
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
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(254, 60, 114, 0.4);
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(254, 60, 114, 0.5);
        }

        .primary-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Resend Section */
        .resend-section {
          text-align: center;
          margin-top: 16px;
        }

        .resend-section p {
          font-size: 14px;
          color: #8E8E93;
          margin: 0 0 8px 0;
        }

        .resend-btn {
          background: transparent;
          border: none;
          color: #FE3C72;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 16px;
          transition: opacity 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .resend-btn:hover:not(:disabled) {
          opacity: 0.7;
        }

        .resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Help Section */
        .help-section {
          text-align: center;
          margin-top: 24px;
          animation: fadeIn 0.8s ease-out 0.5s both;
        }

        .help-section p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-weight: 500;
        }

        .contact-link {
          color: #FFFFFF;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        .contact-link:hover {
          opacity: 0.8;
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
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

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

          .page-title {
            font-size: 28px;
          }

          .page-subtitle {
            font-size: 15px;
          }

          .form-wrapper {
            padding: 28px 20px;
          }

          .input-field {
            height: 56px;
          }

          .primary-btn {
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

          .primary-btn {
            height: 64px;
            font-size: 17px;
          }
        }

        @media (max-height: 700px) {
          .logo-header {
            margin-bottom: 20px;
          }

          .main-title-section {
            margin-bottom: 20px;
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

export default ForgotPassword;