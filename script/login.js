'use strict';

document.addEventListener("DOMContentLoaded", () => {
    login_functionality();
});


const check_for_empty = function(email, pass){
    console.log(email, pass);
    if(email && pass){
        if(email.value == "" || pass.value == ""){
            show_toast("Uh Oh!","Please fill out the entire form");
            return 1;
        }
        return 0;
    }
    return 1;
}

const registration_and_login_fetch = async(email, pass, endpoint)=>{
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
}
const login_functionality = function(){
    const loginForm = document.getElementsByName('login-form');
    if(loginForm.length > 0){
        Array.from(loginForm)[0].addEventListener('submit', async(event)=>{
            console.log("HANDLER FIRED!");
            event.preventDefault();
            const userEmail = document.getElementsByName('userEmail')[0];
            const userPass = document.getElementsByName('userPass')[0];
            if(!(check_for_empty(userEmail, userPass))){
                let response = await registration_and_login_fetch(userEmail.value, userPass.value, endpoints.login);
                if(response != null){
                    let data = await response.json();
                    if(data.message == 'session start'){
                        window.location.assign('userhome.html');
                    }
                    else{
                        show_toast("Uh Oh!", "wrong email and/or password");
                    }
                }
            }
            window.alert("please fill out the entire form");
            return;
        });
        return;
    }
    console.log("error: there should be a login form!");
    return;
}