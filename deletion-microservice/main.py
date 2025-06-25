from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
from database import delete_user, delete_project_by_group, delete_subtask_by_index
from fastapi.middleware.cors import CORSMiddleware
# Create the FastAPI application instance
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Request Body Model ===
# This model defines the expected structure of the JSON body for delete requests.
# It uses Field aliases to match the teammate's request format (e.g., "project-type" instead of "project_type").
class DeletionRequest(BaseModel):
    project_type: Optional[str] = Field(default=None, alias="project-type") # e.g., "planned", "current", or "complete"
    project_name: Optional[str] = Field(default=None, alias="project-name") # name of the project to target
    task_index: Optional[int] = Field(default=None, alias="task-index")     # index of the subtask to delete

# === DELETE Endpoint ===
# This route handles deletion of users, projects, or individual subtasks
@app.delete("/deletion")
async def deletion_handler(request: Request, body: Optional[DeletionRequest] = None):
    print("here")
    # Get user email from the custom header "x-user-email"
    user_email = request.headers.get("x-user-email")
    if not user_email:
        # If the header is missing, reject the request with a 400 error
        raise HTTPException(status_code=400, detail="Missing user email")

    # === CASE 1: Delete the user ===
    # If the body is empty (None or all fields are None), delete the user account
    if body is None or (not body.project_type and not body.project_name and body.task_index is None):
        # Attempt to delete the user by email
        # If the user email is not found, return a 404 error
        if not delete_user(user_email):
            raise HTTPException(status_code=404, detail="User not found")
        # If deletion is successful, return a success message
        return {"status": "success", "message": f"User {user_email} has been deleted"}

    # === CASE 2: Delete a subtask from a specific project ===
    # If task_index is provided, delete the specified subtask
    if body.task_index is not None:
        # Ensure project_type and project_name are provided for subtask deletion
        if not body.project_type or not body.project_name:
            # If project type or name is missing, reject the request with a 400 error
            raise HTTPException(status_code=400, detail="Missing project type or name for subtask deletion")
        # Attempt to delete the subtask by index
        # If the subtask is not found, return a 404 error
        if not delete_subtask_by_index(user_email, body.project_type, body.project_name, body.task_index):
            raise HTTPException(status_code=404, detail="Subtask not found")
        # If deletion is successful, return a success message
        return {"status": "success", "message": f"Task at index {body.task_index} deleted from {body.project_name}"}

    # === CASE 3: Delete an entire project from a category ===
    # If project_type and project_name are provided, delete the specified project
    if body.project_type and body.project_name:
        # Attempt to delete the project by group and name
        # If the project is not found, return a 404 error
        if not delete_project_by_group(user_email, body.project_type, body.project_name):
            raise HTTPException(status_code=404, detail="Project not found")
        # If deletion is successful, return a success message
        return {"status": "success", "message": f"Project '{body.project_name}' deleted from {body.project_type}"}

    # If none of the conditions are met, raise a 400 error for invalid deletion request
    raise HTTPException(status_code=400, detail="Invalid deletion request")