/* global $, _, moment */

var app = {};
app.chatrooms = {
  'roomSelected' : false,
  'currentRoom' : '-- Select a room! --',
  'allRooms' : {
  }
};
app.friends = {};

app.stripHTML = function(html) {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

app.getURLParameter = function(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
};

app.username = app.getURLParameter('username');

app.send = function (message) {
  $.ajax({
    // always use this url
    url: 'http://127.0.0.1:3000',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.fetch = function() {
  $.ajax({
    url: 'http://127.0.0.1:3000',
    type: 'GET',
    dataType: 'json',
    data: {
      order: '-createdAt',
      limit: 30,
      where: {
        roomname: app.chatrooms.currentRoom === '-- Select a room! --' ? undefined : app.chatrooms.currentRoom
      }
    },
    success: function(data) {
      console.log(data);
      if(app.chatrooms.roomSelected) {
        app.appendMessages(data);
      }
      app.getRooms(data);
      app.lastFetch = new Date();
    },
    error: function() {
      console.error('chatterbox: Failed to retrieve messages.');
    }
  });
};

app.appendMessages = function(messages) {
    var index = 0;
    while(index < messages.results.length && new Date(messages.results[index].createdAt) > app.lastFetch){
      index++;
    }
    for(index; index > 0; index--){
      var item = messages.results[index - 1];
      if(app.friends[app.stripHTML(item.username)] === undefined){
        var nameString = app.stripHTML(item.username);
      } else {
        var nameString = '<b>'+app.stripHTML(item.username)+'</b>';
      }
      $('#container').prepend('<div class="message" data-room="'+
        app.stripHTML(item.roomname) +
        '"><span class="userId" data-user="'+app.stripHTML(item.username)+
        '"><span class="newFriend">+</span>'+
        nameString+
        ':</span><span class="messageText">'+
        app.stripHTML(item.text) +
        '</span><abbr class="time">'+
        moment(new Date(item.createdAt)).fromNow() +
        '</div>');
    }

    if($('.new-room')) {
      $('.new-room').remove();
    }
};

app.getRooms = function(data) {
  _.each(data.results, function(item) {
    app.chatrooms.allRooms[app.stripHTML(item.roomname)] = true;
  });

  $('#room select').empty();
  $('#room select').append('<option selected value="' + app.chatrooms.currentRoom + '">' + app.chatrooms.currentRoom +'</option>');
  for(var room in app.chatrooms.allRooms) {
    if(room !== app.chatrooms.currentRoom) {
      $('#room select').append('<option value="' + app.stripHTML(room) + '">' + app.stripHTML(room) + '</option>');
    }
  }
};

app.addFriend = function(name) {
  var truncate = function(string, maxLen) {
    if(string.length > maxLen) {
      return string.substring(0,maxLen) + "...";
    } else {
      return string;
    }
  };

  if(app.friends[name] === undefined){
    app.friends[name] = truncate(name, 21);
    $('.friends').append('<li>'+app.friends[name]+'<span class="last-room">Last room: hello!</span></li>');
  }
};

app.sendMessage = function() {
  var text = $('#chatText').val();
  var message =  {
    'username': app.username,
    'text': text,
    'roomname': app.chatrooms.currentRoom
  };
  app.send(message);
  $('#chatText').val('');
  setTimeout(function() {
    app.fetch();
  }, 1200);
};

app.init = function() {
  // Initialize the chat box
  $(function() {
    $('.your-name').text('You\'re logged in as: ' +app.username);
    app.fetch();

    $('#room select').change(function () {
      console.log("Change triggered");
      app.chatrooms.roomSelected = true;
      app.chatrooms.currentRoom = $('#room select').val();
      $('#container').empty();
      app.lastFetch = 0;
      app.fetch();
    });

    $('#newRoom').on('click', function(e){
      e.preventDefault();
      var response = prompt('Where shall we go, sir?');
      if(response) {
        app.lastFetch = 0;
        app.chatrooms.roomSelected = true;
        app.chatrooms.currentRoom = response;
        $('#container').empty();
        $('#container').append('<div class="new-room message">You\'re in a new room by yourself! Send a message so other people can find you.</div>');
        $('#room select').append('<option selected value="' + app.chatrooms.currentRoom + '">' + app.chatrooms.currentRoom +'</option>');
      }
    });

    $('body').on('click', '.userId', function(e){
      e.preventDefault();
      app.addFriend($(this).data('user'));
    });
  });
};

app.init();
