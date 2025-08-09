'use strict';


document.addEventListener('DOMContentLoaded', ()=>{


    //* this will show the loading icon after a short delay to
    //* prevent icon from flashing during quick requests
    let animationInstance;
    let loadingIconShown = false;
    const requestDelayTimer = setTimeout(()=>{
        animationInstance = show_loading();
        loadingIconShown = true;
    }, 500);

    //* this will conditionally dismiss the loading icon if it was displayed
    clearTimeout(requestDelayTimer);
    if(loadingIconShown){
        dismiss_loading(animationInstance);
    }


});


const show_loading = function(){
    const animation = document.getElementById('testing-lottie-animation');
    const animationContainer = document.getElementById('lottie-parent');

    animationContainer.style.display = 'flex';
    animation.style.display = 'flex';
    return lottie.loadAnimation({
        container: animation,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'loading_icon.json'
    });

}

const dismiss_loading = function(animationInstance){
    const animation = document.getElementById('testing-lottie-animation');
    const animationContainer = document.getElementById('lottie-parent');
    animation.style.display = 'none';
    animationContainer.style.display = 'none';
    animationInstance.destroy();
}