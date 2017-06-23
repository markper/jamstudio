
var ctlAPI = new controllerAPI();
var ctlUser = new user();
var project = {};
var user = {};

// Init studio
ctlAPI.getUserInfo(function(result){

	ctlUser.init(result);
	user = result;

	ctlAPI.getProject(getURLID(),function(_result){
		project = _result;
		// title
		$('h3').html(project.name + ' / ');
		$('h3').append('<span>'+user.firstName + ' ' + user.lastName+'</span>');
		// info
		$('#project-info-name').val(_result.name);
		$('#project-info-description').val(_result.description);
		$('#project-info-genre option').filter(function(e) {
		    return $(this).text() == _result.genre; 
		}).prop('selected', true);
		$('#project-privacy option').filter(function(e) {
		    return $(this).text() == _result.privacy; 
		}).prop('selected', true);
		// issues
		var openIssues = 0;
		for (var i = _result.issues.length - 1; i >= 0; i--) {
			$('#issue-accordion').append($(buidIssue(_result.issues[i],(i==_result.issues.length - 1))));
			if(_result.issues[i].status==1)
				openIssues++;
		}
		if(openIssues) $('#btn-all-issue span').html(openIssues);
		$('#issues-users').append($(buildUsersOptions()));	
		// contributors
		$('#project-contributors-users .list-group').append($(buildContributors()));
		// icq
		ctlAPI.getIcqByProject(getURLID(),function(_result){
			for (var i = _result.length - 1; i >= 0; i--) {
				$('#project-icq-all .list-group').append($(buildIcq(_result[i])));		
			}
			getRequests(_result);
			function getRequests(icqs){
				var requests = [];
				var requests = [];
				$(icqs).each(function(key,icq){
					$(icq.applicants).each(function(key,applicant){
						requests.push({applicant:applicant,icqId:icq._id});
					});
				});						
				var reqAmount = 0;
				$(requests).each(function(key,req){
					$('#project-icq-requests .list-group').append($(buildRequest(req.applicant,req.icqId)));
					reqAmount+=applicant.length;
				});
				$('#request-badge').html(reqAmount);
			}
		});
	});

});

// update project info
$( document ).on('submit',"#form-update-project",function(e) {
	var data ={
		name : $('#project-info-name').val(),
		description : $('#project-info-description').val(),
		genre : $('#project-info-genre').find(":selected").text()
	}
	ctlAPI.updateProjectInfo(project._id,data,function(result){
		console.log(result);
	})
});

// update project privacy
$( "#form-update-privacy" ).submit(function(e) {
	var data ={
		privacy : $('#project-privacy').find(":selected").text()
	}
	ctlAPI.updateProjectPrivacy(project._id,data,function(result){
		console.log(result);
	});
 	event.preventDefault();
});

// delete project 
$( document ).on("submit","#form-project-delete",function(e) {
	ctlAPI.deleteProject(project._id,function(result){
		window.location.replace("../dashboard");
	});
	return false;
 	event.preventDefault();
});

// new icq
$( "#form-icq-new" ).submit(function(e) {
	var instruments = [];
	$('#project-icq-instrument').find(":selected").map(function(key,value){
		instruments.push($(value).text());
	});
	var icqJson ={
	    "projectId": project._id,
	    "applicants": [],
	    "title": $('#project-icq-title').val(),
	    "description": $('#project-icq-description').val(),
	    "instruments": instruments
	};
	ctlAPI.createICQ(JSON.stringify(icqJson),function(result){
		console.log(result);
	})
 	event.preventDefault();
});

// new issue
$( "#form-issues-new" ).submit(function(e) {
	var data ={
        projectId: project._id,
        fromUserId: user._id,
        toUserId: $('#issues-users option:selected').attr('data-userid'),//$('#issues-users').find(":selected").text(),
        name: $('#project-issues-title').val(),
        description:$('#project-issues-description').val(),
        status: 0
	}
	console.log($('#issues-users').find(":selected").text())
	ctlAPI.createProjectIssue(project._id,data,function(result){
		console.log(result);
	});
 	event.preventDefault();
});

// Show users picker
//$('#form-contributor-user').attr('data-userid','592c04f9f36d2873685a5dbc');
$(document).on('input , click','#form-contributor-user',function(e){
	console.log("aa");
	$("#contributors-picker").show();
	ctlAPI.getUsersPrefix($(e.target).val(),function(result){
		console.log(buildUserPicker(result));
		$("#contributors-picker").html($(buildUserPicker(result)));
	});
});
$(document).on('focusout','#form-contributor-user',function(e){
	$("#contributors-picker").hide();
});

// Pick user to input element 
$(document).on('click','#contributors-picker li',function(e){
	var userId = $(e.target).attr('data-userid'),
		userName = $(e.target).attr('data-username');
	$('#form-contributor-user').attr('data-userid',userId);
	$('#form-contributor-user').val(userName);
	$("#contributors-picker").hide();
});

// Update user limitations	
$(document).on('click','.contributors-access-btns .btn',function(e){
	var userId = $(e.target).closest('.list-group-item').attr('data-userid');
	var active = ($(e.target).hasClass('active')?true:false);
	var type = ($(e.target).find('input').hasClass('btn-limited')?'0':'1');
	ctlAPI.updateContributorStatus(project._id,userId,type,function(result){
		console.log(result);
	});
});

// remove contributor	
$(document).on('click','#project-contributors-users .remove',function(e){
	var userId = $(e.target).closest('.list-group-item').attr('data-userid');
	ctlAPI.removeContributor(project._id,userId,function(result){
		location.reload();
	});
});


// remove icq post
$(document).on('click','#project-icq-requests .btn-default',function(e){
	var	userId = $(e.target).attr('data-userid');
	var	icqId = $(e.target).closest('.list-group-item').attr('data-icqid');
	console.log('requests.. decline');
	console.log(userId);
	console.log(icqId);
	ctlAPI.removeIcqApplicants(icqId,userId,function(result){
	 	console.log(result);
	})
});

// jump icq
$(document).on('click','#project-icq-all .btn-default',function(e){
	var	userId = $(e.target).attr('data-userid');
	var	icqId = $(e.target).closest('.list-group-item').attr('data-icqid');
	ctlAPI.updateICQJump(icqId,function(result){
		console.log(result);
		location.reload();
	});
});

// delete icq
$(document).on('click','#project-icq-all .btn-danger',function(e){
	var	userId = $(e.target).attr('data-userid');
	var	icqId = $(e.target).closest('.list-group-item').attr('data-icqid');
	ctlAPI.deleteICQ(icqId,function(result){
		console.log(result);
		location.reload();
	});
});

// add contributor 
$(document).on('click','#project-icq-requests .btn-primary',function(e){
	var	userId = $(e.target).attr('data-userid');
	var	icqId = $(e.target).closest('.list-group-item').attr('data-icqid');
	console.log('requests.. decline');
	console.log(userId);
	console.log(icqId);
	ctlAPI.addContributor(project._id,userId,"all",function(result){
	});
});

// update issue
$(document).on('click','button[data-issue]',function(e){
	var issueId = $(e.target).attr('data-issue');
	var issue = filterIssues(issueId)[0];
	if(!issue)
		return;
	$(e.target).prop('disabled', true);

	issueJson = {
        projectId: issue.projectId,
		toUserId:issue.toUserId._id,
		fromUserId:issue.fromUserId._id,
        name: issue.name,
        description: issue.description,
		status:(issue.status=="0"?"1":"0")
	}
	updateIssue(project._id,issue._id,issueJson,function(result){								
		($(e.target).hasClass("btn-success")?
			$(e.target).removeClass("btn-success").addClass("btn-default").prop('disabled', false)
			:$(e.target).removeClass("btn-default").addClass("btn-success")).prop('disabled', false);	
		$(e.target).html(($(e.target).hasClass("btn-success")?'Close Issue':'Open Issue'));	
	});

});

function buildUserPicker(users){
	var items = '';
	for (var i = users.length - 1; i >= 0; i--) {
		items += '<li class="list-group-item" data-userid="'+users[i]._id+'" data-username="'+users[i].firstName + ' ' +users[i].lastName +'">'+ buidUser(users[i]) +'</li>';
	}
    return	'<ul class="list-group">'+
		  	items +
			'</ul>';
}
$( "form#form-contributors" ).submit(function(e) {
	var data ={
        user: $('#form-contributor-user').attr('data-userid'),//$('#issues-users').find(":selected").text(),
        access: "all"
	}			
	ctlAPI.addContributor(project._id,data.user,data.access,function(result){
		alert(result);
	});
 	event.preventDefault();
});

function buildUsersOptions(){			
	var options = '';
		users = project.users;
	for (var i = users.length - 1; i >= 0; i--) {
		options+='<option data-userid="'+ users[i].user._id +'">'+users[i].user.firstName+' '+ users[i].user.lastName +'</option>';
	}
	return options;
}

function buildContributors(){
	var contributors = '';
	users = project.users;
	for (var i = users.length - 1; i >= 0; i--) {
		contributors+=buildContributor(users[i]);
	}
	return contributors;
}

function buildRequest(request,icqId){
	return '<li class="list-group-item" data-icqid='+icqId+'>'+
	'	<div class="row">'+
	'	  <div class="col-md-9" style="padding-left:40px;">'+
	'		<img src="https://icons.iconarchive.com/icons/flat-icons.com/flat/128/Guitar-icon.png" style="width: 40px; height:40px;margin-left: -25px;position:absolute;" alt="..." class="img-circle">'+
	'		 '+buidUser(request.user)+' - <i>'+request.message+'</i>'+
	'	  </div>'+
	'	  <div class="col-md-3">'+
	'		<div class="btn-group" role="group" aria-label="...">'+
	'		  <button type="button" class="btn btn-primary accept" data-userid="'+request.user._id+'">Accept</button>'+
	'		  <button type="button" class="btn btn-default decline" data-userid="'+request.user._id+'">Decline</button>'+
	'		</div>'+
	'	  </div>'+
	'	</div>'+
    '</li>'
}

function buildIcq(icq){
	return  '<li class="list-group-item" data-icqid="'+icq._id+'">'+
			'	<div class="row">'+
	    	'	  <div class="col-md-9">'+
			'		<img src="https://icons.iconarchive.com/icons/flat-icons.com/flat/128/Guitar-icon.png" style="width: 40px; height:40px;" alt="..." class="img-circle">'+ icq.title +', '+icq.description +
	    	'	  </div>'+
	    	'	  <div class="col-md-3">'+
			'		<div class="btn-group" role="group" aria-label="...">'+
			'		  <button type="button" class="btn btn-default disabled" data-icqid="'+icq._id+'">Jump</button>'+
			'		  <button type="button" class="btn btn-danger" data-icqid="'+icq._id+'">Delete</button>'+
			'		</div>'+
	    	'	  </div>'+
	    	'	</div>'+
		    '</li>'
}

function buidIssue(issueObject,expanded){
	return $(
	 '<div class="panel panel-default">'+
	 '   <div class="panel-heading" role="tab" id="headingOne'+issueObject._id+'">'+
	 '     <h4 class="panel-title">'+
	 '       <a role="button" data-toggle="collapse" data-parent="#issue-accordion" href="#collapseOne'+issueObject._id+'" aria-expanded="'+expanded+'" aria-controls="collapseOne'+issueObject._id+'">'+
	 issueObject. name +
	 '       </a>'+
	 '     </h4>'+
	 '   </div>'+
	 '   <div id="collapseOne'+issueObject._id+'" class="panel-collapse collapse '+(expanded?'in':'')+'" role="tabpanel" aria-labelledby="headingOne'+issueObject._id+'">'+
	 '     <div class="panel-body">'+
	 			issueObject.description+
	 '			<br><br>'+buidUser(issueObject.fromUserId) +'<br>'+ buidUser(issueObject.toUserId)+'<br><br>'+	
	 '       <button type="submit" data-issue="'+issueObject._id+'" class="btn '+(issueObject.status=="1"?'btn-success':'btn-default')+'">'+(issueObject.status=="1"?'Close Issue':'Open Issue')+'</button>'+
	 '      </div>'+
	 '    </div>'+
	 '  </div>');
}

function filterIssues(query) {
    return project.issues.filter(function(el) {
     return el._id.toLowerCase().indexOf(query.toLowerCase()) > -1;
    })
}

function updateIssue(projectId,issueId,issueJson,callback){
	ctlAPI.updateProjectIssue(projectId,issueId,issueJson,function(result){
		callback(result);
	});
}

function buidUser(userObject){
	if(userObject)
	return '<img src="'+userObject.picture+'" alt="..." class="img-circle" style="width:40px;"> '+ userObject.firstName+' '+userObject.lastName;
}

function buildContributor(userJson){
	return ' <li class="list-group-item" data-userid="'+userJson.user._id+'">'+
			'	<div class="row">'+
	    	'	  <div class="col-md-6">'+
			'		<img src="'+userJson.user.picture+'" style="width:40px;" alt="..." class="img-circle"> '+ userJson.user.firstName + ' ' + userJson.user.lastName +
	    	'	  </div>'+
	    	'	  <div class="col-md-3">'+
			'		<div class="btn-group contributors-access-btns" data-toggle="buttons">'+
			'		  <label class="btn btn-primary '+
				(userJson.access=='1'?'active':'')
			+'">'+
			'		    <input type="radio" name="options" class="btn-manager" autocomplete="off" '+
				(userJson.access?'checked':'')
			+'"> Manager'+
			'		  </label>'+
			'		  <label class="btn btn-primary '+
				(userJson.access=='1'?'':'active')
			+'">'+
			'		    <input type="radio" name="options" class="btn-limited" autocomplete="off" '+
				(userJson.access?'checked':'')
			+'">Limited'+
			'		  </label>'+
			'		</div>'+
			'	  </div>'+
			'	  <div class="col-md-3">'+
			'		<div class="btn-group" role="group" aria-label="...">'+
			'		  <button type="button" class="btn btn-danger remove">Remove</button>'+
			'		</div>'+
	    	'	  </div>'+
	    	'	</div>'+
		    '</li>'
}

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

function getURLID(){
	return location.href.substr(location.href.lastIndexOf('/') + 1);
}

// tabs events 
window.onload = function(){		
	$('a[href="'+window.location.hash+'"]').trigger( "click" );
	$('#loader').show();
};
$(document).ready(function(){
	$('#loader').hide();
});
$(document).on('click','.nav.nav-tabs a',function(){
	window.location.hash = $(this).attr("href");
});

// logo event
$(document).on('click','#logo',function(e){
	window.location.href = '../dashboard';
});

// user events
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


