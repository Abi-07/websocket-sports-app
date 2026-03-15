import express from 'express';
import { matcheRouter } from './routes/matches.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

app.use('/', (req, res) => {
  res.send('Welcome to the Sports App API');
});

app.use('/matches', matcheRouter);

app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});
