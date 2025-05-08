'use strict';


const REGISTRATION_URL = 'http://127.0.0.1:3000/registration';
const LOGIN_URL = 'http://127.0.0.1:3000/login';
const PASSWORD_MIN = 1;


document.addEventListener('DOMContentLoaded', ()=>{

    const signUp = document.getElementById('signup');
    if(signUp){
        signUp.addEventListener('click', (event)=>process_signup_data(event));
    }

    const login = document.getElementById('login');
    if(login){
        login.addEventListener('click', (event)=>{
            event.preventDefault();
            const userEmail = document.getElementsByName('userEmail')[0];
            const userPass = document.getElementsByName('userPass')[0];
            check_for_empty(userEmail, userPass);
        });
    }
});



const process_signup_data = async(event)=>{
    event.preventDefault();
    const email = document.getElementsByName('email')[0];
    const pass = document.getElementsByName('pass')[0];
    const passConfirm = document.getElementsByName('passConfirm')[0];
    const validPassword = password_validation(email, pass, passConfirm);

    if(validPassword != 0){
        let response = await registration_fetch(email.value, pass.value);
        if(response != null){
            inform_user(response);
        }
        else{
            window.alert("there was an error trying to make an account for you\n please try again");
        }
    }
}


const inform_user = async(response)=>{
    let data = await response.json();
    if(data.message == true){
        window.alert("account made successfully!");
    }
    else if(data.message == 'already has an account'){
        window.alert("there is already an account registered under that email,\n please login instead");
    }
    window.location.assign('login.html');
}


const password_validation = function(email, pass, passConfirm){
    check_for_empty(email, pass);
    if(Array.from(pass.value).length < PASSWORD_MIN){
        window.alert("passwords must be at least 8 characters long!");
        return 0;
    }
    if(pass.value !== passConfirm.value){
        window.alert("passwords must match!");
        return 0;
    }
    return 1;
}

const registration_fetch = async(email, pass)=>{
    try{
        let response = await fetch(REGISTRATION_URL,{
            method: 'POST',
            body: JSON.stringify({"userEmail": email, "userPassword": pass}),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response;
    }catch(error){
        return null;
    }
}

const check_for_empty = function(email, pass){
    if(email && pass){
        if(email.value == "" || pass.value == ""){
            window.alert("please fill out the whole form!");
            return;
        }
    }
}