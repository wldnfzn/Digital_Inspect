import { HealthStatus } from '../types';
export declare function calculateHealthScore(totalScore: number, totalItems: number): number;
export declare function determineHealthStatus(healthScore: number, hasCriticalIssue: boolean): HealthStatus;
