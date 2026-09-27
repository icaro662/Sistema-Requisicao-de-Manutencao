import { FormEvent, useState } from 'react';
import { Settings, Save } from 'lucide-react';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    systemName: 'Sistema de Requisição de Manutenção',
    maintenanceMode: false,
    maxUploadSizeMB: '10',
    notificationEmail: 'admin@manutencao.local',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Configurações do Sistema</h1>
        </div>
      </div>

      {saved && (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#dcfce7', color: '#166534', borderRadius: '6px', border: '1px solid #bbf7d0', fontWeight: 500 }}>
          Configurações salvas com sucesso!
        </div>
      )}

      <div className="create-requisition-layout">
        <section className="panel create-form-panel" style={{ width: '100%', maxWidth: '800px' }}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Parâmetros Globais</p>
              <h2>Preferências do Sistema</h2>
            </div>
            <Settings size={20} />
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <label>Nome da Organização / Sistema
              <input
                type="text"
                required
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                placeholder="Nome exibido no sistema..."
              />
            </label>

            <label>E-mail do Administrador (Notificações)
              <input
                type="email"
                required
                value={settings.notificationEmail}
                onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                placeholder="admin@exemplo.com"
              />
            </label>

            <label>Tamanho Máximo de Anexo (MB)
              <input
                type="number"
                min="1"
                max="50"
                value={settings.maxUploadSizeMB}
                onChange={(e) => setSettings({ ...settings, maxUploadSizeMB: e.target.value })}
              />
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="maintenanceMode" style={{ cursor: 'pointer', fontWeight: 500, margin: 0 }}>
                Ativar Modo de Manutenção (Bloqueia novas requisições temporariamente)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button type="submit" className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={16} /> Salvar Configurações
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}