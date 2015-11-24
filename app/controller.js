define([
	'backbone',
	'marionette',
	'app',

	// Modules
	'modules/survey',
	'modules/wall',
	'modules/result' 
], 

// Import our three modules.
function(Backbone, Marionette, App, Survey, Wall, Result) { 

	// http://localhost:8000/#survey/1
	function renderSurvey() {
		App.main.currentView.content.show(
			new Survey.Views.RootView({ model: this })
		);
	}
	// http://localhost:8000/#wall/54321
	function renderWall() {
		App.main.currentView.content.show(
			new Wall.Views.RootView({ model: this })
		);
	}

	function renderResult() {
		App.main.currentView.content.show(
			new Result.Views.RootView({ model: this })
		);
	}

	function throwError() {
		throw this;
	}

	return {

		handleSurveyRoute: function(id) {

			// console.log("Controller.handleSurveyRoute:", id, Survey /*, App*/);

			// Create and cache an instance of ResultModel to hold our results
			// Populate it with the id of the survey it relates to
			App.Result = new Survey.Result({ surveyId: id });

			// We fetch the model first and only create the view when the 
			// data is returned and the success callback has been executed. 
			var surveyModel = new Survey.Model({ id: id });
			surveyModel.fetch({
				success: _.bind(renderSurvey, surveyModel),
				error: _.bind(throwError, new Error("Failed to load SurveyModel"))
			});
		},

		handleWallRoute: function(id) {

			//console.log("Controller.handleWallRoute:", id/*, WallModule*/);

			// We fetch the model first and only create the view when the 
			// data is returned and the success callback has been executed. 
			var wallModel = new Wall.Model({ id: id });
			wallModel.fetch({ 
				success: _.bind(renderWall, wallModel), 
				error: _.bind(throwError, new Error("Failed to load WallModel"))
			});
		},

		// Could probably send user to results on completion, maybe with a count of respondents 
		handleResultRoute: function(id) {

			//console.log("Controller.handleResultRoute:", id/*, WallModule */);

			// This is a special franken-model
			var resultModel = new Result.Model({ 
				id: id,
				surveyModel: new Survey.Model(),
				wallModel: new Wall.Model(),
				resultList: new Result.List({ model: Wall.Item }) 
			});

			resultModel.fetch({
				success: _.bind(renderResult, resultModel), 
				error: _.bind(throwError, new Error("Failed to load ResultModel")) // this ain't implemented				
			});
		}
	};
});