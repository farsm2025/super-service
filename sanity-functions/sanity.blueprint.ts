import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'image-content',
      event: {
        on: ['create', 'update'],
        includeDrafts: true,
        filter:
          '_type == "realization" && defined(mainImage.asset._ref) && (delta::operation() == "create" || delta::changedAny(mainImage.asset))',
        projection: '{_id, _type, mainImage}',
        resource: {
          type: 'dataset',
          id: 'hk158c3c.production',
        },
      },
    }),
  ],
})
