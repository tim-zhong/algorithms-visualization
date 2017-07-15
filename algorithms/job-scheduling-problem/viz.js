var JOBS = 20;
	MIN_DURATION = 4;
	MAX_DURATION = 10;

function init() {
	d3.select('#viz').remove();

	var data = generateData(JOBS, MIN_DURATION, MAX_DURATION);

	var svg = d3.select('#viz-container').append('svg')
		.attr('id', 'viz')
		.attr('width', '960')
		.attr('height', '500');

	var margin = {top: 20, right: 40, bottom: 40, left: 80},
	    width = +svg.attr("width") - margin.left - margin.right,
	    height = +svg.attr("height") - margin.top - margin.bottom;

	var g = svg.append('g');

	var x = d3.scaleLinear()
	    .domain([d3.min(data, function(d) {return d.start;}), d3.max(data, function(d) {return d.end;})])
		.range([10, width]);

	var y = d3.scaleLinear()
	    .domain([0, JOBS])
		.range([height, 0]);	

	g.append("g").selectAll("rect")
		.data(data)
	    .enter().append('line')
	    .attr('x1', function(d, i) {return x(d.start);})
	    .attr('y1', function(d, i) {return y(i);})
	    .attr('x2', function(d, i) {return x(d.end);})
	    .attr('y2', function(d, i) {return y(i);})
	    .classed('selected', function(d) {return d.selected;});

	g.append("g").selectAll(".start-time")
		.data(data)
	    .enter().append('text')
	    .attr('class', 'start-time')
	    .attr('x', function(d, i) {return x(d.start);})
	    .attr('y', function(d, i) {return y(i) - 1;})
	    .text(function(d) {return d.start;})
	    .classed('selected', function(d) {return d.selected;});
	
	g.append("g").selectAll(".end-time")
		.data(data)
	    .enter().append('text')
	    .attr('class', 'start-time')
	    .attr('x', function(d, i) {return x(d.end);})
	    .attr('y', function(d, i) {return y(i) - 1;})
	    .text(function(d) {return d.end;})
	    .style('text-anchor', 'end')
	    .classed('selected', function(d) {return d.selected;});

}

function randomBetween(lo, hi) {
	return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function generateData(n, min, max) {
	var randomData = [];
	for(var i = 0; i < JOBS; i++) {
		var duration = randomBetween(min, max);
		var start = randomBetween(0, n * 2 - max);
		var end = start + duration;

		if(randomData.filter(function(d) {return d.start == start && d.end == end; }).length){
			i--;
			continue;
		}

		randomData.push({
			idx: i,
			start: start,
			end: start + duration,
			selected: false
		});
	}

	var data = selectJobs(randomData);

	return data;
}

function selectJobs(data) {
	var curEnd = 0;
	n = data.length;
	
	var copy = data.slice();

	var selectedIds = [];
	while(1){ // greedy
		var feasible = data.filter(function(d) {return d.start >= curEnd;});
		if(feasible.length === 0) break;

		feasible.sort(byEndingTime);
		
		var d = feasible[0];

		data[d.idx].selected = true;
		curEnd = d.end;
	}
	return data;
}

function byEndingTime(a, b) {
	return a.end - b.end;
}
/*---------------------------------------------------------------------------------------------------*/
init();
document.getElementById('jobs').value = JOBS;

d3.select('#reset')
	.on('click', init);

d3.select('#jobs')
	.on('change', function() {
		var jobs = this.value;
		if(jobs) {
			JOBS = jobs;
			init();
		}
	});