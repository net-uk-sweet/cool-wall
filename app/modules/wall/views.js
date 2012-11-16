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
      this.collection.on('change', this.validate, this);
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

      var $draggable = $(ui.draggable);

      var id = $draggable.attr('id');
      var position = $draggable.position;
      var offset = $draggable.offset;

      // Retrieve the model associated with the droppable item by guid.
      // Remember when using underscore directly to pass array, ie. use
      // this.collection.models rather than collection.
      var model = this.collection.find(function(m) { 
        return m.get('id') === id;
      });

      //console.log("WallView.dropHandler: ", guid, model);

      // Update the model with the droppable item's position
      model.set('point', {
        x: position.x, 
        y: position.y
      });
    },

    submitClickHandler: function(e) {
      // Prepare and save ResultsModel to save to server.
      console.log("WallView.submitClickHandler:", this.collection); 
    },

    validate: function() {
       // When there are no invalid models left, ie. all of them have 
      // a selected property, the form is valid and can be submitted.
      var invalid = this.collection.where({point: undefined});
      // console.log("WallView.validate: valid: ", invalid.length == 0, invalid);
      if (!invalid.length) {
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
    tagName: "form",

    first: true,

    events: {
      // Specificity not essential here, but would be if 
      // further buttons were added.
      "click button#submit" : "submitClickHandler"
    },

    initialize: function() {
      // Changes to child form elements update the associated model and 
      // the change is picked up here to prompt validation of collection
      this.collection.on('change', this.validate, this);
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
      var invalid = this.collection.where({selected: undefined}); // could optimise this
      // console.log("WallView.validate: valid: ", invalid.length == 0, invalid);
      if (!invalid.length) {
        $('#submit').fadeIn('slow');
      }
    },

    submitClickHandler: function(e) {
      console.log("FormView.submitClickHandler", e, this.model.id);
      // We probably won't save the data at this point so
      // click will probably take us directly to wall route
      app.router.navigate("wall/"); 
      // This is clearly bad practice. We should probably be firing an event
      // and handling the updating of the route in the app.
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
