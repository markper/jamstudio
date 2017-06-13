function controllerAPI(){
	
	var localDB = 'http://localhost:3000';
	var localFiles = 'http://localhost:3300';
	var remoteDB = 'http://jammeapp.herokuapp.com';
	var remoteFiles = 'http://oran1.herokuapp.com';
	var serverDB = remoteDB;
	var serverFiles = remoteFiles;
	
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


	this.updateProjectInfo = function(projectId,projectJson, callback){
		$.ajax({
			type: "Put",
			dataType: "json",
 			url: serverDB+'/Project/Info/'+projectId,
 			data: (projectJson),
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});	
	}

	this.updateProjectPrivacy = function(projectId,projectJson, callback){
		$.ajax({
			type: "Put",
			dataType: "json",
 			url: serverDB+'/Project/Privacy/'+projectId,
 			data: (projectJson),
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

	this.createProjectIssue = function(projectId,issueJson,callback){
		$.ajax({
			type: "Post",
			dataType: "json",
 			url: serverDB+'/Project/'+projectId+'/Issue',
 			data: (issueJson),
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});	
	}

	this.updateProjectIssue = function(projectId,issueId,issueJson,callback){
		$.ajax({
			type: "Put",
			dataType: "json",
 			url: serverDB+'/Project/'+projectId+'/Issue/'+issueId,
 			data: (issueJson),
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


	this.getUsersPrefix = function(prefix,callback){
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/User/GetList/'+prefix,
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



	this.addContributor = function(projectId,userId,access,callback){
		$.ajax({
	        type: "Post",
	        datatype:"json",
	        url: serverDB+'/Project/'+projectId+'/User/'+userId+'/Access/'+ access,
	        data:({}),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	console.log(err.message);
	        }
	    });
	}

	this.removeContributor = function(projectId,userId,callback){
		$.ajax({
	        type: "Delete",
	        datatype:"json",
	        url: serverDB+'/Project/'+projectId+'/User/'+userId,
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

	this.updateContributorStatus = function(projectId,userId,access,callback){
		$.ajax({
	        type: "Put",
	        datatype:"json",
	        url: serverDB+'/Project/'+projectId+'/User/'+userId+'/Access/'+ access,
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
	// ICQ
	//
	this.createICQ = function(icqJson,callback){
		$.ajax({
	        type: "Post",
	        datatype:"json",
	        contentType: "application/json",
	        url: serverDB+'/Icq',
	        data:(icqJson),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	console.log(err);
	        }
	    });
	}

	this.deleteICQ = function(icqId,callback){
		$.ajax({
	        type: "Delete",
	        datatype:"json",
	        contentType: "application/json",
	        url: serverDB+'/Icq/'+icqId,
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

	this.updateICQJump = function(icqId,callback){
		$.ajax({
	        type: "Put",
	        datatype:"json",
	        contentType: "application/json",
	        url: serverDB+'/Icq/'+icqId,
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

	this.getIcqByProject = function(projectId,callback){
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/Icq/Project/'+projectId,
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

	this.removeIcqApplicants = function(icqId,userId,callback){
		$.ajax({
	        type: "Delete",
	        datatype:"json",
	        url: serverDB+'/Icq/'+icqId+'/Applicant/'+userId,
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

	this.addIcqApplicants = function(icqId,applicantJson,callback){
		$.ajax({
	        type: "Delete",
	        datatype:"json",
	        url: serverDB+'/Icq/'+icqId+'/Applicant',
	        contentType: "application/json",
	        data:(applicantJson),
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

	this.createSample = function(channelId,samplelJson,callback){
		$.ajax({
	        type: "Post",
	        datatype:"json",
	        url: serverDB+'/Channel/'+channelId +'/Sample',
	        data:(samplelJson),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	callback(null);
	        }
	    });
	};

	this.updateSample = function(channelId,sampleId,samplelJson,callback){
		$.ajax({
	        type: "Put",
	        datatype:"json",
	        url: serverDB+'/Channel/'+channelId+'/Sample/'+sampleId,
	        data:(samplelJson),
	        success: function(result)
	        {
	        	callback(result);
	        },
	        error:function(err){
	        	callback(null);
	        }
	    });
	};

	this.deleteSample = function(channelId,sampleId,callback){
		$.ajax({
	        type: "Delete",
	        datatype:"json",
	        url: serverDB+'/Channel/'+channelId+'/Sample/'+sampleId,
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
			url: serverFiles+'/export/wav/'+prompt('sec to start')+'/'+prompt('sec to end'),
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

	this.isFileExist = function(id,callback){
		$.ajax({
			method: "GET",
			url: serverDB+'/file/isExist/'+id,
			data:({}),
			error: function(e) {
				callback(false);
			},
			success: function(result){
				callback(result);
			}
		})
		.done(function(msg) {
			console.log(msg);
		});
	}

	this.upload = function(userId,formData,duration,size,callback,progressLoader){
		$.ajax({
	        // Your server script to process the upload
	        url: serverFiles+'/uploads/'+userId,
	        type: 'POST',

	        // Form data
	        data: formData,

	        // Tell jQuery not to process data or worry about content-type
	        // You *must* include these options!
	        cache: false,
	        contentType: false,
	        processData: false,

	        // Custom XMLHttpRequest
	        xhr: function() {
	            var myXhr = $.ajaxSettings.xhr();
	            if (myXhr.upload) {
	            	$('#loader').show(); 
	            	$('.loader-progress').show();  
	                $('.progress-bar').css({'width':'0px'});  
	                // For handling the progress of the upload
	                myXhr.upload.addEventListener('progress', function(e) {
	                    if (e.lengthComputable) {	             		
	                 		$('.progress-bar').css({width:e.loaded*100/e.total+'%'})
	                        console.log({
	                            value: e.loaded,
	                            max: e.total,
	                        });
	                    }
	                } , false);
	               
	            }
	            return myXhr;
	        },
	        success: function(data){
	        	$('.loader-progress').hide();
	        	$('#loader').hide(); 

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
	        },error: function(err){
	        }
	    });
	}
}