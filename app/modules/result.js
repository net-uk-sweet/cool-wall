define([
  "app",

  // Libs
  "backbone",

  // Views
  "modules/result/views"
],

function(App, Backbone, Views) {

  // Not 100% clear on how Marionette Modules play with require. 
  // Plus, call to Marionette.Application.module() throws an error 
  // anyway. 

  // var Wall = App.module('WallModule');
  var Result = {};

  // -------------------------------------------------------------
  // Result list collection 
  // -------------------------------------------------------------

  Result.List = Backbone.Collection.extend({ });

  // -------------------------------------------------------------
  // Result model 
  // -------------------------------------------------------------

  Result.Model = Backbone.Model.extend({

    initialize: function() {

      // Shortcut references to the child models
      this.surveyModel = this.get('surveyModel');
      this.wallModel = this.get('wallModel');
      this.resultList = this.get('resultList');
    },

    // Override default fetch to daisy chain loading of required data
    fetch: function(options) {
      
      // Need to cache success callback so we can call it when we're done
      this.success = options.success;

      this.surveyModel.set({ id: this.id })
        .fetch({ success: _.bind(this.fetchWallModel, this) });      
    },

    fetchWallModel: function() {

      this.wallModel.set({ id: this.surveyModel.get('wallId') })
        .fetch({ success: _.bind(this.fetchResultList, this) });
    },

    fetchResultList: function() {

      var url = "http://localhost:8000/api/result/" + this.surveyModel.get('wallId');
      
      this.resultList.url = url;
      this.resultList.fetch({ success: _.bind(this.parseResultList, this) }); 
    },

    parseResultList: function() {

      var itemList = this.wallModel.get('items');
      var item;
      var point;
      
      // Stick the results (positions) on the wall's item list
      this.resultList.each(function(m) {
          item = itemList.get(m.id); // remember, id is a first class prop in bb model
          item.set({ point: m.get('point') });
      });

      // This will break on subsequent successes
      this.success();
    }
  });

  // Attach the Views sub-module into this module.
  Result.Views = Views;

  // Required, return the module for AMD compliance
  return Result;

});
