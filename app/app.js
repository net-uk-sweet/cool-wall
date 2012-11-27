define([

  // Libraries
  'jquery',
  'lodash',
  'backbone',
  'marionette'
], 

function($, _, Backbone, Marionette) {
  
  "use strict";

  /* =========================================================================
   * The following will make Marionette's template retrieval work with
   * in both development (templates found in html files) and production
   * environment (templates all compiled AS JST templates into the require.js
   * file. This will also use JST instead of the Marionette.TemplateCache.
   */
  Backbone.Marionette.Renderer.render = function(templateId, data) {
    var path = 'app/templates/' + templateId + '.html';

    // Localize or create a new JavaScript Template object.
    var JST = window.JST = window.JST || {};

    // Make a blocking ajax call (does not reduce performance in production,
    // because templates will be contained by the require.js file).
    if (!JST[path]) {
      $.ajax({
        url: App.root + path,
        async: false
      }).then(function(templateHtml) {
        JST[path] = _.template(templateHtml);
      });
    }

    if (!JST[path]) {
      var msg = 'Could not find "' + templateId + '"';
      var error = new Error(msg);
      error.name = 'NoTemplateError';
      throw error;
    }

    // Call the template function with the data.
    return JST[path](data);
  };
  /* ======================================================================== */

  var App = new Backbone.Marionette.Application();
  
  // Set up basic paths.
  App.root = '/';

  // Add the main region, that will hold the page layout.
  App.addRegions({
    main: '#main'
  });

  // Adds any methods to be run after the app was initialized.
  App.addInitializer(function() {
    this.initAppLayout();
    this.initAppEvents();
  });


  App.on("initialize:after", function(){
    Backbone.history.start({ /*pushState: true*/ });
  });

  // The main initializing function sets up the basic layout and its regions.
  App.initAppLayout = function() {

    // Define the layouts for each route
    var SurveyLayout = Backbone.Marionette.Layout.extend({
      template: 'layouts/survey',
      regions: {
        form: '#form',
        buttons: '#buttons'
      }
    });

    var WallLayout = Backbone.Marionette.Layout.extend({
      template: 'layouts/wall',
      regions: {
        wall: '#wall',
        menu: '#menu',
        buttons: '#buttons'
      }
    });

    var ResultLayout = Backbone.Marionette.Layout.extend({
      template: 'layouts/result',
      regions: {
        wall: '#wall',
        filters: '#filters',
        buttons: '#buttons'
      } 
    });

    // Create and cache instances of the layout for each route
    App.surveyLayout = new SurveyLayout();
    App.wallLayout = new WallLayout(); 
    App.resultLayout = new ResultLayout();
  };
  
  App.initAppEvents = function() {
    // All links with the role attribute set to nav-main will navigate through
    // the application's router.
    $('a[role=nav-main]').click(function(e) {
      e.preventDefault();
      App.Router.navigate($(this).attr('href'), {
        trigger: true
      });
    });

    App.vent.on('survey:submit', function(e) {
      // e is the WallModel instance passed as event object
      App.ResultModel.set('filters', e.get('filters'));
      App.Router.navigate('wall/' + e.get('wallId'), { trigger: true });
    });

    App.vent.on('wall:submit', function(e) {
      App.Router.navigate('result', { trigger: true });
    });

    App.vent.on('result:submit', function(e) {
      // Gonna want to load data here
    });
  };

  return App;
});