import express from 'express';


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get('/testing',(req, res)=>{
    res.send({message: "hello world"});
});

app.post('/registration', (req, res)=>{
    const email = req.body['userEmail'];
    res.send({message: `message recieved, ${email}`}).status(200);

    //todo: need to store the user's email and hash the password
});



app.listen(PORT,()=>{
    console.log(`server listening on port ${PORT}`);
});