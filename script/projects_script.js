'use strict';
import { endpoints } from "./endpoints.js";



document.addEventListener("DOMContentLoaded", () => {
    update_project_title_functionality();
    update_project_goal_functionality();


});

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