define([
  "app",

  // Libs
  "backbone",

  // Views
  "modules/wall/views"
],

function(App, Backbone, Views) {

  // Not 100% clear on how Marionette Modules play with require. 
  // Plus, call to Marionette.Application.module() throws an error 
  // anyway. 

  // var Wall = App.module('WallModule');
  var Wall = {};

  // -------------------------------------------------------------
  // Survey consists of wall id and the filters for this survey
  Wall.SurveyModel = Backbone.Model.extend({

    parse: function(response) {

      // preprocess filters into a collection before returning response
      response.filters = new Wall.FilterList(response.filters); 

      return response;
    },

    url: function() {
      // Get the data for the survey specified in the accessing URL
      return "http://localhost:8000/api/survey/" + this.id;
    }
  });

  // NB. order is important here... must define the model before the list
  Wall.FilterModel = Backbone.Model.extend({});

  Wall.FilterList = Backbone.Collection.extend({ 
    
    model: Wall.FilterModel, 

    isValid: function() {
      // When there are no invalid models left, ie. all of them have 
      // a selected property, the form is valid and can be submitted.
      var invalid = this.find(function(m) {
        return m.get('selected') == 0;
      }); 

      return !invalid;
    },

    isChanged: function() {
      // console.log("FilterList.isChanged:", this.where({selected: 0}), this.size());
      return this.where({selected: 0}).length < this.size();
    },

    // Wanna call this reset, but there's a reset method in Backbone.collection already.
    // Actually, in this case, resetSelected would be more accurate but we may want to 
    // share the button code which calls it, so a generic name is more suitable 
    purge: function() {
      // Rest all selected states
      _.map(this.models, function(m) { m.set({ selected: 0 }) });
    }
  });

  // -------------------------------------------------------------
  // Wall Model 
  Wall.WallModel = Backbone.Model.extend({
    
    parse: function(response) {

      // preprocess items into a collection before returning response
      response.items = new Wall.ItemList(response.items);

      return response;
    }, 

    url: function() {
      return "http://localhost:8000/api/wall/" + this.id;
    }
  });

  // Item Model
  Wall.ItemModel = Backbone.Model.extend({
    
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
    model: Wall.ItemModel,

    isValid: function() {
      // When there are no invalid models left, ie. all of them have 
      // a selected property, the form is valid and can be submitted.
      var invalid = this.find(function(m) {
        return m.get('point') === undefined;
      });   

      return !invalid;   
    } 
  });

  // -------------------------------------------------------------
  // ResultModel model
  Wall.ResultModel = Backbone.Model.extend({
    url: "http://localhost:8000/api/result/"
  });

  // Attach the Views sub-module into this module.
  Wall.Views = Views;

  // Required, return the module for AMD compliance
  return Wall;

});
