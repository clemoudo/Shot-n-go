import React from 'react';
import { render, screen } from '@testing-library/react';
import Leaderboard from './Leaderboard.js';

// Mock des images pour éviter les erreurs lors du test
jest.mock("../../assets/podium1.png", () => "podium1.png");
jest.mock("../../assets/podium2.png", () => "podium2.png");
jest.mock("../../assets/podium3.png", () => "podium3.png");

describe('Leaderboard', () => {
  let fetchLeaderboardMock;

  beforeEach(() => {
    fetchLeaderboardMock = jest.fn();
  });

  it('devrait appeler fetchLeaderboard au montage', () => {
    render(<Leaderboard leaderboardState={{ leaderboard: [], fetchLeaderboard: fetchLeaderboardMock }} />);
    expect(fetchLeaderboardMock).toHaveBeenCalledTimes(1);
  });

  it('devrait afficher un message vide si le classement est vide', () => {
    render(<Leaderboard leaderboardState={{ leaderboard: [], fetchLeaderboard: fetchLeaderboardMock }} />);
    expect(screen.getByText(/aucun résultat pour le moment/i)).toBeInTheDocument();
  });

  it('devrait afficher le podium pour les 3 meilleurs utilisateurs', () => {
    const leaderboard = [
      { user_id: 1, user_name: 'Alice', total_shots: 10 },
      { user_id: 2, user_name: 'Bob', total_shots: 8 },
      { user_id: 3, user_name: 'Charlie', total_shots: 6 },
      { user_id: 4, user_name: 'David', total_shots: 4 },
    ];

    render(<Leaderboard leaderboardState={{ leaderboard, fetchLeaderboard: fetchLeaderboardMock }} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('10 shots')).toBeInTheDocument();

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('8 shots')).toBeInTheDocument();

    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('6 shots')).toBeInTheDocument();

    expect(screen.getByText('4.')).toBeInTheDocument();
    expect(screen.getByText('David')).toBeInTheDocument();
    expect(screen.getByText('4 shots')).toBeInTheDocument();
  });

  it('devrait gérer un classement avec moins de 3 utilisateurs', () => {
    const leaderboard = [
      { user_id: 1, user_name: 'Alice', total_shots: 10 },
      { user_id: 2, user_name: 'Bob', total_shots: 8 },
    ];

    render(<Leaderboard leaderboardState={{ leaderboard, fetchLeaderboard: fetchLeaderboardMock }} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    const othersList = screen.queryByRole('list');
    expect(othersList).toBeInTheDocument();
    expect(othersList.children.length).toBe(0);
  });

    it("devrait afficher le titre 'Leaderboard'", () => {
    const leaderboard = [
      { user_id: 1, user_name: "TestUser", total_shots: 1 }
    ];

    render(<Leaderboard leaderboardState={{ leaderboard, fetchLeaderboard: fetchLeaderboardMock }} />);
    
    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
  });

  it("affiche les scores correctement", () => {
    const leaderboard = [{ user_id: 1, user_name: "Alice", total_shots: 12 }];
    render(<Leaderboard leaderboardState={{ leaderboard, fetchLeaderboard: fetchLeaderboardMock }} />);
    expect(screen.getByText("12 shots")).toBeInTheDocument();
  });

    it("affiche un nom avec accents et caractères spéciaux", () => {
    const leaderboard = [{ user_id: 1, user_name: "Éléonore_ç@!$", total_shots: 20 }];
    render(<Leaderboard leaderboardState={{ leaderboard, fetchLeaderboard: fetchLeaderboardMock }} />);
    expect(screen.getByText("Éléonore_ç@!$")).toBeInTheDocument();
  });

});

  