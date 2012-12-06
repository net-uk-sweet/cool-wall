define([
  "app",

  // Libs
  "backbone",

  // Plugins
  "grid",

  // Modules
  "modules/survey"
],

// Result uses models from Survey model
function(App, Backbone, grid, Survey) {
  
  var Views = {};

  // -----------------------------------------------------
  // The root view of the result route
  // -----------------------------------------------------

  Views.RootView = Backbone.Marionette.Layout.extend({
    
    template: 'layouts/result',

    regions: {
      wall: '#wall',
      form: '#form',
      buttons: '#buttons'
    },

    events: {
      // Catch bubbled events from child button view
      "click input[type=submit]" : "submitHandler",
      "click input[type=reset]" : "resetHandler"
    },

    initialize: function() {

      this.surveyModel = this.model.get('surveyModel');
      this.wallModel = this.model.get('wallModel');
      this.filterList = this.surveyModel.get('filters');
      this.itemList = this.wallModel.get('items');
    },

    onShow: function() {

      // Create the form view
      this.wall.show(
        new Views.CanvasView({
          model: this.wallModel,
          collection: this.itemList
        })
      );
      // Create the form view
      this.form.show(
        // We can reuse the View from the Survey module here
        new Survey.Views.FormView({
          collection: this.filterList
        })
      );
      // Create the buttons view
      this.buttons.show(
        new Views.ButtonView({
          collection: this.filterList
        })
      );
    },

    submitHandler: function() {
      App.vent.trigger("result:submit", this.model);
    },

    resetHandler: function() {
      this.filterList.purge();
    }
  });

  // -----------------------------------------------------
  // Menu item (draggable) 
  // -----------------------------------------------------

  Views.WallItem = Backbone.Marionette.ItemView.extend({

    tagName: "div",
    template: "wall/itemView",

    initialize: function() {
      // console.log("ItemView.initialize");
      this.model.bind('change:point', this.pointChangeHandler, this);
    },

    onShow: function() {  
      // Set initial position
      var point = this.model.get('point');

      this.$el.css({
        left: point.left,
        top: point.top
      });
    },

    pointChangeHandler: function() {
      // console.log("ItemView.pointChangeHandler:", this.model.get('point'));
      var point = this.model.get('point');
      this.$el.css({ top: point.get('top'), left: point.get('left') }); 
    }
  });

  // -----------------------------------------------------
  // Non-interactive canvas for display of results
  // -----------------------------------------------------

  // Need to position our items :- think this should be a composite view
  // to render the canvas and the items within it

  Views.CanvasView = Backbone.Marionette.CompositeView.extend({

    className: 'target',

    template: 'wall/wallView',

    itemViewContainer: '#items',
    itemView: Views.WallItem, 

    // events: {
    //   "drop": "itemDropHandler"
    // },

    // Short-hand method of binding to collection and model events which is 
    // apparently supported by Marionette. Doesn't appear to work here.

    // collectionEvents: {
    //   "change:point": "validate"
    // },

    initialize: function() {
     // Model contains this view's collection
     this.collection = this.model.get('items');

     // bindTo is preferred over on and allows close method to clean up listeners
     //this.bindTo(this.collection, "change:sele", this.validate);
    }, 

    // Marionette.View specific method called by RegionManager on close
    // to handle the clean-up of the view. 
    // close: function() {
    //   this.remove();
    //   this.unbind();
    // },

    // Marionette.View specific hook for anything which needs access to DOM elements
    // in loaded templates. Analagous to LayoutManager's afterRender method.
    onShow: function() {

      if (Modernizr.canvas) {
        grid.draw(this.$el.find('canvas')[0]);
      } // cld handle fallback in html
    }
  });

  // This view is repeated in all 3 modules. Look at how Marionette extends Backbone.View
  // Alternatively could create a button module to abstract some of the functionality
  Views.ButtonView = Backbone.Marionette.ItemView.extend({

    template: 'wall/buttonView',

    $submitButton: null,
    $resetButton: null,

    initialize: function(options) {

      // Scope on Marionette bindTo seems to be bust in v.1 beta
      // this.bindTo(this.collection, 'change:selected', this.validate);

      // Changes to child form elements update the associated model and 
      // the change is picked up here to prompt validation of collection
      this.collection.on('change', this.validate, this);
    },

    onShow: function() {
      // Cache references to the buttons and hide them
      this.$submitButton = $('input[type=submit]').hide();
      this.$resetButton = $('input[type=reset]').hide();
    },

    validate: function() {
        // console.log("ButtonView.validate:");
        this.showButton(this.$resetButton, this.collection.isChanged());
        this.showButton(this.$submitButton, this.collection.isChanged());
    },

    showButton: function($button, show) {
      if (show) {
        $button.fadeIn('slow');
      } else {
        $button.fadeOut('slow');
      }
    }
  });

  return Views;

});
