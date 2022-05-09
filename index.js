const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bk5c2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemCollection = client.db("carDealer").collection("item");

     // AUTH
     app.post('/login', async(req, res) =>{
        const user = req.body;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        res.send({ accessToken });
    })

    app.get("/item", async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    app.get('/item/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const item = await itemCollection.findOne(query);
        res.send(item);
    });

    // POST
    app.post('/item', async(req, res) =>{
        const newItem = req.body;
        const result = await itemCollection.insertOne(newItem);
        res.send(result);
    });

    app.get('/myitem', async(req, res) => {
        const email = req.query.email;
        const query = {email: email};
        const cursor = itemCollection.find(query);
        const myitem = await cursor.toArray();
        res.send(myitem);
    })

    // DELETE
    app.delete('/item/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await itemCollection.deleteOne(query);
        res.send(result);
    });

    app.put('/item/:id', async(req, res) => {
        const id = req.params.id;
        const newQuantity = req.body;
        console.log(req.body)
        const filter = {_id: ObjectId(id)}
        const options = {upsert: true}
        const updatedDoc = {
            $set:{
                quantity : newQuantity.quantity
            }
        }
        // const result = await itemCollection.updateOne(filter, updatedDoc, options)
       
        res.send({result: "success"});
    })



  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Car Dealer Server");
});


app.listen(port, () => {
  console.log("Listening to port", port);
});
