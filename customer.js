// required modules
var db = require('./connect.js');
var validate = require('./validate.js');
var inquirer = require('inquirer');
require('console.table');

// connect to db and list products for sale
db.connect(listProducts);

function listProducts(){
	var sql = "SELECT id, name, price FROM products ORDER BY id";

	db.link.query(sql, function(err, res) {
		console.log("Products for sale:");
		console.log("--------------------");

		// for each product for sale, show listing
		var productTable = [['id', 'name', 'price']];
		// get each product for sale
		res.forEach(function(product){
			productTable.push([
				"#" + product.id, product.name, "$" + product.price
			]);
		});
		console.table(productTable[0], productTable.slice(1));

		// ask the customer which item to order
		getOrder();
  });	
}

function getOrder(){
	// prompt for item to buy and # units
  inquirer.prompt([{
    name: "itemId",
    type: "input",
    message: "Enter ID of product you want to buy:",
    validate: validate.integer
  }, {
  	name: "units",
  	type: "input",
  	message: "Enter # of units you want to buy:",
  	validate: validate.integer
  }])
	.then(function(answer) {
		// look for product in inventory before ordering
		var sql = 
			"SELECT id, name, dept_id, cost, price, stock " +
			"FROM products " +
			"WHERE ?";

		db.link.query(sql, { id: answer.itemId }, function(err, res) {
	    if (err) throw err;

	    // product isn't stocked
	    if (res.length == 0){
	    	console.log("Item not found.");
	    	db.disconnect();
	    } 
	    // check if enough stock
	    else {
	    	var item = res[0];
	    	// not enough stock
	    	if (item.stock < answer.units){
	    		console.log("Insufficient quantity.");
	    		db.disconnect();
	    	} 
	    	// continue with order
	    	else {
	    		fillOrder(item, answer.units);
	    	}
	    }
	  
	  }); // end query
	}); // end inquire.then
		
}

function fillOrder(item, units){
	// update the stock of the product
	var updateProduct = 
		"UPDATE products " +
		"SET stock = stock - ? " +
		"WHERE id = ?";

	db.link.query(updateProduct, [units, item.id], function(err, res){
		if (err) throw err;

		// fill the customer's order
		var totalCosts = units * item.cost;
		var totalPrice = units * item.price;

		// add to sales and costs figures for the department
		var updateDept = 
			"UPDATE departments d, products p " +
			"SET d.product_costs = d.product_costs + ?, " +
			"	d.product_sales = d.product_sales + ? " + 
			"WHERE d.id = p.dept_id " +
			" AND p.id = ?";

		db.link.query(updateDept, [totalCosts, totalPrice, item.id], function(err, res){
			if (err) throw err;

			// give customer their total
			console.log("Order submitted.");
			console.log(" Total: $" + totalPrice);
			console.log("Thank you for your purchase.");

			db.disconnect();
		});
	});
}