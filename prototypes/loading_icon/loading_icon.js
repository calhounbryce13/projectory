'use strict';


document.addEventListener('DOMContentLoaded', ()=>{

    show_loading();

    setTimeout(()=>{
        console.log("dismissing loading")
        dismiss_loading();
    }, 5000)




});


const show_loading = function(){
    const animation = document.getElementById('testing-lottie-animation');
    const animationContainer = document.getElementById('lottie-parent');

    animationContainer.style.display = 'flex';
    animation.style.display = 'flex';
    lottie.loadAnimation({
        container: document.getElementById('testing-lottie-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'loading_icon.json'
    });

}

const dismiss_loading = function(){
    const animation = document.getElementById('testing-lottie-animation');
    const animationContainer = document.getElementById('lottie-parent');

    animation.style.display = 'none';
    animationContainer.style.display = 'none';
    lottie.loadAnimation({
        container: document.getElementById('testing-lottie-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: 'loading_icon.json'
    });
}