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

    expandable_list_functionality();

});


const expandable_list_functionality = function(){
    const buttons = Array.from(document.getElementsByClassName('list-expand'));
    buttons.forEach(button => {
        button.addEventListener('click', () => {

            const cousin = button.closest('div').nextElementSibling;
            console.log(cousin.scrollHeight);
            /*



            let newHeight = numChildren * 5;
            if(list.style.maxHeight == '10vh'){
                list.style.maxHeight = newHeight + 'vh';
            }
            else{
                list.style.maxHeight = '10vh';
            }

            */
        });
    })

}



