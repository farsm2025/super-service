import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hk158c3c";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "superService",
  title: "Super-Service",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Gestion du site")
          .items([
            S.documentTypeListItem("realization").title("Photos des services"),
            S.documentTypeListItem("testimonial").title("Avis clients"),
            S.documentTypeListItem("service").title("Contenu et tarifs des services"),
            S.divider(),
            S.listItem()
              .title("Paramètres du site")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !["siteSettings", "realization", "testimonial", "service"].includes(item.getId() || ""),
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {types: schemaTypes},
});
