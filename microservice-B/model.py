from mongoengine import *


connect(host='mongodb+srv://calhounbryce13:T4113ngr10010137@mycluster1.iv9rj.mongodb.net/Planner-io?retryWrites=true&w=majority&appName=MyCluster1')


# Only fields necessary for this microservice are defined 
class Complete(EmbeddedDocument):
    title = StringField()

class Current(EmbeddedDocument):
    meta = {"strict": False}
    
    title = StringField()
    tasks = ListField(StringField())

class User(Document):
    meta = {"collection": "user-data", "strict": False}

    email = StringField()
    current = ListField(EmbeddedDocumentField(Current))
    complete = ListField(EmbeddedDocumentField(Complete))



def mark_subtask(email, projectTitle, taskIndex, mark):
    for user in User.objects:
        if user.email == email:
            for currentProject in user.current:
                if currentProject.title == projectTitle:
                    for i in range(len(currentProject.tasks)):
                        if i == taskIndex:
                            # this is where i mark the task as completed or not
                            # print(currentProject.tasks[i])


mark_subtask('jetpackguy52@gmail.com', 'Buy a car', 1, 0)