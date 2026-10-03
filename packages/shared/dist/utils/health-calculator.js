"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHealthScore = calculateHealthScore;
exports.determineHealthStatus = determineHealthStatus;
const types_1 = require("../types");
function calculateHealthScore(totalScore, totalItems) {
    if (totalItems === 0)
        return 0;
    // Score formula requested by user: Total Score / (Total Items * 3) * 100
    // e.g., 58 items * 3 = 174 max score. 174/174 = 100%. 116/174 = 66%.
    const score = (totalScore / (totalItems * 3)) * 100;
    return Math.round(score * 100) / 100; // Round to 2 decimal places
}
function determineHealthStatus(healthScore, hasCriticalIssue) {
    if (hasCriticalIssue) {
        return types_1.HealthStatus.CRITICAL;
    }
    if (healthScore >= 80) {
        return types_1.HealthStatus.HEALTHY;
    }
    else if (healthScore >= 50) {
        return types_1.HealthStatus.ATTENTION;
    }
    else {
        return types_1.HealthStatus.CRITICAL;
    }
}
