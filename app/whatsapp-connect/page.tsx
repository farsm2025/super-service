"use client";

import Script from "next/script";
import {useEffect, useState} from "react";

const META_APP_ID = "3109324129457080";
const META_CONFIG_ID = "1486235263338709";

type EmbeddedSignupData = {
  waba_id?: string;
  phone_number_id?: string;
  business_id?: string;
};

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          status?: string;
          authResponse?: {code?: string; accessToken?: string};
        }) => void,
        options: {
          config_id: string;
          response_type: "code";
          override_default_response_type: boolean;
        }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function WhatsAppConnectPage() {
  const [sdkReady, setSdkReady] = useState(false);
  const [status, setStatus] = useState("Chargement du SDK Meta…");
  const [result, setResult] = useState<EmbeddedSignupData | null>(null);

  useEffect(() => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v26.0",
      });
      setSdkReady(true);
      setStatus("Prêt à lancer la connexion WhatsApp.");
    };

    const onMessage = (event: MessageEvent) => {
      if (!event.origin.includes("facebook.com")) return;

      let payload: unknown = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      if (!payload || typeof payload !== "object") return;
      const message = payload as {
        type?: string;
        event?: string;
        data?: EmbeddedSignupData;
      };

      if (message.type !== "WA_EMBEDDED_SIGNUP") return;

      if (message.event === "FINISH" && message.data) {
        setResult(message.data);
        setStatus("Connexion WhatsApp terminée.");
      } else if (message.event === "CANCEL") {
        setStatus("Connexion annulée.");
      } else if (message.event === "ERROR") {
        setStatus("Meta a signalé une erreur pendant la connexion.");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function launchSignup() {
    if (!window.FB || !sdkReady) {
      setStatus("Le SDK Meta n’est pas encore prêt. Réessayez dans quelques secondes.");
      return;
    }

    setResult(null);
    setStatus("Ouverture de Meta…");

    window.FB.login(
      (response) => {
        if (response.authResponse?.code) {
          setStatus("Autorisation reçue. Finalisez le parcours WhatsApp dans la fenêtre Meta.");
        } else if (response.status === "not_authorized") {
          setStatus("Autorisation refusée ou incomplète.");
        }
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
      }
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f5f7fa",
      padding: "48px 20px",
      fontFamily: "var(--font-inter), Arial, sans-serif",
    }}>
      <Script
        id="facebook-jssdk"
        src="https://connect.facebook.net/fr_FR/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.fbAsyncInit && !sdkReady) {
            window.fbAsyncInit();
          }
        }}
      />

      <section style={{
        maxWidth: 760,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 18,
        padding: 32,
        boxShadow: "0 12px 35px rgba(0,0,0,.08)",
      }}>
        <p style={{margin: 0, color: "#667085", fontSize: 14}}>Super-Service · Test technique</p>
        <h1 style={{fontSize: 32, lineHeight: 1.15, margin: "8px 0 14px"}}>
          Connexion WhatsApp Business
        </h1>
        <p style={{fontSize: 17, lineHeight: 1.6, color: "#344054"}}>
          Cette page temporaire sert uniquement à lancer le parcours Meta avec la configuration
          WhatsApp de Super-Service et à vérifier la coexistence avec le numéro déjà utilisé
          dans l’application WhatsApp Business.
        </p>

        <div style={{
          background: "#eef8f1",
          border: "1px solid #b7e4c7",
          borderRadius: 12,
          padding: 16,
          margin: "22px 0",
        }}>
          <strong>Important :</strong> cette page ne stocke ni token ni mot de passe. Ne validez
          aucune option qui demanderait de supprimer ou de migrer définitivement le numéro
          WhatsApp existant.
        </div>

        <button
          type="button"
          onClick={launchSignup}
          disabled={!sdkReady}
          style={{
            border: 0,
            borderRadius: 10,
            padding: "14px 20px",
            fontSize: 16,
            fontWeight: 700,
            cursor: sdkReady ? "pointer" : "not-allowed",
            background: sdkReady ? "#1877f2" : "#98a2b3",
            color: "#fff",
          }}
        >
          Connecter WhatsApp avec Meta
        </button>

        <div style={{marginTop: 22, paddingTop: 18, borderTop: "1px solid #eaecf0"}}>
          <strong>État :</strong> {status}
        </div>

        {result && (
          <div style={{
            marginTop: 18,
            background: "#f9fafb",
            border: "1px solid #eaecf0",
            borderRadius: 12,
            padding: 16,
          }}>
            <strong>Informations renvoyées par Meta</strong>
            <div style={{marginTop: 10}}>WABA / compte de messagerie : {result.waba_id ?? "non renvoyé"}</div>
            <div>ID du numéro : {result.phone_number_id ?? "non renvoyé"}</div>
            <div>ID Business : {result.business_id ?? "non renvoyé"}</div>
          </div>
        )}
      </section>
    </main>
  );
}
