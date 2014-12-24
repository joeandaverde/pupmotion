var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var test_data = require('./data/test_data');
var threshold = 10000;

var Collector = function () {
   EventEmitter.call(this);
   this.buffer = [];
};

util.inherits(Collector, EventEmitter)

Collector.prototype.addPoints = function (points) {
	var aboveThreshold = _.some(_.values(points), function (v) {
		return v > threshold;
	});

	if (!aboveThreshold) {
		if (this.buffer.length > 0) {
			this.detectEvent();
			this.buffer.length = 0;
		}
	} else {
		this.buffer.push(points);
	}
};

Collector.prototype.end = function  () {
	this.detectEvent();
	this.buffer.length = 0;
};

Collector.prototype.detectEvent = function () {
	var leds = ["led1", "led2", "led3"];

	var maxes = _.reduce(this.buffer, function (acc, v) {
		_.each(leds, function (k) {
			if (!acc[k] || v[k] > acc[k].value) {
				acc[k] = { ticks: v.ticks, value: v[k] };
			}
		});
		return acc;
	}, {});

	if (maxes.led1.ticks > maxes.led3.ticks) {
		this.emit("inside");
	} else {
		this.emit("outside");
	}
};

var c = new Collector();

c.on('inside', function () {
	console.log('inside');
})

c.on('outside', function () {
	console.log('outside');
})

_.each(test_data, function (d) {
	c.addPoints(d);
});

c.end();