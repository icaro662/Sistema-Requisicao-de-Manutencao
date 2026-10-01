import api from './api';
import type { ReportFilters, ReportResponse } from '../types';

export const reportService = {
    get: (params?: ReportFilters) =>
        api
            .get<ReportResponse>('/relatorios', { params })
            .then(({ data }) => data),
    export: (format: 'pdf' | 'excel', params?: ReportFilters) =>
        api
            .get(`/relatorios/export-${format}`, {
                params,
                responseType: 'blob',
            })
            .then(({ data }) => data as Blob),
};
