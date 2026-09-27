import { useQuery } from '@tanstack/react-query';
import { Database, MapPin, Tag } from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import PageHeading from '../components/PageHeading';

export default function ReferencePage({ type }: { type: 'locations' | 'categories' }) {
  const query = useQuery({
    queryKey: [type],
    queryFn: type === 'locations' ? maintenanceService.locations : maintenanceService.categories,
  });

  const title = type === 'locations' ? 'Locais' : 'Categorias';

  return (
    <>
      <PageHeading
        eyebrow="Dados de referência"
        title={title}
        action={
          <button className="primary-button compact" disabled title={`O endpoint de criação de ${title.toLowerCase()} ainda não está disponível`}>
            <Database size={16} /> Adicionar {type === 'locations' ? 'local' : 'categoria'}
          </button>
        }
      />
      <section className="reference-grid">
        {query.data?.map((item: any) => (
          <article className="reference-card" key={item.id}>
            <div className="reference-icon">
              {type === 'locations' ? <MapPin size={18} /> : <Tag size={18} />}
            </div>
            <div>
              <h2>{item.name}</h2>
              <p>{item.description ?? 'Nenhuma descrição informada.'}</p>
            </div>
          </article>
        ))}
      </section>
      {!query.isLoading && !query.data?.length && (
        <div className="empty-state panel">
          Nenhum registro de {title.toLowerCase()} retornado pela API.
        </div>
      )}
    </>
  );
}
