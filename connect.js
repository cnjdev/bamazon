var mysql = require('mysql');

// create connection to db 
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "mysql",
  database: "bamazon"
});

// connect to the mysql server and sql database
function connect(callback){
  connection.connect(function(err) {
    if (err) throw err;

    // run the callback function after the connection is made
    if (callback != null) callback();
  });
}

// disconnect from db server
function disconnect(){
  connection.end();
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  link: connection
};
