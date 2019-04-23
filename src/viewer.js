/* Copyright (c) 2017, Art Compiler LLC */
/* @flow */
import {
  assert,
  message,
  messages,
  reserveCodeRange,
  decodeID,
  encodeID,
} from "./share.js";
import * as React from "react";
import * as d3 from "d3";
window.gcexports.viewer = (function () {
  function capture(el) {
    return null;
  }
  function render(nodes, props) {
    let elts = [];
    if (!(nodes instanceof Array)) {
      // HACK not all arguments are arrays. Not sure they should be.
      nodes = [nodes];
    }
    nodes.forEach(function (n, i) {
      let args = [];
      if (n.args) {
        args = render(n.args, props);
      }
      switch (n.type) {
      case "bar-chart":
        elts.push(
          <BarChart key={i} style={n.style} {...n}/>
        );
        break;
      case "str":
        elts.push(<span className="u-full-width" key={i} style={n.style}>{""+n.value}</span>);
        break;
      default:
        break;
      }
    });
    return elts;
  }
  var BarChart = React.createClass({
    componentDidMount() {
      this.componentDidUpdate();
    },
    componentDidUpdate() {
      let data = this.props.data;
      let lblName = data[0][0];
      let valName = data[0][1];
      data.shift();
      d3.select("svg.bar-chart").html("<g/>");
      var svg = d3.select("svg.bar-chart"),
          margin = {top: 20, right: 20, bottom: 30, left: 40},
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom;

      var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

      var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(data.map(function(d) {
        return d[0];
      }));
      y.domain([0, d3.max(data, function(d) {
        return d[1];
      })]);

      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "%"))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill", "#000")
        .text(valName);

      g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d[0]); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d[1]); });
    },
    render () {
      return (
        <svg className="bar-chart" width="960" height="500"/>
      );
    },
  });
  var Viewer = React.createClass({
    render () {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      let props = this.props;
      var data = props.obj ? [].concat(props.obj) : [];
      var elts = render(data, props);
      return (
        <div>
          <div className="L105">
            {elts}
          </div>
        </div>
      );
    },
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
})();
