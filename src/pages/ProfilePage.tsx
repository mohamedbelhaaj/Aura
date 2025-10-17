import React, { useState } from "react";
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonBackButton,
  IonButtons,
  IonText
} from "@ionic/react";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useHistory } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState("");
  const history = useHistory();

  const handleUpdateProfile = async () => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName
        });
        setMessage("✅ Profil mis à jour avec succès !");
      }
    } catch (error: any) {
      setMessage("❌ Erreur: " + error.message);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      setMessage("❌ Veuillez remplir tous les champs");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("❌ Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      const user = auth.currentUser;
      if (user && user.email) {
        // Ré-authentification
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // Mise à jour du mot de passe
        await updatePassword(user, newPassword);
        setMessage("✅ Mot de passe mis à jour avec succès !");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        setMessage("❌ Mot de passe actuel incorrect");
      } else {
        setMessage("❌ Erreur: " + error.message);
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Profil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput 
            value={auth.currentUser?.email || ""} 
            readonly 
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Nom d'affichage</IonLabel>
          <IonInput 
            value={displayName} 
            onIonChange={(e) => setDisplayName(e.detail.value!)} 
            placeholder="Votre nom"
          />
        </IonItem>
        <IonButton expand="block" onClick={handleUpdateProfile}>
          Mettre à jour le profil
        </IonButton>

        <div style={{ marginTop: "40px" }}>
          <h3>Changer le mot de passe</h3>
          <IonItem>
            <IonLabel position="stacked">Mot de passe actuel</IonLabel>
            <IonInput 
              type="password" 
              value={currentPassword} 
              onIonChange={(e) => setCurrentPassword(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Nouveau mot de passe</IonLabel>
            <IonInput 
              type="password" 
              value={newPassword} 
              onIonChange={(e) => setNewPassword(e.detail.value!)} 
            />
          </IonItem>
          <IonButton expand="block" onClick={handleUpdatePassword}>
            Changer le mot de passe
          </IonButton>
        </div>

        {message && (
          <IonText color={message.includes("✅") ? "success" : "danger"}>
            <p style={{ textAlign: "center", marginTop: "20px" }}>{message}</p>
          </IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;