import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

import User from './model.mjs';

const app = express();
const PORT = 3000;
const rounds = 10;



/// middleware ///
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin === "null") {  // Allow requests from null origins for local testing
            callback(null, true);
        } else {
            callback(new Error("Blocked by CORS"));
        }
    },
    methods: ['GET, POST']
}))

////////////////////////////////////////////////////////////////////////////
app.get('/testing', (req, res)=>{
    res.send({message: "hello world"});
});

app.post('/login', async(req, res)=>{
    const userEmail = req.body['userEmail'];
    const plainTextPassword = req.body['userPassword'];
    if(userEmail && plainTextPassword){
        let alreadyHasAccount = await check_for_existing_email(userEmail);
        console.log(alreadyHasAccount);
        if(alreadyHasAccount == true){
            let validPassword = await validate_user_password(plainTextPassword, userEmail);
            if(validPassword){
                //start session
                res.status(200).send({message:"session start"});
            }
            else{
                res.status(200).send({message:"invalid username and/or password (password)"});
            }
            return;
        }
        else if(alreadyHasAccount == false){
            res.status(200).send({message: "invalid username and/or password"});
            return;
        }
        else{
            return;
        }
    }
    res.status(400).send({message: "error missing email and/or password"});
    return;

});

app.post('/registration', async(req, res)=>{
    if(req.body){
        const email = req.body['userEmail'];
        const password = req.body['userPassword'];
        if(email && password){
            let alreadyHasAccount = await check_for_existing_email(email);
            console.log(alreadyHasAccount);
            if(alreadyHasAccount == false){
                setup_user_account(password, email, res);
                return;
            }
            else if(alreadyHasAccount == true){
                res.status(200).json({message:"already has an account"});
                return;
            }
            else{
                res.status(500).send({message:"server error"});
            }
            return;
        }
        res.status(400).send({message: "error missing email and/or password"});
        return;
    }
    res.status(400).send({message: "error no request body"});
});


const validate_user_password = async(plainTextPassword, userEmail)=>{
    let userAccount = await User.find_existing_user(userEmail);
    const hashedPassword = userAccount[0].password;

    let valid;
    try{
        valid = await bcrypt.compare(plainTextPassword, hashedPassword);
    }catch(error){
        console.log(error);
        return null;
    }
    if(valid){
        return true;
    }
    return false;
}

const check_for_existing_email = async(userEmail)=>{
    let accounts;
    try{
        accounts = await User.find_existing_user(userEmail);
    }catch(error){
        console.log(error);
        res.status(500).send({message: "could not verify user credentials!"});
        return null;
    }
    if(accounts.length == 0){
        return false;
    }
    return true;
}


const setup_user_account = async(password, email, res)=>{
    let hashedPassword = await bcrypt.hash(password, rounds);
    let response;
    try{
        response = await User.create_new_user(email, hashedPassword, rounds);
    }catch(error){
        console.log(error);
        res.status(500).send({message:"error trying to create a new user"});
        return;
    }
    res.status(200).send({message:true});
}


app.listen(PORT,()=>{
    console.log(`server listening on port ${PORT}`);
});