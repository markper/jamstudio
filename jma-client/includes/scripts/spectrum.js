window.AudioContext = window.AudioContext || window.webkitAudioContext ;
var audioContext = new AudioContext();

function drawSoundFile(callback,context,newCanvas,canvasHeight,canvasWidth,file){
	// AUDIO CONTEXT
	window.AudioContext = window.AudioContext || window.webkitAudioContext ;

	if (!AudioContext) alert('This site cannot be run in your Browser. Try a recent Chrome or Firefox. ');

	
	var currentBuffer  = null;

	// CANVAS
	window.onload = appendCanvas;

	                        
	function appendCanvas() {  }

	// MUSIC LOADER + DECODE
	function loadMusic(url) {   
	    var req = new XMLHttpRequest();
	    req.open( "GET", url, true );
	    req.responseType = "arraybuffer";    
	    req.onreadystatechange = function (e) {
	          if (req.readyState == 4) {
	             if(req.status == 200)
	                  audioContext.decodeAudioData(req.response, 
	                    function(buffer) {
	                             currentBuffer = buffer;
	                             displayBuffer(buffer);
	                    }, onDecodeError);
	             else
	                  alert('error during the load.Wrong url or cross origin issue');
	          }
	    } ;
	    req.send();
	}

	function onDecodeError() {  alert('error while decoding your file.');  }

	// MUSIC DISPLAY
	function displayBuffer(buff /* is an AudioBuffer */) {
	   var leftChannel = buff.getChannelData(0); // Float32Array describing left channel     
	   var lineOpacity = canvasWidth / leftChannel.length  ;      
	   context.save();
	   

	   context.globalCompositeOperation = "source-over";
	   context.translate(0,canvasHeight / 2);
	   context.globalAlpha = 0.06 ; // lineOpacity ;
	   for (var i=0; i<  leftChannel.length; i++) {
	       // on which line do we get ?
	       var x = Math.floor ( canvasWidth * i / leftChannel.length ) ;
	       var y = leftChannel[i] * canvasHeight / 2 ;
	       context.beginPath();
	       context.strokeStyle="white";
	       context.moveTo( x  , 0 );
	       context.lineTo( x+1, y );
	       context.stroke();
	   }
	   context.restore();
	   callback(context);
	   console.log('done');
	}




	loadMusic(file);
}
