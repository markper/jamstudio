var studio = function studio(){
	var max_time = 60*20;
	var time_units = 5;
	var unit_width = 10;
	var z_index = 3;
	var mouseOffsetSampleClicked;
	var data = null;
	var grid_offset = 160;
	var cursorType = null;
	var sampleIndexGenerator = 0;
	var channelIndexGenerator = 0;
	//var samples = new Array();
	var p = new player();
	var ac = new actionController();
	var ss = new selectedSamples();
	var sharedEvent = null;


	this.init = function init(url){
		var tmp = null;
		$.ajax({
			dataType: "json",
			url: url,
			success:  function(result){
				drawGrid(result);
				data = result;
			}
		});	
	};

	function actionController(){
		actionController.lock = false;
		actionController.actionsUndo = new Array();
		actionController.actionsRedo = new Array();
		this.addAction = function(action){
			if(actionController.actionsUndo.length==50)
				actionController.actionsUndo.shift();	
			actionController.actionsUndo.push(action);
			actionController.actionsRedo = new Array();
		}
		this.redo = function(){
			if(actionController.lock)
				return;
			lock = true;
			if(actionController.actionsRedo.length<=0)
				return;
			var action = actionController.actionsRedo.pop();
			switch(action.type){
				case 'sample':{
					sample(this);
					break;
				}
				case 'sample_delete':{
					sample_delete(this);
					break;
				}
				case 'sample_new':{
					sample_new(this);
					break;
				}
				case 'sample_split':{
					this.redo();
					this.redo();
					actionController.actionsUndo.push(new Action('sample_split',null));	
					console.log(actionController.actionsUndo);
					break;
				}
				case 'sample_cut':{
					sample_cut(this);	
					break;
				}
			}

			function sample(parent){
				var before = p.getSample(action.state.id);
				actionController.actionsUndo.push(new Action('sample',before));	
				parent.restoreAction(action);	
			}

			function sample_delete(parent){
				actionController.actionsUndo.push(new Action('sample_new',action.state));	
				parent.restoreAction(action);	
			}

			function sample_new(parent){
				actionController.actionsUndo.push(new Action('sample_delete',action.state));	
				parent.restoreAction(action);	
			}
			function sample_cut(parent){
				actionController.actionsRedo.push(new Action('sample_cut',action.state));	
				action.type = 'uncut';
				parent.restoreAction(action);
			}

		};
		this.undo = function(){
			if(actionController.lock)
				return;
			lock = true;
			if(actionController.actionsUndo.length<=0)
				return;
			var action = actionController.actionsUndo.pop();
			switch(action.type){
				case 'sample':{
					sample(this);
					break;
				}
				case 'sample_new':{
					sample_new(this);
					break;
				}
				case 'sample_delete':{
					sample_delete(this);
					break;
				}
				case 'sample_split':{
					this.undo();
					this.undo();
					actionController.actionsRedo.push(new Action('sample_split',null));	
					break;
				}
				case 'sample_cut':{
					sample_cut(this);	
					break;
				}
			}

			function sample(parent){
				var before = p.getSample(action.state.id);
				actionController.actionsRedo.push(new Action('sample',before));	
				parent.restoreAction(action);
			}

			function sample_new(parent){
				actionController.actionsRedo.push(new Action('sample_delete',action.state));	
				parent.restoreAction(action);
			}

			function sample_delete(parent){
				actionController.actionsRedo.push(new Action('sample_new',action.state));	
				parent.restoreAction(action);
			}
			function sample_cut(parent){
				actionController.actionsRedo.push(new Action('sample_cut',action.state));	
				parent.restoreAction(action);
			}
		};
		this.restoreAction = function(action){	
			switch(action.type){
				case 'sample':{
					p.updateSample(jQuery.extend(true, {}, action.state));
					break;
				}
				case 'sample_new':{
					$('#'+action.state.id).remove();
					p.removeSample(jQuery.extend(true, {}, action.state));					
					break;
				}
				case 'sample_delete':{
					drawSample($('.sample_placeholder[data-channel='+action.state.channelId+']').closest('.channels_list_row'), action.state.id,
						action.state.channelId,action.state.file,action.state.time,action.state.start,
						action.state.volume,action.state.delay,action.state.fadeIn,action.state.fadeOut);
					resetComponents();
					break;
				}
				case 'sample_uncut':{
					$('#'+action.state.id).hide();
					break;
				}
				case 'sample_cut':{
					$('#'+action.state.id).show();
					break;
				}
				case 'channel':{

					break;
				}
			}
			lock = false;
			resetComponents();
		}
	}

	function player(data){
		player.samples = new Array();
		player.channels = new Array();
		player.timeouts = new Array();
		player.intervals = new Array();
		player.channelId = null;
		player.playTime = 0;
		player.isPlaying = false;
		player.fadeIn = 5;
		player.fadeOut = 5;
		var p = this;

		this.reset = function(){
			if(player.isPlaying){
				p.pause();
				p.play();
			}else{
				p.pause();
			}
		}

		this.setTime =  function(playTime){
			player.playTime = playTime*100;			
			updateTimer(playTime*100);
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
		this.removeSample = function(sample){
			var index = -1;
			for (var i = player.samples.length - 1; i >= 0; i--) {
				if(player.samples[i].id == sample.id){
					index = i;
					player.samples[index].aud.pause();				
				}
			}
			console.log(index);
			if (index > -1) {
			    player.samples.splice(index, 1);
			}
	
		}
		this.updateSample = function(sample){
			for (var i = player.samples.length - 1; i >= 0; i--) {
				if(player.samples[i].id == sample.id){
					player.samples[i] = sample;
				}
			}
		}
		this.restoreSampleAction = function(id){
			var sample = this.getSample(id);
			ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
			updateUndoRedoIcons();
		}
		this.updateSampleLoop = function(id,isLoop){
			this.getSample(id).aud.loop = isLoop;
		}
		this.updateSampleTime = function(id,time){
			var sample = this.getSample(id);
			sample.time = time;
		}
		this.updateSampleStart = function(id,start){
			var sample = this.getSample(id);
			sample.start = start;
		}
		this.updateSampleChannel = function(id,channelId){
			var sample = this.getSample(id);
			sample.channelId = channelId;
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
			player.getChannel(channelId).volume = volume;
			for (var i = player.samples.length - 1; i >= 0; i--) {
				if(player.samples[i].channelId == channelId){
					player.samples[i].aud.volume = volume * player.samples[i].volume;
				}
			}
		};
		this.play = function(playTime){
				if(player.isPlaying)
					return;
				console.log('play');
				player.isPlaying = true;
				var st =setInterval(function(){
					updateTimer(++player.playTime);											
					//$('#time #min').text(++player.playTime/100/60);
				},10);
				player.intervals.push(st);
				$(player.samples).each(function(index){
					var sample = player.samples[index];
					var playerTimeSec = parseFloat(player.playTime)/100;
					var a = parseFloat(player.samples[index].start);  // second of start sample
					var b = parseFloat(player.samples[index].start) + parseFloat(player.samples[index].time); // second of end sample
					var c = playerTimeSec; // second of cursor position
					var remainToStart = a-c;
					var remainToEnd = b-c;
					var startAt = c-a;
					if(player.channelId && player.channelId != sample.channelId)
						return; // sample channel muted
					if(c<a){ // play from start
						startAt = 0;
					}
					if(a<c&&c<b){ // play from middle
						remainToStart = 0;
						startAt = parseFloat(c-a)%parseFloat(player.samples[index].aud.duration);
					}
					if(c>b){ // play after ends
						return;
					}
					console.log('start: ' + remainToStart + ' end: ' + remainToEnd + ' at: ' + startAt);

					var st1 = setTimeout(function(){						
						sample.aud.currentTime = startAt + parseFloat(sample.delay);
						console.log(sample);
						sample.aud.volume = (sample.fadeIn>0&&remainToStart>0?0:parseFloat(player.getChannel(sample.channelId).volume * sample.volume));
						sample.aud.play();
					},remainToStart*1000);	
					player.timeouts.push(st1);

					var st2 = setTimeout(function(){
						sample.aud.currentTime = sample.delay;
						sample.aud.pause();
					},remainToEnd*1000);	
					player.timeouts.push(st2);

					// fadeIn
					if(sample.fadeIn>0){			
						var stFadeIn = setTimeout(function(){
							var fadeCounter = 0;
							var countdown = (parseFloat(c-a) - remainToStart<0?0:parseFloat(c-a) - remainToStart);
							var fadeVol = parseFloat(parseFloat(player.getChannel(sample.channelId).volume * sample.volume));					
							var stFadeOutInter = setInterval(function(){
								if(countdown>sample.fadeIn)	
									clearInterval(stFadeOutInter);
								else{
									console.log('ctd>>'+(countdown +=0.1));
									sample.aud.volume = (countdown/sample.fadeIn)*fadeVol;
								}
							},100);
							player.intervals.push(stFadeOutInter);
						},(remainToStart)*1000);
						player.timeouts.push(stFadeIn);
					}

					// fadeOut
					if(sample.fadeOut>0){
						var stFadeOut = setTimeout(function(){
							var countdown =  (remainToEnd>sample.fadeOut?sample.fadeOut:remainToEnd);
							var fadeVol = parseFloat(parseFloat(player.getChannel(sample.channelId).volume * sample.volume));			
							var stFadeOutInter = setInterval(function(){
								if(countdown<0)
									clearInterval(stFadeOutInter);
								else{
									sample.aud.volume = countdown/sample.fadeOut*fadeVol;
									console.log('ctd>>'+(countdown -=0.1));
								}
							},100);
							player.intervals.push(stFadeOutInter);
						},(remainToEnd-parseFloat(sample.fadeOut))*1000);
						player.timeouts.push(stFadeOut);
					}
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
	};

	var Sample = class Sample {
	  constructor(id,channelId,file,duration,start,volume,delay,fadeIn,fadeOut) {
	    this.id = id;
	    this.channelId = channelId;
	    this.file = file;
	    this.time = duration;
	    this.delay = delay;
	    this.start = start;
	    this.aud = new Audio();
	    this.aud.src = file; 
	    this.aud.volume = volume;
	    this.volume = volume;
	    this.username = "USER";
	    this.userId = "userId";
	    this.type = "type";	
	    this.fadeIn = fadeIn;
	    this.fadeOut = fadeOut;
	  }
	};
	var Action = class Action {
	  constructor(type,state) {
	  	this.type = type;	
	    this.state = state;	    
	  }
	};
	function random(max){
		return Math.floor((Math.random() * max) + 1);
	}
	function createSoundSpectrum(sample,width,height){
			newCanvas  = createCanvas (width, height);
			context = newCanvas.getContext('2d');
			context = $(newCanvas)[0].getContext('2d');
	 		function createCanvas ( w, h ) {
			    var newCanvas = document.createElement('canvas');
			    newCanvas.width  = w;     newCanvas.height = h;
			    return newCanvas;
			};
			//drawSoundFile(function(data){ },context,newCanvas,height,width,p.getSample(sample.id).aud.src);
			$(sample).find('canvas').remove();
			$(sample).append(newCanvas);
			drawFadeIn(sample);
			drawFadeOut(sample);
		
	}
	function drawFadeIn(sample){
 		var context = ($(sample).find('canvas')).get(0).getContext('2d');
 		context.beginPath();
		context.moveTo(0, $(sample).height());
		context.lineTo(secondsToOffset(p.getSample($(sample).attr('id')).fadeIn), 0);
		context.lineTo(0, 0);
		context.moveTo(0, $(sample).height());
		context.fillStyle = $(sample).css("border-right-color");
		context.fill();
	}
	function drawFadeOut(sample){
 		var context = ($(sample).find('canvas')).get(0).getContext('2d');
 		context.fillStyle = $(sample).css("border-right-color");
		context.beginPath();
		var h = $(sample).height();
		sample = p.getSample($(sample).attr('id'));
		var w = sample.fadeOut;
		context.moveTo(secondsToOffset(sample.time-sample.fadeOut), 0);
		context.lineTo(secondsToOffset(sample.time),h);
		context.lineTo(secondsToOffset(sample.time),0);
		context.fill();
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
	function updateSample(id,start,channelId){
		for (var i = player.samples.length - 1; i >= 0; i--) {
			if(player.samples[i].id == id){
				player.samples[i].start = start;
				player.samples[i].channelId = channelId;
			}
		}
	}
	function updateTimer(time){
		var min = Math.floor(time/60/100),
			sec = Math.floor((time/100)%60),
			mil = Math.floor(time%100);	
		var minInc = (min < 10) ? "0":"";	
			secInc = (sec < 10) ? "0":"";	
			milInc = (mil < 10) ? "0":"";	
		$('#time').text(minInc+min + ':' + secInc+sec + ':' + milInc+mil);		
	}

	function updateTrackName(name){
		$('#trackName').text(name);
	}

	/* UI Functions */

	function zoomIn(){
		if(unit_width>20)
			return;
		unit_width=unit_width*1.1;
		resetComponents();
	}

	function zoomOut(){
		if(unit_width<4)
			return;
		unit_width = unit_width/1.1;
		resetComponents();
	}

	function drawGrid(data){
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
				drawChannel(data.project.tracks[0].track.channels[i].channel);
			}	
			// draw cursorLine
			updateTrackName(data.project.name);
			resetComponents();	
		}

	function drawChannel(channelObject){
		var cells = Math.round(max_time/time_units);						
		var channel = new Channel(channelObject.channelId,channelObject.volume, channelObject.name, channelObject.username, channelObject.instrument);
		// create grid row
		var row = $('<div class="channels_list_row" data-channel="'+ channel.channelId +'"><article class="channel_list_row" ></article><article class="channel_grid_row" id="channel_grid_row_'+channelObject.channelId+'"></article></article></div>');
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
		var list_item = $('<article class="channel_list_row_info"><div class="mini_player">'+svg+svg2+'<div class="volume_placeholder"></div></div> <div class="channel_info"><span class="channel_name">'+ channelObject.name +'</span><div><div class="channel_details"><span class="channel_user">'+channelObject.userId+'</span> - <span class="channel_instrument">'+ channelObject.instrument +'</span><div></article><article class="channel_list_row_btns"><ul><li></li><li class="btn_eye"></li><li class="btn_mic"></li></article>');
		$(list_item).find('.volume_placeholder').append(slider);
		$(row).find('.channel_list_row').append(list_item);
		// create and append, grid cells to grid row
		for (var j = 0; j < cells; j++) {
			$(row).find('.channel_grid_row').append('<div class="time-box"></div><div class="time-box-border"></div>');
		}
		// create and append, grid sample placeholder to grid row
		$(row).find('.channel_grid_row').append('<article class="sample_placeholder" id="sample_placeholder_'+ channelObject.channelId +'" data-channel="'+ channel.channelId +'"></article>');
		// create and append samples on placeolder
		var samples = channelObject.samples;
		for (var j = 0; j < samples.length; j++) {		
			drawSample(row,samples[j].sample.sampleId,channel.channelId, samples[j].sample.file.path,samples[j].sample.duration,samples[j].sample.start,samples[j].sample.volume,samples[j].sample.delay,samples[j].sample.fadeIn,samples[j].sample.fadeOut);
		}	
		p.addChannel(channel);
		// append grid row to channel list
		$('#channels_list').append(row);
	}	

	function drawSample(row, id,channel,file,duration,start,volume,delay,fadeIn,fadeOut){		
		console.log(row);
		$(row).find('.channel_grid_row .sample_placeholder').append('<article class="sample" id="'+id+'" draggable="true" data-duration="'+duration+'" data-start="'+start+'"></article>');
		var resizeTimer;
		$($(row).find('#'+id)).resizable({
		  	handles: 'e, w'
		}).on('resize', function (e) {
				resizeSample($(e.target));
				resetComponents();
			//	$(e.target).addClass('selected');
			// clearTimeout(resizeTimer);
			// resizeTimer = setTimeout(function() {

			// 	e.stopPropagation(); 			            
			// }, 250);
			
		});
		p.addSample(new Sample(id,channel,file,duration,start,volume,delay,fadeIn,fadeOut));
	}

	function resetComponents(){
		$('.channels_grid_title div.time-box').css('width',unit_width*time_units);
		$('main #channels_list > div').css('height',unit_width*3/4*10);
		$('.channel_grid_row').find('div.time-box').css('width',unit_width*time_units);
		var time_offset = secondsToOffset(max_time)+5;
		$('.channels_grid_title').css('width',time_offset);
		$('.channel_grid_row').css('width',time_offset);
		$('#channels_list').css('width',time_offset+grid_offset);
		$('#channels_title').css('width',time_offset+grid_offset);
		updateSampleComponents();
		if(player.isPlaying){
			p.pause();
			$('#cursorLine').css('left',Math.floor(secondsToOffset(player.playTime/100)));
			p.play();
		}
		else
			$('#cursorLine').css('left',Math.floor(secondsToOffset(player.playTime/100)));
		$('#cursorLine').css('height',$('.channel_grid_row').length*(unit_width*3/4*10+1)+24);
	}
	function updateSampleComponents(){
		$('.sample').each(function(data){
			updateSampleComponent(this);
		});	
	}
	function updateSampleComponent(element){
		var sample = p.getSample(element.id);
		var width = sample.time*unit_width+ (sample.time/time_units);
		$(element).css('width',Math.floor(width));
		$(element).css('left',Math.floor(secondsToOffset(sample.start)));
		$('.sample_placeholder[data-channel='+sample.channelId+']').append($('#'+sample.id));
		createSoundSpectrum(element,width,(unit_width*3/4*10+1));
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
	function collouringGridRow(el,isMulti){
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
		$('.channel_pause').not('[data-channel=\''+channelId+'\']').hide();
		$('.channel_play').not('[data-channel=\''+channelId+'\']').show();
		$('.channel_play[data-channel=\''+channelId+'\']').hide();
		$('.channel_pause[data-channel=\''+channelId+'\']').show();
	}
	function modePausingChannel(channelId){
		$('.channel_pause').not('[data-channel=\''+channelId+'\']').hide();
		$('.channel_play').not('[data-channel=\''+channelId+'\']').show();
		$('.channel_play[data-channel=\''+channelId+'\']').show();
		$('.channel_pause[data-channel=\''+channelId+'\']').hide();
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
	    ev.originalEvent.dataTransfer.setData("text", ev.target.id);
	}
	function drop(ev) {
	    ev.preventDefault();
	    moveSample(ev,ev.originalEvent.dataTransfer.getData("text"));
	}

	function moveSample(ev,data){
		console.log('>>>>>>>>>>>>>>>');
	    var dragged = document.getElementById(data);		   
	    var target = ev.target;
	    var new_offset = $('main').scrollLeft()+ ev.pageX - mouseOffsetSampleClicked - grid_offset;
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
	    	target = ($(ev.target).parent()).find('.sample_placeholder');
	    	if(target.length==0){
	    		target = $(ev.target).closest('.sample_placeholder');
	    	}
			console.log(target);
	    	target.append(dragged);
	    	console.log(dragged);
	    	$('#'+data).css('left', new_offset);
	    }

	    console.log('sssssssssss');
	    // z-index up
	    $('#'+data).css('z-index', z_index++);
	    $('#channels_title').css('z-index', z_index++);
	    $('.channel_list_buttons').css('z-index', z_index++);
	    // define new start
	    var borders = Math.floor(new_offset/((time_units*unit_width)));
	    var all = ((new_offset-borders)/(time_units*unit_width))*time_units;
	    $('#'+data).attr('data-start', all);
	    var channelId = $(target).closest('.sample_placeholder').attr('data-channel');
	    p.restoreSampleAction(data);
	    p.updateSampleStart(data,all);
	    p.updateSampleChannel(data,channelId);
	    drawFadeOut($('#'+data));
	    drawFadeIn($('#'+data));
	   // ss.clean();
		if(player.isPlaying){
			p.pause();
			p.play();
		}
	}

	function resizeSample(element){
		p.restoreSampleAction($(element).attr('id'));
		p.updateSampleTime($(element).attr('id'),offsetToSeconds($(element).width()));
		p.updateSampleStart($(element).attr('id'),offsetToSeconds(parseFloat($(element).css('left'))));
		p.updateSampleLoop($(element).attr('id'),true);
		if(player.isPlaying){
			p.pause();
			p.play();
		}
	}

	function playerToggle(){
		if(player.channelId){ // playing only one channel
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
	    	}else{	// playing all channels
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

	function changeCursorPlace(e){
		if(offsetToSeconds($('main').scrollLeft()+ e.pageX  < grid_offset))
			return;
		var secTime = offsetToSeconds($('main').scrollLeft()+ e.pageX  - grid_offset);
		if(player.isPlaying){
			p.pause();
			p.setTime(secTime);
			p.play();
		}
		else
			p.setTime(secTime);		
		$(this).focusout();
	}

	function sampleBringFront(e){
		var sample = $(e.target).closest('.sample');
		$(sample).css('z-index', z_index++);
        $('#channels_title').css('z-index', z_index++);
        $('.channel_list_buttons').css('z-index', z_index++);
		mouseOffsetSampleClicked = e.pageX - $(e.target).offset().left;
	}

	function updateUndoRedoIcons(){
		if(actionController.actionsUndo.length>0)		
			$('#toolbox_btn_undo').css('opacity','1');
		else
			$('#toolbox_btn_undo').css('opacity','0.5');
		if(actionController.actionsRedo.length>0)
	 		$('#toolbox_btn_redo').css('opacity','1');
		else
			$('#toolbox_btn_redo').css('opacity','0.5');
	}

	function cutSample(e){

		var sample = p.getSample(($(e.target).closest('.sample')).attr("id"));	
		ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
		var time = offsetToSeconds(mouseOffsetSampleClicked);

		var clone = jQuery.extend(true, {}, sample);
		clone.delay =  parseFloat(parseFloat(sample.delay) +  parseFloat(time)).toString();
		clone.start = parseFloat(parseFloat(sample.start)+parseFloat(time)).toString();//parseFloat(clone.start) + parseFloat(timeToCut);
		clone.time = parseFloat(parseFloat(sample.time)-parseFloat(time)).toString();//parseFloat(clone.time) - parseFloat(timeToCut)+1;
		clone.id = 'newSample'+sampleIndexGenerator++;
		clone.fadeIn = 0;
		var action_before = sample;	

		sample.time = time.toFixed(1);
		sample.fadeOut = 0;
		
		drawSample($(e.target).closest('.channels_list_row'), clone.id,clone.channelId,clone.file,clone.time,clone.start,clone.volume,clone.delay,clone.fadeIn,clone.fadeOut);
		
		resetComponents();
		cursorType = 'arrow';
		changeCursorPlace(e);
		ac.addAction(new Action('sample_new',jQuery.extend(true, {}, clone)));
		ac.addAction(new Action('sample_split',null));
		updateUndoRedoIcons();
	}

	function fadeIn(sec){
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = p.getSample(selectedSamples.list[i]);
			ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
			sample.fadeIn =sec;
			updateUndoRedoIcons();
			resetComponents();
		}
	}

	function fadeOut(sec){
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = p.getSample(selectedSamples.list[i]);
			ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
			sample.fadeOut =sec;
			updateUndoRedoIcons();
			resetComponents();
		}
	}

	function moveTime(sec){
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = p.getSample(selectedSamples.list[i]);
			ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
			console.log();
			sample.start = parseFloat(parseFloat(sample.start)+parseFloat(sec));
			updateUndoRedoIcons();
			resetComponents();
		}
	}

	function selectedSamples(){
		selectedSamples.list = new Array();
		selectedSamples.operation = null;

		this.add = function(sample){
			$('.sample').css('opacity','1');
			if(!$(sample).hasClass('selected')){
				selectedSamples.list.push($(sample).attr('id'));
				$(sample).addClass('selected');
			}else{
				$(sample).removeClass('selected');
				var index = selectedSamples.list.indexOf($(sample).attr('id'));
				if (index > -1) {
				    selectedSamples.list.splice(index, 1);
				}
				$(sample).removeClass('selected');
			}
			console.log(selectedSamples.list);
		}
		this.clean = function(){
			selectedSamples.list = new Array();
			$('.sample').removeClass('selected');
			$('.sample').css('opacity','1');
			console.log(selectedSamples.list);
		}
		this.executeAndSaveAction = function(callback,operation){
			selectedSamples.operation = operation;
			for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
				var sample = p.getSample(selectedSamples.list[i]);
				ac.addAction(new Action(operation,jQuery.extend(true, {}, sample)));
				callback(sample);
			}
			updateUndoRedoIcons();
			resetComponents();
		}
	}

	function cut(e){
		ss.executeAndSaveAction(function(sample){
			$('#'+sample.id).hide();//.css('opacity','0.2');
		},'cut');
	}
	function copy(e){

	}
	function paste(e){
		ss.executeAndSaveAction(function(sample){
			console.log(sample.id);
			moveSample(e,sample.id);
			$('#'+sample.id).show();
			console.log('paste executed..');
		},'paste');
		ss.clean();
	}

	function deleteSample(e){
		ss.executeAndSaveAction(function(sample){
			//ac.addAction(new Action('sample_delete',sample))
			p.removeSample(sample);			
			$('#'+sample.id).remove();
		},'sample_delete');
	}

	/* Listeners */
	var isShift  = false;
	var isControl  = false;
	var isAlt  = false;
	// Channels
	$(document).on('dragover','.channel_grid_row',function(e){
		allowDrop(e);
	});
	$(document).on('drop','.channel_grid_row',function(e){
		drop(e);
	});
	$(document).on('click','.channel_grid_row',function(e){
		sharedEvent = jQuery.extend(true, {}, e);
		console.log('click channel' + selectedSamples.list.length);
		if($(e.target).hasClass('time-box') && selectedSamples.operation!='cut'){
			ss.clean();
		}
		changeCursorPlace(e);
	});
	// Samples
	$(document).on('dragstart','.sample',function(e){
		drag(e);
	});
	document.addEventListener('contextmenu', event => event.preventDefault());
	$(document).on('mousedown', '.sample , * > .sample',function(e){
		if(isControl){
			if(!isShift){
				ss.clean();
			}
			ss.add($(this));
		}
	    sampleBringFront(e);
	    if(cursorType=='cutter'){	    	
	    	console.debug(player.samples);
	    	cutSample(e);
	    	$('.channel_grid_row').removeClass('cutCursor');
	    }else{
	   		console.log(cursorType);	
	    }
	});
	$(document).on('mouseup','.sample .ui-resizable-handle',function(e){	
		var canvas = $(this).closest('.sample').find('canvas');
		if($(canvas).css('display') == 'none')
			$(canvas).fadeIn();
	});
	$(document).on('keydown', function(e){
		e = e || window.event;
	    if (e.keyCode == '38') { // up arrow
	    }
	    else if (e.keyCode == '40') { // down arrow
	        
	    }
	    else if (e.keyCode == '37') { // left arrow
	    	p.move(-0.25);
	    	moveTime(-0.1);
	    	e.preventDefault();
	    }
	    else if (e.keyCode == '39') { // right arrow
	    	p.move(0.25);
	    	moveTime(0.1);
	    	e.preventDefault();
	    }else if (e.keyCode == '32') { // space
	   		playerToggle();
	    	e.preventDefault();
	    }else if (e.keyCode == '17') { // ctrl
	    	isControl = true;
	    }else if (e.keyCode == '16') { // shift
    		isShift = true;
	    }else if (e.keyCode == '18') { // alt
    		isAlt = true;
	    }
	});
	$(document).on('keyup', function(e){
		isShift  = false;
		isControl  = false;
		isAlt  = false;
	});

	// Scrolling
	$('main').on('scroll',function(){
	    $('#channels_title').css({
	        'top': $(this).scrollTop() 
	    });
	    $('.channel_list_row , .channel_list_buttons').css({
	        'left': $(this).scrollLeft() 
	    });
	});
	// Icons
	$(document).on('click','.channel_pause',function(e){
		var channelId = $(this).attr('data-channel');
		lightChannel();
		p.setChannel();
		p.pause();
		modePausingChannel(player.channelId);
		modePausing();
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
		modePlaying();
		modePlayingChannel(player.channelId);
	});
	$(document).on('click','.channel_name',function(e){
		var channelName = $(this);
		var channelId = $(this).closest('.channels_list_row').attr('data-channel');
		var input = $('<input type="text" value="'+$(this).text()+'">');
		$(channelName).parent().prepend(input);
		$(channelName).hide();
		$(input).focus().focusout(function() {
			update();
		}).select();


		$(input).keydown(function( event ) {
		  if ( event.which == 13 ) {
		  	///update();
		  	$(input).blur();
		   	event.preventDefault();
		  }
		});
		function update(){
			var channel = player.getChannel(channelId);
			channel.name = $(input).val();
			console.log(channel.name);
			
			$(channelName).html($(input).val());
		  	$(channelName).show();
		  	$(input).hide();		  	
		}
	});

// 	<select>
//   <option value="volvo">Volvo</option>
//   <option value="saab">Saab</option>
//   <option value="opel">Opel</option>
//   <option value="audi">Audi</option>
// </select>
	$(document).on('click','#play',function(e){
		lightChannel(null);
		p.setChannel(null);
		p.pause();
		p.play();		
    	modePlaying();
	});
	$(document).on('click','#pause',function(e){
		p.pause();
		p.setChannel(null);    	
		lightChannel(null);
		modePausing();
	});
	$(document).on('click','#stop',function(e){
		p.stop();
		p.setChannel(null);
		lightChannel(null);
		resetPlayPause();
	});
	var timeout;
	$(document).on('mousedown','#backward',function(e){
		var isPlaying = p.isPlaying;
		if(isPlaying)
			p.pause();
		timeout = setInterval(function(){
        	p.move(-0.25);
    	}, 100);
    	if(isPlaying)
    		p.play();
	});
	$(document).on('mousedown','#forward',function(e){
		timeout = setInterval(function(){
        	p.move(0.25);
    	}, 100);
	});
	$(document).on('mouseup','#backward , #forward',function(e){
		clearInterval(timeout);
	});

	$(document).on('click','#toolbox_btn_zoomin',function(){
		zoomIn();
	});
	$(document).on('click','#toolbox_btn_zoomout',function(){
		zoomOut();
	});
	$(document).on('click','#toolbox_btn_cursor',function(){
		cursorType == "arrow";
		$('.channel_grid_row').removeClass('cutCursor');
	});
	$(document).on('click','#toolbox_btn_cutter',function(){
		cursorType = 'cutter';
		$('.channel_grid_row').addClass('cutCursor');
	});
	$(document).on('click','#toolbox_btn_undo',function(){
		ac.undo();	
		updateUndoRedoIcons();
		p.pause();
	});
	$(document).on('click','#toolbox_btn_redo',function(){
		ac.redo();
		updateUndoRedoIcons();
		p.pause();
	});
	$(document).on('click','#toolbox_btn_fadein',function(){
		fadeIn(prompt('fadeIn sec'));
		p.pause();
		resetComponents();
	});

	$(document).on('click','#toolbox_btn_fadeout',function(){
		fadeOut(prompt('fadeOut sec'));
		p.pause();
		resetComponents();
	});
	$(document).on('click','#toolbox_btn_cut',function(e){
		cut(e);
	});
	$(document).on('click','#toolbox_btn_copy',function(e){
		copy(e);
	});
	$(document).on('click','#toolbox_btn_paste',function(e){
		selectedSamples.operation = 'paste';
		if(selectedSamples.operation == 'paste'){
			console.log('paste click screen' + selectedSamples.list.length);
			paste(sharedEvent);
		}
		console.log('paste clicked..');
	});
	$(document).on('click','#toolbox_btn_delete',function(e){
		deleteSample();
	});
	$(document).on('click','#add_channel',function(e){
		var newChannel = {			
				"channelId": "channel_newchannel_" + channelIndexGenerator++,
				"trackId": "track1",
				"userId": "user1",
				"name": "New Channel",
				"instrument": "",
				"volume":"0.6",
				"lock": false,
				"visible": false,
				"samples": []
		};
		drawChannel(newChannel);
	    $('.channel_list_row , .channel_list_buttons').css({
	        'left': $('main').scrollLeft() 
	    });
		resetComponents();
	});

};