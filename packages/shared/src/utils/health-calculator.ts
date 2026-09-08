import { HealthStatus } from '../types';

export function calculateHealthScore(totalScore: number, totalItems: number): number {
  if (totalItems === 0) return 0;
  // Score formula requested by user: Total Score / (Total Items * 3) * 100
  // e.g., 58 items * 3 = 174 max score. 174/174 = 100%. 116/174 = 66%.
  const score = (totalScore / (totalItems * 3)) * 100;
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

export function determineHealthStatus(healthScore: number, hasCriticalIssue: boolean): HealthStatus {
  if (hasCriticalIssue) {
    return HealthStatus.CRITICAL;
  }
  
  if (healthScore >= 80) {
    return HealthStatus.HEALTHY;
  } else if (healthScore >= 50) {
    return HealthStatus.ATTENTION;
  } else {
    return HealthStatus.CRITICAL;
  }
}
