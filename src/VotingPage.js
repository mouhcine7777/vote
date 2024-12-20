import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue, update } from "firebase/database";

const VotingPage = () => {
  const [participants, setParticipants] = useState([]);
  const [revoteParticipants, setRevoteParticipants] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const participantsRef = ref(db, "participants");
    const revoteParticipantsRef = ref(db, "revoteParticipants");

    onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedParticipants = Object.keys(data).map((key) => ({
          id: key,
          name: data[key].name,
          votes: data[key].votes || 0,
          picture: data[key].picture,
        }));
        setParticipants(formattedParticipants);
      }
    });

    onValue(revoteParticipantsRef, (snapshot) => {
      const data = snapshot.val();
      setRevoteParticipants(data);
    });
  }, []);

  const displayedParticipants = revoteParticipants
    ? participants.filter((p) => revoteParticipants.includes(p.id))
    : participants;

  const handleVote = (id) => {
    if (hasVoted) {
      alert("You can only vote once.");
      return;
    }

    const participantRef = ref(db, `participants/${id}`);
    const participant = participants.find((p) => p.id === id);

    if (participant) {
      update(participantRef, { votes: (participant.votes || 0) + 1 });
      setHasVoted(true);
      setIsModalOpen(false);

      // Show logo after 5 seconds
      setTimeout(() => {
        setShowLogo(true);
      }, 300);
    } else {
      alert("Error: Participant not found.");
    }
  };

  const openModal = (participant) => {
    setSelectedParticipant(participant);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedParticipant(null);
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={styles.videoBackground}
        src="https://www.paloozaland.com/wp-content/uploads/2024/12/BG_ANIMATION_A-2.mp4"
      />
      <div style={styles.overlay}>
        <div style={styles.cardContainer}>
          {displayedParticipants.length > 0 ? (
            displayedParticipants.map((participant) => (
              <div
                key={participant.id}
                style={{
                  ...styles.card,
                  backgroundImage: `url(${participant.picture})`,
                  transform: hoveredCard === participant.id ? "scale(1.05) rotate(2deg)" : "scale(1) rotate(0deg)",
                  transition: "transform 0.3s ease",
                  animation: hoveredCard === participant.id ? "none" : "float 3s ease-in-out infinite",
                  animationDelay: `${Math.random() * 2}s`,
                }}
                onMouseEnter={() => setHoveredCard(participant.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => openModal(participant)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(participant);
                  }}
                  disabled={hasVoted}
                  style={{
                    ...styles.voteButton,
                    backgroundImage: hasVoted
                      ? "url('https://www.paloozaland.com/wp-content/uploads/2024/11/butt1.png')"
                      : "url('https://www.paloozaland.com/wp-content/uploads/2024/11/butt.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    cursor: hasVoted ? "not-allowed" : "pointer",
                  }}
                />
              </div>
            ))
          ) : (
            <p style={styles.noParticipants}>No participants available for voting.</p>
          )}
        </div>
      </div>

      {isModalOpen && selectedParticipant && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <img src={selectedParticipant.picture} alt="Participant" style={styles.modalImage} />
            <button onClick={() => handleVote(selectedParticipant.id)} style={styles.modalVoteButton}>
              <img src="https://www.paloozaland.com/wp-content/uploads/2024/12/butt.png" alt="Vote" style={{ width: "100%", height: "auto", border: "none" }} />
            </button>
            <button onClick={closeModal} style={styles.closeModalButton}>
              <span style={styles.closeButtonText}>✖</span>
            </button>
          </div>
        </div>
      )}

      {/* Logo Display with Enhanced Animation */}
      {showLogo && (
        <div style={styles.logoOverlay}>
          <div style={styles.logoContainer} onClick={handleLogoClick}>
            <img
              src="https://www.paloozaland.com/wp-content/uploads/2024/12/Mediatheque.png"
              alt="Logo"
              style={{ ...styles.logo, animation: 'logoBounce 1s ease forwards' }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes logoBounce {
          0% { opacity: 0; transform: scale(0); }
          60% { opacity: 1; transform: scale(1.2); }
          80% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>
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
  },
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "30px",
    padding: "20px",
    marginTop: "240px",
    width: "90%",
  },
  card: {
    position: "relative",
    height: "350px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "15px",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  voteButton: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80%",
    height: "60px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "transparent",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(8px)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    textAlign: "center",
    maxWidth: "500px",
    width: "90%",
    position: "relative",
  },
  modalImage: {
    width: "100%",
    height: "auto",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  modalVoteButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  closeModalButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "10px",
    fontSize: "22px",
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#D825E2",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.3s",
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    animation: "pulse 2s infinite",
  },
  closeButtonText: {
    fontSize: "24px",
  },
  logoOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  },
  logoContainer: {
    cursor: "pointer",
  },
  logo: {
    maxWidth: "500px",
    width: "100%",
    height: "auto",
  },
};

export default VotingPage;