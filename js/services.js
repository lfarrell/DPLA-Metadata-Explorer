angular.module('metadataViewerApp').service('LoadService', function() {
    this.file_load = function (text_file, $scope) {
        d3.json(text_file, function (error, graph) {
            load(graph);
        });

        function load(graph) {
            // put the data into angular's scope
            $scope.data = graph;
            $scope.loading = false;
            $scope.loaded = true;
            $scope.$apply();
        }
    };
});