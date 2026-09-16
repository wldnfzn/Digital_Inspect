"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const node_server_1 = require("@hono/node-server");
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: index_1.default.fetch,
    port,
    hostname: '0.0.0.0'
});
