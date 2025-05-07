import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

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
        const password = req.body['userPassword'];
        if(email && password){
            console.log(bcrypt.hash('10', ))
            // 1 hash password with bcrypt
            // call model function to add a new user with hashed passwor

            
        }
        res.send({message: "error missing email and/or password"}).status(400);
        return;
    }
    res.send({message: "error no request body"}).status(400);
    

    //todo: need to store the user's email and hash the password
});



app.listen(PORT,()=>{
    console.log(`server listening on port ${PORT}`);
});