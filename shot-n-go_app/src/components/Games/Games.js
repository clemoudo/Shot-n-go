
import React, { useState, useEffect, useRef } from 'react';
import './Games.css';

////////////////////////////////////////////////////////////////////////////////
// 1) Composant : Servir le shot
////////////////////////////////////////////////////////////////////////////////
function ShotGame() {
  const MIN = 0, MAX = 100, TARGET_MIN = 50, TARGET_MAX = 70;
  const INTERVAL = 20, STEP = 1;

  const [value, setValue]     = useState(MIN);
  const [running, setRunning] = useState(true);
  const [result, setResult]   = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setValue(v => (v + STEP > MAX ? MIN : v + STEP));
      }, INTERVAL);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleClick = () => {
    if (!running) return;
    clearInterval(intervalRef.current);
    setRunning(false);
    if (value >= TARGET_MIN && value <= TARGET_MAX) {
      setResult("🎉 Parfait ! Ton shot est prêt !");
    } else if (value < TARGET_MIN) {
      setResult("😢 Trop peu… Ton shot est trop petit.");
    } else {
      setResult("💥 Trop plein ! Ça déborde !");
    }
  };

  const handleRestart = () => {
    clearInterval(intervalRef.current);
    setValue(MIN);
    setResult(null);
    setRunning(true);
  };

  return (
    <div className="game shot-game">
      <h2>🍸 Servir le shot</h2>
      <div className="shot-glass" onClick={handleClick}>
        <div className="liquid" style={{ height: `${value}%` }} />
        <div className="target-zone" />
      </div>
      {!result ? (
        <p className="game-instruction">Clique pour arrêter dans la zone dorée !</p>
      ) : (
        <>
          <p className="game-result">{result}</p>
          <button className="btn" onClick={handleRestart}>Rejouer</button>
        </>
      )}
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// 4) Composant principal : menu + jeu sélectionné
////////////////////////////////////////////////////////////////////////////////
export default function Games() {
  const [mode, setMode] = useState(null);

  return (
    <div className="games-container">
      <h1>🎲 Mini-jeux Shot’n’Go</h1>

      {mode === null ? (
        <div className="menu-buttons">
          <button className="btn" onClick={() => setMode('shot')}>🍸 Servir le shot</button>
        </div>
      ) : (
        <div>
          <button className="btn back-btn" onClick={() => setMode(null)}>← Retour au menu</button>

          {mode === 'shot' && <ShotGame />}
        </div>
      )}
    </div>
  );
}