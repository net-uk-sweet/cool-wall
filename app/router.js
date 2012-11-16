define([
  // Application.
  "app",

  // Wall module
  "modules/wall"
],

function(app, Wall) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "survey/:id"  : "survey",
      "wall/:id"    : "wall",
      "results/:id" : "results"
    },

    // Store the models here for access
    // surveyModel: null,
    // wallModel: null,

    // http://backbonetutorials.com/what-is-a-router/THREE
    // to extract id from url
    survey: function(id) {

      console.log("Survey route fired", id);

      var surveyModel = new Wall.SurveyModel({ id: id });
      surveyModel.fetch({
        success: function(model, result) {
          // Layout resolution results in a (technically) invalid 
          // element class name of layouts/survey
          app.useLayout("layouts/survey").setViews({
            ".form": new Wall.Views.FormView({
              collection: surveyModel.get('filters')
            })
          }).render();
        }
      });
    },

    wall: function(id) {

      console.log("Wall route fired", id);
      
      // TODO: look into bootstrapping data http://ricostacruz.com/backbone-patterns/#bootstrapping_data

      // One example sets each model / collection as property of the router.
      
      // Seems a good pattern here to fetch data first and then create the two 
      // views which rely on different parts of it. 
      var wallModel = new Wall.WallModel({ id: id });
      wallModel.fetch({
        success: function() {
          var itemList = wallModel.get('items');
          app.useLayout("layouts/main").setViews({
            ".wall": new Wall.Views.WallView({
              model: wallModel,
              // list is a child of the model, but it's convenient to be able 
              // to reference it directly in the view
              collection: itemList 
            }),
            ".menu": new Wall.Views.MenuView({
              collection: itemList
            })
          }).render(); //.done(); // example clears away loader and fade up view with done callback
        }
      });
    },

    results: function(id) {
      console.log("Results route fired", id);
    }
  });

  return Router;
});
