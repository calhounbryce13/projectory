

const host = "https://projectory-account-services.onrender.com/";
const host2 = "https://projectory-hyperlink-services.onrender.com/";
const host3 = "https://projectory-data-removal-services.onrender.com/";
const host4 = "https://projectory-project-management-services.onrender.com/";

export const endpoints = {
    registration: host + "registration",
    login: host + "login",
    logout: host + "logout",
    projects_view: host + "projects-view",
    planned_projects_generator: host + "planned-projects-generator",
    current_projects_generator: host + "current-projects-generator",
    subtask_generator: host + "subtask-generator",
    user_email: host + "get-user-email",
    link_remover: host2 + "link-remover",
    link_inserter: host2 + "link-inserter",
    deletion: host3 + "deletion",
    loginStatus: host + "login-status",
    taskManager: host4 + "task-manager",
    projectManager: host4 + "completed-project-manager",
    titleUpdate: host4 + "title-update",
    goalUpdate: host4 + "goal-update"

}
