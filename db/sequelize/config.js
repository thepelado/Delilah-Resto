const dbHost = "localhost";
const dbName = "delilah_resto";
const dbPort = "3306";
const dbUser = "root";
const password = "";

const dbPath = `mysql://${dbUser}:${password}@${dbHost}:${dbPort}/`;

module.exports = { dbName, dbPath };
