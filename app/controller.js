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
		App.main.currentView.content.show(
			new WallModule.Views.SurveyView({ model: this })
		);
	}

	function renderWall() {
		App.main.currentView.content.show(
			new WallModule.Views.WallView({ model: this })
		);
	}

	function renderResult() {
		App.main.currentView.content.show(
			new WallModule.Views.ResultView({ model: this })
		);
	}

	function throwError() {
		throw this;
	}

	return {

		handleSurveyRoute: function(id) {

			console.log("Controller.handleSurveyRoute:", id/*, WallModule, App*/);

			// Create and cache an instance of ResultModel to hold our results
			// Populate it with the id of the survey it relates to
			App.SaveResultModel = new WallModule.SaveResultModel({ surveyId: id });

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

			// We fetch the model first and only create the view when the 
			// data is returned and the success callback has been executed. 
			var wallModel = new WallModule.WallModel({ id: id });
			wallModel.fetch({ 
				success: _.bind(renderWall, wallModel), 
				error: _.bind(throwError, new Error("Failed to load WallModel"))
			});
		},

		// could probably send user to results on completion
		// maybe with a count of respondents 
		handleResultRoute: function(id) {

			console.log("Controller.handleResultRoute:", id/*, WallModule */);

			var resultModel = new WallModule.ResultModel({ id: id })
			resultModel.fetch({
				success: _.bind(renderResult, resultModel), 
				error: _.bind(throwError, new Error("Failed to load ResultModel"))					
			});
		}
	};
});