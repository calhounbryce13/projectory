'use strict';



document.addEventListener('DOMContentLoaded', ()=>{

    show_modal();
    dismiss_modal();
});


function show_modal(){
    const modal = Array.from(document.getElementsByClassName('modal'))[0];
    setTimeout(()=>{
        modal.classList.add('modal-show');
    }, 1000);
}

function dismiss_modal(){
    const dismissModal = Array.from(document.getElementsByClassName('dismiss'));
    dismissModal.forEach((buttonToDismissModal) => {
        buttonToDismissModal.addEventListener('click', ()=>{
            const modal = Array.from(document.getElementsByClassName('modal'))[0];
            modal.classList.remove('modal-show');
        });

    })

}