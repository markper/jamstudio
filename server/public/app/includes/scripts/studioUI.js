function studioUI(){

	function openWhiteWindow(_width,_height,_title){
		$('#black_screen > section').fadeOut(250);
		$('#black_screen > section').html('<div id="close_white_window" href="#">&times;</div>');
		setTimeout(function(){
			var _top =50,_left=250;
			if(!(_width>0 && _height>0)){
				_width = $('main').width()-303;
				_height = $('main').height() -57;
			}else{

				_left = 'calc(50% - '+_width/2+'px)';
				_top = 'calc(50% - '+_height/2+'px)';
			}

			$('#black_screen > section').fadeIn(250).css("width",_width+'px').css("height",_height+'px')
			.css("top", _top).css("left",_left).prepend('<div id="white_window_title">'+_title+'</div>');
		},250);
		
	}
	function closeWhiteWindow(){
		$('#black_screen > section').fadeOut(250);
	};
	function closeNav(){
		$("#mySidenav").css('width','0px');
	    $('#black_screen').hide();
	    $('header').removeClass("blure")
		$('main').removeClass("blure")
		$('footer').removeClass("blure")
	}
	function createInput(type='text'){
		switch(type){
			case 'form':{
				return $('<form action="" method="post"></form>');
				break;
			}
			case 'text':{
				return $('<input class="white_window_component" type="text">');
				break;
			}
			case 'textarea':{
				return $('<textarea class="white_window_component"></textarea>');
				break;
			}
			case 'button':{
				return $('<button  class="white_window_component" type="button"></button>');
				break;
			}
			case 'select':{
				return $('<select class="white_window_component"></select>');
				break;
			}
			case 'option':{
				return $('<option class="white_window_component"></option>');
				break;
			}
			case 'list':{
				return $('<section class="white_window_component list"><ul></ul></section>');
				break;
			}
			case 'list_full':{
				return $('<section class="white_window_component list list_full"><ul></ul></section>');
				break;
			}
		}
	}
	function createUserListItem(){
		return $('<li>'+
				'	<div class="listitem_name">'+
				'		<div class="listitem_name_pic"></div>'+
				'		<div class="listitem_name_text"></div>'+
				'	</div>'+
				'	<div class="listitem_description"></div>'+
				'	<div class="listitem_icons"></div>'+
				'</li>');
	}
	function createListItem(){
		return $('<li>'+
				'	<div class="listitem_name">'+
				'		<div class="listitem_name_text"></div>'+
				'	</div>'+
				'	<div class="listitem_description"></div>'+
				'	<div class="listitem_icons"></div>'+
				'</li>');
	}


	$(document).on('click','#logo',function() {
		// $('header').addClass("blure")
		// $('main').addClass("blure")
		// $('footer').addClass("blure")
		// $("#mySidenav").css('width','250px');
		// $('#black_screen').toggle();
	});

	$(document).on('click','#close_nav',function() {
		closeNav();
	});

	$(document).on('click','#close_white_window',function(){
		//closeWhiteWindow();
	});

	$(document).on('click','#nav_settings',function(){
		openWhiteWindow('500','400','Settings');
	});

	$(document).on('click','#nav_issues',function(){		
		openWhiteWindow(0,0,'Issues');
		var list = createInput('list_full');
		for (var i = 30 - 1; i >= 1; i--) {
			var listItem =createUserListItem();
			$(listItem).find('.listitem_name .listitem_name_pic').css('background-image','url(https://scontent.fhfa2-1.fna.fbcdn.net/v/t1.0-1/c26.7.40.40/p74x74/1374206_10151895529017929_1400551419_n.jpg?oh=d2a7b83d1a19fb557fb09fc50bc5b760&oe=5929F59B)');
			$(listItem).find('.listitem_name_text').text('Issue ' + i);
			$(listItem).find('.listitem_description').text('description');
			$(listItem).find('.listitem_icons').text('delete | permition');	
			$(list).find('ul').append(listItem);
		}
		$('#black_screen > section').append(list);
	});

	$(document).on('click','#nav_versions',function(){		
		openWhiteWindow('500','230','Versions');

		var form = createInput('form');
		var username = createInput('text');
		var list = createInput('list');

		for (var i = 4 - 1; i >= 1; i--) {
			var listItem =createListItem();
			$(listItem).find('.listitem_name_text').text('Track version ' + i);
			$(listItem).find('.listitem_description').text('description');
			$(listItem).find('.listitem_icons').text('delete | permition');	
			$(list).find('ul').append(listItem);
		}

		var btn = createInput('button').text('Submit');
		$(form).append(username).append(list).append(btn);
		$('#black_screen > section').append(form);
	});

	$(document).on('click','#nav_contributors',function(e){
		openWhiteWindow('600','230','Track Contributors');
		var form = createInput('form');
		var username = createInput('text');
		var list = createInput('list');
		var permission = createInput('select');
		var opt1 = createInput('option').text('edit');
		var opt2 = createInput('option').text('view onlly');
		$(permission).append(opt1).append(opt2)
		for (var i = 20 - 1; i >= 0; i--) {
			var listItem =createUserListItem();
			$(listItem).find('.listitem_name .listitem_name_pic').css('background-image','url(https://scontent.fhfa2-1.fna.fbcdn.net/v/t1.0-1/c26.7.40.40/p74x74/1374206_10151895529017929_1400551419_n.jpg?oh=d2a7b83d1a19fb557fb09fc50bc5b760&oe=5929F59B)');
			$(listItem).find('.listitem_name_text').text('Israel Israeli');
			$(listItem).find('.listitem_description').text('description');
			$(listItem).find('.listitem_icons').text('delete | permition');	
			$(list).find('ul').append(listItem);
		}

		var btn = createInput('button').text('Submit');
		$(form).append(permission).append(username).append(list).append(btn);
		$('#black_screen > section').append(form);

	});

	$(document).on('click','#nav_exit',function(){
		closeNav();
	});

}