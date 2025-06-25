

const host = "https://projectory-main-login-service-d59280e6043c.herokuapp.com/";
const host2 = "https://projectory-hyperlink-service-94d5374366ce.herokuapp.com/";
const host3 = "http://127.0.0.1:8000/";
const host4 = "http://127.0.0.1:5000/";

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
    projectManager: host4 + "completed-project-manager"
}
