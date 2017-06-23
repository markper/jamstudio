var ctlAPI = new controllerAPI();
var ctlUserComponent = new userComponent();
var ctlMessage = {};
var ctlNotificationFactory = new notificationFactory();

/* User */
ctlAPI.getUserInfo(function(result){
	ctlUserComponent.init(result);
});

function userComponent(){
	this.info = null;
	this.alerts = {
		requests: 0,
		notifications: 0
	};
	this.init = function(data){
		ctlMessage =  new messages(data._id);
		this.info = data;
        $('div.username span:first').text(data.email);
        $('header #connected_user .user_img').css('background-image','url('+data.picture+')');
	};
};
function getURLID(){
	return location.href.substr(location.href.lastIndexOf('/') + 1);
}
function notificationFactory(){
	var _this = this;

	this.readAndPrintNotifications = function(userId){
		var notifications = [];
		var requests = [];

		ctlAPI.getNotificationByUser(userId,'notification',function(result){
			console.log(result);
			for (var i = 0; i <result.length; i++) {
				notifications.push(_this.buildNotification(result[i]));
			}
			$('#alerts-notification .dropdown-menu').html(notifications);
		});
	}
	this.readAndPrintRequests = function(userId){
		var notifications = [];
		var requests = [];

		ctlAPI.getNotificationByUser(userId,'request',function(result){
			console.log(result);
			for (var i = 0; i <result.length; i++) {
				requests.push(_this.buildRequest(result[i]));
			}
			$('#alerts-request .dropdown-menu').html(requests);
		});
	}
	this.buildNotification = function(notification){
		// switch(notification.type){
		// 	case 'projectVersion':{
				var isRead = false;
				for (var i = notification.subscribes.length - 1; i >= 0; i--) {
					if(notification.subscribes[i].user._id==ctlUserComponent.info._id)
						isRead = notification.subscribes[i].read;
				}
				return $('<li class="notification '+(isRead?'':'not-read')+'" data-id="'+notification._id+'">'+ _this.buidUser(notification.factor) +' set new version at '+ notification.info +' project.. </li>');
			// 	break;
			// }
		//}
	}
	this.buildRequest = function(request){
		var isRead = false;
		for (var i = request.subscribes.length - 1; i >= 0; i--) {
			if(request.subscribes[i].user._id==ctlUserComponent.info._id)
				isRead = request.subscribes[i].read;
		}
		return $('<li class="notification '+(isRead?'':'not-read')+'" data-id="'+request._id+'">'+ _this.buidUser(request.factor) +' ask to join '+ request.info +' project.. </li>');
	}
	this.buidUser = function(userObject){
		return ('<img src="'+userObject.picture+'" alt="..." class="img-circle" style="width:40px;"> '+ userObject.firstName+' '+userObject.lastName);
	}
}

/* Notifications */
function messages(id){
	
	var socket = io.connect("https://oran-p2p2-yale.herokuapp.com/");
	socket.emit("subscribe", { room: id});
	
	this.send = function(room,action,msg){
		socket.emit('broadcast', {room:room,emit:action,msg:msg});
	}

	socket.on("requests", function(data) {
		$('.requests-counter').text(++ctlUserComponent.alerts.requests).show();
	});

	socket.on("notifications", function(data) {
		$('.notifications-counter').text(++ctlUserComponent.alerts.notifications).show();
	});
}

/* menu */
$(document).on('click','.notification',function(e){
	var id = $(this).attr('data-id');
	ctlAPI.setNotificationReadByUser(id,ctlUserComponent.info._id,function(result){
		$(this).closest('.dropdown-menu').hide();
	});
	e.preventDefault();
	return false;
});
$(document).on('mousedown','#alerts-request span',function(e){
	e.preventDefault();
	ctlUserComponent.alerts.requests = 0;
	$('.requests-counter').text('');
	ctlNotificationFactory.readAndPrintRequests(ctlUserComponent.info._id);
});

$(document).on('mousedown','#alerts-notification span',function(e){
	e.preventDefault();
	ctlUserComponent.alerts.notifications = 0;
	$('.notifications-counter').text('');
	ctlNotificationFactory.readAndPrintNotifications(ctlUserComponent.info._id);
});
$(document).on('click','#rt',function(e){
	var notJson = {
	    projectId: "594a865273cea258ad0dbaa7",
	    factor:ctlUserComponent.info._id,
	    type: "request",
	    typeId: "594a865273cea258ad0dbaa7",
	    action: "project_request",
	    info: "Name",
	    subscribes: []
	};
	var item = {user: "594ba859734d1d4e66f01ce5",read: false};
	notJson.subscribes.push(item);

	ctlAPI.createNotification( notJson,function(result){
		ctlMessage.send('594ba859734d1d4e66f01ce5','requests','set..');
	});
});
$(document).on('click','#nt',function(e){
	
	var notJson = {
	    projectId: "594a865273cea258ad0dbaa7",
	    factor:ctlUserComponent.info._id,
	    type: "notification",
	    typeId: "594a865273cea258ad0dbaa7",
	    action: "project_new_version",
	    info: "Name",
	    subscribes: []
	};
	var item = {user: "594ba859734d1d4e66f01ce5",read: false};
	notJson.subscribes.push(item);

	ctlAPI.createNotification( notJson,function(result){
		ctlMessage.send('594ba859734d1d4e66f01ce5','notifications','set..');
	});

});

/* NavBar */
$(document).on('click','#hamburger',function(e){
	$('.sidenav').toggleClass("open");
});
$(document).on('click','.closebtn',function(e){
	$('.sidenav').toggleClass("open");
});
