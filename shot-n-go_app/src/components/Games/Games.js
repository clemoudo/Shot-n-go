
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
  const MIN = 0;
  const MAX = 100;
  const TARGET_MIN = 40;
  const TARGET_MAX = 60;
  const SPEED = 10; // ms

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
    if (value >= TARGET_MIN && value <= TARGET_MAX) {
      setResult('🎉 Gagné !');
    } else {
      setResult('😢 Perdu…');
    }
  };

  const handleRestart = () => {
    clearInterval(intervalRef.current);
    setValue(MIN);
    setDir(1);
    setResult(null);
    setRunning(true);
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <h2>⏱ Arrête la jauge</h2>
      <div
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '80%',
          height: 30,
          margin: '1rem auto',
          background: '#ddd',
          cursor: running ? 'pointer' : 'default',
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            background: running
              ? 'steelblue'
              : (value >= TARGET_MIN && value <= TARGET_MAX ? 'green' : 'red'),
            transition: 'width 0ms',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${TARGET_MIN}%`,
            width: `${TARGET_MAX - TARGET_MIN}%`,
            top: 0,
            height: '100%',
            border: '2px dashed gold',
            pointerEvents: 'none',
          }}
        />
      </div>

      {!result ? (
        <p>Clique sur la barre pour l’arrêter dans la zone dorée !</p>
      ) : (
        <>
          <p style={{ fontSize: '1.1rem' }}>{result}</p>
          <button onClick={handleRestart}>Rejouer</button>
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
          <button onClick={() => setMode('gauge')}>⏱ Arrête la jauge</button>
        </div>
      ) : (
        <div>
          <button className="btn back-btn" onClick={() => setMode(null)}>← Retour au menu</button>

          {mode === 'shot' && <ShotGame />}
          {mode === 'gauge' && <GaugeGame />}
        </div>
      )}
    </div>
  );
}