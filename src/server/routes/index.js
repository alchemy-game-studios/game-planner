import express from 'express'
import path from "path"

const router = express.Router();

const __dirname = import.meta.dirname;

router.get('/', (req, res) => {
  console.log(path.join(__dirname, '..', 'static', 'index.html'));
  res.sendFile(path.join(__dirname, '..', 'static', 'index.html'));
})

export default router;