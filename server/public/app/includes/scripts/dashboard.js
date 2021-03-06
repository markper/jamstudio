function loadDashboard(user,loggedUser){
	var url = window.location.href
	var arr = url.split("/");
	var server = arr[0] + "//" + arr[2]
	var ctlAPI = new controllerAPI();
	var projects = {};

	loadProjectByUserId(user.info._id);
	
    $('.profile h1').text(user.info.firstName + ' ' + user.info.lastName);
    $('.profile h4').text(user.info.email);
    $('.profile-image img').attr('src',user.info.picture);
    $('.profile-image img').css('height',$('.profile-image img').css('width'));
    $('#user-settings a').attr('href',server+'/app/usersettings')
    if(user.info._id != loggedUser){
    	$('#user-settings').hide();
    	$('#create_project').hide();
    	$('.profile h4').hide();
    }

	function loadProjectByUserId(userId){
		ctlAPI.getProjectList(userId,function(_result){
			printProjects(_result.admin,'main .wrapper .project-list-my');
			printProjects(_result.contributor,'main .wrapper .project-list-others');
		});
	}

	function loadProjectByWord(word){
		ctlAPI.getProjectsByWord(word,function(_result){
			printProjects(_result.admin,'main .wrapper .project-list-my');
			printProjects(_result.contributor,'main .wrapper .project-list-others');
		});
	}

	function printProjects(projects,selector){
		if(projects && projects.length)
			for (var i = projects.length - 1; i >= 0; i--) {
				var project = projects[i];
				var element = $(buildProject(project));
				if(selector=='main .wrapper .project-list-others')
					$(element).find('.settings').remove();
				$(selector).append(element);
			}
		else
			$(selector).text("No projects yet..");
	}
	function buildProject(project){
		var settings = "";
		if(loggedUser== project.adminUser._id)
			settings = '<div class="settings" data-project="'+project._id+'"></div>';
		return  '<article class="project_item">'+
						'<div class="project_item_cover"></div>'+
						'<div class="project_item_info">'+
						'<div><a href="'+server+'/app/studio/'+project._id+'">'+project.name+'</a></div><div><a href="studio/'+project._id+'">'+project.genre+'</a></div></div>'+
						settings +
					   '</article>';		
	}

	$(document).on('click','.settings',function(e){
		console.log(window.location.host)
		window.location = server +'/app/project/'+$(e.target).attr("data-project");
	});

	$(document).on('click','#btn-create-project',function(e){
		ctlAPI.createProject({
			adminUser: user.info._id,
		    name: $('#project-name').val(),
		    description: $('#project-description').val(),
		    genre: $('#project-genre').val()
		},function(result){
			if(result)
				window.location.href = server +'/app/studio/'+result._id;
		});
	});
	
	

 }

