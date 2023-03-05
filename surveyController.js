// required packages
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var fs = require('fs');

// read the data file
function readData(fileName){
    let dataRead = fs.readFileSync(__dirname+'/data/' + fileName + '.json');
    let infoRead = JSON.parse(dataRead);
    return infoRead;
}

// read the data file
function writeData(info, fileName){
    data = JSON.stringify(info);
    fs.writeFileSync('./data/' + fileName + '.json', data);
}

// update the data file, I use "name" to be equal to fruit, or animal or color
// to match with the file names
// I assume we always just add 1 to a single item
function combineCounts(name, value){
    // console.log(value);
    let info = readData(name);
     // will be useful for text entry, since the item typed in might not be in the list
    var found = 0;
    for (var i=0; i<info.length; i++){
        if (info[i][name] === value){
            info[i].count = parseInt(info[i].count) + 1;
            found = 1;
        }
    }
    if (found === 0){
        info.push({[name] : value, count: 1});
    }
    writeData(info, name);
}

// This is the controler per se, with the get/post
module.exports = function(app){

    // when a user goes to localhost:3000/analysis
    // serve a template (ejs file) which will include the data from the data files
    app.get('/analysis', function(req, res){
        var question1 = readData("firstname");
        var question2 = readData("lastname");
        var question3 = readData("exampleRadios");
        var question4 = readData("attractiveElements");
        var question5 = readData("siteUpdates");
        var question6 = readData("improvement");
        var question7 = readData("description");
        var question8 = readData("comment");
        res.render('showResults', {results: [question1, question2, question3, question4, question5, question6, question7, question8]});
        console.log([question1, question2, question3, question4, question5, question6, question7, question8]);
    });

    var express = require('express');
    // when a user goes to localhost:3000/niceSurvey
    // serve a static html (the survey itself to fill in)
    app.use(express.static(__dirname + '/public'));

    app.get('/niceSurvey', function(req, res){
        res.sendFile(__dirname+'/views/niceSurvey.html');
 });

    // when a user types SUBMIT in localhost:3000/niceSurvey 
    // the action.js code will POST, and what is sent in the POST
    // will be recuperated here, parsed and used to update the data files
    app.post('/niceSurvey', urlencodedParser, function(req, res){
        var json = req.body;
        for (var key in json){
            console.log(key + ": " + json[key]);
            // in the case of checkboxes, the user might check more than one
            if (((key === "attractiveElements") || (key === "siteUpdates")  || (key === "description")) && (json[key].length >= 2)){
                for (var item in json[key]){
                    combineCounts(key, json[key][item]);
                }
            }
            else {
                combineCounts(key, json[key]);
            }
        }
        // mystery line... (if I take it out, the SUBMIT button does change)
        // if anyone can figure this out, let me know!
        res.sendFile(__dirname + "/views/niceSurvey.html");
    });
};