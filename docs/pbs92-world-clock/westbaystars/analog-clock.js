/*
   This module is based on the wonderful tutorial by Eric S. Bullington at
   https://www.ericbullington.com/blog/2012/10/27/d3-oclock/
*/

function AnalogClock() {
  const π = Math.PI;     // Convience variable for PI
  
  // Functions for scaling clock hands
  var scaleSecs = d3.scaleLinear().domain([0, 59 + 999/1000]).range([0, 2 * π]);
  var scaleMins = d3.scaleLinear().domain([0, 59 + 59/60]).range([0, 2 * π]);
  var scaleHours = d3.scaleLinear().domain([0, 11 + 59/60]).range([0, 2 * π]);
  var labelScale = d3.scaleLinear().domain([0,60,5]).range([0, 360]);
  
  var _width = 200;    // Width (and height) for insernal use within the SVG canvas
  
  create = function(parent, data) {
    var svg = parent.append('div').append("svg")
      .attr("viewBox", "0 0 "+_width+" "+_width) // Inernal coordinate system
      .attr("class", "analog-clock")
      .attr("arai-disabled", "true");
  
    // Group to hold the clock face
    var clockGroup = svg.append("g")
      .attr("class", "clock-group")
      .attr("transform", "translate("+_width/2+" "+_width/2+")");
  
    // Outer circle
    clockGroup.append("circle")
      .attr("r", 95).attr("fill", "none")
      .attr("class", "clock outercircle")
      .attr("stroke", "black")
      .attr("stroke-width", 2);
  
    // Hour labels
    for (var hour = 1; hour <= 12; ++hour) {
      clockGroup.append("g")
        .attr("transform", "rotate(" + (hour % 12 * 30) + ")")
        .append("text")
          .text(String.fromCodePoint(8544 + hour -1))  // UTF-8 8544 is Roman Number 1
          .attr("text-anchor", "middle")
          .attr("font-family", "serif")
          .attr("font-size", 14)
          .attr("x", 0)
          .attr("y", 6)
          .attr("dy", -85)
          .attr("fill", "black")
          .attr("transform", "rotate("+ -(hour % 12 * 30) + ",0,-85)");
    }
  
    // Central circle
    clockGroup.append("circle")
      .attr("r", 4)
      .attr("fill", "black")
      .attr("class", "clock innercircle");
  
    parent.call(aClockDrawHands);
  }
  
  update = function(parent) {
    parent.call(aClockDrawHands);
  }

  /* Analog clock constructor
       @parent - A D3 selection
       @data - An array of {unit: "...", number: ###} pairs for hours, minutes, and optionally seconds
       @width - The physical screen width for the analog clock
  */
  // Draw hands of an analog clock
  //   @clock is the component that contains a data structure with a time property
  //     which is an array of three units (hours, minutes, seconds) with assoiated
  //     numbers. Will not display any hands that are not included.
  aClockDrawHands = function(containers) {
    containers.each((data, i, clocks) => {
      var group = d3.select(clocks[i]).selectAll("svg.analog-clock g.clock-group");
      
      // Clear drawHands
      group.selectAll(".clock-hand").remove();
  
      secondArc = d3.arc()
        .innerRadius(0)
        .outerRadius(70)
        .startAngle(d => scaleSecs(d.number))
        .endAngle(d => scaleSecs(d.number));
  
      minuteArc = d3.arc()
        .innerRadius(0)
        .outerRadius(70)
        .startAngle(d => scaleMins(d.number))
        .endAngle(d => scaleMins(d.number));
  
      hourArc = d3.arc()
        .innerRadius(0)
        .outerRadius(50)
        .startAngle(d => scaleHours(d.number % 12))
        .endAngle(d => scaleHours(d.number % 12));
  
      group.selectAll(".clock-hand")
        .data(data.time)
        .enter()
        .append("path")
        .attr("d", d => {
          if (d.units === "seconds") {
            return secondArc(d);
          } else if (d.units === "minutes") {
            return minuteArc(d);
          } else if (d.units === "hours") {
            return hourArc(d);
          }
        })
        .attr("class", "clock-hand")
        .attr("stroke", d => (d.units === "seconds")? "red":"black")
        .attr("stroke-width", d => {
          if (d.units === "seconds") {
            return 2;
          } else if (d.units === "minutes") {
            return 3;
          } else if (d.units === "hours") {
            return 3;
          }
        })
        .attr("fill", "none");
    });
  }
  
  return {
    create: create,
    update: update
  }
}

const analogClock = AnalogClock();
