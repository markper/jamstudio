var ctlAPI = new controllerAPI();
var ctlUser = new userComponent();
var projects = {};

/* User */
ctlAPI.getUserInfo(function(result){
	ctlUser.init(result);
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
        loadProjects();
        loadUsers();
	};
};

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function loadProjects(){
	var word = getParameterByName('word');
	console.log(word);
	ctlAPI.getProjectsByWord(word,function(_result){
		printProjects(_result.admin.conact(_result.contributor),'main .wrapper .project-list-others');
	});
}

function loadUsers(){
	var word = getParameterByName('word');
	console.log(word);
	ctlAPI.getProjectsByWord(word,function(_result){
		console.log(_result.admin);
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
		