import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import session from 'express-session';

import User from './model.mjs';

const app = express();
const PORT = 3000;
const rounds = 10;



/******************************** MIDDLEWARE ********************************************************************/

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: "something something darkside",
    saveUninitialized: false,
    resave: false,
    cookie: {
        httpOnly: true,
        secure: false,    
        sameSite: 'lax'
    }
}));
app.use(cors({
    origin:(origin, callback) => {
        if (!origin || origin === "null") {
          callback(null, true); // allows requests from null
        } else {
            callback(new Error("Blocked by CORS"));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true
}))

/******************************** ROUTE HANDLERS ********************************************************************/
app.get('/testing', (req, res)=>{
    res.send({message: "hello world"});
});


app.post('/logout', (req, res)=>{
    console.log("\nlogout endpoint hit\n");
    try{
        if(req.session.loggedIn){
            req.session.destroy();
            console.log(req.session);
            res.status(200).json("logged out");
        }
        else{
            console.log("\nerroneous logout w/o login!");
        }
    }catch(error){
        console.log(error);
    }
});

app.post('/login', async(req, res)=>{
    console.log("\nlogin endpoint hit\n");
    console.log(req.body);
    const userEmail = req.body['userEmail'];
    const plainTextPassword = req.body['userPassword'];
    console.log(userEmail, plainTextPassword);
    if(userEmail && plainTextPassword){
        let alreadyHasAccount = await check_for_existing_email(userEmail);
        console.log(alreadyHasAccount);
        if(alreadyHasAccount == true){
            let validPassword = await validate_user_password(plainTextPassword, userEmail);
            if(validPassword){
                session_start(req, res, userEmail);
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
    console.log("registration endpoint hit!");
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




/******************************** HELPER FUNCTIONS ********************************************************************/


const session_start = function(req, res, email){
    if(!(req.session.loggedIn)){
        req.session.loggedIn = true;
        req.session.user = email;
        console.log(req.session);
        res.status(200).send({message:"session start"});
    }
    else{
        console.log("\nalready logged in!");
        res.status(200).json("user already logged in");
    }
    return;
}

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
        console.log("\nnew user created", email);
    }catch(error){
        console.log(error);
        res.status(500).send({message:"error trying to create a new user"});
        return;
    }
    res.status(200).send({message:true});
}

/****************************************************************************************************/

app.listen(PORT,()=>{
    console.log(`server listening on port ${PORT}`);
});