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
				items += buildIcq(icqs[i]);
			}
			var all =	'<ul class="list-group">'+
				  		items +
						'</ul>';
			$('#projects .project-list-icqs').append($(all));
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
	return '<img src="'+userObject.picture+'" alt="..." class="img-circle" style="width:40px;"> &nbsp;'+ userObject.firstName+' '+userObject.lastName;
}
function buildIcq(icq){
	return  '<li class="list-group-item" data-icqid="'+icq._id+'">'+
			'	<div class="row">'+
	    	'	  <div class="col-md-9">'+
			'		<img src="https://icons.iconarchive.com/icons/flat-icons.com/flat/128/Guitar-icon.png" style="width: 40px; height:40px;" alt="..." class="img-circle">'+ icq.title +', '+icq.description +
	    	'	  </div>'+
	    	'	  <div class="col-md-3">'+
	    	'      <span class="glyphicon glyphicon-play-circle play" style="font-size: 25px;margin-top:10px;" data-projectId="'+icq.projectId._id+'"></span>'+
	    	'	  </div>'+
	    	'	</div>'+
		    '</li>'
}

function buildProject(project){
	return  '<article class="project_item">'+
					'<div class="project_item_cover"></div>'+
					'<div class="project_item_info">'+
					'<div><a href="studio/'+project._id+'">'+project.name+'</a></div><div><a href="studio/'+project._id+'">'+project.genre+'</a></div></div>'+
					'<div class="settings" data-project="'+project._id+'"></div>'+
				   '</article>';		
}

$(document).on('click','.settings',function(e){
	console.log(window.location.host)
	window.location = 'project/'+$(e.target).attr("data-project");
});

$(document).on('click','#btn-create-project',function(e){
	ctlAPI.createProject({
		adminUser: ctlUser.info._id,
	    name: $('#project-name').val(),
	    description: $('#project-description').val(),
	    genre: $('#project-genre').val()
	},function(result){
		if(result)
			window.location.href = 'studio/'+result._id;
	});
});

/* NavBar */
$(document).on('click','#hamburger',function(e){
	$('.sidenav').toggleClass("open");
});
$(document).on('click','.closebtn',function(e){
	$('.sidenav').toggleClass("open");
});


		