'use strict';
import {endpoints} from './endpoints.js'

const PASSWORD_MIN = 8;
const LOADING_ANIMATION_DELAY = 1000; // in ms


document.addEventListener('DOMContentLoaded', async()=>{

    feedback_functionality();

    check_local_storage();

    dismiss_modal_functionality();
    await check_user_login_status();
    await generate_user_projects_page();
    backend_communication();
    home_page_listeners();


    setTimeout(()=>{
        add_task_to_existing_functionality();
    }, 2000);
    
});


////////////////////////////////////////////////////////////////////////////////////////////////////



const show_feedback_form = function(){
    document.getElementById('feedback').addEventListener('click', () => {
        const backdrop = Array.from(document.getElementsByClassName('backdrop'))[0];
        backdrop.classList.add('backdrop-show');
        const form = Array.from(document.getElementsByClassName('feedback-modal'))[0];
        form.classList.add('feedback-show');
    });

}

const actually_close_the_feedback_form = function(){
    const form = Array.from(document.getElementsByClassName('feedback-modal'))[0];
    const fieldset = form.children[1].children[0].children[0];
    fieldset.value = '';
    form.classList.remove('feedback-show');
    const backdrop = Array.from(document.getElementsByClassName('backdrop'))[0];
    backdrop.classList.remove('backdrop-show');
}

const close_feedback_form = function(){
    document.getElementById('close-feedback').addEventListener('click', actually_close_the_feedback_form);
}

const submit_feedback = function(){
    const form = Array.from(document.getElementsByName('form-for-feedback'))[0];
    form.addEventListener('submit', async(event) => {
        event.preventDefault();
        const input = event.target.children[0].children[0];
        if((input.value).trim() != ''){
            try{
                const response = await fetch('https://calhounbryce13-backend.onrender.com/mailer', {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({
                        'message': input.value
                    })
                })
                switch(response.status){
                    case 200:
                        window.alert("Success ! Thanks for the message.");
                        actually_close_the_feedback_form();
                        return;
                    case 400:
                        window.alert("Sorry :/ it looks like there was an issue with that request, please try agian tho");
                        return;
                    case 500:
                        window.alert("Sorry :/ it looks like there was an isse communicating with the database, please try again tho");
                        return;
                    default:
                        window.alert("Sorry :/ an unexpected issue occured, please try again");
                        return;
                }
            }catch(error){
                console.log(error);
                window.alert("There was an error sending the request, please try again");
                return;
            }
        }
        window.alert("please add text to the feedback form before you submit");
        return;
    })
}

const feedback_functionality = function(){
    textarea_dynamic_height_functionality();
    show_feedback_form();
    close_feedback_form();
    submit_feedback();

}

const check_local_storage = function(){
    if(!(localStorage.getItem("Projectory"))){
        localStorage.setItem("Projectory", JSON.stringify({
            "project-type":"",
            "project-title": ""
        }));
    }
}

const fetch_for_login_status = async()=>{

    let animationInstance;
    let loadingIconShown = false;
    const requestDelayTimer = setTimeout(()=>{
        animationInstance = show_loading();
        loadingIconShown = true;
    }, LOADING_ANIMATION_DELAY);
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
    }finally{
        clearTimeout(requestDelayTimer);
        if(loadingIconShown){
            dismiss_loading(animationInstance);
        }
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
    const animationInstance = show_loading();
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
    }finally{
        dismiss_loading(animationInstance);
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
    header.textContent = `My ${JSON.parse(localStorage.getItem("Projectory"))["project-type"]} projects`;
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
    const projectType = JSON.parse(localStorage.getItem("Projectory"))["project-type"];
    if(projectType == 'planned'){
        return;
    }
    add_fields_for_subtasks();
}

const fetch_for_user_email = async()=>{
    const animationInstance = show_loading();
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
    }finally{
        dismiss_loading(animationInstance);
    }
    return false;
}

const send_request_to_remove_a_link = async(title, user, linkText)=>{
    const animationInstance = show_loading();
    try{
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
    }catch(error){
        console.log(error);
    }finally{
        dismiss_loading(animationInstance);
    }
    return false;

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

const send_a_request_to_insert_a_link = async(title, user, linkText)=>{
    const animationInstance = show_loading();
    try{
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

    }catch(error){
        console.log(error);

    }finally{
        dismiss_loading(animationInstance);
    }

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

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//! JUNK !//



const remove_a_task_from_a_project = async(projects, i, x) => {
    if(confirm("are you sure you want to remove this task from this project?\n you cannot undo this action")){
        let title = projects[i].title;
        let index = x;
        let user = await fetch_for_user_email();
        if(user){
            let response;
            const animationInstance = show_loading();
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
            }finally{
                dismiss_loading(animationInstance);
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const populate_modal_to_start_planned_project = function(event){
    const title = event.target.parentNode.parentNode.children[1].children[0].textContent;
    const goal = event.target.parentNode.parentNode.children[2].children[0].textContent;

    const modal = Array.from(document.getElementsByClassName('start-project-modal'))[0];

    modal.children[1].children[0].textContent = title;
    modal.children[2].children[0].textContent = goal;

}

const show_modal_to_start_planned_project = function(event){
    populate_modal_to_start_planned_project(event);
    const parent = Array.from(document.getElementsByClassName('modal-overlay-backdrop'))[0];
    parent.classList.add('modal-overlay-backdrop-show');

    const startProjectModal = Array.from(document.getElementsByClassName('start-project-modal'))[0];
    startProjectModal.classList.add('start-project-modal-show');


    textarea_dynamic_height_functionality(); //* needs to be called after the element(s) are displayed *//

}

const textarea_dynamic_height_functionality = function(){
    const textareas = Array.from(document.getElementsByClassName('dynamic-height-textarea'));
    textareas.forEach(textarea => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px'; 
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
    });
}


const populate_the_title_and_goal = function(projectCard, editModal){
    const title = projectCard.children[1].children[0].textContent;
    const goal = projectCard.children[2].children[0].textContent;
    const titleField = editModal.children[2].children[0];
    const goalField = editModal.children[3].children[0];
    titleField.value = title;
    goalField.value = goal;
    setTimeout(() => {
        textarea_dynamic_height_functionality();
    }, 500)
}

const populate_modal = function(event, editModal){
    /* 
    description: Function to populate the edit project modal with the relevant data
    input(s); The clicked event, modal element
    output(s): None
    */
    const projectCard = event.target.parentNode.parentNode;
    populate_the_title_and_goal(projectCard, editModal);
    const projectType = JSON.parse(localStorage.getItem("Projectory"))["project-type"];


    if( projectType != "planned" && projectType != 'complete'){
        const ul = projectCard.children[4];
        const ol = projectCard.children[6];
        if(ul){
            Array.from(ul.children).forEach((listIndex) => {

                const url = listIndex.children[0].textContent;
                const anchor = document.createElement('a');
                anchor.classList.add('edit-a-project-resource-link');
                anchor.textContent = url;

                const button = document.createElement('button');
                button.classList.add('edit-modal-button');
                button.classList.add('remove-a-project-element-button');
                button.textContent = 'delete';

                const container = document.createElement('div');
                container.classList.add('edit-a-project-resource-container');
                container.appendChild(anchor);
                container.appendChild(button);

                const editIndex = document.createElement('li');
                editIndex.classList.add('project-individual-resource');
                editIndex.appendChild(container);

                const editor = Array.from(document.getElementsByClassName('project-resources-edit-modal'))[0];
                editor.appendChild(editIndex);

            });
        }
        /*
        if(ol){
            Array.from(ol.children).forEach((listIndex) => {
                steps.push(listIndex.children[0].textContent);
            });
        }
            */
    
    }
}


const save_a_new_resource = function(){
    const button = document.getElementById('add-a-new-project-resource-button');
    if(button){
        button.addEventListener('click', async() => {
            const textArea = button.parentNode.children[0];
            if(textArea.value != ''){
                const user = await fetch_for_user_email();
                const title = button.parentNode.parentNode.parentNode.parentNode.children[1].children[0].textContent;
                send_a_request_to_insert_a_link(title, user, textArea.value);
            }
            show_modal("Uh Oh!", "Please enter a valid URL in order to save");
            return;
        });
    }
}

const edit_a_single_project_functionality = function(){
    /*
    description: Adding the event listeners for the functionality 
    of the elements on the edit modal for any given page.
    input(s): None
    output(s): None
     */
    save_a_new_resource();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const send_a_request_to_get_user_projects = async()=>{

    let animationInstance = false;
    const timer = setTimeout(() => {
        animationInstance = show_loading();
    });
    let projects;
    try{
        projects = await fetch(endpoints.projects_view,{
            headers:{
                "Content-type": "application/json"
            },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({"project-type": JSON.parse(localStorage.getItem("Projectory"))["project-type"]})
        });
    }catch(error){
        console.log(error);
    }finally{
        clearTimeout(timer);
        if(animationInstance) dismiss_loading(animationInstance);
        switch(projects.status){
            case 200:
                return projects;
            default:
                return false;
        }
    }
}


const clear_container = function(container){
    if(container){
        while(container.children.length > 0){
            container.removeChild(container.lastChild);
        }
    }
}

const update_user_projects_view = async()=>{
    let container = Array.from(document.getElementsByClassName('user-projects'))[0];
    if(container){
        clear_container(container);
        try{
            let projects = await send_a_request_to_get_user_projects();
            projects = await projects.json();
            populate_project_screen(projects);
        }catch(error){
            console.log(error);
        }
    }
}

const generate_user_projects_page = async() => {
    
    if(window.location.pathname.endsWith("/projects.html")){
        update_header_text();
        populate_form_controls();
        //get_project_data();
    }
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


const show_toast = function(header, message){
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
}

const show_modal = function(header, message){
    Array.from(document.getElementsByClassName('toast-subject'))[1].textContent = header;
    Array.from(document.getElementsByClassName('toast-mssg'))[1].textContent = message;
    const modal = Array.from(document.getElementsByClassName('notification'))[1];
    setTimeout(()=>{
        modal.classList.add('modal-show');
    }, 500);

}

const dismiss_modal_functionality = function(){
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
    const animationInstance = show_loading();
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
    }finally{
        dismiss_loading(animationInstance);
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

const send_request_to_make_current_project = async(title, goal, steps) => {
    const animationInstance = show_loading();
    try{
        let response = await fetch(endpoints.current_projects_generator,{
            method: "POST",
            credentials: "include",
            headers:{
                "Content-type": "application/json"
            },
            body:JSON.stringify({
                "title": title,
                "goal": goal,
                "tasks": steps
            })
        });
        if(response){
            if(response.status == 200){
                show_toast("Perfect!","new current project has been saved");
                return true;
            }
        }
        
    }catch(error){
        console.log(error);
    }finally{
        dismiss_loading(animationInstance);
    }
    show_toast("Uh Oh!", "there seems to have been an issue submitting your project, please try again");
    return false;
}

const create_new_project_functionality = function(){
    const form = Array.from(document.getElementsByClassName('project-form'))[0];
    if(form){
        form.addEventListener('submit', async(event)=>{
            event.preventDefault();
            if((form.elements['project-title'].value == "") || (form.elements['project-goal'].value == "")){
                show_modal("Uh Oh!", "please fill out the entire form!");
                return;
            }
            if(JSON.parse(localStorage.getItem("Projectory"))["project-type"] == 'planned'){
                let response;
                const animationInstance = show_loading();
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
                }finally{
                    dismiss_loading(animationInstance);
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
                const inputs = Array.from(document.getElementsByClassName('subtask-input'));
                if(inputs[0].value == ""){
                    show_modal("Uh Oh!","Please fill out at least the first subtask!");
                    return;
                }
                const taskList = create_list_of_tasks(inputs);
                let response;
                const animationInstance = show_loading();
                try{
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
                }finally{
                    dismiss_loading(animationInstance);
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
    const input = document.createElement('textarea');
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
    let animationInstance = false;
    const timer = setTimeout(() => {
        animationInstance = show_loading();
    }, LOADING_ANIMATION_DELAY);
    try{
        const response = await fetch(endpoints.projectManager, {
            method: 'PUT',
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({
                    "userEmail": user,
                    "projectTitle": title
            })
        });
        switch(response.status){
            case 200:
                show_toast("Congrats!", "You just completed a project!");
                window.location.reload();
                break;
            default:
                show_toast("Sorry", "There was an issue trying to move that project into the completed section\n please try again");
                break;
        }
    }catch(error){
        console.log(error);
    }finally{
        clearTimeout(timer);
        if(animationInstance) dismiss_loading(animationInstance);
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
                const localObj = JSON.parse(localStorage.getItem("Projectory"));
                localObj["project-type"] = buttons[x].id;
                localStorage.setItem("Projectory", JSON.stringify(localObj));
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
    setTimeout(() => {
        window.location.assign('login.html');
    }, 2000);
}

const check_for_empty = function(email, pass){
    if(email && pass){
        if(email.value == "" || pass.value == ""){
            show_toast("Uh Oh!","Please fill out the entire form");
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


const show_loading = function(){
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

}

const dismiss_loading = function(animationInstance){
    const animation = document.getElementById('lottie-loading-animation');
    const animationContainer = document.getElementById('lottie-parent');
    animation.style.display = 'none';
    animationContainer.style.display = 'none';
    animationInstance.destroy();
}

const backend_communication = function(){
    login_functionality();

    logout_functionality();

    add_task_to_new_functionality();

    create_new_project_functionality();

    remove_user_account_functionality();

    signup_functionality();
}