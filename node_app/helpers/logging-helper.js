function writeMessage(filename, method, message, ex) {
	var totalMessage = message + ": " + filename + ": " + method;

	if (ex) totalMessage += ": " + ex.toString();

	return totalMessage;
}

exports.error = function(filename, method, message, ex) {
	console.log("ERROR: " + writeMessage(filename, method, message, ex));
};

exports.info = function(filename, method, message, ex) {
	console.log("INFO: " + writeMessage(filename, method, message, ex));
};

exports.debug = function(filename, method, message, ex) {
	console.log("DEBUG: " + writeMessage(filename, method, message, ex));
};