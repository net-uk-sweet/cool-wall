// Moved this to main.js as instructed here: 
// http://www.yuiblog.com/blog/2010/12/14/strict-mode-is-coming-to-town/

//"use strict";

// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file.
  deps: ["main"],

  paths: {
    // JavaScript folders.
    libs: "../assets/js/libs",
    plugins: "../assets/js/plugins",
    vendor: "../assets/vendor",

    // Libraries.
    jquery: "../assets/js/libs/jquery",
    jqueryui: "../assets/js/libs/jquery-ui",
    /*touchpunch: "../assets/js/libs/jquery.ui.touch-punch",*/
    lodash: "../assets/js/libs/lodash",
    backbone: "../assets/js/libs/backbone",
    marionette: "../assets/js/libs/backbone.marionette",

    // Plugins
    grid: "../assets/js/plugins/amaze.grid"
  },

  shim: {

    // Marionette depends on backbone
    marionette: { 
      deps: ["backbone"],
      exports: "Backbone.Marionette"
    },

    // Backbone library depends on lodash and jQuery.
    backbone: {
      deps: ["lodash", "jquery"],
      exports: "Backbone"
    },

    // jQuery UI depends on jQuery
    "libs/jquery-ui": ["jquery"]
  }

});
