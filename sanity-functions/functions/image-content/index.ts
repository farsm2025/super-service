import {documentEventHandler} from '@sanity/functions'
import {createClient} from '@sanity/client'

export const handler = documentEventHandler(async ({context, event}) => {
  const {data} = event

  if (!data?._id) {
    console.log('Aucun document à traiter')
    return
  }

  const client = createClient({
    ...context.clientOptions,
    apiVersion: 'vX',
    useCdn: false,
  })

  console.log(`Analyse IA de la photo : ${data._id}`)

  try {
    const result = await client.agent.action.transform({
      schemaId: '_.schemas.superService',
      documentId: data._id,

      // L'action continue côté Sanity sans bloquer la Function
      async: true,

      instruction: `
Analyse la photo de cette réalisation de Super-Service.

Super-Service est une entreprise de déménagement et multiservices.

Décris uniquement ce qui est raisonnablement visible sur la photo.
N'invente jamais de lieu, de commune, de prix, de marque,
de matériau précis ou de travaux qui ne peuvent pas être identifiés visuellement.

Rédige en français naturel, professionnel et utile pour un site web.
`,

      target: [
        {
          path: ['title'],
          operation: {
            type: 'image-description',
            sourcePath: ['mainImage', 'asset'],
          },
          instruction: `
Crée un titre court et naturel correspondant à la photo.
Maximum 70 caractères.
Le titre doit convenir à une galerie de réalisations.
Ne mentionne pas de commune si elle ne peut pas être connue avec certitude.
`,
        },

        {
          path: ['description'],
          operation: {
            type: 'image-description',
            sourcePath: ['mainImage', 'asset'],
          },
          instruction: `
Écris une courte description professionnelle de la réalisation visible.
Maximum 2 phrases.
Décris seulement ce que la photo permet réellement d'identifier.
Évite les formulations exagérées et n'invente aucune information.
`,
        },

        {
          path: ['mainImage', 'alt'],
          operation: {
            type: 'image-description',
          },
          instruction: `
Écris un texte alternatif précis et naturel pour cette photo.
Maximum 125 caractères.
Décris ce que montre réellement l'image.
N'utilise pas les mots "image de" ou "photo de".
`,
        },
      ],
    })

    console.log('Agent Action lancée avec succès', result)
  } catch (error) {
    console.error('Erreur pendant la génération IA :', error)
    throw error
  }
})