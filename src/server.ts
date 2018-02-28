import * as express from 'express';
import * as bodyParser from 'body-parser';

import { Brain } from './brain';

const PORT = process.env.PORT || 8060;
const AUDIODIR = 'audio/';

const app = express();
app.use(bodyParser.raw({ type: 'audio/wav', limit: '50mb' }));
//app.use(express.static(AUDIODIR));
const brain = new Brain(AUDIODIR);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/status', async (req, res) => {
  res.send(brain.getStatus());
});

app.post('/audio', async (req, res) => {
  res.send(await brain.addAudioMemory(req.body));
});

app.listen(PORT, async () => {
  console.log('audio dream api live on ' + PORT);
  await brain.extract();
});