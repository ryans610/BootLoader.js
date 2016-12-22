/*BootLoader*/
var BootLoader=(function namespace(){
    function Init(setting){
        if(typeof(setting)=="object"){
            config.noconsole=!!setting.NoMessage;
        }
    }
    Init.prototype.loadJS=function(scripts,callback){
        //check
        if(!Array.isArray(scripts)){
            console.error("First parameter has to be an array of string, represent the JavaScript files that needs to be loaded.");
            return;
        }
        if(callback&&typeof(callback)!="function"){
            console.error("Second parameter is optional, and has to be an function that will be called after all JavaScript files is loaded.");
            return;
        }
        //load
        reset(scripts.length,callback,null);
        for(var i in scripts){
            var script=document.createElement("script");
            if(script.readyState){      //IE
                script.onreadystate=function(){
                    if(script.readyState=="loaded"||script.readyState=="complete"){
                        script.onreadystate=null;
                        checkLoad();
                    }
                };
            }else{
                script.onload=function(){
                    checkLoad();
                };
            }
            script.src=String(scripts[i]);
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    };
    Init.prototype.loadImage=function(images,callback){
        //check
        //load
        reset(images.length,callback,new Array(images.length));
        for(var i in images){
            var img=new Image();
            img.crossOrigin="Anonymous";
            img.onload=(function(idx){
                return function(e){
                    console.log(idx);
                    var canvas=document.createElement("canvas");
                    canvas.width=this.naturalWidth;
                    canvas.height=this.naturalHeight;
                    canvas.getContext("2d").drawImage(this,0,0);
                    config.result[idx]=canvas.toDataURL();
                    checkLoad();
                };
            })(i);
            img.src=images[i];
        }
    };
    Init.prototype.loadFont=function(fonts,callback){
        //check
        //load
        reset(fonts.length,callback,null);
        function ArrayBufferToBase64(buffer) {
            var base64='';
            var bytes=new Uint8Array(buffer);
            for (var i=0;i<bytes.byteLength;i++){
                base64+=String.fromCharCode(bytes[i]);
            }
            return window.btoa(base64);
        }
        for(var i in fonts){
            var ajax=new XMLHttpRequest();
            ajax.responseType='arraybuffer';
            ajax.onreadystatechange=(function(idx){
                return function(e){
                    if(ajax.readyState==4&&ajax.status==200){
                        var s=ArrayBufferToBase64(ajax.response);
                        var css=document.createElement("style");
                        css.innerHTML='@font-face{font-family:"'+fonts[idx].fontFamily+'";src:url(data:'+fonts[idx].fontType+';base64,'+s+')}';
                        document.getElementsByTagName("head")[0].appendChild(css);
                        checkLoad();
                    }
                };
            })(i);
            ajax.open("GET",fonts[i].fontUrl,true);
            ajax.send();
        }
    };
    function checkLoad(){
        config.loadedCount++;
        if(config.loadedCount==config.targetCount){
            config.callback&&config.callback.call(this,config.result);
        }
    }
    function reset(count,callback,result){
        config.callback=callback;
        config.targetCount=count;
        config.loadedCount=0;
        config.result=result;
    }
    var config={
        callback:null,
        targetCount:0,
        loadedCount:0,
        noconsole:false,
        result:null,
    };
    return Init;
}());
