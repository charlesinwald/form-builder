// Switch to the formbuilder database
db = db.getSiblingDB("formbuilder");

// Create collections
db.createCollection("forms");
db.createCollection("responses");

// Create indexes
db.forms.createIndex({ userId: 1 });
db.forms.createIndex({ createdAt: -1 });
db.responses.createIndex({ formId: 1 });
db.responses.createIndex({ createdAt: -1 });

// Create a user for the application (optional - you can use root user too)
// This creates a user that can only access the formbuilder database
db.createUser({
  user: "formbuilder_user",
  pwd: "formbuilder_password",
  roles: [{ role: "readWrite", db: "formbuilder" }],
});

print("Database initialized successfully");
