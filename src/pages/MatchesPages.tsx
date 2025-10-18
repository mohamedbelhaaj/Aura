import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Flame, MapPin, Clock} from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Match {
  id: string;
  name: string;
  age: number;
  avatar: string;
  lastMessage?: string;
  online?: boolean;
  distance?: string;
  lastActive?: string;
  isNew?: boolean;
}

const MatchesPages: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  // Fonction pour calculer le temps écoulé et le statut en ligne
  const calculateTimeInfo = (createdAt: Timestamp) => {
    const matchDate = createdAt.toDate();
    const now = new Date();
    const diffMs = now.getTime() - matchDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let lastActive = '';
    let isOnline = false;
    let isNew = false;

    if (diffMins < 5) {
      lastActive = "À l'instant";
      isOnline = true;
    } else if (diffMins < 60) {
      lastActive = `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      lastActive = `Il y a ${diffHours}h`;
      isNew = true; // Nouveau si moins de 24h
    } else if (diffDays < 7) {
      lastActive = `Il y a ${diffDays}j`;
    } else {
      lastActive = matchDate.toLocaleDateString('fr-FR');
    }

    return { lastActive, isOnline, isNew };
  };

  // Fonction pour calculer la distance approximative (placeholder)
  const calculateDistance = () => {
    // TODO: Implémenter le calcul réel avec la géolocalisation
    const distances = ['1 km', '2 km', '3 km', '5 km', '8 km', '10 km'];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  // Fonction pour récupérer le dernier message d'une conversation
  const getLastMessage = async (userId: string, matchedUserId: string) => {
    try {
      // Créer l'ID de conversation (ordre alphabétique des IDs)
      const conversationId = [userId, matchedUserId].sort().join('_');
      
      // Récupérer le dernier message
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
      const messagesSnapshot = await getDocs(q);
      
      if (!messagesSnapshot.empty) {
        const lastMsg = messagesSnapshot.docs[0].data();
        return lastMsg.text || 'Photo envoyée 📷';
      }
      
      return 'Nouveau match ! 💕';
    } catch (error) {
      console.error('Erreur lors de la récupération du dernier message:', error);
      return 'Dites bonjour ! 👋';
    }
  };

  // Charger les matches depuis Firestore
  useEffect(() => {
    const loadMatchesFromFirestore = async () => {
      setLoading(true);
      
      try {
        // TODO: Remplacer par l'ID de l'utilisateur connecté (depuis votre contexte d'auth)
        const currentUserId = "OOMaHAIs51X5Pi2yVnm3mseuLtl1";
        
        // Requête Firestore pour récupérer les matches
        const matchesRef = collection(db, 'matches');
        const q = query(
          matchesRef, 
          where('userId', '==', currentUserId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const matchesData: Match[] = [];
        
        // Traiter chaque match
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          
          // Calculer les informations temporelles
          const { lastActive, isOnline, isNew } = calculateTimeInfo(data.createdAt);
          
          // Récupérer le dernier message
          const lastMessage = await getLastMessage(currentUserId, data.matchedUserId);
          
          matchesData.push({
            id: data.matchedUserId,
            name: data.name,
            age: data.age,
            avatar: data.image,
            lastMessage: lastMessage,
            online: isOnline,
            distance: calculateDistance(), // TODO: Calculer la vraie distance
            lastActive: lastActive,
            isNew: isNew
          });
        }
        
        setMatches(matchesData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des matches:", error);
        setLoading(false);
      }
    };

    loadMatchesFromFirestore();
  }, []);

  const handleMatchClick = (match: Match) => {
    history.push('/chat', { 
      selectedMatch: match,
      matches: matches 
    });
  };

  const handleLikeClick = (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation();
    // TODO: Logique pour liker/unliker
    console.log('Like clicked for:', matchId);
  };

  if (loading) {
    return (
      <div className="matches-loading">
        <Flame className="loading-flame" size={48} color="#f43f5e" />
        <p>Chargement de vos matches...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .matches-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%);
          padding: 20px;
        }

        .matches-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .matches-title {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }

        .matches-subtitle {
          color: #6b7280;
          font-size: 16px;
        }

        .matches-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .match-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        .match-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(244, 63, 94, 0.3);
        }

        .match-card-header {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .match-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .match-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          padding: 20px;
          color: white;
        }

        .match-name-age {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .match-name {
          font-size: 24px;
          font-weight: 600;
        }

        .match-age {
          font-size: 18px;
          opacity: 0.9;
        }

        .match-status {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .match-status.online {
          background: #10b981;
          color: white;
        }

        .new-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #f43f5e;
          color: white;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .match-card-body {
          padding: 20px;
        }

        .match-info {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          color: #6b7280;
          font-size: 14px;
        }

        .match-info-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .match-last-message {
          background: #fdf2f8;
          padding: 10px 15px;
          border-radius: 15px;
          color: #374151;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .match-actions {
          display: flex;
          gap: 10px;
        }

        .match-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .btn-message {
          background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);
          color: white;
        }

        .btn-message:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.4);
        }

        .btn-like {
          background: white;
          color: #f43f5e;
          border: 2px solid #f43f5e;
        }

        .btn-like:hover {
          background: #f43f5e;
          color: white;
        }

        .matches-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
        }

        .loading-flame {
          animation: flame 1.5s ease-in-out infinite alternate;
        }

        @keyframes flame {
          0% { transform: scale(1) rotate(-5deg); }
          100% { transform: scale(1.1) rotate(5deg); }
        }

        .empty-matches {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-matches-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .matches-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="matches-container">
        <div className="matches-header">
          <h1 className="matches-title">
            <Flame size={32} color="#f43f5e" style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Vos Matches
          </h1>
          <p className="matches-subtitle">
            {matches.length} personnes vous attendent pour discuter
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="empty-matches">
            <div className="empty-matches-icon">💔</div>
            <h3>Pas encore de matches</h3>
            <p>Continuez à swiper pour trouver votre âme sœur !</p>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((match) => (
              <div 
                key={match.id} 
                className="match-card"
                onClick={() => handleMatchClick(match)}
              >
                {match.isNew && (
                  <div className="new-badge">Nouveau</div>
                )}
                
                <div className="match-card-header">
                  <img 
                    src={match.avatar} 
                    alt={match.name} 
                    className="match-avatar"
                  />
                  <div className="match-overlay">
                    <div className="match-name-age">
                      <span className="match-name">{match.name}</span>
                      <span className="match-age">{match.age}</span>
                    </div>
                  </div>
                  
                  <div className={`match-status ${match.online ? 'online' : ''}`}>
                    {match.online ? 'En ligne' : 'Hors ligne'}
                  </div>
                </div>

                <div className="match-card-body">
                  <div className="match-info">
                    <div className="match-info-item">
                      <MapPin size={16} />
                      <span>{match.distance}</span>
                    </div>
                    <div className="match-info-item">
                      <Clock size={16} />
                      <span>{match.lastActive}</span>
                    </div>
                  </div>

                  {match.lastMessage && (
                    <div className="match-last-message">
                      "{match.lastMessage}"
                    </div>
                  )}

                  <div className="match-actions">
                    <button 
                      className="match-btn btn-message"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMatchClick(match);
                      }}
                    >
                      <MessageCircle size={16} />
                      Message
                    </button>
                    <button 
                      className="match-btn btn-like"
                      onClick={(e) => handleLikeClick(e, match.id)}
                    >
                      <Heart size={16} />
                      Like
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MatchesPages;