import api from './api';
import type { AuditFilters, AuditPage } from '../types';

export const auditService = {
    list: (params?: AuditFilters) =>
        api.get<AuditPage>('/auditoria', { params }).then(({ data }) => data),
};
