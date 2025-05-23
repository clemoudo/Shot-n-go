import React, { useState, useEffect } from "react";
import "../styles/Queue.css";

function Queue({ queueState, machineState }) {
  const { queue, fetchQueue } = queueState;
  const { machines, fetchMachines } = machineState;
  const [selectedMachineId, setSelectedMachineId] = useState("");

  useEffect(() => {
    selectedMachineId && fetchQueue(selectedMachineId);
  }, []);

  useEffect(() => {
      if (machines.length > 0) {
        const firstId = machines[0].id;
        setSelectedMachineId(firstId);
      }
    }, [machines]);

  useEffect(() => {
    selectedMachineId && fetchQueue(selectedMachineId);
  }, [selectedMachineId]);

  return (
    <div className="queue-container">
      <h1>File d'attente</h1>
      <label htmlFor="machine-select">Choisissez une machine :</label>
      <select
        id="machine-select"
        className="machine-select"
        value={selectedMachineId}
        onChange={(e) => {
          setSelectedMachineId(e.target.value)
        }}
      >
        {machines.map((machine) => (
          <option key={`m${machine.id}`} value={machine.id}>
            {machine.name}
          </option>
        ))}
      </select>
      <div className="queue-list">
        {(queue.length > 0) ? ( 
          queue.map((cmd, index) => (
            <div key={cmd.id} className={`queue-item ${index === 0 ? "active" : ""}`}>
              #{cmd.commande_id} - {cmd.user_name}
            </div>
          ))
        ) : (
          <p className="empty-message">La file d'attente est vide.</p>
        )}
      </div>
    </div>
  );
}

export default Queue;