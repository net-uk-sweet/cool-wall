define([
  // Application.
  "app",

  // Wall module
  "modules/wall"
],

function(app, Wall) {

  // App has Backbone events mixed in so we can use 
  // it as an event aggregator. 

  // Don't like the placement of the code here, but it works. 
  // If there's time it might be worth considering marionette:
  // https://github.com/marionettejs/backbone.marionette/wiki/Integrate-backbone-boilerplate-and-backbone.marionette
  
  // Another alternative to this approach is a namespaced EventBroker as described is here:
  // http://www.ericfeminella.com/blog/2012/04/18/decoupling-backbone-modules/
  app.bind('survey:submit', function() {
    // console.log("surveySubmit", this.surveyModel);
    var url = 'wall/' + this.surveyModel.get('wallId');
    // we can update URL w/out firing a route by setting second
    // param of navigate method to false (it's false by default)
    this.router.navigate(url, true); 
  })
  .bind('wall:submit', function() {
    var resultModel = new Wall.ResultModel()
      .save({
        filters: app.surveyModel.get('filters'),
        items: app.wallModel.get('items')
      }, 
      {
        success: function(res) {
          console.log("Saved results to server:", res);
        }, 
        error: function(res) {
          console.log("Failed to save results to server:", res);
        }
    });
    // console.log("wall:submit:", resultModel);
  });

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "survey/:id"  : "survey",
      "wall/:id"    : "wall",
      "results/:id" : "results"
    },


    survey: function(id) {

      console.log("Survey route fired", id);

      // App seems a good place to store a reference to our models.
      // since it's also used as our event aggregator
      app.surveyModel = new Wall.SurveyModel({ id: id });
      app.surveyModel.fetch({
        success: function(model, result) {
          // Layout resolution results in a (technically) invalid 
          // element class name of layouts/survey
          app.useLayout("layouts/survey").setViews({
            ".form": new Wall.Views.FormView({
              collection: app.surveyModel.get('filters'),
              vent: app.vent
            })
          }).render();
        }
      });
    },

    wall: function(id) {

      console.log("Wall route fired", id);
      
      // TODO: look into bootstrapping data http://ricostacruz.com/backbone-patterns/#bootstrapping_data

      // Seems a good pattern here to fetch data first and then create the two 
      // views which rely on different parts of it. 
      app.wallModel = new Wall.WallModel();
      app.wallModel.fetch({
        success: function() {
          var itemList = app.wallModel.get('items');
          app.useLayout("layouts/main").setViews({
            ".wall": new Wall.Views.WallView({
              model: app.wallModel,
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
