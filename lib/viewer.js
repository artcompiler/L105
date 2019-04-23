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
        return d[1];
      })]);

      g.append("g").attr("class", "axis axis--x").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));

      g.append("g").attr("class", "axis axis--y").call(d3.axisLeft(y).ticks(10, "%")).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "0.71em").attr("text-anchor", "end").text(valName);

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