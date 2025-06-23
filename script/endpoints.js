

const host = "https://projectory-main-login-service-d59280e6043c.herokuapp.com/3000/";
const host2 = "http://127.0.0.1:4000/";
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
    link_remover: host2 + "link-remover",
    link_inserter: host2 + "link-inserter",
    deletion: host3 + "deletion",
    loginStatus: host + "login-status",
    taskManager: host4 + "task-manager",
    projectManager: host4 + "completed-project-manager"
}
