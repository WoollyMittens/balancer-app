// balancer-graph.js
// (1) Mifflin-St. Jeor Equation - https://en.wikipedia.org/wiki/Basal_metabolic_rate
// (2) Calories burned per activity - https://www.health.harvard.edu/diet-and-weight-loss/calories-burned-in-30-minutes-of-leisure-and-routine-activities

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Graph = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-graph");
		this.scroll = this.element.querySelector(".balancer-graph-scroll");
		this.scaleMax = this.element.querySelector(".balancer-scale-max");
		this.scaleMin = this.element.querySelector(".balancer-scale-min");
		this.graphBars = [];

		// methods
		this.redraw = function() {
			// draw the chart
			this.drawChart(
				this.planChart()
			);
		};

		this.planChart = function() {
			// from the start date to the current date
			var chartItems = [];
			var currentDate = new Date(model.start);
			var currentBalance = 0;
			var endDate = new Date();
			var timelineEntry, energyUse, energyGain, hourMarker, dayMarker, hours;
			// extend the end date to the end of the day
			endDate.setHours(23);
			// from the start to the end date
			while(currentDate < endDate) {
				// retrieve the timeline unit
				timelineEntry = parent.getTimeline(currentDate);
				// get the energy use for this hour
				energyUse = this.baseRate() / 24 * (1 + timelineEntry.activity * 3); // (2)
				// get the energy gain for this hours
				energyGain = 0;
				timelineEntry.diet.map(function (entry) {energyGain += entry.value; return energyGain});
				// carry the energy level and add the hour's balance
				currentBalance += energyGain - energyUse;
				// add the chart entry
				var hours = currentDate.getHours();
				chartItems.push({
					value: currentBalance,
					activity: timelineEntry.activity,
					date: new Date(currentDate)
				});
				// increment the hours
				currentDate.setHours(currentDate.getHours() + 1);
			}
			// pass back the prepared chart items
			return chartItems;
		};

		this.drawChart = function(chartItems) {
			// limit the length of the chart to a managable size
			var maxItems = Math.min(chartItems.length, 48);
			chartItems = chartItems.slice(chartItems.length - maxItems, chartItems.length);
			console.log('chartItems', chartItems);
			// set the limits of the scale to the maximum value
			var graphLimit = 0;
			chartItems.map(function(entry) { var entryValue = Math.abs(entry.value); graphLimit = (entryValue > graphLimit) ? entryValue : graphLimit; });
			this.scaleMax.innerHTML = Math.round(graphLimit) + 'kJ';
			this.scaleMin.innerHTML = Math.round(-graphLimit) + 'kJ';
			// add N elements of the chart to the DOM
			var graphHour, graphClass, graphLevel, graphStyle, graphBar, curDate = new Date();
			for (var a = 0, b = chartItems.length; a < b; a += 1) {
				// construct the bar chart
				graphHour = chartItems[a].date.getHours();
				graphClass = "balancer-graph-bar balancer-activity-" + chartItems[a].activity;
				graphClass += (chartItems[a].date > curDate) ? " balancer-graph-ahead" : "";
				graphLevel = Math.min(Math.max(50 - Math.abs(50 * chartItems[a].value / graphLimit), 0), 50);
				graphStyle = (chartItems[a].value < 0) ? "top:50%;bottom:" + graphLevel + "%;" : "top:" + graphLevel + "%;bottom:50%;";
				graphBar = document.createElement("div");
				graphBar.setAttribute("class", graphClass);
				graphBar.innerHTML = "<span style=\"" + graphStyle + "\"></span>";
				graphBar.innerHTML += (graphHour % 3 === 0 && graphHour > 0) ? "<time>" + chartItems[a].date.toLocaleString('en-US', {hour: 'numeric', hour12: true}).replace(/\s/, "") + "</time>" : "";
				graphBar.innerHTML +=	(graphHour === 23) ? "<b>" + chartItems[a].date.toLocaleDateString('en-AU') + "</b>" : "";
				graphBar.addEventListener('click', this.onCycleActivity.bind(this, chartItems[a].activity, chartItems[a].date));
				this.scroll.appendChild(graphBar);
				this.graphBars.push(graphBar);
			}
			// slide the chart to the right
			var _this = this;
			setTimeout(function() {_this.scroll.scrollLeft += 10000;}, 0);
		};

		this.baseRate = function() {
			// select which version of the calculation to use
			var genderOffset = (model.gender === 0) ? -161 : 5;
			// calculate the base metabolic rate (kJ/day)
			return 4.184 * (model.weight * 10 + model.height * 6.25 + model.age * 5 + genderOffset); // (1)
		};

		this.reset = function() {
			// clear the previous graph
			for (var a = 0, b = this.graphBars.length; a < b; a += 1) {
				this.graphBars[a].parentNode.removeChild(this.graphBars[a]);
			}
			// reset the container
			this.graphBars = [];
		};

		this.update = function() {
			// redraw the graph
			this.reset();
			this.redraw();
		};

		// events
		this.onCycleActivity = function(value, date, evt) {
			// cancel the click
			evt.preventDefault();
			// update the activity level for this hour
			var value = parent.getTimeline(date).activity + 1;
			value = (value > 2) ? 0 : value;
			parent.setTimeline(date, {activity: value});
		};

	};

})();
