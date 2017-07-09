var ctlAPI = new controllerAPI();
var loggedUser = {};

init();

function init(){
  // Init
  ctlAPI.getUserInfo(function(result){
    loggedUser = result;
    bindFormUserPlanData();
  });
}



function bindFormUserPlanData(){
  ctlAPI.getAllPlan(function(result){
    $(result).each(function(key,value){
      var option = $('<option data-planid="'+value._id+'">'+value.name+'</option>')
      $('#planId').append(option);
    });
  });
}

$(document).on('click','#register-btn',function(e){
  e.preventDefault();
  var userJson = {
    "firstName":  $('#firstName').val(),
    "lastName":$('#lastName').val(),
    "email" :$('#email').val(),
    "password":$('#password').val(),
    "picture": loggedUser.picture,
    "planId": $('#planId').val(),
    "storage_usage": loggedUser.storage_usage
  }

  ctlAPI.createUser(userJson, function(result){
    console.log(result);
  });
  return;
});

function myFunction() {
  var x = document.getElementById('signupForm');
  var d = document.getElementById('signup');
  var w = document.getElementsByClassName('modal-content');
  var y = document.getElementById('loginForm');
  var z = document.getElementById('reg-trigger');
  if (x.style.display === 'none') {
      x.style.display = 'block';
      d.style.display = 'block';
      y.style.display = 'none';
      w[0].style.display = 'none';
      z.style.display = 'none';
  } else {
      x.style.display = 'none';
      d.style.display = 'none';
      w[0].style.display = 'block';
      y.style.display = 'block';
      z.style.display = 'block';
  }
}

//auth0
// document.getElementById("login-btn").addEventListener("click", function(){
//   var settings = {
//     "async": true,
//     "crossDomain": true,
//     "url": "http://localhost:3000/api/authenticate",
//     "method": "POST",
//     "headers": {
//       "content-type": "application/json"
//     },
//     "processData": false,
//     "data": "{\"client_id\": \"x8Ci9aQWg8anRU0Sgy53g4dcdIHVNLrF\",\"email\": \"$('#login-email').val()\",\"password\": \"$('#login-password').val()\",\"user_metadata\": {}}"
//   }
//
//   $.ajax(settings).done(function (response) {
//     console.log(response);
//   });
//
// });

$(document).on('click','#btn_login',function(e){
 event.preventDefault();
    $.ajax({
        type: "Post",
        datatype:"json",
        url: 'http://localhost:3000/api/authenticate',
        data:({
            email : $('#email').val(),
            password: $('#password').val()
        }),
        success: function(result)
        {
            if(result && result.token.length>1) // you should do your checking here
            {
                window.location = 'studio.html'; //just to show that it went through
            }
            else
            {
                $('#result').empty().addClass('error')
                    .append('Something is wrong.');
            }
        }
    });
    return false;
});
