'use strict'


document.addEventListener('DOMContentLoaded', ()=>{
    close_start_modal_functionality();



    setTimeout(() => {
        show_modal_to_start_planned_project();
    },2000);


});

const close_start_modal_functionality = function(){
    const dismissModal = document.getElementById('start-modal-close');
    dismissModal.addEventListener('click', () => {
        const startProjectModal = Array.from(document.getElementsByClassName('start-project-modal'))[0];
        startProjectModal.classList.remove('start-project-modal-show');

        const parent = Array.from(document.getElementsByClassName('modal-overlay-backdrop'))[0];
        parent.classList.remove('modal-overlay-backdrop-show');
    });
}

const populate_modal_to_start_planned_project = function(){

}

const show_modal_to_start_planned_project = function(){
    //populate_modal_to_start_planned_project();
    const parent = Array.from(document.getElementsByClassName('modal-overlay-backdrop'))[0];
    parent.classList.add('modal-overlay-backdrop-show');

    const startProjectModal = Array.from(document.getElementsByClassName('start-project-modal'))[0];
    startProjectModal.classList.add('start-project-modal-show');


    textarea_dynamic_height_functionality(); //! needs to be called after the element(s) are displayed !//


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
    })











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