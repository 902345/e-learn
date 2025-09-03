import dotenv from "dotenv";
dotenv.config({
    path: './.env'
});

import db from './database/db.js';
import { app } from './app.js';



db()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed !!!", err);
  });
