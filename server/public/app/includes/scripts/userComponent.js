
function userComponent(callback){
	var url = window.location.href
	var arr = url.split("/");
	var server = arr[0] + "//" + arr[2]
	var _this = this;
	var ctlAPI = new controllerAPI();
	var ctlUser = new user();
	var socket = null;
	if(typeof io !== 'undefined')
		socket = io.connect("https://oran-p2p2-yale.herokuapp.com/");

	ctlAPI.getUserInfo(function(result){
		
		ctlUser.info = result;

		callback(ctlUser);

		$('#alerts-notification .dropdown-menu').html("");
		_this.readAndPrintNotifications(result._id);
		
		socket.emit("subscribe", { room: result._id });
		socket.on("requests", function(data) {
			$('.requests-counter').text(++ctlUser.alerts.requests).show();
		});
		socket.on("notifications", function(data) {
			$('.notifications-counter').text(++ctlUser.alerts.notifications).show();
			$('#alerts-notification .dropdown-menu').html("");
			_this.readAndPrintNotifications(result._id);
		});

		var email = (result.email.length >13?result.email.substring(0,13)+'..':result.email);
        $('div.username span:first').text(email);
        $('header #connected_user .user_img').css('background-image','url('+result.picture+')');
		
		$(document).on('click','.notification',function(e){
			var id = $(this).attr('data-id');
			ctlAPI.setNotificationReadByUser(id,result._id,function(result){
			});
			$(this).removeClass('not-read');
			$(this).closest('.dropdown-menu').dropdown('toggle');
			location.href = server + '/app/studio/'+$(this).attr('data-pid');
			e.preventDefault();
			return false;
		});
		$(document).on('mousedown','#alerts-request span',function(e){
			e.preventDefault();
			ctlUser.alerts.requests = 0;
			$('.requests-counter').text('');
			_this.readAndPrintRequests(result._id);
		});

		$(document).on('mousedown','#alerts-notification span',function(e){
			e.preventDefault();
			ctlUser.alerts.notifications = 0;
			$('.notifications-counter').text('');			
		});

		$(document).on('click','#search-line .input-group-btn',function(e){
			window.location = server +'/app/search?word=' + $('#input-search').val();
		});
	});

	this.readAndPrintNotifications = function(userId){
		var notifications = [];
		var requests = [];
		$('#alerts-notification .dropdown-menu').html("");
		ctlAPI.getNotificationByUser(userId,'notification',function(result){
			for (var i = 0; i <result.length; i++) {
				_this.buildNotification(result[i],function(_result){
					$('#alerts-notification .dropdown-menu').append(_result);	
				});
			}			
		});
	}
	this.readAndPrintRequests = function(userId){
		var notifications = [];
		var requests = [];
		$('#alerts-request .dropdown-menu').html('');
		ctlAPI.getNotificationByUser(userId,'request',function(result){
			for (var i = 0; i <result.length; i++) {
				_this.buildRequest(result[i],function(_result){
					$('#alerts-request .dropdown-menu').append(_result);
				});
			}			
		});
	}
	this.buildNotification = function(notification,callback){
		var isRead = false;
		for (var i = notification.subscribes.length - 1; i >= 0; i--) {
			if(notification.subscribes[i].user._id==ctlUser.info._id)
				isRead = notification.subscribes[i].read;
		}
		var li = $('<li class="notification '+(isRead?'':'not-read')+'" data-id="'+notification._id+'"" data-pid="'+notification.typeId+'"><a href="">'+ _this.buidUser(notification.factor) +' ' + notification.info + '</a></li>');
		callback(li);
		// var text = "";
		// switch(notification.action){
		// 	case 'Remove Contributor':{
		// 		ctlAPI.getUser(notification.info,function(_user){
		// 			ctlAPI.getProject(notification.typeId,function(project){
		// 				text = ' removed '+ _user.firstName +' to '+ project.name +' project.. ';
		// 				var li = $('<li class="notification '+(isRead?'':'not-read')+'" data-id="'+notification._id+'"><a href="">'+ _this.buidUser(notification.factor) + text + '</a></li>');
		// 				callback(li);
		// 			});
		// 		});
		// 		break;
		// 	}
		// 	case 'New Contributor':{
		// 		ctlAPI.getUser(notification.info,function(_user){
		// 			ctlAPI.getProject(notification.typeId,function(project){
		// 				text = ' join '+ _user.firstName +' to '+ project.name +' project.. ';
		// 				var li = $('<li class="notification '+(isRead?'':'not-read')+'" data-id="'+notification._id+'"><a href="">'+ _this.buidUser(notification.factor) + text + '</a></li>');
		// 				callback(li);
		// 			});
		// 		});
		// 		break;
		// 	}
		// 	case 'New Version':{
		// 		ctlAPI.getUser(notification.info,function(_user){
		// 			ctlAPI.getProject(notification.typeId,function(project){
		// 				text = ' create new s version of '+ project.name +' project.. ';
		// 				var li = $('<li class="notification '+(isRead?'':'not-read')+'" data-id="'+notification._id+'"><a href="">'+ _this.buidUser(notification.factor) + text + '</a></li>');
		// 				callback(li);
		// 			});
		// 		});
		// 		break;
		// 	}
		// 	case 'Roll Back':{
		// 		ctlAPI.getUser(notification.info,function(_user){
		// 			ctlAPI.getProject(notification.typeId,function(project){
		// 				text = ' restore to version '+project.track_version+' of '+ project.name +' project.. ';
		// 				var li = $('<li class="notification '+(isRead?'':'not-read')+'" data-id="'+notification._id+'"><a href="">'+ _this.buidUser(notification.factor) + text + '</a></li>');
		// 				callback(li);
		// 			});
		// 		});
		// 		break;
		// 	}
		// }
	}
	this.buildRequest = function(request){
		var isRead = false;
		for (var i = request.subscribes.length - 1; i >= 0; i--) {
			if(request.subscribes[i].user._id==ctlUser.info._id)
				isRead = request.subscribes[i].read;
		}
		return $('<li class="notification '+(isRead?'':'not-read')+'" data-id="'+request._id+'">'+ _this.buidUser(request.factor) +' ask to join '+ request.info +' project.. </li>');
	}
	this.buidUser = function(userObject){
		return ('<img src="'+userObject.picture+'" alt="..." class="img-circle" style="width:40px;height:40px;"> '+ userObject.firstName+' '+userObject.lastName);
	}

	/* NavBar */
	$(document).on('click','#hamburger',function(e){
		$('.sidenav').toggleClass("open");
	});
	$(document).on('click','.closebtn',function(e){
		$('.sidenav').toggleClass("open");
	});
	
	$(document).on('click','#nav_settings',function(e){
		window.location.href= server + '/app/usersettings';
	});
	$(document).on('click','#nav_dashboard',function(e){
		window.location.href= server + '/app/dashboard/'+ctlUser.info._id;
	});
	$(document).on('click','#nav_contributors',function(e){
		window.location.href= server + '/app/usersettings';
	});
	$(document).on('click','#nav_exit',function(e){
		window.location.href= server + '/app/usersettings';
	});
	$(document).on('click','#connected_user',function(e){
		switch(e.target.id){
			case 'logout':{
				ctlAPI.logout(function(data){					
					location.reload();					  
				});
				break;
			}
			case 'settings':{
				location.href = server +'/app/usersettings';
				break;
			}
		}
		$('#connected_user_menu').toggle();
	});

	function user(){
	this.alerts = {
		requests: 0,
		notifications: 0
	};
	this.info = null;
};


}


