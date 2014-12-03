angular.module('metadataViewerApp').directive('bubbleChart', function() {
    function link(scope, element, attrs) {
        var margin = 20,
            diameter = document.body.clientWidth;

        var pack = d3.layout.pack()
            .padding(2)
            .size([diameter - margin, diameter - margin])
            .value(function(d) { return d.size; });

        var svg = d3.select(element[0]).append("svg")
            .attr("width", diameter)
            .attr("height", document.body.clientHeight)
            .append("g")
            .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

        scope.$watch('data', function(data) {
            if (!data) { return; }
        });
    }

    return {
        restrict: 'C',
        link: link
    }
});