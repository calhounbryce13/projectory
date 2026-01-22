'use strict';
import { endpoints } from "./endpoints.js";

const LOADING_ANIMATION_DELAY = 1000; 

const SHORT_PAGE_LOAD_DELAY = 1000;




document.addEventListener("DOMContentLoaded", () => {
    get_project_data();     //todo: testing this from script.js
    setTimeout(() => {
        update_project_title_functionality();
        update_project_goal_functionality();
        delete_project_functionality();
        closing_the_editor_functionality();
        update_task_status_functionality();
    }, SHORT_PAGE_LOAD_DELAY);
});







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
    singleProject.links.forEach((singleResource) => build_single_resource(singleResource, listOfResources));
    return listOfResources;
}

const build_single_subtask = function(singleSubtask, listOfSteps){
    const listIndexElement = document.createElement('li');
    listIndexElement.classList.add('project-individual-subtask');

    const subtaskText = document.createElement('p');
    subtaskText.classList.add('project-subtask-text');
    if(singleSubtask.is_complete) subtaskText.classList.add('completed-task');
    console.log(singleSubtask);
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
    projectStartButton.classList.add('yellow-button');
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

    if(JSON.parse(localStorage.getItem("Projectory"))["project-type"] == 'planned'){
        const startProjectOption = build_project_start_container();
        parent.appendChild(startProjectOption);
        
    }

    Array.from(document.getElementsByClassName('user-projects'))[0].appendChild(parent);
    if(index < array.length - 1){
        insert_spacer(document.getElementsByClassName('user-projects')[0]);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////


const show_modal_to_edit_a_project = function(event){
    if(JSON.parse(localStorage.getItem("Projectory"))["project-type"] != 'complete'){
        const localObj = JSON.parse(localStorage.getItem("Projectory"));
        localObj["project-title"] = (event.target).parentNode.parentNode.children[1].children[0].textContent;
        localStorage.setItem("Projectory", JSON.stringify(localObj));

        const editModal = Array.from(document.getElementsByClassName('edit-project-modal'))[0];
        const backdrop = Array.from(document.getElementsByClassName('modal-overlay-backdrop'))[1];

        populate_modal(event, editModal);
        backdrop.classList.add('modal-overlay-backdrop-show');
        editModal.classList.add('edit-modal-show');
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
    const newMaxHeight = (numChildren * heightOfTallestChild) + 10;
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
            expandProjectButtonList[i].addEventListener('click', (event)=>{
                toggle_list_height(projectList, i);
                event.target.classList.toggle('toggle-button-expanded');
            });
        }
    }
}

const start_a_planned_project_functionality = function(){
    const startButtons = document.querySelectorAll('.start-button');
    startButtons.forEach((singleButton) => {
        singleButton.addEventListener('click', (event) => show_modal_to_start_planned_project(event));
    });
    close_start_modal_functionality();
    starting_project();
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

const starting_project = async() => {
    const startButton = document.getElementById('start-modal-initiate');
    startButton.addEventListener('click', async(event) => {
        const textarea = event.target.parentNode.parentNode.children[3];

        if(textarea.value == ''){
            show_modal("Uh Oh!","Please fill out the entire form");
            return;
        }
        const title = event.target.parentNode.parentNode.children[1].children[0].textContent;
        const goal = event.target.parentNode.parentNode.children[2].children[0].textContent;
        const steps = [];
        steps.push(textarea.value);

        if(await send_request_to_make_current_project(title, goal, steps)){
            const user = await fetch_for_user_email();
            if(await request_to_delete_user_project(JSON.parse(localStorage.getItem("Projectory"))["project-type"], title, user)){
                window.location.reload();
                return;
            }
            show_toast("Sorry", "unable to remove that project");
        }
        return;
    
    });

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

const project_functions = function(){
    /*
    Description: Function defined to facilitate the various functionalities
                that the user project cards need. 
                1.) toggling te edit modal
                2.) expand and contract the lists
                3.) start a planned project
    Input(s): None
    Output(s): None
    */
    const editProjectButtonList = Array.from(document.getElementsByClassName('edit-button'));
    editProjectButtonList.forEach((button) => {
        button.addEventListener('click', (event) => show_modal_to_edit_a_project(event));
    });
    

    if(JSON.parse(localStorage.getItem("Projectory"))["project-type"] == 'current'){
        expanded_list_functionality('toggle-project-resources', 'project-resources');
        expanded_list_functionality('toggle-project-steps', 'project-steps');
    }
    else if(JSON.parse(localStorage.getItem("Projectory"))["project-type"] == 'planned'){
        start_a_planned_project_functionality();
    }
}

const populate_project_screen = function(projects){
    /* 
    Description: This is the function to handle the dynamic rendering of the user's 
                view with their project data.
    Input(s): A list of projects (objects), based on the page they are on (current, planned, or complete)
    Output(s): None
    */
    const userProjectsArray = Array.from(projects);
    userProjectsArray.forEach((singleProject, index, array) => build_project_card(singleProject, index, array));


    if(JSON.parse(localStorage.getItem("Projectory"))["project-type"] == 'complete'){
        const addNewContainer = document.getElementById('add-new-container');
        addNewContainer.style.display = 'none';
    }
    project_functions();

}

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

const get_project_data = async()=>{
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

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////



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

const get_the_index_of_a_task = function(checkboxElement){
    const parent = checkboxElement.parentNode.parentNode;
    for(let i = 0; i < (parent.children).length; i++){
        if(parent.children[i].children[1] == checkboxElement){
            return i;
        }
    }
    console.log("error: an unexpected issue occured while getting the index for the task update");
    return null;
}

const get_the_title_of_the_project = function(checkboxElement){
    const parent = checkboxElement.parentNode.parentNode.parentNode;
    if((parent.children).length > 0){
        return parent.children[1].children[0].textContent;
    }
    console.log("error: unexpected DOM tree positioning");
    return null;
}

const toggle_respective_text = function(checkbox){
    const sibling = checkbox.parentNode.children[0];
    sibling.classList.toggle('completed-task');
}

const update_task_status_functionality = function(){
    if(document.getElementsByClassName('subtask-checkbox').length > 0){
        const checkBoxesElements = Array.from(document.getElementsByClassName('subtask-checkbox'));
        checkBoxesElements.forEach((box) => {

            console.log("looping over the boxes");

            box.addEventListener('change', async(event) => {

                console.log("attaching a listener");    

                const checkBox = event.target;
                const user = await fetch_for_user_email();
                if(user){

                    console.log("user found");

                    const index = get_the_index_of_a_task(checkBox);
                    if(index != null){

                        console.log("index found");

                        const projectTitle = get_the_title_of_the_project(checkBox);
                        if(projectTitle != null){
                            let mark = checkBox.checked ? 1 : 0;
                            let loadingAnimation = false;
                            const timer = setTimeout(() => {
                                loadingAnimation = show_loading();
                            }, LOADING_ANIMATION_DELAY);
                            try{
                                const response = await fetch(endpoints.taskManager, {
                                    method: "POST",
                                    headers: {
                                        "Content-type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        "userEmail": user,
                                        "projectTitle": projectTitle,
                                        "index": index,
                                        "statusMark": mark
                                    })
                                });
                                switch(response.status){
                                    case 200:
                                        toggle_respective_text(checkBox);
                                        show_toast("Nice", "That step was updates successfully");
                                        break;
                                    case 400:
                                        show_toast("Uh Oh", "It looks like there was an issue with the request");
                                        break;
                                    case 500:
                                        show_toast("Uh Oh", "it looks like there was an issue with the server");
                                        break;
                                    default:
                                        console.log("error: an unexpected status code was returned !");
                                        break;
                                }
                            }catch(error){
                                console.log(error);
                                show_toast("sorry :/", "There was an error communicating to the sevrer on that request");
                            }
                            finally{
                                clearTimeout(timer);
                                if(loadingAnimation) dismiss_loading();
                            }
                            return;
                        }
                        show_toast("Sorry :/", "There was an issue getting the project title for that update");
                        return;
                    }
                    show_toast("Sorry :/", "There was an issue getting the task index for that update");
                    return;
                }
                show_toast("Sorry :/", "There was an issue validating your email for that update");
                return;
            });
        });
    }
}

const dismiss_loading = function(animationInstance){
    const animation = document.getElementById('lottie-loading-animation');
    const animationContainer = document.getElementById('lottie-parent');
    animation.style.display = 'none';
    animationContainer.style.display = 'none';
    animationInstance.destroy();
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

////////////////////////////
////////////////////////////
////////////////////////////
////////////////////////////
////////////////////////////
////////////////////////////
////////////////////////////
////////////////////////////


const request_to_delete_user_project = async(type, title, user) => {
    let animation = false;
    const timer = setTimeout(() => {
        animation = show_loading();
    }, LOADING_ANIMATION_DELAY);
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
        if(response.status == 200) return true;
    }catch(error){
        console.log(error);
    }finally{
        clearTimeout(timer);
        if(animation) dismiss_loading(animationInstance);
    }
    return false;
}

const remove_user_project = async(event) => {
    if(confirm("Are you sure you want to PERMANENTLY delete this project? This cannot be undone.")){
        const user = await fetch_for_user_email();
        const title = JSON.parse(localStorage.getItem("Projectory"))["project-title"];
        const type = JSON.parse(localStorage.getItem("Projectory"))["project-type"];
        const status = await request_to_delete_user_project(type, title, user);
        if(status){
            show_toast("All Done", "That project was successfully removed from your collection");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
        else{
            show_toast("Uh Oh", "There was an issue removing that project from your collection");
        }
    }
}

const delete_project_functionality = function(){
    const deleteProjectButton = Array.from(document.getElementsByClassName('delete-project'))[0];
    deleteProjectButton.addEventListener('click', (event) => remove_user_project(event));
}


const clear_the_modal = function(modal){
    const titleField = modal.children[2].children[0];
    const goalField = modal.children[3].children[0];

    titleField.value = '';
    goalField.value = '';

    const container = document.getElementsByClassName('project-resources-edit-modal')[0];
    const children = Array.from(container.children);
    
    children.forEach(child => {
        if (!child.classList.contains('project-add-new-text')) {
            child.remove();
        }
    });
    

}

const remove_project_editor = function(){
    const editModal = Array.from(document.getElementsByClassName('edit-project-modal'))[0];
    clear_the_modal(editModal);
    const backdrop = Array.from(document.getElementsByClassName('modal-overlay-backdrop'))[1];
    backdrop.classList.remove('modal-overlay-backdrop-show');
    editModal.classList.remove('edit-modal-show');
}

const closing_the_editor_functionality = function(){
    const closeTheEditorButton = Array.from(document.getElementsByClassName('close-editor'))[0];
    closeTheEditorButton.addEventListener('click', remove_project_editor);
}

const is_not_empty = function(field){
    if(field.trim() == '') return false;
    return true;
}

const is_unique_title = function(title){
    const projectCards = Array.from(document.getElementsByClassName('project-card'));
    for(let i = 0; i < projectCards.length; i++){
        console.log(projectCards[i].children[1].children[0])
        if(((projectCards[i].children[1].children[0].textContent).toLowerCase()).trim() == (title.toLowerCase()).trim()){
            return false;
        }
    }
    return true;
}


const request_to_update_project_title = async(email, newTitle) => {
    let animation = false;
    const timer = setTimeout(() => {
        animation = show_loading();
    }, LOADING_ANIMATION_DELAY)
    try{
        const response = await fetch(endpoints.titleUpdate, {
            method: "PUT",
            headers: {
                "Content-type":"application/json"
            },
            body: JSON.stringify({
                "user": email,
                "category":JSON.parse(localStorage.getItem("Projectory"))["project-type"],
                "old-title": JSON.parse(localStorage.getItem("Projectory"))["project-title"],
                "new-title": newTitle
            })
        });
        switch(response.status){
            case 200:
                show_toast("All Good :)","Your new title has been saved !");
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                return;
            case 400:
                show_toast("Uh Oh :/","There seems to have been an issue with that request, please try again");
                break;
            case 500:
                show_toast("Uh Oh :/","There seems to have been an isse with the server, please try again");
                break;
            default:
                show_toast("Uh Oh :/","An unexpected error occurred, please try again");
        }
    }catch(error){
        console.log(error);
        show_toast("Sorry", "There seems to have been an issue sending that request, please try again");
    }finally{
        clearTimeout(timer);
        if(animation) dismiss_loading(animation);
    }
}

const update_project_title_functionality = function(){
    const updateButton = document.getElementById('update-title');
    updateButton.addEventListener('click', async(event) => {
        const textarea = document.getElementById('name-of-project-to-edit');
        if(is_not_empty(textarea.value)){
            if(is_unique_title(textarea.value)){
                const email = await fetch_for_user_email();
                request_to_update_project_title(email, textarea.value);
                return;
            }
            show_toast("Uh Oh", "There is another project with this title already, please try again");
            return;
        }
        show_toast("Uh Oh", "This field can't be empty, please add some text");
        return;
    })
}


const request_to_update_project_goal = async(email, newGoal) => {
    let animation = false;
    const timer = setTimeout(() => {
        animation = show_loading();
    }, LOADING_ANIMATION_DELAY)
    try{
        const response = await fetch(endpoints.goalUpdate, {
            method: "PUT",
            headers: {
                "Content-type":"application/json"
            },
            body: JSON.stringify({
                "user": email,
                "category":JSON.parse(localStorage.getItem("Projectory"))["project-type"],
                "title": JSON.parse(localStorage.getItem("Projectory"))["project-title"],
                "new-goal": newGoal
            })
        });
        switch(response.status){
            case 200:
                show_toast("All Good :)","Your new goal has been saved !");
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                return;
            case 400:
                show_toast("Uh Oh :/","There seems to have been an issue with that request, please try again");
                break;
            case 500:
                show_toast("Uh Oh :/","There seems to have been an isse with the server, please try again");
                break;
            default:
                show_toast("Uh Oh :/","An unexpected error occurred, please try again");
        }
    }catch(error){
        console.log(error);
        show_toast("Sorry", "There seems to have been an issue sending that request, please try again");
    }finally{
        clearTimeout(timer);
        if(animation) dismiss_loading(animation);
    }
}

const update_project_goal_functionality = function(){
    const updateButton = document.getElementById('update-goal');
    updateButton.addEventListener('click', async(event) => {
        const textarea = document.getElementById('goal-of-project-to-edit');
        if(is_not_empty(textarea.value)){
            const email = await fetch_for_user_email();
            request_to_update_project_goal(email, textarea.value);
            return;
        }
        show_toast("Uh Oh", "This field can't be empty, please add some text");
        return;
    })
}