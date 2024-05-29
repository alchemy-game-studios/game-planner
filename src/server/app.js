import indexRouter from "./routes/index.js";
import testApiRouter from "./routes/testApi.js";
import express from "express";
import cors  from "cors";
import cookieParser from 'cookie-parser';
import path from "path";

const port = 3000;

const app = express();
const __dirname = import.meta.dirname;

app.use(express.json());
app.use(express.urlencoded({extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", indexRouter);
app.use("/testApi", testApiRouter);

app.use(cors());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
