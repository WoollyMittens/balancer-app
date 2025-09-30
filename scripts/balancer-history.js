// balancer-diet.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.History = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-log");
		this.historyTable = this.element.querySelector(".balancer-log-history table");

		// methods
		this.update = function() {
			// redraw the components
			this.reset();
			this.redraw();
		};

		this.reset = function() {
			// clear the history list
			this.historyTable.innerHTML = "";
		};

		this.redraw = function() {
			// fill the history with meals
			this.drawHistory(
				this.planHistory()
			);
		};

		this.planHistory = function() {
			// from the start date to the current date
			var historyItems = [];
			var currentMeals = [];
			// extend the dates to the end of the day
			var startDate = new Date(new Date(new Date(model.start).setHours(0)).setMinutes(1));
			var endDate = new Date(new Date(new Date(model.end).setHours(23)).setMinutes(59));
			// from the start to the end date
			var counter = 0;
			while(startDate < endDate && counter < 50) {
				// get the current day's diet entries
				currentMeals = parent.getTimeline(endDate);
				// add a list entry for each diet entry
				currentMeals.diet.map(function(entry) {
					historyItems.push({
						label: entry.label,
						value: entry.value,
						date: new Date(endDate)
					});
				});
				// add history items with an sufficiant activity as well
				if (currentMeals.activity > 1) {
					var activityName;
					if (currentMeals.activity > 4) { activityName = "Strenuous activity"; }
					else if (currentMeals.activity > 1) { activityName = "Moderate activity"; }
					else { activityName = "Sedentary activity"; }
					historyItems.push({
						label: activityName,
						activity: currentMeals.activity,
						date: new Date(endDate)
					});
				}
				// increment the hours
				endDate = new Date(endDate.getTime() - (1000 * 60 * 60));
				counter += 1;
			}
			// pass back the prepared hisory items
			return historyItems;
		};

		this.drawHistory = function(historyItems) {
			// update the units
			var energyUnit = (model.energyUnits === 0) ? " kJ" : " kCal";
			var energyConversion = (model.energyUnits === 0) ? 1 : 4.184;
			// limit the length of the history to a managable size
			var maxItems = Math.min(historyItems.length, 1000);
			historyItems = historyItems.slice(historyItems.length - maxItems, historyItems.length);
			// add N elements of the chart to the DOM
			var historyRow, historyDate, historyLabel, historyValue, historyControls, historyButton, dateLabel, timeLabel;
			for (var a = 0, b = historyItems.length; a < b; a += 1) {
				// write the time label
				dateLabel = (model.timespan > 0) ? " (" + historyItems[a].date.toLocaleDateString("en-AU", { day: "numeric", month: "short" }).replace(/\./g, "") + ")" : "";
				timeLabel = historyItems[a].date.toLocaleTimeString([], {hour: "numeric", hour12: true}).replace(/\s/g, "");
				// construct the history item
				historyRow = document.createElement("tr");
				historyDate = document.createElement("th");
				historyDate.innerHTML = timeLabel + dateLabel;
				historyLabel = document.createElement("td");
				historyLabel.innerHTML = historyItems[a].label;
				historyValue = document.createElement("td");
				historyValue.innerHTML = (historyItems[a].value) ? (historyItems[a].value / energyConversion).toFixed(0) + energyUnit : "";
				historyControls = document.createElement("td");
				historyButton = document.createElement("button");
				historyButton.name = "remove";
				historyButton.innerHTML = "Remove";
				historyButton.onclick = (historyItems[a].value) ? this.onRemoveMeal.bind(this, historyItems[a]) : this.onRemoveActivity.bind(this, historyItems[a]);
				historyRow.appendChild(historyDate);
				historyRow.appendChild(historyLabel);
				historyRow.appendChild(historyValue);
				historyRow.appendChild(historyControls);
				historyControls.appendChild(historyButton);
				this.historyTable.appendChild(historyRow);
			}
		};

		this.onRemoveMeal = function(meal, evt) {
			// cancel the click
			evt.preventDefault();
			// retrieve the timeline entry for this hour
			var timelineEntry = parent.getTimeline(meal.date);
			// for all the diet items
			var wasFound = false, newDiet = [];
			timelineEntry.diet.map(function(entry) {
				// allow all but the first matching entry through
				if (meal.label !== entry.label || meal.value !== entry.value || wasFound) {
					newDiet.push(entry);
				} else {
					wasFound = true;
				}
			});
			// save the updated entry
			timelineEntry.diet = newDiet;
			parent.setTimeline(meal.date, timelineEntry);
		};

		this.onRemoveActivity = function(entry, evt) {
			// cancel the click
			evt.preventDefault();
			// update the activity level for this hour
			parent.setTimeline(entry.date, {activity: 1});
		};

		// events

	};

})();
