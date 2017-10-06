// validation methods

// validate that the value is an integer
function validateInteger(value) {
  var valid = !isNaN(value) && Number.isInteger(parseFloat(value));
  return valid || 'Please enter an integer.';
}

// validate that the value is a number
function validateDecimal(value) {
  var valid = !isNaN(value);
  return valid || 'Please enter a number.';
}	

module.exports = {
	integer: validateInteger,
	decimal: validateDecimal
};