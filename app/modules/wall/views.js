define([
  "app",

  // Libs
  "backbone"
],

function(app, Backbone) {
  
  var Views = {};

  // Wallview (wall and result)
  Views.WallView = Backbone.View.extend({

    // This is actually an instance of LayoutView but we have 
    // Backbone.LayoutManager.manage set to true in configuration
    // section of app.js which allows LayoutManager to globally 
    // augment the standard Backbone view.


    // This is the flag which tells LayoutManager it needs to do 
    // something in the render method, otherwise it assumes rendering
    // will be done manually. This could also be a jQuery selector
    // pointing to an element in a script tag with an unrecognised 
    // type attribute.
    template: "wall/wallView",

    events: {
      // No specificity here, may be required later
      "drop": "itemDropHandler",
      "click #submit": "submitClickHandler"
    },

    initialize: function() {
      // console.log("WallView.initialize()", this.model);
      // Namespace allows us to define the particular property we're interested in
      this.collection.on('change:point', this.validate, this);
    }, 

    // Render (plus before and after) events of all views are being fired
    // twice (LayoutManager plug-in is the suspect).
    // Wasted enough time trying to solve it so ignoring it for now. 
    beforeRender: function() {
      // console.log("WallView.beforeRender");
    },

    // Need to wait until afterRender to make $el droppable, presumably
    // because in initialize the element has not been added to DOM yet. 
    afterRender: function() {

      $('#submit').hide();

      this.$el.droppable({
        activeClass: "ui-state-active"
      });
    },

    itemDropHandler: function(e, ui) {

      // Retrieve the model associated with the droppable item by guid.
      // Remember when using underscore directly to pass array, ie. use
      // this.collection.models rather than collection.
      var model = this.collection.find(function(m) { 
        return m.get('id') === ui.draggable.attr('id');
      });

      //console.log("WallView.dropHandler: ", guid, model);

      // Update the model with the droppable item's position
      model.set('point', {
        left: ui.offset.left, 
        top: ui.offset.top
      });
    },

    submitClickHandler: function(e) {
      // Prepare and save ResultsModel to save to server.
      //console.log("WallView.submitClickHandler:", this.collection); 
      app.trigger('wall:submit');
    },

    validate: function() {
       // When there are no invalid models left, ie. all of them have 
      // a selected property, the form is valid and can be submitted.
      var invalid = this.collection.find(function(m) {
        return m.get('point') === undefined;
      });

      // console.log("WallView.validate: valid: ", invalid.length == 0, invalid);
      if (!invalid) {
        $('#submit').fadeIn('slow');
      }     
    },

    // Need to serialize our model data for the template
    serialize: function() {
      // Pass the whole model, template will render only what it needs.
      // Wonder if it might make sense to do this by default in the base 
      // class since most times, at least in the case of this project, 
      // no further processing is required. 
      return this.model.toJSON();
    },
  });


  // MenuView (wall)
  // ----------
  Views.MenuView = Backbone.View.extend({
    /*template: "wall/stats",*/

    // May want a template when / if we add controls for the menu.
    // Presently, we're just injecting a bunch of items into a list 

    tagName: "ul",

    first: true,

    initialize: function() {
      // console.log("MenuView.initialize()", this.collection);
    }, 

    beforeRender: function() {

      // Hack to prevent problems resulting from 
      // initial multiple beforeRender calls      
      if (this.first) {
        this.first = false;
        return;
      }

      // Create an item view for each model in collection
      this.collection.each(this.renderItem, this);
    },

    renderItem: function(itemModel) {
      // console.log("MenuView.renderItem", itemModel);
      this.insertView(new Views.ItemView({
        model: itemModel        
      }));
    }
  });

  Views.ItemView = Backbone.View.extend({

    tagName: "li",
    template: "wall/itemView",

    initialize: function() {
      // console.log("ItemView.initialize");
    },

    afterRender: function() {
      // $el is the view element (li) wrapped by jQuery
      // We want the child image to be draggable
      this.$el.find('img').draggable();
    },

    serialize: function() {
      return this.model.toJSON();
    }
  });


  Views.FormView = Backbone.View.extend({

    template: "wall/formView",
    //tagName: "form",

    // Using form element here causes form data to be posted on route change
    tagName: "div", // Superfluous div!

    first: true,

    events: {
      // Specificity not essential here, but would be if 
      // further buttons were added.
      "click button#submit" : "submitClickHandler"
    },

    initialize: function(options) {
      // Changes to child form elements update the associated model and 
      // the change is picked up here to prompt validation of collection
      this.collection.on('change:selected', this.validate, this);
    },

    beforeRender: function() {

      // Hack to prevent problems resulting from 
      // initial multiple beforeRender calls      
      if (this.first) {
        this.first = false;
        return;
      }

      this.collection.each(this.renderItem, this);
    },

    renderItem: function(filterModel) {
      //console.log("FormView.renderItem", filterModel);

      this.insertView(new Views.FormItem({
        model: filterModel,
        // Pick the template according to filter type. In reality, for ease,
        // we're only testing for select which could conceivably be used for 
        // any filter. 
        template: "wall/formElements/" + filterModel.get('type')
      }));
    },

    afterRender: function() {
      $("#submit").hide();
    },

    validate: function() {

      // When there are no invalid models left, ie. all of them have 
      // a selected property, the form is valid and can be submitted.
      var invalid = this.collection.find(function(m) {
        return m.get('selected') === undefined;
      }); 

      if (!invalid) {
        $('#submit').fadeIn('slow');
      }
    },

    // Actually, this button should probably have its own view
    submitClickHandler: function(e) {
      // console.log("FormView.submitClickHandler", e);

      // In this instance, it seems better practice to fire an event than update
      // the route directly because the route will need the wallId of the current 
      // survey to instantiate the correct wall. 
      app.trigger("survey:submit"); 
      // could have a data payload as second param of trigger call, but the collection 
      // was updated on each form element change so there is no need to.
    }
  });

  Views.FormItem = Backbone.View.extend({

    // Parent view will set the template 
    // template: "wall/formElement/type"

    tagName: "fieldset",

    events: {
      "change select": "selectChangeHandler"
    },

    selectChangeHandler: function(e) {
      // console.log("FormItem.itemChangeHandler", e, this);
      this.model.set('selected', $(e.currentTarget).val());
    },

    serialize: function() {
      return this.model.toJSON();
    }
  });

  return Views;

});
