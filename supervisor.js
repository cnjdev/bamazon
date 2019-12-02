// required modules
var db = require('./connect.js');
var validate = require('./validate.js');
var inquirer = require('inquirer');
require('console.table');

// connect to db and show supervisor operations
db.connect(listOptions);

function listOptions(){
	inquirer.prompt([{
    name: "option",
    type: "list",
    message: "Choose an operation:",
    choices: [
      "View Product Sales by Department",
		  "Create New Department",
    	"Quit"
    ]
	}])
	.then(function(answer) {
		// depending on which operation was chosen, do that
		switch (answer.option) {

      case "View Product Sales by Department":
      	return viewProductSales();

		  case "Create New Department":
		  	return addDepartment();
	  
	    default:
	      return quit();
	  }
	});
}

function viewProductSales(){
	// show product sales by department
	var sql = 
		"SELECT id, name, over_head_costs, product_costs, product_sales, " +
		" (product_sales - product_costs - over_head_costs) total_profits " +
		"FROM departments ORDER BY id";

	db.link.query(sql, function(err, res) {
		console.log("Store Departments:");
		console.log("--------------------");

		let overHeadCosts = 0;
		let productCosts = 0;
		let productSales = 0;
		let totalProfits = 0;
		
		// columns for table
		var deptTable = [ ['ID', 'Name', 'Overhead Costs', 'Product Costs', 'Product Sales', 'Total Profits'] ];
		
		// for each dept show its report
		res.forEach(function(dept){
			deptTable.push([
				dept.id, 
				dept.name, 
				"$" + dept.over_head_costs,
				"$" + dept.product_costs,
				"$" + dept.product_sales, 
				"$" + dept.total_profits
			]);

			// add to totals
			overHeadCosts += dept.over_head_costs;
			productCosts += dept.product_costs;
			productSales += dept.product_sales;
			totalProfits += dept.total_profits;
		});

		// add row of totals
		deptTable.push(['', '', '', '', '', '']);
		deptTable.push(['', 
			'Total', 
			"$" + overHeadCosts, 
			"$" + productCosts, 
			"$" + productSales, 
			"$" + totalProfits
		]);

		console.table(deptTable[0], deptTable.slice(1));

		listOptions();
  });	
}

function addDepartment(){
	// prompt for info for new dept
	inquirer.prompt([{
    name: "name",
    type: "input",
    message: "Enter name of department you want to add:"
  }, {
  	name: "costs",
  	type: "input",
  	message: "Enter overhead costs for department:",
  	validate: validate.integer
  }])
  .then(function(answer) {
  	// insert new department
    db.link.query("INSERT INTO departments SET ?",
	    {
	      name: answer.name,
	      over_head_costs: answer.costs
	    },
	    function(err, res) {
	    	if (err) throw err;

	    	// department created
	      console.log("Department #" + res.insertId + " added to store");
	      
	      listOptions();
	    }
	  ); // insert department
  }); // inquirer.prompt
}

function quit(){
	db.disconnect();
}