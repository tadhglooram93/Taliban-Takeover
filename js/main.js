// Init global variables
let myBubbles,
    myDiffBars,
    myLine,
    myDraw,
    myGravBubbles,
    AfghaMap,
    ConflictData,
    network


let parseDate = d3.timeParse("%Y");

// Load data using promises
let promises = [

    d3.csv("./data/cleaned/humanitarian/grouped_funding_req.csv", row => {
        row.requirements = +row.requirements;
        row.funding = +row.funding;
        row.percent_funded = +row.percent_funded;
        return row
    }),

    d3.csv("./data/cleaned/public opinion/public_opinion.csv", d => {
        d.Date = parseDate(d.Date);
        d.Value = +d.Value;
        return d
    }),

    d3.csv("./data/cleaned/humanitarian/grouped_donor_updated.csv", d => {
        d.amountUSD = +d.amountUSD;
        return d
    }),

    d3.json("./data/cleaned/combined.json"),

    d3.csv("./data/cleaned/taliban_takeover.csv"),

    d3.csv("./data/cleaned/conflict_map_data.csv"),

    d3.json("./data/cleaned/fatalities_network.json")


];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    }).catch(function (err) {
    console.log(err)
});

// InitMainPage
function initMainPage(dataArray) {

    // Init Map
    AfghaMap = new MapVis('AfghMap', dataArray[3],dataArray[4]);

    // Init conflict map
    ConflictData = new MapVis2('conflictmap', dataArray[3],dataArray[5]);

    // Init network
    network = new networkgraph('network', dataArray[6]);

    // Init bubbles
    myBubbles = new Bubbles("bubbleDiv", dataArray[0]);

    // Init diff bars
    myDiffBars = new DiffBars("diffDiv", dataArray[0]);

    // Init line chart
    myLine = new Line("lineDiv", dataArray[0]);

    // Init draw chart
    myDraw = new Draw("history-line", dataArray[1]);

    // Init gravbubbles
    myGravBubbles = new GravBubbles("grav-bubbles", dataArray[2]);

}

