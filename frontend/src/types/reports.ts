import type {
    Requisition,
    RequisitionPriority,
    RequisitionStatus,
} from './requisitions';

export interface ReportFilters {
    from?: string;
    to?: string;
    locationId?: string;
    executorId?: string;
    categoryId?: string;
    priority?: RequisitionPriority;
    status?: RequisitionStatus;
}
export interface ReportResponse {
    generatedAt: string;
    total: number;
    rows: Requisition[];
    byStatus: Record<string, number>;
    byPeriod: Record<string, number>;
}
