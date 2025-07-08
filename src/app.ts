import express, { Request, Response } from 'express';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';
import publicBlogRoutes from './routes/publicBlogRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);
app.use('/blogs', blogRoutes);
app.use('/public', publicBlogRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;