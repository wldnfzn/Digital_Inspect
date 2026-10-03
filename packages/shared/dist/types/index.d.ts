export declare const UserRole: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly DIRECTOR: "DIRECTOR";
    readonly GENERAL_MANAGER: "GENERAL_MANAGER";
    readonly MANAGER: "MANAGER";
    readonly MECHANIC: "MECHANIC";
    readonly SALES: "SALES";
    readonly TECH_INVENTORY: "TECH_INVENTORY";
};
export type UserRole = typeof UserRole[keyof typeof UserRole];
export declare const ROLE_LABELS: Record<UserRole, string>;
export declare const MONITOR_ROLES: ("SUPER_ADMIN" | "DIRECTOR" | "GENERAL_MANAGER")[];
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
    ticket_id?: string;
    started_at?: string;
    draft_data?: any;
    created_at: string;
}
export interface ServiceTicket {
    id: string;
    ticket_code: string;
    customer_id: string;
    asset_type: 'FORKLIFT' | 'BATTERY';
    forklift_id?: string;
    battery_id?: string;
    issue_type: 'KELUHAN_SERVICE' | 'INSPEKSI_DADAKAN';
    issue_description: string;
    sales_notes?: string;
    leader_notes?: string;
    status: 'DRAFT' | 'SUBMITTED' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
    created_by: string;
    assigned_mechanic_id?: string;
    created_at: string;
    submitted_at?: string;
    assigned_at?: string;
    completed_at?: string;
    customer_name?: string;
    forklift_code?: string;
    battery_code?: string;
    created_by_name?: string;
    mechanic_name?: string;
}
export interface SparepartRequest {
    id: string;
    request_code: string;
    customer_id?: string;
    asset_type?: 'FORKLIFT' | 'BATTERY';
    forklift_id?: string;
    battery_id?: string;
    ticket_id?: string;
    urgency: 'NORMAL' | 'URGENT';
    leader_notes?: string;
    inventory_notes?: string;
    status: 'DRAFT' | 'SUBMITTED' | 'PROCESSING' | 'READY' | 'REJECTED';
    created_by: string;
    processed_by?: string;
    created_at: string;
    submitted_at?: string;
    processed_at?: string;
    completed_at?: string;
    customer_name?: string;
    forklift_code?: string;
    battery_code?: string;
    ticket_code?: string;
    created_by_name?: string;
    processed_by_name?: string;
    items?: SparepartRequestItem[];
}
export interface SparepartRequestItem {
    id: string;
    request_id: string;
    part_name: string;
    part_number?: string;
    quantity: number;
}
