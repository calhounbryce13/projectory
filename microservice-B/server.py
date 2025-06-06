"""
Description: Microservice controller file for Projectory main program, uses another microservice for deletion
Author: Bryce Calhoun
"""


from flask import Flask, request
from flask_cors import CORS
import requests
import model
import json




PORT = 5000
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5500"])


def validate_request(email, title, index, mark):
    if(email is not None and title is not None and index is not None and mark is not None):
        if(isinstance(email, str)):
            if(isinstance(title, str)):
                if(isinstance(index, int)):
                    if(isinstance(mark, int)):
                        return True
    return False


def delete_project_after_completion(userEmail, projectName):
    headers = {
            "Content-Type": "application/json",
            "x-user-email": userEmail
            }
    data = {
            "project-type": "current",
            "project-name": projectName
    }

    try:
        deleteProjectResponse = requests.delete('http://127.0.0.1:8000/deletion', headers=headers, json=data)
        return True
    except Exception:
        return False


@app.route('/task-manager', methods=['POST'])
def call_model_to_mark_task():
    try:
        userEmail, projectTitle, taskIndex, mark = (request.json).values()
    except ValueError:
        return "Error, Invalid request", 400
    
    if(validate_request(userEmail, projectTitle, taskIndex, mark)):
        status = model.mark_project_task(UserEmail=userEmail, projectTitle=projectTitle, taskIndex=taskIndex, mark=mark)
        if(status == False):
            return "Error, Issue communicating with database" ,500
        return "success", 200
        
    return "Error, Invalid request", 400



@app.route('/completed-project-manager', methods=['PUT'])
def call_model_to_complete_project():
    print("endpoint reached")


    userEmail, projectTitle = (request.json).values()

    result = model.mark_project_complete(userEmail=userEmail, projectTitle=projectTitle)
    if(result):
        deleted = delete_project_after_completion(userEmail=userEmail, projectName=projectTitle)
        if(deleted):
            return "success", 200
    return "fail", 500




if __name__ == "__main__":
    app.run(host='127.0.0.1', port=PORT)
