"use strict";

angular.module('metadataViewerApp').controller('dplaController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'DPLA';
    LoadService.file_load("dpla.php", $scope);
}]);

angular.module('metadataViewerApp').controller('troveController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'Trove';
    LoadService.file_load("trove.php", $scope);
}]);

angular.module('metadataViewerApp').controller('digitalNzController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'Digital NZ';
    LoadService.file_load("digital_nz.php", $scope);
}]);