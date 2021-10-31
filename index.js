const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
//dotenv
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uj11r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);

//console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    //console.log("connected to database");
    const database = client.db("travelBook");
    const servicesCollection = database.collection("services");
    const cart_Collection = database.collection("cart");

    //get api
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    // add servicen from form
    app.post("/addservice", async (req, res) => {
      console.log(req.body);
      const result = await servicesCollection.insertOne(req.body);
      console.log(result);
    });
    // load single service get api
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific service", id);
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });

    //cart
    app.get("/singlecart", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const carts = await cart_Collection.find(query).toArray();

      res.json(carts);
    });
    // load cart data according to user id get api
    app.get("/cart/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.find(query).toArray();
      res.json(result);
    });

    // add data to cart collection with additional info
    app.post("/course/add", async (req, res) => {
      const course = req.body;
      const result = await cart_Collection.insertOne(course);
      res.json(result);
    });

    // delete data from cart delete api
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cart_Collection.deleteOne(query);
      res.json(result);
    });
    // get all events

    // app.get("/allEvents", async (req, res) => {
    //   const result = await servicesCollection.find({}).toArray();
    //   res.send(result);
    // });
    app.get("/allEvents", async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    // delete event

    app.delete("/deleteEvent/:id", async (req, res) => {
      console.log(req.params.id);
      const result = await cart_Collection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });
    //update
    app.put("/confirmation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const event = {
        $set: {
          status: "Confirm",
        },
      };
      const result = await cart_Collection.updateOne(query, event);
      res.json(result);
    });
  } finally {
    //await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Travel Agent Server");
});
app.listen(port, () => {
  console.log("Running Travel Agent on port", port);
});
