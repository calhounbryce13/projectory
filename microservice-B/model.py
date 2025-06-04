"""
Description: Microservice model file for Projectory main program, using MongoEngine 
to communicate with the database
Author: Bryce Calhoun
"""

from mongoengine import *


connect(host='mongodb+srv://calhounbryce13:T4113ngr10010137@mycluster1.iv9rj.mongodb.net/Planner-io?retryWrites=true&w=majority&appName=MyCluster1')



class Task(EmbeddedDocument):
    meta = {"strict": False}

    task_description = StringField()
    is_complete = IntField()


class Planned(EmbeddedDocument):
    meta = {"strict": False}

    title = StringField()



class Current(EmbeddedDocument):
    meta = {"strict": False}

    title = StringField()
    tasks = ListField(EmbeddedDocumentField(Task))
    is_complete = IntField()


class User(Document):

    meta = {"strict": False, "collection": "user-data"}

    email = StringField()
    current = ListField(EmbeddedDocumentField(Current))
    planned = ListField(EmbeddedDocumentField(Planned))



def mark_project_task(UserEmail, projectTitle, taskIndex, mark):
    if((mark != 0) and (mark != 1)): return

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
                    return 'fail'
        
        user.current = current_projects_updated
        user.save()
        return 'success'
    return 'fail'
    


def main():

    mark_project_task('calhounbryce13@gmail.com', 'to you, from me', 0, 0)





if __name__ == "__main__":
    main()