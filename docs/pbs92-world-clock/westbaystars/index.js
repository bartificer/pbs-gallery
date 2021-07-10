/* Script to run the World Clock web app page
   Assumes digital-clock.js and analog-clock.js have been imported

   Data drives the creation of cards on the page. Each card contains a time zone name, the time
   in a string format for display on a digital clock, and sequence of hours, minutes, seconds in
   D3 friendly unit/number object pairs for an analog clock.
*/

// Store the current settings, time, and time zones into a D3 friendly data structure
const settings = {
  show24: d3.select('#show24Hour').property('checked'),
  showSeconds: d3.select('#showSeconds').property('checked'),
  showPulsing: d3.select('#pulsing').property('checked'),
  timeZones: ['UTC'],
  currentTime: new moment().utc(),
  addTimeZone: function(tz) {
    if (this.timeZones.indexOf(tz.toUpperCase()) < 0) this.timeZones.push(tz.toUpperCase())
  },
  removeTimeZone: function(tz) {
    this.timeZones = this.timeZones.filter(t => t !== tz.toUpperCase());
  },
  data: function() {
    var d = []
    var timeFormat = '' + (this.show24? 'HH':'h') + ':mm' + (this.showSeconds? ':ss':'') + (this.show24?  '':'A');

    this.currentTime = new moment().utc();
    this.timeZones.forEach((tz, i) => {
      var m = this.currentTime.tz(tz)
      d.push({
        zone: tz,
        digits: m.format(timeFormat).replace('AM',';').replace('PM','<'),
        time: [
          {units: "hours", number: m.hours() + m.minutes() / 60}, // Includining minutes allows hour hand to move between hours
          {units: "minutes", number: m.minutes()},
          {units: this.showSeconds? "seconds":"x", number: m.seconds()}
        ]
      })
    });
    return d;
  },
  init: () => {
    d3.select('#show24Hour').on('change', () => { settings.show24 = d3.select('#show24Hour').property('checked'); });
    d3.select('#showSeconds').on('change', () => { settings.showSeconds = d3.select('#showSeconds').property('checked'); });
    d3.select('#pulsing').on('change', () => {
      settings.showPulsing = d3.select('#pulsing').property('checked');
      // Reset to full opacity when toggled to start
      d3.selectAll('.pulsable')
        .style("opacity", 1);
     });
    this.worldMap = WorldTimezoneMap('#time-zone-map', 480);
    d3.select('#add-time-zone').on('click', () => {
      var value = d3.select('#time-zone-map input.search').node().value;
      if (value.length > 0) {
        settings.addTimeZone(value);
      }
    });
  }
}
settings.init();

var container = d3.select('#container');

function createCards(selection) {
  var enter = selection.enter()
    .append('div')
    .attr('class','col-12 col-sm 6 col-md-4 col-lg-3 col-xl-2 mb-3')
    .append('div')
      .attr('class','card time-card');
  
  enter.append('h2')
    .attr("class", "card-header h4 text-primary border-primary")
    .attr('role', 'landmark')
    .attr('arai-describedby',d => d.zone+'-zone')
    .text(d => d.zone)
    .append('span')
      .attr('id',d => d.zone+'-zone')
      .attr('style','position:absolute;top:-500px;')
      .text(d => 'The time at '+d.zone+' is '+d.digits.replace(';',' AM').replace('<',' PM')+'.');
  
  var body = enter.append('div')
    .attr('class', 'card-body');
    
  // Only create clocks if enter-ing
  if (enter.size() > 0) {
    analogClock.create(body, enter.datum().time);
    digitalClock.create(body, enter.datum().digits);
  }
}

function updateCards(update) {
  update.selectAll('h2')
    .text(d => d.zone)
    .append('span')
      .attr('style','position:absolute;top:-500px;')
      .attr('id',d => d.zone+'-zone')
      .text((d, i, t) => {
      data = d3.select(t[i].parentElement.parentElement).datum();
      return 'The time at '+data.zone+' is '+data.digits.replace(';',' AM').replace('<',' PM')+'.';
    });
;
  update.call(analogClock.update);
  update.call(digitalClock.update);
}

function render(data) {
  // Select all cards, assigning data
  var cards = container.selectAll('.time-card')
    .data(data);
    
  createCards(cards); // Enter
  updateCards(cards); // Update
  cards.exit().remove();
}

//render(settings.data());

setInterval(function() {
  var data = settings.data();
  return render(data);
}, 1000);

// Control pulsing effect
var pulseLevel = 1;
setInterval(function() {
  if (settings.showPulsing) {
    pulseLevel = (pulseLevel >= 1)? 0.2:1;
    d3.selectAll('.pulsable')
    .transition()
    .style("opacity", pulseLevel);
  }
}, 500)

