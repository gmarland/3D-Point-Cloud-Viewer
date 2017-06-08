var fs = require('fs'),
	path = require('path'); 

function buildPoint(line) {
}

exports.sendCloudData = function (cloudFile, connection) {
	if (cloudFile) {
		var cloudFilePath = __dirname + "/../../point_clouds/" + cloudFile + ".pts";
 
		if (fs.existsSync(cloudFilePath)) { 
			var rs = fs.createReadStream(cloudFilePath);

			var buffer = '';

			rs.on('data', function(chunk) {
				var lines = (buffer + chunk).split(/\r?\n/g);
				
				buffer = lines.pop();

				connection.send(JSON.stringify({
					action: "cloudData",
					data: lines.join("\n")
				}));
			});
			
			rs.on('end', function() {
				connection.send(JSON.stringify({
					action: "cloudDataComplete"
				}));
			});
		}
		else {
			logging.error(__filename, "sendCloudData", "Missing file: " + cloudFilePath);
			
			connection.send(JSON.stringify({
				action: "cloudDataMissing"
			}));
		}
	}
	else {
		logging.error(__filename, "sendCloudData", "Missing required parameters");
		
		connection.send(JSON.stringify({
			action: "cloudDataMissing"
		}));
	}
};