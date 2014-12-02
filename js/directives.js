angular.module('metadataViewerApp').directive('bubbleChart', function() {
    function link(scope, element, attrs) {
        scope.$watch('data', function(data) {
            if (!data) { return; }
        });
    }

    return {
        restrict: 'C',
        link: link
    }
});