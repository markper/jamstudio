function search(ctlUser){

	var url = window.location.href
	var arr = url.split("/");
	var server = arr[0] + "//" + arr[2]
	var serverFiles = 'https://oran1.herokuapp.com/uploads/';
	var ctlAPI = new controllerAPI();
	var projects = {};

	/* User */

	function getParameterByName(name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	loadProjects();
	function loadProjects(){
		var word = getParameterByName('word');
		console.log(word);
		ctlAPI.getProjectsByWord(word,function(_result){
			printProjects(_result.projects,'#projects .project-list-projects');
		});
	}

	loadUsers();
	function loadUsers(){
		var word = getParameterByName('word');
		console.log(word);
		ctlAPI.getUsersPrefix(word,function(users){
			if(users && users.length){
				var items = '';
				for (var i = users.length - 1; i >= 0; i--) {
					items += '<li class="list-group-item" data-userid="'+users[i]._id+'" data-username="'+users[i].firstName + ' ' +users[i].lastName +'"><a href="dashboard/'+users[i]._id+'">'+ buidUser(users[i]) +'</a></li>';
				}
				var all =	'<ul class="list-group">'+
					  		items +
							'</ul>';
				$('#projects .project-list-users').append($(all));
			}		
			else
				$('#projects .project-list-users').text("No people found..");
		});
	}

	loadIcqs();
	function loadIcqs(){
		var word = getParameterByName('word');
		console.log(word);
		ctlAPI.getIcqByPrefix(word,function(icqs){
			icqs = icqs.icqs;
			if(icqs && icqs.length){
				var items = '';
				for (var i = icqs.length - 1; i >= 0; i--) {
					var icq = icqs[i];
					ctlAPI.getIcqApplicants(icq._id,ctlUser.info._id,function(result){
						console.log(result);
						try{
							$('#projects .project-list-icqs .list-group').append(buildIcq(icq,result));
						}catch(exc){}
					});
				}
				$('#projects .project-list-icqs').append($('<ul class="list-group"></ul>'));
			}		
			else
				$('#projects .project-list-icqs').text("No people found..");
		});
	}




	function printProjects(projects,selector){
		if(projects && projects.length)
			for (var i = projects.length - 1; i >= 0; i--) {
				var element = $(buildProject(projects[i]));
				$(selector).append(element);
			}
		else
			$(selector).text("No projects found..");
	}
	function buidUser(userObject){
		if(userObject)
		return '<img src="'+userObject.picture+'" alt="..." class="img-circle" style="width:40px;height:40px;"> &nbsp;'+ userObject.firstName+' '+userObject.lastName;
	}
	function buildIcq(icq,isRequested){
		var btn = null;
		if(isRequested)
				btn = '<button type="button" class="btn btn-danger requestCancel" data-icqId="'+icq._id+'">Cancel Request</button>';
			else
				btn = '<button type="button" class="btn btn-default requestAsk" data-icqId="'+icq._id+'"  data-toggle="modal">Request</button>';
		
		return  '<li class="list-group-item" data-icqid="'+icq._id+'">'+
				'	<div class="row">'+
		    	'	  <div class="col-md-9"><a href="'+ server +'/app/studio/' + icq.projectId._id+'" target="blank">'+
				'		<img src="https://icons.iconarchive.com/icons/flat-icons.com/flat/128/Guitar-icon.png" style="width: 40px; height:40px;" alt="..." class="img-circle"> '+ icq.title +', '+icq.description +
		    	'	  </a></div>'+
		    	'	  <div class="col-md-3">'+	
		    	btn +	    	
		    	'	  </div>'+
		    	'	</div>'+
			    '</li>'
	}

	function buildProject(project){
		return  '<article class="project_item">'+
						'<div class="project_item_cover"></div>'+
						'<div class="project_item_info">'+
						'<div><a href="studio/'+project._id+'">'+project.name+'</a></div><div><a href="studio/'+project._id+'">'+project.genre+'</a></div></div>'+
					   '</article>';		
	}



	$(document).on('click','.requestAsk',function(e){
			var icqRequset = $(e.target).attr('data-icqId');
			$('#modal-prompt  .btn-primary').attr('data-icqId',icqRequset);
			$('#modal-prompt').find('.modal-title').text('Join Request');
			$('#modal-prompt').modal();
	});

	$(document).on('click','#modal-prompt .btn-primary',function(e){
		var applicantJson ={
			user: ctlUser.info._id,
			message:$('#inputPrompt').val()
		}
		ctlAPI.addIcqApplicants($(e.target).attr('data-icqId'),applicantJson,function(result){
			location.reload();
		});
	});

	$(document).on('click','.requestCancel',function(e){
		ctlAPI.removeIcqApplicants($(e.target).attr('data-icqId'),ctlUser.info._id,function(result){
			location.reload();
		});
	});


}

		