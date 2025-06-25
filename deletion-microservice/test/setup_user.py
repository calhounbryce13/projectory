from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["Planner-io"]
users = db["user-data"]

users.delete_many({"email": "testuser@example.com"})
users.insert_one({
    "email": "testuser@example.com",
    "password": "test",
    "passKey": 10,
    "current": [{
        "title": "Current Project",
        "goal": "Test goal",
        "tasks": ["Task 1", "Task 2"]
    }],
    "planned": [{
        "title": "Planned Project",
        "goal": "Test goal"
    }],
    "complete": [{
        "title": "Complete Project",
        "goal": "Test goal"
    }]
})
print("✅ Test user created.")