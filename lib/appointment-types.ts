export const appointmentStatuses=["new_request","awaiting_customer","confirmed","modified","completed","cancelled","rejected"] as const;
export type AppointmentStatus=typeof appointmentStatuses[number];

export type Appointment={
  id:string;
  customerName:string;
  customerEmail:string;
  customerPhone:string;
  customerAddress:string;
  requestType:string;
  reason:string;
  customerNotes:string|null;
  preferredDate:string;
  preferredTimeStart:string|null;
  preferredTimeEnd:string|null;
  alternateDate:string|null;
  alternateTimeStart:string|null;
  alternateTimeEnd:string|null;
  startsAt:string|null;
  endsAt:string|null;
  timezone:string;
  status:AppointmentStatus;
  source:"client"|"manual";
  adminNotes:string|null;
  googleEventId:string|null;
  createdAt:string;
  updatedAt:string;
};

export const statusLabels:Record<AppointmentStatus,string>={
  new_request:"Nouvelle demande",
  awaiting_customer:"En attente de réponse",
  confirmed:"Confirmé",
  modified:"Modifié",
  completed:"Terminé",
  cancelled:"Annulé",
  rejected:"Refusé",
};
