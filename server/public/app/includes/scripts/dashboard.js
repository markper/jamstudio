var ctlAPI = new controllerAPI();
		var ctlUI = new studioUI();
		var ctlUser = new user();
		var projects = {};

		// Init studio
		ctlAPI.getUserInfo(function(result){

			ctlUser.init(result);

			loadAllProjects(result._id);
			
		});

		function initSlider(projects){
			var slider = new slider_widjet({
					container: '.slider-widjet',
					itemHeight: 250,
					itemWidth: 180,
					arr: projects
				});
			slider.print();
			$(document).on('click','.next',function(e){			
				slider.next();
			});
			$(document).on('click','.back',function(e){
				slider.back()
			});
		}

		var rtime;
		var timeout = false;
		var delta = 200;
		$(window).resize(function() {
		    rtime = new Date();
		    if (timeout === false) {
		        timeout = true;
		        setTimeout(resizeend, delta);
		    }
		});
		function resizeend() {
		    if (new Date() - rtime < delta) {
		        setTimeout(resizeend, delta);
		    } else {
		        timeout = false;
		        console.log(projects);
		        initSlider(projects);
		    }               
		}

		function user(){

			this.info = null;
			

			this.init = function(data){
				this.info = data;
	            $('div.username span:first').text(data.email);
	            $('header #connected_user .user_img').css('background-image','url('+data.picture+')');
			};
		};
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
		function loadAllProjects(userId){
			ctlAPI.getProjectList(userId,function(_result){
				initSlider(_result.admin.concat(_result.contributor));
				projects = _result.admin.concat(_result.contributor);
			});
		}
		$(document).on('click','#search-line .btn',function(e){
			var word = $("#input-search").val();
			if(word)
				ctlAPI.getProjectsByWord(word,function(_result){
					initSlider(_result.admin.concat(_result.contributor));
					projects = _result.admin.concat(_result.contributor);
				});
			else{
				loadAllProjects(ctlUser.info._id);
			}
		});
		