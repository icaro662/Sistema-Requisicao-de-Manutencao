import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Edit2, Plus, Search } from 'lucide-react';
import { apiErrorMessage } from './services/api';
import { maintenanceService } from './services/maintenanceService';
import type { Location } from './types';

export default function LocationAdminPage() {
  const queryClient = useQueryClient();
  const locationsQuery = useQuery({ 
    queryKey: ['locations'], 
    queryFn: maintenanceService.locations 
  });

  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({});

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setEditingId(null);
    setError('');
    setFieldErrors({});
  };

  const createMutation = useMutation({
    mutationFn: () => maintenanceService.createLocation(form),
    onSuccess: () => {
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const updateMutation = useMutation({
    mutationFn: () => maintenanceService.updateLocation(editingId!, form),
    onSuccess: () => {
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setFieldErrors({ name: 'O nome do local é obrigatório.' });
      return;
    }
    setFieldErrors({});

    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    setForm({ name: location.name, description: location.description ?? '' });
    setError('');
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Filtrar locais com base na busca
  const filteredLocations = locationsQuery.data?.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Gerenciar Locais</h1>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="create-requisition-layout">
        <section className="panel create-form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editingId ? 'Modo de Edição' : 'Novo Registro'}</p>
              <h2>{editingId ? 'Editar Local' : 'Cadastrar Local'}</h2>
            </div>
            {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
          </div>

          <form className="admin-form" onSubmit={submit}>
            <label>Nome do Local
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => { 
                  setForm({ ...form, name: e.target.value }); 
                  setFieldErrors({ ...fieldErrors, name: '' }); 
                }}
                placeholder="Ex: Sala 101, Laboratório..."
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </label>

            <label>Descrição <span className="optional">(opcional)</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalhes adicionais sobre o local..."
              />
            </label>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="primary-button" disabled={isPending}>
                {isPending ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Local'}
              </button>

              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  disabled={isPending} 
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    border: '1px solid #d1d5db', 
                    background: '#fff', 
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <aside className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Diretório</p>
              <h2>Locais Cadastrados</h2>
            </div>
            <MapPin size={20} />
          </div>

          <div style={{ padding: '0 16px 12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', background: '#fff' }}>
              <Search size={16} color="#6b7280" />
              <input
                type="text"
                placeholder="Buscar local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
              />
            </div>
          </div>

          {locationsQuery.isLoading ? (
            <div className="empty-state">Carregando locais...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px 16px 16px' }}>
              {filteredLocations?.map((location) => (
                <div 
                  key={location.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    background: editingId === location.id ? '#eff6ff' : '#fff' 
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#111827' }}>
                      {location.name}
                    </strong>
                    {location.description && (
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        {location.description}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(location)}
                    style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '4px' }}
                    title="Editar local"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              ))}
              {!filteredLocations?.length && (
                <div className="empty-state">Nenhum local encontrado.</div>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}