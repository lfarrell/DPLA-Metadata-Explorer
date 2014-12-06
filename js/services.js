angular.module('metadataViewerApp').service('LoadService', function() {
    this.file_load = function (text_file, $scope) {
        d3.json(text_file, function (error, graph) {
            load(graph);
        });

        function load(data) {
            // put the data into angular's scope
            $scope.data = data;
            $scope.loading = false;
            $scope.loaded = true;
            $scope.$apply();
        }
    };

    this.queryFormat = function(terms) {
        return terms.replace(/\s+/g, '+');
    }
});