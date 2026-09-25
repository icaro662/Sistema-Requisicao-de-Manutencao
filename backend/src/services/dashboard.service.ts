import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  summary(): { total: number; byStatus: Record<string, number> } {
    return { total: 0, byStatus: {} };
  }
}
