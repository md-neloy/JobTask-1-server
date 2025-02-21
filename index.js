const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5050;

// middle wire
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("job task is running.....");
});

app.listen(port, () => {
  console.log(`server is runnig on port ${port}`);
});
