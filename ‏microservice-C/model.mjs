/*
Description: add and remove relevant project links microservice model
file for Projectory frontend.
Author: Bryce Calhoun
*/


import mongoose from 'mongoose';
import 'dotenv/config';

mongoose.connect(
    process.env.MONGODB_CONNECT_STRING,
    { useNewUrlParser: true }
);

const db = mongoose.connection;

db.once("open", ()=>{
    console.log("\nconnected to mongodb database!");
});



////////////////////////////////////////////////////////////////


const Task = new mongoose.Schema({
    task_description: String,
    is_complete: Number
});

const planned_projects = new mongoose.Schema({
    title: String,
    goal: String
});

const current_projects = new mongoose.Schema({
    title: String,
    goal: String,
    tasks: [Task],
    links: [String],
    is_complete: Number
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    passKey: Number,
    current: [current_projects],
    planned: [planned_projects],
    complete: [planned_projects]
});

////////////////////////////////////////////////////////////////

let User = mongoose.model('User', userSchema, 'user-data');


const get_user = async(userEmail)=>{
    let myUser;
    try{
        myUser = await User.find({email: userEmail});
    }catch(error){
        console.log(error);
        return false;
    }
    return myUser;

}


const add_link_to_existing_project = async(userEmail, projectTitle, link)=>{
    let myUser = await get_user(userEmail);

    if(myUser){
        try{
            for(let i = 0; i < myUser[0].current.length; i++){
                if(myUser[0].current[i].title == projectTitle){
                    myUser[0].current[i].links.push(link);
                    await myUser[0].save();
                    return true;
                }
            }
        }catch(error){
            console.log(error);
            return false;
        }
    }
    return false;

}


const remove_link_from_existing_project = async(userEmail, projectTitle, link)=>{
    let myUser = await get_user(userEmail);
    if(myUser){
        for(let i = 0; i < myUser[0].current.length; i++){
            if(myUser[0].current[i].title == projectTitle){
                let updated_links = Array.from(myUser[0].current[i].links);                
                if(updated_links.includes(link)){
                    updated_links = updated_links.filter(x => x != link);
                    myUser[0].current[i].links = updated_links;
                    await myUser[0].save();

                    return true;
                }
                return false;
            }
        }
    }
    return false
}

export default { add_link_to_existing_project, remove_link_from_existing_project }