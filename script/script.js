'use strict';
import {endpoints} from './endpoints.js'

const PASSWORD_MIN = 8;


document.addEventListener('DOMContentLoaded', ()=>{
    check_user_login_status();
    generate_user_projects_page();
    backend_communication();
    home_page_listeners();
    setTimeout(()=>{
        add_task_to_existing_functionality();
    }, 3000);
    
});


////////////////////////////////////////////////////////////////////////////////////////////////////

const fetch_for_login_status = async()=>{
    try{
        let response = await fetch(endpoints.loginStatus, {
            method: "GET",
            credentials: "include"
        });
        if(response.status == 200){
            return response;
        }
    }catch(error){
        console.log(error);
        return false;
    }
}

const check_user_login_status = async()=>{
    let loginStatus = await fetch_for_login_status();
    if(!loginStatus){
        if(window.location.pathname.endsWith('/userhome.html') || window.location.pathname.endsWith('/projects.html')){
            window.location.assign('index.html');
            return;
        }
    }
    loginStatus = await loginStatus.json();
    console.log(loginStatus);
    if(loginStatus){
        if(window.location.pathname.endsWith('/login.html') || window.location.pathname.endsWith('/index.html')){
            window.location.assign('userhome.html');
        }
    }
    else{
        if(window.location.pathname.endsWith('/userhome.html') || window.location.pathname.endsWith('/projects.html')){
            window.location.assign('index.html');
        }
    }
}

const user_logout = async()=>{
    let logoutResponse = await fetch(endpoints.logout, {
        method: "POST",
        credentials: "include"
    });
}

const delete_account = async(user)=>{
    deleteResponse = await fetch('http://127.0.0.1:8000/deletion',{
        method: 'DELETE',
        headers:{
            "x-user-email": user
        }
    });
}

const user_logout_and_account_removal = async()=>{
    if(confirm("are you sure you want to PERMANENTLY delete your account?")){
        if(confirm("confirm once more that you want to delete your account. \n you will loose ALL your data \n this cannot be undone !")){
            let user = await fetch_for_user_email();
            try{
                user_logout();
                delete_account(user);
                window.location.assign('index.html');
            }catch(error){
                console.log(error);
                window.alert("unable to remove your account");
            }
        }
    }
}

const remove_user_account_functionality = function(){
    const removeAccountButton = Array.from(document.getElementsByClassName('remove-user-account'))[0];
    if(removeAccountButton){
        removeAccountButton.addEventListener('click', user_logout_and_account_removal);
    }

}

const update_header_text = function(){
    const header = document.getElementsByTagName('h2')[0];
    header.textContent = `My ${localStorage.getItem("project-type")} projects`;
}

const build_add_more_container = function(){
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'project-form-add-more';

    const parent = document.createElement('div');
    parent.classList.add('container');
    parent.id = 'project-form-add-more-container';
    parent.appendChild(button);

    return parent;
}

const build_subtask_container = function(){
    const container = document.createElement('div');
    container.id = 'project-form-subtasks';
    container.classList.add('container');
    container.appendChild(build_new_subtask());

    return container;
}

const add_fields_for_subtasks = function(){
    const fieldset = document.getElementById('project-fieldset');
    if(fieldset){
        fieldset.appendChild(build_subtask_container());
        fieldset.appendChild(build_add_more_container());
    }
}

const populate_form_controls = function(){
    const projectType = localStorage.getItem('project-type');
    if(projectType == 'planned'){
        return;
    }
    add_fields_for_subtasks();
}

const build_project_title = function(projects, i){
    const title = document.createElement('p');
    title.textContent = projects[i].title;
    title.classList.add('project-title');

    const titleContainer = document.createElement('div');
    titleContainer.classList.add('project-title-container');
    titleContainer.appendChild(title);

    return titleContainer;
}

const build_goal = function(projects, i){
    let goalText = document.createElement('p');
    goalText.textContent = projects[i].goal;
    goalText.classList.add('project-goal');

    let goalContainer = document.createElement('div');
    goalContainer.classList.add('project-goal-container');
    goalContainer.appendChild(goalText);


    return goalContainer;
}

const fetch_for_user_email = async()=>{
    let response = await fetch(endpoints.user_email, {
        method: 'GET',
        credentials: 'include'
    });
    if(response.status == 200){
        return await response.json();
    }
    return null;
}

const send_request_to_remove_a_link = async(title, user, linkText)=>{
    const response = await fetch(endpoints.link_remover, {
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
    return response;
}

const remove_a_link_from_a_project = async(projects, i, x)=>{
    let title = projects[i].title;
    let user = await fetch_for_user_email();
    let linkText = projects[i].links[x];
    let response;
    try{
        response = await send_request_to_remove_a_link(title, user, linkText);
    }catch(error){
        console.log(error);
        window.alert("did not remove link from that project");
    }
    if(response.status == 200){
        window.alert("that link was successfully removed!");
        window.location.reload();
        return;
        
    }
    window.alert("could not remove link from that project");
}

const populate_links_view = function(myProject, projects, i){
    let unordered_list = document.createElement('ol');
    unordered_list.classList.add('container');
    for(let x = 0; x < projects[i].links.length; x++){

        let index = document.createElement('li');
        index.textContent = projects[i].links[x];
        let removeLinkButton = document.createElement('button');
        removeLinkButton.classList.add('remove-link-button');
        removeLinkButton.textContent = 'remove';

        removeLinkButton.addEventListener('click', remove_a_link_from_a_project(projects, i, x));
        index.appendChild(removeLinkButton);
        unordered_list.appendChild(index);
    }
    myProject.appendChild(unordered_list);
}

const send_a_request_to_insert_a_link = async(title, user, linkText)=>{
    const response = await fetch(endpoints.link_inserter, {
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

    return response;
}

const process_the_form_to_add_a_new_link = async(event, projects, i)=>{
    event.preventDefault();
    let linkText = event.target.elements['add-new-link-input'].value;
    let title = projects[i].title;
    let user = await fetch_for_user_email();

    let response;
    try{
        response = await send_a_request_to_insert_a_link(title, user, linkText);
    }catch(error){
        console.log(error);
        window.alert("did not add a new link to that project")
    }
    if(response.status == 200){
        event.target.elements['add-new-link-input'].value = '';
        window.alert("a new link was successfully added to the project");
        window.location.reload();
    }
}

const populate_add_link_form_controls = function(myProject, projects, i){
    let textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'url link';
    textInput.name = 'add-new-link-input';

    let subButton = document.createElement('button');
    subButton.type = 'submit';
    subButton.classList.add('add-link-button');

    let myForm = document.createElement('form');
    myForm.addEventListener('submit', process_the_form_to_add_a_new_link(event))
    myForm.appendChild(textInput);
    myForm.appendChild(subButton);

    myProject.appendChild(myForm);

}

const update_the_status_for_project_task = async(event, projects, i, x, text) => {
    let user = await fetch_for_user_email();
    let title = projects[i].title;
    let index = x;
    let mark;
    if(event.target.checked){
        mark = 1;
    }
    else{
        mark = 0;
    }
    let serviceBresponse;
    try{
        serviceBresponse = await fetch(endpoints.taskManager, {
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
                serviceBresponse = await fetch(endpoints.taskManager, {
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

const build_project_delete_container = function(projects, i){
    const deleteProjectButton = document.createElement('button');
    deleteProjectButton.classList.add('remove-project-button');
    deleteProjectButton.classList.add('delete-data-button');
    deleteProjectButton.addEventListener('click', async()=>{
        if(confirm("Are you sure you want to delete this project?\n This cannot be undone")){
            const type = localStorage.getItem('project-type');
            let title = projects[i].title;
            let user = await fetch_for_user_email();
            let response;
            try{
                response = await fetch(endpoints.deletion,{
                    method: 'DELETE',
                    headers:{
                        "Content-Type": "application/json",
                        "x-user-email": user
                    },
                    body: JSON.stringify({
                        "project-type": type,
                        "project-name": title
                    })
                })
            }catch(error){
                console.log(error);
            }
            if(response.status == 200){
                window.alert("successfully removed that project from your list");
                window.location.reload();
                return;
            }
            window.alert("unable to remove that project");
        }
    });

    const deleteProjectContainer = document.createElement('div');
    deleteProjectContainer.classList.add('remove-project-container');
    deleteProjectContainer.classList.add('edit-features');
    deleteProjectContainer.appendChild(deleteProjectButton);

    return deleteProjectContainer;
}

const build_a_single_link = function(projects, i, x){
    const removeLinkButton = document.createElement('button');
    removeLinkButton.classList.add('remove-link-button');
    removeLinkButton.classList.add('delete-data-button');
    removeLinkButton.classList.add('edit-features');
    removeLinkButton.addEventListener('click', () => remove_a_link_from_a_project(projects, i, x));

    const linkText = document.createElement('a');
    linkText.target = '_blank';
    linkText.classList.add('project-link-text');
    linkText.href = projects[i].links[x];
    linkText.textContent = linkText.href;

    const linkContainer = document.createElement('div');
    linkContainer.classList.add('container-for-a-single-link');

    linkContainer.appendChild(removeLinkButton);
    linkContainer.appendChild(linkText);

    return linkContainer;
}

const form_to_input_new_link = function(unordered_list, projects, i){
    const newLinkInput = document.createElement('input');
    newLinkInput.classList.add('new-project-link-input');
    newLinkInput.type = 'text';
    newLinkInput.placeholder = 'Paste your link here';
    newLinkInput.name = 'add-new-link-input';


    const submitNewLink = document.createElement('button');
    submitNewLink.classList.add('new-project-link-submit');
    submitNewLink.type = 'submit';
    
    const formContainer = document.createElement('form');
    formContainer.addEventListener('submit',(event) => process_the_form_to_add_a_new_link(event, projects, i));
    formContainer.classList.add('add-a-new-project-link-container');
    formContainer.classList.add('edit-features');
    formContainer.appendChild(newLinkInput);
    formContainer.appendChild(submitNewLink);

    unordered_list.appendChild(formContainer);
}

const build_project_links = function(projects, i){
    const unordered_list = document.createElement('ul');
    unordered_list.classList.add('project-links-list');
    for(let x = 0; x < projects[i].links.length; x++){
        const linkContainer = build_a_single_link(projects, i, x);
        unordered_list.appendChild(linkContainer);
    }
    form_to_input_new_link(unordered_list, projects, i);
    return unordered_list;
}


const remove_a_task_from_a_project = async(projects, i, x) => {
    if(confirm("are you sure you want to remove this task from this project?\n you cannot undo this action")){
        let title = projects[i].title;
        let index = x;
        let user = await fetch_for_user_email();
        let response;
        try{
            response = await fetch(endpoints.deletion,{
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
        if(response.status == 200){
            window.location.reload();
            return;
        }
        window.alert("having an issue communicating to the backend \n that task wasn't removed");
    }


}


const build_text_for_a_task = function(projects, i, x){
    const taskText = document.createElement('p');
    taskText.classList.add('task-text');
    taskText.textContent = projects[i].tasks[x].task_description;
    return taskText;
}

const build_checkbox_for_a_task = function(projects, i, x, taskText){
    const checkboxButton = document.createElement('input');
    checkboxButton.addEventListener('click', (event) => update_the_status_for_project_task(event, projects, i, x, taskText));
    checkboxButton.type = 'checkbox';
    checkboxButton.classList.add('task-checkbox');

    return checkboxButton;
}

const build_remove_button_for_a_task = function(projects, i, x){
    const removeButton = document.createElement('button');
    removeButton.classList.add('task-remove-button');
    removeButton.classList.add('delete-data-button');
    removeButton.classList.add('edit-features');
    removeButton.addEventListener('click', () => remove_a_task_from_a_project(projects, i, x));

    return removeButton;
}

const build_parent_container_for_a_task = function(taskText, checkboxButton, removeButton){
    const taskContainer = document.createElement('div');
    taskContainer.classList.add('task-container');
    taskContainer.appendChild(taskText);
    taskContainer.appendChild(checkboxButton);
    taskContainer.appendChild(removeButton);

    return taskContainer;
}

const build_input_for_a_new_task = function(){
    const newTaskInput = document.createElement('input');
    newTaskInput.classList.add('input-for-a-new-task')
    newTaskInput.type = 'text';
    newTaskInput.name = 'new-task-input';

    return newTaskInput;
}

const build_button_to_add_a_new_task = function(){
    const addButton = document.createElement('button');
    addButton.classList.add('button-to-add-a-new-task');
    addButton.type = 'submit';

    return addButton;
}

const build_parent_container_form_for_new_task = function(i){
    const addTaskForm = document.createElement('form');
    addTaskForm.classList.add('form-to-add-a-new-task');
    addTaskForm.classList.add('edit-features');
    addTaskForm.addEventListener('submit', (event) => add_to_existing_project_fetch(event, i));
    
    return addTaskForm;

}

const form_to_add_a_new_task = function(projectTaskList, i){
    const newTaskInput = build_input_for_a_new_task();

    const addButton = build_button_to_add_a_new_task();

    const addTaskForm = build_parent_container_form_for_new_task(i);

    addTaskForm.appendChild(newTaskInput);
    addTaskForm.appendChild(addButton);

    projectTaskList.appendChild(addTaskForm);

}


const build_project_tasks = function(projects, i){
    const projectTaskList = document.createElement('ol');
    projectTaskList.classList.add('project-task-list');
    for(let x = 0; x < projects[i].tasks.length; x++){
        const taskText = build_text_for_a_task(projects, i, x);
        const checkboxButton = build_checkbox_for_a_task(projects, i, x, taskText);
        const removeButton = build_remove_button_for_a_task(projects, i, x);
        const taskContainer = build_parent_container_for_a_task(taskText, checkboxButton, removeButton);

        projectTaskList.appendChild(taskContainer);

    }
    form_to_add_a_new_task(projectTaskList, i)

    return projectTaskList;
}

const toggle_edit_features = function(){
    const editFeatures = Array.from(document.getElementsByClassName('edit-features'));
    for(let i = 0; i < editFeatures.length; i++){
        editFeatures[i].classList.toggle('show-edits');
    }

}

const build_edit_container = function(){
    const editButton = document.createElement('button');
    editButton.classList.add('edit-projects-button');
    editButton.addEventListener('click', () => toggle_edit_features())

    const editContainer = document.createElement('div');
    editContainer.classList.add('edit-projects-container');
    editContainer.appendChild(editButton);

    return editContainer;
}




const populate_project_screen = function(projects){
    console.log(projects);
    let parentContainer = Array.from(document.getElementsByClassName('user-projects'))[0];
    console.log(parentContainer);
    const editButtonContainer = build_edit_container();
    parentContainer.appendChild(editButtonContainer);

    for(let i = 0; i < projects.length; i++){
        let myProject = document.createElement('div');
        myProject.classList.add('my-project');

        const deleteProjectContainer = build_project_delete_container(projects, i);
        const projectTitle = build_project_title(projects, i);
        const projectGoal = build_goal(projects, i);

        myProject.appendChild(deleteProjectContainer);
        myProject.appendChild(projectTitle);
        myProject.appendChild(projectGoal);

        if(localStorage.getItem('project-type') == 'current'){
            const projectLinks = build_project_links(projects, i);
            myProject.appendChild(projectLinks);

            const projectTasks = build_project_tasks(projects, i);
            myProject.appendChild(projectTasks);


        }
        else if(localStorage.getItem('project-type') == 'completed'){
            const addNewContainer = document.getElementById('add-new-container');
            addNewContainer.style.display = 'none';
        }
        
        /*

        let projectHeaderContainer = document.createElement('div');
        projectHeaderContainer.classList.add('container');
        projectHeaderContainer.classList.add('project-header-container');
        projectHeaderContainer.appendChild(removeProjectButton);

        

        myProject.appendChild(projectHeaderContainer);
        myProject.appendChild(titleContainer);
        myProject.appendChild(goalContainer);
        

        if(localStorage.getItem('project-type') == 'current'){
            populate_links_view(myProject, projects, i);
            populate_add_link_form_controls(myProject, projects, i);
            let taskList = build_tasks(projects, i);
            let taskFormContainer = build_task_form_container();
            myProject.appendChild(taskList);
            myProject.appendChild(taskFormContainer);
        }
        */    
        parentContainer.appendChild(myProject);
    }
}
























const send_a_request_to_get_user_projects = async()=>{
    let projects = await fetch(endpoints.projects_view,{
        headers:{
            "Content-type": "application/json"
        },
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({"project-type": localStorage.getItem("project-type")})
        
    });
    return projects;

}

const get_project_data = async()=>{
    console.log(localStorage.getItem("project-type"))

    let projects;
    try{
        projects = await send_a_request_to_get_user_projects();
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


const clear_container = function(container){
    if(container){
        while(container.children.length > 0){
            container.removeChild(container.lastChild);
        }
    }
}

const update_user_projects_view = async()=>{
    console.log("a");
    let container = Array.from(document.getElementsByClassName('user-projects'))[0];
    if(container){
        console.log("b");

        //container = Array.from(container)[0];
        console.log("container pre clearing:", container);
        clear_container(container);
        console.log("c");

        try{
            let projects = await send_a_request_to_get_user_projects();
            projects = await projects.json();
            populate_project_screen(projects);
            console.log("d");

        }catch(error){
            console.log(error);
        }
    }
}

const generate_user_projects_page = function(){
    window.addEventListener('load', async()=>{
        if(window.location.pathname.endsWith("/projects.html")){
            update_header_text();
            populate_form_controls();
            get_project_data();
        }
    });
}

const process_signup_data = async(event)=>{
    event.preventDefault();
    const email = document.getElementsByName('email')[0];
    const pass = document.getElementsByName('pass')[0];
    const passConfirm = document.getElementsByName('passConfirm')[0];
    const validPassword = password_validation(email, pass, passConfirm);
    if(validPassword != 0){
        let response = await registration_and_login_fetch(email.value, pass.value, endpoints.registration);
        if(response != null){
            inform_user(response);
        }
        else{
            error_message("there was an error trying to make an account for you, please try again");
        }
    }
}

const signup_functionality = function(){
    const signUp = document.getElementById('signup');
    if(signUp){
        signUp.addEventListener('click', (event)=>process_signup_data(event));
    }

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

const login_functionality = function(){
    const login = document.getElementById('login');
    if(login){
        login.addEventListener('click', async(event)=>{
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
            if(confirm("Are you sure you want to logout?")){
                try{
                    user_logout();
                }catch(error){
                    console.log(error);
                }
                setTimeout(()=>{
                    window.location.assign('login.html');
                }, 1000)
            }
        });
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

const add_to_existing_project_fetch = async(event, i)=>{
    event.preventDefault();
    const newText = event.target.elements['new-task-input'].value;
    let response;
    try{
        response = await fetch(endpoints.subtask_generator, {
            headers:{
                "Content-type": "application/json"
            },
            method: "POST",
            credentials: "include",
            body: JSON.stringify({"new task":newText, "index": i})
        });
        if(response.status == 200){
            window.alert("Success! A new task was added to your project");
            window.location.reload();
            return;
        }
    }catch(error){
        console.log(error);
    }
    window.alert("There was an issue adding that last task to your project\n please try again.");

}

const attach_event_listener = function(buttons){
    const inputs = Array.from(document.getElementsByName('a-new-task'));
    for(let i = 0; i < buttons.length; i++){
        buttons[i].addEventListener('click', ()=>{
            if(inputs[i].value != ""){
                add_to_existing_project_fetch(inputs[i].value, i);
                update_user_projects_view();

                /*
                setTimeout(()=>{
                    inputs[i].value = "";
                }, 3000);

                */
                
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

const create_new_project_functionality = function(){
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
                    response = await fetch(endpoints.planned_projects_generator,{
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
                        //event.target.reset();
                        window.alert("success! new planned project has been saved");
                        window.location.reload();
                        return;
                    }
                }
                window.alert("there seems to have been an issue submitting your project\n please try again");
                
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
                    response = await fetch(endpoints.current_projects_generator,{
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
                        //event.target.reset();
                        window.alert("success! new current project has been saved");
                        window.location.reload();
                        return;
                    }
                }
                window.alert("there seems to have been an issue submitting your project, please try again");
            }
        });
    }
}

const build_new_subtask = function(){
    const label = document.createElement('label');
    label.textContent = 'subtask';
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('subtask-input');

    const parentContainer = document.createElement('div');
    parentContainer.classList.add('container');
    parentContainer.classList.add('new-subtask');
    parentContainer.appendChild(label);
    parentContainer.appendChild(input);

    return parentContainer;
    
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

const send_completion_fetch = async(title, user)=>{
    let response;
    try{
        response = await fetch(endpoints.projectManager, {
            method: 'PUT',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                    "userEmail": user,
                    "projectTitle": title
            })
        });
    }catch(error){
        console.log(error);
    }
    if(response.status == 200){
        window.alert("Congrats on completing a project!");
        window.location.reload();
        return;
    }
    window.alert("There was an issue trying to move that project into the completed section\n please try again");
}

const check_for_complete = function(projects, i, user){
    const tasks = Array.from(projects[i].tasks);
    for(let x = 0; x < tasks.length; x++){
        console.log("checking...")
        if(tasks[x].is_complete == 0){
            return;
        }
    }
    if(confirm("marking this step 'complete' will move the project into your completed section. Are you sure it's all done?")){
        send_completion_fetch(projects[i].title, user);
    }
}

const get_updated_projects = async()=>{
    let projects;
    try{
        projects = await fetch(endpoints.projects_view,{
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

const inform_user = async(response)=>{
    let data = await response.json();
    if(data.message == "true"){
        window.alert("account made successfully!");
    }
    else if(data.message == "already has an account"){
        window.alert("there is already an account registered under that email,\n please login instead");
    }
    window.location.assign('login.html');
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

const backend_communication = function(){
    login_functionality();

    logout_functionality();

    add_task_to_new_functionality();

    create_new_project_functionality();

    remove_user_account_functionality();

    signup_functionality();
}