"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const publicBlogRoutes_1 = __importDefault(require("./routes/publicBlogRoutes"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/auth', authRoutes_1.default);
app.use('/blogs', blogRoutes_1.default);
app.use('/public', publicBlogRoutes_1.default);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
exports.default = app;
