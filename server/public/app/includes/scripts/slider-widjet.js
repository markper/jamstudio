var slider_widjet = function(_configuration){
	var configuration = _configuration;

	this.get = function(){
		return calculateItemsInPageAmount();
	};

	this.pageIndex = 0;

	this.print = function(){
		var itemsInPage = calculateItemsInPageAmount().length;
		var counter = configuration.arr.length;
		var pageCounter = 0;
		var canvas = $(configuration.container).find('.canvas');
		$(canvas).html('');
		var page = null;
		for (var i = 0; i < configuration.arr.length; i++) {

			if(!pageCounter || !((i)%itemsInPage)){
				addPage();				
			}
			addItem();
			
			function addItem(){
				var project =  '<article class="project_item">'+
								'<div class="project_item_cover"></div>'+
								'<div class="project_item_info">'+
								'<div><a href="studio/'+configuration.arr[i]._id+'">'+configuration.arr[i].name+'</a></div><div><a href="studio/'+configuration.arr[i]._id+'">'+configuration.arr[i].adminUser.email+'</a></div></div>'+
							'</article>';
				var item = $('<li class="page-item">'+
					project
					+'</li>');
				$(item).css({width:configuration.itemWidth,height:configuration.itemHeight});
				$(page).append(item);
			}

			function addPage(){
				page = createPage();
				$(canvas).append(page);
				pageCounter++;
			}

			function createPage(){			
				return $('<ul class="page"></ul>').css({width:$(configuration.container).width(),height:$(configuration.container).height()});;
			}
			
		}
		$(canvas).css({width: pageCounter*$(configuration.container).width()});
	}

	var onProcess = false;			
	this.next = function(){
		if(onProcess)return;
		onProcess = true;	
		var position = $('.canvas').offset().left;
		var allWidth = $('.canvas').innerWidth() - $(configuration.container).width();
		if(position==-allWidth){
			console.log('false');
			onProcess = false;	
			return;
		}
		$('.canvas').each(function(key,value){
			$(value).animate({
			    marginLeft: $(value).offset().left  - $(configuration.container).width() +'px'
			  }, 1000, function() {
			    // Animation complete.
			    this.pageIndex++;
				onProcess = false;	
			  });
		});
	}
	this.back = function(){
		if(onProcess)return;
		onProcess = true;	
		var position = $('.canvas').offset().left;
		if(position==0){
			$('.canvas').css({marginLeft:0})
			onProcess = false;	
			return;
		}
		$('.canvas').each(function(key,value){
			$(value).animate({
			    marginLeft: $(value).offset().left + $(configuration.container).width() + 'px'
			  }, 1000, function() {
			    // Animation complete.
			    this.pageIndex--;
				onProcess = false;	
			  });
		});
		
	}



	function calculateItemsInPageAmount(){
		var itemsToCell = Math.floor($(configuration.container).height()/configuration.itemHeight),
			itemsToRow = Math.floor(($(configuration.container).width())/configuration.itemWidth);			
		return {x: itemsToRow, y: itemsToCell, length: itemsToRow*itemsToCell};
	}
};






// function printProjectList(projects){
// 			var allProjects = projects.admin.concat(projects.contributor)
// 			if(allProjects!=null){
// 				var page = null;
// 				var itemsToRow = 0,
// 					itemsToCell =0;
// 				var cond = i%(itemsToRow*itemsToCell);

// 			 	if(isNaN(cond)){			 		
// 					itemsToCell =1;
// 				}
// 				for (var i = 0; allProjects.length>i; i++) {
// 					cond = i%(itemsToRow*itemsToCell);
// 					if(cond==0){
// 						page = $('<li>'+
// 							'	<ul class="project_list_page">'+
// 							'	</ul>'+
// 							'</li>');
// 						$('.project_list').append(page);
// 					}
// 					var item =  $('<li class="project_list_item">'+
// 								'	<div class="project_list_item_cover"></div>'+
// 								'	<div class="project_list_item_info">'+
// 								'<div><a href="studio/'+allProjects[i]._id+'">'+allProjects[i].name+'</a></div><div><a href="studio/'+allProjects[i]._id+'">'+allProjects[i].adminUser.email+'</a></div></div>'+
// 								'</li>');
// 					$(page).find('.project_list_page').append(item);
// 				}
// 			}
// 			var allWidth =Math.ceil(allProjects.length/(itemsToRow*itemsToCell))*window.innerWidth;
// 			$('.project_list').css({width: allWidth+'px'});
// 			$('.project_list').css({height: itemsToCell*350});

// 			ps=new projectSlider($('.project_list_page').length);
// 		}	

// 		var ps = null;
// 		$(document).on('click','.next',function(e){			
// 			ps.next();
// 		});
// 		$(document).on('click','.back',function(e){
// 			ps.back()
// 		});
// 		$(document).on('click','.create',function(e){
// 			var jsonObj = {
// 			    "adminUser": user.user._id,
// 			    "name": "String",
// 			    "description": "String",
// 			    "genre": "String",
// 			}
// 			ctlAPI.createProject(jsonObj,function(result){
// 				console.log(result);
// 			});
// 		});


// 		function projectSlider(_pages){
// 			var index = 0, pages = _pages;
// 			var onProcess = false;			
// 			this.next = function(){
// 				if(onProcess)return;
// 				onProcess = true;	
// 				console.log(onProcess);
// 				var position = $('.project_list').offset().left;
// 				var allWidth = $('.project_list').innerWidth() - window.innerWidth;
// 				console.log('position '+position);
// 				console.log('allWidth '+ allWidth);
// 				if(position==-allWidth){
// 					onProcess = false;	
// 					console.log(onProcess);
// 					return;
// 				}
// 				$('.project_list')
// 				.animate({
// 				    left: position-window.innerWidth+'px'
// 				  }, 1000, function() {
// 				    // Animation complete.
// 					onProcess = false;	
// 					console.log(onProcess);
// 				  });
// 			}
// 			this.back = function(){
// 				if(onProcess)return;
// 				onProcess = true;	
// 				console.log(onProcess);
// 				var position = $('.project_list').offset().left;
// 				if(position==0){
// 					$('.project_list').css({left:0})
// 					onProcess = false;	
// 					console.log(onProcess);
// 					return;
// 				}
// 				$('.project_list')
// 				.animate({
// 				    left: position+window.innerWidth+'px'
// 				  }, 1000, function() {
// 				    // Animation complete.
// 					onProcess = false;	
// 					console.log(onProcess);
// 				  });
// 			}
// 		}	
