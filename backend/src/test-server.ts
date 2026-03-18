import express from 'express';
const app = express();
app.get('/', (req, res) => res.json({ test: 'ok' }));
app.listen(3001, () => console.log('Test server running'));
