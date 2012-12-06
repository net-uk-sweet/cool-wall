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
  // Wall Model 
  // -------------------------------------------------------------

  Wall.Model = Backbone.Model.extend({
    
    parse: function(response) {

      // preprocess items into a collection before returning response
      response.items = new Wall.List(response.items);

      return response;
    }, 

    url: function() {
      return "http://localhost:8000/api/wall/" + this.id;
    }
  });

  // Item Model
  Wall.Item = Backbone.Model.extend({
    
    // Broken because we set point to null on reset
    // validate: function(attrs) {

    //   // Flag out of range item positions
    //   if (attrs.point.x < 0 || attrs.point.x > 100 || attrs.point.y < 0 || attrs.point.y > 100) {
    //     throw new Error("Item position out of range");
    //   }
    // } 
  });


  // Item list
  Wall.List = Backbone.Collection.extend({ 

    // Specifying the model type in the collection definition lets Backbone 
    // know what model type to create if you pass raw JSON to the collection
    // instead of a Backbone.Model object.
    model: Wall.Item,

    isValid: function() {
      // When there are no invalid models left, ie. all of them have 
      // a selected property, the form is valid and can be submitted.
      var valid = this.filter(function(m) {
        return m.has('point');
      });   

      console.log(valid);
      return valid.length == this.size();   
    },

    isChanged: function() {
      // console.log("ItemList.isChanged:", this.where({point: null}));
      return this.where( {point: null} ).length < this.size();
    },

    purge: function() {
      // Reset all selected states
      this.map(function(m) { m.set({ point: null }) });
    } 
  });

  // Attach the Views sub-module into this module.
  Wall.Views = Views;

  // Required, return the module for AMD compliance
  return Wall;

});
