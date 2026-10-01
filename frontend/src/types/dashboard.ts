import type { RequisitionPriority, RequisitionStatus } from './requisitions';

export interface DashboardFilters {
    from?: string;
    to?: string;
    locationId?: string;
    executorId?: string;
    categoryId?: string;
    priority?: RequisitionPriority;
    status?: RequisitionStatus;
}
export interface DashboardSummary {
    total: number;
    byStatus: Record<string, number>;
}
