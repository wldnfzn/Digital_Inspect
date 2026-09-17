import { pool } from './db';

export const logAudit = async (userId: string, userName: string, action: string, target: string, details?: string) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_name, action, target, details) VALUES ($1, $2, $3, $4, $5)',
      [userId, userName, action, target, details || '']
    );
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
