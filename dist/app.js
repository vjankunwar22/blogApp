"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const publicBlogRoutes_1 = __importDefault(require("./routes/publicBlogRoutes"));
const node_cron_1 = __importDefault(require("node-cron"));
const db_config_1 = __importDefault(require("./services/db.config"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/auth', authRoutes_1.default);
app.use('/blogs', blogRoutes_1.default);
app.use('/public', publicBlogRoutes_1.default);
// Scheduled publishing job
node_cron_1.default.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const postsToPublish = await db_config_1.default.post.findMany({
            where: {
                published: false,
                publish_datetime: {
                    gte: oneHourAgo,
                    lte: now,
                },
            },
        });
        for (const post of postsToPublish) {
            await db_config_1.default.post.update({
                where: { id: post.id },
                data: { published: true },
            });
            console.log(`Published scheduled post: ${post.id}`);
        }
    }
    catch (err) {
        console.error('Error in scheduled publishing job:', err);
    }
});
app.use(errorMiddleware_1.default);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
// Register error middleware after all routes
exports.default = app;
