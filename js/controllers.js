"use strict";

angular.module('metadataViewerApp').controller('metadataViewerController', ['$scope', 'LoadService', function($scope, LoadService) {
    LoadService.file_load("process.php", $scope);
}]);