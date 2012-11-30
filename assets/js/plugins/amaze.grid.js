// Module/Plugin core
// Note: the wrapper code you see around the module is what enables
// us to support multiple module formats and specifications by
// mapping the arguments defined to what a specific format expects
// to be present. Our actual module functionality is defined lower
// down, where a named module and exports are demonstrated.
//
// Note that dependencies can just as easily be declared if required
// and should work as demonstrated earlier with the AMD module examples.

(function ( name, definition ){
  var theModule = definition(),
      // this is considered "safe":
      hasDefine = typeof define === 'function' && define.amd,
      // hasDefine = typeof define === 'function',
      hasExports = typeof module !== 'undefined' && module.exports;

  if ( hasDefine ){ // AMD Module
    define(theModule);
  } else if ( hasExports ) { // Node.js Module
    module.exports = theModule;
  } else { // Assign to common namespaces or simply the global object (window)
    (this.jQuery || this.ender || this.$ || this)[name] = theModule;
  }
})( 'grid', function () {
    var module = this;
    module.plugins = [];
    module.horizontal = 10;
    module.vertical = 10;
    module.strokeStyle = "#000";

  // define the core module here and return the public API

  // This is the highlight method used by the core highlightAll()
  // method and all of the plugins highlighting elements different
  // colors
  drawAxis = function(canvas, ctx, divisions, vertical) {
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
  }

  return {
      // TODO: approach for passing in options
      draw: function(canvas) {
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = module.strokeStyle;

        module.drawAxis(canvas, ctx, module.horizontal, true);
        module.drawAxis(canvas, ctx, module.vertical, false);
      }
  };

});