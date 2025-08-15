'use strict';


document.addEventListener('DOMContentLoaded', ()=>{
    textarea_dynamic_height_functionality();
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




