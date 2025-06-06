'use strict';


const REGISTRATION_URL = 'http://127.0.0.1:3000/registration';
const LOGIN_URL = 'http://127.0.0.1:3000/login';
const LOGOUT_URL = 'http://127.0.0.1:3000/logout';
const VIEW_PROJECTS_URL = 'http://127.0.0.1:3000/projects-view';
const ADD_PLANNED_URL = 'http://127.0.0.1:3000/planned-projects-generator';
const ADD_CURR_URL = 'http://127.0.0.1:3000/current-projects-generator';
const ADD_SUBTASK_URL = 'http://127.0.0.1:3000/subtask-generator';
const PASSWORD_MIN = 8;


document.addEventListener('DOMContentLoaded', ()=>{

    window.addEventListener('load', async()=>{
        if(window.location.pathname.endsWith("/projects.html")){
            update_header_text();
            populate_form();
            get_project_data();
        }
    });


    const removeAccountButton = Array.from(document.getElementsByClassName('remove-user-account'))[0];
    if(removeAccountButton){
        removeAccountButton.addEventListener('click', async()=>{
            let user = await fetch_for_user_email();
            let deleteResponse;
            try{
                let logoutResponse = await fetch(LOGOUT_URL, {
                    method: "POST",
                    credentials: "include"
                });
                deleteResponse = await fetch('http://127.0.0.1:8000/deletion',{
                    method: 'DELETE',
                    headers:{
                        "x-user-email": user
                    }
                })
                window.location.assign('signup.html');
            }catch(error){
                console.log(error);
                window.alert("unable to remove your account");
            }
        });
    }


    
    setTimeout(()=>{
        add_task_to_existing_functionality();
    }, 3000)


    add_task_to_new_functionality();

    submit_new_project_functionality();

    home_page_listeners();

    signup_functionality();

    login_functionality();

    logout_functionality();


});


////////////////////////////////////////////////////////////////////////////////////////////////////


const signup_functionality = function(){
    const signUp = document.getElementById('signup');
    if(signUp){
        signUp.addEventListener('click', (event)=>process_signup_data(event));
    }

}
const login_functionality = function(){
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
    
}
const logout_functionality = function(){
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
                window.location.assign('login.html');
            }, 1000)
        });
    }
    
}

const add_to_existing_project_fetch = async(newText, i)=>{
    let response;
    try{
        response = await fetch(ADD_SUBTASK_URL, {
            headers:{
                "Content-type": "application/json"
            },
            method: "POST",
            credentials: "include",
            body: JSON.stringify({"new task":newText, "index": i})
        });
        if(response.status != 200){
            error_message("There was an issue adding that last task to your project, please try again.")
        }
        else{
            error_message("Success! A new task was added to your project");
            //clear_project_view();
            //! I need to fetch for user projects again
            //populate_project_screen(userProjects);
        }
    }catch(error){
        console.log(error);
        error_message("There was an issue adding that last task to your project, please try again.")
    }


}

const attach_event_listener = function(buttons){

    const inputs = Array.from(document.getElementsByName('a-new-task'));


    for(let i = 0; i < buttons.length; i++){

        buttons[i].addEventListener('click', ()=>{
            if(inputs[i].value != ""){
                add_to_existing_project_fetch(inputs[i].value, i);
                setTimeout(()=>{
                    inputs[i].value = "";
                }, 3000);
                
            }

        });
    }

}

const add_task_to_existing_functionality = function(){

    const submitButtons = document.getElementsByClassName('new-task-button');
    if(submitButtons){
        attach_event_listener(Array.from(submitButtons));
    }

}

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
    const form = Array.from(document.getElementsByClassName('project-form'))[0];
    if(form){
        form.addEventListener('submit', async(event)=>{
            console.log("a")
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
                        event.target.reset();
                        error_message("success! new planned project has been saved");
                        return;
                    }
                }
                error_message("there seems to have been an issue submitting your project, please try again");
                
            }
            else{
                console.log("hello")
                const inputs = Array.from(document.getElementsByClassName('subtask-input'));
                if(inputs[0].value == ""){
                    error_message("Please fill out at least the first subtask!");
                    return;
                }
                const taskList = create_list_of_tasks(inputs);
                let response;
                try{
                    console.log("here")
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
                        event.target.reset();
                        error_message("success! new current project has been saved");
                        return;
                    }
                }
                error_message("there seems to have been an issue submitting your project, please try again");
            }
        
        });
    }
}


const add_task_to_new_functionality = function(){
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
    console.log(localStorage.getItem("project-type"))

    let projects;
    try{
        projects = await fetch(VIEW_PROJECTS_URL,{
            headers:{
                "Content-type": "application/json"
            },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({"project-type": localStorage.getItem("project-type")})
            
        });
    }catch(error){
        console.log(error);
    }
    if(projects){
        let userProjects = await projects.json();
        populate_project_screen(userProjects);
    }
    else{
        //show_error_message();

    }
    const addNewProjectButton = Array.from(document.getElementsByClassName('add-new'))[0];
    addNewProjectButton.addEventListener('click', (event)=>{
        const form = Array.from(document.getElementsByClassName('project-form'))[0];
        form.classList.toggle('project-form-show');
        event.target.classList.toggle('add-new-open');
    });
}

const build_add_more_container = function(){
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'project-form-add-more';

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


const fetch_for_user_email = async()=>{
    let response = await fetch('http://127.0.0.1:3000/get-user-email', {
        method: 'GET',
        credentials: 'include'
    });
    if(response.status == 200){
        return await response.json();
    }
    return null;
}


const send_completion_fetch = async(title, user)=>{
    let response;
    try{
        response = await fetch('http://127.0.0.1:5000/completed-project-manager', {
            method: 'PUT',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                    "userEmail": user,
                    "projectTitle": title
            })
        });
    }catch(error){
        return false;
    }
    if(response.status == 200){
        return true;
    }

}


const check_for_complete = function(projects, i, user){
    const tasks = Array.from(projects[i].tasks);
    for(let x = 0; x < tasks.length; x++){
        console.log("checking...")
        if(tasks[x].is_complete == 0){
            return;
        }
    }
    let result = send_completion_fetch(projects[i].title, user);
    
}

const get_updated_projects = async()=>{
    let projects;
    try{
        projects = await fetch(VIEW_PROJECTS_URL,{
            headers:{
                "Content-type": "application/json"
            },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({"project-type": "current"})
            
        });
    }catch(error){
        console.log(error);
    }
    if(projects){
        return await projects.json();
    }
    else{
        return false;
    }
}

const build_tasks = function(projects, i){
    let taskList = document.createElement('ol');
    for(let j = 0; j < projects[i].tasks.length; j++){

        const text = document.createElement('p');
        //text.classList.add('');
        text.textContent = projects[i].tasks[j].task_description;

        const checkBox = document.createElement('input');
        checkBox.classList.add('task-completion-checkbox');
        checkBox.type = 'checkbox';
        if(projects[i].tasks[j].is_complete == 1){
            checkBox.checked = true;
            text.style.textDecoration = 'line-through';
            text.style.color = 'red';
        }

        let taskContainer = document.createElement('div');
        taskContainer.classList.add('subtask-container');
        taskContainer.appendChild(text);
        taskContainer.appendChild(checkBox);

        const removeTaskButton = document.createElement('button');
        removeTaskButton.classList.add('remove-task-button');
        removeTaskButton.addEventListener('click', async()=>{
            let title = projects[i].title;
            let index = j;
            let user = await fetch_for_user_email();
            let response;
            try{
                response = await fetch('http://127.0.0.1:8000/deletion',{
                    method: 'DELETE',
                    headers:{
                        "Content-Type": "application/json",
                        "x-user-email": user
                    },
                    body: JSON.stringify({
                        "project-type": "current",
                        "project-name": title,
                        "task-index": index
                    })
                })
            }catch(error){
                console.log(error);
            }
            if(response.status != 200){
                window.alert("unable to remove that task")
            }
        })



        taskContainer.appendChild(removeTaskButton);

        checkBox.addEventListener('click', async(event)=>{
            let user = await fetch_for_user_email();
            let title = projects[i].title;
            let index = j;
            let mark;
            if(event.target.checked){
                mark = 1;
            }
            else{
                mark = 0;
            }
            let serviceBresponse;
            try{
                serviceBresponse = await fetch('http://127.0.0.1:5000/task-manager', {
                    method: 'POST',
                    headers:{"Content-Type": "application/json"},
                    body: JSON.stringify({
                        "userEmail": user,
                        "projectTitle": title,
                        "index": index,
                        "statusMark": mark
                    })
                });
            }catch(error){
                console.log(error);
            }
            if(serviceBresponse.status == 200 && mark){
                text.style.textDecoration = 'line-through';
                text.style.color = 'red';
            }
            else{
                text.style.textDecoration = 'none';
                text.style.color = 'var(--deep-blue)';

            }
            console.log("\nold proj:", projects);
            projects = await get_updated_projects();
            console.log("\nnew proj:", projects);
            check_for_complete(projects, i, user)

        });

        let index = document.createElement('li');
        index.appendChild(taskContainer);
        taskList.appendChild(index);
    }
    return taskList;
}

const build_task_form_container = function(){
    const label = document.createElement('label');
    label.textContent = 'Task: ';

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'a-new-task';

    const container = document.createElement('div');
    container.appendChild(label);
    container.appendChild(input);

    const buttonContainer = document.createElement('div');

    const button = document.createElement('button');
    button.classList.add('new-task-button');
    button.type = 'button';
    button.textContent = 'add to project';

    buttonContainer.appendChild(button);

    const fieldset = document.createElement('fieldset');
    fieldset.classList.add('additional-task-fieldset');
    fieldset.appendChild(container);
    fieldset.appendChild(buttonContainer);


    const parent = document.createElement('div');
    parent.appendChild(fieldset);
    parent.classList.add('additional-task-container');

    return parent;
}

const add_links_container = function(myProject, projects, i){
    let unordered_list = document.createElement('ol');
    for(let x = 0; x < projects[i].links.length; x++){
        let index = document.createElement('li');
        index.textContent = projects[i].links[x];
        let removeLinkButton = document.createElement('button');
        removeLinkButton.classList.add('remove-link-button');
        removeLinkButton.textContent = 'remove';
        removeLinkButton.addEventListener('click', async()=>{
            let title = projects[i].title;
            let user = await fetch_for_user_email();
            let linkText = projects[i].links[x];
            let response;
            try{
                response = await fetch('http://127.0.0.1:4000/link-remover', {
                    method: 'DELETE',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "userEmail": user,
                        "projectTitle": title,
                        "link": linkText
                    })
                });
            }catch(error){
                console.log(error);
                window.alert("did not remove link from that project")
            }
            if(response.status != 200){
                window.alert("could not remove link from that project")
                
            }
            
        });

        
        index.appendChild(removeLinkButton);
        unordered_list.appendChild(index);
    }
    myProject.appendChild(unordered_list);
}

const add_new_link_form = function(myProject, projects, i){
    let textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'url link';
    textInput.name = 'add-new-link-input';


    let subButton = document.createElement('button');
    subButton.type = 'submit';
    subButton.classList.add('add-link-button');

    let myForm = document.createElement('form');
    myForm.addEventListener('submit', async(event)=>{
        event.preventDefault();
        let linkText = event.target.elements['add-new-link-input'].value;
        let title = projects[i].title;
        let user = await fetch_for_user_email();

        let response;
        try{
            response = await fetch('http://127.0.0.1:4000/link-inserter', {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "userEmail": user,
                    "projectTitle": title,
                    "link": linkText
                })
            });
        }catch(error){
            console.log(error);
            window.alert("did not add a new link to that project")
        }
        if(response.status == 200){
            event.target.elements['add-new-link-input'].value = '';
        }
        

    })
    myForm.appendChild(textInput);
    myForm.appendChild(subButton);

    myProject.appendChild(myForm);

}

const populate_project_screen = function(projects){
    console.log(projects);
    for(let i = 0; i < projects.length; i++){

        let titleContainer = build_project_title(projects, i);

        let goalContainer = build_goal(projects, i);


        let myProject = document.createElement('div');
        let removeProjectButton = document.createElement('button');
        removeProjectButton.classList.add('remove-project-button');
        removeProjectButton.addEventListener('click', async()=>{
            let title = projects[i].title;
            let user = await fetch_for_user_email();
            let response;
            try{
                response = await fetch('http://127.0.0.1:8000/deletion',{
                    method: 'DELETE',
                    headers:{
                        "Content-Type": "application/json",
                        "x-user-email": user
                    },
                    body: JSON.stringify({
                        "project-type": "current",
                        "project-name": title
                    })
                })
            }catch(error){
                console.log(error);
            }
            if(response.status != 200){
                window.alert("unable to remove that project")
            }

        })



        myProject.appendChild(removeProjectButton);
        myProject.appendChild(titleContainer);
        myProject.appendChild(goalContainer);
        

        if(localStorage.getItem('project-type') == 'current'){
            add_links_container(myProject, projects, i);
            add_new_link_form(myProject, projects, i);
            let taskList = build_tasks(projects, i);
            let taskFormContainer = build_task_form_container();
            myProject.appendChild(taskList);
            myProject.appendChild(taskFormContainer);
        }

        myProject.classList.add('my-project')

        let parentContainer = Array.from(document.getElementsByClassName('user-projects'))[0];
        parentContainer.appendChild(myProject);
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
    if(validPassword != 0){
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

    if(isEmpty != 1){
        if(Array.from(pass.value).length < PASSWORD_MIN){
            error_message("passwords must be at least 8 characters long!");
            return 0;
        }
        if(pass.value !== passConfirm.value){
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
        

        error_message("There seems to be an issue connecting to backend web services at the moment :/");
        return null;
    }
}

const check_for_empty = function(email, pass){
    if(email && pass){
        if(email.value == "" || pass.value == ""){
            error_message("Please fill out the entire form!");
            return 1;
        }
        return 0;
    }
    return 1;
}