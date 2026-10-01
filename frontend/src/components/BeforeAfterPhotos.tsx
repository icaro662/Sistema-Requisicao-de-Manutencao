import { ImageOff } from 'lucide-react';

type BeforeAfterPhotosProps = {
  beforeUrl?: string | null;
  afterUrl?: string | null;
};

/**
 * Visualização das fotos registradas antes e depois da manutenção.
 */
export default function BeforeAfterPhotos({ beforeUrl, afterUrl }: BeforeAfterPhotosProps) {
  if (!beforeUrl && !afterUrl) return null;

  const photos = [
    { label: 'Antes da manutenção', url: beforeUrl },
    { label: 'Depois da manutenção', url: afterUrl },
  ];

  return (
    <div className="before-after">
      <p className="eyebrow" style={{ marginBottom: 0 }}>Fotos da manutenção</p>
      <div className="before-after-grid">
        {photos.map((photo) => (
          <figure key={photo.label}>
            {photo.url ? (
              <a className="photo-frame" href={photo.url} target="_blank" rel="noreferrer" aria-label={`Abrir foto: ${photo.label}`}>
                <img src={photo.url} alt={photo.label} />
              </a>
            ) : (
              <div className="photo-frame photo-missing">
                <ImageOff size={18} />
                <span>Sem foto {photo.label.toLowerCase()}</span>
              </div>
            )}
            <figcaption>{photo.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
