"""
Description: Microservice model file for Projectory main program, using MongoEngine 
to communicate with the database
Author: Bryce Calhoun
"""

from mongoengine import *
import config



connect(host=config.data['MONGODB_CONNECTION_STRING'])



class Task(EmbeddedDocument):
    meta = {"strict": False}

    task_description = StringField()
    is_complete = IntField()




class Complete(EmbeddedDocument):
    title = StringField()
    goal = StringField()


class Planned(EmbeddedDocument):
    meta = {"strict": False}

    title = StringField()



class Current(EmbeddedDocument):
    meta = {"strict": False}

    title = StringField()
    goal = StringField()
    tasks = ListField(EmbeddedDocumentField(Task))
    is_complete = IntField()


class User(Document):

    meta = {"strict": False, "collection": "user-data"}

    email = StringField()
    current = ListField(EmbeddedDocumentField(Current))
    planned = ListField(EmbeddedDocumentField(Planned))
    complete = ListField(EmbeddedDocumentField(Complete))



def mark_project_complete(userEmail, projectTitle):
    user = User.objects(email=userEmail).first()

    if(user):
        goal = ""
        for currentProject in user.current:
            if(currentProject.title == projectTitle):
                goal = currentProject.goal
                break
        print("abacus")
        user.complete.append(Complete(title=projectTitle, goal=goal))
        user.save()
        return True
    return False

    


def mark_project_task(UserEmail, projectTitle, taskIndex, mark):
    if((mark != 0) and (mark != 1)): return False

    user = User.objects(email=UserEmail).first()
    if(user):
        current_projects_updated = user.current

        for currentProject in current_projects_updated:
            if(currentProject.title) == projectTitle:
                try:
                    currentProject.tasks[taskIndex].is_complete = mark
                    break
                except IndexError:
                    print("\nError: Given task index is out of range!")
                    return False
        
        user.current = current_projects_updated
        user.save()
        return True
    return False
    
