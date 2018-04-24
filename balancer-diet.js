// balancer-diet.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Diet = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-diet");
		this.opener = this.element.querySelector(".balancer-diet-add");
		this.timeInput = this.element.querySelector(".balancer-diet-time input[name=time]");
		this.dateInput = this.element.querySelector(".balancer-diet-time input[name=date]");
		this.timeLabel = this.element.querySelector(".balancer-diet-time time:nth-child(1)");
		this.dateLabel = this.element.querySelector(".balancer-diet-time time:nth-child(2)");
		this.historyTable = this.element.querySelector(".balancer-diet-history table");
		this.labelInput = this.element.querySelector(".balancer-diet-description input[name=label]");
		this.valueInput = this.element.querySelector(".balancer-diet-description input[name=value]");
		this.addMealButton = this.element.querySelector(".balancer-diet-description button");
		this.historyRows = [];

		// methods

		this.update = function() {
			// redraw the components
			this.reset();
			this.redraw();
		};

		this.reset = function() {
			// clear the previous list
			for (var a = 0, b = this.historyRows.length; a < b; a += 1) {
				this.historyRows[a].parentNode.removeChild(this.historyRows[a]);
			}
			// reset the container
			this.historyRows = [];
		};

		this.redraw = function() {
			// set the date and time labels TODO: maybe do this every minute asynchronously
			this.updateTime(new Date());
			// check the input fields
			this.onCheckValues();
			// fill the history with meals
			this.drawHistory(
				this.planHistory()
			);
		};

		this.updateTime = function(date) {
			// set the label values
			this.timeLabel.innerHTML = date.toLocaleTimeString([], {hour: 'numeric', minute: 'numeric', hour12: true}).replace(/\s/g, "");
			this.dateLabel.innerHTML = date.toLocaleDateString();
			// set the input elements
			this.timeInput.value = date.toLocaleTimeString([], {hour: 'numeric', minute: 'numeric', hour12: false});
			this.dateInput.value = date.toISOString().split('T')[0];
		};

		this.planHistory = function() {
			// from the start date to the current date
			var historyItems = [];
			var currentMeals = [];
			var currentDate = new Date(model.start);
			var endDate = new Date();
			// extend the end date to the end of the day
			endDate.setHours(23);
			// from the start to the end date
			while(currentDate < endDate) {
				// get the current day's diet entries
				currentMeals = parent.getTimeline(currentDate);
				console.log("currentMeals", currentMeals);
				// add a list entry for each diet entry
				currentMeals.diet.map(function(entry) {
					historyItems.push({
						label: entry.label,
						value: entry.value,
						date: new Date(currentDate)
					});
				});
				// increment the hours
				currentDate.setHours(currentDate.getHours() + 1);
			}
			// pass back the prepared hisory items
			console.log("historyItems", historyItems);
			return historyItems;
		};

		this.drawHistory = function(historyItems) {
			// limit the length of the history to a managable size
			var maxItems = Math.min(historyItems.length, 48);
			historyItems = historyItems.slice(historyItems.length - maxItems, historyItems.length);
			// add N elements of the chart to the DOM
			var historyRow, historyDate, historyLabel, historyValue, historyControls, historyButton;
			for (var a = 0, b = historyItems.length; a < b; a += 1) {
				// construct the history list
				historyRow = document.createElement('tr');
				historyDate = document.createElement('th');
				historyDate.innerHTML = historyItems[a].date.toLocaleTimeString([], {hour: 'numeric', hour12: true}).replace(/\s/g, "");
				historyLabel = document.createElement('td');
				historyLabel.innerHTML = historyItems[a].label;
				historyValue = document.createElement('td');
				historyValue.innerHTML = historyItems[a].value + ' kJ';
				historyControls = document.createElement('td');
				historyButton = document.createElement('button');
				historyButton.innerHTML = "Remove";
				historyButton.addEventListener('click', this.onRemoveMeal.bind(this, historyItems[a]));
				historyRow.appendChild(historyDate);
				historyRow.appendChild(historyLabel);
				historyRow.appendChild(historyValue);
				historyRow.appendChild(historyControls);
				historyControls.appendChild(historyButton);
				this.historyTable.appendChild(historyRow);
				// remember the list item
				this.historyRows.push(historyRow);
			}
		};

		// events
		this.onOpened = function(evt) {
			// cancel the click
			if (evt) evt.preventDefault();
			// toggle the panel state
			this.element.className = this.element.className.replace(/-open|-closed/, /-open/.test(this.element.className) ? "-closed" : "-open");
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

		this.onCheckValues = function() {
			// disable the button, if any of the values is invalid
			this.addMealButton.disabled = (
				isNaN(parseInt(this.timeInput.value))
				|| isNaN(parseInt(this.dateInput.value))
				|| isNaN(parseInt(this.valueInput.value))
				|| this.labelInput.value === ""
			);
		};

		this.onAddMeal = function(evt) {
			// cancel the click
			evt.preventDefault();
			// figure out the time stamp
			var inputTime = this.timeInput.value.split(':');
			var inputDate = this.dateInput.value.split('-');
			var year = parseInt(inputDate[0]);
			var month = parseInt(inputDate[1]) - 1;
			var day = parseInt(inputDate[2]);
			var hours = inputTime[0];
			var date = new Date(year, month, day, hours);
			// retrieve the timeline entry
			var timelineEntry = parent.getTimeline(date);
			// add this meal at the given time
			timelineEntry.diet.push({
				label: this.labelInput.value,
				value: parseInt(this.valueInput.value)
			});
			// store the timeline entry
			parent.setTimeline(date, timelineEntry);
			// return to the history list
			this.onOpened();
		};

		this.element.addEventListener('submit', function (evt) { evt.preventDefault(); });
		this.opener.addEventListener('click', this.onOpened.bind(this));
		this.timeInput.addEventListener('change', this.onCheckValues.bind(this));
		this.dateInput.addEventListener('change', this.onCheckValues.bind(this));
		this.labelInput.addEventListener('change', this.onCheckValues.bind(this));
		this.valueInput.addEventListener('change', this.onCheckValues.bind(this));
		this.addMealButton.addEventListener('click', this.onAddMeal.bind(this));

	};

})();
