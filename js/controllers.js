"use strict";

angular.module('metadataViewerApp').controller('dplaController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'DPLA';

    $scope.apiSearch = function() {
        LoadService.file_load("dpla.php", $scope);
    };
}]);

angular.module('metadataViewerApp').controller('troveController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'Trove';

    $scope.apiSearch = function() {
        LoadService.file_load("trove.php", $scope);
    };
}]);

angular.module('metadataViewerApp').controller('digitalNzController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'Digital NZ';

    $scope.apiSearch = function() {
        LoadService.file_load("digital_nz.php", $scope);
    };
}]);

angular.module('metadataViewerApp').controller('europeanaController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'Europeana';

    $scope.apiSearch = function() {
        LoadService.file_load("europeana.php", $scope);
    };
}]);