import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { IonApp, IonContent, IonButton, IonIcon } from "@ionic/react";
import { getAuth, signOut } from "firebase/auth";
import "../theme/DashboardPage.css"
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useHistory } from "react-router-dom";
import { 
  personCircleOutline, 
  close, 
  heart, 
  flameSharp, 
  star,
  chatbubbleEllipses,
  refresh,
  informationCircle
} from "ionicons/icons";

/* ---------- Types ---------- */
interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  distance: string;
  images: string[];
  interests: string[];
}

interface DragState {
  isDragging: boolean;
  startX: number;
  currentX: number;
  startY: number;
  currentY: number;
}

/* ---------- Composant principal ---------- */
const DashboardPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    currentX: 0,
    startY: 0,
    currentY: 0,
  });
  const history = useHistory();

  const currentIndex = useRef(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const db = getFirestore(app);

  /* 🔥 Charger profils Firestore (exclure l'utilisateur connecté) */
  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const fetchedProfiles: Profile[] = snapshot.docs
        .filter((doc) => doc.id !== currentUser?.uid) // Exclure l'utilisateur connecté
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Profile, "id">),
        }));
      setProfiles(fetchedProfiles);
    });
    return () => unsubscribe();
  }, [db]);

  /* 🔄 Swipe */
  const swipe = useCallback((direction: "left" | "right" | "up") => {
    const currentCardRef = cardRefs.current[currentIndex.current];
    if (!currentCardRef) return;
    
    let moveX = 0;
    let moveY = 0;
    let rotate = 0;

    if (direction === "left") {
      moveX = -400;
      rotate = -20;
    } else if (direction === "right") {
      moveX = 400;
      rotate = 20;
    } else if (direction === "up") {
      moveY = -400;
      rotate = 0;
    }

    currentCardRef.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    currentCardRef.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg)`;
    currentCardRef.style.opacity = "0";
    
    setTimeout(() => {
      currentIndex.current += 1;
      setCurrentImageIndex(0);
    }, 300);
  }, []);

  /* 🖱 Gestion drag */
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragState({ 
      isDragging: true, 
      startX: clientX, 
      currentX: clientX,
      startY: clientY,
      currentY: clientY
    });
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragState.isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragState((prev) => ({ ...prev, currentX: clientX, currentY: clientY }));
    
    const diffX = clientX - dragState.startX;
    const diffY = clientY - dragState.startY;
    const card = cardRefs.current[currentIndex.current];
    if (!card) return;
    
    card.style.transition = "none";
    card.style.transform = `translate(${diffX}px, ${diffY}px) rotate(${diffX * 0.05}deg)`;
    
    // Visual feedback
    const opacity = Math.abs(diffX) / 150;
    if (diffX > 0) {
      card.style.setProperty('--like-opacity', Math.min(opacity, 1).toString());
      card.style.setProperty('--nope-opacity', '0');
    } else {
      card.style.setProperty('--nope-opacity', Math.min(opacity, 1).toString());
      card.style.setProperty('--like-opacity', '0');
    }
  };

  const handleDragEnd = () => {
    if (!dragState.isDragging) return;
    const diffX = dragState.currentX - dragState.startX;
    const diffY = dragState.currentY - dragState.startY;
    const threshold = 100;
    
    if (Math.abs(diffX) > threshold) {
      swipe(diffX > 0 ? "right" : "left");
    } else if (diffY < -threshold) {
      swipe("up");
    } else {
      const card = cardRefs.current[currentIndex.current];
      if (card) {
        card.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        card.style.transform = "translate(0, 0) rotate(0deg)";
        card.style.setProperty('--like-opacity', '0');
        card.style.setProperty('--nope-opacity', '0');
      }
    }
    setDragState({ isDragging: false, startX: 0, currentX: 0, startY: 0, currentY: 0 });
  };

  /* 📸 Navigation entre images */
  const handleImageNavigation = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.stopPropagation();
    const currentProfile = profiles[currentIndex.current];
    if (!currentProfile?.images) return;
    
    if (direction === 'next' && currentImageIndex < currentProfile.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  /* 🚪 Déconnexion */
  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    history.push("/login");
  };

  /* 💳 Affichage des cartes */
  const renderCards = useMemo(
    () =>
      profiles
        .slice(currentIndex.current, currentIndex.current + 3)
        .map((profile, index) => (
          <div
            key={profile.id}
            ref={(el) => (cardRefs.current[index] = el)}
            className={`tinder-card ${index === 0 ? 'active' : ''}`}
            style={{
              zIndex: 10 - index,
              transform: `translateY(${index * 8}px) scale(${1 - index * 0.04})`,
              opacity: 1 - index * 0.3,
            }}
            onMouseDown={index === 0 ? handleDragStart : undefined}
            onMouseMove={index === 0 ? handleDragMove : undefined}
            onMouseUp={index === 0 ? handleDragEnd : undefined}
            onMouseLeave={index === 0 ? handleDragEnd : undefined}
            onTouchStart={index === 0 ? handleDragStart : undefined}
            onTouchMove={index === 0 ? handleDragMove : undefined}
            onTouchEnd={index === 0 ? handleDragEnd : undefined}
          >
            {/* Like/Nope Stamps */}
            <div className="stamp like-stamp">LIKE</div>
            <div className="stamp nope-stamp">NOPE</div>
            
            {/* Image navigation zones */}
            {index === 0 && (
              <>
                <div 
                  className="nav-zone left-zone" 
                  onClick={(e) => handleImageNavigation(e, 'prev')}
                />
                <div 
                  className="nav-zone right-zone" 
                  onClick={(e) => handleImageNavigation(e, 'next')}
                />
              </>
            )}

            {/* Image indicators */}
            {profile.images && profile.images.length > 1 && (
              <div className="image-indicators">
                {profile.images.map((_, i) => (
                  <div 
                    key={i} 
                    className={`indicator ${i === currentImageIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            )}

            <img
              src={profile.images?.[currentImageIndex] || "/assets/default.jpg"}
              alt={profile.name}
              className="profile-image"
              draggable="false"
            />
            
            <div className="profile-overlay">
              <div className="profile-info">
                <div className="name-age">
                  <h2>{profile.name}, {profile.age}</h2>
                  <button className="info-btn">
                    <IonIcon icon={informationCircle} />
                  </button>
                </div>
                <p className="bio">{profile.bio}</p>
                <div className="meta-info">
                  <span className="distance">
                    📍 {profile.distance}
                  </span>
                </div>
                {profile.interests && profile.interests.length > 0 && (
                  <div className="interests">
                    {profile.interests.slice(0, 4).map((interest, i) => (
                      <span key={i} className="interest-tag">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )),
    [profiles, currentImageIndex, dragState]
  );

  return (
    <IonApp>
      <IonContent className="dashboard-content">
        {/* Top Bar */}
        <div className="top-bar">
          
          
          <div className="aura-logo">
            <IonIcon icon={flameSharp} className="logo-icon" />
            <span>Aura</span>
          </div>

          <div className="top-right-buttons">
            <button
              className="icon-btn ai-chat-btn"
              onClick={() => history.push("/ai-chat")}
              title="Chat avec AI"
            >
              <IonIcon icon={chatbubbleEllipses} />
              <span className="ai-badge">AI</span>
            </button>
            
            <button
              className="logout-text-btn"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Container des cartes */}
        <div className="tinder-container">
          {profiles.length > 0 ? renderCards : (
            <div className="empty-state">
              <IonIcon icon={refresh} className="empty-icon" />
              <h3>Aucun profil disponible</h3>
              <p>Revenez plus tard pour découvrir de nouvelles personnes</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="actions">
          <button 
            className="action-btn nope-btn"
            onClick={() => swipe("left")}
          >
            <IonIcon icon={close} />
          </button>
          
          <button 
            className="action-btn star-btn"
            onClick={() => swipe("up")}
          >
            <IonIcon icon={star} />
          </button>
          
          <button 
            className="action-btn like-btn"
            onClick={() => swipe("right")}
          >
            <IonIcon icon={heart} />
          </button>
        </div>

        {/* Bottom Navigation (optionnel) */}
        <div className="bottom-nav">
          <button className="nav-item active">
            <IonIcon icon={flameSharp} />
          </button>
          <button className="nav-item" onClick={() => history.push("/matches")}>
            <IonIcon icon={star} />
          </button>
          <button className="nav-item" onClick={() => history.push("/chat")}>
            <IonIcon icon={chatbubbleEllipses} />
          </button>
          <button className="nav-item" onClick={() => history.push("/edit-profile")}>
            <IonIcon icon={personCircleOutline} />
          </button>
        </div>
      </IonContent>
    </IonApp>
  );
};

export default DashboardPage;