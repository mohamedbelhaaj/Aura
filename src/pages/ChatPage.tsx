import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, MessageCircle, Flame } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';  // ✅ CORRECT - import from auth
import { db } from '../firebaseConfig';

/* ----------  TYPES  ---------- */
type Message = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  senderId: string;
  timestamp: Date;
  read?: boolean;
};

type FirestoreMessage = {
  text: string;
  senderId: string;
  timestamp: Timestamp | ReturnType<typeof serverTimestamp>;
  read: boolean;
};

type Match = {
  id: string; 
  name: string;
  age: number;
  avatar: string;
  lastMessage?: string;
  online?: boolean;
};

type LocationState = {
  selectedMatch?: Match;
  matches?: Match[];
};

/* ----------  HELPER FUNCTIONS  ---------- */
// Générer un ID de conversation unique (toujours le même ordre pour 2 utilisateurs)
const generateConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

/* ----------  COMPOSANT  ---------- */
export default function AuraChatApp() {
  /* ----- routing ----- */
  const { state } = useLocation() as { state?: LocationState };
  const { selectedMatch: initialMatch, matches: initialMatches } = state || {};

  /* ----- Get current user from Firebase Auth ----- */
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const CURRENT_USER_ID = currentUser?.uid || '';

  console.log('🔥 Current User ID:', CURRENT_USER_ID);

  /* ----- état local ----- */
  const [matchesList] = useState<Match[]>(initialMatches || []);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(
    initialMatch || (initialMatches?.[0] ?? null)
  );

  /* messages stockés par match */
  const [messagesByMatchId, setMessagesByMatchId] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = selectedMatch ? (messagesByMatchId[selectedMatch.id] || []) : [];
  const conversationId = selectedMatch ? generateConversationId(CURRENT_USER_ID, selectedMatch.id) : '';

  console.log('💬 Selected Match:', selectedMatch?.name);
  console.log('🔑 Conversation ID:', conversationId);

  /* ----- Écouter les messages en temps réel depuis Firestore ----- */
  useEffect(() => {
    if (!selectedMatch?.id || !CURRENT_USER_ID) {
      console.log('❌ Pas de match sélectionné ou utilisateur non connecté');
      return;
    }

    setLoading(true);
    const conversationId = generateConversationId(CURRENT_USER_ID, selectedMatch.id);

    console.log('👂 Écoute des messages pour conversation:', conversationId);

    // ✅ CORRECT: Écouter les messages dans conversations/{conversationId}/messages
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      messagesQuery, 
      (snapshot) => {
        const fetchedMessages: Message[] = [];
        
        console.log('📨 Nombre de messages reçus:', snapshot.docs.length);
        
        snapshot.forEach((doc) => {
          const data = doc.data() as FirestoreMessage;
          console.log('📩 Message:', { id: doc.id, text: data.text, senderId: data.senderId });
          
          fetchedMessages.push({
            id: doc.id,
            text: data.text,
            sender: data.senderId === CURRENT_USER_ID ? 'me' : 'them',
            senderId: data.senderId,
            timestamp: data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate() 
              : new Date(),
            read: data.read || false,
          });
        });

        setMessagesByMatchId((prev) => ({
          ...prev,
          [selectedMatch.id]: fetchedMessages,
        }));
        
        setLoading(false);
        console.log('✅ Messages chargés:', fetchedMessages.length);
      },
      (error) => {
        console.error('❌ Erreur lors de la récupération des messages:', error);
        setLoading(false);
      }
    );

    // Nettoyer l'écouteur lors du démontage
    return () => {
      console.log('🧹 Nettoyage de l\'écouteur de messages');
      unsubscribe();
    };
  }, [selectedMatch?.id, CURRENT_USER_ID]);

  /* ----- Auto-scroll vers le bas ----- */
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages]);

  /* ----- Envoyer un message ----- */
  const sendMessage = async () => {
    if (!input.trim() || !selectedMatch || !CURRENT_USER_ID) {
      console.log('❌ Impossible d\'envoyer le message:', {
        hasInput: !!input.trim(),
        hasMatch: !!selectedMatch,
        hasUser: !!CURRENT_USER_ID
      });
      return;
    }

    const messageText = input.trim();
    const conversationId = generateConversationId(CURRENT_USER_ID, selectedMatch.id);
    
    setInput(''); // Vider l'input immédiatement pour une meilleure UX

    try {
      console.log('📤 Envoi du message vers:', `conversations/${conversationId}/messages`);
      
      // ✅ CORRECT: Ajouter le message dans conversations/{conversationId}/messages
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      
      const messageData = {
        text: messageText,
        senderId: CURRENT_USER_ID,
        timestamp: serverTimestamp(),
        read: false,
      };

      const docRef = await addDoc(messagesRef, messageData);
      
      console.log('✅ Message envoyé avec succès! ID:', docRef.id);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message. Vérifiez la console.');
    }
  };

  /* ----- Gestion de la touche Entrée ----- */
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ----- Sélectionner un match ----- */
  const selectMatch = (m: Match) => {
    console.log('👤 Sélection du match:', m.name);
    setSelectedMatch(m);
  };

  /* ----- Vérification de sécurité ----- */
  if (!CURRENT_USER_ID) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>❌ Vous devez être connecté</h2>
        <p>Impossible de charger le chat sans authentification</p>
      </div>
    );
  }

  if (!selectedMatch) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>💔 Aucun match sélectionné</h2>
        <p>Veuillez sélectionner un match depuis la page des matches</p>
      </div>
    );
  }

  /* ----------  RENDU  ---------- */
  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .app-container { height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%); }
        .header { background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-bottom: 1px solid #fbcfe8; }
        .header-content { max-width: 1280px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
        .logo-section { display: flex; align-items: center; gap: 12px; }
        .logo-icon { position: relative; }
        .logo-pulse { position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; background: #f472b6; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.5;} }
        .logo-text { font-size:24px; font-weight:700; background: linear-gradient(135deg,#f43f5e 0%,#ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .header-actions { display:flex; gap:8px; }
        .icon-btn { padding:8px; background:none; border:none; border-radius:50%; cursor:pointer; transition: background 0.2s; }
        .icon-btn:hover { background:#fdf2f8; }
        .main-layout { flex:1; display:flex; max-width:1280px; width:100%; margin:0 auto; overflow:hidden; }
        .sidebar { width:320px; background:white; border-right:1px solid #fbcfe8; overflow-y:auto; }
        .sidebar-header { padding:16px; border-bottom:1px solid #fbcfe8; }
        .sidebar-title { font-size:18px; font-weight:600; color:#1f2937; display:flex; align-items:center; gap:8px; }
        .sidebar-subtitle { font-size:14px; color:#6b7280; margin-top:4px; }
        .matches-list { display:flex; flex-direction:column; }
        .match-item { width:100%; padding:16px; display:flex; align-items:center; gap:12px; background:none; border:none; border-bottom:1px solid #fdf2f8; cursor:pointer; transition: all 0.2s; text-align:left; }
        .match-item:hover { background:#fdf2f8; }
        .match-item.active { background: linear-gradient(90deg, #fdf2f8 0%, #fce7f3 100%); border-left:4px solid #f43f5e; }
        .match-avatar-wrapper { position:relative; }
        .match-avatar { width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid #fbcfe8; }
        .online-indicator { position:absolute; bottom:0; right:0; width:16px; height:16px; background:#10b981; border-radius:50%; border:2px solid white; }
        .match-info { flex:1; }
        .match-name-row { display:flex; align-items:center; gap:8px; }
        .match-name { font-weight:600; color:#1f2937; }
        .match-age { font-size:12px; color:#6b7280; }
        .match-last-message { font-size:14px; color:#6b7280; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .chat-container { flex:1; display:flex; flex-direction:column; background:white; }
        .chat-header { padding:16px 24px; border-bottom:1px solid #fbcfe8; background: linear-gradient(90deg, white 0%, #fdf2f8 100%); }
        .chat-header-content { display:flex; align-items:center; gap:12px; }
        .chat-avatar { width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid #f9a8d4; }
        .chat-user-info h2 { font-size:18px; font-weight:600; color:#1f2937; display:flex; align-items:center; gap:8px; }
        .chat-status { font-size:12px; color:#6b7280; display:flex; align-items:center; gap:4px; }
        .chat-status.online { color:#10b981; }
        .status-dot { width:8px; height:8px; background:#10b981; border-radius:50%; }
        .messages-area { flex:1; overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:16px; }
        .empty-chat { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; }
        .empty-chat-icon { margin-bottom:16px; }
        .empty-chat-title { font-size:18px; font-weight:500; color:#6b7280; }
        .empty-chat-subtitle { font-size:14px; color:#9ca3af; margin-top:8px; }
        .loading-messages { display:flex; justify-content:center; align-items:center; padding:20px; color:#6b7280; }
        .message-wrapper { display:flex; }
        .message-wrapper.me { justify-content:flex-end; }
        .message-wrapper.them { justify-content:flex-start; }
        .message-bubble { max-width:60%; padding:12px 16px; border-radius:20px; animation: messageIn 0.3s ease; }
        @keyframes messageIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .message-bubble.me { background: linear-gradient(135deg,#f43f5e 0%,#ec4899 100%); color:white; border-bottom-right-radius:4px; }
        .message-bubble.them { background:#f3f4f6; color:#1f2937; border-bottom-left-radius:4px; }
        .message-text { font-size:14px; word-wrap: break-word; }
        .message-time { font-size:11px; margin-top:4px; opacity:0.7; }
        .input-area { padding:16px; border-top:1px solid #fbcfe8; background:white; }
        .input-wrapper { display:flex; align-items:center; gap:12px; }
        .message-input { flex:1; padding:12px 16px; border:2px solid #fbcfe8; border-radius:24px; font-size:14px; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .message-input:focus { border-color:#f9a8d4; }
        .send-btn { width:48px; height:48px; border-radius:50%; background: linear-gradient(135deg,#f43f5e 0%,#ec4899 100%); color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition: all 0.2s; }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow:0 4px 12px rgba(244,63,94,0.4); }
        .send-btn:disabled { opacity:0.5; cursor:not-allowed; }
        @media (max-width:768px) { .sidebar { display:none; } }
      `}</style>

      <div className="app-container">
        {/* -------  HEADER  ------- */}
        <header className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <Flame size={32} color="#f43f5e" fill="#f43f5e" />
                <div className="logo-pulse"></div>
              </div>
              <h1 className="logo-text">Aura</h1>
            </div>
            <div className="header-actions">
              <button className="icon-btn">
                <Heart size={24} color="#f43f5e" />
              </button>
              <button className="icon-btn">
                <MessageCircle size={24} color="#f43f5e" fill="#f43f5e" />
              </button>
            </div>
          </div>
        </header>

        {/* -------  CORPS  ------- */}
        <div className="main-layout">
          {/* Sidebar */}
          {matchesList.length > 0 && (
            <aside className="sidebar">
              <div className="sidebar-header">
                <h2 className="sidebar-title">
                  <MessageCircle size={20} color="#f43f5e" />
                  Messages
                </h2>
                <p className="sidebar-subtitle">{matchesList.length} matchs</p>
              </div>

              <div className="matches-list">
                {matchesList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectMatch(m)}
                    className={`match-item ${selectedMatch?.id === m.id ? 'active' : ''}`}
                  >
                    <div className="match-avatar-wrapper">
                      <img src={m.avatar} alt={m.name} className="match-avatar" />
                      {m.online && <div className="online-indicator"></div>}
                    </div>
                    <div className="match-info">
                      <div className="match-name-row">
                        <span className="match-name">{m.name}</span>
                        <span className="match-age">{m.age}</span>
                      </div>
                      <p className="match-last-message">{m.lastMessage || 'Nouveau match'}</p>
                    </div>
                    {selectedMatch?.id === m.id && (
                      <Heart size={20} color="#f43f5e" fill="#f43f5e" />
                    )}
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* Chat */}
          <main className="chat-container">
            <div className="chat-header">
              <div className="chat-header-content">
                <div className="match-avatar-wrapper">
                  <img src={selectedMatch.avatar} alt={selectedMatch.name} className="chat-avatar" />
                  {selectedMatch.online && <div className="online-indicator"></div>}
                </div>
                <div className="chat-user-info">
                  <h2>
                    {selectedMatch.name}
                    <span className="match-age">{selectedMatch.age}</span>
                  </h2>
                  <p className={`chat-status ${selectedMatch.online ? 'online' : ''}`}>
                    {selectedMatch.online ? (
                      <>
                        <span className="status-dot"></span>
                        En ligne
                      </>
                    ) : (
                      'Hors ligne'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="messages-area">
              {loading ? (
                <div className="loading-messages">
                  <p>Chargement des messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-chat-icon">
                    <Heart size={64} color="#f9a8d4" />
                  </div>
                  <p className="empty-chat-title">C'est un match ! 💕</p>
                  <p className="empty-chat-subtitle">Commencez la conversation avec {selectedMatch.name}</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                    <div className={`message-bubble ${msg.sender}`}>
                      <p className="message-text">{msg.text}</p>
                      <p className="message-time">
                        {msg.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={`Écrire un message à ${selectedMatch.name}...`}
                  className="message-input"
                />
                <button onClick={sendMessage} disabled={!input.trim()} className="send-btn">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}