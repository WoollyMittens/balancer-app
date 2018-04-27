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
			while(startDate < endDate) {
				// get the current day's diet entries
				currentMeals = parent.getTimeline(startDate);
				// add a list entry for each diet entry
				currentMeals.diet.map(function(entry) {
					historyItems.push({
						label: entry.label,
						value: entry.value,
						date: new Date(startDate)
					});
				});
				// add history items with an sufficiant activity as well
				if (currentMeals.activity > 1) {
					var activityName;
					// TODO: this is now a float pick intervals differently
					switch(currentMeals.activity){
						case 1: activityName = "Moderate activity"; break;
						case 2: activityName = "Strenuous activity"; break;
						default : activityName = "Sedentary activity";
					}
					historyItems.push({
						label: activityName,
						activity: currentMeals.activity,
						date: new Date(startDate)
					});
				}
				// increment the hours
				startDate.setHours(startDate.getHours() + 1);
			}
			// pass back the prepared hisory items
			return historyItems;
		};

		this.drawHistory = function(historyItems) {
			// limit the length of the history to a managable size
			var maxItems = Math.min(historyItems.length, 1000);
			historyItems = historyItems.slice(historyItems.length - maxItems, historyItems.length);
			// add N elements of the chart to the DOM
			var historyRow, historyDate, historyLabel, historyValue, historyControls, historyButton;
			for (var a = 0, b = historyItems.length; a < b; a += 1) {
				// construct the history item
				historyRow = document.createElement("tr");
				historyDate = document.createElement("th");
				historyDate.innerHTML = historyItems[a].date.toLocaleTimeString([], {hour: "numeric", hour12: true}).replace(/\s/g, "");
				historyLabel = document.createElement("td");
				historyLabel.innerHTML = historyItems[a].label;
				historyValue = document.createElement("td");
				historyValue.innerHTML = (historyItems[a].value) ? historyItems[a].value + " kJ" : "";
				historyControls = document.createElement("td");
				historyButton = document.createElement("button");
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
