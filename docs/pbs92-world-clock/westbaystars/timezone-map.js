/*
  World time zone map with night shading by Even Wheeler.
  https://bl.ocks.org/ewheeler/2be7373ca280d667d6e0
  
  Requires the following to be loaded before:
  * night.js
  * d3.js
  * colorbrewer.js
  * topojson.js
  * moment.min.js
  * moment-timezone-with-data.js
  * lowdash.js
  * flatpickr.min.js
  * awesomplete.min.js
  
  Adopted into stand alone object by Michael Westbay.
*/

function WorldTimezoneMap(mapSelector, displayWidth) {
  var π = Math.PI,
      radians = π / 180,
      degrees = 180 / π;
  
  var circle = d3.geoCircle()
    .precision(90);
  
  // TODO update if open in browser for a long long time?
  var nownow = moment(Date.now());
  
  var search = d3.select("#time-zone-map")
    .append("input")
    .attr("class", "form-control search")
    .attr("type", "text")
    .style('width', displayWidth+'px');
  
  
  // function creates a classname for the offset that
  // a given zonename belongs to (e.g., America/New_York ==> UTC-4)
  function offset_class(zonename) {
    if (zonename !== 'uninhabited') try {
      if (moment.tz(zonename)) {
        minutes = nownow.tz(zonename).utcOffset();
        // momentjs gives offset relative to selected zone, so flip it
        hours = (minutes / 60.0) * -1;
  
        // can't have . or + in css class names, so
        // strip decimals
        hours = hours.toString().replace(/\./g,'');
  
        // prepend positive offsets with _ so we can
        // differentiate offset sign easily while debugging
        // based on this character versus - for negatives
        return 'UTC' + (hours < 0 ? '' : '_') + hours;
      }
    } catch (e) {
      // ignore errors!
      // America/Coral_Harbour is not in moment.js data
      // same for antarctica
      return '';
    }
  };
  
  //_.uniq(_.map(svg.selectAll('.timezone')[0], function(d) { return _.last(d.classList) }))
  // ordered zones so they can be colored sequentially
  // had to order by hand :(
  var offsets = ["UTC-13", "UTC-12", "UTC-11", "UTC-10", "UTC-875", "UTC-85", "UTC-8", "UTC-7", "UTC-65", "UTC-6", "UTC-575", "UTC-55", "UTC-5", "UTC-45", "UTC-4", "UTC-35", "UTC-3", "UTC-25", "UTC-2", "UTC_0", "UTC_1", "UTC_2", "UTC_25", "UTC_3", "UTC_4", "UTC_45", "UTC_5", "UTC_55", "UTC_575", "UTC_6", "UTC_65", "UTC_7", "UTC_8", "UTC_875", "UTC_9", "UTC_95", "UTC_10", "UTC_11"];
  
  var selected = new Array();
  
  COLOR_GOOD = '#3CB43C';
  COLOR_OK = '#FFC37A';
  COLOR_BAD = '#9D4D34';
  COLOR_HIGHLIGHT = '#333';
  
  var colorScale = d3.scaleOrdinal(colorbrewer.Paired[12]);
  colorScale.domain(offsets);
  
  function colors(d) {
    if (selected.indexOf(d.id) === -1) {
      return colorScale(offset_class(d.id));
    } else {
      return COLOR_HIGHLIGHT;
    }
  }
  
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");
  
  var width = 960,
      height = 800,
      displayHeight=displayWidth * 800 / 960;
  
  var projection = d3.geoMercator()
      .scale(width / 2 / π)
      .translate([width / 2, height / 2])
      .precision(.1);
  
  var path = d3.geoPath(projection);
  
  var graticule = d3.geoGraticule();
  
  var svg = d3.select(mapSelector).append("svg")
      .attr("width", displayWidth)
      .attr("height", displayHeight)
      .attr("viewBox", "0 0 "+width+" "+height);
  
  var night = svg.append("path")
      .attr("class", "night")
      .attr("d", path);
  
  night.datum(circle.center(NIGHT.antiSolarPosition(new Date(nownow)))).attr("d", path);
  
  svg.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", path);
  
  //d3.select(self.frameElement).style("height", height + "px");
  
  d3.json("timezones.json", function(error, timezones) {
    if (error) console.log(error);
    
    path.projection(null);
  
    svg.insert("path", ".graticule")
        .datum(topojson.mesh(timezones, timezones.objects.timezones, function(a, b) { return a !== b; }))
        .attr("class", "boundary")
        .attr("d", path);
  
    svg.insert("g", ".graticule")
        .attr("class", "timezones")
      .selectAll("path")
        .data(topojson.feature(timezones, timezones.objects.timezones).features)
      .enter().append("path")
        .attr("id", function(d) { return d.id.replace(/\//g, ""); })
        .attr("d", path)
        .style("fill", function(d) { return colors(d); })
        .style("stroke", function(d) { return d3.hsl(colors(d)).darker(2); })
        .attr("class", function(d) { return 'timezone ' + offset_class(d.id); })
        .on("click", select)
        .on("mousemove", onhover)
        .on("mouseout", onout);
  });
  
  
  
  function onhover(d){
    svg.selectAll('.timezone').transition()
      .style('opacity', '.4')
      .style('fill', '#aaa');
    svg.selectAll('.' + offset_class(d.id)).transition()
      .style('opacity', '1')
      .style('fill', colors(d));
  
    var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
  
    // lookup offset in minutes, transform to hours relative UTC
    var zone = nownow.tz(d.id === 'uninhabited' ? 'UTC' : d.id)
    var display = d.id + ': UTC' + zone.format('Z');
  
    tooltip
      .classed("hidden", false)
      .attr("style", "left:" + (mouse[0] + 25) + "px;top:" + (mouse[1] + 15)+ "px")
      .html(display);
  
  }
  
  function onout(d){
    svg.selectAll('.timezone').transition()
        .style('opacity', '1')
        .style('fill', function(p) { return colors(p); });
  
    tooltip.classed("hidden", true);
  }
  
  
  function pad(str){
    var out = str;
    var diff = 30 - str.length;
    var filler = '&nbsp';
    for (var i=0; i < diff; i++){
      out = filler + out;
    }
    return out;
  }
  
  function select(d){
    if (selected.indexOf(d.id) > -1) {
      d3.select('input.search').node().value = '';
      selected.splice(d.id, 1);
      //compare.selectAll('.compare-' + d.id.replace(/\//g, '')).remove()
  
    } else {
      d3.select('input.search').node().value = d.id;
      selected.push(d.id);
  
      svg.selectAll('.' + offset_class(d.id)).transition()
        .style('opacity', '1')
        .style('fill', COLOR_HIGHLIGHT);
  /*
  		comparing.push(d);
      localtime = nownow.tz(d.id);
  
      compare
        .append('li')
        .attr('class', 'compare-' + d.id.replace(/\//g, ''))
        .style('color', agony(localtime))
        .html(pad(d.id) + ': '+ localtime.format('ddd DD MMMM YYYY, HH:mm a zz [UTC]Z'));
  */
    }
  }
  
  new Awesomplete(search.node(), {
  	list: _.map(moment.tz.names(), function(z) {return z/*.replace(/\//g, "")*/;}),
    replace: function(text){
               var datum = d3.select('#' + text.value.replace(/\//g,'')).datum();
               select(datum);
  
               this.input.value = text.value;
  						 this.close();
  
               // `select` will leave all timezones with same offset red.
               //   so mimic the effects of `onout` to highlight same offsets, then fade.
  						 svg.selectAll('.timezone').transition()
  								 .delay(250)
  								 .duration(750)
  								 .style('opacity', '1')
  								 .style('fill', function(p) { return colors(p); });
  
  					  //this.input.value = "";
             },
  });
  
  function agony(datetime) {
    if (datetime.hour() < 6) {
      return COLOR_BAD;
    }
    else if (datetime.hour() > 22) {
      return COLOR_BAD;
    }
    else if (datetime.hour() > 7 && datetime.hour() < 17) {
      return COLOR_GOOD;
    }
    else {
      return COLOR_OK;
    }
  }
  
  function update_datetime(datetime){
    nownow = moment(datetime);
    showtime.html(nownow);
  
    // TODO fix update of nighttime mask
    // night.datum(circle.origin(NIGHT.antiSolarPosition(new Date(nownow)))).attr("d", path);
  /*
    compare.html("");
  
    _.each(comparing, function(d){
    /* TODO DRY this and orig bit from select function * /
    localtime = nownow.tz(d.id);
  
  	compare
  		.append('li')
  		.attr('class', 'compare-' + d.id.replace(/\//g, ''))
      .style('fill', agony(localtime))
      .style('color', agony(localtime))
  		.html(pad(d.id) + ': '+ localtime.format('ddd DD MMMM YYYY, HH:mm a zz [UTC]Z'));
    })
    */
  }
  
  flatpickr('.flatpickr', {
    defaultDate: nownow.format("YYYY-MM-DD HH:mm"),
    onChange: update_datetime
  })
  
  return {
  }
}
