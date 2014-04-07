'use strict';

var WebkiteAuth = {
  host: 'http://localhost:9000',
  tokenURL: 'http://localhost:9000/oauth/authorize',
  userDataURL: 'http://localhost:9000/me',
  clientId: null,
  redirectUri: 'http://localhost:1460/oauth/callback',
  afterLoginUrl: 'http://localhost:1460',
  generateStateToken: function() {
    return Math.random().toString(36).substr(2);
  },
  loggedIn: function() {
    return typeof localStorage.getItem('webkiteAuthToken') === 'string';
  },
  currentUser: function() {
    var userData = localStorage.getItem('webkiteAuthData');
    if (userData) {
      return JSON.parse(userData);
    } else {
      return null;
    }
  },
  login: function() {
    localStorage.setItem('webkiteAuthState', WebkiteAuth.generateStateToken());
    window.location = WebkiteAuth.tokenRequest();
  },
  logout: function() {
    localStorage.removeItem('webkiteAuthToken');
    localStorage.removeItem('webkiteAuthData');
    renderAuthControls();
  },
  tokenRequest: function() {
    return this.tokenURL + '?' + [
        'response_type=token',
        'client_id=' + this.clientId,
        'state=' + localStorage.getItem('webkiteAuthState'),
        'redirect_uri=' + encodeURIComponent(this.redirectUri)
      ].join('&');
  },
  callback: function() {
    var hash = window.location.hash.substr(1).split('&'),
        data = {};
    hash.forEach(function(pair) {
      pair = decodeURIComponent(pair).split('=');
      data[pair[0]] = pair[1];
    });
    if (localStorage.getItem('webkiteAuthState') !== data.state) {
      var p = document.createElement('p');
      p.innerHTML = 'csrf detected';
      document.body.appendChild(p);
      return;
    }
    localStorage.removeItem('webkiteAuthState');
    $.ajax({
      url: WebkiteAuth.userDataURL,
      headers: {
        'X-Webkite-Client-ID': WebkiteAuth.client_id,
        'Accept': 'application/vnd.webkite.auth.v1+json',
        'Authorization': 'Bearer ' + data.access_token
      },
      success: function(userData) {
        localStorage.setItem('webkiteAuthData', JSON.stringify({
          name: userData.name,
          email: userData.email
        }));
        window.location = WebkiteAuth.afterLoginUrl;
      }
    });
    localStorage.setItem('webkiteAuthToken', JSON.stringify({
      token: data.access_token,
      expires: new Date(Date.now() + parseInt(data.expires_in)*1000)
    }));
  }
};

function renderAuthControls() {
  var authControls = document.getElementById('webkite-auth');
  if (!authControls) { return; }
  var currentUser = WebkiteAuth.currentUser();
  if (currentUser) {
    var logout = document.createElement('button');
    logout.innerHTML = 'logout';
    logout.className = 'webkite-logout';
    logout.addEventListener('click', WebkiteAuth.logout);
    authControls.innerHTML = 'logged in as: ' + currentUser.email;
    authControls.appendChild(logout);
  } else {
    var login = document.createElement('button');
    login.innerHTML = 'login';
    login.className = 'webkite-login';
    login.addEventListener('click', WebkiteAuth.login);
    authControls.innerHTML = 'not logged in: ';
    authControls.appendChild(login);
  }
}

renderAuthControls();
