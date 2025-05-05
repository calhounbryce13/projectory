'use strict';


const REGISTRATION_URL = 'http://127.0.0.1:3000/registration';
const PASSWORD_MIN = 8;

//todo: send the user email and password to the backend

document.addEventListener('DOMContentLoaded', ()=>{

    const signUp = document.getElementById('signup');
    if(signUp){
        signUp.addEventListener('click', (event)=>{
            event.preventDefault();
            const email = document.getElementsByName('email')[0];
            const pass = document.getElementsByName('pass')[0];
            const passConfirm = document.getElementsByName('passConfirm')[0];
            const validPassword = password_validation(email, pass, passConfirm);
            if(validPassword != 0){
                try{
                    send_data_to_backend(email, pass);
                }catch(error){
                    window.alert("there was an error trying to make an account for you, please try again");
                }
                
            }
        
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

const send_data_to_backend = async(email, pass)=>{
    let response = await fetch(REGISTRATION_URL,{
        method: 'POST',
        body: JSON.stringify({userEmail: email, userPassword: pass}),
        headers: {
            "Content-Type": "Application/json"
        }
    });
    let data = await response.json();
    console.log(data);

}



const check_for_empty = function(email, pass){
    if(email && pass){
        if(email.value == "" || pass.value == ""){
            window.alert("please fill out the whole form!");
            return;
        }
    }
}