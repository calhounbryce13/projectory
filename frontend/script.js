'use strict';


const REGISTRATION_URL = 'http://127.0.0.1:3000/registration';



document.addEventListener('DOMContentLoaded', ()=>{

    const signUp = document.getElementById('signup');
    if(signUp){
        signUp.addEventListener('click', (event)=>{
            event.preventDefault();
            const email = document.getElementsByName('email')[0];
            const pass = document.getElementsByName('pass')[0];
            const passConfirm = document.getElementsByName('passConfirm')[0];
            check_for_empty(email, pass);
            if(pass.value !== passConfirm.value){
                window.alert("passwords must match!");
                return;
            }
            send_data_to_backend(email, pass);
        });
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

const send_data_to_backend = async(email, pass)=>{
    let response = await fetch(REGISTRATION_URL,{
        method: 'POST',
        body: {userEmail: email, userPassword: pass}
    });
    console.log(response);
}



const check_for_empty = function(email, pass){
    if(email && pass){
        if(email.value == "" || pass.value == ""){
            window.alert("please fill out the whole form!");
            return;
        }
    }
}