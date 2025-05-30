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

   const titres1 = screen.getAllByText("Nouvelle 1");
   const titres2 = screen.getAllByText("Nouvelle 2");

   expect(titres1.length).toBeGreaterThanOrEqual(1);
   expect(titres2.length).toBeGreaterThanOrEqual(1);
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

   expect(screen.getByText("Sans Date")).toBeInTheDocument();
   expect(screen.getByText("Contenu uniquement")).toBeInTheDocument();
});

test("Incomplet | Titre sans contenu", () => {
   const mockNews = [
      { title: "Sans Contenu", publish_date: new Date().toISOString() }, // content manquant
   ];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   expect(screen.getByText("Sans Contenu")).toBeInTheDocument();
});

test("Incomplet | Sans titre", () => {
   const mockNews = [
      { content: "Pas de titre ici", publish_date: new Date().toISOString() },
   ];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   expect(screen.getByText("Pas de titre ici")).toBeInTheDocument();
});

test("Très longue news | Contenu >512 caractères s'affiche correctement", () => {
   const longContent = "a".repeat(600);
   const mockNews = [
      { title: "Long News", content: longContent, publish_date: new Date().toISOString() },
   ];

   const mockFetchNews = jest.fn();

   render(<Home newsState={{ news: mockNews, fetchNews: mockFetchNews }} />);

   expect(screen.getByText("Long News")).toBeInTheDocument();
   expect(screen.getByText(longContent)).toBeInTheDocument();
});
