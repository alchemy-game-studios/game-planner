import express from 'express'
const router = express.Router();

router.get('/', (req, res) => {
  res.send("API is working properly");
})

router.post('/ping', (req, res) => {
  console.log(req.body);
  res.send(`Ping request received: ${JSON.stringify(req.body)}`);
})

export default router;