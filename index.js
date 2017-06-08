// Load npm modules
	
	var express = require("express"),
		cors = require("cors"),
		sticky = require("sticky-session"),
		io = require("engine.io");
// Load static helpers

	global.logging = require("./node_app/helpers/logging-helper.js");

// Instantiate Express

	var app = express();

	app.use(cors());

	app.use("/styles", express.static(__dirname + "/styles"));
	app.use("/libs", express.static(__dirname + "/libs"));
	app.use("/app", express.static(__dirname + "/app"));

// Create the http server
	
	var http = require("http").createServer(app);

	sticky.listen(http, 8080);

	var socket = io.attach(http);

// Set up the required controllers

	var pointCloud = require("./node_app/controllers/point-cloud");
	
	app.get("/*", function(req, res, next) {
		if (req.headers.host.match(/^www\./) != null) res.redirect("http://" + req.headers.host.slice(4) + req.url, 301);
		else next();
	});

	app.get("/", function(req,res) { 
		res.sendfile("./views/index.html"); 
	});


// Actions for storing position in load

	socket.on("connection", function (client) {
		logging.debug(__filename, "web sockets", "connected: " + client.id);

		client.send("123456");
		  
	  	client.on("message", function (data) {
			logging.debug(__filename, "web sockets", "package received: " + data);

	  		if (data.trim().length > 0) {
		  		var packageData = null
		  		
		  		try {
		  			packageData = JSON.parse(data);
		  		}
		  		catch (err) {
					logging.error({
						model: __filename,
						action: "web sockets",
						msg: "Error parsing package",
						err: err
					});
		  		}

		  		if ((packageData) && (packageData.action)) {
		  			if (packageData.action.toLowerCase() == "getdata") pointCloud.sendCloudData(packageData.cloudFile, socket.clients[client.id]);
				}
			}
	  	});
	});