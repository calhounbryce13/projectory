'use strict';


document.addEventListener('DOMContentLoaded', ()=>{
    textarea_dynamic_height_functionality();


    const backdrop = Array.from(document.getElementsByClassName('modal-overlay-backdrop'))[1];
    backdrop.classList.add('modal-overlay-backdrop-show');


});


const textarea_dynamic_height_functionality = function(){
    const textareas = document.querySelectorAll('.project-subtask-text');
    textareas.forEach(textarea => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px'; 
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
    });
}




