// Use ECMAScript 5 Strict Mode. Why? John Resig says we should:
// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

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
    marionette: "../assets/js/libs/backbone.marionette"
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

    // Backbone.LayoutManager depends on Backbone.
    "plugins/backbone.layoutmanager": ["backbone"],

    // jQuery UI depends on jQuery
    "libs/jquery-ui": ["jquery"]
  }

});
