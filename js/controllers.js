"use strict";

angular.module('metadataViewerApp').controller('dplaController', ['$scope', 'LoadService', function($scope, LoadService) {
    LoadService.file_load("dpla.php", $scope);
}]);

angular.module('metadataViewerApp').controller('troveController', ['$scope', 'LoadService', function($scope, LoadService) {
    LoadService.file_load("trove.php", $scope);
}]);

angular.module('metadataViewerApp').controller('digitalNzController', ['$scope', 'LoadService', function($scope, LoadService) {
    LoadService.file_load("digital_nz.php", $scope);
}]);