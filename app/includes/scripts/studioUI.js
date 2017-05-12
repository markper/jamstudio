
function openWhiteWindow(_width,_height,_title){
	$('#black_screen > section').fadeOut(500);
	setTimeout(function(){
		$('#black_screen > section').fadeIn(500).css({width:_width+'px',height:_height+'px'
		,	top: 'calc(50% - '+_height/2+'px)',left: 'calc(50% - '+_width/2+'px)' })
	.find('#white_window_title').html(_title);
	},500);
	
}
function closeWhiteWindow(){
	$('#black_screen > section').fadeOut(500);
};
function closeNav(){
	$("#mySidenav").css('width','0px');
    $('#black_screen').hide();
}
$(document).on('click','#open_nav',function() {
	$("#mySidenav").css('width','250px');
	$('#black_screen').show();
});

$(document).on('click','#close_nav',function() {
	closeNav();
});

$(document).on('click','#close_white_window',function(){
	closeWhiteWindow();
});

$(document).on('click','#nav_settings',function(){
	openWhiteWindow('500','400','Settings');
});

$(document).on('click','#nav_versions',function(){
	openWhiteWindow('200','500','Versions');
});

$(document).on('click','#nav_contributors',function(){
	openWhiteWindow('400','400','Contributors');
});

$(document).on('click','#nav_issues',function(){
	openWhiteWindow('500','500','Issues');
});

$(document).on('click','#nav_exit',function(){
	closeNav();
});