import mongoose from 'mongoose';

const connection_URL = '';

connect_to_database();



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

let User = mongoose.model('User', userSchema);


const create_new_user = function(email, password, passKey){


}











const connect_to_database = async function(){
    try{
        await mongoose.connect(connection_URL);
        console.log("\nsuccessfully connected to the MongoDB database");
    }catch(error){
        console.log("\ncould not connect to the database");
    }
}

export default create_new_user();