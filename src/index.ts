import express from 'express';
import bodyParser from 'body-parser';
import { MONGODB_URI, PORT } from './config';
import { router } from './router';
import { initLogger } from './log/logger';
import mongoose from 'mongoose';

initLogger()
const app = express();

app.use(bodyParser.json());
app.use('/api', router);

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('- Connected to MongoDB');
})
.catch((error) => {
  console.error('- Error connecting to MongoDB:', error);
});

app.listen(PORT, () => {
  console.log(`- Server listening on port ${PORT}`);
});