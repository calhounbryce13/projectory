'use strict';




document.addEventListener('DOMContentLoaded', () => {

    expandable_list_functionality();

})

const expandable_list_functionality = function(){
    const button = Array.from(document.getElementsByTagName('button'))[0];
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
}