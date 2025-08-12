'use strict';



document.addEventListener('DOMContentLoaded', ()=>{

    show_toast();
    dismiss_toast();
});


function show_toast(){
    const toast = Array.from(document.getElementsByClassName('toast'))[0];
    setTimeout(()=>{
        toast.classList.add('toast-show');
    }, 1000);
}

function dismiss_toast(){
    const dismissToast = Array.from(document.getElementsByClassName('dismiss'))[1];
    dismissToast.addEventListener('click', ()=>{
        const toast = Array.from(document.getElementsByClassName('toast'))[0];
        toast.classList.remove('toast-show');
    });
}