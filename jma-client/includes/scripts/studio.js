var max_time = 60*20;
var time_units = 5;
var unit_width = 10;
var z_index = 3;
var samples = new Array();
var p = new player();
var data = null;

function getData(){
	var tmp = null;
	$.ajax({
		dataType: "json",
		url: "includes/data/data.json",
		success:  function(result){
			console.log('success load slogans.json');
			drawGrid(unit_width, result);
		}
	});	
}

function zoomIn(){
	if(unit_width>20)
		return;
	unit_width=unit_width*1.1;
	zoom();
}
function zoomOut(){
	if(unit_width<4)
		return;
	unit_width = unit_width/1.1;
	zoom();
}

function drawGrid(unit_width,data){
		var cells = Math.round(max_time/time_units);				
		// intialize elements
		$('#channels_list').html('');
		$('.channels_grid_title').html('');
		$('.channel_grid_row').html('');
		// generate grid title
		for (var i = 0; i < cells; i++) {
				$('.channels_grid_title').append('<div class="time-box">'+(i*time_units+time_units)+'</div><div class="time-box-border"></div>');
			}
		// generate grid rows
		for (var i = 0; i < data.project.tracks[0].track.channels.length; i++) {
			drawChannel(i,cells,data);
		}	
		// draw cursorLine
		zoom();	
	}		

function drawChannel(i,cells,data){
	var samples = data.project.tracks[0].track.channels[i].channel.samples;
	var channelObject = data.project.tracks[0].track.channels[i].channel;
	var channel = new Channel(channelObject.channelId,channelObject.volume, channelObject.name, channelObject.username, channelObject.instrument);
	// create grid row
	var row = $('<div class="channels_list_row"><article class="channel_list_row" ></article><article class="channel_grid_row" ondrop="drop(event)" ondragover="allowDrop(event)" id="channel_grid_row_'+i+'"></article></article></div>');
	// create and append, grid cells to grid row
	var svg = '<?xml version="1.0" ?><svg  class="channel_play player-icon" data-channel="'+ channelObject.channelId +'" version="1.1" viewBox="0 0 20 20" width="20px" xmlns="http://www.w3.org/2000/svg" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns:xlink="http://www.w3.org/1999/xlink"><title/><desc/><defs/><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g  id="Icons-AV" transform="translate(-126.000000, -85.000000)"><g class="player-fill" transform="translate(126.000000, 85.000000)"><path d="M10,0 C4.5,0 0,4.5 0,10 C0,15.5 4.5,20 10,20 C15.5,20 20,15.5 20,10 C20,4.5 15.5,0 10,0 L10,0 Z M8,14.5 L8,5.5 L14,10 L8,14.5 L8,14.5 Z" id="Shape"/></g></g></g></svg>';
	//
	var svg2 = '<svg version="1.1"  class="channel_pause player-icon" data-channel="'+ channelObject.channelId +'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 300.003 300.003" style="enable-background:new 0 0 300.003 300.003;" xml:space="preserve"><g><path class="player-fill" d="M150.001,0c-82.838,0-150,67.159-150,150c0,82.838,67.162,150.003,150,150.003c82.843,0,150-67.165,150-150.003C300.001,67.159,232.846,0,150.001,0z M134.41,194.538c0,9.498-7.7,17.198-17.198,17.198s-17.198-7.7-17.198-17.198V105.46c0-9.498,7.7-17.198,17.198-17.198s17.198,7.7,17.198,17.198V194.538z M198.955,194.538c0,9.498-7.701,17.198-17.198,17.198c-9.498,0-17.198-7.7-17.198-17.198V105.46c0-9.498,7.7-17.198,17.198-17.198s17.198,7.7,17.198,17.198V194.538z"/></g></svg>'
	var svg3 = 	'<svg version="1.1" class="channel_stop player-icon" data-channel="'+ channelObject.channelId +'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"'+
				' viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">'+
				'<path class="player-fill" d="M256,0C114.617,0,0,114.617,0,256s114.617,256,256,256s256-114.617,256-256S397.383,0,256,0z M336,320'+
				'c0,8.836-7.156,16-16,16H192c-8.844,0-16-7.164-16-16V192c0-8.836,7.156-16,16-16h128c8.844,0,16,7.164,16,16V320z"/>';
	
	var slider = $('<div class="slider-vertical"></div>');
	$(slider).slider({
	    orientation: "horizontal",
	    range: "min",
	    min: 0,
	    max: 100,
	    value: 60,
	    slide: function( event, ui ) {
 			p.changeChannelVolume(channel.channelId,ui.value*0.01);
  	    }
	});
	var list_item = $('<article class="channel_list_row_info"><div class="mini_player">'+svg+svg2+'<div class="volume_placeholder"></div></div> <div class="channel_name">'+ channelObject.name +'<div><div class="channel_details">'+channelObject.userId+' - '+ channelObject.instrument +'<div></article><article class="channel_list_row_btns"><ul><li></li><li class="btn_eye"></li><li class="btn_mic"></li></article>');
	$(list_item).find('.volume_placeholder').append(slider);
	$(row).find('.channel_list_row').append(list_item);
	// create and append, grid cells to grid row
	for (var j = 0; j < cells; j++) {
		$(row).find('.channel_grid_row').append('<div class="time-box"></div><div class="time-box-border"></div>');
	}
	// create and append, grid sample placeholder to grid row
	$(row).find('.channel_grid_row').append('<article class="sample_placeholder" id="sample_placeholder_'+ i +'" data-channel="'+ channel.channelId +'"></article>');
	// create and append samples on placeolder
	for (var j = 0; j < samples.length; j++) {
		$(row).find('.channel_grid_row .sample_placeholder').append('<article class="sample" id="'+samples[j].sample.sampleId+'" ondragstart="drag(event)" draggable="true"></article>');
		p.addSample(new Sample(samples[j].sample.sampleId,channel.channelId, samples[j].sample.file.path,samples[j].sample.duration,samples[j].sample.start,1,channel.channelId));
	}	
	p.addChannel(channel);
	// append grid row to channel list
	$('#channels_list').append(row);
}	

var initialize = function(){
	//for (var i = 3 - 1; i >= 0; i--) {
		samples.push(new Sample('includes/loops/1.wav',16,random(80),1));
		samples.push(new Sample('includes/loops/2.wav',8,random(80),0.4));
		samples.push(new Sample('includes/loops/3.wav',9,random(80),1));
		samples.push(new Sample('includes/loops/4.wav',4,random(80),1));
		samples.push(new Sample('includes/loops/5.wav',17,random(80),1));
		samples.push(new Sample('includes/loops/6.wav',9,random(80),1));
	//}
};

function random(max){
	return Math.floor((Math.random() * max) + 1);
}

function player(data){
	player.samples = new Array();
	player.channels = new Array();
	player.timeouts = new Array();
	player.intervals = new Array();
	player.channelId = null;
	player.playTime = 0;
	player.isPlaying = false;
	var p = this;

	this.setTime =  function(playTime){
		player.playTime = playTime*100;
		console.log(playTime);
		$('#time').text(playTime);
		$('#cursorLine').css({'left':secondsToOffset(playTime)});
	}

	this.move =  function(playTime){
		var isPlaying = player.isPlaying;
		if(isPlaying)
			this.pause();
		if(playTime+player.playTime/100 <=max_time && playTime+player.playTime/100>=0){
			$('main').animate({scrollLeft: ($('main').scrollLeft() + secondsToOffset(playTime)) + 'px'}, 0);
			this.setTime(player.playTime/100 + playTime);
		}else if(!(playTime+player.playTime/100>=0))
			this.setTime(0);
		else
			this.setTime(max_time);
		if(isPlaying)
			this.play();
	}

	this.setChannel = function(channelId){
		player.channelId = channelId;
	}
	
	this.addSample = function(sample){
		player.samples.push(sample);
	}
	this.getSample = function(id){
		for (var i = player.samples.length - 1; i >= 0; i--) {
			if(player.samples[i].id == id){
				return player.samples[i];
			}
		}
	};
	this.addChannel = function(channel){
		player.channels.push(channel);

	}
	player.getChannel = function(id){
		for (var i = player.channels.length - 1; i >= 0; i--) {
			if(player.channels[i].channelId == id){
				return player.channels[i];
			}
		}
	};
	this.changeChannelVolume = function(channelId,volume){
		for (var i = player.samples.length - 1; i >= 0; i--) {
			if(player.samples[i].channelId == channelId){
				player.samples[i].volume = volume;
				player.samples[i].aud.volume = volume;
			}
		}
	};
	this.play = function(playTime){
			if(player.isPlaying)
				return;
			console.log('play');
			player.isPlaying = true;
			var st1 =setInterval(function(){						
				$('#time').text(++player.playTime/100);
			},10);
			player.intervals.push(st1);
			$(player.samples).each(function(index){
				var sample = player.samples[index];
				if(player.channelId && player.channelId!=sample.channelId)
					return;
				var timeToStartPlaying = parseFloat(player.samples[index].start_)-parseFloat(player.playTime)/100;
				var startAt = 0;
				var remainToStart = 0;
				if(timeToStartPlaying<0){
					if(Math.abs(timeToStartPlaying)>player.samples[index].time_)
						return;
					remainToStart = 0;
				}else
					remainToStart = timeToStartPlaying;							
				
				if(timeToStartPlaying<0 )
					startAt = Math.abs(timeToStartPlaying);	
				else
					startAt = 0;
				var st = setTimeout(function(){
					sample.aud.currentTime = startAt;
					sample.aud.play();
					sample.aud.volume = parseFloat(player.getChannel(sample.channelId).volume * sample.volume);
				},remainToStart*1000);	
				player.timeouts.push(st);
			});
			//cursor					
	    	$('#cursorLine').animate({'left':unit_width*max_time},max_time*1000, 'linear');
	};
	this.pause = function(){
		console.log('pause');
		player.isPlaying = false;
		// music
			$(player.samples).each(function(index){
				player.samples[index].aud.pause();
			});		
			reset();		
		// cursor
		$('#cursorLine').stop();
	};
	this.stop = function(){
		console.log('stop');
		player.isPlaying = false;
		// music
			$(player.samples).each(function(index){
				player.samples[index].aud.pause();
				player.samples[index].aud.currentTime = 0;
			});		
			$('#time').text(player.playTime=0);	
			reset();	
		// cursor
		$('#cursorLine').stop();
	    $('#cursorLine').css({'left':0});
	};

	function reset(){
		for (var i = player.intervals.length - 1; i >= 0; i--) {
			clearInterval(player.intervals[i]);
		}
		player.intervals = new Array()
		for (var i = player.timeouts.length - 1; i >= 0; i--) {
			clearTimeout(player.timeouts[i]);
		}
		player.timeouts = new Array()
	}
}

var Channel = class Channel {
  constructor(channelId,volume,name,username,instrument) {
  	this.channelId = channelId;	
    this.volume = volume;
    this.name = name;	
    this.username = username;		    
    this.instrument = instrument;		    
  }
}

var Sample = class Sample {
  constructor(id,channelId,file, time, start,volume,username,userId,type,channel) {
    this.id = id;
    this.channelId = channelId;
    this.file = file;
    this.time = time;
    this.start = start;
    this.aud = new Audio();
    this.aud.src = file; 
    this.aud.volume = volume;
    this.volume = volume;
    this.username = username;
    this.userId = userId;
    this.type = type;	
    this.channel = channel;	    
  }

   get audi(){
   	return this.aud;
   }
   get start_(){
   	return this.start;
   }
   set start_(start){
   	 this.start = start;
   }
   get time_(){
   	return this.audi.buffered.end(0);
   }
   set time_(time){
   	 this.time = time;
   }
};

function zoom(){
	$('.channels_grid_title div.time-box').css('width',unit_width*time_units);
	$('main #channels_list > div').css('height',unit_width*3/4*10);
	$('.channel_grid_row').find('div.time-box').css('width',unit_width*time_units);
	var time_offset = secondsToOffset(max_time)+5;
	$('.channels_grid_title').css('width',time_offset);
	$('.channel_grid_row').css('width',time_offset);
	$('#channels_list').css('width',time_offset+160);
	$('#channels_title').css('width',time_offset+160);
	$('.sample').each(function(){
		refreshSample(this);
	});
	if(player.isPlaying){
		p.pause();
		$('#cursorLine').css('left',secondsToOffset(player.playTime/100));
		p.play();
	}
	else
		$('#cursorLine').css('left',secondsToOffset(player.playTime/100));
	$('#cursorLine').css('height',$('.channel_grid_row').length*(unit_width*3/4*10+1)+24);
}

function refreshSample(element){
	var sample = p.getSample(element.id);
	var width = sample.time*unit_width+ (sample.time/time_units-2);
	$(element).css('width',width);
	$(element).css('left',secondsToOffset(sample.start));
	createSoundSpectrum(element,width,(unit_width*3/4*10+1));
}

function createSoundSpectrum(sample,width,height){
	if($(sample).find('canvas').length==0){
		var newCanvas   = createCanvas (width, height);
 		var context = newCanvas.getContext('2d');
 		function createCanvas ( w, h ) {
		    var newCanvas = document.createElement('canvas');
		    newCanvas.width  = w;     newCanvas.height = h;
		    return newCanvas;
		};
		drawSoundFile(function(data){
		},context,newCanvas,height,width,p.getSample(sample.id).aud.src);
		$(sample).append(newCanvas);
	}
}
function refreshSamples(){
	$('.sample').each(function(data){
		refreshSample(this);
	});	
}
function updateSampleStart(id,start,channelId){
	for (var i = player.samples.length - 1; i >= 0; i--) {
		if(player.samples[i].id == id){
			player.samples[i].start = start;
			player.samples[i].channelId = channelId;
		}
	}
}
function lightChannel(channels_list_row){
	if(channels_list_row){
		$('.channels_list_row').css('opacity','0.9');
		$(channels_list_row).css('opacity','1');
	}else{
		$('.channels_list_row').css('opacity','1');	
		resetPlayStopChannelBtns();
	}
}
function offsetToSeconds(offset){
	var borders = Math.floor(offset/((time_units*unit_width)));
    var all = ((offset-borders)/(time_units*unit_width))*time_units;
    return all;
}
function secondsToOffset(sec){
	var real = Math.floor(sec*unit_width);
	var borders = Math.floor(real/((time_units*unit_width)));
    return real+borders;
}

function collouringGridRow(el,isMulti){
	console.log(isMulti);
	if(isMulti)
		if($(el.target).parent().hasClass('row_pressed'))
			$(el.target).parent().removeClass('row_pressed');
		else
			$(el.target).parent().addClass('row_pressed');
	else{
		$('.channel_grid_row').removeClass('row_pressed');
		$(el.target).parent().addClass('row_pressed');
	}
}
function togglePlayPause(){
	$("#play").toggle();
	$("#pause").toggle();
}
function modePlaying(){
	$("#play").hide();
	$("#pause").show();
}
function modePausing(){
	$("#play").show();
	$("#pause").hide();
}
function modePlayingChannel(channelId){
	$('.channel_play[data-channel=\''+channelId+'\']').hide();
	$('.channel_pause[data-channel=\''+channelId+'\']').show();
	console.log('pla '+ channelId);
}
function modePausingChannel(channelId){
	$('.channel_play[data-channel=\''+channelId+'\']').show();
	$('.channel_pause[data-channel=\''+channelId+'\']').hide();
	console.log('pau '+ channelId);
}
function resetPlayPause(){
	$('#pause').hide();
	$('#play').show();
}
function togglePlayStopChannelBtns(channelId){
	$('.channel_pause').not('[data-channel=\''+channelId+'\']').hide();
	$('.channel_play').not('[data-channel=\''+channelId+'\']').show();
	$('.channel_pause[data-channel=\''+channelId+'\']').toggle();
	$('.channel_play[data-channel=\''+channelId+'\']').toggle();
}
function resetPlayStopChannelBtns(){
	$('.channel_pause').hide();
	$('.channel_play').show();
}

// drag and drop 
function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    console.log(ev.target.style.left);	
}
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var dragged = document.getElementById(data);		   
    var target = ev.target;
    console.log(dragged.id);
    var new_offset = $('main').scrollLeft()+ ev.pageX - mouse_offset - 160;
	if(new_offset<0)
		new_offset = 0;
	// drop on sample
    if($(target).hasClass('sample')){
    	target = $(target).parent();
    	if($(target).parent().attr('id') != $(dragged).parent().attr('id')){
    		$(target).append(dragged); // drop on sample on other layer
    	}
		$('#'+data).css('left', new_offset);
    }
    // drop on layer
    else{
    	target = ($(target).parent()).find('.sample_placeholder');
    	target.append(dragged);
    	$('#'+data).css('left', new_offset);
    }
    // z-index up
    $('#'+data).css('z-index', z_index++);
    $('#channels_title').css('z-index', z_index++);
    // define new start
    var borders = Math.floor(new_offset/((time_units*unit_width)));
    var all = ((new_offset-borders)/(time_units*unit_width))*time_units;
    $('#'+data).attr('data-start', all);
    var channelId = $(target).attr('data-channel');
    updateSampleStart(data,all,channelId);
	if(player.isPlaying){
		p.pause();
		p.play();
	}
}


// Listeners
var mouse_offset;
$(document).on('mousedown', function(e){
    mouse_offset = e.pageX - $(e.target).offset().left;
    if($(e.target).hasClass('sample')){
    	$(e.target).css('z-index', z_index++);
        $('#channels_title').css('z-index', z_index++);
        $('.channel_list_buttons').css('z-index', z_index++);
    }
    if($(e.target).parent().hasClass('sample')){
    	$(e.target).parent().css('z-index', z_index++);
        $('#channels_title').css('z-index', z_index++);
        $('.channel_list_buttons').css('z-index', z_index++);
    }
});
$(document).on('mouseup', function(e){

});
$(document).bind('click',function(el){	
	
});
var shifted = false;
$(document).on('keyup keydown', function(e){
	shifted = e.shiftKey
});

document.onkeydown = checkKey;
function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '38') {
        // up arrow
    }
    else if (e.keyCode == '40') {
        // down arrow
    }
    else if (e.keyCode == '37') {
       // left arrow
       p.move(-0.25);
       e.preventDefault();
    }
    else if (e.keyCode == '39') {
       // right arrow
       p.move(0.25);
       e.preventDefault();
    }else if (e.keyCode == '32') {
    	if(player.channelId){ //channel
    		if(player.isPlaying){
				modePausing();
				modePausingChannel(player.channelId);
				p.pause();
    		}
	    	else {
	    		modePlaying();
	    		modePlayingChannel(player.channelId);
	    		p.play();
	    	}
	    	lightChannel($('.channel_play[data-channel=\''+player.channelId+'\']').closest('.channels_list_row'));
    	}else{				// all
    		if(player.isPlaying){
    			modePausing();
    			p.pause();
    		}
    		else{
    			modePlaying(); 
    			p.play();   		
    		}
    		lightChannel();
    	}
    }  
}


$(document).on('click','.channel_pause',function(e){
	var channelId = $(this).attr('data-channel');
	lightChannel();
	p.setChannel();
	p.pause();
	modePausingChannel(player.channelId);
	//resetPlayPause();
});
$(document).on('click','.channel_play',function(e){
	var channelId = $(this).attr('data-channel');
	lightChannel($(this).closest('.channels_list_row'));
	if(!player.isPlaying){
		p.setChannel(channelId);
		p.play();
	}
	else if(player.isPlaying && channelId != player.channelId){
		p.setChannel(channelId);
		p.pause();
		p.play();
	}
	modePlayingChannel(player.channelId);
});

$(document).ready(function(){
	getData();
	
	$("#play").click(function(){
		p.setChannel();
		p.pause();
		p.play();
		lightChannel(null);
		togglePlayPause();
	});
	$("#pause").click(function(){
		p.pause();
		p.setChannel();
		togglePlayPause();
		lightChannel();
	});
	$("#stop").click(function(){
		p.stop();
		p.setChannel();
		lightChannel();
		resetPlayPause();
	});
	$(document).on('click','.channel_grid_row',function(e){
		if(offsetToSeconds($('main').scrollLeft()+ e.pageX  < 160))
			return;
		if(player.isPlaying){
			p.pause();
			p.setTime(offsetToSeconds($('main').scrollLeft()+ e.pageX  - 160));
			p.play();
		}
		else
			p.setTime(offsetToSeconds($('main').scrollLeft()+ e.pageX  - 160));		
		$(this).focusout();
	});

	$('main').scroll(function(){
	    $('#channels_title').css({
	        'top': $(this).scrollTop() 
	    });
	    $('.channel_list_row , .channel_list_buttons').css({
	        'left': $(this).scrollLeft() 
	    });
	});

});
		