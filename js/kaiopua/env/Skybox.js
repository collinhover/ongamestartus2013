(function(e){function i(c,d){var b,a;a=h.renderer?h.renderer.getMaxAnisotropy():1;d=d||{};b=new THREE.Texture(null,d.mapping);b.format=THREE.RGBFormat;b.flipY=!1;b.anisotropy=Math.min(d.anisotropy,a);d.oneForAll===!0?(b.wrapS=b.wrapT=THREE.RepeatWrapping,b.repeat.set(d.repeat||1,d.repeat||1),e.asset_require([c+".jpg"],function(a){b.image=a;b.needsUpdate=!0}),a=new THREE.MeshBasicMaterial({color:16777215,map:b,depthWrite:!1,side:THREE.BackSide})):(e.asset_require([c+"_posx.jpg",c+"_negx.jpg",c+"_posy.jpg",
c+"_negy.jpg",c+"_posz.jpg",c+"_negz.jpg"],function(a,c,d,e,f,g){b.image=[a,c,d,e,f,g];b.needsUpdate=!0}),a=$.extend(!0,{},THREE.ShaderUtils.lib.cube),a.uniforms.tCube.value=b,a=new THREE.ShaderMaterial({fragmentShader:a.fragmentShader,vertexShader:a.vertexShader,uniforms:a.uniforms,depthWrite:!1,side:THREE.BackSide}));g.Instance.call(this,{geometry:new THREE.CubeGeometry(100,100,100),material:a,shading:THREE.SmoothShading})}var h=e.shared=e.shared||{},f={},g;e.asset_register("js/kaiopua/env/Skybox.js",
{data:f,requirements:["js/kaiopua/core/Model.js"],callbacksOnReqs:function(c){g=c;f.Instance=i;f.Instance.prototype=new g.Instance;f.Instance.prototype.constructor=f.Instance},wait:!0})})(KAIOPUA);
