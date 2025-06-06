/*
Description: add and remove relevant project links microservice controller
file for Projectory frontend.
Author: Bryce Calhoun
*/


import express from 'express';
import model from './model.mjs';
import cors from 'cors';



const app = express()
const PORT = 4000;
/////////////////////////////////////////////////////////////////



app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));
/////////////////////////////////////////////////////////////////

const valid_request = function(body){
    if(body){
        if(body["userEmail"] && body["projectTitle"] && body["link"]){
            if(typeof(body["userEmail"]) == 'string' && typeof(body["projectTitle"]) == 'string' && typeof(body["link"]) == 'string'){
                return true;
            }
        }
    }
    return false;
}
/////////////////////////////////////////////////////////////////



app.put('/link-inserter', (req, res)=>{

    if(valid_request(req.body)){
        const { userEmail, projectTitle, link } = req.body;
        let linkAdded;
        try{
            linkAdded = model.add_link_to_existing_project(userEmail, projectTitle, link);
        }catch(error){
            console.log(error);
            res.status(500).json({"Error": "Issue communicating with database"});
            return;
        }
        if(linkAdded){
            res.status(200).json("success");
            return;
        }
        res.status(500).json({"Error": "Issue communicating with database"});
        return;
    }
    res.status(400).json({"Error": "Invalid request"});

});


app.delete('/link-remover', async(req, res)=>{
    if(valid_request(req.body)){
        const { userEmail, projectTitle, link } = req.body;
        let linkRemoved;
        try{
            linkRemoved = await model.remove_link_from_existing_project(userEmail, projectTitle, link);
        }catch(error){
            console.log(error);
            res.status(500).json({"Error": "Issue communicating with database"});
            return;
        }
        if(linkRemoved){
            res.status(200).json("success");
            return;
        }
        res.status(500).json({"Error": "No link was removed"});

        return;
    }
    res.status(400).json({"Error": "Invalid request"});

});

/////////////////////////////////////////////////////////////////




app.listen(PORT, ()=>{
    console.log(`app listening on port ${PORT}`)
});
