import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;


/// middleware ///
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors())

////////////////////////////////////////////////////////////////////////////
app.get('/testing',(req, res)=>{
    res.send({message: "hello world"});
});

app.post('/registration', (req, res)=>{
    if(req.body){
        const email = req.body['userEmail'];
        if(email){
            res.send({message: `msage recied, ${email}`}).status(200);
            return;
        }
        res.send({message: "error no email field"}).status(500);
        return;
    }
    res.send({message: "error no request body"}).status(500);
    

    //todo: need to store the user's email and hash the password
});



app.listen(PORT,()=>{
    console.log(`server listening on port ${PORT}`);
});