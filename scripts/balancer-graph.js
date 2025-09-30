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
		this.projection = this.element.querySelector(".balancer-projection");
		this.graphBars = [];

		// methods
		this.update = function() {
			// redraw the graph
			this.reset();
			this.redraw();
		};

		this.reset = function() {
			// clear the previous graph
			for (var a = 0, b = this.graphBars.length; a < b; a += 1) {
				this.graphBars[a].parentNode.removeChild(this.graphBars[a]);
			}
			// reset the container
			this.graphBars = [];
		};

		this.redraw = function() {
			// draw the chart
			this.drawHourlyChart(
				this.planHourlyChart()
			);
		};

		this.planHourlyChart = function() {
			// extend the dates to the end of the day
			var startDate = new Date(new Date(new Date(model.start).setHours(0)).setMinutes(1));
			var endDate = new Date(new Date(new Date(model.end).setHours(23)).setMinutes(59));
			var timeSpan = (endDate - startDate) / (1000 * 60 * 60 * 24);
			// from the start date to the current date
			var chartItems = [];
			var startBalance = 0;
			var timelineEntry, energyUse, energyGain, hourMarker, dayMarker, hours;
			// from the start to the end date
			while(startDate < endDate) {
				// retrieve the timeline unit
				timelineEntry = parent.getTimeline(startDate);
				// get the energy use for this hour
				energyUse = this.baseRate() / 24 * timelineEntry.activity; // (2)
				// get the energy gain for this hours
				energyGain = 0;
				timelineEntry.diet.map(function (entry) {energyGain += entry.value; return energyGain});
				// carry the energy level and add the hour's balance
				startBalance += energyGain - energyUse;
				// add the chart entry
				chartItems.push({
					value: startBalance,
					activity: timelineEntry.activity,
					date: new Date(startDate),
					use: energyUse
				});
				// increment the hours
				startDate = new Date(startDate.getTime() + (1000 * 60 * 60));
			}
			// set the projected weight loss/gain based on the daily balance
			this.projection.innerHTML = (startBalance / model.density).toFixed(2) + " kg";
			// pass back the prepared chart items
			return chartItems;
		};

		this.drawHourlyChart = function(chartItems) {
			// update the units
			var energyUnit = (model.energyUnits === 0) ? "kJ" : "kCal";
			var energyConversion = (model.energyUnits === 0) ? 1 : 4.184;
			// limit the length of the chart to a managable size
			var maxItems = Math.min(chartItems.length, 1000);
			chartItems = chartItems.slice(chartItems.length - maxItems, chartItems.length);
			// set the limits of the scale to the maximum value, but never less that the base metabolic rate
			var graphLimit = 0;
			chartItems.map(function(entry) { var entryValue = Math.abs(entry.value); graphLimit = (entryValue > graphLimit) ? entryValue : graphLimit; });
			graphLimit = Math.max(graphLimit, this.baseRate());
			this.scaleMax.innerHTML = (graphLimit / energyConversion).toFixed(0) + energyUnit;
			this.scaleMin.innerHTML = (-graphLimit / energyConversion).toFixed(0) + energyUnit;
			// add N elements of the chart to the DOM
			var graphHour, graphClass, graphLevel, graphColour, graphSize, graphBar, curDate = new Date(), focusDate = model.focus || curDate;
			for (var a = 0, b = chartItems.length; a < b; a += 1) {
				// construct the bar chart
				graphHour = chartItems[a].date.getHours();
				graphClass = "balancer-graph-bar";
				graphClass += (chartItems[a].date > curDate) ? " balancer-graph-ahead" : "";
				graphClass += (this.isWithinHour(chartItems[a].date, focusDate)) ? " balancer-graph-current" : "";
				graphLevel = Math.min(Math.max(50 - Math.abs(50 * chartItems[a].value / graphLimit), 0), 50);
				graphSize = (chartItems[a].value < 0) ? "top:50%;bottom:" + graphLevel + "%;" : "top:" + graphLevel + "%;bottom:50%;";
				graphBar = document.createElement("div");
				graphBar.style.backgroundColor = "rgba(25,118,210," + (chartItems[a].activity / (model.maxActivity - model.minActivity)) + ")";
				graphBar.setAttribute("class", graphClass);
				graphBar.innerHTML = "<span style=\"" + graphSize + "\"><em>" + (chartItems[a].value / energyConversion).toFixed(0) + energyUnit + "</em></span>";
				graphBar.innerHTML += (graphHour % 3 === 0 && graphHour > 0) ? "<time>" + chartItems[a].date.toLocaleString([], {hour: "numeric", hour12: true}).replace(/\s/, "") + "</time>" : "";
				graphBar.innerHTML +=	(graphHour === 23) ? "<b>" + chartItems[a].date.toLocaleDateString("en-AU") + "</b>" : "";
				graphBar.addEventListener('click', this.onFocusHour.bind(this, chartItems[a].activity, chartItems[a].date));
				this.scroll.appendChild(graphBar);
				// remember the chart item
				this.graphBars.push(graphBar);
			}
			// centre the focussed day if it is outside the view
			setTimeout(this.onCentreFocus.bind(this), 0);
		};

		this.isWithinHour = function(dateA, dateB) {
			return (
				dateA
				&& dateB
				&& dateA.getHours() === dateB.getHours()
				&& dateA.getDate() === dateB.getDate()
				&& dateA.getMonth() === dateB.getMonth()
				&& dateA.getYear() === dateB.getYear()
			);
		};

		this.baseRate = function() {
			// select which version of the calculation to use
			var genderOffset = (model.gender === 0) ? -161 : 5;
			// calculate the base metabolic rate (kJ/day)
			return 4.184 * (model.weight * 10 + model.height * 6.25 + model.age * 5 + genderOffset) * model.adjustment / 100; // (1)
		};

		this.onCycleActivity = function(value, date, evt) {
			// cancel the click
			evt.preventDefault();
			// update the activity level for this hour
			var value = parent.getTimeline(date).activity + 1;
			value = (value > model.maxActivity) ? model.minActivity : value;
			parent.setTimeline(date, {activity: value});
		};

		this.onFocusHour = function(value, date, evt) {
			// cancel the click
			evt.preventDefault();
			// toggle the focussed hour
			model.focus = this.isWithinHour(model.focus, date) ? null : new Date(date);
			parent.update();
		};

		this.onCentreFocus = function() {
			var focus = document.querySelector(".balancer-graph-current");
			if (focus.offsetLeft < this.scroll.scrollLeft || focus.offsetLeft > this.scroll.scrollLeft + this.scroll.offsetWidth) {
				this.scroll.scrollLeft = document.querySelector(".balancer-graph-current").offsetLeft - this.scroll.offsetWidth / 2;
			}
		};

		// events

	};

})();
