'use strict';

const mongoose = require("mongoose");

function validateMongoDbID(id) {
    return true;
}

//LocationID definition
function LocationID(key, options) {
    mongoose.SchemaType.call(this, key, options, 'LocationID');
}

LocationID.prototype = Object.create(mongoose.SchemaType.prototype);

LocationID.prototype.cast = function(val) {
    if (!validateMongoDbID(val)) {
        throw new mongoose.SchemaType.CastError('LocationID ', val + ' is not valid');
    }
    return val;
};

mongoose.Schema.Types.LocationID = LocationID;

//EventID definition
function EventID(key, options) {
    mongoose.SchemaType.call(this, key, options, 'EventID');
}

EventID.prototype = Object.create(mongoose.SchemaType.prototype);

EventID.prototype.cast = function(val) {
    if (!validateMongoDbID(val)) {
        throw new mongoose.SchemaType.CastError('EventID ', val + ' is not valid');
    }
    return val;
};

mongoose.Schema.Types.EventID = EventID;

//UserID definition
function UserID(key, options) {
    mongoose.SchemaType.call(this, key, options, 'UserID');
}

UserID.prototype = Object.create(mongoose.SchemaType.prototype);

UserID.prototype.cast = function(val) {
    if (!validateMongoDbID(val)) {
        throw new mongoose.SchemaType.CastError('UserID ', val + ' is not valid');
    }
    return val;
};

mongoose.Schema.Types.UserID = UserID;

//SequenceElementID definition
function SequenceElementID(key, options) {
    mongoose.SchemaType.call(this, key, options, 'SequenceElementID');
}

SequenceElementID.prototype = Object.create(mongoose.SchemaType.prototype);

SequenceElementID.prototype.cast = function(val) {
    if (!validateMongoDbID(val)) {
        throw new mongoose.SchemaType.CastError('SequenceElementID ', val + ' is not valid');
    }
    return val;
};

mongoose.Schema.Types.SequenceElementID = SequenceElementID;

//TtgfatbID definition
function TtgfatbID(key, options) {
    mongoose.SchemaType.call(this, key, options, 'TtgfatbID');
}

TtgfatbID.prototype = Object.create(mongoose.SchemaType.prototype);

TtgfatbID.prototype.cast = function(val) {
    if (!validateMongoDbID(val)) {
        throw new mongoose.SchemaType.CastError('TtgfatbID ', val + ' is not valid');
    }
    return val;
};

mongoose.Schema.Types.TtgfatbID = TtgfatbID;

//DayID definition
function DayID(key, options) {
    mongoose.SchemaType.call(this, key, options, 'DayID');
}

DayID.prototype = Object.create(mongoose.SchemaType.prototype);

DayID.prototype.cast = function(val) {
    if (!validateMongoDbID(val)) {
        throw new mongoose.SchemaType.CastError('DayID ', val + ' is not valid');
    }
    return val;
};

mongoose.Schema.Types.DayID = DayID;

//Time definition
function Time(key, options) {
    mongoose.SchemaType.call(this, key, options, 'Time');
}

Time.prototype = Object.create(mongoose.SchemaType.prototype);

Time.prototype.cast = function(val) {
    const dur = val.duration || null;
    const start = val.start || null;
    const end = val.end || null;

    const timeIsValid = function () {
        if(dur && !start && !end) {
			 return true;
		 }
        if(!dur && start && end) {
			return true;
		}
        if(!dur && start && !end){
			return true;
		}

        return false;
    };
    if (!timeIsValid()) {
        throw new mongoose.SchemaType.CastError('Time ', val + ' is not valid');
    }
    return val;
};

mongoose.Schema.Types.Time = Time;

//Checksum definition
function Checksum(key, options) {
    mongoose.SchemaType.call(this, key, options, 'Checksum');
}

Checksum.prototype = Object.create(mongoose.SchemaType.prototype);

Checksum.prototype.cast = function(val) {
    const checksumIsValid = true;
    if (!checksumIsValid) {
        throw new mongoose.SchemaType.CastError('Checksum ', val + ' is not valid');
    }
    return val;
};

mongoose.Schema.Types.Checksum = Checksum;

module.exports = {
    LocationID,
    EventID,
    UserID,
    DayID,
    Time,
    Checksum
};
