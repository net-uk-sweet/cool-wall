define([
  "app",

  // Libs
  "backbone",
  "jqueryui" // augments jquery so no need to reference directly
],

function(App, Backbone) {
  
  var Views = {};

  // -----------------------------------------------------
  // Wall view (the main man)
  // -----------------------------------------------------

  Views.WallView = Backbone.Marionette.ItemView.extend({

    template: "wall/wallView",

    events: {
      // No specificity here, may be required later
      "drop": "itemDropHandler",
      "click #submit": "submitClickHandler"
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

    // Marionette.View specific method called by RegionManager on close
    // to handle the clean-up of the view. 
    close: function() {
      this.remove();
      this.unbind();
    },

    // Marionette.View specific hook for anything which needs access to DOM elements
    // in loaded templates. Analagous to LayoutManager's afterRender method.
    onShow: function() {

      $('#submit').hide();

      this.$el.droppable({
        activeClass: "ui-state-active"
      });

      if (Modernizr.canvas) {
        var canvas = $('#grid')[0];
        var ctx = canvas.getContext('2d');

        ctx.strokeStyle = '#000';

        this.drawAxis(canvas, ctx, 10, true);
        this.drawAxis(canvas, ctx, 10, false);
      } // Can we handle Canvas fallback in the HTML?
    },

    drawAxis: function(canvas, ctx, divisions, vertical) {
      for (var i = 1, inc = canvas.width / divisions; i < divisions; i ++) {
        // For nice rendering, canvas lines of uneven widths need offsetting
        point = (i *  inc) - 0.5; 
        // console.log("Vitals", point, inc);
        ctx.lineWidth = (i == (divisions / 2)) ? 2 : 1;
        ctx.beginPath();
        // Some daft boolean logic coming up
        ctx.moveTo(vertical * point, !vertical * point);
        ctx.lineTo(
          vertical * point || canvas.width, 
          !vertical * point || canvas.height
        );
        ctx.stroke();
      }
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
      model.set('point', {
        left: ui.offset.left, 
        top: ui.offset.top
      });
    },

    submitClickHandler: function(e) {
      // Prepare and save ResultsModel to save to server.
      // console.log("WallView.submitClickHandler:", this.collection); 
      App.vent.trigger('wall:submit');
    },

    validate: function() {
      // console.log("WallView.validate: valid: ", invalid.length == 0, invalid);
      if (this.collection.isValid()) {
        $('#submit').fadeIn('slow');
      }     
    }
  });

  // -----------------------------------------------------
  // Item menu views
  // -----------------------------------------------------

  Views.ItemView = Backbone.Marionette.ItemView.extend({

    tagName: "li",
    template: "wall/itemView",

    initialize: function() {
      // console.log("ItemView.initialize");
    },

    onRender: function() {
      // $el is the view element (li) wrapped by jQuery
      // We want the child image to be draggable
      this.$el.find('img').draggable();
    }
  });

  Views.MenuView = Backbone.Marionette.CollectionView.extend({
    /*template: "wall/stats",*/

    // May want a template when / if we add controls for the menu.
    // Presently, we're just injecting a bunch of items into a list 
    tagName: "ul",
    itemView: Views.ItemView,
  });

  // -----------------------------------------------------
  // Survey (form) views
  // -----------------------------------------------------

  Views.FilterItem = Backbone.Marionette.ItemView.extend({

    tagName: "fieldset",

    events: {
      "change select": "elementSelectHandler"
    },

    initialize: function() {
      // Again.. Marionette scope seems to be broken on bindTo
      //this.bindTo(this.model, 'change:selected', this.modelSelectHandler)
      this.model.bind('change:selected', this.modelSelectHandler, this);
    },

    // Choose template according to filter type.
    // In reality, they're all select types for now
    getTemplate: function(){
      return "wall/formElements/" + this.model.get('type');
    },

    elementSelectHandler: function(e) {
      // console.log("FilterItem.selected:", e, this);
      this.model.set('selected', $(e.currentTarget).val());
    }, 

    modelSelectHandler: function(e) {
      // Feels a bit ugly this, but we don't want to react to changes
      // to the model invoked by a change on the view's element. Here
      // we're interested in a change to the collection prompted by 
      // a purge. 
      if (this.model.get('selected') === 0) {
        $('select', this.$el).prop('selectedIndex', 0); 
      }
    }
  });

  Views.SurveyView = Backbone.Marionette.CollectionView.extend({ itemView: Views.FilterItem });

  Views.ButtonView = Backbone.Marionette.ItemView.extend({

    template: 'wall/buttonView',

    $submitButton: null,
    $resetButton: null,

    events: {
      // Specificity not essential here, but would be if 
      // further buttons were added.
      "click input[type=submit]" : "submitClickHandler",
      "click input[type=reset]" : "resetClickHandler"
    },

    initialize: function(options) {

      // Scope on Marionette bindTo seems to be bust in v.1 beta
      // this.bindTo(this.collection, 'change:selected', this.validate);

      // Changes to child form elements update the associated model and 
      // the change is picked up here to prompt validation of collection
      this.collection.on('change:selected', this.validate, this);
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
    },

    // Actually, this button should probably have its own view
    submitClickHandler: function(e) {
      // console.log("FormView.submitClickHandler", e);
      // Let the App handle the submission
      App.vent.trigger("survey:submit", this.model); 
    }, 

    resetClickHandler: function(e) {
      this.collection.purge();
    }
  });

  return Views;

});
