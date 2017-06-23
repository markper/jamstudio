var ctlAPI = new controllerAPI();
var ctlUser = new userComponent();
var projects = {};

/* User */
ctlAPI.getUserInfo(function(result){
	ctlUser.init(result);
	loadProjectByUserId(result._id);
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
        $('.profile h1').text(data.firstName + ' ' + data.lastName);
        $('.profile h4').text(data.email);
	};
};


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
			var element = $(buildProject(projects[i]));
			$(selector).append(element);
		}
	else
		$(selector).text("No projects yet..");
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

$(document).on('click','#search-line .btn',function(e){
	var word = $("#input-search").val();
	if(word)
		loadProjectByWord(word);
	else{
		loadProjectByUserId(ctlUser.info._id);
	}
});
		