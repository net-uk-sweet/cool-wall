define([
  "app",

  // Libs
  "backbone",

  // Plugins
  "grid",
  "jqueryui" // augments jquery so no need to reference directly
],

function(App, Backbone, grid) {
  
  var Views = {};

  // -----------------------------------------------------
  // The root view of the wall route
  // -----------------------------------------------------

  Views.RootView = Backbone.Marionette.Layout.extend({ 

    template: 'layouts/wall',
    
    regions: {
      wall: '#wall',
      menu: '#menu',
      buttons: '#buttons'
    },

    events: {
      // Catch bubbled events from child button view
      "click input[type=submit]" : "submitHandler",
      "click input[type=reset]" : "resetHandler"
    },

    initialize: function() {
      this.collection = this.model.get('items');
    },

    onShow: function() {
      // Create the form view
      this.wall.show(
        new Views.CanvasView({
          model: this.model,
          collection: this.collection
        })
      );
      // Create the menu view
      this.menu.show(
        new Views.MenuView({
          collection: this.collection
        })
      );
      // Create the buttons view
      this.buttons.show(
        new Views.ButtonView({
          collection: this.collection
        })
      );
    },

    // Actually, this button should probably have its own view
    submitHandler: function(e) {
      // console.log("FormView.submitHandler", App);
      // Let the App handle the submission
      App.vent.trigger("wall:submit", this.model); 
    }, 

    resetHandler: function(e) {
      this.collection.purge();
    }
  });

  // -----------------------------------------------------
  // The drag target where all the action happens (droppable)
  // -----------------------------------------------------

  Views.CanvasView = Backbone.Marionette.ItemView.extend({

    className: "target",

    template: "wall/wallView",

    events: {
      "drop": "itemDropHandler"
    },

    // Short-hand method of binding to collection and model events which is 
    // apparently supported by Marionette. Doesn't appear to work here.

    // collectionEvents: {
    //   "change:point": "validate"
    // },

    initialize: function() {
     // Model contains this view's collection
     this.collection = this.model.get('items');

     // bindTo is preferred over on and allows close method to clean up listeners
     this.bindTo(this.collection, "change:point", this.validate);
    }, 

    itemDropHandler: function(e, ui) {

      // Retrieve the model associated with the droppable item by guid.
      // Remember when using underscore directly to pass array, ie. use
      // this.collection.models rather than collection.
      var model = this.collection.find(function(m) { 
        return m.get('id') === ui.draggable.attr('id');
      });

      // console.log("WallView.dropHandler: ", model);

      // Update the model with the droppable item's position
      // relative to the canvas (droppable) element
      var offset = this.$el.offset();

      model.set('point', {
        left: ui.offset.left - offset.left, 
        top: ui.offset.top - offset.top
      });
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

      this.$el.droppable({
        activeClass: 'ui-state-active',
        tolerance: 'fit'
      });

      if (Modernizr.canvas) {
        grid.draw(this.$el.find('canvas')[0]);
      } // cld handle fallback in html
    }
  });

  // -----------------------------------------------------
  // Menu item (draggable) 
  // -----------------------------------------------------

  Views.WallItem = Backbone.Marionette.ItemView.extend({

    tagName: "li",
    template: "wall/itemView",

    initialize: function() {
      // console.log("ItemView.initialize");
      this.model.bind('change:point', this.pointChangeHandler, this);
    },

    onRender: function() {  

      this.model.set({ start: this.$el.position() }, { silent: true });

      this.$el.draggable({ 
        revert: 'invalid',
        snap: '.ui-droppable',
        stack: 'li',
        cursorAt: {top: 50, left:50}
      })
      .attr({ id: this.model.id }); // Store model id for look up on drop
    },

    pointChangeHandler: function() {
      // console.log("ItemView.pointChangeHandler:", this.model.get('point'));
      // If the point has been reset we reset the element
      if (!this.model.has('point')) {
        var start = this.model.get('start');
        // console.log("ItemView.pointChangeHandler:", start);
        this.$el.css({ top: start.top, left: start.left });
      } 
    }
  });

  Views.MenuView = Backbone.Marionette.CollectionView.extend({
    /*template: "wall/stats",*/

    // May want a template when / if we add controls for the menu.
    // Presently, we're just injecting a bunch of items into a list 
    tagName: "ul",
    itemView: Views.WallItem
  });

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
        this.showButton(this.$submitButton, this.collection.isValid());
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
