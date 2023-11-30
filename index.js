const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.flmhf7e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const userCollection = client.db('UniDineDB').collection('users')
        const mealCollection = client.db('UniDineDB').collection('meals')
        const reviewCollection = client.db('UniDineDB').collection('reviews')
        const likesCollection = client.db('UniDineDB').collection('likes')
        const membershipCollection = client.db('UniDineDB').collection('membership')
        const paymentCollection = client.db('UniDineDB').collection('payment')
        const orderCollection = client.db('UniDineDB').collection('orders')
        const upcomingCollection = client.db('UniDineDB').collection('upcomings')


        app.post('/users', async (req, res) => {
            const user = req.body;
            // insert email if user doesnt exists: 
            // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })


        app.get('/isOne', async (req, res) => {
            const email = req.query.email;
            const name = req.query.name;
            let query = {};
            if(email && name){
                query= {email:email, name:name}
            }
            else if(email){
                query= {email:email}
            }
            else if (name){
                query= {name: name}
            }
            else{
                query= {};
            }
            // const query = { email: email, name:name }
            const result = await userCollection.find(query).toArray()
            res.send(result);
        })


        // meals  routes

        app.post('/meals', async (req, res) => {
            const mealData = req.body;
            console.log('mealData', mealData);
            const result = await mealCollection.insertOne(mealData);
            res.send(result);
        })

        app.get('/meals', async (req, res) => {
            const cursor = mealCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // app.get("/allmeals", async (req, res) => {
        //     const page = parseInt(req.query.page) || 1;
        //     const itemsPerPage = 10; // Adjust this based on your preference

        //     const skip = (page - 1) * itemsPerPage;

        //     try {
        //         const cursor = mealCollection.find().skip(skip).limit(itemsPerPage);
        //         const result = await cursor.toArray();
        //         res.json(result);
        //     } catch (error) {
        //         console.error(error);
        //         res.status(500).json({ error: "Internal Server Error" });
        //     }
        // });

        app.get('/mealDetails/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await mealCollection.findOne(query);
            res.send(result);
        })

        app.get('/meal', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await mealCollection.find(query).toArray()
            res.send(result);
        })


        app.put('/upmeals/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const mealInfo = req.body;
            const item = {
                $set: {
                    price: mealInfo.price,
                    ingredients: mealInfo.ingredients,
                    admin: mealInfo.admin,
                    time: mealInfo.time,
                    rating: mealInfo.rating,
                    category: mealInfo.category,
                    img: mealInfo.img,
                    description: mealInfo.description
                }
            }
            const result = await mealCollection.updateOne(filter, item, options);
            res.send(result);
        })


        app.delete('/pop/:id', async (req, res) => {
            const deleteId = req.params.id;
            console.log(deleteId);
            const query = { _id: new ObjectId(deleteId) }
            const result = await mealCollection.deleteOne(query)
            console.log(result)
            res.send(result)
            console.log(query)
        })

        //upComing Meals
        app.post('/upcomings', async (req, res) => {
            const mealData = req.body;
            console.log('mealData', mealData);
            const result = await upcomingCollection.insertOne(mealData);
            res.send(result);
        })

        app.get('/upcomings', async (req, res) => {
            const cursor = upcomingCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/upcoming/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await upcomingCollection.findOne(query);
            res.send(result);
        })

        // reviews routes

        app.post('/reviews', async (req, res) => {
            const reviewData = req.body;
            console.log('reviewData', reviewData);
            const result = await reviewCollection.insertOne(reviewData);
            res.send(result);
        })

        app.get('/allreviews', async (req, res) => {
            const cursor = reviewCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await reviewCollection.find(query).toArray()
            res.send(result);
        })

        app.get('/reviews/:mealID', async (req, res) => {
            const mealID = req.params.mealID;
            const review = await reviewCollection.find({ mealID: mealID }).toArray();
            res.json(review);
        })

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const reviewData = req.body;
            const item = {
                $set: {
                    review: reviewData.review
                }
            }
            const result = await reviewCollection.updateOne(filter, item, options);
            res.send(result);
        })


        app.delete('/delete/:id', async (req, res) => {
            const deleteId = req.params.id;
            console.log(deleteId);
            const query = { _id: new ObjectId(deleteId) }
            const result = await reviewCollection.deleteOne(query)
            console.log(result)
            res.send(result)
            console.log(query)
        })



        // likes operations

        app.post('/likes', async (req, res) => {
            const likedData = req.body;
            console.log('likedData', likedData);
            const result = await likesCollection.insertOne(likedData);
            res.send(result);
        })

        app.get('/likes', async (req, res) => {
            const email = req.query.email;
            const mealID = req.query.id;
            const query = { email: email, mealID: mealID }
            const result = await likesCollection.find(query).toArray()
            res.send(result);
        })

        app.get('/samelikes', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await likesCollection.find(query).toArray()
            res.send(result.map((item) => item.mealID));
        })

        app.get('/likeCount', async (req, res) => {
            const mealID = req.query.mealID;
            const query = { mealID: mealID }
            const result = await likesCollection.find(query).toArray()
            res.send(result.map((item) => item.email));
        })

        app.get('/likes/:mealID', async (req, res) => {
            const mealID = req.params.mealID;
            const likes = await likesCollection.find({ mealID: mealID }).toArray();
            res.json(likes);
        })




        // manage membership

        app.get('/membership', async (req, res) => {
            const cursor = membershipCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/checkout/:name', async (req, res) => {
            const name = req.params.name;
            console.log(name);
            const package = await membershipCollection.find({ name: name }).toArray();
            res.send(package);
        })



        // payment method implementation 

        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            console.log(amount, 'amount inside the intent')

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });

            res.send({
                clientSecret: paymentIntent.client_secret
            })
        });



        //package purchase for membership

        app.post('/payment', async (req, res) => {
            const payment = req.body;
            const paymentResult = await paymentCollection.insertOne(payment);
            res.send(paymentResult);
        })

        app.get('/payment', async (req, res) => {
            const email = req.query.email;
            const result = await paymentCollection.find({ email: email }).toArray();

            res.send(result.length !== 0);
        })

        app.get('/payments', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await paymentCollection.find(query).toArray()
            res.send(result);
        })

        //requested meals

        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log(order);
            const orderData = await orderCollection.insertOne(order);
            res.send(orderData);
        })

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await orderCollection.find(query).toArray()
            res.send(result);
        })

        app.get('/allorder', async (req, res) => {
            const cursor = orderCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.delete('/cancel/:id', async (req, res) => {
            const deleteId = req.params.id;
            console.log(deleteId);
            const query = { _id: new ObjectId(deleteId) }
            const result = await orderCollection.deleteOne(query)
            console.log(result)
            res.send(result)
            console.log(query)
        })

        app.put('/status/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const statusData = req.body;
            const item = {
                $set: {
                    status: statusData.status
                }
            }
            const result = await orderCollection.updateOne(filter, item, options);
            res.send(result);
        })




        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('UniDine is Serving')
})
app.listen(port, () => {
    console.log(`UniDine is Serving on port : ${port}`)
})