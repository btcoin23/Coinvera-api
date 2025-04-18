import express from 'express';
import bodyParser from 'body-parser';
import { PORT } from './config';
import { router } from './router';
import { initLogger } from './log/logger';

initLogger()
const app = express();

app.use(bodyParser.json());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`- Server listening on port ${PORT}`);
});