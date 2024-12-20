import React, { useEffect, useState } from "react";
import { db } from "./firebase"; // Make sure the import path is correct
import { ref, onValue } from "firebase/database";

const MobileScorePage = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    // Reference to the mobileDisplay participants' IDs in Firebase
    const mobileDisplayRef = ref(db, "mobileDisplay");

    onValue(mobileDisplayRef, (snapshot) => {
      const participantIds = snapshot.val();
      if (participantIds) {
        const participantsData = [];

        participantIds.forEach((id) => {
          const participantRef = ref(db, `participants/${id}`);
          onValue(participantRef, (snapshot) => {
            const participantData = snapshot.val();
            if (participantData) {
              participantsData.push({
                id: participantData.id,
                name: participantData.name,
                votes: participantData.votes,
                picture: participantData.picture || "https://via.placeholder.com/100",
              });

              // Update state only after all data has been fetched
              if (participantsData.length === participantIds.length) {
                setScores(participantsData.sort((a, b) => b.votes - a.votes));
              }
            }
          });
        });
      }
    });
  }, []);

  return (
    <div style={styles.container}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={styles.videoBackground}
        src="https://www.paloozaland.com/wp-content/uploads/2024/12/322846910687535108.mp4"
      />
      
      <div style={styles.overlay}>
        <div style={styles.participantGrid}>
          {scores.map((participant) => (
            <div key={participant.id} style={styles.imageWrapper}>
              <img
                src={participant.picture}
                alt={participant.name}
                style={styles.participantImage}
              />
              <div style={styles.scoreCadre}>
                <span style={styles.voteBadge}>{participant.votes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
  },
  videoBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -1,
  },
  overlay: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    paddingTop: "100px", // Added top padding for mobile
  },
  participantGrid: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    width: "100%",
    maxWidth: "500px", // Limit maximum width on larger phones
  },
  imageWrapper: {
    position: "relative",
    width: "90%", // Take up most of the container width
    maxWidth: "300px", // Maximum width for the images
  },
  participantImage: {
    width: "100%",
    aspectRatio: "1", // Keep images square
    objectFit: "cover",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  scoreCadre: {
    backgroundImage: "url('https://www.paloozaland.com/wp-content/uploads/2024/12/Nouveau-projet-2.png')",
    backgroundSize: "cover",
    width: "100%",
    height: "40px", // Slightly smaller for mobile
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  voteBadge: {
    color: "#0AF8C5",
    fontWeight: "bold",
    fontSize: "20px", // Slightly smaller for mobile
  },
};

export default MobileScorePage;