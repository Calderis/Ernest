angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('PhotoCtrl', function($scope, $ionicPopup, $http, $stateParams, $ionicLoading, Camera) {
  // Setting some vars
  $scope.collectionToken = '8266330049f64618';
  $scope.pictureBlob = null;

  // Alert dialog
  $scope.showAlert = function( message, title ) {
    if (title === null) {
      title = 'Information';
    }

    var alertPopup = $ionicPopup.alert({
      title: title,
      template: message
    });
  };
  

  $scope.getPhoto = function() {
    Camera.getPicture({
      quality: 75,
      targetWidth: 320,
      targetHeight: 240,
      sourceType: navigator.camera.PictureSourceType.CAMERA,
      encodingType: navigator.camera.EncodingType.JPEG,
      correctOrientation: true,
      destinationType: 0
    }).then(function(imageData) {
      $ionicLoading.show({
        'template': "Chargement..."
      });
      $scope.pictureBlob = dataURItoBlob("data:image/jpeg;base64," + imageData);

      // Send the picture to image recognition
      $scope.checkPictureWithCollection();
    }, function(err) {
      console.err(err);
    });
  };


  function dataURItoBlob( dataURI ) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++)
    {
      ia[i] = byteString.charCodeAt(i);
    }

    var bb = new Blob([ab], { "type": mimeString });
    return bb;
  }


  $scope.checkPictureWithCollection = function() {
    // Start the request to check if image is a "chef-d'oeuvre" or not...
    var form = new FormData();
    form.append("token", $scope.collectionToken);
    form.append("image", $scope.pictureBlob);

    var settings = {
      async: true,
      url: "https://search.craftar.net/v1/search",
      method: "POST",
      processData: false,
      contentType: false,
      mimeType: "multipart/form-data",
      crossDomain: true,
      data: form
    };

    $(function() {
      $.ajax(settings)
      .done(function(res) {
        $ionicLoading.hide();
        var response = $.parseJSON(res);
        $scope.showAlert(JSON.stringify(response)); 
        if (response.results.length == 0) {
          $scope.showAlert("Cette oeuvre n'est malheureusement pas un chef d'oeuvre", "Désolé");
        }
      });
    });
  };

});
