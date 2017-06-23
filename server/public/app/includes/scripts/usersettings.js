var ctlAPI = new controllerAPI();
var crlUser = new user();
var loggedUser = {};

init();

function init(){
  // Init
  ctlAPI.getUserInfo(function(result){
    loggedUser = result;
    crlUser.init(result);
    bindFormUserEditData();
    bindFormUserPlanData();
  });
}

function user(){
  this.info = null;
  this.init = function(data){
    this.info = data;
          $('div.username span:first').text(data.email);
          $('header #connected_user .user_img').css('background-image','url('+data.picture+')');
  };
};

function bindFormUserEditData(){
  $('#user-set-fname').val(loggedUser.firstName);
  $('#user-set-lname').val(loggedUser.lastName);
  $('#user-set-email').val(loggedUser.email);
  $('#user-set-password').val(loggedUser.password);
}

function bindFormUserPlanData(){
  ctlAPI.getAllPlan(function(result){
    $(result).each(function(key,value){
      var option = $('<option data-planid="'+value._id+'">'+value.name+'</option>')
      $('#user-privacy-input').append(option);
    });
  });
}

$(document).on('click','#btn-user-set',function(e){
  e.preventDefault();
  var userJson = {
    "firstName":  $('#user-set-fname').val(),
    "lastName":$('#user-set-lname').val(),
    "email" :$('#user-set-email').val(),
    "password":$('#user-set-password').val(),
    "picture": loggedUser.picture,
    "planId": loggedUser.planId,
    "storage_usage": loggedUser.storage_usage
  }

  ctlAPI.updateUserInfo(loggedUser._id, userJson, function(result){
    console.log(result);
  });
  return;
});

$(document).on('click','#btn-user-privacy',function(e){
  e.preventDefault();
   var plan = $('#user-privacy-input option:selected').attr('data-planid');
   ctlAPI.updateUserPlan(loggedUser._id, plan, function(result){
     console.log(result);
   });
});


