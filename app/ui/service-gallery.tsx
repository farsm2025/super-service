import Image from "next/image";

export type ServicePhoto = {
  src: string;
  alt: string;
  caption: string;
  position?: string;
};

export function ServiceGallery({
  id,
  eyebrow,
  title,
  photos,
}: {
  id: string;
  eyebrow: string;
  title: string;
  photos: ServicePhoto[];
}) {
  return (
    <section className="moving-showcase" aria-labelledby={id}>
      <div className="moving-showcase-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      <div className="moving-gallery">
        {photos.map((photo) => (
          <figure key={photo.src}>
            <div className="moving-photo">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 680px) calc(100vw - 44px), (max-width: 1200px) 44vw, 540px"
                style={photo.position ? { objectPosition: photo.position } : undefined}
              />
            </div>
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
