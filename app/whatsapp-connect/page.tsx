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

type DebugEvent = {
  at: string;
  source: string;
  detail: string;
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
          extras: {
            setup: Record<string, never>;
            featureType: "whatsapp_business_app_onboarding";
            version: "v4";
          };
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
  const [debugEvents, setDebugEvents] = useState<DebugEvent[]>([]);

  function addDebug(source: string, detail: string) {
    setDebugEvents((prev) => [
      ...prev,
      {at: new Date().toLocaleTimeString("fr-CH"), source, detail},
    ].slice(-12));
  }

  useEffect(() => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v26.0",
      });
      setSdkReady(true);
      setStatus("Prêt à lancer la coexistence WhatsApp.");
    };

    const onMessage = (event: MessageEvent) => {
      if (!event.origin || !/^https:\/\/(.*\.)?facebook\.com$/.test(event.origin)) return;

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
        version?: number;
        data?: EmbeddedSignupData;
      };

      if (message.type !== "WA_EMBEDDED_SIGNUP") return;

      addDebug(
        "WA_EMBEDDED_SIGNUP",
        JSON.stringify({
          event: message.event,
          version: message.version,
          data: message.data ?? null,
        })
      );

      if (
        (message.event === "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING" ||
          message.event === "FINISH") &&
        message.data
      ) {
        setResult(message.data);
        setStatus("Coexistence WhatsApp terminée.");
      } else if (message.event === "CANCEL") {
        setStatus("Connexion annulée par Meta ou par l’utilisateur.");
      } else if (message.event === "ERROR") {
        setStatus("Meta a signalé une erreur pendant la connexion.");
      } else {
        setStatus(`Événement Meta reçu : ${message.event ?? "inconnu"}`);
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
    setDebugEvents([]);
    setStatus("Ouverture du parcours de coexistence Meta…");

    window.FB.login(
      (response) => {
        if (response.authResponse?.code) {
          addDebug("FB.login", "Code d’autorisation reçu.");
          setStatus(
            "Autorisation Facebook reçue. Si le parcours WhatsApp ne continue pas, regardez le journal technique ci-dessous."
          );
        } else if (response.status === "not_authorized") {
          addDebug("FB.login", "Autorisation refusée ou incomplète.");
          setStatus("Autorisation refusée ou incomplète.");
        } else {
          addDebug("FB.login", `Retour sans code. Statut : ${response.status ?? "inconnu"}`);
          setStatus("Meta a fermé le parcours sans renvoyer de code d’autorisation.");
        }
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "whatsapp_business_app_onboarding",
          version: "v4",
        },
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
        <p style={{margin: 0, color: "#667085", fontSize: 14}}>Super-Service · Test coexistence v4</p>
        <h1 style={{fontSize: 32, lineHeight: 1.15, margin: "8px 0 14px"}}>
          Connexion WhatsApp Business
        </h1>
        <p style={{fontSize: 17, lineHeight: 1.6, color: "#344054"}}>
          Cette version lance le sélecteur de coexistence WhatsApp Business App avec le format
          actuel du parcours Embedded Signup et affiche les événements réellement renvoyés par Meta.
        </p>

        <div style={{
          background: "#eef8f1",
          border: "1px solid #b7e4c7",
          borderRadius: 12,
          padding: 16,
          margin: "22px 0",
        }}>
          <strong>Important :</strong> ne validez aucune option demandant de supprimer le compte
          WhatsApp Business du téléphone ou de migrer définitivement le numéro hors de l’app.
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
          Lancer la coexistence WhatsApp
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

        <div style={{
          marginTop: 18,
          background: "#fffaf0",
          border: "1px solid #f0d9a7",
          borderRadius: 12,
          padding: 16,
        }}>
          <strong>Journal technique</strong>
          {debugEvents.length === 0 ? (
            <div style={{marginTop: 8, color: "#667085"}}>Aucun événement reçu pour l’instant.</div>
          ) : (
            <div style={{marginTop: 8, display: "grid", gap: 8}}>
              {debugEvents.map((item, index) => (
                <div key={index} style={{fontSize: 13, overflowWrap: "anywhere"}}>
                  <strong>{item.at} · {item.source}</strong><br />
                  {item.detail}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
