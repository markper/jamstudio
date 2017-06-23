function controllerAPI(){
	var url = window.location.href
	var arr = url.split("/");
	var serverDB = arr[0] + "//" + arr[2]
	var serverFiles = 'https://oran1.herokuapp.com';

	//
	// Requsets
	//

	this.getRequsets = function(userId,callback){
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/Requsets/'+userId,
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
	// User
	//

	this.updateUserInfo = function(userId,userJson,callback){
		$.ajax({
	        type: "Put",
	        datatype:"json",
	        url: serverDB+'/user/'+ userId,
	        data:(userJson),
	        success: function(result)
	        {
	        	callback(result)
	        },
	        error: function(err){
	        	console.log(err);
	        }
	    });
	};

	this.updateUserPlan = function(userId,planId,callback){
		$.ajax({
	        type: "Put",
	        datatype:"json",
	        url: serverDB+'/user/'+ userId+'/Plan/'+planId,
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
	this.getUser = function(userId,callback){
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/user/'+ userId,
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
  // Plan
  //
  this.getAllPlan = function(callback){
  		$.ajax({
  	        type: "Get",
  	        datatype:"json",
  	        url: serverDB+'/Plan/All',
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

	//
	// Project
	//

	this.deleteProject = function(projectId,callback){
		$.ajax({
			type: "DELETE",
			dataType: "json",
 			url: serverDB+'/Project/' + projectId,
 			data: ({}),
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});
	}

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
	this.getVersions = function(projectId,callback){
		$.ajax({
			type: "Get",
			dataType: "json",
 			url: serverDB+'/Project/'+projectId+'/GetVersions',
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});	
	}
	this.setVersions = function(projectId,trackId,callback){
		$.ajax({
			type: "Put",
			dataType: "json",
 			url: serverDB+'/Project/'+projectId+'/SetVersion/'+trackId,
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
	        }
		});	
	}
	this.createVersion = function(projectId,trackId,version,callback){
		$.ajax({
			type: "Put",
			dataType: "json",
 			url: serverDB+'/Project/'+projectId+'/CreateVersion/'+trackId,
 			data:({version:version}),
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
	this.getProjectsByWord = function(word,callback){
		$.ajax({
			type: "Get",
			dataType: "json",
 			url: serverDB+'/Project/Search/'+word,
 			success:  function(result){
				callback(result);
			},
	        error: function(err){
	        	callback(null);
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

	this.getChannel = function(channelId,callback){
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/Channel/'+channelId ,
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

	this.getSample = function(channelId,sampleId,callback){
		$.ajax({
	        type: "Get",
	        datatype:"json",
	        url: serverDB+'/Channel/'+channelId +'/Sample/'+ sampleId,
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

	this.accessFileOfUser = function(userId,fileId,access,callback){
		// get user FILES
		$.ajax({
	        type: "Put",
	        datatype:"json",
	        url: serverDB+'/File/'+fileId+'/User/'+userId+'/Access/'+ access,
	        success: function(result)
	        {
	        	callback(result);
	        }
		});
	};

	this.export = function(track,start,end,callback){
		$.ajax({
			method: "POST",
			//url: '/export/mp3/'+prompt('sec to start')+'/'+prompt('sec to end'),
			url: serverFiles+'/export/wav/'+start+'/'+end,
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
			console.log(id);
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

	//
	//	Notification
	//
	this.createNotification = function(notificationJson,callback){
		$.ajax({
			url: serverDB+'/Notification',
			type: "POST",
			contentType: "application/json",
			data:JSON.stringify(notificationJson),
			error: function(e) {
				callback(false);
			},
			success: function(result){
				callback(result);
			}
		})
		.done(function(msg) {
		});
	}
	this.setNotificationReadByUser = function(notificationId,userId,callback){
		$.ajax({
			method: "PUT",
			datatype:"json",
			url: serverDB+'/Notification/'+ notificationId +'/ReadByUser/'+userId,
			data:({}),
			error: function(e) {
				callback(false);
			},
			success: function(result){
				callback(result);
			}
		})
		.done(function(msg) {
		});
	}
	this.getNotificationByUser = function(userId,type,callback){
		$.ajax({
			method: "GET",
			datatype:"json",
			url: serverDB+'/Notification/GetList/'+ userId +'/'+type,
			data:({}),
			error: function(e) {
				callback(false);
			},
			success: function(result){
				callback(result);
			}
		})
		.done(function(msg) {
		});
	}
}
