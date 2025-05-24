import { useState, useEffect } from "react";
import styles from "./Queue.module.css";

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
    <div className={styles.queue_container}>
      <h1>File d'attente</h1>
      <label htmlFor="machine-select">Choisissez une machine :</label>
      <select
        id="machine-select"
        className={styles.machine_select}
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
      <div className={styles.queue_list}>
        {(queue.length > 0) ? ( 
          queue.map((cmd, index) => (
            <div key={cmd.id} className={`${styles.queue_item} ${index === 0 ? styles.active : ""}`}>
              #{cmd.commande_id} - {cmd.user_name}
            </div>
          ))
        ) : (
          <p className={styles.empty_message}>La file d'attente est vide.</p>
        )}
      </div>
    </div>
  );
}

export default Queue;