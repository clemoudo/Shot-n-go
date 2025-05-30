import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../components/Home/Home";

test("Affiche des news | Les titres sont visibles", () => {
   const mockNews = [
      { title: "Nouvelle 1", content: "Contenu 1", publish_date: new Date().toISOString() },
      { title: "Nouvelle 2", content: "Contenu 2", publish_date: new Date().toISOString() },
   ];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   expect(screen.getAllByText("Nouvelle 1").length).toBeGreaterThan(0);
   expect(screen.getAllByText("Nouvelle 2").length).toBeGreaterThan(0);
});

test("Vide | Pas de news rendues si tableau vide", () => {
   const mockNews = [];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   const newsCards = screen.queryAllByText(/Nouvelle/i);
   expect(newsCards.length).toBe(0);
});

test("Incomplet | Titre sans date", () => {
   const mockNews = [
      { title: "Sans Date", content: "Contenu uniquement" }, // publish_date manquant
   ];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   expect(screen.getAllByText("Sans Date").length).toBeGreaterThan(0);
   expect(screen.getAllByText("Contenu uniquement").length).toBeGreaterThan(0);
});

test("Incomplet | Titre sans contenu", () => {
   const mockNews = [
      { title: "Sans Contenu", publish_date: new Date().toISOString() }, // content manquant
   ];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   expect(screen.getAllByText("Sans Contenu").length).toBeGreaterThan(0);
   // Vérifie que "Contenu" n'est pas affiché (utilise queryAllByText)
   expect(screen.queryAllByText("Contenu").length).toBe(0);
});

test("Incomplet | Sans titre", () => {
   const mockNews = [
      { content: "Pas de titre ici", publish_date: new Date().toISOString() },
   ];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   expect(screen.getAllByText("Pas de titre ici").length).toBeGreaterThan(0);
});

test("Très longue news | Contenu >512 caractères s'affiche correctement", () => {
   const longContent = "a".repeat(600);
   const mockNews = [
      { title: "Long News", content: longContent, publish_date: new Date().toISOString() },
   ];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   expect(screen.getAllByText("Long News").length).toBeGreaterThan(0);
   expect(screen.getAllByText(longContent).length).toBeGreaterThan(0);
});

test("Types variés | Plusieurs titres différents cohabitent sans bug", () => {
   const mockNews = [
      { title: "Événement local", content: "Détails événement", publish_date: new Date().toISOString() },
      { title: "Offre spéciale", content: "Promo -50%", publish_date: new Date().toISOString() },
      { title: "Nouveau cocktail", content: "Découvrez notre nouveauté", publish_date: new Date().toISOString() },
   ];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   expect(screen.getAllByText("Événement local").length).toBeGreaterThan(0);
   expect(screen.getAllByText("Offre spéciale").length).toBeGreaterThan(0);
   expect(screen.getAllByText("Nouveau cocktail").length).toBeGreaterThan(0);
});

test("Avec 1000 news | Le composant ne plante pas", () => {
   const mockNews = Array.from({ length: 1000 }, (_, i) => ({
      title: `News ${i}`,
      content: `Contenu ${i}`,
      publish_date: new Date().toISOString(),
   }));

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   // Vérifie que quelques titres sont bien rendus
   expect(screen.getAllByText("News 0").length).toBeGreaterThan(0);
   expect(screen.getAllByText("News 999").length).toBeGreaterThan(0);

});
