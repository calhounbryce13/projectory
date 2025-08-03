'use strict';


document.addEventListener("DOMContentLoaded", ()=>{

    expanded_list_functionality('toggle-project-resources', 'project-resources');

    expanded_list_functionality('toggle-project-steps', 'project-steps');

});



const toggle_list_height = function(projectResourcesList, i){
    /* 
    DESCRIPTION: Function defined to re-assign the max height of the given 
                list to expand or contract on click
    INPUT(S): A list of project resource sets (array), and index in the list (integer)
    OUTPUT(S): None
    */
    const numChildren = projectResourcesList[i].children.length;
    const heightOfSingleLink = projectResourcesList[i].children[0].children[0].getBoundingClientRect().height;
    const newMaxHeight = (numChildren * heightOfSingleLink) + 10;
    console.log(getComputedStyle(projectResourcesList[i]).maxHeight)
    if(getComputedStyle(projectResourcesList[i]).maxHeight == '0px'){
        projectResourcesList[i].style.maxHeight = newMaxHeight + 'px';
        return;
    }
    projectResourcesList[i].style.maxHeight = '0px';
}

const expanded_list_functionality = function(buttonClassName, containerClassName){
    /* 
    DESCRIPTION: Function defined to access all the expansion buttons on the page and apply event listeners
    INPUT(S): None
    OUTPUT(S): None
    */
    let expandProjectButtonList = document.getElementsByClassName(buttonClassName);
    if(expandProjectButtonList){
        expandProjectButtonList = Array.from(expandProjectButtonList);
        const projectList = Array.from(document.getElementsByClassName(containerClassName));
        for(let i = 0; i < expandProjectButtonList.length; i++){
            expandProjectButtonList[i].addEventListener('click', ()=>{
                toggle_list_height(projectList, i);
            });
        }
    }

}