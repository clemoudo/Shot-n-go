import React, { useState, useEffect } from 'react';
import '../styles/Leaderboard.css';

function Leaderboard({ leaderboardState }) {
    const { leaderboard, fetchLeaderboard } = leaderboardState;

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    if (!leaderboard || leaderboard.length === 0) {
        return <p className="leaderboard_empty">Aucun résultat pour le moment.</p>;
    }

    const podium = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <div className="leaderboard_container">
            <h2 className="leaderboard_title">Leaderboard</h2>
            <div className="leaderboard_podium">
                {podium.map((user, index) => (
                    <div
                        key={user.user_id}
                        className={`leaderboard_podium-item leaderboard_podium-item--${index + 1}`}
                    >
                        <img className="leaderboard_medal" src={`/images/pudium${index + 1}.png`} />
                        <p className="leaderboard_name">{user.user_name}</p>
                        <p className="leaderboard_shots">{user.total_shots} shots</p>
                    </div>
                ))}
            </div>

            <ul className="leaderboard_list">
                {others.map((user, index) => (
                    <li key={user.user_id} className="leaderboard_list-item">
                        <span className="leaderboard_rank">{index + 4}.</span>
                        <span className="leaderboard_list-name">{user.user_name}</span>
                        <span className="leaderboard_list-shots">{user.total_shots} shots</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Leaderboard;