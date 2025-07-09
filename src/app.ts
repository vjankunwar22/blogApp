import express, { Request, Response } from 'express';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';
import publicBlogRoutes from './routes/publicBlogRoutes';
import cron from 'node-cron';
import prisma from './services/db.config';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);
app.use('/blogs', blogRoutes);
app.use('/public', publicBlogRoutes);

// Scheduled publishing job
cron.schedule('* * * * *', async () => {
  try {
    const postsToPublish = await prisma.post.findMany({
      where: {
        published: false,
        publish_datetime: { lte: new Date() },
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
    console.error('Error in scheduled publishing job:', err);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;