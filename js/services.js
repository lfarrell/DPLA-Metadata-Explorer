angular.module('metadataViewerApp').service('LoadService', function() {
    this.file_load = function (text_file, $scope) {
        d3.json(text_file, function (error, graph) {
            load(graph);
        });

        function load(data) {
            var nested = d3.nest()
                .key(function(d) { return d.type; })
                .map(data);

            // put the data into angular's scope
            $scope.data = nested;
            $scope.loading = false;
            $scope.loaded = true;
            $scope.$apply();
        }
    };
});