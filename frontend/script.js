'use strict';


const REGISTRATION_URL = 'http://127.0.0.1:3000/registration';
const LOGIN_URL = 'http://127.0.0.1:3000/login';
const LOGOUT_URL = 'http://127.0.0.1:3000/logout';
const PASSWORD_MIN = 8;


document.addEventListener('DOMContentLoaded', ()=>{

    window.addEventListener('load', ()=>{
        if(window.location.pathname.endsWith("/projects.html")){
            update_header_text();
            // send fetch call

        }
    });
    home_page_listeners();
    const signUp = document.getElementById('signup');
    if(signUp){
        signUp.addEventListener('click', (event)=>process_signup_data(event));
    }

    const login = document.getElementById('login');
    if(login){
        login.addEventListener('click', async(event)=>{
            event.preventDefault();
            const userEmail = document.getElementsByName('userEmail')[0];
            const userPass = document.getElementsByName('userPass')[0];
            if(!(check_for_empty(userEmail, userPass))){
                let response = await registration_and_login_fetch(userEmail.value, userPass.value, LOGIN_URL);
                if(response != null){
                    let data = await response.json();
                    if(data.message == 'session start'){
                        window.location.assign('userhome.html');
                    }
                    else{
                        error_message("wrong email and/or password");
                    }
                }
            }
        });
    }

    const logout = document.getElementById('logout-button');
    if(logout){
        logout.addEventListener('click', async()=>{
            console.log("logout clicked");
            try{
                let response = await fetch(LOGOUT_URL, {
                    method: 'POST',
                    credentials: 'include'
                });
                window.location.assign('login.html');
            }catch(error){
                console.log(error);
                window.alert("logout NOT successful! please try to log out again.");
            }
        });
    }
});


////////////////////////////////////////////////////////////////////////////////////////////////////


const update_header_text = function(){
    const header = document.getElementsByTagName('h2')[0];
    header.textContent = `My ${localStorage.getItem("project-type")} projects`;
}

const get_buttons = function(){
    let res = [];
    res.push(document.getElementById('current'));
    res.push(document.getElementById('planned'));
    res.push(document.getElementById('completed'));
    return res;
}

const home_page_listeners = function(){
    const buttons = get_buttons();
    for(let x = 0; x < buttons.length; x++){
        if(buttons[x]){
            buttons[x].addEventListener('click',()=>{
                localStorage.setItem("project-type", buttons[x].id);
                window.location.assign("projects.html");
            });
        }
        
    }
}

const strip_body = function(){
    const body = document.body;
    const oldBody = [];
    while(body.children.length > 1){
        oldBody.push(body.lastChild);
        body.removeChild(body.lastChild);
    }
    return oldBody;
}

const restore_body = function(oldBody){
    const body = document.body;
    for(let i = (oldBody.length - 1); i >= 0; i--){
        body.appendChild(oldBody[i]);
    }
}

const styled_container = function(){
    const res = document.createElement('div');
    const styler = res.style;
    styler.width = '30%'
    styler.display = 'flex';
    styler.justifyContent = 'center';
    styler.alignItems = 'center';
    styler.height = 'auto';
    styler.backgroundColor = 'var(--strong-blue)';
    styler.borderRadius = '20px';
    styler.marginTop = "30vh";
    styler.color = 'var(--yellow-gold)';
    styler.fontSize = '250%';
    styler.textAlign = 'center';
    styler.padding = '3%';
    return res;
}

let error_message = function(message){
    let timer = 2000;
    const oldBody = strip_body();
    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;
    if(message.length > 40){
        timer = timer + 1000;
    }
    const messageContainer = styled_container();
    messageContainer.appendChild(errorMessage);

    document.body.appendChild(messageContainer);
    setTimeout(()=>{
        document.body.removeChild(document.body.lastChild);
        restore_body(oldBody);
    }, timer);
    
}




const process_signup_data = async(event)=>{
    event.preventDefault();
    const email = document.getElementsByName('email')[0];
    const pass = document.getElementsByName('pass')[0];
    const passConfirm = document.getElementsByName('passConfirm')[0];
    const validPassword = password_validation(email, pass, passConfirm);
    console.log(validPassword);


    if(validPassword != 0){
        console.log(email.value, pass.value);
        let response = await registration_and_login_fetch(email.value, pass.value, REGISTRATION_URL);
        if(response != null){
            inform_user(response);
        }
        else{
            error_message("there was an error trying to make an account for you, please try again");
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
    const isEmpty = check_for_empty(email, pass);
    console.log(isEmpty);

    if(isEmpty != 1){
        console.log(Array.from(pass.value).length);

        if(Array.from(pass.value).length < PASSWORD_MIN){
            error_message("passwords must be at least 8 characters long!");
            return 0;
        }
        if(pass.value !== passConfirm.value){
            console.log(passConfirm.value);

            error_message("passwords must match!");
            return 0;
        }
        else{
            return 1;
        }
    }
    return 0;
}

const registration_and_login_fetch = async(email, pass, endpoint)=>{
    try{
        let response = await fetch(endpoint,{
            method: 'POST',
            body: JSON.stringify({"userEmail": email, "userPassword": pass}),
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response;
    }catch(error){
        console.log(error);
        error_message("There seems to be an issue connecting to backend web services at the moment :/")
        return null;
    }
}

const check_for_empty = function(email, pass){
    if(email && pass){
        console.log(email.value, pass.value);
        if(email.value == "" || pass.value == ""){
            error_message("Please fill out the entire form!");
            return 1;
        }
        return 0;
    }
    return 1;
}