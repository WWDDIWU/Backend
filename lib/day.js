"use strict";
const eventModel = require("../models/event");
const locationModel = require("../models/location");
const asyncjs = require("async");
const gmApi = require("../lib/googleMaps");

//Convert from Time String ("17:00") to Minutes
String.prototype.toIndex = function () {
    const split = this.split(':');
    return parseInt(split[0], 10) * 60 + parseInt(split[1], 10);
};

//Make sure String is 2 Letters Long
String.prototype.to2 = function () {
    return this.length === 2 ? this : '0' + this;
};

//Convert from Minutes to Time String
Number.prototype.toTime = function () {
    const h = Math.floor(this/60);
    const m = this - (h * 60);
    return h.toString().to2() + ':' + m.toString().to2();
};

//Get last element from Array
Array.prototype.lastElement = function () {
    return this[this.length - 1];
};

const SequenceList = function (travelMatrix) {
    this.sequence = [];
    this.travelMatrix = travelMatrix;
    return this;
};

SequenceList.prototype = {
    //Sort sequence Elments by startpoint
    sortSequence () {
        this.sequence.sort(function (a, b) {
            return a.firstStart - b.firstStart; 
        });
    },
    //Merge Sequences, which happen at the same location and consecutively
    mergeSequences () {
        let lastListElement;
        this.sequence.forEach((e, i) => {
            if (lastListElement && e.locationID === lastListElement.locationID && e.firstStart > lastListElement.lastEnd) {
                e.pushEvent(lastListElement.sequence);
                delete this.sequence[this.sequence.indexOf(lastListElement)];
            } else if(lastListElement && e.locationID === lastListElement.locationID) {
                lastListElement.createAlternativeSequence(e.sequence);
                delete this.sequence[this.sequence.indexOf(e)];
                e = lastListElement;
            }
            lastListElement = e;
        });
        this.updateTravelTime();
    },
    //Update travel time attribute of each SequenceElement in regard to the time needed to travel from current to next Location
    updateTravelTime () {
        const self = this;
        this.sequence.forEach(function (e, i) {
            if(self.sequence[i + 1]) {
                e.travelTimeToNext = Math.ceil(self.travelMatrix[e.locationID][self.sequence[i + 1].locationID].duration.value / 60);
            } else {
                e.travelTimeToNext = 0;
            }
        })  ;
    },
    //Add Event to SequenceElement, if no suitable Element exists, create one
    addEvent (event) {
        let element = this.findElement(event.locationID, event.time.start, event.time.end);
        if(element === null) {
            element = new SequenceElement(event.location, this);
            this.sequence.push(element);
        }
        element.pushEvent(event);
        this.sortSequence();
        this.updateTravelTime();
    },
    //Find suitable SequenceElement for Event, regarding location, start, end
    findElement (locationID, start, end) {
        const self = this;
        this.sequence.forEach(function (e, i) {
            if(e.locationID === locationID) {
                const lastEnd = self.sequence[i - 1] ? self.sequence[i - 1].lastEnd.toIndex() : -1;
                const firstStart = self.sequence[i + 1] ? self.sequence[i + 1].firstStart.toIndex() : Infinity;
                if(lastEnd < start && end < firstStart) {
                    return e;
                }
            }
        });
        return null;
    },
    //Get all Elements in the sequence
    findAllElements (locationID) {
        const list = [];
        this.sequence.forEach(function (e, i) {
            if(e.locationID === locationID) {
                list.push(e);
            }
        });
        return list;
    }
};

const SequenceElement = function (locationID, sequenceList) {
    this.locationID = locationID;
    this.firstStart = 0;
    this.lastEnd = 0;
    this.travelTimeToNext = 0;
    this.sequenceList = sequenceList.sequence;
    this.sequence = [];
    return this;
};

SequenceElement.prototype = {
    //Updates time propertys (firstStart, lastEnd) with start of first event and end of last event
    updateTimePropertys () {
        this.firstStart = this.sequence[0].time.start.toIndex();
        this.lastEnd = this.sequence.lastElement().time.end.toIndex();
    },
    //Sort events in sequence regarding their start time
    sortSequence () {
        this.sequence.sort(function (a, b){
            return a.time.start.toIndex() - b.time.start.toIndex();   
        });
    },
    //push Event/List of Events into the Sequence Array
    pushEvent (event) {
        if (Array.isArray(event)) {
            event.forEach((e) => {
                this.sequence.push(e);
            });
        } else {
            this.sequence.push(event);
        }
        this.sortSequence();
        this.updateTimePropertys();
    },
    //Find location of next Element in Parent SequenceList
    findNextLocation (id, direction) {
        const sequence = this.sequenceList;
        const loc = sequence[id].location;
        let i = id + direction;
        while(sequence[i] && sequence[i].location === loc){
            i += direction;
        }
        return sequence[i - direction];
    },
    //Get suitable Startpoint for Task Event (Type: 1)
    addTask (event) {
        let start = false;
        let rest = Infinity;
        
        //Check Space between Events currently in the Sequence
        this.sequence.forEach(function (e, i) {
            if (i !== 0) {
                const length = this.sequence[i].time.end - this.sequence[i - 1].time.start;
                if(length > event.time.duration && rest > length - event.time.duration) {
                        rest = length - event.time.duration;
                        start = this.sequence[i].time.end + 1;
                }
            }
        });
        
        //Get Index of this SequenceElement in the Parent SequenceList
        const id = this.sequenceList.indexOf(this);
        
        //Get SequenceElements next to current Element with different location
        const prev = this.findNextLocation(id, -1);
        const next = this.findNextLocation(id, 1);
        
        //Check Time between previous and current Element, to see if event suits in
        if (prev) {
            const length = this.firstStart - prev.lastEnd - prev.travelTimeToNext;
            if (length > event.time.duration && rest > length - event.time.duration) {
                rest = length - event.time.duration;
                start = this.firstStart - event.time.duration - 1;
            }
        }
        
        //Check Time between next and current Element, to see if event suits in
        if (next) {
            const length = next.firstStart - this.lastEnd - this.travelTimeToNext;
            if (length > event.time.duration && rest > length - event.time.duration) {
                rest = length - event.time.duration;
                start = this.lastEnd + 1;
            }
        }
        return start;
    },
    //Whilst merging different SequenceElements (see SequenceList) Elements at the same Timespots get put together in 1 Element with alternativeSequences
    createAlternativeSequence (events) {
        if(!this.alternativeSequences) this.alternativeSequences = [];
        const helper = [];
        events.forEach(function (e) {
            helper.push(e);
        });
        this.alternativeSequences.push(helper);
    }
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

//Fetches event by id
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
            title: "Test Event Aufgabe 2",
            time: {
                duration: 70
            },
            description: "",
            location: 0,
            suggestion: false
        },{
            eventID: 4,
            type: 0,
            priority: 1,
            title: "Test Event Termin 2",
            time: {
                start: "10:00",
                end: "12:00"
            },
            description: "",
            location: 0,
            suggestion: false
        },{
            eventID: 5,
            type: 3,
            priority: 1,
            title: "Test Event Termin 2",
            time: {
                start: "20:00",
                end: "21:00"
            },
            description: "",
            location: 1,
            suggestion: false
        }
    ];
    callback(null, testEvents[id]);
}

//Fetches location by id
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
    
    //Get Event Info for Event IDs in Day
    asyncjs.forEachOf(events, function(e, i, done) {
        getEvent(events[e], function(err, event) {
            if(err) {
                console.error(err);
            }
            
            //Sort Event into Type->Priority Array
            event.arrayID = i;
            if(!typeGroups[event.type]) {
                typeGroups[event.type] = [];
            }
            if(!typeGroups[event.type][event.priority]) {
                typeGroups[event.type][event.priority] = [];
            }
            typeGroups[event.type][event.priority].push(event);
            
            //Get Location from LocationID in Event, if not already saved
            if(!locations[event.location]){    
                getLocation(event.location, function (err, location) {
                    if(err) {
                        console.error(err);
                    }
                    locations[event.location] = location;
                    done();
                });
            } else {
                done();
            }
        });
    }, function() {
        //Sort Events in Typegroups by Startpoint
        typeGroups.forEach(function (g, i) {
           g.forEach(function (e, j) {
               typeGroups[i][j] = sortPriorityGroup(typeGroups[i][j], j);
           });
        });
        
        //Put Locations in 2 Arrays
        const startArray = [];
        const endArray = [];
        for (let location in locations) {
            startArray.push(locations[location]);
            endArray.push(locations[location]);
        }
        const options = {};
        let matrixX = 0;
        
        //Use Location Arrays to requst DistanceMatrix from Google Maps API
        gmApi.distanceMatrix(startArray, endArray, options, function (err, response){
            response = JSON.parse(response);
            response.rows.forEach(function (e, i) {
                timeMatrix[i] = e.elements;
            });
            
            //Create new SequenceList Object
            const sequenceList = new SequenceList(timeMatrix);
            
            //Fill SequenceList with Appointment Events (Type: 0)
            if (Array.isArray(typeGroups[0])) {
                typeGroups[0].forEach(function (prioGroup) {
                    prioGroup.forEach(function (event) {
                        sequenceList.addEvent(event);
                    });
                });
            }
            
            //Fill SequenceList with Task Events (Type: 1)
            if (Array.isArray(typeGroups[1])) {              
                typeGroups[1].forEach(function (prioGroup) {
                    prioGroup.forEach(function (event) {
                        const elements = sequenceList.findAllElements(event.location);
                        for(let eID in elements) {
                            const e = elements[eID];
                            const start = e.addTask(event);
                            if(start) {
                                event.time.start = start.toTime();
                                event.time.end = (start + event.time.duration).toTime();
                                e.pushEvent(event);
                                break;
                            }
                        }
                    });
                });
            }
            
            //Fill SequenceList with Duty Events (Type: 3)
            if (Array.isArray(typeGroups[3])) {    
                typeGroups[3].forEach(function (prioGroup) {
                    prioGroup.forEach(function (event) {
                        sequenceList.addEvent(event);
                    });
                });
            }
            
            const _sequence = [];
            const _ttgfatb = [];
            sequenceList.mergeSequences();
            
            //Create Arrays for Callback with, SequenceElements (DB) and TTGFATB Elements (DB)
            sequenceList.sequence.forEach(function (locationList, i) {
                locationList.sequence.forEach(function (event) {
                    _sequence.push({
                        type: 0,
                        id: event.arrayID,
                        time: event.time.start,
                        location: event.location,
                        referenceID: event.eventID
                    });
                });
                _ttgfatb.push({
                    time: locationList.travelTimeToNext
                });
                _sequence.push({
                    type: 1,
                    referenceID: i
                });
            });
            console.log(_sequence);
            callback(null, _sequence, _ttgfatb);
        });
        
    });
    
};

exports.sortDay = sortDay;