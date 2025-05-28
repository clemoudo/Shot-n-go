
// src/components/Games/Games.js
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
// 2) Composant : Arrête la jauge
////////////////////////////////////////////////////////////////////////////////
function GaugeGame() {
  const MIN = 0, MAX = 100, TARGET_MIN = 40, TARGET_MAX = 60;
  const SPEED = 10;

  const [value, setValue]     = useState(MIN);
  const [dir, setDir]         = useState(1);
  const [running, setRunning] = useState(true);
  const [result, setResult]   = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setValue(v => {
          let nv = v + dir;
          if (nv >= MAX) { nv = MAX; setDir(-1); }
          if (nv <= MIN) { nv = MIN; setDir(1); }
          return nv;
        });
      }, SPEED);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, dir]);

  const handleClick = () => {
    if (!running) return;
    clearInterval(intervalRef.current);
    setRunning(false);
    setResult(value >= TARGET_MIN && value <= TARGET_MAX ? '🎉 Gagné !' : '😢 Perdu…');
  };

  const handleRestart = () => {
    clearInterval(intervalRef.current);
    setValue(MIN);
    setDir(1);
    setResult(null);
    setRunning(true);
  };

  return (
    <div className="game gauge-game">
      <h2>⏱ Arrête la jauge</h2>
      <div className="gauge-bar" onClick={handleClick}>
        <div className="gauge-fill" style={{ width: `${value}%` }} />
        <div className="gauge-target" />
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
// 3) Composant : Attrape le shot (Whack-a-Shot)
////////////////////////////////////////////////////////////////////////////////
function WhackGame() {
  const GRID_SIZE = 9, ACTIVE_TIME = 800, GAME_TIME = 15;

  const [activeCell, setActiveCell] = useState(null);
  const [score, setScore]           = useState(0);
  const [timeLeft, setTimeLeft]     = useState(GAME_TIME);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) {
      clearTimeout(timeoutRef.current);
      setActiveCell(null);
      return;
    }
    function pop() {
      setActiveCell(Math.floor(Math.random() * GRID_SIZE));
      timeoutRef.current = setTimeout(pop, ACTIVE_TIME);
    }
    pop();
    return () => clearTimeout(timeoutRef.current);
  }, [timeLeft]);

  const handleClickCell = idx => {
    if (idx === activeCell && timeLeft > 0) {
      setScore(s => s + 1);
      setActiveCell(null);
    }
  };

  const handleRestart = () => {
    clearTimeout(timeoutRef.current);
    setScore(0);
    setTimeLeft(GAME_TIME);
  };

  if (timeLeft <= 0) {
    return (
      <div className="game whack-game">
        <h2>🔚 Temps écoulé!</h2>
        <p className="game-result">Score: {score}</p>
        <button className="btn" onClick={handleRestart}>Rejouer</button>
      </div>
    );
  }

  return (
    <div className="game whack-game">
      <h2>🔫 Attrape le shot!</h2>
      <p className="game-status">Temps restant: {timeLeft}s | Score: {score}</p>
      <div className="grid">
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <div
            key={i}
            className={`cell ${i === activeCell ? 'active' : ''}`}
            onClick={() => handleClickCell(i)}
          />
        ))}
      </div>
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
          <button className="btn" onClick={() => setMode('gauge')}>⏱ Arrête la jauge</button>
          <button className="btn" onClick={() => setMode('whack')}>🔫 Attrape le shot</button>
        </div>
      ) : (
        <div>
          <button className="btn back-btn" onClick={() => setMode(null)}>← Retour au menu</button>

          {mode === 'shot' && <ShotGame />}
          {mode === 'gauge' && <GaugeGame />}
          {mode === 'whack' && <WhackGame />}
        </div>
      )}
    </div>
  );
}