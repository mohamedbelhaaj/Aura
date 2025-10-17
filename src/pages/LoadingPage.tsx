import React from "react";
// Les imports Ionic et ionicons ont été supprimés pour résoudre les erreurs de dépendances.

// Définition des couleurs du thème rosé
const GRADIENT_START = "#f093fb"; // Rose pastel
const GRADIENT_END = "#f5576c"; // Corail
const PRIMARY_ROSE = "#E91E63"; // Rose framboise

const LoadingPage: React.FC = () => {
  return (
    // Remplacement de IonPage par une div principale
    <div className="aura-page-container">
      
      {/* ---------------------------------------------------- */}
      {/* EFFETS D'ARRIÈRE-PLAN ANIMÉS (Responsive) */}
      {/* ---------------------------------------------------- */}
      <div className="background-overlay" />
      
      {/* Remplacement de IonContent par une div de contenu centrée */}
      <div className="aura-content-wrapper">
        
        {/* Container principal (pour limiter la largeur sur desktop) */}
        <div className="loading-container">
          
          {/* Logo Aura avec animation subtile */}
          <div className="logo-wrapper">
            <div className="icon-glow-container">
              {/* Remplacement de IonIcon heart par un emoji ❤️ */}
              <span 
                role="img" 
                aria-label="Heart Icon" 
                className="main-icon-loading"
              >
                ❤️
              </span>
              <div className="pulse-glow" />
            </div>
            
            <h1 className="app-title-loading">
              Aura
            </h1>
          </div>

          {/* Spinner premium avec design moderne */}
          <div className="spinner-wrapper">
            {/* Cercle externe animé */}
            <div className="spinner-circle spinner-outer" />
            
            {/* Cercle progressif */}
            <div className="spinner-circle spinner-inner" />
            
            {/* Cœur central avec pulsation (emoji) */}
            <span 
              role="img" 
              aria-label="Heart Icon" 
              className="center-heart-icon"
            >
              ❤️
            </span>
          </div>

          {/* Contenu textuel */}
          <div className="text-content">
            <h2 className="loading-message">
              Rencontrez votre
              <br />
              <span className="gradient-text">
                prochaine étincelle
              </span>
            </h2>
            <p className="loading-subtitle">
              Nous personnalisons votre expérience pour des rencontres authentiques
            </p>
          </div>

          {/* Indicateurs de progression (Points animés) */}
          <div className="dots-indicator">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="dot"
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* ---------------------------------------------------- */
        /* STYLES GÉNÉRAUX ET RESPONSIVITÉ */
        /* ---------------------------------------------------- */
        
        /* Conteneur de page (remplace IonPage) */
        .aura-page-container {
            background: linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%);
            position: relative;
            overflow: hidden;
            width: 100%;
            min-height: 100vh;
            display: flex; /* Assure que le contenu peut être centré */
        }

        /* Conteneur de contenu (remplace IonContent) */
        .aura-content-wrapper {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
            flex-grow: 1;
            position: relative;
            z-index: 2;
            padding: 20px;
        }
        
        .loading-container {
            max-width: 400px;
            width: 100%;
            padding: 0 20px;
            box-sizing: border-box;
        }

        .background-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
            animation: backgroundShift 12s ease-in-out infinite alternate;
            z-index: 1;
        }

        .logo-wrapper {
            margin-bottom: 50px;
            text-align: center;
            animation: logoFloat 3s ease-in-out infinite;
        }

        .icon-glow-container {
            position: relative;
            display: inline-block;
        }

        /* Styles de l'icône (emoji) principale */
        .main-icon-loading {
            font-size: 90px; 
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
            line-height: 1; /* Assure un bon alignement vertical pour l'emoji */
            display: inline-block;
        }

        .pulse-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            border-radius: 50%;
            animation: pulseGlow 2s ease-in-out infinite;
        }

        .app-title-loading {
            font-size: 46px; 
            font-weight: 800;
            margin: 20px 0 0;
            letter-spacing: -1.5px;
            text-shadow: 0 4px 15px rgba(0,0,0,0.3);
            background: linear-gradient(135deg, #ffffff 0%, #ffe6eb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
        }

        /* Spinner */
        .spinner-wrapper {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .spinner-circle {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }

        .spinner-outer {
            border: 3px solid rgba(255, 255, 255, 0.2);
            animation: rotate 2s linear infinite;
        }

        .spinner-inner {
            border: 3px solid transparent;
            border-top: 3px solid white;
            animation: rotate 1.5s ease-in-out infinite;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        }

        /* Styles de l'icône (emoji) centrale */
        .center-heart-icon {
            font-size: 36px;
            animation: heartbeat 1.5s ease-in-out infinite;
            filter: drop-shadow(0 2px 8px rgba(253, 41, 123, 0.6));
            line-height: 1;
            display: inline-block;
        }

        /* Texte */
        .text-content {
            margin-bottom: 40px;
        }

        .loading-message { 
            color: white;
            font-weight: 700;
            font-size: 28px;
            margin: 0 0 12px;
            line-height: 1.2;
            text-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .gradient-text {
            background: linear-gradient(135deg, #ffffff 0%, #ffe6eb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
            display: inline-block;
        }

        .loading-subtitle { 
            color: rgba(255, 255, 255, 0.85);
            font-size: 16px;
            font-weight: 400;
            line-height: 1.5;
            max-width: 280px;
            margin: 12px auto 0;
        }

        /* Indicateur de points */
        .dots-indicator {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 40px;
            gap: 12px;
        }

        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: white;
            opacity: 0.6;
            animation: bounce 1.4s ease-in-out infinite both;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }


        /* ---------------------------------------------------- */
        /* KEYFRAMES */
        /* ---------------------------------------------------- */
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.4;
          }
          40% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes backgroundShift {
          0% { 
            transform: translateX(-10px) translateY(-10px);
            opacity: 0.9;
          }
          100% { 
            transform: translateX(10px) translateY(10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;
