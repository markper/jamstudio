function loadDashboard(user){

	var ctlAPI = new controllerAPI();
	var projects = {};

	loadProjectByUserId(user.info._id);
    $('.profile h1').text(user.info.firstName + ' ' + user.info.lastName);
    $('.profile h4').text(user.info.email);

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
						'<div><a href="'+window.location.href.split("/")[0]+'/app/studio/'+project._id+'">'+project.name+'</a></div><div><a href="studio/'+project._id+'">'+project.genre+'</a></div></div>'+
						'<div class="settings" data-project="'+project._id+'"></div>'+
					   '</article>';		
	}

	$(document).on('click','.settings',function(e){
		console.log(window.location.host)
		window.location = 'project/'+$(e.target).attr("data-project");
	});

	$(document).on('click','#btn-create-project',function(e){
		ctlAPI.createProject({
			adminUser: user.info._id,
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


	// TEXT JUSTIFIED
// 	function SplitText(node)
// 	{
// 	    var text = node.nodeValue.replace(/^\s*|\s(?=\s)|\s*$/g, "");

// 	    for(var i = 0; i < text.length; i++)
// 	    {
// 	        var letter = document.createElement("span");
// 	        letter.style.display = "inline-block";
// 	        letter.style.position = "absolute";
// 	        letter.appendChild(document.createTextNode(text.charAt(i)));
// 	        node.parentNode.insertBefore(letter, node);

// 	        var positionRatio = i / (text.length - 1);
// 	        var textWidth = letter.clientWidth;

// 	        var indent = 100 * positionRatio;
// 	        var offset = -textWidth * positionRatio;
// 	        letter.style.left = indent + "%";
// 	        letter.style.marginLeft = offset + "px";

// 	        //console.log("Letter ", text[i], ", Index ", i, ", Width ", textWidth, ", Indent ", indent, ", Offset ", offset);
// 	    }

// 	    node.parentNode.removeChild(node);
// 	}
// 	Justify('user_email');
// 	Justify('user_fullname');
// 	function Justify(selector)
// 	{
// 	    var TEXT_NODE = 3;
// 	    var elem = document.getElementById(selector);
// 	    elem = elem.firstChild;

// 	    while(elem)
// 	    {
// 	        var nextElem = elem.nextSibling;

// 	        if(elem.nodeType == TEXT_NODE)
// 	            SplitText(elem);

// 	        elem = nextElem;
// 	    }
// 	}

 }

