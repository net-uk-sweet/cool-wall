var application_root = __dirname,
	express = require("express"),
	path = require("path");

var app = express();

// TODO: useful if we could combine the Grunt build stuff with this

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
	res.send({ 
		id: req.params.id, 
		/* title: "My survey",*/
		wallId: "54321", 
		filters: getFilters()
	});
})
.get('/api/wall/:id', function(req, res) {
	res.send({
		id: req.params.id,
		title: "My first wall",
		vLabel: {top: "phlegmatic", bottom: "choleric"},
		hLabel: {top: "sanguine", bottom: "melancholic"},
		items: getItems()
	});
})
.get('/api/result/:id', function(req, res) {
	// res.send({
	// 	id: req.params.id,
	// 	// For ease here, we return the full items, but in
	// 	// production we'll only get a list of ids and positions.
	// 	items: getItems(true)
	// });
	//res.send('No results ');
	res.send(getItems(true));
})
.post('/api/result', function(req, res) {
	var result = {
		filters: req.body.filters,
		items: req.body.items
	};
	// Actually, we'd want to strip out just the relevant data for storage
	// Essentially a results and filters list w/ id and value only
	console.log("Results posted:", result);
	res.send(result);
});

// Helper methods to create some test data
function getFilters() {
	var arr = [];
	for (var i = 0; i < 4; i ++) {
		arr.push({
			id: "fId_" + i,
			title: "Filter " + i,
			type: "select", // probably only ever need this type
			selected: 0,
			options: getOptions(i)
		});
	}
	return arr;
}
function getOptions(filterId) {
	var arr = [];
	for (var i = 0; i < 4; i ++) {
		arr.push({
			id: "oId_" + filterId + "_" + i,
			title: "Option " + i
		});
	}
	return arr;
}
function getItems(result) {
	var arr = [];
	var point;
	for (var i = 0; i < 4; i ++) {
		point = result 
			? { x: Math.round(Math.random() * 700), y: Math.round(Math.random() * 400) }
			: null;

		arr.push({
			id: "wId_" + i,
			title: "Wall item " + i,
			src: "assets/img/img_" + (i + 1) + ".png",
			point: point // populated by user
		});
	}
	return arr;
}

// Launch server
app.listen(8000); 