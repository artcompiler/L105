"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* Copyright (c) 2017, Art Compiler LLC */


var _share = require("./share.js");

var _react = require("react");

var React = _interopRequireWildcard(_react);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

window.gcexports.viewer = function () {
  function capture(el) {
    return null;
  }
  function _render(nodes, props) {
    var elts = [];
    if (!(nodes instanceof Array)) {
      // HACK not all arguments are arrays. Not sure they should be.
      nodes = [nodes];
    }
    nodes.forEach(function (n, i) {
      var args = [];
      if (n.args) {
        args = _render(n.args, props);
      }
      switch (n.type) {
        case "bar-chart":
          elts.push(React.createElement(BarChart, _extends({ key: i, style: n.style }, n)));
          break;
        case "radar-chart":
          elts.push(React.createElement(RadarChart, _extends({ key: i, style: n.style }, n)));
          break;
        case "str":
          elts.push(React.createElement(
            "span",
            { className: "u-full-width", key: i, style: n.style },
            "" + n.value
          ));
          break;
        default:
          break;
      }
    });
    return elts;
  }
  var BarChart = React.createClass({
    displayName: "BarChart",
    componentDidMount: function componentDidMount() {
      this.componentDidUpdate();
    },
    componentDidUpdate: function componentDidUpdate() {
      var data = this.props.data;
      if (!data) {
        return;
      }
      var lblName = data[0][0];
      var valName = data[0][1];
      data.shift();
      d3.select("svg.bar-chart").html("<g/>");
      var svg = d3.select("svg.bar-chart"),
          margin = { top: 20, right: 20, bottom: 30, left: 40 },
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom;

      var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
          y = d3.scaleLinear().rangeRound([height, 0]);

      var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(data.map(function (d) {
        return d[0];
      }));
      y.domain([0, d3.max(data, function (d) {
        return +d[1];
      })]);

      g.append("g").attr("class", "axis axis--x").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x)).append("text").attr("x", width / 2).attr("y", 25).attr("fill", "#000").attr("text-anchor", "end").text(lblName);

      g.append("g").attr("class", "axis axis--y")
      //        .call(d3.axisLeft(y).ticks(10, "%"))
      .call(d3.axisLeft(y).ticks(10)).append("text").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -35).attr("dy", "0.71em").attr("text-anchor", "start").attr("fill", "#000").text(valName);

      g.selectAll(".bar").data(data).enter().append("rect").attr("class", "bar").attr("x", function (d) {
        return x(d[0]);
      }).attr("y", function (d) {
        return y(d[1]);
      }).attr("width", x.bandwidth()).attr("height", function (d) {
        return height - y(d[1]);
      });
    },
    render: function render() {
      return React.createElement("svg", { className: "bar-chart", width: "960", height: "500" });
    }
  });

  //Practically all this code comes from https://github.com/alangrafu/radar-chart-d3
  //I only made some additions and aesthetic adjustments to make the chart look better
  //(of course, that is only my point of view)
  //Such as a better placement of the titles at each line end,
  //adding numbers that reflect what each circular level stands for
  //Not placing the last level and slight differences in color
  //
  //For a bit of extra information check the blog about it:
  //http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html

  var RadarChart = React.createClass({
    displayName: "RadarChart",
    draw: function draw(id, d, options) {
      var cfg = {
        radius: 1,
        w: 600,
        h: 600,
        factor: 1,
        factorLegend: .85,
        levels: 3,
        maxValue: 0,
        radians: 2 * Math.PI,
        opacityArea: 0.5,
        ToRight: 5,
        TranslateX: 80,
        TranslateY: 30,
        ExtraWidthX: 100,
        ExtraWidthY: 100,
        color: d3.scaleOrdinal(d3.schemeCategory10)
      };

      if ('undefined' !== typeof options) {
        for (var i in options) {
          if ('undefined' !== typeof options[i]) {
            cfg[i] = options[i];
          }
        }
      }
      cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function (i) {
        return d3.max(i.map(function (o) {
          return o.value;
        }));
      }));
      var allAxis = d[0].map(function (i, j) {
        return i.axis;
      });
      var total = allAxis.length;
      var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
      var Format = d3.format('%');
      d3.select(id).select("svg").remove();

      var g = d3.select(id).append("svg").attr("width", cfg.w + cfg.ExtraWidthX).attr("height", cfg.h + cfg.ExtraWidthY).append("g").attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
      ;

      var tooltip;

      //Circular segments
      for (var j = 0; j < cfg.levels - 1; j++) {
        var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
        g.selectAll(".levels").data(allAxis).enter().append("svg:line").attr("x1", function (d, i) {
          return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
        }).attr("y1", function (d, i) {
          return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
        }).attr("x2", function (d, i) {
          return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
        }).attr("y2", function (d, i) {
          return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
        }).attr("class", "line").style("stroke", "grey").style("stroke-opacity", "0.75").style("stroke-width", "0.3px").attr("transform", "translate(" + (cfg.w / 2 - levelFactor) + ", " + (cfg.h / 2 - levelFactor) + ")");
      }

      //Text indicating at what % each level is
      for (var j = 0; j < cfg.levels; j++) {
        var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
        g.selectAll(".levels").data([1]) //dummy data
        .enter().append("svg:text").attr("x", function (d) {
          return levelFactor * (1 - cfg.factor * Math.sin(0));
        }).attr("y", function (d) {
          return levelFactor * (1 - cfg.factor * Math.cos(0));
        }).attr("class", "legend").style("font-family", "sans-serif").style("font-size", "10px").attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")").attr("fill", "#737373").text(Format((j + 1) * cfg.maxValue / cfg.levels));
      }

      var series = 0;

      var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");

      axis.append("line").attr("x1", cfg.w / 2).attr("y1", cfg.h / 2).attr("x2", function (d, i) {
        return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
      }).attr("y2", function (d, i) {
        return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
      }).attr("class", "line").style("stroke", "grey").style("stroke-width", "1px");

      axis.append("text").attr("class", "legend").text(function (d) {
        return d;
      }).style("font-family", "sans-serif").style("font-size", "11px").attr("text-anchor", "middle").attr("dy", "1.5em").attr("transform", function (d, i) {
        return "translate(0, -10)";
      }).attr("x", function (d, i) {
        return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total);
      }).attr("y", function (d, i) {
        return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total);
      });

      var dataValues = void 0;
      d.forEach(function (y, x) {
        dataValues = [];
        g.selectAll(".nodes").data(y, function (j, i) {
          dataValues.push([cfg.w / 2 * (1 - parseFloat(Math.max(j.value, 0)) / cfg.maxValue * cfg.factor * Math.sin(i * cfg.radians / total)), cfg.h / 2 * (1 - parseFloat(Math.max(j.value, 0)) / cfg.maxValue * cfg.factor * Math.cos(i * cfg.radians / total))]);
        });
        dataValues.push(dataValues[0]);
        g.selectAll(".area").data([dataValues]).enter().append("polygon").attr("class", "radar-chart-serie" + series).style("stroke-width", "2px").style("stroke", cfg.color(series)).attr("points", function (d) {
          var str = "";
          for (var pti = 0; pti < d.length; pti++) {
            str = str + d[pti][0] + "," + d[pti][1] + " ";
          }
          return str;
        }).style("fill", function (j, i) {
          return cfg.color(series);
        }).style("fill-opacity", cfg.opacityArea).on('mouseover', function (d) {
          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
          g.selectAll(z).transition(200).style("fill-opacity", .7);
        }).on('mouseout', function () {
          g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
        });
        series++;
      });
      series = 0;

      d.forEach(function (y, x) {
        g.selectAll(".nodes").data(y).enter().append("svg:circle").attr("class", "radar-chart-serie" + series).attr('r', cfg.radius).attr("alt", function (j) {
          return Math.max(j.value, 0);
        }).attr("cx", function (j, i) {
          dataValues.push([cfg.w / 2 * (1 - parseFloat(Math.max(j.value, 0)) / cfg.maxValue * cfg.factor * Math.sin(i * cfg.radians / total)), cfg.h / 2 * (1 - parseFloat(Math.max(j.value, 0)) / cfg.maxValue * cfg.factor * Math.cos(i * cfg.radians / total))]);
          return cfg.w / 2 * (1 - Math.max(j.value, 0) / cfg.maxValue * cfg.factor * Math.sin(i * cfg.radians / total));
        }).attr("cy", function (j, i) {
          return cfg.h / 2 * (1 - Math.max(j.value, 0) / cfg.maxValue * cfg.factor * Math.cos(i * cfg.radians / total));
        }).attr("data-id", function (j) {
          return j.axis;
        }).style("fill", cfg.color(series)).style("fill-opacity", .9).on('mouseover', function (d) {
          newX = parseFloat(d3.select(this).attr('cx')) - 10;
          newY = parseFloat(d3.select(this).attr('cy')) - 5;
          tooltip.attr('x', newX).attr('y', newY).text(Format(d.value)).transition(200).style('opacity', 1);

          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
          g.selectAll(z).transition(200).style("fill-opacity", .7);
        }).on('mouseout', function () {
          tooltip.transition(200).style('opacity', 0);
          g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
        }).append("svg:title").text(function (j) {
          return Math.max(j.value, 0);
        });

        series++;
      });
      //Tooltip
      tooltip = g.append('text').style('opacity', 0).style('font-family', 'sans-serif').style('font-size', '13px');
    },
    componentDidMount: function componentDidMount() {
      this.componentDidUpdate();
    },
    componentDidUpdate: function componentDidUpdate() {
      var data = this.props.data;
      if (!data) {
        return;
      }
      var w = 400,
          h = 400;

      var colorscale = d3.scaleOrdinal(d3.schemeCategory10);

      //Legend titles
      var LegendOptions = ['Smartphone', 'Tablet'];

      //Options for the Radar chart, other than default
      var mycfg = {
        w: w,
        h: h,
        maxValue: 0.6,
        levels: 0,
        ExtraWidthX: 300

        //Call function to draw the Radar chart
        //Will expect that data is in %'s
      };this.draw("#radar-chart", data, mycfg);

      ////////////////////////////////////////////
      /////////// Initiate legend ////////////////
      ////////////////////////////////////////////

      var svg = d3.select('#graff-view').selectAll('svg').append('svg').attr("width", w + 300).attr("height", h);

      //Create the title for the legend
      var text = svg.append("text").attr("class", "title").attr('transform', 'translate(90,0)').attr("x", w - 70).attr("y", 10).attr("font-size", "12px").attr("fill", "#404040").text("What % of owners use a specific service in a week");

      //Initiate Legend
      var legend = svg.append("g").attr("class", "legend").attr("height", 100).attr("width", 200).attr('transform', 'translate(90,20)');
      //Create colour squares
      legend.selectAll('rect').data(LegendOptions).enter().append("rect").attr("x", w - 65).attr("y", function (d, i) {
        return i * 20;
      }).attr("width", 10).attr("height", 10).style("fill", function (d, i) {
        return colorscale(i);
      });
      //Create text next to squares
      legend.selectAll('text').data(LegendOptions).enter().append("text").attr("x", w - 52).attr("y", function (d, i) {
        return i * 20 + 9;
      }).attr("font-size", "11px").attr("fill", "#737373").text(function (d) {
        return d;
      });
    },
    render: function render() {
      return React.createElement("svg", { id: "radar-chart", className: "radar-chart", width: "960", height: "500" });
    }
  });
  var Viewer = React.createClass({
    displayName: "Viewer",
    render: function render() {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      var props = this.props;
      var data = props.obj ? [].concat(props.obj) : [];
      var elts = _render(data, props);
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "L105" },
          elts
        )
      );
    }
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
}();