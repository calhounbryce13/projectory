'use strict';
import { endpoints } from './endpoints.js';


document.addEventListener("DOMContentLoaded", async() => {
    get_project_numbers();
});


const get_project_numbers = async () => {
    try{
        const response = await fetch(endpoints.get_nums, {method: 'GET', credentials: 'include'});
        if(response.status == 200){
            const data = await response.json();
            populate_labels(data);
        }
    }catch(error){
        console.log(error);
    }
}



const populate_labels = function(data){
    const plannedButton = document.getElementById('Planned');
    const currentButton = document.getElementById('Current');
    const completeButton = document.getElementById('Complete');
    plannedButton.children[1].children[1].textContent = data[0];
    currentButton.children[1].children[1].textContent = data[1];
    completeButton.children[1].children[1].textContent = data[2];
}