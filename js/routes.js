"use strict";

angular.module('metadataViewerApp', ["ngRoute", "pageslide-directive", "ui.bootstrap"]);

angular.module('metadataViewerApp').config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/main.html',
            controller: 'mainController'
        })
        .when('/dpla', {
            templateUrl: 'partials/dpla.html',
            controller: 'dplaController'
        })
        .when('/digital_nz', {
            templateUrl: 'partials/digital_nz.html',
            controller: 'digitalNzController'
        })
        .when('/europeana', {
            templateUrl: 'partials/europeana.html',
            controller: 'europeanaController'
        })
        .when('/trove', {
            templateUrl: 'partials/trove.html',
            controller: 'troveController'
        })
        .when('/harvard', {
            templateUrl: 'partials/harvard.html',
            controller: 'harvardController'
        })
        .otherwise({
            redirectTo: '/'
        });
});