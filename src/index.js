const path = require("path");
const express = require("express");
const app = express();

require("./db/mongoose");
const userRouter = require("./routers/user");
const reRouter = require("./routers/real-estate");


const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());


app.use(userRouter);
app.use(reRouter);



console.log(">>>>>>")
app.listen(port, () => {
  console.log("Server is up on port " + port);
});

module.exports.app = app;