-- drop and recreate db
DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

-- switch to db
USE bamazon;

-- id, name, overhead costs, product costs, product sales, keys 
CREATE TABLE departments (
	id int auto_increment not null,
	name varchar(100) not null,
	over_head_costs int not null,
	product_costs decimal(11,2) default 0 not null,
	product_sales decimal(11,2) default 0 not null,
	primary key(id)
);

-- initial 4 departments
INSERT INTO departments
	(name, over_head_costs)
VALUES
	("Electronics", 14000),
	("Clothing", 8000),
	("Pantry", 12000),
	("Books", 5000);

-- id, name, dept. id, unit cost, unit price, stock qty., keys
CREATE TABLE products (
	id int auto_increment not null,
	name varchar(100) not null,
	dept_id int not null,
	cost decimal(5,2) not null,
	price decimal(5,2) not null,
	stock int not null,
	primary key(id),
	foreign key(dept_id) references departments(id)
);

-- initial 10 products
INSERT INTO products
	(name, dept_id, cost, price, stock)
VALUES
	("iPod", 1, 100, 200, 2000),
	("PC", 1, 100, 250, 1000),
	("Socks", 2, .50, 2, 4000),
	("Shirt", 2, 3, 9, 10000),
	("Pants", 2, 7, 20, 2500),
	("Coffee", 3, .50, 2, 12000),
	("Chocolate", 3, .25, 1, 9000),
	("Soda", 3, .15, .75, 18000),
	("Textbook", 4, 8, 64, 1600),
	("Novel", 4, 5, 15, 5000);


