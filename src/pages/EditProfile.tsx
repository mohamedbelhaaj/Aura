import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonAlert,
} from "@ionic/react";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { 
  camera, 
  trash, 
  add, 
  checkmarkCircle, 
  arrowBack,
  location,
  heart,
  sparkles
} from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
const EditProfile: React.FC = () => {
  const db = getFirestore();
  const user = auth.currentUser;
  const router = useIonRouter(); // ✅ hook Ionic

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  /* Charger le profil existant */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setName(data.name || "");
        setAge(data.age?.toString() || "");
        setBio(data.bio || "");
        setInterests(data.interests || []);
        setUserLocation(data.location || "");
        setImages(data.images || []);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  /* Géolocalisation */
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      showMessage("Géolocalisation non supportée", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = `${position.coords.latitude.toFixed(2)}° N, ${position.coords.longitude.toFixed(2)}° E`;
        setUserLocation(loc);
        showMessage("Localisation mise à jour !", "success");
      },
      (error) => {
        showMessage("Erreur de géolocalisation", "error");
      }
    );
  };

  /* Ajouter une image */
  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      showMessage("Entrez une URL d'image", "error");
      return;
    }

    if (!newImageUrl.startsWith('http')) {
      showMessage("URL invalide", "error");
      return;
    }

    if (images.length >= 6) {
      showMessage("Maximum 6 photos", "error");
      return;
    }

    if (images.includes(newImageUrl)) {
      showMessage("Photo déjà ajoutée", "error");
      return;
    }

    setImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    showMessage("Photo ajoutée !", "success");
  };

  /* Supprimer une image */
  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    showMessage("Photo supprimée", "success");
  };

  /* Réorganiser */
  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  /* Ajouter un intérêt */
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    if (interests.length >= 10) {
      showMessage("Maximum 10 intérêts", "error");
      return;
    }
    if (interests.includes(newInterest.trim())) {
      showMessage("Intérêt déjà ajouté", "error");
      return;
    }
    setInterests(prev => [...prev, newInterest.trim()]);
    setNewInterest("");
  };

  /* Supprimer un intérêt */
  const removeInterest = (index: number) => {
    setInterests(prev => prev.filter((_, i) => i !== index));
  };

  /* Sauvegarder */
  const handleSave = async () => {
    if (!user) return;
    
    if (!name.trim()) {
      showMessage("Le nom est obligatoire", "error");
      return;
    }

    const ageNum = parseInt(age);
    if (!age || ageNum < 18 || ageNum > 100) {
      showMessage("Âge invalide (18-100 ans)", "error");
      return;
    }

    if (images.length === 0) {
      showMessage("Ajoutez au moins une photo", "error");
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", user.uid);
      const newData = {
        name: name.trim(),
        age: ageNum,
        bio: bio.trim(),
        interests,
        location: userLocation,
        images,
        distance: userLocation ? "À proximité" : "Distance inconnue",
        updatedAt: new Date(),
      };

      await setDoc(userRef, newData, { merge: true });
      showMessage("Profil mis à jour !", "success");
      setTimeout(() => router.push("/dashboard"), 1500);
      
    } catch (error: any) {
      console.error("Erreur sauvegarde:", error);
      showMessage("Erreur de sauvegarde", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  return (
    <IonPage>
      <IonContent className="edit-profile-content">
        
        {/* Header */}
        <div className="profile-header">
         {/* <button className="back-btn" onClick={() => router.push("/dashboard")}> */}
          <button className="back-btn" onClick={() => router.push("/dashboard", "back", "pop")}>

            <IonIcon icon={arrowBack} />
          </button>
          <h1 className="header-title">Modifier le profil</h1>
          <div style={{ width: '40px' }}></div>
        </div>

        <div className="content-wrapper">
          
          {/* Section Photos */}
          <div className="section">
            <div className="section-header">
              <IonIcon icon={camera} className="section-icon" />
              <h2 className="section-title">Mes photos</h2>
              <span className="photo-count">{images.length}/6</span>
            </div>

            {/* Ajouter photo */}
            <div className="add-photo-container">
              <input
                type="text"
                className="photo-input"
                placeholder="https://example.com/photo.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
              />
              <button 
                className="add-photo-btn"
                onClick={handleAddImage}
                disabled={images.length >= 6}
              >
                <IonIcon icon={add} />
              </button>
            </div>

            {/* Grille photos */}
            {images.length > 0 ? (
              <div className="photos-grid">
                {images.map((imageUrl, index) => (
                  <div key={index} className="photo-item">
                    <img src={imageUrl} alt={`Photo ${index + 1}`} />
                    {index === 0 && <div className="main-badge">Principale</div>}
                    <button 
                      className="delete-photo-btn"
                      onClick={() => handleDeleteImage(index)}
                    >
                      <IonIcon icon={trash} />
                    </button>
                    <div className="photo-controls">
                      {index > 0 && (
                        <button 
                          className="move-btn"
                          onClick={() => moveImage(index, index - 1)}
                        >
                          ←
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button 
                          className="move-btn"
                          onClick={() => moveImage(index, index + 1)}
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-photos">
                <IonIcon icon={camera} className="empty-icon" />
                <p>Aucune photo</p>
                <span>Ajoutez des URLs d'images</span>
              </div>
            )}
          </div>

          {/* Section Infos */}
          <div className="section">
            <div className="section-header">
              <IonIcon icon={heart} className="section-icon" />
              <h2 className="section-title">Informations</h2>
            </div>

            <div className="input-group">
              <label className="input-label">Prénom *</label>
              <input
                type="text"
                className="text-input"
                placeholder="Votre prénom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Âge *</label>
              <input
                type="number"
                className="text-input"
                placeholder="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={18}
                max={100}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Bio</label>
              <textarea
                className="text-area"
                placeholder="Parlez de vous en quelques mots..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <span className="char-count">{bio.length}/500</span>
            </div>

            <div className="input-group">
              <label className="input-label">Localisation</label>
              <div className="location-container">
                <input
                  type="text"
                  className="text-input"
                  placeholder="Autoriser la localisation"
                  value={userLocation}
                  readOnly
                />
                <button className="location-btn" onClick={getUserLocation}>
                  <IonIcon icon={location} />
                </button>
              </div>
            </div>
          </div>

          {/* Section Intérêts */}
          <div className="section">
            <div className="section-header">
              <IonIcon icon={sparkles} className="section-icon" />
              <h2 className="section-title">Centres d'intérêt</h2>
              <span className="photo-count">{interests.length}/10</span>
            </div>

            <div className="add-photo-container">
              <input
                type="text"
                className="photo-input"
                placeholder="Ex: Voyage, Musique..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                maxLength={20}
              />
              <button 
                className="add-photo-btn"
                onClick={handleAddInterest}
                disabled={interests.length >= 10}
              >
                <IonIcon icon={add} />
              </button>
            </div>

            {interests.length > 0 && (
              <div className="interests-container">
                {interests.map((interest, index) => (
                  <div key={index} className="interest-chip">
                    <span>{interest}</span>
                    <button 
                      className="remove-interest"
                      onClick={() => removeInterest(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton Save */}
          <button 
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Sauvegarde..." : "Enregistrer les modifications"}
          </button>

        </div>

        <IonLoading 
          isOpen={loading} 
          message="Sauvegarde en cours..." 
          cssClass="custom-loader"
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertType === "success" ? "✅ Succès" : "❌ Erreur"}
          message={alertMessage}
          buttons={['OK']}
          cssClass={`custom-alert ${alertType}`}
        />
      </IonContent>


    </IonPage>
  );
};

export default EditProfile;