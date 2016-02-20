"use strict";
const eventModel = require("../models/event");
const locationModel = require("../models/location");
const asyncjs = require("async");
const gmApi = require("../lib/googleMaps");

const TimeSequence = function (timeMatrix) {
    this.sequence = new Array(24*60);
    this.timeMatrix = timeMatrix;
    return this;
};

const TimeSequenceElement = function (type, id, location) {
    this.type = type;
    this.id = id;
    this.location = location;
    this.alternatives = [];
    return this;
};

Array.prototype.grep = function (element) {
    this.forEach(function (e, i) {
        if(e === element) {
            return i;
        }
    });
};

TimeSequence.prototype = {
    fill(start, end, element) {
        const filler = new TimeSequenceElement(element.type, element.id, element.location);
        for(let i = start; i <= end; i += 1) {
            if(this.sequence[i]) {
                this.sequence[i].alternatives.push(filler.id);
            } else {
                this.sequence[i] = filler;
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
            return this.timeMatrix[eventA.location][eventB.location];
        }
    },
    getEventList(){
        const list = [];
        this.sequence.forEach(function (e) {
            if(typeof e !== 'undefined'){
                if(list.lastElement().id !== e.id) {
                    list.push(e);
                }
            }
        });
        return list;
    },
    getTravelTimeArround (event) {
        const list = this.getEventList();
        const eventID = list.grep(event);
        return {
            before: this.getTravelTime(list[eventID - 1], event),
            after: this.getTravelTime(event, list[eventID + 1])
        };
    },
    addTravelTime(travelTime, start, location1, location2){
        const filler = new TimeSequenceElement(1337, 1337, [location1, location2]);
        this.fill(start, (start + travelTime), filler);
    },
    getEmptySpots() {
        const list = [];
        let index = 0;
        let last = 1;
        this.sequence.forEach(function (e, i) {
            if(last !== 0 && (typeof e === 'undefined' || e.type === 1337)) {
                list[index] = i;
                index += 1;
            }
            last = typeof e === 'undefined' ? 0 : 1;
        });
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
            eventID: 1,
            type: 0,
            priority: 0,
            title: "Test Event Termin",
            time: {
                start: "08:00",
                end: "17:00"
            },
            description: "",
            location: 2,
            suggestion: false
        },{
            eventID: 8,
            type: 1,
            priority: 1,
            title: "Test Event Aufgabe",
            time: {
                duration: 45
            },
            description: "",
            location: 2,
            suggestion: false
        },{
            eventID: 12,
            type: 0,
            priority: 2,
            title: "Test Event Termin 2",
            time: {
                start: "22:00",
                end: "23:00"
            },
            description: "",
            location: 1,
            suggestion: false
        },{
            eventID: 36,
            type: 1,
            priority: 2,
            title: "Test Event Aufgabe",
            time: {
                duration: 70
            },
            description: "",
            location: 1,
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
            locationID: 1,
            name: "Gablenberger Haupstr.",
            latitude: 48.776538,
            longitude: 9.203572
        }, {
            locationID: 2,
            name: "DHBW",
            latitude: 48.7846616,
            longitude: 9.1721437
        }
    ];
    callback(null, testLocations[id]);
}

const sortDay = function (day) {
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
        for(let g in typeGroups){
            const group = typeGroups[g];
            for(let t in group){
                group[t] = sortPriorityGroup(group[t], t);
            }
        }
        
        const startArray = [];
        const endArray = [];
        for (let location in locations) {
            startArray.push(location);
            endArray.push(location);
        }
        
        const options = {};
        let matrixX = 0;
        
        gmApi.distanceMatrix(startArray, endArray, options, function (err, response){
            response.rows.forEach(function (e, i) {
                timeMatrix[i] = e;
            });
        });
        
        const timeSequence = new TimeSequence(timeMatrix);
        
        typeGroups[0].forEach(function (prioGroup, i) {
            prioGroup.forEach(function (event) {
                timeSequence.fill(event.time.start.toIndex, event.time.end.toIndex, {type: event.type, id: event.id, location: event.location});
            });
        });
        
        let list = timeSequence.getEventList();
        list.forEach(function (event, i) {
            if(i !== 1){
                const travelTime = timeSequence.getTravelTime(list[i - 1], list[i]);
                const start = list[i].time.start.toIndex - travelTime;
                timeSequence.addTravelTime(travelTime, start, list[i - 1].location, list[i].location);
            }
        });
        
        const timeSlots = timeSequence.getEmptySpots();
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
                                length: length
                            });
                        }
                    }
                });
                
                let i = availableTimeSlots.length;
                const result = {
                    time: Infinity,
                    start: undefined,
                    prev: undefined,
                    next: undefined
                };
                while (--i) {
                    const slot = availableTimeSlots[i];
                    const prev = timeSequence.sequence[slot.start - 1];
                    const next = timeSequence.sequence[slot.start - 1];
                    const prevTravelTime = timeSequence.getTravelTime(prev.location, event.location);
                    const nextTravelTime = timeSequence.getTravelTime(next.location, event.location);
                    
                    if(prevTravelTime < nextTravelTime && prevTravelTime < result.time) {
                        if(prevTravelTime === 0) {
                            const travelTimeBeforeEvent = timeSequence.getTravelTimeArround(prev).before;
                            if(slot.length > (event.duration + travelTimeBeforeEvent)) {
                                result.time = prevTravelTime;
                                result.start = slot.start;
                                result.prev = prev;
                                result.next = undefined;
                                result.travelTimeBeforeEvent = travelTimeBeforeEvent;
                                result.travelTimeAfterEvent = undefined;
                            }
                        } else {
                            result.time = prevTravelTime;
                            result.start = slot.start;
                            result.prev = prev;
                            result.next = undefined;
                            result.travelTimeAfterEvent = undefined;
                            result.travelTimeBeforeEvent = undefined;
                        }    
                    }
                    if (nextTravelTime < result.time) {
                        if(nextTravelTime === 0) {
                            const travelTimeAfterEvent = timeSequence.getTravelTimeArround(prev).after;
                            if(slot.length > (event.duration + travelTimeAfterEvent)) {
                                result.time = nextTravelTime;
                                result.start = slot.end - nextTravelTime - duration;
                                result.prev = undefined;
                                result.next = next;
                                result.travelTimeAfterEvent = travelTimeAfterEvent;
                                result.travelTimeBeforeEvent = undefined;
                            }
                        } else {
                            result.time = nextTravelTime;
                            result.start = slot.end - nextTravelTime - duration;
                            result.prev = undefined;
                            result.next = next;
                            result.travelTimeAfterEvent = undefined;
                            result.travelTimeBeforeEvent = undefined;
                        }
                    }
                }
                
            });
        });
        
        
        
    });
    
};

exports = {
    sortDay: sortDay
};