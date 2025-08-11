'use strict';

import {examples} from './test_projects.js';

document.addEventListener("DOMContentLoaded", ()=>{

    build_project_view(examples);

});

const build_parent_container = function(){
    const parent = document.createElement('div');
    parent.classList.add('project-card');
    return parent;
}

const build_title = function(singleProject){
    const projectTitle = document.createElement('p');
    projectTitle.classList.add('project-title');
    projectTitle.textContent = singleProject.title;

    const container = document.createElement('div');
    container.classList.add('project-title-container');
    container.appendChild(projectTitle);

    return container;
}

const build_goal = function(singleProject){
    const projectGoal = document.createElement('p');
    projectGoal.classList.add('project-goal');
    projectGoal.textContent = singleProject.goal;

    const container = document.createElement('div');
    container.classList.add('project-goal-container');
    container.appendChild(projectGoal);

    return container;
}

const build_section_header = function(sectionText, toggleClassName){
    const sectionHeaderText = document.createElement('p');
    sectionHeaderText.classList.add('project-section-text');
    sectionHeaderText.textContent = sectionText;

    const toggleButton = document.createElement('button'); 
    toggleButton.classList.add(toggleClassName);

    const container = document.createElement('div');
    container.classList.add('project-section-header');
    container.appendChild(sectionHeaderText);
    container.appendChild(toggleButton);

    return container;
}

const build_single_resource = function(singleResource, listOfResources){
    const listIndexElement = document.createElement('li');
    listIndexElement.classList.add('project-individual-resource');

    const anchor = document.createElement('a');
    anchor.classList.add('project-resource-link');
    anchor.textContent = singleResource;
    anchor.href = singleResource;
    listIndexElement.appendChild(anchor);
    listOfResources.appendChild(listIndexElement);
}

const build_resources = function(singleProject){
    const listOfResources = document.createElement('ul');
    listOfResources.classList.add('project-resources');
    singleProject.resources.forEach((singleResource) => build_single_resource(singleResource, listOfResources));
    return listOfResources;
}

const build_single_subtask = function(singleSubtask, listOfSteps){
    const listIndexElement = document.createElement('li');
    listIndexElement.classList.add('project-individual-subtask');

    const subtaskText = document.createElement('p');
    subtaskText.classList.add('project-subtask-text');
    subtaskText.textContent = singleSubtask.task_description;

    const checkBox = document.createElement('input');
    checkBox.classList.add('subtask-checkbox');
    checkBox.type = 'checkbox';
    checkBox.name = 'task';
    listIndexElement.appendChild(subtaskText);
    listIndexElement.appendChild(checkBox);
    listOfSteps.appendChild(listIndexElement);

}

const build_subtasks = function(singleProject){
    const listOfSteps = document.createElement('ol');
    listOfSteps.classList.add('project-steps');
    singleProject.steps.forEach((singleSubtask) => build_single_subtask(singleSubtask, listOfSteps));
    return listOfSteps;

}

const build_project_card = function(singleProject, index, array){
    const parent = build_parent_container();
    const title = build_title(singleProject);
    parent.appendChild(title);
    const goal = build_goal(singleProject);
    parent.appendChild(goal);

    if(singleProject.resources){
        if(singleProject.resources.length > 0){
            const sectionHeader = build_section_header('resources','toggle-project-resources');
            parent.appendChild(sectionHeader);
            const resources = build_resources(singleProject);
            parent.appendChild(resources);
        }
    }

    if(singleProject.steps){
        if(singleProject.steps.length > 0){
            const sectionHeader = build_section_header('steps','toggle-project-steps');
            parent.appendChild(sectionHeader);
            const subtaskSection = build_subtasks(singleProject);
            parent.appendChild(subtaskSection);
        }
    }

    Array.from(document.getElementsByClassName('user-projects'))[0].appendChild(parent);
    if(index < array.length - 1){
        //insert_spacer(parentContainer);
    }
}


const build_project_view = function(examples){
    const convertedProjects = Array.from(examples);
    convertedProjects.forEach((singleProject, index, array) => build_project_card(singleProject, index, array));
    //? can possibly attach event listeners here, better for decoupling structure from function

    expanded_list_functionality('toggle-project-resources', 'project-resources');
    expanded_list_functionality('toggle-project-steps', 'project-steps');
    //update_subtask_status_functionality();

    
    /*if(localStorage.getItem('project-type') == 'complete'){
        const addNewContainer = document.getElementById('add-new-container');
        addNewContainer.style.display = 'none';
    }*/

}


const get_max_height = function(list){
    let max = 0;
    for(let x = 0; x < list.children.length; x++){
        if(list.children[x].scrollHeight > max){
            max = list.children[x].scrollHeight;
        }
    }
    return max;
}

const toggle_list_height = function(projectResourcesList, i){
    /* 
    DESCRIPTION: Function defined to re-assign the max height of the given 
                list to expand or contract on click
    INPUT(S): An array of expandable lists from the whole page (array), an index in the list (integer)
    OUTPUT(S): None
    */
    const numChildren = projectResourcesList[i].children.length;
    const heightOfTallestChild = get_max_height(projectResourcesList[i]);
    console.log("height of a single link",heightOfTallestChild);
    const newMaxHeight = (numChildren * heightOfTallestChild) + 10;
    console.log(getComputedStyle(projectResourcesList[i]).maxHeight);
    if(getComputedStyle(projectResourcesList[i]).maxHeight == '0px'){
        projectResourcesList[i].style.maxHeight = newMaxHeight + 'px';
        return;
    }
    projectResourcesList[i].style.maxHeight = '0px';
}

const expanded_list_functionality = function(buttonClassName, containerClassName){
    /* 
    DESCRIPTION: Function defined to access all the expansion buttons on the page and apply event listeners
    INPUT(S): class for toggle button(s) to call event listener on (string), class for the container(s) to expand (string)
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