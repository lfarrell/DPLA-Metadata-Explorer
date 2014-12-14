// port of http://bl.ocks.org/mbostock/4063269 to angular with some additions
angular.module('metadataViewerApp').directive('bubbleChart', function() {
    function link(scope, element, attrs) {
        var diameter = document.body.clientWidth,
            format = d3.format(",d"),
            color = d3.scale.category10();

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        scope.$watch('data', function(data) {
            if(!data) { return; }

            d3.selectAll("svg").remove();

            var svg = d3.select(element[0]).append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "bubble");

            /**
             * Format for bubble chart
             * @type {{name: string, children: Array}}
             */
            var datas = {name: "root", "children": [] };
            var keys = [];

            data.forEach(function(d) {
                if(_.contains(keys, d.type) === false) {
                    datas.children.push({ "name": d.type, "children": []});
                    keys.push(d.type);
                }

                var i = _.indexOf(keys, d.type);
                datas.children[i].children.push(d);
            });

            var legend = svg.append("g")
                .attr("class", "legend")
                .attr("x", 10)
                .attr("y", 75)
                .attr("height", "auto")
                .attr("width", 295);

            legend.selectAll('g').data(keys)
                .enter()
                .append('g')
                .each(function(d, i) {
                    var g = d3.select(this);
                    g.append("rect")
                        .attr("x", 15)
                        .attr("y", i * 25 + 5)
                        .attr("width", 10)
                        .attr("height", 10)
                        .style("fill", color(d));

                    g.append("text")
                        .attr("x", 35)
                        .attr("y", i * 25 + 15)
                        .attr("height",30)
                        .attr("width",200)
                        .style("fill", "white")
                        .text(d);
                });

            var force = d3.layout.force()
                .charge(-120)
                .friction(0.9)
                .size([diameter, diameter]);

            force.nodes([1,2,3])
                .start();

            console.log(force)

            var bubble = d3.layout.pack()
                .sort(null)
                .size([diameter, diameter])
                .padding(1.5);

            var node = svg.selectAll(".node")
                .data(bubble.nodes(classes(datas))
                .filter(function(d) { return !d.children; }))
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            node.append("title")
                .text(function(d) { return d.term + ": " + format(d.value); });

            node.append("circle")
                .attr("r", function(d) { return d.r; })
                .style("fill", function(d) { return color(d.type); })
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);

                    div.html(format(d.value) + " items for "  + d.term
                            + "<br/>Click to view items")
                        .style("top", (d3.event.pageY-28)+"px")
                        .style("left", (d3.event.pageX-28)+"px");
                })
                .on("mouseout", function() {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .call(force.drag);

            node.append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .text(function(d) { return d.term.substring(0, d.r / 3); });

            force.on("tick", function() {
                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            });
        });

        function classes(root) {
            var classes = [];

            function recurse(name, node) {
                if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
                else classes.push({root: root, term: node.term, value: node.count, type: node.type});
            }

            recurse(null, root);
            return {children: classes};
        }

        function formatCount(number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        d3.select(self.frameElement).style("height", diameter + "px");
    }

    return {
        restrict: 'C',
        link: link
    }
});

/**
 * Port of http://bl.ocks.org/mbostock/7607535 to Angular.js
 */
angular.module('metadataViewerApp').directive('packedbubbleChart', function() {
    function link(scope, element, attrs) {
        var margin = 20,
            diameter = document.body.clientWidth;

        var color = d3.scale.linear()
            .domain([-1, 5])
            .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
            .interpolate(d3.interpolateHcl);

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

            var focus = data,
                nodes = pack.nodes(data),
                view;

            var circle = svg.selectAll("circle")
                .data(nodes)
                .enter().append("circle")
                .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
                .style("fill", function(d) { return d.children ? color(d.depth) : null; })
                .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

            var text = svg.selectAll("text")
                .data(nodes)
                .enter().append("text")
                .attr("class", "label")
                .style("fill-opacity", function(d) { return d.parent === data ? 1 : 0; })
                .style("display", function(d) { return d.parent === data ? null : "none"; })
                .text(function(d) { return d.name; });

            var node = svg.selectAll("circle,text");

            d3.select(element[0])
                .style("background", color(-1))
                .on("click", function() { zoom(data); });

            function zoom(d) {
                var focus0 = focus; focus = d;

                var transition = d3.transition()
                    .duration(d3.event.altKey ? 7500 : 750)
                    .tween("zoom", function(d) {
                        var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                        return function(t) { zoomTo(i(t)); };
                    });

                transition.selectAll("text")
                    .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                    .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
                    .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                    .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
            }

            function zoomTo(v) {
                var k = diameter / v[2]; view = v;
                node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
                circle.attr("r", function(d) { return d.r * k; });
            }
        });

        d3.select(self.frameElement).style("height", diameter + "px");
    }

    return {
        restrict: 'C',
        link: link
    }
});


/* Directive for creating tree maps
* Port of http://mbostock.github.io/d3/talk/20111018/treemap.html to Angular
*/
angular.module('metadataViewerApp').directive('treeMap', ['tipService', 'StatsService', function(tipService, StatsService) {
        function link(scope, element, attrs) {
            var w = document.body.clientWidth - 80,
                h = 900 - 180,
                x = d3.scale.linear().range([0, w]),
                y = d3.scale.linear().range([0, h]),
                color = d3.scale.category10(),
                root,
                node;

            var tip = tipService.tipDiv();

            scope.$watch('data', function(data) {
                if (!data) { return; }

                var datas = {name: "root", "children": [] };
                var keys = [];

                data.forEach(function(d) {
                    if(_.contains(keys, d.type) === false) {
                        datas.children.push({ "name": d.type, "children": []});
                        keys.push(d.type);
                    }

                    var i = _.indexOf(keys, d.type);
                    datas.children[i].children.push(d);
                });

                var svg = d3.select(element[0]).append("div")
                    .attr("class", "chart")
                    .style("width", w + "px")
                    .style("height", h + "px")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h)
                    .append("g")
                    .attr("transform", "translate(.5,.5)");

                node = root = datas;

                var treemap = d3.layout.treemap()
                    .round(false)
                    .size([w, h])
                    .sticky(true)
                    .value(function (d) {
                        return d.count;
                    });

                var nodes = treemap.nodes(root)
                    .filter(function (d) {
                        return !d.children;
                    });

                var cell = svg.selectAll("g")
                    .data(nodes)
                    .enter().append("g")
                    .attr("class", "cell")
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
                    .on("click", function (d) {
                        return zoom(node == d.parent ? root : d.parent);
                    });

                cell.append("rect")
                    .attr("width", function (d) {
                        return d.dx - 1;
                    })
                    .attr("height", function (d) {
                        return d.dy - 1;
                    })
                    .style("fill", function (d) {
                        return color(d.type);
                    })
                    .on("mouseover", function(d) {
                        var text = d.term + '<br/> had ' + StatsService.numFormat(d.count) + ' uses for <br/>' + d.type;
                        tipService.tipShow(tip, text);
                    })
                    .on("mouseout", function(d) {
                        tipService.tipHide(tip);
                    });

                cell.append("foreignObject")
                    .attr("class", 'fobj')
                    .attr("width", function (d) {
                        return d.dx - 2;
                    })
                    .attr("height", function (d) {
                        return d.dy - 2;
                    })
                    .style("font-size", ".8em")
                    .style("pointer-events", "none")
                    .text(function (d) {
                        return d.term;
                    });

                d3.select(window).on("click", function () {
                    zoom(root);
                });

                d3.select("select").on("change", function () {
                    treemap.value(this.value == "size" ? size : count).nodes(root);
                    zoom(node);
                });

                d3.select(element[0]).append("p")
                    .text("Implementation of zoomable treemap by Mike Bostock, http://mbostock.github.io/d3/talk/20111018/treemap.html")
                    .style("color", "gray")
                    .style("font-size", "12px");

                function size(d) {
                    return d.count;
                }

                function count(d) {
                    return 1;
                }

                function zoom(d) {
                    var kx = w / d.dx, ky = h / d.dy;
                    x.domain([d.x, d.x + d.dx]);
                    y.domain([d.y, d.y + d.dy]);

                    var t = svg.selectAll("g.cell").transition()
                        .duration(d3.event.altKey ? 7500 : 750)
                        .attr("transform", function (d) {
                            return "translate(" + x(d.x) + "," + y(d.y) + ")";
                        });

                    t.select("rect")
                        .attr("width", function (d) {
                            return kx * d.dx - 1;
                        })
                        .attr("height", function (d) {
                            return ky * d.dy - 1;
                        });

                    t.select(".fobj") // select foreignObject's class. Webkit browsers will give an empty selection otherwise
                        .attr("width", function (d) {
                            return kx * d.dx - 2;
                        })
                        .attr("height", function (d) {
                            return kx * d.dy - 2;
                        });

                    node = d;
                    d3.event.stopPropagation();
                }
            });
        }
        return {
            restrict: 'C',
            link: link
        }
}]);