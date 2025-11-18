'use strict';
import { endpoints } from './endpoints.js';


document.addEventListener("DOMContentLoaded", async() => {
    try{
        const response = await fetch(endpoints.get_nums, {method: 'GET', credentials: 'include'});
        if(response.status == 200){
            const data = await response.json();
            populate_labels(data);
        }
    }catch(error){
        console.log(error);
    }
});



const populate_labels = function(data){
    const plannedButton = document.getElementById('planned');
    const currentButton = document.getElementById('current');
    const completeButton = document.getElementById('complete');
    plannedButton.children[1].children[1].textContent = data[0];
    currentButton.children[1].children[1].textContent = data[1];
    completeButton.children[1].children[1].textContent = data[2];
}