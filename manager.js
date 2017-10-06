// required modules
var db = require('./connect.js');
var validate = require('./validate.js');
var inquirer = require('inquirer');
require('console.table');

// threshold for determining low inventory
var lowStock = 5;

// connect to db and show manager operations
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
		// depending on which operation was chosen, do that
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
	// list products for sale, including product info and what dept product is in
	var sql = 
		"SELECT p.id, p.name, d.name dept_name, p.cost, p.price, p.stock " +
		"FROM products p INNER JOIN departments d" +
		" ON p.dept_id = d.id " + 
		"ORDER BY p.id";

	db.link.query(sql, function(err, res) {
		console.log("Products for sale:");
		console.log("--------------------");

		var productTable = [['ID', 'Name', 'Dept.', 'Cost', 'Price', 'Quantity']];
		// get each product for sale and display its info
		res.forEach(function(product){
			productTable.push([
				product.id, 
				product.name, 
				product.dept_name,
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
	// check which items have less than the threshold
	var sql = "SELECT id, name FROM products WHERE stock < ? ORDER BY id";

	db.link.query(sql, [lowStock], function(err, res) {
		console.log("Products with low inventory:");
		console.log("(under " + lowStock + " items)");
		console.log("------------------------------");

		var productTable = [['ID', 'Name']];
		// get each product with low inventory and show its name and ID
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
    validate: validate.integer
  }, {
  	name: "units",
  	type: "input",
  	message: "Enter # of units you want to add to stock:",
  	validate: validate.integer
  }])
	.then(function(answer) {

		// make sure item is stocked before adding to stock
		var sql = "SELECT id, stock FROM products WHERE ?";
		db.link.query(sql, { id: answer.itemId }, function(err, res) {
	    if (err) throw err;

	    // item not stocked
	    if (res.length == 0){
	    	console.log("Item not found.");
	    	return listOptions();
	    } 

	    // add to product's stock
			var updateProduct = 
				"UPDATE products " +
				"SET stock = stock + ? " +
				"WHERE id = ?";

			db.link.query(updateProduct, [answer.units, answer.itemId], function(err, res){
				if (err) throw err;

				if (res.affectedRows == 0){
					console.log("Item not found.");
				} 
				// units stocked
				else {
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

	// get departments that product can be placed in
	var sql = "SELECT id, name FROM departments ORDER BY id";
	db.link.query(sql, function(err, res){

		// map dept name to dept ID
		res.forEach(function(product){
			departments.push(product.name);
			deptIdByName[product.name] = product.id;
		});

		// ask user info about new product
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
	  	validate: validate.integer
	  }, {
	  	name: "cost",
	  	type: "input",
	  	message: "Enter cost for store to buy item: ",
	  	validate: validate.decimal
	  }, {
	  	name: "price",
	  	type: "input",
	  	message: "Enter price to sell item: ",
	  	validate: validate.decimal
	  }])
	  .then(function(answer) {
	  	// insert new product into inventory
	    db.link.query("INSERT INTO products SET ?",
		    {
		      name: answer.name,
		      dept_id: deptIdByName[answer.dept],
		      stock: answer.units,
		      cost: answer.cost,
		      price: answer.price
		    },
		    function(err, res) {
		    	if (err) throw err;

		    	// successfully added new item
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