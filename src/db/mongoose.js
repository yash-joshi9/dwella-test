const mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/dwella-test", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
