'use strict';
import {endpoints} from './endpoints.js'

const PASSWORD_MIN = 8;


document.addEventListener('DOMContentLoaded', ()=>{
    dismiss_modal();
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
    try{
        deleteResponse = await fetch(endpoints.deletion,{
            method: 'DELETE',
            headers:{
                "x-user-email": user
            }
        });
        return deleteResponse;
    }catch(error){
        console.log(error)
    }

}

const user_logout_and_account_removal = async()=>{
    if(confirm("are you sure you want to PERMANENTLY delete your account?")){
        if(confirm("confirm once more that you want to delete your account. \n you will loose ALL your data \n this cannot be undone !")){
            let user = await fetch_for_user_email();
            if(user){
                try{
                    user_logout();
                    if(delete_account(user)){
                        window.location.assign('index.html');
                        return;
                    }
                }catch(error){
                    console.log(error);
                }
                show_toast("Sorry", "unable to remove your account, please try again");
                return;
            }
            show_toast("Sorry", "unable to remove your account, please try again");
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
    try{
        let response = await fetch(endpoints.user_email, {
            method: 'GET',
            credentials: 'include'
        });
        if(response.status == 200){
            return await response.json();
        }
    }catch(error){
        console.log(error);
    }
    return false;
}

const send_request_to_remove_a_link = async(title, user, linkText)=>{
    const response = await fetch(endpoints.link_remover, {
        method: 'DELETE',
        headers: {
            "Content-type": "application/json"
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
    if(user){
        let linkText = projects[i].links[x];
        let response;
        try{
            response = await send_request_to_remove_a_link(title, user, linkText);
            if(response.status == 200){
                show_toast("Confirmed", "that link was successfully removed!");
                window.location.reload();
                return;
            }
        }catch(error){
            console.log(error);
        }
        show_toast("Sorry", "did not remove link from that project");
        return;
    }
    show_toast("Sorry", "did not remove link from that project");
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
            "Content-type": "application/json"
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
    if(user){
        let response;
        try{
            response = await send_a_request_to_insert_a_link(title, user, linkText);
            if(response.status == 200){
                event.target.elements['add-new-link-input'].value = '';
                show_toast("Perfect!", "a new link was successfully added to the project");
                window.location.reload();
                return;
            }
        }catch(error){
            console.log(error);
        }
    }
    show_toast("Sorry", "unable to add a new link to that project")
}


const update_the_status_for_project_task = async(event, projects, i, x, text) => {
    let user = await fetch_for_user_email();
    if(user){
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
                headers:{"Content-type": "application/json"},
                body: JSON.stringify({
                    "userEmail": user,
                    "projectTitle": title,
                    "index": index,
                    "statusMark": mark
                })
            });
            if(serviceBresponse.status == 200){
                text.classList.toggle('completed-task');
            }
        }catch(error){
            console.log(error);
            show_toast("Sorry", "There is an issue communicating with the server\n that update was not saved.");
        }
        projects = await get_updated_projects();
        check_for_complete(projects, i, user);
        return;
    }
    show_toast("Sorry", "There is an issue communicating with the server\n that update was not saved.");

}

const delete_user_project = async(projects, i) => {
    if(confirm("Are you sure you want to delete this project?\n This cannot be undone")){
        const type = localStorage.getItem('project-type');
        let title = projects[i].title;
        let user = await fetch_for_user_email();
        if(user){
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
                });
                if(response.status == 200){
                    show_toast("Confirmed", "successfully removed that project from your list");
                    window.location.reload();
                    return;
                }
            }catch(error){
                console.log(error);
            }
            show_toast("Sorry", "unable to remove that project");
            return;
        }
        show_toast("Sorry", "There seems to have been an issue trying to complete your request");
        
    }
}


const build_project_delete_container = function(projects, i){
    const deleteProjectButton = document.createElement('button');
    deleteProjectButton.classList.add('remove-project-button');
    deleteProjectButton.classList.add('delete-data-button');
    deleteProjectButton.addEventListener('click', () => delete_user_project(projects, i));

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

const wrap_data_entry_form_in_an_instruction_block = function(form, instructions){
    const instructionBlock = document.createElement('div');
    instructionBlock.classList.add('new-data-form-block');
    instructionBlock.classList.add('edit-features');


    const instructionText = document.createElement('p');
    instructionText.textContent = instructions;
    instructionText.classList.add('new-data-form-instructions');

    instructionBlock.appendChild(instructionText);
    instructionBlock.appendChild(form);

    return instructionBlock;
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

    const instructions = 'use this field to add an additional resource to this set of project resources';
    const instructionBlock = wrap_data_entry_form_in_an_instruction_block(formContainer, instructions);

    unordered_list.appendChild(instructionBlock);
}

const build_project_links = function(projects, i){

    const resourceLabel = document.createElement('p');
    resourceLabel.textContent = 'resources';
    resourceLabel.classList.add('resource-links-label');
    const resourceLabelContainer = document.createElement('div');
    resourceLabelContainer.classList.add('container', 'project-resources-label');
    resourceLabelContainer.appendChild(resourceLabel);

    const unordered_list = document.createElement('ul');
    unordered_list.classList.add('project-links-list');
    for(let x = 0; x < projects[i].links.length; x++){
        const linkContainer = build_a_single_link(projects, i, x);
        unordered_list.appendChild(linkContainer);
    }
    form_to_input_new_link(unordered_list, projects, i);

    const projectResources = document.createElement('div');
    projectResources.classList.add('project-resources');
    projectResources.appendChild(resourceLabelContainer);
    projectResources.appendChild(unordered_list);

    return projectResources;
}


const remove_a_task_from_a_project = async(projects, i, x) => {
    if(confirm("are you sure you want to remove this task from this project?\n you cannot undo this action")){
        let title = projects[i].title;
        let index = x;
        let user = await fetch_for_user_email();
        if(user){
            let response;
            try{
                response = await fetch(endpoints.deletion,{
                    method: 'DELETE',
                    headers:{
                        "Content-type": "application/json",
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
            show_toast("Sorry", "having an issue communicating to the backend \n that task wasn't removed");
            return;
        }
        show_toast("Sorry", "There seems to have been an issue completing your request \n please try again");
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
    const listIndex = document.createElement('li');
    listIndex.appendChild(taskContainer);

    return listIndex;
}

const build_input_for_a_new_task = function(){
    const newTaskInput = document.createElement('input');
    newTaskInput.classList.add('input-for-a-new-task')
    newTaskInput.type = 'text';
    newTaskInput.name = 'new-task-input';
    newTaskInput.placeholder = 'Additional step here';

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
    const instructions = 'use this field to add a new subtask to the end of this project';
    const instructionBlock = wrap_data_entry_form_in_an_instruction_block(addTaskForm, instructions);
    return instructionBlock;
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
        if(projects[i].tasks[x].is_complete == 1){
            taskText.classList.add('completed-task');
            checkboxButton.checked = true;
        }
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

const build_project_card = function(projects, i, parentContainer){
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

    parentContainer.appendChild(myProject);
}

const insert_spacer = function(parentContainer){
    const spacer = document.createElement('div');
    spacer.classList.add('spacer');
    parentContainer.appendChild(spacer);
}


const populate_project_screen = function(projects){
    console.log(projects);
    let parentContainer = Array.from(document.getElementsByClassName('user-projects'))[0];
    console.log(parentContainer);
    const editButtonContainer = build_edit_container();
    parentContainer.appendChild(editButtonContainer);

    for(let i = 0; i < projects.length; i++){
        build_project_card(projects, i, parentContainer);
        if(i < (projects.length - 1)){
            insert_spacer(parentContainer);
        }
    }
    if(localStorage.getItem('project-type') == 'complete'){
        const addNewContainer = document.getElementById('add-new-container');
        addNewContainer.style.display = 'none';
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
    console.log(localStorage.getItem("project-type"));
    try{
        let projects = await send_a_request_to_get_user_projects();
        if(projects){
            let userProjects = await projects.json();
            populate_project_screen(userProjects);
        }
    }catch(error){
        console.log(error);
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
            show_toast("I'm sorry","there was an error trying to make an account for you, please try again");
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
        console.log("sending a request to account services");
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
                        show_toast("Uh Oh!", "wrong email and/or password");
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















function show_toast(header, message){
    Array.from(document.getElementsByClassName('toast-subject'))[0].textContent = header;
    Array.from(document.getElementsByClassName('toast-mssg'))[0].textContent = message;
    const toast = Array.from(document.getElementsByClassName('notification'))[0];
    setTimeout(()=>{
        toast.classList.add('toast-show');
        setTimeout(()=>{
            toast.classList.remove('toast-show');
            Array.from(document.getElementsByClassName('toast-subject'))[0].textContent = '';
            Array.from(document.getElementsByClassName('toast-mssg'))[0].textContent = '';
        }, 2500);
    }, 500);
}

function show_modal(header, message){
    Array.from(document.getElementsByClassName('toast-subject'))[1].textContent = header;
    Array.from(document.getElementsByClassName('toast-mssg'))[1].textContent = message;
    const modal = Array.from(document.getElementsByClassName('notification'))[1];
    setTimeout(()=>{
        modal.classList.add('modal-show');
    }, 500);

}

function dismiss_modal(){
    try{
        const dismissModalButtons = Array.from(document.getElementsByClassName('dismiss'));
        for(let x = 0; x < dismissModalButtons.length; x++){
            dismissModalButtons[x].addEventListener('click', ()=>{
                const modal = Array.from(document.getElementsByClassName('notification'))[1];
                modal.classList.remove('modal-show');
            });
        }
    }catch(error){
        console.log(error);
    }
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
            show_toast("Perfect!", "A new task was added to your project");
            window.location.reload();
            return;
        }
    }catch(error){
        console.log(error);
    }
    show_toast("Sorry", "There was an issue adding that last task to your project\n please try again.");

}

const attach_event_listener = function(buttons){
    const inputs = Array.from(document.getElementsByName('a-new-task'));
    for(let i = 0; i < buttons.length; i++){
        buttons[i].addEventListener('click', ()=>{
            if(inputs[i].value != ""){
                add_to_existing_project_fetch(inputs[i].value, i);
                update_user_projects_view();
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
                show_toast("Uh Oh!", "please fill out the entire form!");
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
                        show_toast("Perfect!", "new planned project has been saved");
                        window.location.reload();
                        return;
                    }
                }
                show_toast("Sorry", "there seems to have been an issue submitting your project\n please try again");
                
            }
            else{
                console.log("hello")
                const inputs = Array.from(document.getElementsByClassName('subtask-input'));
                if(inputs[0].value == ""){
                    show_toast("Uh Oh!","Please fill out at least the first subtask!");
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
                        show_toast("Perfect!","new current project has been saved");
                        window.location.reload();
                        return;
                    }
                }
                show_toast("Uh Oh!", "there seems to have been an issue submitting your project, please try again");
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
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({
                    "userEmail": user,
                    "projectTitle": title
            })
        });
    }catch(error){
        console.log(error);
    }
    if(response.status == 200){
        show_toast("Congrats!", "You just completed a project!");
        window.location.reload();
        return;
    }
    show_toast("Sorry", "There was an issue trying to move that project into the completed section\n please try again");
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
    res.push(document.getElementById('complete'));
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
        show_toast("Perfect!", "account made successfully!");
    }
    else if(data.message == "already has an account"){
        show_toast("Uh Oh!", "there is already an account registered under that email,\n please login instead");
    }
    window.location.assign('login.html');
}

const check_for_empty = function(email, pass){
    if(email && pass){
        if(email.value == "" || pass.value == ""){
            //show_toast("Uh Oh!","Please fill out the entire form");
            show_modal("Uh Oh!","Please fill out the entire form");

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
            show_toast("Uh Oh!", "passwords must be at least 8 characters long!");
            return 0;
        }
        if(pass.value !== passConfirm.value){
            show_toast("Uh Oh!", "passwords must match!");
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