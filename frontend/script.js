'use strict';


const REGISTRATION_URL = 'http://127.0.0.1:3000/registration';
const LOGIN_URL = 'http://127.0.0.1:3000/login';
const LOGOUT_URL = 'http://127.0.0.1:3000/logout';
const VIEW_PROJECTS_URL = 'http://127.0.0.1:3000/view-projects';
const ADD_PLANNED_URL = 'http://127.0.0.1:3000/add-planned-projects';
const ADD_CURR_URL = 'http://127.0.0.1:3000/add-current-projects';
const PASSWORD_MIN = 8;


document.addEventListener('DOMContentLoaded', ()=>{

    window.addEventListener('load', async()=>{
        if(window.location.pathname.endsWith("/projects.html")){
            update_header_text();
            populate_form();
            try{
                get_project_data();
            }catch(error){
                console.log(error);
                //show_error_message();
            }
            
        }
    });


    add_subtasks_functionality();

    submit_new_project_functionality();

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

    const logout = document.getElementsByClassName('logout-button')[0];
    if(logout){
        logout.addEventListener('click', async()=>{
            console.log("logout clicked");
            try{
                let response = await fetch(LOGOUT_URL, {
                    method: "POST",
                    credentials: "include"
                });

            }catch(error){
                console.log(error);
            }
            setTimeout(()=>{
                console.log("logout clicked");
                window.location.assign('login.html');
            }, 1000)
        });
    }
});


////////////////////////////////////////////////////////////////////////////////////////////////////


const create_list_of_tasks = function(inputs){
    let res = [];
    for(let i = 0; i < inputs.length; i++){
        if(inputs[i].value != ""){
            res.push(inputs[i].value);
        }
    }
    return res;
}

const submit_new_project_functionality = function(){
    const form = document.getElementById('project-form');
    if(form){
        form.addEventListener('submit', async(event)=>{
            event.preventDefault();
            if((form.elements['project-title'].value == "") || (form.elements['project-goal'].value == "")){
                error_message("please fill out the entire form!");
                return;
            }
            if(localStorage.getItem('project-type') == 'planned'){
                let response;
                try{
                    response = await fetch(ADD_PLANNED_URL,{
                        method: "POST",
                        headers:{
                            "Content-type": "application/json"
                        },
                        body: JSON.stringify({
                            "title": form.elements['project-title'].value,
                            "goal": form.elements['project-goal'].value
                        }),
                        credentials:'include'
                    });
                }catch(error){
                    console.log(error);
                }
                if(response){
                    if(response.status == 200){
                        error_message("success! new planned project has been saved");
                        return;
                    }
                }
                error_message("there seems to have been an issue submitting your project, please try again");
                
            }
            else{
                const inputs = Array.from(document.getElementsByClassName('subtask-input'));
                if(inputs[0].value == ""){
                    error_message("Please fill out at least the first subtask!");
                    return;
                }
                const taskList = create_list_of_tasks(inputs);
                let response;
                try{
                    response = await fetch(ADD_CURR_URL,{
                        method: "POST",
                        credentials: "include",
                        headers:{
                            "Content-type": "application/json"
                        },
                        body:JSON.stringify({
                            "title": form.elements['project-title'].value,
                            "goal": form.elements['project-goal'].value,
                            "tasks": taskList
                        })
                    });
                }catch(error){
                    console.log(error);
                }
                if(response){
                    if(response.status == 200){
                        error_message("success! new current project has been saved");
                        return;
                    }
                }
                error_message("there seems to have been an issue submitting your project, please try again");
            }
        })
    }
}


const add_subtasks_functionality = function(){
    const projectFieldset = document.getElementById('project-fieldset');
    if(projectFieldset){
        projectFieldset.addEventListener('click', (event)=>{
            if(event.target.id == 'project-form-add-more'){
            const container = document.getElementById('project-form-subtasks');
            container.appendChild(build_new_subtask());
            }
        });
    }
}


const get_project_data = async()=>{
    let projects = await fetch(VIEW_PROJECTS_URL,{
        headers:{
            "Content-type": "application/json"
        },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({"project-type": localStorage.getItem("project-type")})
        
    });
    let userProjects = await projects.json();
    populate_project_screen(userProjects);
}

const build_add_more_container = function(){
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'project-form-add-more';
    button.textContent = 'add more';

    const parent = document.createElement('div');
    parent.id = 'project-form-add-more-container';
    parent.appendChild(button);

    return parent;
}

const build_subtask_container = function(){
    const container = document.createElement('div');
    container.id = 'project-form-subtasks';
    container.appendChild(build_new_subtask());

    return container;
}

const build_new_subtask = function(){
    const label = document.createElement('label');
    label.textContent = 'subtask';
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('subtask-input');

    const parentContainer = document.createElement('div');
    parentContainer.appendChild(label);
    parentContainer.appendChild(input);

    return parentContainer;
    
}

const populate_form = function(){
    const projectType = localStorage.getItem('project-type');
    if(projectType == 'planned'){
        return;
    }
    const fieldset = document.getElementById('project-fieldset');
    fieldset.appendChild(build_subtask_container());
    fieldset.appendChild(build_add_more_container());
}

const build_project_title = function(projects, i){
    let titleText = document.createElement('p');
    titleText.textContent = projects[i].title;

    let myTitle = document.createElement('div');
    myTitle.appendChild(titleText);
    myTitle.classList.add('project-title');

    let titleContainer = document.createElement('div');
    titleContainer.appendChild(myTitle);
    titleContainer.classList.add('project-title-container');

    return titleContainer;

}

const build_goal = function(projects, i){
    let goalText = document.createElement('p');
    goalText.textContent = projects[i].goal;

    let goalContainer = document.createElement('div');
    goalContainer.appendChild(goalText);
    goalContainer.classList.add('project-goal');

    return goalContainer;
}

const build_tasks = function(projects, i){
    let taskList = document.createElement('ol');
    for(let j = 0; j < projects[i].tasks.length; j++){
        let index = document.createElement('li');
        index.textContent = projects[i].tasks[j];
        taskList.appendChild(index);
    }
    return taskList;
}

const populate_project_screen = function(projects){
    console.log(projects);
    for(let i = 0; i < projects.length; i++){

        let titleContainer = build_project_title(projects, i);

        let goalContainer = build_goal(projects, i);


        let myProject = document.createElement('div');
        myProject.appendChild(titleContainer);
        myProject.appendChild(goalContainer);

        if(localStorage.getItem('project-type') == 'current'){
            let taskList = build_tasks(projects, i);
            myProject.appendChild(taskList);
        }

        myProject.classList.add('my-project')

        let myMain = document.getElementById('projects-main');
        myMain.appendChild(myProject);
    }

}

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