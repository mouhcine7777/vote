import React, { useEffect, useState } from "react";
import { db } from "./firebase";  // Ensure the correct path for firebase
import { ref, onValue, update } from "firebase/database";

const ScorePage = () => {
  const [scores, setScores] = useState([]);
  const [votingAllowed, setVotingAllowed] = useState(true);
  const [revoteParticipants, setRevoteParticipants] = useState([]);
  const [mobileDisplayParticipants, setMobileDisplayParticipants] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isMobileSelecting, setIsMobileSelecting] = useState(false);

  useEffect(() => {
    const scoresRef = ref(db, "participants");
    const votingAllowedRef = ref(db, "votingAllowed");

    onValue(scoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedScores = Object.keys(data)
          .filter((key) => data[key] && data[key].id)
          .map((key) => ({
            id: data[key].id,
            name: data[key].name,
            votes: data[key].votes,
            picture: data[key].picture || "https://via.placeholder.com/100",
          }))
          .sort((a, b) => b.votes - a.votes);
        setScores(formattedScores);
      }
    });

    onValue(votingAllowedRef, (snapshot) => {
      const newValue = snapshot.val();
      setVotingAllowed(newValue);
    });
  }, []);

  const initiateRevote = () => {
    if (revoteParticipants.length === 0) {
      alert("Please select at least one participant for the revote.");
      return;
    }

    update(ref(db), {
      revoteParticipants: revoteParticipants.map((p) => p.id),
    })
      .then(() => {
        alert("Revote initiated with selected participants!");
        setIsSelecting(false);
      })
      .catch((error) => {
        console.error("Error initiating revote:", error);
      });
  };

  const updateMobileDisplay = () => {
    update(ref(db), {
      mobileDisplay: mobileDisplayParticipants.map((p) => p.id),
    })
      .then(() => {
        alert("Mobile display participants updated!");
        setIsMobileSelecting(false);
      })
      .catch((error) => {
        console.error("Error updating mobile display:", error);
      });
  };

  const resetScores = () => {
    const updates = {};
    scores.forEach((participant) => {
      updates[`participants/${participant.id}/votes`] = 0;
    });

    update(ref(db), updates)
      .then(() => {
        alert("Scores have been reset!");
      })
      .catch((error) => {
        console.error("Error resetting scores:", error);
      });
  };

  const resetToAllParticipants = () => {
    update(ref(db), { revoteParticipants: null })
      .then(() => alert("All participants restored."))
      .catch((error) => console.error("Error restoring participants:", error));
  };

  return (
    <div style={styles.container}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={styles.videoBackground}
        src="https://www.paloozaland.com/wp-content/uploads/2024/12/BG_ANIMATION_B-1.mp4"
      />
      
      <div style={styles.overlay}>
        <div style={styles.imageGrid}>
          <div style={styles.firstRow}>
            {scores.slice(0, 4).map((participant) => (
              <div key={participant.id} style={styles.imageWrapper}>
                <img
                  src={participant.picture}
                  alt="Participant"
                  style={styles.participantImage}
                />
                <div style={styles.scoreCadre}>
                  <span style={styles.voteBadge}>{participant.votes}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.firstRow}>
            {scores.slice(4).map((participant) => (
              <div key={participant.id} style={styles.imageWrapper}>
                <img
                  src={participant.picture}
                  alt="Participant"
                  style={styles.participantImage}
                />
                <div style={styles.scoreCadre}>
                  <span style={styles.voteBadge}>{participant.votes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            style={{ ...styles.button, backgroundColor: "#D21885" }}
            onClick={resetScores}
          >
            Reset Scores
          </button>
          <button
            style={{
              ...styles.button,
              backgroundColor: votingAllowed ? "#28a745" : "#6c757d",
            }}
            onClick={() => setIsSelecting(true)}
          >
            Select for Revote
          </button>
          <button
            style={{ ...styles.button, backgroundColor: "#007bff" }}
            onClick={() => setIsMobileSelecting(true)}
          >
            Select for Mobile Display
          </button>
          <button
            style={{ ...styles.button, backgroundColor: "#17a2b8" }}
            onClick={resetToAllParticipants}
          >
            Reload All Participants
          </button>
        </div>

        {/* Revote Selection Modal */}
        {isSelecting && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalHeading}>
                Select Participants for Revote
              </h3>
              <div style={styles.participantGridModal}>
                {scores.map((participant) => (
                  <div key={participant.id} style={styles.participantItemModal}>
                    <input
                      type="checkbox"
                      checked={revoteParticipants.some((p) => p.id === participant.id)}
                      onChange={() => {
                        if (revoteParticipants.some((p) => p.id === participant.id)) {
                          setRevoteParticipants(revoteParticipants.filter((p) => p.id !== participant.id));
                        } else {
                          setRevoteParticipants([...revoteParticipants, participant]);
                        }
                      }}
                    />
                    <img
                      src={participant.picture}
                      alt={participant.name}
                      style={styles.modalParticipantImage}
                    />
                    <span style={styles.participantName}>{participant.name}</span>
                  </div>
                ))}
              </div>
              <div style={styles.modalActions}>
                <button onClick={initiateRevote} style={styles.modalButton}>
                  Confirm Revote
                </button>
                <button onClick={() => setIsSelecting(false)} style={styles.modalButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Display Selection Modal */}
        {isMobileSelecting && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalHeading}>Select Participants for Mobile Display</h3>
              <div style={styles.participantGridModal}>
                {scores.map((participant) => (
                  <div key={participant.id} style={styles.participantItemModal}>
                    <input
                      type="checkbox"
                      checked={mobileDisplayParticipants.some((p) => p.id === participant.id)}
                      onChange={() => {
                        if (mobileDisplayParticipants.some((p) => p.id === participant.id)) {
                          setMobileDisplayParticipants(mobileDisplayParticipants.filter((p) => p.id !== participant.id));
                        } else {
                          setMobileDisplayParticipants([...mobileDisplayParticipants, participant]);
                        }
                      }}
                    />
                    <img
                      src={participant.picture}
                      alt={participant.name}
                      style={styles.modalParticipantImage}
                    />
                    <span style={styles.participantName}>{participant.name}</span>
                  </div>
                ))}
              </div>
              <div style={styles.modalActions}>
                <button onClick={updateMobileDisplay} style={styles.modalButton}>
                  Update Mobile Display
                </button>
                <button onClick={() => setIsMobileSelecting(false)} style={styles.modalButton}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
  },
  imageGrid: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "270px",
  },
  firstRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "30px",
    marginBottom: "20px",
  },
  imageWrapper: {
    position: "relative",
    textAlign: "center",
  },
  participantImage: {
    width: "300px",
    height: "300px",
    objectFit: "cover",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  scoreCadre: {
    backgroundImage: "url('https://www.paloozaland.com/wp-content/uploads/2024/12/Nouveau-projet-2.png')",
    backgroundSize: "cover",
    width: "100%",
    height: "50px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  voteBadge: {
    color: "#0AF8C5",
    fontWeight: "bold",
    fontSize: "24px",
  },
  buttonContainer: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    color: "white",
    border: "none",
    borderRadius: "5px",
    transition: "background-color 0.3s ease",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20px",
    width: "90%",
    maxWidth: "600px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  modalHeading: {
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  participantGridModal: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  participantItemModal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
  },
  modalParticipantImage: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    marginBottom: "5px",
    borderRadius: "50%",
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: "10px 15px",
    fontSize: "16px",
    cursor: "pointer",
    color: "white",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#D21885",
  },
  participantName: {
    textAlign: "center",
    marginTop: "5px",
  },
};

export default ScorePage;