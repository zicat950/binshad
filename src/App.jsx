import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import Certificates from "./Certificates";
import Story from "./Story";
import Trading from "./Trading";
import Contact from "./Contact";
import "./App.css";

const SECTIONS = [
  
];

export default function App() {
  return (
    <>
      {/* <Navbar brand="Binshad" monogram="B" ctaLabel="Let's connect" ctaTarget="contact" /> */}

      <main className="app">
        <Hero />
        <About />
        <Certificates />
        <Story />
        <Trading />
        <Contact />

        {SECTIONS.map(({ id, title, text }) => (
          <section key={id} id={id} className="app-section">
            <div className="app-section__inner">
              <h2 className="app-section__title">{title}</h2>
              <p className="app-section__text">{text}</p>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}