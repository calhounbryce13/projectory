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


const planned_projects = new mongoose.Schema({
    title: String,
    goal: String
});

const current_projects = new mongoose.Schema({
    title: String,
    goal: String,
    first_task: String
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

////////////////////////////////////////////////////////////////

const create_new_user = async(email, password, passKey)=>{
    const newAccount = new User({email: email, password:password, passKey:passKey, current: [], planned: [], complete:[]});
    return await newAccount.save();
}


const find_existing_user = async(userEmail)=>{
    let filter = {email: userEmail};
    let knownUsers = await User.find(filter);
    return knownUsers;
}

const delete_all_for_user = async(userEmail)=>{
    let filter = {email: userEmail};
    let res = await User.deleteMany(filter);
    console.log(res.deletedCount);
    return res;
}

const delete_user = async(userEmail)=>{
    let filter = {email: userEmail};
    let res = await User.deleteOne(filter);
    console.log(res.deletedCount);
    return res;
}



////////////////////////////////////////////////////////////////

export default { create_new_user, find_existing_user }