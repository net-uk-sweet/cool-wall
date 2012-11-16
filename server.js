var application_root = __dirname,
	express = require("express"),
	path = require("path");

var app = express();

console.log("Server running on localhost:8000");
// Database
// mongoose.connect('mongodb://localhost/ecomm_database');

// Config
app.configure(function () {
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(application_root)));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Stub REST services
app.get('/api', function (req, res) {
	res.send('cool-wall RESTful API is running');
})
.get('/api/survey/:id', function(req, res) {
	var survey = { 
		id: req.params.id, 
		wallId: "54321", 
		filters: getFilters()
	};
	res.send(survey);
})
.get('/api/wall/:id', function(req, res)          {
	var wall = {
		id: req.params.id,
		title: "My first wall",
		vLabel: {top: "phlegmatic", bottom: "choleric"},
		hLabel: {top: "sanguine", bottom: "melancholy"},
		items: getItems()
	};
	res.send(wall);
})
.get('/api/result/:id', function(req, res) {
	res.send('No results ');
});

// Helper methods to create some test data
function getFilters() {
	var arr = [];
	for (var i = 0; i < 5; i ++) {
		arr.push({
			id: "fId_" + i,
			title: "Filter " + i,
			type: "select", // probably only ever need this type
			options: getOptions(i)
		});
	}
	return arr;
}
function getOptions(filterId) {
	var arr = [];
	for (var i = 0; i < 3; i ++) {
		arr.push({
			id: "oId_" + filterId + "_" + i,
			title: "Option " + i,
			// selected added dynamically by client
			// selected: null
		});
	}
	return arr;
}
function getItems() {
	var arr = [];
	for (var i = 0; i < 5; i ++) 
	{
		arr.push({
			id: "wId_" + i,
			title: "Wall item " + i,
			src: "assets/img/img_" + (i + 1) + ".png",
			// Makes life easier on the client if point is not initially populated
			//point: {x: 0, y: 0} 
		});
	}
	return arr;
}

// Launch server
app.listen(8000); 