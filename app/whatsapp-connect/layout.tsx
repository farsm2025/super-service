import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Connexion WhatsApp",
  robots: {index: false, follow: false},
};

export default function WhatsAppConnectLayout({children}:{children:React.ReactNode}) {
  return children;
}
