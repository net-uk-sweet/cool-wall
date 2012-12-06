define([
  "app",

  // Libs
  "backbone"
],

function (App, Backbone) {

  var Views = {};
  
  // -----------------------------------------------------
  // The root view of the survey route
  // -----------------------------------------------------

  Views.RootView = Backbone.Marionette.Layout.extend({

    template: 'layouts/survey',

    regions: {
      form: '#form',
      buttons: '#buttons'
    },

    events: {
      // Catch bubbled events from child button view
      "click input[type=submit]": "submitHandler",
        "click input[type=reset]": "resetHandler"
    },

    initialize: function () {
      this.collection = this.model.get('filters');
    },

    onShow: function () {
      // Create the form view
      this.form.show(
        new Views.FormView({
          collection: this.collection
        })
      );
      // // Create the buttons view
      this.buttons.show(
        new Views.ButtonView({
          collection: this.collection
        })
      );
    },

    submitHandler: function (e) {
      //console.log("FormView.submitHandler", App);
      // Let the App handle the submission
      App.vent.trigger("survey:submit", this.model);
    },

    resetHandler: function (e) {
      this.collection.purge();
    }
  });

  // -----------------------------------------------------
  // Form item view
  // -----------------------------------------------------

  Views.FormItem = Backbone.Marionette.ItemView.extend({

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
      if (!this.model.has('selected')) {
        $('select', this.$el).prop('selectedIndex', 0); 
      }
    }
  });

  // -----------------------------------------------------
  // Form view 
  // -----------------------------------------------------

  Views.FormView = Backbone.Marionette.CollectionView.extend({ 
    itemView: Views.FormItem 
  });

  // -----------------------------------------------------
  // Form view 
  // -----------------------------------------------------

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