/* Usage:
    1. copy this file
    2. rename to `users.js`
    3. change users data in JSON format
*/

users = [
  {
    username: "admin",
    password: "admin",
    grant: "admin",
  },
  {
    username: "user",
    password: "!Passw0rd123",
    grant: "viewer",
  },
];

exports.Users = users;