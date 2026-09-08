export declare const UserRole: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly DIRECTOR: "DIRECTOR";
    readonly MANAGER: "MANAGER";
    readonly MECHANIC: "MECHANIC";
};
export type UserRole = typeof UserRole[keyof typeof UserRole];
export interface User {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
    is_active: boolean;
    last_login_at?: string;
    created_at: string;
}
export interface Customer {
    id: string;
    name: string;
    location?: string;
    contact_person?: string;
    contact_phone?: string;
}
export declare const HealthStatus: {
    readonly HEALTHY: "HEALTHY";
    readonly ATTENTION: "ATTENTION";
    readonly CRITICAL: "CRITICAL";
};
export type HealthStatus = typeof HealthStatus[keyof typeof HealthStatus];
export interface Forklift {
    id: string;
    asset_code: string;
    model?: string;
    customer_id?: string;
    qr_code_url?: string;
    health_score: number;
    health_status: HealthStatus;
}
export interface Battery {
    id: string;
    asset_code: string;
    brand?: string;
    voltage?: number;
    customer_id?: string;
    qr_code_url?: string;
    status: 'STANDBY' | 'IN_USE' | 'MAINTENANCE';
}
export interface InspectionTask {
    id: string;
    asset_type: 'FORKLIFT' | 'BATTERY';
    forklift_id?: string;
    battery_id?: string;
    assigned_to: string;
    assigned_by: string;
    scheduled_date: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    created_at: string;
}
