import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VotingPage from "./VotingPage";
import ScorePage from "./ScorePage";
import MobileScorePage from "./MobileScorePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/vote" element={<VotingPage />} />
        <Route path="/score" element={<ScorePage />} />
        <Route path="/mobile-score" element={<MobileScorePage />} />
      </Routes>
    </Router>
  );
}

export default App;