# Estrutura do Frontend - React

## Configuração do projeto

```bash
npx create-react-app maintenance-system-web
cd maintenance-system-web

# Instalar dependências
npm install axios react-router-dom zustand react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Estrutura de diretórios

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── SuccessMessage.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── Pagination.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── requisitions/
│   │   ├── RequisitionForm.tsx
│   │   ├── RequisitionList.tsx
│   │   ├── RequisitionCard.tsx
│   │   ├── RequisitionDetails.tsx
│   │   ├── RequisitionHistory.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── PhotoUploader.tsx
│   │   └── ExecutionForm.tsx
│   │
│   ├── dashboard/
│   │   ├── DashboardOverview.tsx
│   │   ├── IndicatorCard.tsx
│   │   ├── StatusChart.tsx
│   │   ├── LocationChart.tsx
│   │   ├── ExecutorChart.tsx
│   │   ├── RecentRequisitions.tsx
│   │   └── FilterPanel.tsx
│   │
│   ├── users/
│   │   ├── UserForm.tsx
│   │   ├── UserList.tsx
│   │   ├── UserCard.tsx
│   │   └── RoleSelect.tsx
│   │
│   ├── locations/
│   │   ├── LocationForm.tsx
│   │   ├── LocationList.tsx
│   │   └── LocationSelect.tsx
│   │
│   ├── categories/
│   │   ├── CategoryForm.tsx
│   │   ├── CategoryList.tsx
│   │   └── CategorySelect.tsx
│   │
│   └── modals/
│       ├── RequisitionModal.tsx
│       ├── ExecutionModal.tsx
│       ├── AssignExecutorModal.tsx
│       └── FilterModal.tsx
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   │
│   ├── requisitions/
│   │   ├── RequisitionsPage.tsx
│   │   ├── CreateRequisitionPage.tsx
│   │   ├── RequisitionDetailPage.tsx
│   │   ├── MyRequisitionsPage.tsx
│   │   └── ExecutorRequisitionsPage.tsx
│   │
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── UsersPage.tsx
│   │   ├── LocationsPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── ExecutorsPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── manager/
│   │   ├── ManagerDashboard.tsx
│   │   ├── RequisitionAssignPage.tsx
│   │   └── TeamPerformancePage.tsx
│   │
│   ├── reports/
│   │   ├── ReportsPage.tsx
│   │   ├── ReportBuilder.tsx
│   │   └── ReportViewer.tsx
│   │
│   ├── NotFoundPage.tsx
│   ├── UnauthorizedPage.tsx
│   └── HomePage.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useRequisitions.ts
│   ├── useLocations.ts
│   ├── useCategories.ts
│   ├── useUsers.ts
│   ├── useDashboard.ts
│   ├── usePagination.ts
│   ├── useNotifications.ts
│   └── useFilters.ts
│
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── requisitionService.ts
│   ├── userService.ts
│   ├── locationService.ts
│   ├── categoryService.ts
│   ├── uploadService.ts
│   ├── dashboardService.ts
│   ├── reportService.ts
│   └── notificationService.ts
│
├── store/
│   ├── authStore.ts
│   ├── uiStore.ts
│   ├── filterStore.ts
│   └── notificationStore.ts
│
├── types/
│   ├── index.ts
│   ├── auth.types.ts
│   ├── requisition.types.ts
│   ├── user.types.ts
│   ├── location.types.ts
│   ├── category.types.ts
│   ├── dashboard.types.ts
│   ├── api.types.ts
│   └── common.types.ts
│
├── utils/
│   ├── axios.config.ts
│   ├── date.utils.ts
│   ├── string.utils.ts
│   ├── validation.utils.ts
│   ├── localStorage.utils.ts
│   ├── whatsapp.utils.ts
│   └── format.utils.ts
│
├── constants/
│   ├── routes.constants.ts
│   ├── status.constants.ts
│   ├── priority.constants.ts
│   ├── roles.constants.ts
│   └── messages.constants.ts
│
├── styles/
│   ├── globals.css
│   ├── tailwind.css
│   └── variables.css
│
├── App.tsx
├── App.css
├── index.tsx
└── index.css

```

## Exemplos de arquivos principais

### 1. App.tsx (Configuração do roteador)
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Páginas de autenticação
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Páginas de requisições
import RequisitionsPage from './pages/requisitions/RequisitionsPage';
import CreateRequisitionPage from './pages/requisitions/CreateRequisitionPage';
import RequisitionDetailPage from './pages/requisitions/RequisitionDetailPage';
import MyRequisitionsPage from './pages/requisitions/MyRequisitionsPage';
import ExecutorRequisitionsPage from './pages/requisitions/ExecutorRequisitionsPage';

// Páginas administrativas
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import LocationsPage from './pages/admin/LocationsPage';
import CategoriesPage from './pages/admin/CategoriesPage';

// Páginas do gestor
import ManagerDashboard from './pages/manager/ManagerDashboard';

// Relatórios
import ReportsPage from './pages/reports/ReportsPage';

// Outros
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          
          {/* Requisições */}
          <Route path="/requisitions" element={<RequisitionsPage />} />
          <Route path="/requisitions/new" element={<CreateRequisitionPage />} />
          <Route path="/requisitions/:id" element={<RequisitionDetailPage />} />
          <Route path="/my-requisitions" element={<MyRequisitionsPage />} />
          <Route path="/executor/requisitions" element={<ExecutorRequisitionsPage />} />

          {/* Rotas administrativas */}
          <Route 
            path="/admin/*" 
            element={<ProtectedRoute requiredRole="admin" />}
          >
            <Route path="" element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
          </Route>

          {/* Rotas do gestor */}
          <Route 
            path="/manager/*" 
            element={<ProtectedRoute requiredRole={['manager', 'admin']} />}
          >
            <Route path="" element={<ManagerDashboard />} />
          </Route>

          {/* Relatórios */}
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* Não encontrado */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### 2. Tipos (types/index.ts)
```typescript
// Tipos de autenticação
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'solicitante' | 'executor' | 'gestor' | 'admin';
  location?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Tipos de requisição
export type RequisitionStatus = 
  | 'aberta' 
  | 'em_analise' 
  | 'em_atendimento' 
  | 'aguardando_material' 
  | 'concluida' 
  | 'cancelada';

export type RequisitionPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface Requisition {
  id: string;
  number: string;
  requester: User;
  executor?: User;
  manager?: User;
  referent?: User;
  location: Location;
  category: Category;
  description: string;
  status: RequisitionStatus;
  priority: RequisitionPriority;
  requesterEmail: string;
  requesterPhone: string;
  requesterWhatsapp?: string;
  attachments: Attachment[];
  history: RequisitionHistory[];
  executionDescription?: string;
  executionDate?: Date;
  materialsUsed?: string;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: 'initial' | 'execution';
  uploadedAt: Date;
}

export interface RequisitionHistory {
  id: string;
  action: string;
  changedBy: User;
  previousValue?: string;
  newValue?: string;
  timestamp: Date;
}

// Paginação
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: RequisitionStatus;
  priority?: RequisitionPriority;
  location?: string;
  executor?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Painel
export interface DashboardIndicators {
  openRequisitions: number;
  inService: number;
  awaitingMaterial: number;
  completedRequisitions: number;
  averageCompletionTime: number;
  recentRequisitions: Requisition[];
}

// Filtros
export interface RequisitionFilter {
  status?: RequisitionStatus[];
  priority?: RequisitionPriority[];
  locationId?: string;
  executorId?: string;
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}
```

### 3. Serviço de autenticação (services/authService.ts)
```typescript
import api from './api';
import { User, AuthToken } from '../types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthToken & { user: User }> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<{ user: User }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<AuthToken> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
```

### 4. Hooks personalizados (hooks/useRequisitions.ts)
```typescript
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as requisitionService from '../services/requisitionService';
import { Requisition, PaginationParams, RequisitionFilter } from '../types';

export const useRequisitions = (params?: PaginationParams) => {
  const queryClient = useQueryClient();

  const {
    data: requisitions,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['requisitions', params],
    () => requisitionService.getRequisitions(params),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(
    (data) => requisitionService.createRequisition(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('requisitions');
      },
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => requisitionService.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('requisitions');
      },
    }
  );

  return {
    requisitions,
    isLoading,
    error,
    refetch,
    createRequisition: createMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateStatusMutation.isLoading,
  };
};
```

### 5. Store Zustand (store/authStore.ts)
```typescript
import create from 'zustand';
import { User, AuthToken } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ token: accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

## Exemplos de componentes

### RequisitionForm.tsx
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoUploader from './PhotoUploader';
import LocationSelect from '../locations/LocationSelect';
import CategorySelect from '../categories/CategorySelect';

const RequisitionForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    category: '',
    requesterEmail: '',
    requesterPhone: '',
    requesterWhatsapp: '',
    priority: 'media',
  });

  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de envio
    navigate('/requisitions');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nova Requisição de Manutenção</h1>
      
      <LocationSelect 
        value={formData.location}
        onChange={(value) => setFormData({...formData, location: value})}
      />
      
      <CategorySelect 
        value={formData.category}
        onChange={(value) => setFormData({...formData, category: value})}
      />

      <textarea
        placeholder="Descrição do problema"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        className="w-full p-3 border rounded mb-4"
        rows={5}
        required
      />

      <PhotoUploader onPhotosChange={setPhotos} />

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Criar Requisição
      </button>
    </form>
  );
};

export default RequisitionForm;
```

## Principais recursos por perfil

### Solicitante
- Criar requisições de manutenção
- Visualizar suas próprias requisições
- Acompanhar alterações de status
- Receber notificações
- Adicionar fotos dos problemas

### Executor (Prestador do serviço)
- Visualizar requisições atribuídas
- Alterar o status das requisições
- Registrar detalhes da execução
- Adicionar materiais utilizados
- Enviar fotos da conclusão
- Adicionar observações

### Gestor
- Visualizar todas as requisições de sua área
- Atribuir executores às requisições
- Monitorar o desempenho da equipe
- Acessar o painel com indicadores
- Gerar relatórios
- Enviar notificações

### Administrador
- Gerenciar todos os usuários
- Gerenciar locais
- Gerenciar categorias
- Gerenciar executores
- Configurações do sistema
- Trilha completa de auditoria

