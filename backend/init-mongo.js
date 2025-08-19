db = db.getSiblingDB('formbuilder');

db.createCollection('forms');
db.createCollection('responses');

db.forms.createIndex({ "userId": 1 });
db.forms.createIndex({ "createdAt": -1 });
db.responses.createIndex({ "formId": 1 });
db.responses.createIndex({ "createdAt": -1 });

print('Database initialized successfully');