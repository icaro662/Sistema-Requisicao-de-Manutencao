import { auditService } from './auditService';
import { categoryService } from './categoryService';
import { dashboardService } from './dashboardService';
import { executionService } from './executionService';
import { locationService } from './locationService';
import { materialService } from './materialService';
import { notificationService } from './notificationService';
import { reportService } from './reportService';
import { requisitionService } from './requisitionService';
import { uploadService } from './uploadService';
import { userService } from './userService';

/** @deprecated Import the domain service directly from this directory. */
export const maintenanceService = {
    dashboard: dashboardService.getSummary,
    report: reportService.get,
    exportReport: reportService.export,
    requisitions: requisitionService.list,
    requisition: requisitionService.get,
    uploadPhoto: uploadService.photo,
    removePhoto: uploadService.remove,
    createRequisition: requisitionService.create,
    updateStatus: requisitionService.updateStatus,
    assignExecutor: requisitionService.assignExecutor,
    selfAssign: requisitionService.selfAssign,
    registerExecution: executionService.register,
    addObservation: executionService.addObservation,
    executionHistory: executionService.history,
    requisitionHistory: requisitionService.history,
    auditoria: auditService.list,
    finalizeRequisition: requisitionService.finalize,
    cancelRequisition: requisitionService.cancel,
    users: userService.list,
    createUser: userService.create,
    updateUser: userService.update,
    locations: locationService.list,
    createLocation: locationService.create,
    updateLocation: locationService.update,
    deleteLocation: locationService.remove,
    categories: categoryService.list,
    createCategory: categoryService.create,
    updateCategory: categoryService.update,
    deleteCategory: categoryService.remove,
    executors: userService.executors,
    gestores: userService.managers,
    notifications: notificationService.list,
    notifyGestor: notificationService.notifyManager,
    communications: notificationService.communications,
    requestMaterials: materialService.listForRequisition,
    createRequestMaterial: materialService.create,
    executions: executionService.list,
};
