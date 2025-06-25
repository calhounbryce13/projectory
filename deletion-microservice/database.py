from pymongo import MongoClient

# === CONFIGURATION ===

# MongoDB URI for local development (default: localhost:27017, no authentication)
MONGO_URI = "mongodb+srv://calhounbryce13:T4113ngr10010137@mycluster1.iv9rj.mongodb.net/Planner-io?retryWrites=true&w=majority&appName=MyCluster1"

# Database and collection
DATABASE_NAME = "Planner-io"
USER_COLLECTION = "user-data"

# === CONNECTION SETUP ===

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
users = db[USER_COLLECTION]

# === DELETE FUNCTIONS ===

def delete_user(email):
    """
    Deletes a user document by email (used as session identity).
    """
    try:
        result = users.delete_one({"email": email})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error deleting user: {e}")
        return False


def delete_project_by_group(email, group, project_title):
    """
    Deletes a project from a specific project group 
    (e.g., 'planned', 'current', or 'complete').

    Parameters:
    - email (str): User's email from session
    - group (str): One of 'current', 'planned', or 'complete'
    - project_title (str): Title of the project to remove
    """
    if group not in ["current", "planned", "complete"]:
        return False
    try:
        result = users.update_one(
            {"email": email},
            {
                "$pull": {
                    group: {"title": project_title}
                }
            }
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error deleting project: {e}")
        return False


def delete_subtask_by_index(email, group, project_title, task_index):
    """
    Deletes a subtask at a specific index from the given project in the user's project list.

    Parameters:
    - email (str): User's email from session
    - group (str): The project group (e.g., 'current')
    - project_title (str): The title of the project
    - task_index (int): Index of the task in the 'tasks' array
    """
    try:
        # Find the user
        user = users.find_one({"email": email})
        if not user:
            return False

        projects = user.get(group, [])
        for project in projects:
            if project.get("title") == project_title:
                tasks = project.get("tasks", [])
                if 0 <= task_index < len(tasks):
                    tasks.pop(task_index)
                    break
                else:
                    return False

        result = users.update_one(
            {"email": email},
            {"$set": {f"{group}": projects}}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error deleting subtask: {e}")
        return False
