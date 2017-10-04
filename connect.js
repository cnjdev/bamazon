var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "mysql",
  database: "bamazon"
});

var connected = false;

// connect to the mysql server and sql database
function connect(callback){
  connection.connect(function(err) {
    if (err) throw err;

    // run the callback function after the connection is made
    connected = true;
    if (callback != null) callback();
  });
}

function disconnect(){
  connection.end();
  connected = false;
}

function isConnected(){
  return connected;
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  isConnected: isConnected,
  link: connection
};
