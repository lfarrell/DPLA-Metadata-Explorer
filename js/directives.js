angular.module('metadataViewerApp').directive('forceTree', ['tipService', 'StatsService', function(tipService, StatsService) {
    function link(scope, element, attrs) {
        var width = document.body.clientWidth - 50,
            color = d3.scale.category10(),
            tip = tipService.tipDiv();

        var provider = function(p) {
            switch (p) {
                case "dpla":
                    return "http://dp.la/search?q=";
                    break;
                case "euro":
                    return "http://www.europeana.eu/portal/search.html?query=";
                    break;
                case "digitalnz":
                    return "http://www.digitalnz.org/records?text=";
                    break;
                case "trove":
                    return "http://trove.nla.gov.au/result?q=";
                    break;
                default:
                    return "http://dp.la/search?q=";
            }
        };

        scope.$watchGroup(['data', 'chart', 'search'], function(values) {
            if(!values[0]) { return; }

            var data = values[0];
            var chart_type = values[1];
            var search = values[2];

            /**
             * Format data
             * @type {{name: string, children: Array}}
             */
            var datas = { name: "root", "children": [] };
            var keys = [];

            data.forEach(function(d) {
                if(_.contains(keys, d.type) === false) {
                    datas.children.push({ "name": d.type, "children": []});
                    keys.push(d.type);
                }

                var i = _.indexOf(keys, d.type);
                datas.children[i].children.push(d);
            });

            keys = keys.sort();

            /**
             * Force it up
             */
            var force = d3.layout.force();

            /**
             * Add the legend
             */
            if(!document.querySelectorAll(".legend").length) {
                var legend = d3.select(element[0])
                    .append("svg")
                    .attr("width", width)
                    .attr("height", 55)
                    .attr("class", "legend")
                    .attr("transform", "translate(" + width/3.5 + ",0)");

                var j = 0;

                legend.selectAll('g').data(keys)
                    .enter()
                    .append('g').attr("width",190)
                    .each(function(d) {
                        var g = d3.select(this);

                        g.append("rect")
                            .attr("x", j)
                            .attr("y", 15)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", color(d));

                        g.append("text")
                            .attr("x", j + 15)
                            .attr("y", 25)
                            .attr("height",30)
                            .attr("width", d.length * 50)
                            .text(d);

                        j += (d.length * 5) + 50;
                    });
            }

            /**
             * Clean up any extraneous svg elements on transition
             */
            d3.selectAll(".graph").remove();
            d3.selectAll("#attribution").remove();

            /**
             * Start the graphing
             */
             if(chart_type === 'tree') {
                treeMap();
             } else if(chart_type === 'cloud') {
                textCloud();
             } else {
                textCloud();
             }

            /**
             * Graph types
             */
            function textCloud() {
                var height = document.body.clientHeight - 25,
                    margin = { 'top': Math.round(data.length / 3.5), bottom: 25, left: 0, right: 25 };

                var zoom = d3.behavior.zoom()
                    .scaleExtent([1, 10])
                    .on("zoom", zooming);

                var drag = d3.behavior.drag()
                    .origin(function(d) { return d; })
                    .on("drag", dragged);

                var data_nodes = { nodes: data };

                var scale = d3.scale.linear()
                    .domain(d3.extent(
                        data_nodes.nodes, function(d) { return d.count; })
                    )
                    .range([5, 30]);

                force.nodes(data_nodes.nodes)
                    .size([width, height + 175])
                    .charge(function(d) {
                        var charging = -scale(d.term.length) + scale(d.count) * 10;

                        if(scope.provider === 'digitalnz') return -40; // Doesn't return many items, so this.

                        if(charging > -100)  {
                            return -25;
                        } else if(charging > -300) {
                            return -8;
                        }
                        return -charging * 2;
                    })
                    .start();

                var svg = d3.select(element[0]).append("svg")
                    .call(zoom)
                    .attr("width", width)
                    .attr("height", 900)
                    .attr("class", "graph")
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var rect = svg.append("rect")
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "none")
                    .style("pointer-events", "all");

                var nodes = svg.append("g")
                    .selectAll("text")
                    .data(data_nodes.nodes)
                    .enter();

                var texts = nodes.append("text")
                    .style("fill", function(d) {
                        return color(d.type);
                    })
                    .style("font-size", function(d) { return scale(d.count) + "px"; })
                    .style("text-anchor", "middle")
                    .text(function(d) { return d.term; })
                    .on("mouseover", function(d) {
                        var text = d.term + '<br/> had ' + StatsService.numFormat(d.count) + ' uses for <br/>' + d.type;
                        tipService.tipShow(tip, text);
                    })
                    .on("mouseout", function(d) {
                        tipService.tipHide(tip);
                    })
                    .on("click", function(d) {
                        window.open(provider(scope.provider) + '"' + search + '"' + '+' + d.term);
                    })
                    .call(drag);

                force.on("tick", function() {
                    texts.attr("dx", function(d) { return d.x; })
                        .attr("dy", function(d) { return d.y; })
                });

                function zooming() {
                    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                }

                function dragged(d) {
                    d3.event.sourceEvent.stopPropagation();
                    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
                }
            }

            function treeMap() {
                var height = 900 - 180,
                    x = d3.scale.linear().range([0, width]),
                    y = d3.scale.linear().range([0, height]),
                    root,
                    node;

                var svg = d3.select(element[0])
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "graph")
                    .append("g")
                    .attr("transform", "translate(.5,.5)");

                node = root = datas;

                var treemap = d3.layout.treemap()
                    .round(false)
                    .size([width, height])
                    .sticky(true)
                    .value(function (d) {
                        return d.count;
                    });

                var nodes = treemap.nodes(root)
                    .filter(function (d) {
                        return !d.children;
                    });

                var cell = svg.selectAll("g")
                    .data(nodes);

                cell.enter().append("g")
                    .attr("class", "cell")
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
                    .on("dblclick", function (d) {
                        return zoom(node == d.parent ? root : d.parent);
                    })
                    .on("click", function (d) {
                        window.open(provider(scope.provider) + '"' + search + '"' + '+' + d.term);
                    });

                cell.append("rect")
                    .attr("class", "mapped")
                    .attr("width", function (d) {
                        var w = d.dx - 1;
                        if(w > 0) {
                            return w;
                        }

                        return 0
                    })
                    .attr("height", function (d) {
                        var h = d.dy - 2;
                        if(h > 0) {
                            return h;
                        }

                        return 0
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
                        var w = d.dx - 2;
                        if(w > 0) {
                            return w;
                        }

                        return 0;
                    })
                    .attr("height", function (d) {
                        var h = d.dy - 2;
                        if(h > 0) {
                            return h;
                        }

                        return 0
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
                    .attr("id", "attribution")
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
                    var kx = width / d.dx, ky = height / d.dy;
                    x.domain([d.x, d.x + d.dx]);
                    y.domain([d.y, d.y + d.dy]);

                    var t = svg.selectAll("g.cell").transition()
                        .duration(d3.event.altKey ? 7500 : 750)
                        .attr("transform", function (d) {
                            return "translate(" + x(d.x) + "," + y(d.y) + ")";
                        });

                    t.select("rect")
                        .attr("width", function (d) {
                            var w = kx * d.dx - 1;
                            if(w > 0) {
                                return w;
                            }

                            return 0;
                        })
                        .attr("height", function (d) {
                            var w = kx * d.dy - 1;
                            if(w > 0) {
                                return w;
                            }

                            return 0;
                        });

                    t.select(".fobj") // select foreignObject's class. Webkit browsers will give an empty selection otherwise
                        .attr("width", function (d) {
                            var w = kx * d.dx - 2;
                            if(w > 0) {
                                return w;
                            }

                            return 0;
                        })
                        .attr("height", function (d) {
                            var h = kx * d.dy - 2;
                            if(h > 0) {
                                return h;
                            }

                            return 0;
                        });

                    node = d;
                    d3.event.stopPropagation();
                }
            }
        });
    }

    return {
        restrict: 'C',
        scope: {
            'provider': '@',
            'data': '=',
            'chart': '=',
            'search': '='
        },
        link: link
    }

}]);

angular.module('metadataViewerApp').directive('forceChart', ['tipService', 'StatsService', function(tipService, StatsService) {
    function link(scope, element, attrs) {
        var width = document.body.clientWidth - 50,
            height = document.body.clientHeight - 50,
            color = d3.scale.category10(),
            tip = tipService.tipDiv(),
            margin = { 'top':250, bottom: 25, left: 0, right: 25 };

        var provider = function(p) {
            switch (p) {
                case "dpla":
                    return "http://dp.la/search?q=";
                    break;
                case "euro":
                    return "http://www.europeana.eu/portal/search.html?query=";
                    break;
                case "digitalnz":
                    return "http://www.digitalnz.org/records?text=";
                    break;
                case "trove":
                    return "http://trove.nla.gov.au/result?q=";
                    break;
                default:
                    return "http://dp.la/search?q=";
            }
        };

        scope.$watch('data', function(data) {
            if(!data) { return; }

            var keys = [];

            data.forEach(function(d) {
                if(_.contains(keys, d.type) === false) {
                    keys.push(d.type);
                }
            });

            keys = keys.sort();

            var legend = d3.select(element[0])
                .append("svg")
                .attr("width", width)
                .attr("height", 55)
                .attr("transform", "translate(" + width/3.5 + ",0)");

            var j = 0;

            legend.selectAll('g').data(keys)
                .enter()
                .append('g').attr("width",190)
                .each(function(d) {
                    var g = d3.select(this);

                    g.append("rect")
                        .attr("x", j)
                        .attr("y", 15)
                        .attr("width", 10)
                        .attr("height", 10)
                        .style("fill", color(d));

                    g.append("text")
                        .attr("x", j + 15)
                        .attr("y", 25)
                        .attr("height",30)
                        .attr("width", d.length * 50)
                        .text(d);

                    j += (d.length * 5) + 50;
                });

            var zoom = d3.behavior.zoom()
                .scaleExtent([1, 10])
                .on("zoom", zooming);

            var drag = d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("drag", dragged);

            var data_nodes = { nodes: data };

            var scale = d3.scale.linear()
                .domain(d3.extent(
                    data_nodes.nodes, function(d) { return d.count; })
                )
                .range([5, 30]);

            var force = d3.layout.force()
                .nodes(data_nodes.nodes)
                .size([width, height + 175])
                .charge(function(d) {
                    var charging = -scale(d.term.length) + scale(d.count) * 10;

                    if(charging > -100)  {
                        return -25;
                    } else if(charging > -300) {
                        return -8;
                    }
                        return -charging * 2;

                })
                .start();

            var svg = d3.select(element[0]).append("svg")
                 .call(zoom)
                .attr("width", width)
                .attr("height", 900)
                .attr("class", "force")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var rect = svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all");

            var nodes = svg.append("g")
                .selectAll("text")
                .data(data_nodes.nodes)
                .enter();

            var texts = nodes.append("text")
                .style("fill", function(d) {
                    return color(d.type);
                })
                .style("font-size", function(d) { return scale(d.count) + "px"; })
                .style("text-anchor", "middle")
                .text(function(d) { return d.term; })
                .on("mouseover", function(d) {
                    var text = d.term + '<br/> had ' + StatsService.numFormat(d.count) + ' uses for <br/>' + d.type;
                    tipService.tipShow(tip, text);
                })
                .on("mouseout", function(d) {
                    tipService.tipHide(tip);
                })
                .on("click", function(d) {
                    window.open(provider(scope.provider) + '"' + d.term + '"');
                })
                .call(drag);

            force.on("tick", function() {
                texts.attr("dx", function(d) { return d.x; })
                    .attr("dy", function(d) { return d.y; })
            });

            function zooming() {
                svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            }

            function dragged(d) {
                d3.event.sourceEvent.stopPropagation();
                d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
            }
        });
    }

    return {
        restrict: 'C',
        scope: {
            'provider': '@',
            'data': '='
        },
        link: link
    }
}]);

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

            scope.$watch('data', function(data) {
                if (!data) { return; }

                if(data.length) {
                        var tip = tipService.tipDiv();
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

                        keys = keys.sort();

                        var legend = d3.select(element[0])
                            .append("svg")
                            .attr("width", w)
                            .attr("height", 55);
                        var j = 0;

                        legend.selectAll('g').data(keys)
                            .enter()
                            .append('g').attr("width",190)
                            .each(function(d, i) {
                                var g = d3.select(this);

                                g.append("rect")
                                    .attr("x", j)
                                    .attr("y", 15)
                                    .attr("width", 10)
                                    .attr("height", 10)
                                    .style("fill", color(d));

                                g.append("text")
                                    .attr("x", j + 15)
                                    .attr("y", 25)
                                    .attr("height",30)
                                    .attr("width", d.length * 50)
                                    .style("fill", "white")
                                    .text(d);

                                j += (d.length * 5) + 50;
                            });

                        var svg = d3.select(element[0])
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
                            .data(nodes);

                        cell.enter().append("g")
                            .attr("class", "cell")
                            .attr("transform", function (d) {
                                return "translate(" + d.x + "," + d.y + ")";
                            })
                            .on("dblclick", function (d) {
                                return zoom(node == d.parent ? root : d.parent);
                            });

                        cell.append("rect")
                            .attr("width", function (d) {
                                return d.dx - 1 > 0 ? d.dx - 1 : 0;
                            })
                            .attr("height", function (d) {
                                return d.dy - 1 > 0 ? d.dy - 1  : 0;
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

                                return d.dx - 2 > 0 ? d.dx - 2  : 0;
                            })
                            .attr("height", function (d) {
                                return d.dy - 2 > 0 ? d.dy - 2  : 0;
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
                            .attr("id", "attribution")
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
                } else {
                    d3.append("p").text("Nothing Found")
                }
            });
        }

        return {
            restrict: 'C',
            link: link
        }
}]);