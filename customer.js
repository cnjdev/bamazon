var db = require('./connect.js');
var inquirer = require('inquirer');
require('console.table');

db.connect(listProducts);

function listProducts(){
	var sql = "SELECT id, name, price FROM products ORDER BY id";

	db.link.query(sql, function(err, res) {
		console.log("Products for sale:");
		console.log("--------------------");

		var productTable = [['id', 'name', 'price']];
		// get each product for sale
		res.forEach(function(product){
			productTable.push([
				"#" + product.id, product.name, "$" + product.price
			]);
		});
		console.table(productTable[0], productTable.slice(1));

		getOrder();
  });	
}

function getOrder(){
	// prompt for item to buy and # units
  inquirer.prompt([{
    name: "itemId",
    type: "input",
    message: "Enter ID of product you want to buy:",
    validate: function(value) {
    	return !Number.isInteger(value);
    }
  }, {
  	name: "units",
  	type: "input",
  	message: "Enter # of units you want to buy:",
  	validate: function(value) {
  		return !Number.isInteger(value);
  	}
  }])
	.then(function(answer) {
		var sql = 
			"SELECT id, name, dept_id, cost, price, stock " +
			"FROM products " +
			"WHERE ?";

		db.link.query(sql, { id: answer.itemId }, function(err, res) {
	    if (err) throw err;

	    if (res.length == 0){
	    	console.log("Item not found.");
	    	db.disconnect();
	    } else {
	    	var item = res[0];
	    	if (item.stock < answer.units){
	    		console.log("Insufficient quantity.");
	    		db.disconnect();
	    	} else {
	    		fillOrder(item, answer.units);
	    	}
	    }
	  
	  }); // end query
	}); // end inquire.then
		
}

function fillOrder(item, units){
	var updateProduct = 
		"UPDATE products " +
		"SET stock = stock - ? " +
		"WHERE id = ?";

	db.link.query(updateProduct, [units, item.id], function(err, res){
		if (err) throw err;

		// fill the customer's order
		var totalCosts = units * item.cost;
		var totalPrice = units * item.price;

		var updateDept = 
			"UPDATE departments d, products p " +
			"SET d.product_costs = d.product_costs + ?, " +
			"	d.product_sales = d.product_sales + ? " + 
			"WHERE d.id = p.dept_id " +
			" AND p.id = ?";

		db.link.query(updateDept, [totalCosts, totalPrice, item.id], function(err, res){
			if (err) throw err;

			console.log("Order submitted.");
			console.log(" Total: $" + totalPrice);
			console.log("Thank you for your purchase.");

			db.disconnect();
		});
	});
}