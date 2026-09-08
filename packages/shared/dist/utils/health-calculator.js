"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHealthScore = calculateHealthScore;
exports.determineHealthStatus = determineHealthStatus;
const types_1 = require("../types");
function calculateHealthScore(totalScore, totalItems) {
    if (totalItems === 0)
        return 0;
    // Maximum possible score is 3 per item
    // Score formula from PRD: ((Total Score - Total Items) / (2 * Total Items)) * 100
    // Let's breakdown: Total Score ranges from (1 * items) to (3 * items)
    // If all are 3 (Bagus), Score = (3*items - items) / (2*items) * 100 = (2*items)/(2*items) * 100 = 100%
    // If all are 1 (Buruk), Score = (1*items - items) / ... = 0%
    const score = ((totalScore - totalItems) / (2 * totalItems)) * 100;
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
