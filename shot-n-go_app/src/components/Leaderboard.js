import React, { useState, useEffect } from 'react';
import '../styles/Leaderboard.css';

function Leaderboard() {
    const [scores, setScores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [drinkHistory, setDrinkHistory] = useState([]);

    useEffect(() => {
        // Simulation de la récupération des scores depuis une API ou une base de données
        const fetchedScores = [
            { id: 1, name: 'Alice', score: 1500 },
            { id: 2, name: 'Bob', score: 1200 },
            { id: 3, name: 'Charlie', score: 1100 },
            { id: 4, name: 'David', score: 900 },
            { id: 5, name: 'MAiN GROM', score: 19950 },
            { id: 6, name: 'Clement', score: 1500 },
            { id: 7, name: 'Lucus', score: 1200 },
            { id: 8, name: 'ZZ', score: 1100 },
            { id: 9, name: '34', score: 900 },
            { id: 10, name: 'Nana', score: 850 }
        ];

        // Tri des scores par ordre décroissant
        const sortedScores = [...fetchedScores].sort((a, b) => b.score - a.score);
        setScores(sortedScores);
    }, []);

    // Filtrer les joueurs en fonction du terme de recherche
    const filteredPlayers = scores.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Gérer la sélection d'un joueur
    const handleSelectPlayer = (player) => {
        setSelectedPlayer(player);
        // Simulation de la récupération de l'historique des boissons
        const fetchedDrinkHistory = [
            { date: '2025-04-01', drink: 'Café' },
            { date: '2025-04-03', drink: 'Thé' },
            { date: '2025-04-05', drink: 'Jus d\'orange' }
        ];
        setDrinkHistory(fetchedDrinkHistory);
    };

    // Séparer les trois premiers joueurs pour le podium
    const podiumPlayers = filteredPlayers.slice(0, 3);
    const otherPlayers = filteredPlayers.slice(3);

    return (
        <div className="leaderboard">
            <h2>Leaderboard</h2>
            <input
                type="text"
                placeholder="Rechercher un joueur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            <div className="podium">
                {podiumPlayers.map((player, index) => (
                    <div key={player.id} className={`podium-position position-${index + 1}`}>
                        <span className="player-name">{player.name}</span>
                        <span className="player-score">{player.score}</span>
                    </div>
                ))}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Joueur</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {otherPlayers.map((player, index) => (
                        <tr key={player.id} onClick={() => handleSelectPlayer(player)}>
                            <td>{index + 4}</td> {/* Les positions commencent à 4 ici */}
                            <td>{player.name}</td>
                            <td>{player.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedPlayer && (
                <div className="drink-history">
                    <h3>Historique des boissons de {selectedPlayer.name}</h3>
                    <ul>
                        {drinkHistory.map((entry, index) => (
                            <li key={index}>{entry.date}: {entry.drink}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Leaderboard;
