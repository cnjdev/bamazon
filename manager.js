var db = require('./connect.js');
var inquirer = require('inquirer');
require('console.table');

var lowStock = 5;

db.connect(listOptions);

function listOptions(){
	inquirer.prompt([{
    name: "option",
    type: "list",
    message: "Choose an operation:",
    choices: [
    	"View Products for Sale",
	    "View Low Inventory",
	    "Add to Inventory",
    	"Add New Product",
    	"Quit"
    ]
	}])
	.then(function(answer) {
		switch (answer.option) {
	    case "View Products for Sale":
	     	return listProducts();

	    case "View Low Inventory":
	      return listLowInventory();

	    case "Add to Inventory":
	    	return addInventory();

	    case "Add New Product":
	    	return addProduct();

	    default:
	      return quit();
	  }

	});
}

function listProducts(){
	var sql = "SELECT id, name, cost, price, stock FROM products ORDER BY id";

	db.link.query(sql, function(err, res) {
		console.log("Products for sale:");
		console.log("--------------------");

		var productTable = [['ID', 'Name', 'Cost', 'Price', 'Quantity']];
		// get each product for sale
		res.forEach(function(product){
			productTable.push([
				product.id, 
				product.name, 
				"$" + product.cost, 
				"$" + product.price,
				product.stock
			]);
		});
		console.table(productTable[0], productTable.slice(1));

		listOptions();
  });	
}

function listLowInventory(){
	var sql = "SELECT id, name FROM products WHERE stock < ? ORDER BY id";

	db.link.query(sql, [lowStock], function(err, res) {
		console.log("Products with low inventory:");
		console.log("(under " + lowStock + " items)");
		console.log("------------------------------");

		var productTable = [['ID', 'Name']];
		// get each product with low inventory
		res.forEach(function(product){
			productTable.push([product.id, product.name]);
		});
		console.table(productTable[0], productTable.slice(1));

		listOptions();
  });	
}

function addInventory(){
	// prompt for item to stock and # units
  inquirer.prompt([{
    name: "itemId",
    type: "input",
    message: "Enter ID of product you want to stock:",
    validate: function(value) {
    	return !Number.isInteger(value);
    }
  }, {
  	name: "units",
  	type: "input",
  	message: "Enter # of units you want to add to stock:",
  	validate: function(value) {
  		return !Number.isInteger(value);
  	}
  }])
	.then(function(answer) {

		var sql = "SELECT id, stock FROM products WHERE ?";
		db.link.query(sql, { id: answer.itemId }, function(err, res) {
	    if (err) throw err;

	    if (res.length == 0){
	    	console.log("Item not found.");
	    	return listOptions();
	    } 

			var updateProduct = 
				"UPDATE products " +
				"SET stock = stock + ? " +
				"WHERE id = ?";

			db.link.query(updateProduct, [answer.units, answer.itemId], function(err, res){
				if (err) throw err;

				if (res.affectedRows == 0){
					console.log("Item not found.");
				} else {
					console.log(answer.units + " units of item #" + answer.itemId + " added to stock.");
				}

				listOptions();
			}); // updateProduct
		}); // check item in stock
	}); // end inquire.then

}

function addProduct(){
	var departments = [];
	var deptIdByName = {};

	// get departments
	var sql = "SELECT id, name FROM departments ORDER BY id";
	db.link.query(sql, function(err, res){

		res.forEach(function(product){
			departments.push(product.name);
			deptIdByName[product.name] = product.id;
		});

		inquirer.prompt([{
	    name: "name",
	    type: "input",
	    message: "Enter name of product you want to add:"
	  }, {
	  	name: "dept",
	  	type: "list",
	  	message: "Select department to add product to:",
	  	choices: departments
	  }, {
	  	name: "units",
	  	type: "input",
	  	message: "Enter # of units you want to add to stock:",
	  	validate: function(value) {
	  		return !Number.isInteger(value);
	  	}
	  }, {
	  	name: "cost",
	  	type: "input",
	  	message: "Enter cost for store to buy item: ",
	  	validate: function(value) {
	  		return !Number.isNaN(value);
	  	}
	  }, {
	  	name: "price",
	  	type: "input",
	  	message: "Enter price to sell item: ",
	  	validate: function(value) {
	  		return !Number.isNaN(value);
	  	}
	  }])
	  .then(function(answer) {
	    db.link.query("INSERT INTO products SET ?",
		    {
		      name: answer.name,
		      dept_id: deptIdByName[answer.dept],
		      stock: answer.units,
		      cost: answer.cost,
		      price: answer.price
		    },
		    function(err, res) {
		      console.log("Item #" + res.insertId + " added to store");
		      listOptions();
		    }
		  ); // insert product
	  }); // inquirer.prompt
	}); // dept query
}

function quit(){
	db.disconnect();
}