import dot from "dotenv";
import express from "express";
import cors from "cors";

const result = dot.config();

const { GAME_PORT } = result.parsed ?? {};

const app = express();

app.use(cors())
app.use(express.static(process.cwd()))

app.listen(GAME_PORT, () => {
  console.clear();
  console.log(`http://localhost:${GAME_PORT}`);
  console.log();
})