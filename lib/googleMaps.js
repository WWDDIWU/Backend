"use strict";
const request = require("request");

const apiKey = "AIzaSyDwsEmGI5qbp9se0DbuTJc8mK-tqloHczk";

function createGeoList(obj) {
    if(Array.isArray(obj)){
        let list = "";
        obj.forEach(function (e) {
            list += e.latitude + ',' + e.longitude + '|';
        });
        return list.substr(0, list.length -1);
    } else {
        return obj.latitude + ',' + obj.longitude;
    }
}

const distanceMatrix = function (start, end, options, callback){
    const lang = options.lang || "en-US";
    const mode = options.mode || "driving";
    const units = options.units || "metric";
    const startGeo = createGeoList(start);
    const endGeo = createGeoList(end);
    const uri = (function () {
        return ("https://maps.googleapis.com/maps/api/distancematrix/json?" +
                "origins=" + startGeo + "&" +
                "destinations=" + endGeo + "&" +
                "lang=" + lang + "&" +
                "mode=" + mode + "&" +
                "units=" + units + "&" +
                "key=" + apiKey);
    })();
    request(uri, callback);
};

exports = {
    distanceMatrix: distanceMatrix
};