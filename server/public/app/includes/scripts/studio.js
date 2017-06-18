var studio = function studio(){
	var max_time = 60*20;
	var time_units = 5;
	var unit_width = 10;
	var z_index = 3;
	var grid_offset = 160;
	var cursorType = null;
	var sampleIndexGenerator = 0;
	var channelIndexGenerator = 0;
	var fileIndexGenerator = 0;
	var p = new player();
	var ac = new actionController();
	var ss = new selectedSamples();
	var sf = new selectedFiles();
	var sc = new selectedChannels();
	var sr = new soundRecorder();
	var mouseOffsetSampleClicked;
	var sharedEvent = null;
	var ctlFiles = new files();
	var ctlProject = new project();
	var ctlUser = new user();
	var ctlAPI = new controllerAPI();
	var ctlDBHelper = new dbHelper();
	var ctlLoader = new loaderWindow();
	var ctlMessage = new messages();

	function messages(){
		var socket = io.connect("https://oran-p2p2-yale.herokuapp.com/");
		socket.emit("subscribe", { room: getURLID() });
		this.send = function(action,msg){
			socket.emit('broadcast', {room:getURLID(),emit:action,msg:msg});
		}
		socket.on("newSample", function(data) {
		    var channel = ctlProject.get(data.channelId);
	    	ctlAPI.getSample(data.channelId,data.sampleId,function(result){
	    		ctlLoader.visibleOneTime(false);
	    		ctlProject.addSample(result);
	    	});
		});
		socket.on("removeSample", function(data) {
			var sample = ctlProject.getSample(data.sampleId);
			ctlProject.removeSample(sample);
		});
		socket.on("updateSample", function(data) {
	    	ctlAPI.getSample(data.channelId,data.sampleId,function(result){
	    		ctlProject.updateSample(result);
	    	});
		});
		socket.on("deleteChannel", function(data) {
			var channel = ctlProject.get(data.channelId);
	    	ctlProject.remove(channel);
		});
		socket.on("addChannel", function(data) {
			ctlAPI.getChannel(data.channelId,function(channelObject){
	    		var channel = new Channel(channelObject._id,channelObject.volume, channelObject.name, channelObject.username, channelObject.instrument
									,channelObject.trackId,channelObject.userId);
	    		ctlProject.add(channel);
	    	});
		});
		socket.on("updateChannel", function(data) {
			ctlAPI.getChannel(data.channelId,function(channelObject){
	    		ctlProject.update(channelObject);
	    	});
		});
	}

	function loaderWindow(){
		var isVisible = false;
		var counter = 0;
		this.visibleOneTime = function(_isVisible){
			isVisible = _isVisible;
		}
		this.inc=function(){
			counter++;
			if(isVisible)
				$('#loader').show();
		}	
		this.dec=function(){
			if(!--counter){
				$('#loader').fadeOut();
				isVisible=true;
			}
		}	
	}

	this.init = function init(){
		$('#loader').show();
		// Init studio
		ctlAPI.getUserInfo(function(result){

	        	// load user information
				ctlUser.init(result);

				// get user FILES
				ctlAPI.getFileByUser(result._id,function(result){
					ctlFiles.init(result);
				});
				
				// get user PROJECT 
				ctlAPI.getProject(getURLID(),function(result){
					
					// set project name and prepare project grid
					drawGrid((result==null?"":result.name));
					// load user project
					ctlProject.init(result);
					// init ui
					studioUI(ctlAPI,(result==null?"":result._id));

					$('#loader').fadeOut();
				});
	        
	    });
	};

	this.preview = function(projectId,callback){
		ctlAPI.getProject(projectId,function(result){
			ctlProject.init(result,function(p){
				callback(p);
			});			
		});
	}


	/* UI Objects */

	function files(){
		var _this = this;
		this.map = {};
		this.init = function(data){
			for (var i = 0; i < data.files.length; i++) {

				this.add({type:'files', file: data.files[i]});
			}
			for (var i = 0; i < data.sharedFiles.length; i++) {
				this.add({type:'sharedFiles',file: data.sharedFiles[i]});
			}
		}
		this.add = function(data){	
			ctlAPI.isFileExist(data.file._id,function(result){
				if(result){
					_this.map['file'+data.file._id]=data.file;
					$('#'+data.type).append('<li class="file" draggable="true" id="file'+data.file._id+'">'+ data.file.name+'</li>');
				}
			});	
		}
		this.remove = function(file){
			$('file'+file._id).remove();
			this.map.delete('file'+file._id);
		}
		function fixPrefix(path){
			if(path.substring(0,5)=="http:" && location.href.substr(0,5) =="https")
				path = 'https:'+path.substring(5,path.length);
		}
	};

	function user(){

		user.user = null;
		user.files = null;
		user.sharedFiles = null;

		this.init = function(data){
			user.user = data;
            $('div.username span:first').text(data.email);
            $('header #connected_user .user_img').css('background-image','url('+data.picture+')');
		};
	};

	function project(data){
		var _this = this;

		this.channels = {};

		this.contributors = {};

		this.json = {};

		this.track_version = null;

		this.init = function(data,callback){
			if(data==null)				
				data ={tracks:[]}				
			this.json = data;
			this.track_version =  data.track_version._id;
			ctlAPI.getContributors(data._id,function(result){
				_this.contributors[result.adminUser._id] = {user:result.adminUser,access:"admin"};
				for (var i = 0; i < result.users.length; i++) {
					_this.contributors[result.users[i].user._id] = result.users[i];
				}
				
				if(!data.track_version)
					return;
				for (var i = 0; i < data.track_version.channels.length; i++) {
					_this.add(_this.jsonToChannel(data.track_version.channels[i]));
				}
				_this.toJson();
				if(callback)
					callback(p);
			});
		
		}
		this.jsonToChannel = function(channelObject){ 
			var channel = new Channel(channelObject._id,channelObject.volume, channelObject.name, channelObject.username, channelObject.instrument
				,channelObject.trackId,channelObject.userId);				
			// samples
			var samples = channelObject.samples;
			if(samples.length>0)
			for (var j = 0; j < samples.length; j++) {	
				try {	
					var sample = _this.jsonToSample(samples[j]);
					channel.addSample(sample);				
				}catch(err){
					console.log(err.message);
				}
			}
			return channel;	
		}
		this.jsonToSample = function(jsonObj){
			return new Sample(jsonObj._id,jsonObj.channelId,jsonObj.file.path,jsonObj.file._id,
			jsonObj.duration,jsonObj.start,jsonObj.volume,jsonObj.delay,
			jsonObj.fadein,jsonObj.fadeout);	
		}
		this.add = function(channel){
			this.channels[channel.channelId] = channel;
			channel.draw();
		}
		this.get = function(channelId){
			return this.channels[channelId];
		}
		this.remove = function(channel){
			$('[data-channel='+channel.channelId+']').remove();
			updateSampleComponents();
			resetCursor();
			channel.remove();
			delete this.channels[channel.channelId];
		}
		this.update = function(channelJson){
			var channel = _this.jsonToChannel(channelJson),
				old = this.get(channel.channelId);
			old.remove();
			for (var i = Object.size(channel.samples) - 1; i >= 0; i--) {
				old.addSample(channel.samples[Object.keys(channel.samples)[i]]);
				channel.samples[Object.keys(channel.samples)[i]].draw();
			}
			console.log(channel);
		}
		this.eachSample = function(callback){
			$.each( Channel.allSamples, function( i, sample ){
				callback(sample);
			});			
		}
		this.getSample = function(sampleId){
			return Channel.allSamples[sampleId];
		}
		this.addSample = function(sampleJson){
			var sample = _this.jsonToSample(sampleJson),
				channel = _this.get(sample.channelId);
			sample.channelId = channel.channelId;
	    	channel.samples[sample.id] = sample;	    	
	    	Channel.allSamples[sample.id] = sample;
	    	sample.draw();
		}
		this.updateSample = function(sampleJson){
			var sample = _this.jsonToSample(sampleJson);
			this.removeSample(sample);
			this.addSample(sampleJson);
		}
		this.removeSample = function(sample){
			$('#'+sample.id).remove();
			ctlProject.get(sample.channelId).removeSample(sample);
		}
		this.toJson = function(){
			var jChannels = [];
			$.each(this.channels, function( i, channel ){
				jChannels.push(channel.toJson())
			});	
			if(this.json.tracks.length==0)
				this.json.tracks = [{track:{}}];
			this.json.track_version.channels = jChannels;
			return this.json;
		}

	}

	function actionController(){
		actionController.lock = false;
		actionController.actionsUndo = new Array();
		actionController.actionsRedo = new Array();
		this.removeAction = function(){
			actionController.actionsUndo.pop();
			actionController.actionsRedo.pop();
		}
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
			var before = (action.state!=null?getSampletById(action.state.id):null);
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
				case 'sample_hide':{
					sample_hide(this);	
					break;
				}
				case 'sample_show':{
					sample_show(this);	
					break;
				}
				case 'sample_paste':{
					this.redo();
					this.redo();
					actionController.actionsUndo.push(new Action('sample_paste',null));	
					break;
				}
				case 'sample_cut_copy':{
					this.redo();
					this.redo();
					actionController.actionsUndo.push(new Action('sample_cut_copy',null));	
					break;
				}
				case 'channel_delete':{
					channel_delete(this);
					break;
				}
				case 'channel_new':{
					channel_new(this);
					break;
				}
			}
			function sample_show(parent){
				actionController.actionsUndo.push(new Action('sample_hide',before));	
				parent.restoreAction(action);	
			}
			function sample_hide(parent){
				actionController.actionsUndo.push(new Action('sample_show',before));	
				parent.restoreAction(action);	
			}
			function sample(parent){
				actionController.actionsUndo.push(new Action('sample',jQuery.extend(true, {}, before)));
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
			function channel_delete(parent){
				actionController.actionsUndo.push(new Action('channel_new',action.state));	
				parent.restoreAction(action);	
			}
			function channel_new(parent){
				actionController.actionsUndo.push(new Action('channel_delete',action.state));	
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
			var before = ctlProject.getSample(action.state.id);
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
				case 'sample_hide':{
					sample_hide(this);	
					break;
				}
				case 'sample_show':{
					sample_show(this);	
					break;
				}
				case 'sample_paste':{
					this.undo();
					this.undo();
					actionController.actionsRedo.push(new Action('sample_paste',null));	
					break;
				}
				case 'sample_cut_copy':{
					this.undo();
					this.undo();
					actionController.actionsRedo.push(new Action('sample_cut_copy',null));	
					break;
				}
				case 'channel_new':{
					channel_new(this);
					break;
				}
				case 'channel_delete':{
					channel_delete(this);
					break;
				}
			}


			function sample_show(parent){
				actionController.actionsRedo.push(new Action('sample_hide',before));	
				parent.restoreAction(action);	
			}
			function sample_hide(parent){
				actionController.actionsRedo.push(new Action('sample_show',before));	
				parent.restoreAction(action);	
			}
			function sample(parent){
				actionController.actionsRedo.push(new Action('sample',jQuery.extend(true, {}, before)));	
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
			function channel_new(parent){
				actionController.actionsRedo.push(new Action('channel_delete',action.state));	
				parent.restoreAction(action);
			}
			function channel_delete(parent){
				actionController.actionsRedo.push(new Action('channel_new',action.state));	
				parent.restoreAction(action);
			}
		};
		this.restoreAction = function(action){	
			console.log(action.type);
			console.log(action.state);
			switch(action.type){
				case 'sample':{
					//p.updateSample();
					//console.log(action.state);
					//var s = getSampletById(action.state.id);
					//s.clone(jQuery.extend(true, {}, action.state));
					//s.draw();
				
					// var clone = jQuery.extend(true, {}, action.state);
					// ctlProject.removeSample(action.state.id);
					// ctlProject.addSample(clone.toJson2());
					break;
				}
				case 'sample_new':{
					// $('#'+action.state.id).remove();
					// ctlProject.get(action.state.channelId).removeSample(action.state);
					// ctlDBHelper.deleteSample(action.state.id);					
					break;
				}
				case 'sample_delete':{
					// ctlProject.get(action.state.channelId).addSample(action.state);	
					// action.state.draw();
					// ctlDBHelper.createSample(action.state.id);
					break;
				}
				case 'sample_show':{
					//$('#'+action.state.id).hide();
					break;
				}
				case 'sample_hide':{
					//$('#'+action.state.id).show();
					break;
				}
				case 'channel':{

					break;
				}
				case 'channel_new':{
					$('#'+action.state.id).remove();
					ctlProject.remove(action.state);
					break;
				}
				case 'channel_delete':{		
					$.map( action.state.samples, function( val, i ) {
						Channel.allSamples[val.id] = val;
					});
					ctlProject.add(action.state);
					break;
				}
			}
			lock = false;
		}
	}

	function player(data){
		player.volume = 1;
		player.channels = new Array();
		player.timeouts = new Array();
		player.intervals = new Array();
		player.mutedChannels = new Array();
		player.mutedChannelsFlag=true;
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
		this.setVolume = function(volume){
			player.volume = volume;
			ctlProject.eachSample(function(sample){
				var channelVolume = ctlProject.channels[sample.channelId].volume;
				sample.aud.volume = channelVolume*volume*sample.volume;
			});

		};

		this.setTime =  function(playTime){
			player.playTime = playTime*1000;	
			updateTimer(player.playTime);
		}

		this.move =  function(playTime){
			$('#cursorLine , .cursorCircle').stop()
			console.log((player.playTime+playTime)/1000 + ' ' + secondsToOffset(playTime));
			var isPlaying = player.isPlaying;
			if(isPlaying)
				this.pause();
			if(playTime+player.playTime/1000 <=max_time && playTime+player.playTime/1000>=0){
				$('main').animate({scrollLeft: ($('main').scrollLeft() + secondsToOffset(playTime)) + 'px'}, 0);
				this.setTime(player.playTime/1000 + playTime);
			}else if(!(playTime+player.playTime/1000>=0))
				this.setTime(0);
			else
				this.setTime(max_time);
			if(isPlaying)
				this.play();
			setCursorOnSec(player.playTime/1000);
		}

		this.setChannel = function(channelId){
			player.channelId = channelId;
		}
		
		this.changeChannelVolume = function(channelId,volume){
			ctlProject.channels[channelId].volume = volume;
			 $.each(ctlProject.channels[channelId].samples,function(i,value){
			 	value.aud.volume = volume * value.volume * player.volume;
			 	console.log(value.id +': ' + value.aud.volume)
			 });
		};
		this.play = function(){
				if(player.isPlaying)
					return;
				console.log('play: '+ player.playTime);
				player.isPlaying = true;
				var a = 0;
				var startTime =  new Date();
				var playSecond = player.playTime;
				startTimer();
				function startTimer(){
					var countingMS =  (Math.abs(new Date()-startTime) +parseInt(playSecond));
					player.playTime=countingMS									
					updateTimer(countingMS);	
					var t = setTimeout(startTimer, 10);
					player.timeouts.push(t);
				}

				ctlProject.eachSample(function(sample) {
					var playerTimeSec = parseFloat(player.playTime)/1000;
					var a = parseFloat(sample.start);  // second of start sample
					var b = parseFloat(sample.start) + parseFloat(sample.duration); // second of end sample
					var c = playerTimeSec; // second of cursor position
					var remainToStart = a-c;
					var remainToEnd = b-c;
					var startAt = c-a;
					if((player.channelId && player.channelId != sample.channelId )|| (player.mutedChannels.indexOf(sample.channelId)>-1&&player.mutedChannelsFlag))
						return; // sample channel muted
					if(c<a){ // play from start
						startAt = 0;
					}
					if(a<c&&c<b){ // play from middle
						remainToStart = 0;
						startAt = parseFloat(c-a)%parseFloat(sample.duration);
					}
					if(c>b){ // play after ends
						return;
					}
					console.log('start: ' + remainToStart + ' end: ' + remainToEnd + ' at: ' + startAt);

					var st1 = setTimeout(function(){		
						sample.aud.volume = (sample.fadeIn>0&&remainToStart>0?0:parseFloat(ctlProject.channels[sample.channelId].volume * sample.volume * player.volume));
						sample.aud.currentTime = startAt+ parseFloat(sample.delay);
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
							var stFadeOutInter = setInterval(function(){
								var channelVol = parseFloat(ctlProject.channels[sample.channelId].volume);
								if(countdown>sample.fadeIn)	
									clearInterval(stFadeOutInter);
								else{
									countdown +=0.1;
									sample.aud.volume = (countdown/sample.fadeIn)*sample.volume*channelVol*player.volume;
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
							var stFadeOutInter = setInterval(function(){
								var channelVol = parseFloat(ctlProject.channels[sample.channelId].volume);
								if(countdown<0)
									clearInterval(stFadeOutInter);
								else{
									sample.aud.volume = countdown/sample.fadeOut*sample.volume*channelVol*player.volume;
									(countdown -=0.1)
								}
							},100);
							player.intervals.push(stFadeOutInter);
						},(remainToEnd-parseFloat(sample.fadeOut))*1000);
						player.timeouts.push(stFadeOut);
					}
				});
			
				// cursor
				$('#cursorLine , .cursorCircle').stop().css({'left':secondsToOffset(player.playTime/1000)})
				.animate({'left':secondsToOffset(max_time)},(max_time*1000-player.playTime), 'linear');
			};
		this.pause = function(){
			console.log('pause: '+player.playTime);
			player.isPlaying = false;
			// music
				ctlProject.eachSample(function(sample) {
					sample.aud.pause();
				});		
				this.clear();		
			// cursor
			$('#cursorLine , .cursorCircle').stop();
		};
		this.stop = function(){
			console.log('stop');
			player.isPlaying = false;
			// music
				ctlProject.eachSample(function(sample) {
					sample.aud.pause();
					sample.aud.currentTime = 0;
				});		
				player.playTime=0;
				$('#time').text('00:00:00');	
				this.clear();	
			// cursor
			$('#cursorLine , .cursorCircle').stop().css({'left':0});
		};

		this.clear = function(){
			console.log('clear...');
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

	function metronome(){
		metronome.st = null;
		metronome.rounds = 100;
		metronome.isPlaying = false;
		this.start = function(){
			metronome.st =setInterval(function(){
				console.log('tick..');
				var aud = new Audio();
			    aud.src = '../../static/includes/loops/tick.mp3'; 
			    aud.volume = 1;
			    aud.play();
			    metronome.isPlaying = true;
			},60000/metronome.rounds);
		};
		this.rounds = function(rounds){
			metronome.rounds=rounds;
		};
		this.stop = function(){
			clearInterval(metronome.st);
			metronome.isPlaying = false;
		};
		this.reset = function(){
			if(metronome.isPlaying){
				this.stop();
 				this.start();
 			}
		}
	}


	function soundRecorder(){
		var audio_context;
		var recorder;
		var time_record=0;
		var startAt = 0;	
		this.timer = null;
		this.recordChannelId = null;
		function startUserMedia(stream) {
		    var input = audio_context.createMediaStreamSource(stream);

		    // Uncomment if you want the audio to feedback directly
		    //input.connect(audio_context.destination);
		    //__log('Input connected to audio context destination.');
	
		    recorder = new Recorder(input);
		}


		this.recordStart = function(recordChannelId){
			this.recordChannelId = recordChannelId;
			var gohst = $('<article class="sample" id="ghostsample" style="background-color:red;width:0px;left:'+ secondsToOffset(player.playTime/1000)+'px"></article>');
			startAt = player.playTime;
	    	recorder && recorder.record();
		    $('#startRecord').hide();
		    $('#stopRecord').show();
		    $('.sample_placeholder[data-channel='+recordChannelId+']').append(gohst);
		    time_record=0;
		    this.timer = setInterval(function(){
				time_record+=0.1;
				$(gohst).css('width',secondsToOffset(time_record));
			},100);
			var element = $('.channels_list_row[data-channel='+recordChannelId+'] .btn_mic');
			$(element).addClass('btn_mic_recording');
			$(element).removeClass('btn_mic');
			p.play()
		}
		this.recordStop = function(){
			if(this.timer==null)
				return;
			recorder && recorder.stop();
		    $('#startRecord').show();
		    $('#stopRecord').hide();
		    this.createDownloadLink();
		  	clearInterval(this.timer);
		  	this.timer=null;
		    recorder.clear();		    
		    $('#ghostsample').remove();
		    var element = $('.channels_list_row[data-channel='+this.recordChannelId+'] .btn_mic_recording');
		   	$(element).addClass('btn_mic');
			$(element).removeClass('btn_mic_recording');
			p.pause()
		}

		this.createDownloadLink = function() {
		    recorder && recorder.exportWAV(function(blob) {
		      var url = URL.createObjectURL(blob);
		      var li = document.createElement('li');
		      var au = document.createElement('audio');
		      var hf = document.createElement('a');
		      
		      au.controls = true;
		      au.src = url;
		      hf.href = url;
		      hf.download = new Date().toISOString() + '.wav';
		      hf.innerHTML = hf.download;
		      li.appendChild(au);
		      li.appendChild(hf);
		      var file = {
			      	file:{
						"fileId": 'newFile'+ (++fileIndexGenerator),
						"userId": "",
						"privacy": "",
						"name": hf.download,
						"path": url,
						"size":blob.size,
						"duration":time_record+'',
						"shared":["user2"]	
						}
				};

			    var form = $('<form enctype="multipart/form-data"><input name="file" type="file" /><input type="button" value="Upload" /></form><progress></progress>');
			    var input = $(form).find('input[name="file"]');
		    	console.log(input);
			    if (blob.size > 1024) {
			        alert('max upload size is 1k');
			    }
			    console.log(url);
		    	// Also see .name, .type
		   		var audio = new Audio();
		   		audio.src= URL.createObjectURL(blob);
		   		audio.onloadedmetadata = function() {
		   			var formData  = new FormData();
		   			var fileCast = new File([blob], hf.download);
		   			formData.append('file', fileCast);
				 	ctlDBHelper.uploadFile(user.user._id,formData,audio.duration,blob.size,function(file){
				 		drawRecord({file:file},sr.recordChannelId,startAt/1000);
				 	});
				};

			 	// draw


		    });
		}

		window.onload = function init() {
		    try {
		      // webkit shim
		      window.AudioContext = window.AudioContext || window.webkitAudioContext;
		      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

		      window.URL = window.URL || window.webkitURL;
		      
		      audio_context = new AudioContext;
		      //console.log('Audio context set up.');
		      //console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
		    } catch (e) {
		     // console.log('No web audio support in this browser!');
		    }
		    
		    navigator.getUserMedia({audio: true},  startUserMedia, function(e) {
		     // console.log('No live audio input: ' + e);
		    });
		};
	}

	var Channel = class Channel {
	  constructor(channelId,volume,name,username,instrument,trackId,userId) {
	  	this.channelId = channelId;	
	    this.volume = volume;
	    this.name = name;	
	    this.username = username;		    
	    this.instrument = instrument;		
	    this.samples = {};   
	    this.trackId = trackId;
	    this.userId = userId;
		var _this = this;

	    this.remove = function(){
	    	$.each( this.samples, function( i, sample ){
				_this.removeSample(sample);
			});
	    }

	    this.addSample = function(sample){
	    	sample.channelId = this.channelId;
	    	this.samples[sample.id] = sample;	    	
	    	Channel.allSamples[sample.id] = sample;
	    } 
	    this.removeSample = function(sample){
	    	try{
		    	console.log('delete: '+sample.id)	    	
		    	$('#'+sample.id).remove();
				//sample.aud.pause()
				this.samples[sample.id].aud.pause();
				Channel.allSamples[sample.id].aud.pause();
		    	delete this.samples[sample.id];
		    	delete Channel.allSamples[sample.id];
		    	p.reset();
	    	}
	    	catch(e){}
	    } 
	    this.toJson = function(){
	    	var samples = [];
	    	$.each( this.samples, function( i, sample ){
				samples.push(sample.toJson());

			});
	    	return {
					"channel": {
						"channelId": this.channelId,
						"trackId":  this.trackId,
						"userId": this.userId,
						"name": this.name,
						"instrument": this.instrument,
						"volume":this.volume,
						"lock": false,
						"visible": false,
						"samples": JSON.stringify(samples)
					}
				}
	    }

		this.draw = function(){					
			var channel = this;
			// create grid row
			var row = $('<div class="channels_list_row" data-channel="'+ channel.channelId +'"><article class="channel_list_row" ></article><article class="channel_grid_row" id="channel_grid_row_'+channel.channelId+'"></article></article></div>');
			// create and append, grid cells to grid row
			var svg = '<?xml version="1.0" ?><svg  class="channel_play player-icon" data-channel="'+ channel.channelId +'" version="1.1" viewBox="0 0 20 20" width="20px" xmlns="http://www.w3.org/2000/svg" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns:xlink="http://www.w3.org/1999/xlink"><title/><desc/><defs/><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g  id="Icons-AV" transform="translate(-126.000000, -85.000000)"><g class="player-fill" transform="translate(126.000000, 85.000000)"><path d="M10,0 C4.5,0 0,4.5 0,10 C0,15.5 4.5,20 10,20 C15.5,20 20,15.5 20,10 C20,4.5 15.5,0 10,0 L10,0 Z M8,14.5 L8,5.5 L14,10 L8,14.5 L8,14.5 Z" id="Shape"/></g></g></g></svg>';
			var svg2 = '<svg version="1.1"  class="channel_pause player-icon" data-channel="'+ channel.channelId +'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 300.003 300.003" style="enable-background:new 0 0 300.003 300.003;" xml:space="preserve"><g><path class="player-fill" d="M150.001,0c-82.838,0-150,67.159-150,150c0,82.838,67.162,150.003,150,150.003c82.843,0,150-67.165,150-150.003C300.001,67.159,232.846,0,150.001,0z M134.41,194.538c0,9.498-7.7,17.198-17.198,17.198s-17.198-7.7-17.198-17.198V105.46c0-9.498,7.7-17.198,17.198-17.198s17.198,7.7,17.198,17.198V194.538z M198.955,194.538c0,9.498-7.701,17.198-17.198,17.198c-9.498,0-17.198-7.7-17.198-17.198V105.46c0-9.498,7.7-17.198,17.198-17.198s17.198,7.7,17.198,17.198V194.538z"/></g></svg>'
			var svg3 = 	'<svg version="1.1" class="channel_stop player-icon" data-channel="'+ channel.channelId +'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"'+
						' viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">'+
						'<path class="player-fill" d="M256,0C114.617,0,0,114.617,0,256s114.617,256,256,256s256-114.617,256-256S397.383,0,256,0z M336,320'+
						'c0,8.836-7.156,16-16,16H192c-8.844,0-16-7.164-16-16V192c0-8.836,7.156-16,16-16h128c8.844,0,16,7.164,16,16V320z"/>';
			
			var checkbox = '<input type="checkbox" id="checkbox'+channelId+'" class="css-checkbox lrg"/><label for="checkbox'+channelId+'" name="checkbox'+channelId+'_lbl" class="css-label lrg web-two-style"></label>';
			var slider = $('<div class="slider-vertical"></div>');
			var resizeTimer;
			$(slider).slider({
			    orientation: "horizontal",
			    range: "min",
			    min: 0,
			    max: 100,
			    value: parseFloat(channel.volume*100),
			    slide: function( event, ui ) {
		 			p.changeChannelVolume(channel.channelId,ui.value*0.01);
		 			clearTimeout(resizeTimer);
					resizeTimer = setTimeout(function(){
						ctlDBHelper.updateChannel(channel.channelId);
					},250);	
		  	    }
			});
			var list_item = $('<article class="channel_list_row_info"><div class="mini_player">'+svg+svg2+'<div class="volume_placeholder"></div></div> <div class="channel_info"><span class="channel_name">'+ channel.name +'</span><div><div class="channel_details"><span class="channel_user">'+
			ctlProject.contributors[channel.userId].user.firstName
				+'</span> - <span class="channel_instrument">'+ channel.instrument +'</span><div></article><article class="channel_list_row_btns"><ul><li class="checkbox">'+checkbox+'</li><li class="btn_eye"></li><li class="btn_mic"></li></article>');
			$(list_item).find('.volume_placeholder').append(slider);
			$(row).find('.channel_list_row').append(list_item);
			// create and append, grid cells to grid row
			var cells = Math.round(max_time/time_units);						
			for (var j = 0; j < cells; j++) {
				$(row).find('.channel_grid_row').append('<div class="time-box"></div><div class="time-box-border"></div>');
			}
			// create and append, grid sample placeholder to grid row
			$(row).find('.channel_grid_row').append('<article class="sample_placeholder" id="sample_placeholder_'+ channel.channelId +'" data-channel="'+ channel.channelId +'"></article>');
			// append grid row to channel list
			$('#channels_list').append(row);
			// styles
			$(row).find('div.time-box').css('width',unit_width*time_units);
			$(row).find('.channel_grid_row').css('width',secondsToOffset(max_time)+5);
			$('#cursorLine').css('height',$('.channel_grid_row:visible').length*(unit_width*3/4*10+1)+24);
			$(row).css('height',unit_width*3/4*10);
			// draw samples
			$.each( this.samples, function( i, sample ){
				sample.draw();
			});
		}

	  }

	};
	Channel.allSamples = {};


	var Sample = class Sample {

	  constructor(id,channelId,file,fileId,duration,start,volume,delay,fadeIn,fadeOut) {
	     var _this = this;
	     var isloaded = false;
	    this.id = id;
	    this.channelId = channelId;
	    this.file = file;
	    this.fileId = fileId;
	    this.duration = duration;
	    this.delay = delay;
	    this.start = start;
	   	this.aud = new Audio();
	    this.volume = volume;
	    this.username = "USER";
	    this.userId = "userId";
	    this.type = "type";	
	    this.fadeIn = fadeIn;
	    this.fadeOut = fadeOut;
	    this.clone =function(data){
	    	this.id = data.id;
		    this.channelId = data.channelId;
		    this.file = data.file;
		    this.duration = data.time;
		    this.delay = data.delay;
		    this.start = data.start;
			this.aud = new Audio();
		    this.volume = data.volume;
		    this.username = data.username;
		    this.userId = data.userId;
		    this.type = data.type;	
		    this.fadeIn = data.fadeIn;
		    this.fadeOut = data.fadeOut;
		    this.loop = data.loop;
	    }
	  

	  //   loadFile();
	  //   this.loadFile = function(){
	  //   	loadFile();
	  //   };

	  //   function loadFile(){
	  //   	$('#'+_this.id).css('opacity','0.1');
	  //   	var request = new XMLHttpRequest();
			// request.open("GET", _this.file, true);
			// request.responseType = "blob";    
			// request.onload = function() {
			//   if (this.status == 200) {
			//     var audio = new Audio(URL.createObjectURL(this.response));
			//     _this.aud = audio;
			//     _this.aud.load();
			//     _this.aud.currentTime = parseFloat(_this.start)+ parseFloat(_this.delay);		    
			// 	$('#'+_this.id).animate({opacity:1},1000);
			// 	console.log();
			//   }
			// }
			// request.send();
	  //   }

	    this.toJson = function(){
	    	return {
	    			"sampleId" : this.id,
	    			"channelId": this,channelId,
					"fadein": this.fadeIn,
					"fadeout": this.fadeOut,
					"start": this.start,
					"volume": this.volume,
					"duration": this.duration,
					"delay": this.delay,
					"file":  this.fileId,
					"path":  this.file					
	    	}
	    }

	    this.toJson2 = function(){
	    	return {
	    			"sampleId" : this.id,
	    			"channelId": this,channelId,
					"fadein": this.fadeIn,
					"fadeout": this.fadeOut,
					"start": this.start,
					"volume": this.volume,
					"duration": this.duration,
					"delay": this.delay,
					"file":  {
						"_id":this.fileId,
						"path": this.file,
						"duration": this.duration
					}				
	    	}
	    }

	    this.reload = function(_this){	 
	   		$('#'+_this.id).css('opacity','0.2');   	
	    	var request = new XMLHttpRequest();
			request.open("GET", _this.file, true);
			request.responseType = "blob";    
			request.onload = function() {
			  if (this.status == 200) {
			    var audio = new Audio(URL.createObjectURL(this.response));
			    _this.aud = audio;
			    _this.aud.load();
			    _this.aud.pause();
			    _this.aud.currentTime = parseFloat(_this.start)+ parseFloat(_this.delay);
			    p.reset();		    
				$('#'+_this.id).animate({opacity:1},1000);
				isloaded = true;
			  }
			}
			request.send();
	    }

	    this.draw = function(){
			var _this = this;

	    	if($('#'+this.id).length>0)
	    		$('#'+this.id).remove();
	    	var row = $('.channels_list_row[data-channel="'+ this.channelId +'"]');
			var _sample = $('<article class="sample" id="'+this.id+'" draggable="true" data-duration="'+this.duration+'" data-start="'+this.start+'"><div class="sample-info">'+ctlFiles.map['file'+this.fileId].name+'</div></article>');
			var width = this.duration*unit_width+ (this.duration/time_units);
			var height = unit_width*3/4*10-2;
			
			$(_sample).css('width',Math.floor(width))
			.css('height',Math.floor(height))
			.css('left',Math.floor(secondsToOffset(this.start)));

			if(!isloaded){
				$(_sample).css('opacity','0.2');
				_this.reload(_this);
			}
			
			$(row).find('.channel_grid_row .sample_placeholder').append(_sample);			
			createSoundSpectrum($(_sample),width,height);
			var resizeTimer;
			var state = this;
			$($(row).find('#'+this.id)).resizable({
			  	handles: 'e, w'
			}).on('resize', function (e) {
					_this.duration = offsetToSeconds($(e.target).width());
					_this.start = 	offsetToSeconds(parseFloat($(e.target).css('left')));
					_this.aud.loop = true;
					createSoundSpectrum($(e.target),$(e.target).width(),$(e.target).height());	
					clearTimeout(resizeTimer);
					resizeTimer = setTimeout(function(){
						if(player.isPlaying){
							p.pause();
							p.play();
						}
						ctlDBHelper.updateSample(_this.id);
					},250);		
			});
	    }
	  }	 
	};


	var Action = class Action {
	  constructor(type,state) {
	  	this.type = type;	
	    this.state = state;	    
	  }
	};

	function selectedFiles(){
		selectedFiles.list = new Array();
		selectedFiles.operation = null;

		this.add = function(file){
			$('.file').css('opacity','1');
			if(!$(file).hasClass('selected')){
				selectedFiles.list.push($(file).attr('id'));
				$(file).addClass('selected');
			}else{
				$(file).removeClass('selected');
				var index = selectedFiles.list.indexOf($(file).attr('id'));
				if (index > -1) {
				    selectedFiles.list.splice(index, 1);
				}
				$(file).removeClass('selected');
			}
		}
		this.clean = function(){
			selectedFiles.list = new Array();
			$('.file').removeClass('selected').css('opacity','1');
		}
	};

	function selectedChannels(){
		selectedChannels.list = new Array();
		selectedChannels.operation = null;

		this.add = function(channel){
			if(!$(channel).hasClass('selected')){
				selectedChannels.list.push($(channel).attr('id'));
				$(channel).addClass('selected');
			}else{
				$(channel).removeClass('selected');
				var index = selectedChannels.list.indexOf($(channel).attr('id'));
				if (index > -1) {
				    selectedChannels.list.splice(index, 1);
				}
				$(channel).removeClass('selected');
			}
		}
		this.clean = function(){
			selectedChannels.list = new Array();
			$('.channels_list_row').removeClass('selected');
		}
	};

	function selectedSamples(){
		selectedSamples.list = new Array();
		selectedSamples.operation = null;
		this.channels = {};

		this.add = function(sample){
			$('.sample').css('opacity','1');
			if(!$(sample).hasClass('selected')){
				selectedSamples.list.push($(sample).attr('id'));
				$(sample).addClass('selected');
				var channelId = $(sample).closest('.channels_list_row').attr('data-channel');
				this.channels[channelId] = channelId;
				
			}else{
				$(sample).removeClass('selected');
				var index = selectedSamples.list.indexOf($(sample).attr('id'));
				if (index > -1) {
				    selectedSamples.list.splice(index, 1);
				}
				$(sample).removeClass('selected');
			}
		}
		this.clean = function(){
			selectedSamples.list = new Array();
			$('.sample').removeClass('selected').css('opacity','1');
		}

		this.updateSamplesChannels = function(){
			var _this = this;
			$(this.channels).each(function(key,value){
				ctlDBHelper.updateChannel(_this.channels[Object.keys(_this.channels)[key]]);
			});
		};

		this.updateSamples = function(){
			$(selectedSamples.list).each(function(key,value){
				ctlDBHelper.updateSample(selectedSamples.list[key]);	
			});
		}
	}

	function dbHelper(){
		var _this = this;
		this.deleteChannel = function(channelId){
			ctlAPI.deleteChannels(channelId,function(data){
				console.log('delete..');
				ctlMessage.send("deleteChannel",{"channelId":channelId});
			});
		};
		this.createChannel = function(channelObject){
			var generatedId = 'channel'+channelIndexGenerator++;
			var channel = new Channel(generatedId,channelObject.volume, channelObject.name, channelObject.username, channelObject.instrument, channelObject.trackId, channelObject.userId);				
			ctlProject.add(channel);			
			ctlAPI.addChannels(channelObject,function(data){
				if(!data)
				 console.log('error updating server..'+ data.message);
				else{
					console.log(data);							
					var clone = jQuery.extend(true, {}, channel);
					clone.channelId = data._id;
					ctlProject.remove(channel);
					ctlProject.add(clone)
					ctlMessage.send("addChannel",{"channelId":clone.channelId});
					ac.addAction(new Action('channel_new',jQuery.extend(true, {}, channel)));
				}
			});
		};
		this.updateChannel = 	function(channelId){
			var channel = ctlProject.channels[channelId];	
			ctlAPI.updateChannel(channel.toJson().channel,channel.channelId,function(data){
				if(!data) console.log('error updating server..');				
			});
			ctlMessage.send("updateChannel",{"channelId":channelId});
		}
		this.createSample = function(sampleId,callback){
			var sample = ctlProject.getSample(sampleId);
			var sj = sample.toJson();
			ctlAPI.createSample(sample.channelId,sj,function(data){
				var clone = jQuery.extend(true, {}, sample);
				clone.id = data._id;
				var channel = ctlProject.get(sample.channelId);
				clone.file = sample.file;
		  //   	var request = new XMLHttpRequest();
				// console.log(clone.file);
				// request.open("GET", clone.file, true);
				// request.responseType = "blob";    
				// request.onload = function() {
				//   if (this.status == 200) {
				//     var audio = new Audio(URL.createObjectURL(this.response));
				//     clone.aud = audio;
				//     clone.aud.load();
				//     clone.aud.currentTime = parseFloat(clone.delay);		    
				//     $('#'+clone.id).animate({opacity:1},1000);
				//     p.reset();
				//   }
				// }
				// request.send();
				channel.removeSample(sample);
				channel.addSample(clone);
				clone.draw();
				$('#'+clone.id).css('opacity','0.1');
				ctlMessage.send("newSample",{"sampleId":clone.id,"channelId":channel.channelId});
			});
		}
		this.updateSample = function(sampleId){
			var sample = ctlProject.getSample(sampleId);
			ctlAPI.updateSample(sample.channelId,sample.id,sample.toJson(),function(data){
				if(!data)
					console.log('error updating server..'+ data);
				else{
					console.log(data);

					ctlMessage.send("updateSample",{"sampleId":sample.id,"channelId":sample.channelId});
				}
			});
		}
		this.deleteSample = function(sampleId){
			var sample = ctlProject.getSample(sampleId);
			ctlAPI.deleteSample(sample.channelId,sample.id,function(data){
				if(!data) console.log('error updating server..');
			});
		}
		this.updateAfterMovingSample = function(data){
			if(data.newChannel == data.lastChannel){
				ctlDBHelper.updateSample(data.sampleId);
			}
			else{
				ctlDBHelper.updateChannel(data.newChannel);
				ctlDBHelper.updateChannel(data.lastChannel);
			}
		}
		this.dropSample = function(changes){
			ctlAPI.deleteSample(changes.lastChannel,changes.sampleId,function(data){
				if(!data) console.log('error updating server..');
				else
				{
					ctlMessage.send("removeSample",{"sampleId":changes.sampleId,"channelId":changes.lastChannel});	
					var sample = ctlProject.getSample(changes.sampleId);
					sample.channelId = changes.newChannel;
					var sj = sample.toJson();
					sj.channelId = changes.newChannel;
					ctlAPI.createSample(changes.newChannel,sj,function(data){
						var channel = ctlProject.get(sample.channelId);
						var clone = jQuery.extend(true, {}, sample);
						clone.id = data._id;
						channel.removeSample(sample);
						channel.addSample(clone);
						clone.draw();
						p.reset();
						ctlMessage.send("newSample",{"sampleId":clone.id,"channelId":channel.channelId});
					});
				}
			});

		}
		this.uploadFile	= function(userId,form,duration,size,callback){
			ctlAPI.upload(userId,form,duration,size,function(result){
			  	ctlAPI.addFile(result,function(result){
		    		ctlFiles.add({type: 'files', file:result});
		    		callback(result);
				});
			})
		}
	}
	/* UI Helper */
	function getURLID(){
		return location.href.substr(location.href.lastIndexOf('/') + 1);
	}
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	function getSampletById(sampleId){
		return ctlProject.getSample(sampleId);
	}
	function getChannelIdBySampleId(sampleId){
		return getSampletById(sampleId).channelId;
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
	function random(max){
		return Math.floor((Math.random() * max) + 1);
	}

	function getObjects(obj, key, val) {
	    var objects = [];
	    for (var i in obj) {
	        if (!obj.hasOwnProperty(i)) continue;
	        if (typeof obj[i] == 'object') {
	            objects = objects.concat(getObjects(obj[i], key, val));
	        } else if (i == key && obj[key] == val) {
	            objects.push(obj);
	        }
	    }
	    return objects;
	}

	/* UI Functionality */

	function drawGrid(trackName){
		var cells = Math.round(max_time/time_units);				
		// intialize elements
		$('#channels_list').html('');
		$('.channels_grid_title').html('');
		$('.channel_grid_row').html('');
		// generate grid title
		for (var i = 0; i < cells; i++) {
				$('.channels_grid_title').append('<div class="time-box">'+(i*time_units+time_units)+'</div><div class="time-box-border"></div>');
		}
		// draw cursorLine
		updateTrackName(trackName);
		resetComponents();	
	}
	$(document).on('click','main',function(e){
		if(e.target.tagName.toLowerCase() === 'main' || $(e.target).hasClass('time-box')){
			var position = e.pageX;
			if(position>=grid_offset)
				setCursorOnSec(offsetToSeconds(e.pageX-grid_offset));
			else
				setCursorOnSec(offsetToSeconds(0));
		}
	});
	function setCursorOnSec(sec){
		if(player.isPlaying){
			p.pause();
			$('#cursorLine , .cursorCircle').stop()
			.css({'left':secondsToOffset(sec)})
			.animate({'left':secondsToOffset(max_time)},max_time*1000, 'linear');
			p.play();
		}else{
			$('#cursorLine , .cursorCircle').css({'left':secondsToOffset(sec)});
		}
	}
	function createSoundSpectrum(sample,width,height){
			newCanvas  = createCanvas (width, height);
			context = newCanvas.getContext('2d');
			context = $(newCanvas)[0].getContext('2d');
	 		function createCanvas ( w, h ) {
			    var newCanvas = document.createElement('canvas');
			    	newCanvas.width  = w;
			    	newCanvas.height = h;
			    return newCanvas;
			};
			$(sample).find('canvas').remove();
			$(sample).append(newCanvas);
			drawFadeIn(sample);
			drawFadeOut(sample);
		
	}
	function drawFadeIn(sample){
		var canvas = $(sample).find('canvas');
 		var context = (canvas).get(0).getContext('2d');
 		var sampleObject = getSampletById($(sample).attr('id'));
 		context.clearRect(0, 0, canvas.width, canvas.height);
 		context.beginPath();
		context.moveTo(0, $(sample).height());
		context.lineTo(secondsToOffset(sampleObject.fadeIn), 0);
		context.lineTo(0, 0);
		context.moveTo(0, $(sample).height());
		context.fillStyle = $(sample).css("border-right-color");
		context.fill();
	}
	function drawFadeOut(sample){
		var canvas = $(sample).find('canvas');
 		var context = (canvas).get(0).getContext('2d');
 		context.clearRect(0, 0, canvas.width, canvas.height);
 		context.fillStyle = $(sample).css("border-right-color");
		context.beginPath();
		var h = $(sample).height();
		sample = getSampletById($(sample).attr('id'));
		var w = sample.fadeOut;
		context.moveTo(secondsToOffset(sample.duration-sample.fadeOut), 0);
		context.lineTo(secondsToOffset(sample.duration),h);
		context.lineTo(secondsToOffset(sample.duration),0);
		context.fill();
	}

	function updateTimer(time){
		time= time/10;
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

	function zoomIn(){
		if(unit_width>20)
			return;
		unit_width=unit_width*1.1;
		resetComponents();
		updateSampleComponents();
	}

	function zoomOut(){
		if(unit_width<4)
			return;
		unit_width = unit_width/1.1;
		resetComponents();
		updateSampleComponents();
	}

	function dropFile(ev){
		
		ev.preventDefault();
		var file = ctlFiles.map[ev.originalEvent.dataTransfer.getData("text")];
		var sampleId = 'newSample'+sampleIndexGenerator++;
		var channelId= $(ev.target).closest('.channels_list_row').attr('data-channel');
	    var jsonObj = {
	    	"_id" : sampleId,
	    	"channelId" : channelId,
	    	"file" : {
				"path": file.path,
	    		"_id": file._id,
	    		"duration": file.duration
	    	},
	    	"duration": file.duration,
	    	"start": "0",
	    	"volume": "1",
	    	"delay": "0",
			"fadein": "0",
			"fadeout":"0"
		};
		ctlProject.addSample(jsonObj);
		mouseOffsetSampleClicked=0;
		moveSample(ev,sampleId);	
		ctlDBHelper.createSample(sampleId,function(newId){
			ac.removeAction();
			ac.addAction(new Action('sample_new',jQuery.extend(true, {}, getSampletById(newId))));
		});	
	}

	function drawRecord(file,channelId,start){
		console.log('>'+player.playTime);
		var sampleId = 'newSample'+sampleIndexGenerator++;
		var channel = ctlProject.get(channelId);
		var sample = new Sample(sampleId,channelId,file.file.path,file.file._id,file.file.duration,start,"1","0","0","0");
		channel.addSample(sample);
		alert(sample.file);
		sample.draw();
		ctlDBHelper.createSample(sample.id,function(sampleId){
			ac.addAction(new Action('sample_new',jQuery.extend(true, {}, getSampletById(sampleId))));
			updateUndoRedoIcons();
		});		
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
		resetCursor();
	}

	function resetCursor(){
		setCursorOnSec(player.playTime/1000);
		$('#cursorLine ').css('height',$('.channel_grid_row:visible').length*(unit_width*3/4*10+1)+24);
	}

	function updateSampleComponents(){
		$('.sample').each(function(data){
			updateSampleComponent(this);
		});	
	}

	function updateSampleComponent(element){
		var sample = getSampletById(element.id);
		var width = sample.duration*unit_width+ (sample.duration/time_units);
		var height = unit_width*3/4*10-2;
		$(element).css('width',Math.floor(width));
		$(element).css('height',Math.floor(height));
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
	    ctlDBHelper.dropSample(moveSample(ev,ev.originalEvent.dataTransfer.getData("text")));
	}

	function moveSample(ev,data){
	   
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
	    	target.append(dragged);
	    	$('#'+data).css('left', new_offset);
	    }
	   
	    // z-index up
	    $('#'+data).css('z-index', z_index++);
	   
	    // define new start
	    var borders = Math.floor(new_offset/((time_units*unit_width)));
	    var all = ((new_offset-borders)/(time_units*unit_width))*time_units;
	    var channelId = $(target).closest('.sample_placeholder').attr('data-channel');
	    var sample = getSampletById(data);
	    var newChannel = ctlProject.get(channelId);
	    var lastChannel = ctlProject.get(sample.channelId);
		var changes = {newChannel:newChannel.channelId,lastChannel:lastChannel.channelId,sampleId:sample.id};
		
		$('#'+data).attr('data-start', all);
	  
		ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
		updateUndoRedoIcons();

		if(lastChannel.channelId != newChannel.channelId){
			lastChannel.removeSample(sample);
			sample.channelId = channelId;
			newChannel.addSample(sample);
		}
		sample.start = all; 
		sample.draw();

		p.reset();		

		return changes;
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
		p.setTime(secTime);	
		setCursorOnSec(secTime);
		$(this).focusout();
	}

	function sampleBringFront(e){
		var sample = $(e.target).closest('.sample');
		$(sample).css('z-index', z_index++);
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

		var sample = ctlProject.getSample(($(e.target).closest('.sample')).attr("id"));
		ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
		var time = offsetToSeconds(mouseOffsetSampleClicked);

		var clone = jQuery.extend(true, {}, sample);
		clone.delay =  parseFloat(parseFloat(sample.delay) +  parseFloat(time)).toString();
		clone.start = parseFloat(parseFloat(sample.start)+parseFloat(time)).toString();
		clone.duration = parseFloat(parseFloat(sample.duration)-parseFloat(time)).toString();
		clone.id = 'newSample'+sampleIndexGenerator++;
		clone.fadeIn = 0;

		console.log('clone.delay')
		console.log(clone.delay);

		sample.duration = time.toFixed(1);
		sample.fadeOut = 0;
		sample.draw();

		console.log('sample.delay')
		console.log(sample.delay);

		ctlProject.get(sample.channelId).addSample(clone);
		clone.draw();

		cursorType = 'arrow';
		changeCursorPlace(e);
		ac.addAction(new Action('sample_new',jQuery.extend(true, {}, clone)));
		ac.addAction(new Action('sample_split',null));
		updateUndoRedoIcons();
		//ctlDBHelper.updateChannel(sample.channelId);
		ctlDBHelper.updateSample(sample.id);
		ctlDBHelper.createSample(clone.id);
	}

	function fadeIn(sec){
		var channelIds = {};
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = getSampletById(selectedSamples.list[i]);
			ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
			sample.fadeIn =sec;
	    	sample.draw();
	    	channelIds[sample.channelId] = sample.channelId
			updateUndoRedoIcons();			
		}
		ss.updateSamples();
		ss.clean();
	}

	function fadeOut(sec){
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = getSampletById(selectedSamples.list[i]);
			ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
			sample.fadeOut =sec;
	    	sample.draw();
	    	updateUndoRedoIcons();

		}
		ss.updateSamples();
		ss.clean();
	}

	function moveTime(sec){
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = getSampletById(selectedSamples.list[i]);
			ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
			console.log();
			sample.start = parseFloat(parseFloat(sample.start)+parseFloat(sec));
			sample.draw();
			updateUndoRedoIcons();
		}
	}

	function cut(e){
		selectedSamples.operation = 'cut'
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = getSampletById(selectedSamples.list[i]);
			$('#'+sample.id).hide();
			ac.addAction(new Action('sample_hide',jQuery.extend(true, {}, sample)));
		};
	}
	function copy(e){
		selectedSamples.operation = 'copy'
	}
	function paste(e){
		selectedSamples.operation = 'paste'
		mouseOffsetSampleClicked=0;
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = getSampletById(selectedSamples.list[i]);
			ctlDBHelper.updateAfterMovingSample(moveSample(e,sample.id))

			$('#'+sample.id).show();
			ac.addAction(new Action('sample_show',jQuery.extend(true, {}, sample)));
			ac.addAction(new Action('sample_cut_copy',null));
		}
		ss.clean();
	}
	function copypaste(e){
		mouseOffsetSampleClicked=0;
		selectedSamples.operation = 'copypaste'		
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = getSampletById(selectedSamples.list[i]);
			console.log('copypaste....: ');
			var time = offsetToSeconds(mouseOffsetSampleClicked);
			var clone = new jQuery.extend(true, {}, sample);
			clone.clone(sample);			
			clone.delay =  parseFloat(parseFloat(sample.delay) +  parseFloat(time)).toString();
			clone.start = parseFloat(parseFloat(sample.start)+parseFloat(time)).toString();
			clone.id = 'newSample'+sampleIndexGenerator++;
			
			ctlProject.get(sample.channelId).addSample(clone);
			clone.draw();
			
			changeCursorPlace(e);
			
			ac.addAction(new Action('sample_new',jQuery.extend(true, {}, clone)));
			moveSample(e,clone.id);
			ac.addAction(new Action('sample_paste',null));
			console.log('0----------0');
		}
		var channelId = $(e.target).closest('.channels_list_row').attr('data-channel');
		ctlDBHelper.updateChannel(channelId);
	}

	function deleteSample(e){
		console.log('00000');
		console.log(ss.channels)
		for (var i = selectedSamples.list.length - 1; i >= 0; i--) {
			var sample = getSampletById(selectedSamples.list[i]);
			if(!sample)
				continue;
			//ctlDBHelper.deleteSample(sample.id);
			ac.addAction(new Action('sample_delete',jQuery.extend(true, {}, sample)));			
			ctlProject.get(sample.channelId).removeSample(sample);
			p.reset();
			ctlMessage.send("removeSample",{"sampleId":selectedSamples.list[i]});
		}
		for (var i = 0; i < Object.size(ss.channels); i++) {
			console.log(ss.channels[Object.keys(ss.channels)[i]]);
			ctlDBHelper.updateChannel(ss.channels[Object.keys(ss.channels)[i]]);
		}

		updateUndoRedoIcons();		
		ss.clean();
	}


	function deleteChannel(e){
		var channels = $('.channels_list_row.selected');
		for (var i = channels.length - 1; i >= 0; i--) {

			var channelId = $(channels[i]).attr('data-channel');
			var channel = ctlProject.get(channelId);

			ac.addAction(new Action('channel_delete',jQuery.extend(true, {}, channel)));

			ctlProject.remove(channel);
			ctlDBHelper.deleteChannel(channelId)

			p.reset();
			updateUndoRedoIcons();
		}
	}

	function createChannel(e){
		var channelObject = {			
				"trackId": ctlProject.track_version,
				"userId": user.user._id,
				"name": "New Channel",
				"instrument": "",
				"volume":"0.6",
				"lock": false,
				"visible": false,
				"samples": []
		};

		ctlDBHelper.createChannel(channelObject);
	}

	


	function textFieldChange(element,callback){
		console.log('called..');
		var input = $('<input type="text" value="'+$(element).text()+'">');
		$(element).parent().prepend(input);
		$(element).hide();
		$(input)
		.focus()
		.select()
		.focusout(function() {
			callback($(input).val());
			$(input).remove();
			$(element).html($(input).val());
		  	$(element).show();
		});
		$(input).keydown(function( event ) {
		  if ( event.which == 13 ) {
		  	$(input).blur();
		   	event.preventDefault();
		  }
		});
	}

	/* UI Events */

	var isShift  = false;
	var isControl  = false;
	var isAlt  = false;

	// Channels

	$(document).on('dragover','.channel_grid_row',function(e){
		allowDrop(e);
		e.preventDefault();
	});
	$(document).on('drop','.channel_grid_row',function(e){
		if(!$('#'+e.originalEvent.dataTransfer.getData("text")).hasClass('file'))
			drop(e);
		else
			dropFile(e);
		e.preventDefault();
	});
	$(document).on('click','.channel_grid_row',function(e){
		sharedEvent = jQuery.extend(true, {}, e);
		if($(e.target).hasClass('time-box') && selectedSamples.operation!='cut' && selectedSamples.operation!='copy' && selectedSamples.operation!='copypaste'){
			//ss.clean();
		}
		changeCursorPlace(e);
		e.preventDefault();
	});
	
	$(document).on('mousedown','.checkbox *',function(e){
		var parent = $(e.target).closest('.channels_list_row');
		sc.add($(parent));
		e.preventDefault();
	});

	// Samples

	$(document).on('dragstart','.sample , .file',function(e){
		drag(e);
	});

	$(document).on('mousedown', '.sample , * > .sample',function(e){
		if(isControl){
			console.log('ss');
			ss.add($(this));
		}
	    sampleBringFront(e);
	    if(cursorType=='cutter'){	    	
	    	cutSample(e);
	    	$('.channel_grid_row').removeClass('cutCursor');
	    }else{
	    }
	});
	$(document).on('mousedown','.sample .ui-resizable-handle',function(e){	
		var sample = getSampletById($(e.target).closest('.sample').attr("id"));
		ac.addAction(new Action('sample',jQuery.extend(true, {}, sample)));
		updateUndoRedoIcons();
	});
	$(document).on('mouseup','.sample .ui-resizable-handle',function(e){	
		
	});

	/* Keyboard Events */

	$(document).on('keydown', function(e){
		if($('input').is(':focus'))
			return;

		e = e || window.event;
	    if (e.keyCode == '38') { // up arrow
	    }
	    else if (e.keyCode == '40') { // down arrow
	        
	    }
	    else if (e.keyCode == '37') { // left arrow
	    	p.move(isShift?-0.1:-0.25);
	    	moveTime(isShift?-0.1:-0.25);
	    	e.preventDefault();
	    }
	    else if (e.keyCode == '39') { // right arrow
	    	p.move(isShift?0.1:0.25);
	    	moveTime(isShift?0.1:0.25);
	    	e.preventDefault();
	    }else if (e.keyCode == '32') { // space
	   		playerToggle();
	   		sr.recordStop();
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
		if (e.keyCode == '17') { // ctrl
	    	isControl = false;
	    }else if (e.keyCode == '16') { // shift
    		isShift = false;
	    }else if (e.keyCode == '18') { // alt
    		isAlt = false;
	    }
	});

	// Scrolling

	$('main').on('scroll',function(){
		var top  = $(this).scrollTop();
	    $('#channels_title').css({
	        'top': 0
	    });
	    $('.channel_list_row , .channel_list_buttons').css({
	        'left': $(this).scrollLeft()
	    });
	    clearTimeout($.data(this, 'scrollTimer'));
		$.data(this, 'scrollTimer', setTimeout(function() {
			if(top!=0)
		    	$('#channels_title').hide().fadeIn().css({'top':top});
		}, 250));
	});


	/* Header buttons */

	$(document).on('click','#connected_user',function(e){
		switch(e.target.id){
			case 'logout':{
				ctlAPI.logout(function(data){					
					location.reload();					  
				});
				break;
			}
		}
		$('#connected_user_menu').toggle();
	});
	$(document).on('click','#toolbox_btn_export',function(){
		var channels = ctlProject.toJson().track_version.channels;
		var channelsArray = {'channels':[]};
		for (var i = 0; i < channels.length; i++) {
			channelsArray['channels'].push(channels[i].channel);
		}
		channels = JSON.stringify(channelsArray);
		console.log(channels);
		// ctlAPI.syncChannels(channels,function(data){
		// 	console.log(data);
		// });
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
	$(document).on('click','#toolbox_btn_fadein',function(e){
		$("#modal-prompt").modal();
		$("#modal-prompt").attr("action","fadein");
		p.pause();
	});
	$(document).on('click','#toolbox_btn_ver-set',function(e){
		ctlAPI.getVersions(getURLID(),function(result){
			$("#modal-select").attr("action","versions");
			var select = $("#modal-select").find('select');
			$(result.tracks).each(function(key,value){
				$(select).append($('<option data-track="'+value._id+'">'+value._id+'</option>'));
			});
			$(select).find('option').filter(function(e) {
				    return $(this).text() == ctlProject.track_version; 
			}).prop('selected', true);
			$("#modal-select").modal();
		});
	});

	$(document).on('click','#toolbox_btn_ver-add',function(e){
		$("#modal-prompt").modal();
		$("#modal-prompt").attr("action","create-version");
	});

	$(document).on('click','#btn-select',function(e){
		var action = $("#modal-select").attr("action");
		var value = $("#modal-select").find("option:selected").attr('data-track');
		switch(action){
			case 'versions':{
				setVersion(value);
				break;
			}
		}
		location.reload();
		$("#modal-select").modal("hide");
	});
	function setVersion(value){
		ctlAPI.setVersions(getURLID(),value,function(result){
			
		});
	}
	function createVersion(value){
		ctlAPI.createVersion(getURLID(),ctlProject.track_version, function(result){
			location.reload();
		});
	}
	$(document).on('click','#btn-prompt',function(e){
		var action = $("#modal-prompt").attr("action");
		var value = $("#modal-prompt").find("input").val();
		$("#promptModalLabel").html(value);
		switch(action){
			case 'fadein':{
				fadeIn(value);
				break;
			}
			case 'fadeout':{
				fadeOut(value);
				break;
			}
			case 'create-version':{
				createVersion(value);
				break;
			}
		}
		$("#modal-prompt").modal("hide");
	});
	
	$(document).on('click','#toolbox_btn_fadeout',function(){
		$("#modal-prompt").modal();
		$("#modal-prompt").attr("action","fadeout");
		p.pause();
	});
	$(document).on('click','#toolbox_btn_cut',function(e){
		cut(e);
	});
	$(document).on('click','#toolbox_btn_copy',function(e){
		copy(e);
	});
	$(document).on('click','#toolbox_btn_paste',function(e){
		if(selectedSamples.operation == 'cut'){
			paste(sharedEvent);
			console.log('paste clicked..');
		}
		if(selectedSamples.operation == 'copy' || selectedSamples.operation == 'copypaste'){
			copypaste(sharedEvent);
			console.log('copypaste clicked..');
		}
	});
	$(document).on('click','#toolbox_btn_delete',function(e){
		deleteSample();
	});

	$(document).on('click','#toolbox_btn_create_music',function(e){
		console.log(ctlProject.toJson());

		if($(e.target).hasClass('loading'))
			return;
		else
			$(e.target).addClass('loading');

		var channels = ctlProject.toJson().track_version.channels;
		var channelsArray = {'channels':[]};
		for (var i = 0; i < channels.length; i++) {
			channelsArray['channels'].push(channels[i].channel);
		}
		channels = JSON.stringify(channelsArray);

		ctlAPI.export(channels,function(msg){
			var link = document.createElement("a");
		    link.download = msg;
		    link.href = msg;
		    link.click();
		    $(e.target).removeClass('loading');
		});
	});

	/* Channel list */

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

	$(document).on('click','#btn_channel_delete',function(e){
		deleteChannel(e);
	});

	$(document).on('click','.channel_name',function(e){
		var element = e.target;
		var channelName = $(element);
		var channelId = $(channelName).closest('.channels_list_row').attr('data-channel');
		textFieldChange(channelName,function(data){
			var channel = ctlProject.channels[channelId];
			channel.name = data;
			ctlDBHelper.updateChannel(channelId);
		});
	});

	$(document).on('click','#btn_channel_new',function(e){
		createChannel(e);
	});

	$(document).on('click','.btn_eye',function(e){
		var channel = $(this).closest('.channels_list_row');
		var channelId = $(channel).attr('data-channel');
		var index = -1;
		for (var i = player.mutedChannels.length - 1; i >= 0; i--) {
			if(player.mutedChannels[i] == channelId){
				index = i;
			}
		}
		if (index > -1) {
			$(this).css('opacity','1');
		    player.mutedChannels.splice(index, 1);			
		}
		else{
			$(this).css('opacity','0.5');
			player.mutedChannels.push(channelId);
		}
		if(player.mutedChannelsFlag){
			$(channel).hide();	
		}
		else{

			$(channel).show();
		}
		console.log(player.mutedChannels);
		p.reset();	
		resetCursor();		
	});

	$(document).on('click','#btn_channel_eye',function(e){
		player.mutedChannelsFlag = !player.mutedChannelsFlag;
		for (var i = player.mutedChannels.length - 1; i >= 0; i--) {
			var c = $('.channels_list_row[data-channel='+player.mutedChannels[i]+']');
			if(player.mutedChannelsFlag)
				$(c).hide();
			else
				$(c).show();
		}
		if(player.mutedChannelsFlag)
			$(this).css('opacity','0.5');
		else
			$(this).css('opacity','1');
		p.reset();	
		resetCursor();
	});

	/* Sound Recorder */

	$(document).on('mousedown','.btn_mic , .btn_mic_recording',function(e){
		var recordChannelId = $(this).closest('.channels_list_row').attr('data-channel');
	    if(sr.timer==null){	    
	    	console.log('start');		    
			sr.recordStart(recordChannelId);
	    }else if($(this).hasClass('btn_mic_recording')){
	    	sr.recordStop();
	    	console.log('stop');		    
	    }
	});
	$(document).on('mousedown','#startRecord',function(e){
	    sr.recorder && sr.recorder.record();
	    $('#startRecord').hide();
	    $('#stopRecord').show();
	    sr.timer = setInterval(function(){
			sr.time_record+=0.1;
		},100);
	});

	$(document).on('mousedown','#stopRecord',function(e){
	    recorder && recorder.stop();
	    $('#startRecord').show();
	    $('#stopRecord').hide();
	    sr.createDownloadLink();
	  	sr.clearInterval(timer);
	    sr.recorder.clear();
	});

	/* Footer Icons */

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
		clearInterval(timeout);
	});
	$(document).on('click','#stop',function(e){
		p.stop();
		p.setChannel(null);
		lightChannel(null);
		resetPlayPause();
		clearInterval(timeout);
	});
	var timeout;
	$(document).on('mousedown','#backward',function(e){
		timeout = setInterval(function(){
        	p.move(-0.50);
    	}, 100);
	});
	$(document).on('mousedown','#forward',function(e){
		timeout = setInterval(function(){
        	p.move(0.25);
    	}, 100);
	});
	$(document).on('mouseleave mouseup','#backward , #forward',function(e){
		clearInterval(timeout);
		p.reset();
	});

	var m = new metronome();
	$('#metronome_start').click(function(){
		$(this).hide();
		$('#metronome_stop').show();
		m.start();
		$('#metronome').fadeIn(1000);
	});
	$('#metronome_stop').click(function(){		
		$(this).hide();
		$('#metronome_start').show();
		m.stop();
	});
	$(document).on('mousedown','#bpmButtonsPluse',function(){
		var bpm = (metronome.rounds+10<218?metronome.rounds+5:218);
		m.rounds(bpm);	
		$('#bpm').html(bpm + 'bpm');
		$('#metronome').slider({value: metronome.rounds});
		$('#metronome').fadeIn(1000);
		m.reset();
	});
	$(document).on('mousedown','#bpmButtonsMinuse',function(){
		console.log(metronome.rounds);
		var bpm = (metronome.rounds-10>40?metronome.rounds-5:40);
		m.rounds(bpm);	
		$('#bpm').html(bpm + 'bpm');
		$('#metronome').slider({value: metronome.rounds});	
		$('#metronome').fadeIn(1000);
		m.reset();
	});
	$('#volume').slider({
	    orientation: "horizontal",
	    range: "min",
	    min: 0,
	    max: 100,
	    value: 100,
	    slide: function( event, ui ) {
	    	p.setVolume(ui.value/100);
  	    }
	});
	$(document).on('mouseleave','.metronome_placeholder',function(){
		$('#metronome').fadeOut(1000);
	});
	$('#metronome').slider({
	    orientation: "horizontal",
	    range: "min",
	    min: 40,
	    max: 218,
	    value: metronome.rounds,
	    slide: function( event, ui ) {
 			console.log(ui.value);
 			$('#bpm').html(ui.value + 'bpm');
 			$('#metronome_start').hide();
 			$('#metronome_stop').show();
 			m.rounds(ui.value);		
 			m.stop();
 			m.start();
  	    }
	});
	
	var masterVol = 0;
	$(document).on('mousedown','div.volume-icon',function(e){
		e.preventDefault();
		if($(this).hasClass('volume-on')){
			$(this).removeClass('volume-on');
			$(this).addClass('volume-off');
			masterVol=player.volume*100;
			p.setVolume(0);
			$('#volume').slider({value: 0});			
		}else{
			$(this).removeClass('volume-off');
			$(this).addClass('volume-on');
			p.setVolume(masterVol/100);
			$('#volume').slider({value: masterVol});
		}
	});

	/* File Explorer */

	$("#file_explorer" ).resizable({ handles: 'w', minWidth: 200	 }).on('resize', function (e) {});;

	$(document).on("mousedown","#file_explorer .minimize",function(){
		$('#file_explorer').addClass('minimize');
		$('#file_explorer .minimize').hide();
		$('#file_explorer .maximize').show();
	});

	$(document).on("mousedown","#file_explorer .maximize",function(){
		$('#file_explorer').removeClass('minimize');
		$('#file_explorer .minimize').show();
		$('#file_explorer .maximize').hide();
	});

	$(document).on('click','.file_explorer_files div',function(e){
		var ul = $(e.target).parent().find('ul');
		console.log($(ul).css('display'));
		if($(ul).css('display')!="none"){
			$(ul).hide();
			$(e.target).find('span').html('+');
		}
		else{
			$(ul).show();
			$(e.target).find('span').html('-');
		}
	});

	$(document).on('mousedown', '.file',function(e){
		if(e.which === 1)
			if(isControl){
				sf.add($(this));
			}else{		
				sf.clean();
				sf.add($(this));
			}
	});

	$(document).on('click','.file_explorer_uploader',function(){
	    var form = $('<form enctype="multipart/form-data"><input name="file" type="file" /><input type="button" value="Upload" /></form><progress></progress>');
	    var input = $(form).find('input[name="file"]');
	    setTimeout(function(){
	        $(input).click();
	    },200);

	    $(input).change(function () {
	    	var file = this.files[0];
	   		var audio = new Audio();
	   		audio.src= URL.createObjectURL(file);
	   		audio.onloadedmetadata = function() {
			 	ctlDBHelper.uploadFile(user.user._id,new FormData($(form)[0]),audio.duration,file.size,function(result){
			 		console.log(result);
			 	},function(res){
			 		console.log(res);
			 	});
			};
		});
	});	

	function loader(){
		$('#loader').hide();
	}

	function loaderProgress(){
		
	}
	function loaderHide(){
		$('#loader').hide();
	}
	/* CONTEXTMENU */
	$(document).on('mousedown','body',function(e){
		if(!$(e.target).hasClass('time-box'))
			return;
		$('#contextmenu').hide();
		//ss.clean();
		sf.clean();
	});

	$(document).on('contextmenu','.file',function(e){
		if(isControl)
			return;
		if(!$(e.target).hasClass('selected')){
			sf.clean();
			sf.add($(this));
		}
		var id  = (e.target.id).substring(4,(e.target.id).length);
		var listItems = [
		{text:'Delete','value':'delete'},
		{text:'Rename','value':'rename'},
		{text:'Share','value':'share'}
		]
		showContextMenu('file',listItems,id,e);
	});

	$(document).on('contextmenu','.sample',function(e){
		if(isControl)
			return;
		var id  = (e.target.id).substring(5,(e.target.id).length);
		var listItems = [
			{text:'Copy','value':'delete',shortCut:'Ctrl+C'},
			{text:'Paste','value':'delete',shortCut:'Ctrl+V'},
			{text:'Split','value':'delete',shortCut:'Ctrl+S'},
			{text:'Fade-in','value':'delete',shortCut:'Ctrl+W'},
			{text:'Fade-out','value':'delete',shortCut:'Ctrl+E'},
			{text:'Volume-up','value':'delete',shortCut:'Ctrl+Up'},
			{text:'Volume-down','value':'delete',shortCut:'Ctrl+Down'}
		]
		showContextMenu('sample',listItems,id,e);
	});

	$(document).on('mousedown','#contextmenu li',function(e){
		$('#contextmenu').hide();
		var parent = $(e.target).closest('#contextmenu');
		var type = $(parent).attr('data-type');
		var id = $(parent).attr('data-id');
		var command = $(this).attr('data-command');
		if(type=='file'){
			switch(command){
				case 'delete':{
					ctlAPI.deleteFile(id,function(result){
						$('#file'+id).remove();
					});
					break;
				}
				case 'rename':{
					textFieldChange($('#file'+id),function(data){
					});
					break;
				}
				case 'share':{
					console.log('share');
					break;
				}
			}
		}else if(type=='sample'){

		}
		//$('#changer').focus(function() { $(this).select() });		
	});


	function showContextMenu(type,data,id,e){
		var ul = $("<ul></ul>");
		for (var i = data.length - 1; i >= 0; i--) {
			var li = $('<li data-command="'+data[i].value+'"></li>');
			var link = $('<a>'+ data[i].text +'</a>');
			if(data[i].shortCut)
				$(li).append('<div>'+data[i].shortCut +'</div>')
			$(li).append(link);
			$(ul).append(li);
		}
		$('#contextmenu')
		.html(ul)
		.attr('data-type',type)
		.attr('data-id',id)
		.show()
		.css({'left':e.pageX,'top':e.pageY});
	}

	$(document).on('contextmenu',function(e){
		return false;
	});

	$(document).on('click','#logo',function() {
		window.location.href = '../dashboard';
	});
	
	
	

};