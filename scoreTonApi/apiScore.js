const express = require('express');
const Bull = require('bull');
const { getScore } = require('./scoreTONBlockchainPart.js');
const app = express();
const port = 3000;


//const walletQueue = new Bull('walletQueue', 'redis://127.0.0.1:6379');

// Если в докер среде то это
const walletQueue = new Bull('walletQueue', 'redis://scoreton-redis-1:6379');

const walletScores = {};


app.use(express.json());


app.post('/addWalletInQueue', (req, res) => {
  const wallet = req.body.wallet;
  walletQueue.add({ wallet });
  res.status(202).send(`Wallet ${wallet} added to the queue`);
});


walletQueue.process(async (job) => {
  console.log('Job fetched from queue:', job.id); // Это должно показать, когда начинается обработка задания
  const { wallet } = job.data;
  const score = await getScore(wallet);
  console.log(`Score retrieved: ${score}`); // Убедитесь, что getScore вызывается и возвращает ожидаемый результат
  walletScores[wallet] = score;
  return score;
});
walletQueue.on('failed', (job, err) => {
  console.error(`Job failed: ${job.id}`, err);
});

walletQueue.on('completed', (job, result) => {
  console.log(`Job completed: ${job.id} with result`, result);
});

app.get('/getWalletFromQueue', (req, res) => {
  const wallet = req.query.wallet;
  console.log(walletScores[wallet],wallet)

  const score = typeof walletScores[wallet] !== 'undefined' ? walletScores[wallet] : null;

  res.json({ wallet, score });
});

app.get('/getAllScores', (req, res) => {
  res.json(walletScores);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});