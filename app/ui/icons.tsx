import type { SVGProps } from "react";

type IconName =
  | "moving"
  | "cleaning"
  | "truck"
  | "delivery"
  | "assembly"
  | "recycling"
  | "tools"
  | "phone"
  | "whatsapp"
  | "quote"
  | "driver";

const paths: Record<IconName, React.ReactNode> = {
  moving: <><path d="M4 8.5 12 4l8 4.5v9L12 22l-8-4.5Z"/><path d="M12 13v9m0-9 8-4.5M12 13 4 8.5"/></>,
  cleaning: <><path d="m14 4 1.2 3.1L18 8.5l-2.8 1.4L14 13l-1.2-3.1L10 8.5l2.8-1.4Z"/><path d="m6.5 13 .8 2.2 2.2.8-2.2.8L6.5 19l-.8-2.2-2.2-.8 2.2-.8Z"/></>,
  truck: <><path d="M3 6h11v11H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  delivery: <><path d="M5 7h14v10H5z"/><path d="m9 11 3 3 3-3M12 14V4"/><path d="M8 20h8"/></>,
  assembly: <><path d="m14.5 6.5 3-3 3 3-3 3"/><path d="m9.5 17.5-3 3-3-3 3-3"/><path d="m8 16 8-8"/><path d="M4 4h5v5H4zm11 11h5v5h-5z"/></>,
  recycling: <><path d="m8 7 2-3 2 3"/><path d="M10 4a8 8 0 0 1 7 4"/><path d="m18 10 3 1-2 2"/><path d="M21 11a8 8 0 0 1-4 7"/><path d="m14 19-1 3-2-2"/><path d="M13 22a8 8 0 0 1-7-4"/><path d="m5 15-3-1 2-2"/><path d="M2 14a8 8 0 0 1 4-7"/></>,
  tools: <><path d="m14 6 4-4 4 4-4 4"/><path d="m12 8 4 4"/><path d="m5 19 7-7 3 3-7 7H5Z"/><path d="m3 3 5 5"/></>,
  phone: <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-1-2 2c-4-1.5-7.5-5-9-9l2-2Z"/>,
  whatsapp: <><path d="M20 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.1-4.2A8.5 8.5 0 1 1 20 11.5Z"/><path d="M8.2 7.5c.8 3.4 2.9 5.5 6.3 6.3"/></>,
  quote: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
  driver: <><circle cx="12" cy="7" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/><path d="M8 16h8M12 16v5"/></>,
};

export function Icon({name, ...props}: {name: IconName} & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name]}</svg>;
}
