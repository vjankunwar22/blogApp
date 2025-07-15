import express, { Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import blogRoutes from "./routes/blogRoutes";
import publicBlogRoutes from "./routes/publicBlogRoutes";
import cron from "node-cron";
import prisma from "./services/db.config";
import errorMiddleware from "./middlewares/errorMiddleware";
import cors from "cors";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Serve uploads directory statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/auth", authRoutes);
app.use("/blogs", blogRoutes);
app.use("/public", publicBlogRoutes);

// Scheduled publishing job
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const postsToPublish = await prisma.post.findMany({
      where: {
        published: false,
        publish_datetime: {
          gte: oneHourAgo,
          lte: now,
        },
      },
    });
    for (const post of postsToPublish) {
      await prisma.post.update({
        where: { id: post.id },
        data: { published: true },
      });
      console.log(`Published scheduled post: ${post.id}`);
    }
  } catch (err) {
    console.error("Error in scheduled publishing job:", err);
  }
});

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Register error middleware after all routes

export default app;
