/** Types partagés entre l'interface et le serveur. Ne dépend ni de Neon ni des secrets. */
export const quoteStatuses=["a_traiter","visite_prevue","devis_envoye","termine"] as const;
export type QuoteStatus=typeof quoteStatuses[number];
export const quoteStatusLabels:Record<QuoteStatus,string>={
  a_traiter:"À traiter",
  visite_prevue:"Visite prévue",
  devis_envoye:"Devis envoyé",
  termine:"Terminé"
};
export type QuotePhoto={id:string;filename:string;caption:string;createdAt:string};
export type QuoteNote={
  id:string;firstName:string;lastName:string;phone:string;email:string;address:string;
  service:string;description:string;status:QuoteStatus;appointmentId:string|null;
  reminderAt:string|null;createdAt:string;updatedAt:string;photos:QuotePhoto[];
};
