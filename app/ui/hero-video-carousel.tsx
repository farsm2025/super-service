"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const videos = [
  { src: "/videos/hero-transport-1.mp4", duration: 25.8 },
  { src: "/videos/hero-transport-2.mp4", duration: 17.1 },
  { src: "/videos/hero-transport-3.mp4", duration: 10.6 },
  { src: "/videos/hero-transport-4.mp4", duration: 10.8 },
  { src: "/videos/hero-transport-5.mp4", duration: 7.9 },
];

export function HeroVideoCarousel() {
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const next = useCallback(() => {
    setActive((current) => (current + 1) % videos.length);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();
    const play = () => video.play().catch(() => undefined);
    void play();

    // Certains navigateurs mobiles n'envoient pas toujours l'événement ended.
    // Ce délai garantit que le carrousel ne reste jamais bloqué sur une vidéo.
    const fallback = window.setTimeout(
      next,
      (videos[active].duration + 4) * 1000,
    );

    const resume = () => void play();
    document.addEventListener("visibilitychange", resume);

    return () => {
      window.clearTimeout(fallback);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [active, next]);

  return (
    <section className="hero">
      <div className="video-stack" aria-hidden="true">
        <video
          ref={videoRef}
          className="active"
          autoPlay
          muted
          playsInline
          preload="auto"
          poster="/hero-video-poster.jpg"
          onCanPlay={(event) => event.currentTarget.play().catch(() => undefined)}
          onEnded={next}
          onError={next}
        >
          <source src={videos[active].src} type="video/mp4" />
        </video>
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-kicker">Déménagement • Nettoyage • Multiservices</p>
        <h1>Déménagement à Lausanne et dans le canton de Vaud</h1>
        <p>
          Une équipe polyvalente pour votre déménagement, le transport, le
          montage de meubles, le nettoyage de fin de bail, le débarras et les
          petits travaux.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/devis">
            Demander un devis gratuit
          </Link>
          <a className="button button-glass" href="tel:+41783223368">
            Nous appeler
          </a>
          <a className="button button-whatsapp" href="https://wa.me/41783223368">
            WhatsApp
          </a>
        </div>
        <span className="response-badge">
          Réponse et devis gratuit sous 24 h
        </span>
      </div>
      <div className="video-dots">
        {videos.map((video, index) => (
          <button
            key={video.src}
            className={index === active ? "active" : ""}
            onClick={() => setActive(index)}
            aria-label={`Afficher la vidéo ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
