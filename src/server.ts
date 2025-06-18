import express from 'express';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();
const app = express();
app.use(express.json());
app.use('/identify', router);

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

