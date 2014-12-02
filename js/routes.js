"use strict";

angular.module('metadataViewerApp', ["ngRoute", "pageslide-directive", "ui.bootstrap"]);

angular.module('metadataViewerApp').config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/main.html',
            controller: 'mainController'
        })
        .otherwise({
            redirectTo: '/'
        });
});