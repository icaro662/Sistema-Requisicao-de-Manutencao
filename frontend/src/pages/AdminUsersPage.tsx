import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, UserPlus, Users } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { maintenanceService } from '../services/maintenanceService';
import { useAuthStore } from '../store/authStore';
import type { ManagedUserInput, StaffRole, UserRole } from '../types';

const roleLabels: Record<UserRole, string> = {
  solicitante: 'Solicitante',
  executor: 'Executor',
  gestor: 'Gestor',
  admin: 'Administrador',
};

// Solicitantes se cadastram sozinhos; a administração cria apenas acessos
// operacionais (executor/gestor) e administrativos.
const assignableRoles = (Object.keys(roleLabels) as UserRole[]).filter((role) => role !== 'solicitante');

const emptyForm: ManagedUserInput = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'executor',
};

export default function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: maintenanceService.users });
  const [form, setForm] = useState<ManagedUserInput>(emptyForm);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: () => maintenanceService.createUser(form),
    onSuccess: () => {
      setForm(emptyForm);
      setMessage('Usuário criado com sucesso.');
      setError('');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (reason) => { setMessage(''); setError(apiErrorMessage(reason)); },
  });
  const passwordMutation = useMutation({
    mutationFn: () => maintenanceService.updateUser(currentUser?.id ?? '', { password }),
    onSuccess: () => { setPassword(''); setMessage('Sua senha foi alterada.'); setError(''); },
    onError: (reason) => { setMessage(''); setError(apiErrorMessage(reason)); },
  });

  const submitUser = (event: FormEvent) => { event.preventDefault(); setMessage(''); setError(''); createMutation.mutate(); };
  const submitPassword = (event: FormEvent) => { event.preventDefault(); setMessage(''); setError(''); passwordMutation.mutate(); };

  return <>
    <div className="admin-header"><div><p className="eyebrow">Administração</p><h1>Usuários</h1></div></div>
    {(message || error) && <p className={error ? 'form-error' : 'success-message'}>{error || message}</p>}
    <div className="admin-user-grid">
      <section className="panel admin-form-panel">
        <div className="panel-heading"><div><p className="eyebrow">Novo acesso</p><h2>Criar usuário</h2></div><UserPlus size={20} /></div>
        <form className="admin-form" onSubmit={submitUser}>
          <label>Nome<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>E-mail<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Telefone <span className="optional">(opcional)</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label>Perfil<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as StaffRole })}>{assignableRoles.map((value) => <option key={value} value={value}>{roleLabels[value]}</option>)}</select></label>
          <label>Senha inicial<input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <button className="primary-button" disabled={createMutation.isPending}><UserPlus size={16} />{createMutation.isPending ? 'Criando...' : 'Criar usuário'}</button>
        </form>
      </section>
      <section className="panel admin-form-panel">
        <div className="panel-heading"><div><p className="eyebrow">Meu perfil</p><h2>Alterar minha senha</h2></div><KeyRound size={20} /></div>
        <form className="admin-form" onSubmit={submitPassword}>
          <p className="muted">Administrador: {currentUser?.email}</p>
          <label>Nova senha<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="secondary-button" disabled={passwordMutation.isPending}>{passwordMutation.isPending ? 'Salvando...' : 'Salvar nova senha'}</button>
        </form>
      </section>
    </div>
    <section className="panel table-panel admin-users-table">
      <div className="panel-heading"><div><p className="eyebrow">Acessos cadastrados</p><h2>Usuários do sistema</h2></div><span className="result-count">{usersQuery.data?.total ?? 0} usuários</span></div>
      {usersQuery.data?.data.length ? <div className="people-list">{usersQuery.data.data.map((user) => <div className="person-row" key={user.id}><div className="avatar">{user.name[0]?.toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.email}</span></div><span className="role-chip">{roleLabels[user.role as StaffRole] ?? user.role}</span></div>)}</div> : <div className="empty-state"><Users size={23} /><strong>Nenhum usuário encontrado</strong><span>Crie o primeiro acesso administrativo ou operacional.</span></div>}
    </section>
  </>;
}
