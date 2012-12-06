define([
  // Application.
  "app",

  // Libs
  "backbone",

  // Views
  "modules/survey/views"
],

// Map dependencies from above array.
function(App, Backbone, Views) {

  // Create a new module.
  //var Survey = app.module();
  var Survey = {};


  // -------------------------------------------------------------
  // Survey consists of wall id and the filters for this survey
  // -------------------------------------------------------------

  Survey.Model = Backbone.Model.extend({

    parse: function(response) {

      // preprocess filters into a collection before returning response
      response.filters = new Survey.List(response.filters); 

      return response;
    },

    url: function() {
      // Get the data for the survey specified in the accessing URL
      return "http://localhost:8000/api/survey/" + this.id;
    }
  });

  // -------------------------------------------------------------
  // Repository for results to be saved to server
  // -------------------------------------------------------------

  Survey.Result = Backbone.Model.extend({
    url: "http://localhost:8000/api/result"  
  });

  // -------------------------------------------------------------
  // Form 
  // -------------------------------------------------------------

  // NB. order is important here... must define the model before the collection
  Survey.Item = Backbone.Model.extend({});

  Survey.List = Backbone.Collection.extend({ 
    
    model: Survey.Item, 

    isValid: function() {
      // When there are no invalid models left, ie. all of them have 
      // a selected property, the form is valid and can be submitted.
      var valid = this.filter(function(m) {
        return m.has('selected');
      }); 

      return valid.length == this.size();
    },

    selected: function() {
      //var selected = _.filter(this.models, function(m) { return m.get('selected') !== 0; });
      var selectFilter = function(m) { return m.has('selected'); };
      var getSelected = function(m) { return m.get('selected'); };
      
      return this.filter(selectFilter).map(getSelected);
    },

    isChanged: function() {
      // console.log("FilterList.isChanged:", this.where({selected: 0}), this.size());
      return this.where( {selected: null} ).length < this.size();
    },

    // Wanna call this reset, but there's a reset method in Backbone.collection already.
    // Actually, in this case, resetSelected would be more accurate but we may want to 
    // share the button code which calls it, so a generic name is more suitable 
    purge: function() {
      // Reset all selected states
      this.map(function(m) { m.set({ selected: null }); });
    }
  });

  // Attach the Views sub-module into this module.
  Survey.Views = Views;

  // Return the module for AMD compliance.
  return Survey;

});
