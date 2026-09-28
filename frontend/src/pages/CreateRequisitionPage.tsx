import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, MapPin, Tag } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { maintenanceService } from '../services/maintenanceService';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/Toast';
import type { Category, Location, RequisitionPriority } from '../types';
import { validateRequisitionForm, type FieldError } from '../utils/validation';

const priorityOptions: { value: RequisitionPriority; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export default function CreateRequisitionPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const locationsQuery = useQuery({ queryKey: ['locations'], queryFn: maintenanceService.locations });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: maintenanceService.categories });
  const gestoresQuery = useQuery({ queryKey: ['gestores'], queryFn: maintenanceService.gestores });

  const [form, setForm] = useState({
    locationId: '',
    categoryId: '',
    gestorId: '',
    description: '',
    priority: 'media' as RequisitionPriority,
    requesterWhatsapp: currentUser?.phone ?? '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  const mutation = useMutation({
    mutationFn: async () => {
      const uploadedPhoto = photo ? await maintenanceService.uploadPhoto(photo) : undefined;
      try {
        return await maintenanceService.createRequisition({
          ...form,
          gestorId: form.gestorId || undefined,
          requesterEmail: currentUser?.email ?? '',
          requesterPhone: currentUser?.phone ?? '',
          requesterWhatsapp: form.requesterWhatsapp,
          photoUrl: uploadedPhoto?.path,
        });
      } catch (reason) {
        if (uploadedPhoto) await maintenanceService.removePhoto(uploadedPhoto.filename).catch(() => undefined);
        throw reason;
      }
    },
    onSuccess: () => {
      showToast('Requisição criada com sucesso!', 'success');
      void queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (reason) => showToast(apiErrorMessage(reason)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const errors = validateRequisitionForm(form.locationId, form.categoryId, form.description, form.requesterWhatsapp, photo);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    mutation.mutate();
  };

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Nova solicitação</p>
        <h1>Abrir requisição</h1>
      </div>
    </div>

    <div className="create-requisition-layout">
      <section className="panel create-form-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Formulário</p>
            <h2>Dados da solicitação</h2>
          </div>
          <ClipboardList size={20} />
        </div>
        <form className="admin-form" onSubmit={submit}>
          <label>Local
            <select
              required
              value={form.locationId}
              onChange={(event) => { setForm({ ...form, locationId: event.target.value }); setFieldErrors({ ...fieldErrors, locationId: '' }); }}
              aria-invalid={Boolean(fieldErrors.locationId)}
            >
              <option value="">Selecione um local</option>
              {locationsQuery.data?.map((location: Location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            {fieldErrors.locationId && <span className="field-error">{fieldErrors.locationId}</span>}
          </label>
          <label>Categoria
            <select
              required
              value={form.categoryId}
              onChange={(event) => { setForm({ ...form, categoryId: event.target.value }); setFieldErrors({ ...fieldErrors, categoryId: '' }); }}
              aria-invalid={Boolean(fieldErrors.categoryId)}
            >
              <option value="">Selecione uma categoria</option>
              {categoriesQuery.data?.map((category: Category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {fieldErrors.categoryId && <span className="field-error">{fieldErrors.categoryId}</span>}
          </label>
          <label>Gestor responsável <span className="optional">(opcional)</span>
            <select
              value={form.gestorId}
              onChange={(event) => setForm({ ...form, gestorId: event.target.value })}
            >
              <option value="">Sem gestor definido</option>
              {gestoresQuery.data?.map((gestor) => (
                <option key={gestor.id} value={gestor.id}>{gestor.name}</option>
              ))}
            </select>
            <span className="field-hint">É para este gestor que as notificações da requisição são enviadas.</span>
          </label>
          <label>Descrição
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => { setForm({ ...form, description: event.target.value }); setFieldErrors({ ...fieldErrors, description: '' }); }}
              placeholder="Descreva o problema ou necessidade..."
              aria-invalid={Boolean(fieldErrors.description)}
            />
            {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
          </label>
          <label>WhatsApp <span className="optional">(opcional)</span>
            <input
              type="tel"
              value={form.requesterWhatsapp}
              onChange={(event) => { setForm({ ...form, requesterWhatsapp: event.target.value }); setFieldErrors({ ...fieldErrors, requesterWhatsapp: '' }); }}
              placeholder="(00) 00000-0000"
              aria-invalid={Boolean(fieldErrors.requesterWhatsapp)}
            />
            {fieldErrors.requesterWhatsapp && <span className="field-error">{fieldErrors.requesterWhatsapp}</span>}
          </label>
          <label>Foto do problema <span className="optional">(opcional)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => { setPhoto(event.target.files?.[0] ?? null); setFieldErrors({ ...fieldErrors, photo: '' }); }}
              aria-invalid={Boolean(fieldErrors.photo)}
            />
            {fieldErrors.photo && <span className="field-error">{fieldErrors.photo}</span>}
          </label>
          <label>Prioridade
            <select
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value as RequisitionPriority })}
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <button className="primary-button" disabled={mutation.isPending}>
            {mutation.isPending ? 'Criando...' : 'Criar requisição'}
          </button>
        </form>
      </section>

      <aside className="panel create-aside-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Passo a passo</p>
            <h2>Como abrir uma solicitação</h2>
          </div>
        </div>
        <div className="steps-list">
          <div className="step-item">
            <span className="step-number">1</span>
            <div>
              <strong>Selecione o local</strong>
              <p>Indique o local onde o problema precisa ser resolvido.</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">2</span>
            <div>
              <strong>Escolha a categoria</strong>
              <p>Selecione o tipo de manutenção (elétrica, hidráulica, mobiliário, etc.).</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">3</span>
            <div>
              <strong>Descreva o problema</strong>
              <p>Explique o que está acontecendo com o máximo de detalhes possível.</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">4</span>
            <div>
              <strong>Defina a prioridade</strong>
              <p>Escolha entre baixa, média, alta ou urgente.</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">5</span>
            <div>
              <strong>Envie e acompanhe</strong>
              <p>Após enviar, acompanhe o status em "Minhas solicitações".</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </>;
}
