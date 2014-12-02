"use strict";

angular.module('metadataViewerApp', ["ngRoute", "pageslide-directive", "ui.bootstrap"]);

angular.module('metadataViewerApp').config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/main.html',
            controller: 'dplaController'
        })
        .when('/trove', {
            templateUrl: 'partials/trove.html',
            controller: 'troveController'
        })
        .when('/digital_nz', {
            templateUrl: 'partials/digital_nz.html',
            controller: 'digitalNzController'
        })
        .otherwise({
            redirectTo: '/'
        });
});