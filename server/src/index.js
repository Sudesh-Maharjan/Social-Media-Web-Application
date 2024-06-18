"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const dbConnect_1 = __importDefault(require("./config/dbConnect"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 9000;
(0, dbConnect_1.default)();
//CORS
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express_1.default.json());
// app.use('/api/v1/users', userRoutes);
app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
