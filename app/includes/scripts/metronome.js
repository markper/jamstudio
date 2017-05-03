function metronome(){
	metronome.st = null;
	this.start = function(time){
		st =setInterval(function(){
			console.log('tick..');
		},time);
	};
	this.stop = function(){
		clearInterval(st);
	};
}

$('#metronome').slider({
    orientation: "horizontal",
    range: "min",
    min: 0,
    max: 100,
    value: 100,
    slide: function( event, ui ) {
			
	    }
});