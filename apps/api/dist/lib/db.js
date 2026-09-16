"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("postgres"));
const dbUrl = 'postgresql://digital_inspect_owner:EaC3nQ5LkxBf@ep-curly-recipe-a1m4d6s2.ap-southeast-1.aws.neon.tech/digital_inspect?sslmode=require';
// Set up the postgres client
const sql = (0, postgres_1.default)(dbUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: 'require'
});
exports.default = sql;
