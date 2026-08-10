'use strict';
import {endpoints} from './endpoints.js'

document.addEventListener("DOMContentLoaded", () => {
    system.login_functionality();
});


const system = {
    show_toast : function(header, message){
        Array.from(document.getElementsByClassName('toast-subject'))[0].textContent = header;
        Array.from(document.getElementsByClassName('toast-mssg'))[0].textContent = message;
        const toast = Array.from(document.getElementsByClassName('notification'))[0];
        setTimeout(()=>{
            toast.classList.add('toast-show');
            setTimeout(()=>{
                toast.classList.remove('toast-show');
                Array.from(document.getElementsByClassName('toast-subject'))[0].textContent = '';
                Array.from(document.getElementsByClassName('toast-mssg'))[0].textContent = '';
            }, 7000);
        }, 500);
    },
    registration_and_login_fetch : async(email, pass, endpoint)=>{
        try{
            let response = await fetch(endpoint,{
                method: 'POST',
                body: JSON.stringify({"userEmail": email, "userPassword": pass}),
                credentials: "include",
                headers: {
                    "Content-type": "application/json",
                }
            });
            return response;
        }catch(error){
            console.log(error);
            show_toast("Uh Oh!","There seems to be an issue connecting to backend web services at the moment :/");
            return null;
        }
    },
    login_functionality : function(){
        const loginForm = document.getElementsByName('login-form');
        if(loginForm.length > 0){
            Array.from(loginForm)[0].addEventListener('submit', async(event)=>{
                event.preventDefault();
                const userEmail = document.getElementsByName('userEmail')[0];
                const userPass = document.getElementsByName('userPass')[0];
                if(!(loginFormUI.check_for_empty(userEmail, userPass))){
                    let response = await system.registration_and_login_fetch(userEmail.value, userPass.value, endpoints.login);
                    if(response != null){
                        let data = await response.json();
                        if(data.message == 'session start'){
                            window.location.assign('userhome.html');
                        }
                        else{
                            system.show_toast("Uh Oh!", "wrong email and/or password");
                        }
                        return;
                    }
                    system.show_toast("There was an unexpected issue, please try again");
                    return;
                }
                system.show_toast("Uh Oh", "please fill out the entire form");
                return;
            });
            return;
        }
        console.error("ERROR: NO LOGIN FORM PRESENT!");
        return;
    }
};

const loginFormUI = {
    check_for_empty : function(email, pass){
        if(email && pass){
            if(email.value != "" && pass.value != ""){
                return 0;
            }
            system.show_toast("Uh Oh!","Please fill out the entire form");
            return 1;
        }
        return 1;
    },
};