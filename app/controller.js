define([
	'backbone',
	'marionette',
	'app',

	// Modules
	'modules/wall' 
], 

// Wall module should probably have its own router and controller 
// to be considered truly modular but global routing works for now. 
function(Backbone, Marionette, App, WallModule) { 

	function renderSurvey() {
		
		var filterList = this.get('filters');

		App.main.currentView.form.show(
			new WallModule.Views.SurveyView({ 
				model: this,
				collection: filterList
			 })
		);

		// More responsibility on the buttons than is probably ideal.
		// Probably button view should be a child of the SurveyView
		// and events allowed to bubble up to parent view. 
		App.main.currentView.buttons.show(
			new WallModule.Views.ButtonView({
				model: this,
				collection: filterList
			})
		);
	}

	function renderWall() {
		// console.log("Controller.renderWall:", App, this);
		var itemList = this.get('items');

		App.main.currentView.wall.show(
			new WallModule.Views.WallView({ model: this })
		);
		App.main.currentView.menu.show(
			new WallModule.Views.MenuView({ collection: this.get('items') })
		);
	}

	function throwError() {
		throw this;
	}

	return {

		handleSurveyRoute: function(id) {

			console.log("Controller.handleSurveyRoute:", id/*, WallModule, App*/);

			// Set up the layout
			App.main.show(App.surveyLayout);

			// Create and cache an instance of ResultModel to hold our results
			App.ResultModel = new WallModule.ResultModel();

			// We fetch the model first and only create the view when the 
			// data is returned and the success callback has been executed. 
			var surveyModel = new WallModule.SurveyModel({ id: id });
			surveyModel.fetch({
				success: _.bind(renderSurvey, surveyModel),
				error: _.bind(throwError, new Error("Failed to load SurveyModel"))
			});
		},

		handleWallRoute: function(id) {

			console.log("Controller.handleWallRoute:", id/*, WallModule*/);

			// Set up the layout
			App.main.show(App.wallLayout);

			// We fetch the model first and only create the view when the 
			// data is returned and the success callback has been executed. 
			var wallModel = new WallModule.WallModel({ id: id });
			wallModel.fetch({ 
				success: _.bind(renderWall, wallModel), 
				error: _.bind(throwError, new Error("Failed to load WallModel"))
			});
		},

		handleResultRoute: function(id) {
			console.log("Controller.handleResultRoute:", id, WallModule);
		}
	};
});