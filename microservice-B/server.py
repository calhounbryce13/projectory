"""
Description: Microservice controller file for Projectory main program
Author: Bryce Calhoun
"""


from flask import Flask, request
import model

PORT = 5000
app = Flask(__name__)


def validate_request(email, title, index, mark):
    if(email is not None and title is not None and index is not None and mark is not None):
        if(isinstance(email, str)):
            if(isinstance(title, str)):
                if(isinstance(index, int)):
                    if(isinstance(mark, int)):
                        return True
    return False


@app.route('/task-manager', methods=['POST'])
def call_controller_to_mark_task():
    try:
        userEmail, projectTitle, taskIndex, mark = (request.json).values()
    except ValueError:
        return "Error, Invalid request", 400
    
    if(validate_request(userEmail, projectTitle, taskIndex, mark)):
        status = model.mark_project_task(UserEmail=userEmail, projectTitle=projectTitle, taskIndex=taskIndex, mark=mark)
        if(status == 'fail'):
            return "Error, Issue communicating with database" ,500
        return "success", 200
        
    return "Error, Invalid request", 400



if __name__ == "__main__":
    app.run(host='127.0.0.1', port=PORT)
