'use strict';
import {endpoints} from './endpoints.js'

const LOADING_ANIMATION_DELAY = 1000; // in ms

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
        let animationInstance = false;
        const timer = setTimeout(() => {
            animationInstance = system.show_loading();
        }, LOADING_ANIMATION_DELAY);
        try{
            let response = await fetch(endpoints.login,{
                method: 'POST',
                body: JSON.stringify({"userEmail": email, "userPassword": pass}),
                credentials: "include",
                headers: {
                    "Content-type": "application/json",
                }
            });
            return response;
        }catch(error){
            console.error(error);
            system.show_toast("Uh Oh!","There seems to be an issue connecting to backend web services at the moment :/");
            return null;
        }finally{
            clearTimeout(timer);
            if(animationInstance) system.dismiss_loading(animationInstance);
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
                    if(response){
                        switch(response.status){
                            case 200:
                                window.location.assign('userhome.html');
                                break;
                            case 400:
                                system.show_toast("Uh Oh!", "There seems to have been an issue with that request, please try again");
                                break;
                            case 401:
                                system.show_toast("Uh Oh!", "wrong email and/or password");
                                break;
                            case 500:
                                system.show_toast("Uh Oh!", "There was an issue with the server, please try again");
                                break;
                            default:
                                system.show_toast("Uh Oh", "An unexpected error occured, please try again");
                                break;
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
    },
    show_loading : function(){
        const animation = document.getElementById('lottie-loading-animation');
        const animationContainer = document.getElementById('lottie-parent');
        animationContainer.style.display = 'flex';
        animation.style.display = 'flex';
        return lottie.loadAnimation({
            container: animation,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '../projectory/icons/Loading_sand_clock.json'
        });
    },
    dismiss_loading : function(animationInstance){
        const animation = document.getElementById('lottie-loading-animation');
        const animationContainer = document.getElementById('lottie-parent');
        animation.style.display = 'none';
        animationContainer.style.display = 'none';
        animationInstance.destroy();
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
