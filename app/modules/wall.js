define([
  "app",

  // Libs
  "backbone",

  // Views
  "modules/wall/views"
],

function(app, Backbone, Views) {

  // Create a new module
  var Wall = app.module();

  // -------------------------------------------------------------
  // Survey consists of wall id and the filters for this survey
  Wall.SurveyModel = Backbone.Model.extend({

    url: "http://localhost:8000/api/survey/", // + survey id

    parse: function(response) {

      // preprocess filters into a collection before returning response
      response.filters = new Wall.FilterList(response.filters); 

      return response;
    },

    url: function() {
      // Get the data for the survey specified in the accessing URL
      return "http://localhost:8000/api/survey/" + this.id
    }
  });

  // NB. order is important here... must define the model before the list
  Wall.FilterModel = Backbone.Model.extend({});

  Wall.FilterList = Backbone.Collection.extend({ model: Wall.FilterModel });

  // -------------------------------------------------------------
  // Wall Model 
  Wall.WallModel = Backbone.Model.extend({
    
    /*
      guid:String - Unique item id
      title:String - Item title
      src:String - Path to image file
      point:Object - x and y coordinates of item
    */

    parse: function(response) {

      // preprocess items into a collection before returning response
      response.items = new Wall.ItemList(response.items);

      return response;
    }, 

    url: function() {
      return "http://localhost:8000/api/wall/" + this.id
    }
  });

  // Item Model
  Wall.ItemModel = Backbone.Model.extend({
    
    initialize: function() {
      this.on('change', this.output, this);
    },

    output: function() {
      console.log("Model changed: " + this.get("title"));
    }, 

    validate: function(attrs) {

      // Flag out of range item positions
      if (attrs.point.x < 0 || attrs.point.x > 100 || attrs.point.y < 0 || attrs.point.y > 100) {
        throw new Error("Item position out of range");
      }
    } 
  });

  // Item list
  Wall.ItemList = Backbone.Collection.extend({ 

    // Specifying the model type in the collection definition lets Backbone 
    // know what model type to create if you pass raw JSON to the collection
    // instead of a Backbone.Model object.
    model: Wall.ItemModel 
  });

  // Wall Views
  // ----------

  // Attach the Views sub-module into this module.
  Wall.Views = Views;

  // Required, return the module for AMD compliance
  return Wall;

});
