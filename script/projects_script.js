'use strict';
import { endpoints } from "./endpoints.js";



document.addEventListener("DOMContentLoaded", () => {
    update_project_title_functionality();
    update_project_goal_functionality();
    delete_project_functionality();
    closing_the_editor_functionality();
});

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
            return true;
        }
    }catch(error){
        console.log(error);
    }finally{
        dismiss_loading(animationInstance);
    }
    return false;
}

const remove_user_project = async(event) => {
    if(confirm("Are you sure you want to PERMANENTLY delete this project? This cannot be undone.")){
        const user = await fetch_for_user_email();
        const title = event.target.parentNode.parentNode.children[2].children[0].textContent;
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


    console.log(document.getElementsByClassName('project-resources-edit-modal'));
    const ul = Array.from(Array.from(document.getElementsByClassName('project-resources-edit-modal'))[0]);
    ul.forEach((element) => {
        console.log("here");
        console.log(element);
        if(element.classList[0] != 'project-add-new-text'){
            ul.remove(element);
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
    const animation = show_loading();
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
        dismiss_loading(animation);
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
    const animation = show_loading();
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
        dismiss_loading(animation);
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