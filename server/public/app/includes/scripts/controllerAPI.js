function controllerAPI(){
	
	var localDB = 'http://localhost:3000';
	var localFiles = 'http://localhost:3300';
	var serverDB = localDB;
	var serverFiles = localFiles;
	
	//
	// User
	//
	
	this.getUserInfo = function(callback){
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/user/getInfo',
	        data:({}),
	        success: function(result)
	        {
	        	callback(result)
	        },
	        error: function(err){
	        	console.log(err);
	        }
	    });
	};

	this.logout = function(callback){
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/logout',
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error: function(err){
	        	console.log(err);
	        }
		});
	}

	//
	// Project
	//
	this.syncChannels = function(channelsJson,callback){
		$.ajax({
			type: "Post",
			dataType: "json",
 			url: serverDB+'/Channel/Sync',
 			data: (channelsJson),
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});	
	};

	this.getContributors = function(projectId,callback){
		$.ajax({
			type: "Get",
			dataType: "json",
 			url: serverDB+'/Project/'+projectId+'/GetContributors',
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});	
	}

	this.getProject = function(projectId,callback){
		$.ajax({
			type: "Get",
			dataType: "json",
 			url: serverDB+'/Project/'+projectId,
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});	
	}

	this.createProject = function(projectJson,callback){
		$.ajax({
			type: "Post",
			dataType: "json",
 			url: serverDB+'/Project',
 			data: (projectJson),
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});	
	}

	this.getProjectList = function(userId,callback){
		$.ajax({
			type: "Get",
			dataType: "json",
 			url: serverDB+'/Project/GetList/'+userId,
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});	
	}

	this.getVersions = function(projectId,callback){
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/'+projectId+'/GetVersions',
	        data:({}),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	console.log(err);
	        }
	    });
	}

	//
	// Channel
	//

	this.addChannels = function(channelJson,callback){
		$.ajax({
	        type: "Post",
	        datatype:"json",
	        url: serverDB+'/Channel',
	        data:(channelJson),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	callback(null);
	        }
	    });
	};

	this.updateChannel = function(channelJson,channelId,callback){
		$.ajax({
	        type: "Put",
	        datatype:"json",
	        url: serverDB+'/Channel/'+channelId,
	        data:(channelJson),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	callback(null);
	        }
	    });
	};


	this.deleteChannels = function(channelId,callback){
		$.ajax({
	        type: "Delete",
	        datatype:"json",
	        url: serverDB+'/Channel/'+channelId,
	        data:({}),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	callback(null);
	        }
	    });
	};
	//
	// File
	//

	this.addFile = function(fileJson,callback){
		$.ajax({
	        type: "Post",
	        datatype:"json",
	        url: serverDB+'/file',
	        data:(fileJson),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	console.log(err);
	        }
	    });
	};

	this.deleteFile = function(fileId,callback){
		$.ajax({
	        type: "delete",
	        datatype:"json",
	        url: serverDB+'/file/'+fileId,
	        data:({}),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	console.log(err);
	        }
	    });
	};

	this.getFileByUser = function(userId,callback){
		// get user FILES
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/file/GetAll/'+userId,
	        success: function(result)
	        {
	        	callback(result);
	        }
		});
	};

	this.export = function(track,callback){
		$.ajax({
			method: "POST",
			//url: '/export/mp3/'+prompt('sec to start')+'/'+prompt('sec to end'),
			url: serverFiles+'/export/mp3/'+prompt('sec to start')+'/'+prompt('sec to end'),
			data:JSON.stringify(track),
			error: function(e) {
				$(e.target).removeClass('loading');
			},
			success: function(result){
				callback(serverFiles+'/'+result);
			}
		})
		.done(function(msg) {
			console.log(msg);
		});
	}

	this.upload = function(userId,form,duration,size,callback){
		$.ajax({
	        // Your server script to process the upload
	        url: serverFiles+'/uploads/'+userId,
	        type: 'POST',

	        // Form data
	        data: new FormData($(form)[0]),

	        // Tell jQuery not to process data or worry about content-type
	        // You *must* include these options!
	        cache: false,
	        contentType: false,
	        processData: false,

	        // Custom XMLHttpRequest
	        xhr: function() {
	            var myXhr = $.ajaxSettings.xhr();
	            if (myXhr.upload) {
	                // For handling the progress of the upload
	                myXhr.upload.addEventListener('progress', function(e) {
	                    if (e.lengthComputable) {
	                        $('progress').attr({
	                            value: e.loaded,
	                            max: e.total,
	                        });
	                    }
	                } , false);
	            }
	            return myXhr;
	        },
	        success: function(data){
				// UpdateWS
	    		var fileJson = {
				    userOwner: userId,
				    privacy: "private",
				    name: data,
				    path: serverFiles+'/uploads/'+userId+'/'+data,
				    size: size,
				    duration: duration,
				    sharedUsers: []
				};
				callback(fileJson);
	        }
	    });
	}
}