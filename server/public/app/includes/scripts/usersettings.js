var ctlAPI = new controllerAPI();
var loggedUser = {};

init();

function init(){
  // Init
    userComponent(function(result){
      loggedUser = result.info;
      bindFormUserEditData();
      bindFormUserPlanData();
    });
}



function bindFormUserEditData(){
  $('#user-set-fname').val(loggedUser.firstName);
  $('#user-set-lname').val(loggedUser.lastName);
  $('#user-set-email').val(loggedUser.email);
  $('#user-set-password').val(loggedUser.password);
  $('#user-set-picture').attr('src','../static/uploads/'+loggedUser.picture);
}

function bindFormUserPlanData(){
  ctlAPI.getAllPlan(function(result){
    $(result).each(function(key,value){
      var option = $('<option data-planid="'+value._id+'">'+value.name+'</option>')
      $('#user-privacy-input').append(option);
    });
  });
}

$(document).on('click','#user-set-picture', function(e){
    var form = $('<form enctype="multipart/form-data"><input name="file" type="file" /><input type="button" value="Upload" /></form><progress></progress>');
    var input = $(form).find('input[name="file"]');
    setTimeout(function(){
        $(input).click();
    },200);
    $(input).change(function () {
      var file = this.files[0];

      // add the files to formData object for the data payload
      var formData = new FormData();
      formData.append('uploads[]', file, file.name);

      ctlAPI.uploadUserPicture(formData, function(result){
        console.log(result);
        reload('user-picture');
      });

    });
});


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
    reload('user-set');
  });
  return;
});

$(document).on('click','#btn-user-privacy',function(e){
  e.preventDefault();
   var plan = $('#user-privacy-input option:selected').attr('data-planid');
   ctlAPI.updateUserPlan(loggedUser._id, plan, function(result){
     console.log(result);
     reload('user-privacy');
   });
});

function reload(hash){
  //location.href = location.href.split('#')[0]+'#'+hash;
  location.reload();
}


