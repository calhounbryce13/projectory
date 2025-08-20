'use strict';
import {endpoints} from './endpoints.js'

const PASSWORD_MIN = 8;
const LOADING_ANIMATION_DELAY = 1000; // in ms


document.addEventListener('DOMContentLoaded', ()=>{

    dismiss_modal_functionality();
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


const update_the_status_for_project_task = async(event, projects, i, x, text) => {
    let user = await fetch_for_user_email();
    if(user){
        let animationInstance;
        let loadingIconShown = false;
        const requestDelayTimer = setTimeout(()=>{
            animationInstance = show_loading();
            loadingIconShown = true;
        }, LOADING_ANIMATION_DELAY);
        try{
            let serviceBresponse = await fetch(endpoints.taskManager, {
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
        }finally{
            clearTimeout(requestDelayTimer);
            if(loadingIconShown){
                dismiss_loading(animationInstance);
            }
        }
        projects = await get_updated_projects();
        check_for_complete(projects, i, user);
        return;
    }
    show_toast("Sorry", "There is an issue communicating with the server\n that update was not saved.");

}


const request_to_delete_user_project = async(type, title) => {
    const animationInstance = show_loading();
    try{
        let response = await fetch(endpoints.deletion,{
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
            //show_toast("Confirmed", "successfully removed that project from your list");
            return true;
        }
    }catch(error){
        console.log(error);
    }finally{
        dismiss_loading(animationInstance);
    }
    //show_toast("Sorry", "unable to remove that project");
    return false;
}


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


const insert_spacer = function(parentContainer){
    const spacer = document.createElement('div');
    spacer.classList.add('spacer');
    parentContainer.appendChild(spacer);
}

const build_parent_container = function(){
    const parent = document.createElement('div');
    parent.classList.add('project-card');
    return parent;
}

const build_title = function(singleProject){
    const projectTitle = document.createElement('p');
    projectTitle.classList.add('project-title');
    projectTitle.textContent = singleProject.title;

    const container = document.createElement('div');
    container.classList.add('project-title-container');
    container.appendChild(projectTitle);

    return container;
}

const build_goal = function(singleProject){
    const projectGoal = document.createElement('p');
    projectGoal.classList.add('project-goal');
    projectGoal.textContent = singleProject.goal;

    const container = document.createElement('div');
    container.classList.add('project-goal-container');
    container.appendChild(projectGoal);

    return container;
}

const build_section_header = function(sectionText, toggleClassName){
    const sectionHeaderText = document.createElement('p');
    sectionHeaderText.classList.add('project-section-text');
    sectionHeaderText.textContent = sectionText;

    const toggleButton = document.createElement('button'); 
    toggleButton.classList.add('toggle-button');
    toggleButton.classList.add(toggleClassName);

    const container = document.createElement('div');
    container.classList.add('project-section-header');
    container.appendChild(sectionHeaderText);
    container.appendChild(toggleButton);

    return container;
}

const build_single_resource = function(singleResource, listOfResources){
    const listIndexElement = document.createElement('li');
    listIndexElement.classList.add('project-individual-resource');

    const anchor = document.createElement('a');
    anchor.classList.add('project-resource-link');
    anchor.target = '_blank';
    anchor.textContent = singleResource;
    anchor.href = singleResource;
    listIndexElement.appendChild(anchor);
    listOfResources.appendChild(listIndexElement);
}

const build_resources = function(singleProject){
    const listOfResources = document.createElement('ul');
    listOfResources.classList.add('project-resources');
    console.log(singleProject.links);
    singleProject.links.forEach((singleResource) => build_single_resource(singleResource, listOfResources));
    return listOfResources;
}

const build_single_subtask = function(singleSubtask, listOfSteps){
    const listIndexElement = document.createElement('li');
    listIndexElement.classList.add('project-individual-subtask');

    const subtaskText = document.createElement('p');
    subtaskText.classList.add('project-subtask-text');
    subtaskText.textContent = singleSubtask.task_description;

    const checkBox = document.createElement('input');
    checkBox.classList.add('subtask-checkbox');
    checkBox.type = 'checkbox';
    checkBox.name = 'task';
    listIndexElement.appendChild(subtaskText);
    listIndexElement.appendChild(checkBox);
    listOfSteps.appendChild(listIndexElement);

}

const build_subtasks = function(singleProject){
    const listOfSteps = document.createElement('ol');
    listOfSteps.classList.add('project-steps');
    singleProject.tasks.forEach((singleSubtask) => build_single_subtask(singleSubtask, listOfSteps));
    return listOfSteps;

}

const build_edit_container = function(){
    const editContainer = document.createElement('div');
    editContainer.classList.add('edit-button-container');
    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editContainer.appendChild(editButton);
    return editContainer;

}

const build_project_start_container = function(){
    const projectStartContainer = document.createElement('div');
    projectStartContainer.classList.add('start-button-container');
    
    const projectStartButton = document.createElement('button');
    projectStartButton.classList.add('start-button');
    projectStartButton.textContent = 'start';
    projectStartContainer.appendChild(projectStartButton);
    return projectStartContainer;
}

const build_project_card = function(singleProject, index, array){
    const parent = build_parent_container();
    const editContainer = build_edit_container();
    parent.appendChild(editContainer);

    const title = build_title(singleProject);
    parent.appendChild(title);

    const goal = build_goal(singleProject);
    parent.appendChild(goal);

    if(singleProject.links){
        if(singleProject.links.length > 0){
            const sectionHeader = build_section_header('resources','toggle-project-resources');
            parent.appendChild(sectionHeader);
            const resources = build_resources(singleProject);
            parent.appendChild(resources);
        }
    }

    if(singleProject.tasks){
        if(singleProject.tasks.length > 0){
            const sectionHeader = build_section_header('steps','toggle-project-steps');
            parent.appendChild(sectionHeader);
            const subtaskSection = build_subtasks(singleProject);
            parent.appendChild(subtaskSection);
        }
    }

    if(localStorage.getItem('project-type') == 'planned'){
        const startProjectOption = build_project_start_container();
        parent.appendChild(startProjectOption);
        
    }

    Array.from(document.getElementsByClassName('user-projects'))[0].appendChild(parent);
    if(index < array.length - 1){
        insert_spacer(document.getElementsByClassName('user-projects')[0]);
    }
}

const get_max_height = function(list){
    let max = 0;
    for(let x = 0; x < list.children.length; x++){
        if(list.children[x].scrollHeight > max){
            max = list.children[x].scrollHeight;
        }
    }
    return max;
}

const toggle_list_height = function(projectResourcesList, i){
    /* 
    DESCRIPTION: Function defined to re-assign the max height of the given 
                list to expand or contract on click
    INPUT(S): An array of expandable lists from the whole page (array), an index in the list (integer)
    OUTPUT(S): None
    */
    const numChildren = projectResourcesList[i].children.length;
    const heightOfTallestChild = get_max_height(projectResourcesList[i]);
    console.log("height of a single link",heightOfTallestChild);
    const newMaxHeight = (numChildren * heightOfTallestChild) + 10;
    console.log(getComputedStyle(projectResourcesList[i]).maxHeight);
    if(getComputedStyle(projectResourcesList[i]).maxHeight == '0px'){
        projectResourcesList[i].style.maxHeight = newMaxHeight + 'vh';
        return;
    }
    projectResourcesList[i].style.maxHeight = '0px';
}

const expanded_list_functionality = function(buttonClassName, containerClassName){
    /* 
    DESCRIPTION: Function defined to access all the expansion buttons on the page and apply event listeners
    INPUT(S): class for toggle button(s) to call event listener on (string), class for the container(s) to expand (string)
    OUTPUT(S): None
    */
    let expandProjectButtonList = document.getElementsByClassName(buttonClassName);
    if(expandProjectButtonList){
        expandProjectButtonList = Array.from(expandProjectButtonList);
        const projectList = Array.from(document.getElementsByClassName(containerClassName));
        for(let i = 0; i < expandProjectButtonList.length; i++){
            expandProjectButtonList[i].addEventListener('click', ()=>{
                toggle_list_height(projectList, i);
                event.target.classList.toggle('toggle-button-expanded');

            });
        }
    }
}

const data_acquisition = function(event){
    // go to the parent of the given checkbox
    // get a list of the children checkboxes
    // use the list to get the index of the given checkbox
    const box = event.target;
    


}
const update_subtask_status = function(event){
    data_acquisition(event);

}


const update_subtask_status_functionality = function(){
    const checkBoxes = Array.from(document.getElementsByClassName('subtask-checkbox'));
    checkBoxes.forEach((singleCheckBox) => {
        singleCheckBox.addEventListener('click', (event) => update_subtask_status(event));
    });
}

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


    textarea_dynamic_height_functionality(); //! needs to be called after the element(s) are displayed !//

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

const close_start_modal_functionality = function(){
    const dismissModal = document.getElementById('start-modal-close');
    dismissModal.addEventListener('click', () => {
        const startProjectModal = Array.from(document.getElementsByClassName('start-project-modal'))[0];
        startProjectModal.classList.remove('start-project-modal-show');
        const textArea = Array.from(document.getElementsByClassName('textarea-start-project-first-step'))[0];
        textArea.value = '';

        const parent = Array.from(document.getElementsByClassName('modal-overlay-backdrop'))[0];
        parent.classList.remove('modal-overlay-backdrop-show');
    });
}

const starting_project = function(){
    const startButton = document.getElementById('start-modal-initiate');
    startButton.addEventListener('click', (event) => {
        const textarea = event.target.parentNode.parentNode.children[3];
        console.log('\n starting here', event.target);
        console.log(textarea);
        console.log(textarea.value);

        if(textarea.value == ''){
            show_modal("Uh Oh!","Please fill out the entire form");
            return;
        }
        const title = event.target.parentNode.parentNode.children[1].children[0].textContent;
        const goal = event.target.parentNode.parentNode.children[2].children[0].textContent;
        const steps = [];
        steps.push(textarea.value);
        console.log(title);
        console.log(steps, '\n');




        if(send_request_to_make_current_project(title, goal, steps)){
            if(request_to_delete_user_project(localStorage.getItem('project-type'), title)){
                window.location.reload();
                return;
            }
            show_toast("Sorry", "unable to remove that project");
        }
        return;
    
    });

}

const start_a_planned_project_functionality = function(){
    const startButtons = document.querySelectorAll('.start-button');
    startButtons.forEach((singleButton) => {
        singleButton.addEventListener('click', (event) => show_modal_to_start_planned_project(event));
    });
    close_start_modal_functionality();
    starting_project();
}


const populate_project_screen = function(projects){
    const convertedProjects = Array.from(projects);
    convertedProjects.forEach((singleProject, index, array) => build_project_card(singleProject, index, array));
    //? can possibly attach event listeners here, better for decoupling structure from function

    if(localStorage.getItem('project-type') == 'current'){
        expanded_list_functionality('toggle-project-resources', 'project-resources');
        expanded_list_functionality('toggle-project-steps', 'project-steps');
        //update_subtask_status_functionality();
    }
    else if(localStorage.getItem('project-type') == 'planned'){
        start_a_planned_project_functionality();
    }
    if(localStorage.getItem('project-type') == 'complete'){
        const addNewContainer = document.getElementById('add-new-container');
        addNewContainer.style.display = 'none';
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const send_a_request_to_get_user_projects = async()=>{
    const animationInstance = show_loading();
    try{
        let projects = await fetch(endpoints.projects_view,{
            headers:{
                "Content-type": "application/json"
            },
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({"project-type": localStorage.getItem("project-type")})
            
        });
        return projects;
    }catch(error){
        console.log(error);
    }finally{
        dismiss_loading(animationInstance);
    }
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
            console.log("a")
            event.preventDefault();
            if((form.elements['project-title'].value == "") || (form.elements['project-goal'].value == "")){
                show_modal("Uh Oh!", "please fill out the entire form!");
                return;
            }
            if(localStorage.getItem('project-type') == 'planned'){
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
    const animationInstance = show_loading();
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
    }finally{
        dismiss_loading(animationInstance);
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
    const animationInstance = show_loading();
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
    }finally{
        dismiss_loading(animationInstance);
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
            show_modal("Uh Oh!", "passwords must be at least 8 characters long!");
            return 0;
        }
        if(pass.value !== passConfirm.value){
            show_modal("Uh Oh!", "passwords must match!");
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