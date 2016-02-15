angular.module('starter.services', [])

.factory('Posts', function($riffle, $rootScope) {

  var api = {};

  //listen live for status updates
  $rootScope.$on('$riffle.open', function(){
    $riffle.subscribe("statusUpdate", update);
  });

  function update(email){
    var following = $riffle.User.privateStorage.following || [];
    if(following.includes(email)){
      api.load();
    }
  }

  //API Methods and vars
  api.users = [];
  api.myFeed = [];

  api.load = function(){
    $riffle.User.getPublicData().then(loadData);

    function loadData(posts){
      api.users = [];
      api.myFeed = [];
      posts.forEach(filter);
      $rootScope.$broadcast('scroll.refreshComplete');
    }

    function filter(post){
      var following = $riffle.User.privateStorage.following || [];
      if(post.email === $riffle.User.email){
        return;
      }else if(following.includes(post.email)){
        api.myFeed.push(post);
      }else{
        api.users.push(post);
      }
    }
  };

  api.follow = function(email){
    $riffle.User.privateStorage.following = $riffle.User.privateStorage.following || [];
    $riffle.User.privateStorage.following.push(email);
    $riffle.User.save().then(api.load);
  };

  api.post = function(status){
    $riffle.User.publicStorage.email = $riffle.User.email;
    $riffle.User.publicStorage.name = $riffle.User.name;
    $riffle.User.publicStorage.status = status.body;
    $riffle.User.publicStorage.statusPhotoUrl = status.photoUrl || null;
    return $riffle.User.save();
  };

  api.unfollow = function(email){
    var index = $riffle.user.privateStorage.following.indexOf(email);
    if(index > -1){
      $riffle.user.privateStorage.following.splice(index, 1);
      $riffle.user.save().then(api.load);
    }
  };

  return api;
});
