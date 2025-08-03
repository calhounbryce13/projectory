'use strict';


document.addEventListener("DOMContentLoaded", ()=>{

    const toggle_project_resource_height = function(projectResourcesList, i){
        const numChildren = projectResourcesList[i].children.length;
        const newHeight = numChildren * 4;
        if(projectResourcesList[i].style.maxHeight == '0vh'){
            projectResourcesList[i].style.maxHeight = newHeight + 'vh';
        }
        else{
            projectResourcesList[i].style.maxHeight = '0vh';
        }
        
    }
    let expandProjectResourcesButtonList = document.getElementsByClassName('toggle-project-resources');
    if(expandProjectResourcesButtonList){
        expandProjectResourcesButtonList = Array.from(expandProjectResourcesButtonList);
        const projectResourcesList = Array.from(document.getElementsByClassName('project-resources'));
        for(let i = 0; i < expandProjectResourcesButtonList.length; i++){
            expandProjectResourcesButtonList[i].addEventListener('click', ()=>{
                toggle_project_resource_height(projectResourcesList, i);
            });
        }
    }
})