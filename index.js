const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5050;

// middle wire
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("job task is running.....");
});

const uri =
  "mongodb+srv://jobTask-1:m5bgdhWUuXARBf0R@cluster0.fgiq9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const tasks = client.db("JobTask");
    const candidatesCollection = tasks.collection("candidates");
    const todoCollection = tasks.collection("todo");
    const progressCollection = tasks.collection("progress");
    const doneCollection = tasks.collection("done");
    const userCollection = tasks.collection("user");

    app.post("/tasks", async (req, res) => {
      try {
        const task = req.body;
        const alltask = await candidatesCollection.insertOne(task);
        if (task.Status === "To-do") {
          console.log(task);
          const result = await todoCollection.insertOne(task);
          res.send(result);
        } else if (task.Status === "In Progress") {
          const result = await progressCollection.insertOne(task);
          res.send(result);
        } else {
          const result = await doneCollection.insertOne(task);
          res.send(result);
        }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const result = userCollection.insertOne(user);
        res.send(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/tasks", async (req, res) => {
      try {
        const tasks = await candidatesCollection.find().toArray();
        res.json(tasks);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put("/tasks/:id", async (req, res) => {
      try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
        });
        io.emit("taskUpdated", task);
        res.json(task);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete("/tasks/:id", async (req, res) => {
      try {
        await Task.findByIdAndDelete(req.params.id);
        io.emit("taskDeleted", req.params.id);
        res.status(204).send();
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is runnig on port ${port}`);
});
