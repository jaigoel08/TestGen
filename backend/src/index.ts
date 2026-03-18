import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import scrapeRouter from './routes/scrape.js';
import generateTestsRouter from './routes/generate-tests.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files (screenshots)
// Since the frontend is likely running on a different port, 
// it will need to access these via full URL or we need to proxy.
app.use('/screenshots', express.static(path.join(process.cwd(), 'public', 'screenshots')));

app.use('/api/scrape-site', scrapeRouter);
app.use('/api/generate-tests', generateTestsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
