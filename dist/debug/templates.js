this['JST'] = this['JST'] || {};

this['JST']['app/templates/layouts/main.html'] = function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<div class="wall"></div>\r\n<div class="menu"></div>\r\n<div class="save"></div>';
}
return __p;
};

this['JST']['app/templates/wall/wallView.html'] = function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<p>'+
( hTop )+
'</p>\r\n<p>'+
( hBottom )+
'</p>\r\n<p>'+
( vTop )+
'</p>\r\n<p>'+
( vBottom )+
'</p>\r\n';
}
return __p;
};