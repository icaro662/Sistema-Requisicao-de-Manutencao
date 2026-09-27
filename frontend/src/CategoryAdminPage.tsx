import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Tag, Edit2, Plus, Search } from 'lucide-react';
import { apiErrorMessage } from './services/api';
import { maintenanceService } from './services/maintenanceService';
import type { Category } from './types';

export default function CategoryAdminPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ 
    queryKey: ['categories'], 
    queryFn: maintenanceService.categories 
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
    mutationFn: () => maintenanceService.createCategory(form),
    onSuccess: () => {
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const updateMutation = useMutation({
    mutationFn: () => maintenanceService.updateCategory(editingId!, form),
    onSuccess: () => {
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setFieldErrors({ name: 'O nome da categoria é obrigatório.' });
      return;
    }
    setFieldErrors({});

    if (editingId) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({ name: category.name, description: category.description ?? '' });
    setError('');
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const filteredCategories = categoriesQuery.data?.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Gerenciar Categorias</h1>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="create-requisition-layout">
        <section className="panel create-form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editingId ? 'Modo de Edição' : 'Novo Registro'}</p>
              <h2>{editingId ? 'Editar Categoria' : 'Cadastrar Categoria'}</h2>
            </div>
            {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
          </div>

          <form className="admin-form" onSubmit={submit}>
            <label>Nome da Categoria
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => { 
                  setForm({ ...form, name: e.target.value }); 
                  setFieldErrors({ ...fieldErrors, name: '' }); 
                }}
                placeholder="Ex: Elétrica, Hidráulica..."
                aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </label>

            <label>Descrição <span className="optional">(opcional)</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalhes adicionais sobre a categoria..."
              />
            </label>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="primary-button" disabled={isPending}>
                {isPending ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Categoria'}
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
              <h2>Categorias Cadastradas</h2>
            </div>
            <Tag size={20} />
          </div>

          <div style={{ padding: '0 16px 12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', background: '#fff' }}>
              <Search size={16} color="#6b7280" />
              <input
                type="text"
                placeholder="Buscar categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
              />
            </div>
          </div>

          {categoriesQuery.isLoading ? (
            <div className="empty-state">Carregando categorias...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px 16px 16px' }}>
              {filteredCategories?.map((category) => (
                <div 
                  key={category.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    background: editingId === category.id ? '#eff6ff' : '#fff' 
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#111827' }}>
                      {category.name}
                    </strong>
                    {category.description && (
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        {category.description}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '4px' }}
                    title="Editar categoria"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              ))}
              {!filteredCategories?.length && (
                <div className="empty-state">Nenhuma categoria encontrada.</div>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}