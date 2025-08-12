'use strict';



document.addEventListener('DOMContentLoaded', ()=>{
    dismiss_confirmation_functionality();



    (async () => {
        if( await show_confirmation()){
            console.log("accepted");
        }
        else{
            console.log("rejected");
        }

    });
});


const listen_for_click = async() => {
    //! promise logic is locking up the execution before the modal shows
    const clickableParentContainer = Array.from(document.getElementsByClassName('confirmation-options-container'))[0];

    return new Promise(resolve => {
        clickableParentContainer.addEventListener('click', (event) => {
            console.log("event id: ",event.target.id)
            if(event.target.id){
                resolve(true);
            }
            else{
                resolve(false);
            }
        }, {once:true});
    })
}


const show_confirmation = async() => {
    const confirmation = Array.from(document.getElementsByClassName('confirmation'))[0];
    setTimeout(()=>{
        confirmation.classList.add('confirmation-show');
    }, 1000);

    return await listen_for_click();
}

const dismiss_confirmation_functionality = function(){
    const dismissconfirmation = Array.from(document.getElementsByClassName('dismiss'));
    dismissconfirmation.forEach((buttonToDismissconfirmation) => {
        buttonToDismissconfirmation.addEventListener('click', ()=>{
            const confirmation = Array.from(document.getElementsByClassName('confirmation'))[0];
            confirmation.classList.remove('confirmation-show');
        });

    })

}