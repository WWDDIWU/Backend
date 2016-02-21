"use strict";
const eventModel = require("../models/event");
const locationModel = require("../models/location");
const asyncjs = require("async");
const gmApi = require("../lib/googleMaps");

Array.prototype.grep = function (element) {
    return this.indexOf(element);
};

const TimeSequenceElement = function (type, id, location, start, end) {
    this.type = type;
    this.id = id;
    this.location = location;
    this.start = start;
    this.end = end;
    this.alternatives = [];
    return this;
};

String.prototype.toIndex = function () {
    const split = this.split(':');
    return parseInt(split[0]) * 60 + parseInt(split[1]);
};

const TimeSequence = function (timeMatrix) {
    this.sequence = new Array(24*60);
    this.timeMatrix = timeMatrix;
    return this;
};

TimeSequence.prototype = {
    fill(start, end, element) {
        console.log(element.id, ' : ', start, end);
        const filler = element instanceof TimeSequenceElement ? element : new TimeSequenceElement(element.type, element.id, element.location, element.start, element.end);
        for(let i = start; i <= end; i += 1) {
            if (!this.sequence[i]) {
                this.sequence[i] = filler;
            } else if (this.sequence[i] && this.sequence[i].alternatives.grep(filler.id) !== -1) {
                this.sequence[i].alternatives.push(filler.id);
            }
        }
    },
    getTravelTime (eventA, eventB) {
        if(Array.isArray(eventB)){
            const result = {
                time: Infinity,
                id: undefined
            };
            eventB.forEach(function (e) {
                const time = this.timeMatrix[eventA.location][e.location];
                if(time < result.time){
                    result.time = time;
                    result.id = e.id;
                }
            });
            return result;
        } else {
            return Math.ceil(this.timeMatrix[eventA.location][eventB.location].duration.value / 60);
        }
    },
    getEventList(){
        let list = [];
        this.sequence.forEach(function (e, i) {
            e.i = i;
            if(!list.lastElement()){
                list.push(e);
            } else if (list.lastElement().id !== e.id) {
                list.push(e);
            }
        });
        return list;
    },
    addTravelTime(travelTime, start, location1, location2){
        const filler = new TimeSequenceElement(1337, 1337, [location1, location2], start, (start + travelTime));
        this.fill(start, (start + travelTime), filler);
    },
    getEmptySlots() {
        const list = [];
        let last = 1;
        for(let i = 0; i < this.sequence.length; i += 1){
            const e = this.sequence[i];
            const q = e ? 1 : 0;//e ? (e.type === 1337 ? 0 : 1) : 0;
            if(q === 0 && last !== q){
                list.push(list.length%2 === 0 ? i : i-2);
            }
            last = q;
            if (i === this.sequence.length - 1 && !e) {
                list.push(i);
            }
        }
        return list;
    }
};

Array.prototype.lastElement = function () {
    return this[this.length - 1];
};

const SequenceElement = function(type, id) {
    this.type = type;
    this.id = id;
    return this;
};

//Sort Type Groups by start / duration / start -> duration
function sortPriorityGroup(group, type) {
    String.prototype.toInt = function () {
        return this.split(":").join("");
    };
    
    if(type === 0 || type === 3) {
        group.sort(function (a,b) {
            return a.time.start.toInt - b.time.start.toInt;
        });
    } else if (type === 1) {
        group.sort(function (a,b) {
            return b.time.duration - a.time.duration;
        });
    } else {
        group.sort(function (a,b) {
            const startCheck = a.time.start.toInt - b.time.start.toInt;
            if(startCheck === 0){
                return a.time.duration - b.time.duration;
            }
            return startCheck;
        });
    }
    return group;
}

function getEvent (id, callback) {
    //eventModel.findOne({ 'eventID': id }, function (err, event) {
    //    if (err) {
    //        callback(err);
    //    }
    //    callback(null, event);
    //});
    const testEvents = [
        {
            eventID: 0,
            type: 0,
            priority: 0,
            title: "Test Event Termin",
            time: {
                start: "08:00",
                end: "17:00"
            },
            description: "",
            location: 0,
            suggestion: false
        },{
            eventID: 1,
            type: 1,
            priority: 0,
            title: "Test Event Aufgabe",
            time: {
                duration: 45
            },
            description: "",
            location: 1,
            suggestion: false
        },{
            eventID: 2,
            type: 0,
            priority: 1,
            title: "Test Event Termin 2",
            time: {
                start: "22:00",
                end: "23:00"
            },
            description: "",
            location: 1,
            suggestion: false
        },{
            eventID: 3,
            type: 1,
            priority: 1,
            title: "Test Event Aufgabe",
            time: {
                duration: 70
            },
            description: "",
            location: 0,
            suggestion: false
        }
    ];
    callback(null, testEvents[id]);
}

function getLocation (id, callback) {
    //locationModel.findOne({ 'locationID': id }, function (err, location) {
    //    if (err) {
    //        callback(err);
    //    }
    //    callback(null, location);
    //});
    const testLocations = [
        {
            locationID: 0,
            name: "Gablenberger Haupstr.",
            latitude: 48.776538,
            longitude: 9.203572
        }, {
            locationID: 1,
            name: "DHBW",
            latitude: 48.7846616,
            longitude: 9.1721437
        }
    ];
    callback(null, testLocations[id]);
}

const sortDay = function (day, callback) {
    const events = day.events;
    const typeGroups = [];
    const sequence = day.sequence;
    const locations = {};
    const timeMatrix = [];
    
    asyncjs.forEachOf(events, function(e, i, done) {
        getEvent(events[e], function(err, event) {
            if(err) {
                throw err; //TO DO error handling
            }
            if(!typeGroups[event.type]) {
                typeGroups[event.type] = [];
            }
            if(!typeGroups[event.type][event.priority]) {
                typeGroups[event.type][event.priority] = [];
            }
            typeGroups[event.type][event.priority].push(event);
            if(!locations[event.location]){    
                getLocation(event.location, function (err, location) {
                    if(err) {
                        throw err; //TO DO error handling
                    }
                    locations[event.location] = location;
                    done();
                });
            } else {
                done();
            }
        });
    }, function() {
        typeGroups.forEach(function (g, i) {
           g.forEach(function (e, j) {
               typeGroups[i][j] = sortPriorityGroup(typeGroups[i][j], j);
           });
        });
        
        const startArray = [];
        const endArray = [];
        for (let location in locations) {
            startArray.push(locations[location]);
            endArray.push(locations[location]);
        }
        const options = {};
        let matrixX = 0;
        
        gmApi.distanceMatrix(startArray, endArray, options, function (err, response){
            response = JSON.parse(response);
            response.rows.forEach(function (e, i) {
                timeMatrix[i] = e.elements;
            });
            
            const timeSequence = new TimeSequence(timeMatrix);
            
            typeGroups[0].forEach(function (prioGroup, i) {
                prioGroup.forEach(function (event) {
                    timeSequence.fill(event.time.start.toIndex(), event.time.end.toIndex(), {type: event.type, id: event.eventID, location: event.location, start: event.time.start, end: event.time.end});
                });
            });
            
            let list = timeSequence.getEventList();
            list.forEach(function (event, i) {
                if(i !== 0){
                    const travelTime = timeSequence.getTravelTime(list[i - 1], list[i]);
                    const start = list[i].start.toIndex() - travelTime - 1;
                    timeSequence.addTravelTime(travelTime, start, list[i - 1].location, list[i].location);
                }
            });
            
            const timeSlots = timeSequence.getEmptySlots();
            typeGroups[1].forEach(function (prioGroup) {
                prioGroup.forEach(function (event) {
                    const duration = event.time.duration;
                    const availableTimeSlots = [];
                    timeSlots.forEach(function (slot, i) {
                        if(i%2 !== 0) {
                            const length = timeSlots[i] - timeSlots[i - 1];
                            if (length >= duration) {
                                availableTimeSlots.push({
                                    start: timeSlots[i - 1],
                                    end: timeSlots[i],
                                    length: length,
                                    prev: timeSequence.sequence[timeSlots[i - 1] - 1],
                                    next: timeSequence.sequence[timeSlots[i] + 1]
                                });
                            }
                        }
                    });
                    const result = {
                        time: Infinity
                    };
                    availableTimeSlots.forEach(function (slot) {
                        if (slot.prev) {
                            let prevTravelTime = timeSequence.getTravelTime(slot.prev, event);
                            if(result.time > prevTravelTime && slot.length > (event.time.duration + prevTravelTime)) {
                                result.time = prevTravelTime;
                                result.nextTo = slot.prev;
                            }
                        }
                        if (slot.next) {
                           let nextTravelTime = timeSequence.getTravelTime(slot.next, event);
                           if(result.time > nextTravelTime && slot.length > (event.time.duration + nextTravelTime)) {
                                result.time = nextTravelTime;
                                result.nextTo = slot.next;
                            }
                        }
                    });
                    let end = result.nextTo.start.toIndex() - 1;
                    let start = end - event.time.duration;
                    if(end < 480) {
                        start = result.nextTo.end.toIndex() + 1;
                        end = start + event.time.duration;
                    }
                    timeSequence.fill(
                        start,
                        end, {
                            type: event.type,
                            id: event.eventID,
                            location: event.location,
                            start: start,
                            end: end
                    });
                });
            });
            callback(timeSequence.sequence);
        });
        
    });
    
};

exports.sortDay = sortDay;