import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import './styles/index.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from "react-router-dom"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
   <BrowserRouter>
      <App />
   </BrowserRouter>
);
