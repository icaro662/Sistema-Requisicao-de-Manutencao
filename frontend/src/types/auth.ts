export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
}

export type UserRole = 'solicitante' | 'executor' | 'gestor' | 'admin';

export type StaffRole = Exclude<UserRole, 'solicitante'>;

export interface ManagedUserInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: StaffRole;
}

export interface UpdateUserInput {
    name?: string;
    phone?: string;
    role?: UserRole;
    password?: string;
}

export interface AuthResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
}
