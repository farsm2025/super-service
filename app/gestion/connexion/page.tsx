import {redirect} from "next/navigation";
import Link from "next/link";
import {getAdminSession} from "@/lib/admin-auth";
import {LoginForm} from "./login-form";
export const dynamic="force-dynamic";
export default async function LoginPage(){if(await getAdminSession())redirect("/gestion");return <main className="login-page"><section className="login-card"><div className="login-logo">SUPER-SERVICE</div><p className="eyebrow">Espace sécurisé</p><h1>Planning et demandes</h1><p>Recevez un lien de connexion à l’adresse professionnelle de Super-Service. Aucun mot de passe à retenir.</p><LoginForm/><Link href="/">Retour au site</Link></section></main>}
