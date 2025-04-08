import { useState, useEffect } from 'react';
import '../styles/Leaderboard.css';

function Leaderboard() {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        // Simuler la récupération des scores depuis une API ou une base de données
        const fetchedScores = [
            { id: 1, name: 'Alice', score: 1500 },
            { id: 2, name: 'Bob', score: 1200 },
            { id: 3, name: 'Charlie', score: 1100 },
            { id: 4, name: 'David', score: 900 },
            { id: 5, name: 'MAiN GROM', score: 19950 },
            { id: 6, name: 'clement', score: 1500 },
            { id: 7, name: 'lucus', score: 1200 },
            { id: 8, name: 'zz', score: 1100 },
            { id: 9, name: '34', score: 900 },
            { id: 10, name: 'nana', score: 850 }
        ];

        // Vérifier que le tri fonctionne bien en créant une nouvelle copie triée
        const sortedScores = [...fetchedScores].sort((a, b) => b.score - a.score);
        setScores(sortedScores);
    }, []);

    return (
        <div className="leaderboard">
            <h2>Leaderboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Joueur</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((player, index) => (
                        <tr key={`${player.id}-${index}`}>
                            <td>{index + 1}</td>
                            <td>{player.name}</td>
                            <td>{player.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Leaderboard;
