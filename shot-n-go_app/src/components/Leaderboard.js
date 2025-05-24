import { useEffect } from 'react';
import styles from '../styles/Leaderboard.module.css';
import podium1 from "../assets/podium1.png";
import podium2 from "../assets/podium2.png";
import podium3 from "../assets/podium3.png";

function Leaderboard({ leaderboardState }) {
    const { leaderboard, fetchLeaderboard } = leaderboardState;

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    if (!leaderboard || leaderboard.length === 0) {
        return <p className={styles.leaderboard_empty}>Aucun résultat pour le moment.</p>;
    }

    const podium = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <div className={styles.leaderboard_container}>
            <h2 className={styles.leaderboard_title}>Leaderboard</h2>
            <div className={styles.leaderboard_podium}>
                {podium.map((user, index) => (
                    <div
                        key={user.user_id}
                        className={`${styles["leaderboard_podium_item"]} ${styles[`leaderboard_podium_item_${index + 1}`]}`}
                    >
                        <img className={styles.leaderboard_medal} src={index === 0 ? podium1 : index === 1 ? podium2 : podium3} alt={`podium${index + 1}`} loading="lazy" />
                        <p className={styles.leaderboard_name}>{user.user_name}</p>
                        <p className={styles.leaderboard_shots}>{user.total_shots} shots</p>
                    </div>
                ))}
            </div>

            <ul className={styles.leaderboard_list}>
                {others.map((user, index) => (
                    <li key={user.user_id} className={styles.leaderboard_list_item}>
                        <span className={styles.leaderboard_rank}>{index + 4}.</span>
                        <span className={styles.leaderboard_list_name}>{user.user_name}</span>
                        <span className={styles.leaderboard_list_shots}>{user.total_shots} shots</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Leaderboard;