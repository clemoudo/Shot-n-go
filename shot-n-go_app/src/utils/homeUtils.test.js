import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../components/Home/Home";

test("✅ Affiche des news | Les titres sont visibles", () => {
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

