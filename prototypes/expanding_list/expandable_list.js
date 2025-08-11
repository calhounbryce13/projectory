'use strict';




document.addEventListener('DOMContentLoaded', () => {

    expandable_list_functionality();

});


const get_max_height = function(list){
    let max = 0;
    for(let x = 0; x < list.children.length; x++){
        if(list.children[x].scrollHeight > max){
            max = list.children[x].scrollHeight;
        }
    }
    return max;
}

const expandable_list_functionality = function(){
    const button = Array.from(document.getElementsByTagName('button'))[0];
    button.addEventListener('click', () => {
        const list = Array.from(document.getElementsByTagName('ol'))[0];
        const tallestChild = get_max_height(list);
        const numChildren = Array.from(list.children).length;
        let newHeight = numChildren * tallestChild;
        if(list.style.maxHeight == '10vh'){
            list.style.maxHeight = newHeight + 'vh';
        }
        else{
            list.style.maxHeight = '10vh';
        }
    });
}