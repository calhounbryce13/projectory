'use strict';



document.addEventListener('DOMContentLoaded', ()=>{
    const textareas = document.querySelectorAll('.project-subtask-text');

    textareas.forEach(textarea => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px'; 
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = textarea.scrollHeight + 'px'; // Set new height
        });
    });

})