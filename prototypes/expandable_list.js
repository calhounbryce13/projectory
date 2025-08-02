'use strict';




document.addEventListener('DOMContentLoaded', () => {
    const button = Array.from(document.getElementsByTagName('button'))[0];
    console.log(button);
    button.addEventListener('click', () => {
        const list = Array.from(document.getElementsByTagName('ol'))[0];
        const numChildren = Array.from(list.children).length;
        let newHeight = numChildren * 5;
        if(list.style.maxHeight == '10vh'){
            list.style.maxHeight = newHeight + 'vh';
        }
        else{
            list.style.maxHeight = '10vh';
        }
    });
})