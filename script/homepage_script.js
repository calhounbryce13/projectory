'use strict';
import { endpoints } from 'endpoints.js';


document.addEventListener("DOMContentLoaded", async() => {
    try{
        const response = await fetch(endpoints.get_nums, {method: 'GET'});
        if(response.status == 200){
            const data = await response.json();
            console.log(data);
        }
    }catch(error){
        console.log(error);
    }
})