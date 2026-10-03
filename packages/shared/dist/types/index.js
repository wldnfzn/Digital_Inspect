"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatus = exports.MONITOR_ROLES = exports.ROLE_LABELS = exports.UserRole = void 0;
exports.UserRole = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    DIRECTOR: 'DIRECTOR',
    GENERAL_MANAGER: 'GENERAL_MANAGER',
    MANAGER: 'MANAGER',
    MECHANIC: 'MECHANIC',
    SALES: 'SALES',
    TECH_INVENTORY: 'TECH_INVENTORY',
};
exports.ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    DIRECTOR: 'Direktur',
    GENERAL_MANAGER: 'General Manager',
    MANAGER: 'Customer Care Division Leader',
    MECHANIC: 'Customer Care Division Mekanik',
    SALES: 'Sales',
    TECH_INVENTORY: 'Technical & Inventory',
};
exports.MONITOR_ROLES = [exports.UserRole.SUPER_ADMIN, exports.UserRole.DIRECTOR, exports.UserRole.GENERAL_MANAGER];
exports.HealthStatus = {
    HEALTHY: 'HEALTHY',
    ATTENTION: 'ATTENTION',
    CRITICAL: 'CRITICAL',
};
