import React, { useState, useEffect, useRef } from 'react';

////////////////////////////////////////////////////////////////////////////////
// 1) Composant : Servir le shot
////////////////////////////////////////////////////////////////////////////////
function ShotGame() {
  const MIN = 0;
  const MAX = 100;
  const TARGET_MIN = 50;
  const TARGET_MAX = 70;
  const INTERVAL = 20; // ms
  const STEP = 1;      // % par interval

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
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <h2>🍸 Servir le shot</h2>
      <div
        onClick={handleClick}
        style={{
          position: 'relative',
          width: 120,
          height: 200,
          margin: '1rem auto',
          border: '4px solid #555',
          borderRadius: '0 0 20px 20px',
          background: '#eee',
          cursor: running ? 'pointer' : 'default',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: `${value}%`,
            background: '#f1c40f',
            transition: running ? `height ${INTERVAL}ms linear` : 'height 300ms ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: `${TARGET_MIN}%`,
            width: '100%',
            height: `${TARGET_MAX - TARGET_MIN}%`,
            background: 'rgba(255, 215, 0, 0.4)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {!result ? (
        <p>Clique sur le verre pour arrêter le versement dans la zone dorée !</p>
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
// 3) Composant : Attrape le shot (Whack-a-Shot)
////////////////////////////////////////////////////////////////////////////////
function WhackGame() {
  const GRID_SIZE = 9;
  const ACTIVE_TIME = 800; // ms
  const GAME_TIME = 15;    // s

  const [activeCell, setActiveCell] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const timeoutRef = useRef(null);

  // Timer de jeu
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Pop-up des cases
  useEffect(() => {
    if (timeLeft <= 0) {
      clearTimeout(timeoutRef.current);
      setActiveCell(null);
      return;
    }
    function pop() {
      const next = Math.floor(Math.random() * GRID_SIZE);
      setActiveCell(next);
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
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>🎉 Temps écoulé!</h2>
        <p>Score: {score}</p>
        <button onClick={handleRestart}>Rejouer</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <h2>🔫 Attrape le shot!</h2>
      <p>Temps restant: {timeLeft}s | Score: {score}</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 80px)',
        gap: '8px',
        justifyContent: 'center'
      }}>
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <div
            key={i}
            onClick={() => handleClickCell(i)}
            style={{
              width: 80,
              height: 80,
              backgroundColor: i === activeCell ? '#f1c40f' : '#777',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
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
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🎲 Mini-jeux Shot’n’Go</h1>

      {mode === null ? (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => setMode('shot')}>🍸 Servir le shot</button>
          <button onClick={() => setMode('gauge')}>⏱ Arrête la jauge</button>
          <button onClick={() => setMode('whack')}>🔫 Attrape le shot</button>
        </div>
      ) : (
        <div>
          <button onClick={() => setMode(null)} style={{ marginBottom: '1rem' }}>
            ← Retour au menu
          </button>

          {mode === 'shot' && <ShotGame />}
          {mode === 'gauge' && <GaugeGame />}
          {mode === 'whack' && <WhackGame />}
        </div>
      )}
    </div>
  );
}