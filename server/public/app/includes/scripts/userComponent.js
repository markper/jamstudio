
function userComponent(callback){

	var _this = this;
	var url = window.location.href
	var arr = url.split("/");
	var server = arr[0] + "//" + arr[2]
	var ctlAPI = new controllerAPI();
	var ctlUser = new user();
	var socket = io.connect("https://oran-p2p2-yale.herokuapp.com/");

	ctlAPI.getUserInfo(function(result){
		
		ctlUser.info = result;

		callback(ctlUser);

		
		socket.emit("subscribe", { room: result._id });
		socket.on("requests", function(data) {
			$('.requests-counter').text(++ctlUser.alerts.requests).show();
		});
		socket.on("notifications", function(data) {
			$('.notifications-counter').text(++ctlUser.alerts.notifications).show();
		});

		var email = (result.email.length >13?result.email.substring(0,13)+'..':result.email);
        $('div.username span:first').text(email);
        $('header #connected_user .user_img').css('background-image','url('+server+'/static/uploads/'+result.picture+')');
		
		$(document).on('click','.notification',function(e){
			var id = $(this).attr('data-id');
			ctlAPI.setNotificationReadByUser(id,result._id,function(result){
				$(this).closest('.dropdown-menu').hide();
			});
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
			_this.readAndPrintNotifications(result._id);
		});

		$(document).on('click','#search-line .input-group-btn',function(e){
			window.location = 'search?word=' + $('#input-search').val();
		});
	});

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
		var isRead = false;
		for (var i = notification.subscribes.length - 1; i >= 0; i--) {
			if(notification.subscribes[i].user._id==ctlUser.info._id)
				isRead = notification.subscribes[i].read;
		}
		return $('<li class="notification '+(isRead?'':'not-read')+'" data-id="'+notification._id+'">'+ _this.buidUser(notification.factor) +' set new version at '+ notification.info +' project.. </li>');
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
		return ('<img src="'+userObject.picture+'" alt="..." class="img-circle" style="width:40px;"> '+ userObject.firstName+' '+userObject.lastName);
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

}

function user(){
	this.alerts = {
		requests: 0,
		notifications: 0
	};
	this.info = null;
};

