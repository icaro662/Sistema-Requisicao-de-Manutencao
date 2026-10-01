import api from './api';
import type { DashboardFilters, DashboardSummary } from '../types';

export const dashboardService = {
    getSummary: (params?: DashboardFilters) =>
        api
            .get<DashboardSummary>('/painel', { params })
            .then(({ data }) => data),
};
