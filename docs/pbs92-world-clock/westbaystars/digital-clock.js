/*
   The digital clock SVG parts are from:
   https://commons.wikimedia.org/wiki/Category:SVG_Digital_clocks
*/

function DigitalClock() {
  var _width = 250;   // 30 x 6 digits + 15 x 2 colons + 30 x 1 AM/PM indicator
  var _height = 50;
  
  enterDigits = function(groups) {
    var digitGroups = groups.enter().append("g")
      .attr("fill","#d00")
      .attr("stroke","#fff")
      .attr("stroke-width","2")
      .attr("value", d => d.digit)
      .attr("x-offset", d => d.x)
      .classed("digit", true);
    
    // Because the digits are drawn as a set of functions rather than a single append,
    // we have to kind of bruite force the initial drawing of the digits by getting the
    // nodes, converting them back to a D3 selection, and using the data from there.
    digitGroups.each((d,i,g) => {
      var group = d3.select(g[i]);
      var ledIndex = d.digit.charCodeAt(0) - 48 // ASCII of "0" is dec 48; {:;<} follow after "9"
      group.classed('pulsable',ledIndex === 10)         // Reset if pulsible only for :
      DIGITS[ledIndex](group, d.x, 0);                  // Call LED digit drawing function for current datum index
    });
  }
  
  // Update all of the digits (passed in the "update" parameter)
  updateDigits = function(update) {
    // Because the digits are drawn as a set of functions rather than a single append,
    // we have to kind of bruite force the initial drawing of the digits by getting the
    // nodes, converting them back to a D3 selection, and using the data from there.
    update.nodes().forEach(g => {
      var g = d3.select(g);
      var digit = g.datum().digit;
      var ledIndex = digit.charCodeAt(0) - 48 // ASCII of "0" is dec 48; {:;<} follow after "9"
      var offsetX = g.datum().x;
      if (digit !== g.attr('value') || offsetX !== Number(g.attr('x-offset'))) {
        g.attr('value',digit)
         .attr('x-offset',offsetX)
         .attr('stroke-width',2)                          // Reset stroke-width (changed in AM/PM render)
         .attr('style',null);                             // Clear style (just in case it was set previously)
        g.classed('pulsable',ledIndex === 10)             // Reset if pulsible only for :
        g.selectAll('.led').remove();
        DIGITS[ledIndex](g, offsetX, 0);                  // Call LED digit drawing function for current datum index
      }
    });
  }
  
  // Digital clock contructor
  // @parent - A D3 selection with data property of a String named "digits"
  // @digits - Contains a string of digits, colons, and optional ; or < for AM or PM indicators
  create = function(parent, digits) {
    var svg = parent.append('div').append('svg')
      .attr("viewBox", "0 0 "+_width+" "+_height)
      .classed('digital-clock', true)
      .attr("arai-disabled", "true");
  
    // Define the digital "lit up" element drawing paths (vertical and horizontal)
    var defs = svg.append("defs");
    defs.append("path")
      .attr("id", "vs")
      .attr("d","m.1,.1 l2.4,2.4 l2.5,-2.5 l2.5,-15.0 l-2.5,-2.5 l-2.4,2.4, l-2.5,15.0 z");
    defs.append("path")
      .attr("id", "hs")
      .attr("d","m0,0 l2.5,2.5 l10.0,0 l2.5,-2.5 l-2.5,-2.5 l-10.0,0 l-2.5,2.5 z");
  
    drawDigits(svg, digits);
  }
  
  // Update digital clock with a new time (located in "update" data)
  update = function(update) {
    // Skip this if not in update phase
    if (update.data().length === 0) return;
    
    // Draw the digits for each node instance onto the child's SVG canvas
    update.nodes().forEach(node => {
      var container = d3.select(node);
      var data = container.datum().digits;
      drawDigits(container.select('svg.digital-clock'), data);
    })
  }
 
  // Draw the digits for all digital clocks
  // @svg - The SVG canvas for drawing the clock
  // @gitits - Contains a string in the form "\d{1,2}:\d{2}[:\d{2}]?[;|<]?"
  //           where ';' is the AM indicator and '<' is PM
  //           All other characters in the string are ignored
  function drawDigits(svg, digits) {
    // Need to keep track of X offset in data
    var data = [];
    var offsetX = 0;
    digits.replace(/[^\d:;<]/g,'')
      .split('')
      .map(d => { data.push({ digit: d, x: offsetX }); offsetX += (d === ':')? 15:30; }); // Colon is 15 units wide, otherwise 30
    
    // Select all digital clocks for updating
    var groups = svg.selectAll('g.digit')
      .data(data);
      
    enterDigits(groups)  // enter
    updateDigits(groups) // update
    groups.exit().remove()
    
    // Center the clock within the SVG canvas
    svg.attr('transform','translate('+((250-offsetX)/2)+',0)');
  }
  
  function ledTop(g, offsetX, offsetY) {
    g.append("use")
      .attr("href", "#hs")
      .attr("x", offsetX + 10.0)
      .attr("y", offsetY + 5.0)
      .classed('led',true);
  }
  
  function ledTopLeft(g, offsetX, offsetY) {
    g.append("use")
      .attr("href", "#vs")
      .attr("x", offsetX + 5.0)
      .attr("y", offsetY + 22.5)
      .classed('led',true);
  }
  
  function ledTopRight(g, offsetX, offsetY) {
    g.append("use")
      .attr("href", "#vs")
      .attr("x", offsetX + 20.0)
      .attr("y", offsetY + 22.5)
      .classed('led',true);
  }
  
  function ledMiddle(g, offsetX, offsetY) {
    g.append("use")
      .attr("href", "#hs")
      .attr("x", offsetX + 7.5)
      .attr("y", offsetY + 25.0)
      .classed('led',true);
  }
  
  function ledBottomLeft(g, offsetX, offsetY) {
    g.append("use")
      .attr("href", "#vs")
      .attr("x", offsetX + 2.5)
      .attr("y", offsetY + 42.5)
      .classed('led',true);
  }
  
  function ledBottomRight(g, offsetX, offsetY) {
    g.append("use")
      .attr("href", "#vs")
      .attr("x", offsetX + 17.5)
      .attr("y", offsetY + 42.5)
      .classed('led',true);
  }
  
  function ledBottom(g, offsetX, offsetY) {
    g.append("use")
      .attr("href", "#hs")
      .attr("x", offsetX + 5.0)
      .attr("y", offsetY + 45.0)
      .classed('led',true);
  }
  
  /* All digital clock numbers assume an SVG space of 30 x 50. */
  function led0(group, offsetX, offsetY) {
    ledTop(group, offsetX, offsetY)
    ledTopLeft(group, offsetX, offsetY)
    ledTopRight(group, offsetX, offsetY)
    ledBottomLeft(group, offsetX, offsetY)
    ledBottomRight(group, offsetX, offsetY)
    ledBottom(group, offsetX, offsetY)
  }
  
  function led1(group, offsetX, offsetY) {
    ledTopRight(group, offsetX, offsetY)
    ledBottomRight(group, offsetX, offsetY)
  }
  
  function led2(group, offsetX, offsetY) {
    ledTop(group, offsetX, offsetY)
    ledTopRight(group, offsetX, offsetY)
    ledMiddle(group, offsetX, offsetY)
    ledBottomLeft(group, offsetX, offsetY)
    ledBottom(group, offsetX, offsetY)
  }
  
  function led3(group, offsetX, offsetY) {
    ledTop(group, offsetX, offsetY)
    ledTopRight(group, offsetX, offsetY)
    ledMiddle(group, offsetX, offsetY)
    ledBottomRight(group, offsetX, offsetY)
    ledBottom(group, offsetX, offsetY)
  }
  
  function led4(group, offsetX, offsetY) {
    ledTopLeft(group, offsetX, offsetY)
    ledTopRight(group, offsetX, offsetY)
    ledMiddle(group, offsetX, offsetY)
    ledBottomRight(group, offsetX, offsetY)
  }
  
  function led5(group, offsetX, offsetY) {
    ledTop(group, offsetX, offsetY)
    ledTopLeft(group, offsetX, offsetY)
    ledMiddle(group, offsetX, offsetY)
    ledBottomRight(group, offsetX, offsetY)
    ledBottom(group, offsetX, offsetY)
  }
  
  function led6(group, offsetX, offsetY) {
    ledTop(group, offsetX, offsetY)
    ledTopLeft(group, offsetX, offsetY)
    ledMiddle(group, offsetX, offsetY)
    ledBottomLeft(group, offsetX, offsetY)
    ledBottomRight(group, offsetX, offsetY)
    ledBottom(group, offsetX, offsetY)
  }
  
  function led7(group, offsetX, offsetY) {
    ledTop(group, offsetX, offsetY)
    ledTopRight(group, offsetX, offsetY)
    ledBottomRight(group, offsetX, offsetY)
  }
  
  function led8(group, offsetX, offsetY) {
    ledTop(group, offsetX, offsetY)
    ledTopLeft(group, offsetX, offsetY)
    ledTopRight(group, offsetX, offsetY)
    ledMiddle(group, offsetX, offsetY)
    ledBottomLeft(group, offsetX, offsetY)
    ledBottomRight(group, offsetX, offsetY)
    ledBottom(group, offsetX, offsetY)
  }
  
  function led9(group, offsetX, offsetY) {
    ledTop(group, offsetX, offsetY)
    ledTopLeft(group, offsetX, offsetY)
    ledTopRight(group, offsetX, offsetY)
    ledMiddle(group, offsetX, offsetY)
    ledBottomRight(group, offsetX, offsetY)
    ledBottom(group, offsetX, offsetY)
  }
  
  /* Digital clock colon (:) assumes an SVG space of 15 x 50. */
  function ledColon(group, offsetX, offsetY) {
    group.append("path")
      .attr("d", "m 12.5,17.5 a 3.86,3.78 0 1 1 0,-.01z")
      .attr("transform", "translate("+offsetX+","+offsetY+")")
      .classed('led',true);
    group.append("path")
      .attr("d", "m 12.5,17.5 a 3.86,3.78 0 1 1 0,-.01z")
      .attr("transform", "translate("+(offsetX-2.28)+","+(offsetY+17.5)+")")
      .classed('led',true);
  }
  
  function ledAM(group, offsetX, offsetY) {
    group
      .attr('stroke-width',0.1)
      .attr('style','text-anchor:end;font-size:20px;font-family:Arial;');
    group.append("text")
      .attr("x", offsetX + 30.0)
      .attr("y", offsetY + 22.5)
      .classed('led',true)
      .text("AM");
  }
  
  function ledPM(group, offsetX, offsetY) {
    group
      .attr('stroke-width',0.1)
      .attr('style','text-anchor:end;font-size:20px;font-family:Arial;');
    group.append("text")
      .attr("x", offsetX + 26.6)
      .attr("y", offsetY + 45.0)
      .classed('led',true)
      .text("PM");
  }
  
  // Clock digit drawing functions
  const DIGITS = [led0, led1, led2, led3, led4, led5, led6, led7, led8, led9, ledColon, ledAM, ledPM];
  
  return {
    create: create,
    update: update
  }
 }

const digitalClock = DigitalClock();
