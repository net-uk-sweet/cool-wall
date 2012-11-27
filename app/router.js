define([

  "backbone",
  "marionette",
  "controller"

],

function(Backbone, Marionette, controller) {

  "use strict";

  var AppRouter = Backbone.Marionette.AppRouter.extend({

    appRoutes: {
      "survey/:id"  : "handleSurveyRoute",
      "wall/:id"    : "handleWallRoute",
      "result/:id" : "handleResultRoute"
    }

  });

  return new AppRouter({ controller: controller });
});