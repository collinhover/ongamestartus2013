window.requestInterval=function(a,c){function d(){(new Date).getTime()-e>=c&&(a.call(),e=(new Date).getTime());b.value=window.requestAnimationFrame(d)}if(!window.requestAnimationFrame&&!window.webkitRequestAnimationFrame&&(!window.mozRequestAnimationFrame||!window.mozCancelRequestAnimationFrame)&&!window.oRequestAnimationFrame&&!window.msRequestAnimationFrame)return window.setInterval(a,c);var e=(new Date).getTime(),b={};b.value=window.requestAnimationFrame(d);return b};
window.clearRequestInterval=function(a){window.cancelAnimationFrame?window.cancelAnimationFrame(a.value):window.webkitCancelAnimationFrame?window.webkitCancelAnimationFrame(a.value):window.webkitCancelRequestAnimationFrame?window.webkitCancelRequestAnimationFrame(a.value):window.mozCancelRequestAnimationFrame?window.mozCancelRequestAnimationFrame(a.value):window.oCancelRequestAnimationFrame?window.oCancelRequestAnimationFrame(a.value):window.msCancelRequestAnimationFrame?window.msCancelRequestAnimationFrame(a.value):
clearInterval(a)};
