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
          $('header #connected_user .user_img').css('background-image','url(../static/uploads/'+data.picture+')');
  };
};

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


// $(document).on('click','#btn-user-set',function(e){
//       var form = $('<form enctype="multipart/form-data"><input name="file" type="file" /><input type="button" value="Upload" /></form><progress></progress>');
//       var input = $(form).find('input[name="file"]');
//       setTimeout(function(){
//           $(input).click();
//       },200);

//       $(input).change(function () {
//         var file = this.files[0];
//         var audio = new Audio();
//         audio.src= URL.createObjectURL(file);
//         audio.onloadedmetadata = function() {
//         ctlDBHelper.uploadFile(ctlUser.info._id,new FormData($(form)[0]),audio.duration,file.size,function(result){
//           console.log(result);
//         },function(res){
//           console.log(res);
//         });
//       };
//     });
// });

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

      $('#loader').show();
      $('.loader-progress').show();
      $('.progress-bar').css({'width':'0px'});

      $.ajax({
        url: 'http://localhost:3000/user/picture',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
            console.log('upload successful!\n' + data);
            $('.loader-progress').hide();
            $('#loader').hide();
            $('#user-set-picture').attr('src','../static/uploads/'+data);
        },
        xhr: function() {
          // create an XMLHttpRequest
          var xhr = new XMLHttpRequest();

          // listen to the 'progress' event
          xhr.upload.addEventListener('progress', function(evt) {

            if (evt.lengthComputable) {
              // calculate the percentage of upload completed
              var percentComplete = evt.loaded / evt.total;
              percentComplete = parseInt(percentComplete * 100);

              // update the Bootstrap progress bar with the new percentage
              $('.progress-bar').text(percentComplete + '%');
              $('.progress-bar').width(percentComplete + '%');

              // once the upload reaches 100%, set the progress bar text to done
              if (percentComplete === 100) {
                $('.progress-bar').html('Done');
              }

            }

          }, false);

          return xhr;
        }
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


