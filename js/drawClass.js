class Draw {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create margins
        vis.margin = {top: 40, right: 100, bottom: 70, left: 85};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width + (vis.margin.right);
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - (vis.margin.top + vis.margin.bottom);

        // Adds the svg canvas
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width - vis.margin.left - vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Set the ranges
        vis.x = d3.scaleTime().range([0, vis.width - 3 * vis.margin.right]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // Define the line
        vis.opinionLine = d3.line()
            .x(function(d) { return vis.x(d.Date); })
            .y(function(d) { return vis.y(d.Value); })
            .curve(d3.curveMonotoneX);

        // Scale the range of the data
        vis.x.domain(d3.extent(vis.data, function(d) { return d.Date; }));
        vis.y.domain([0, 1]);

        // set the color scale
        vis.color = d3.scaleOrdinal(["#286CFF","#6F7B7F","#DC9464","#274f53ff",
            "#DE4C44", "#5D7869", "#215a30"]);

        // Add the X Axis
        vis.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.x));

        // Add the Y Axis
        vis.svg.append("g")
            .attr("class", "axis")
            .call(
                d3.axisLeft()
                    .scale(vis.y)
                    .tickFormat(d3.format(".0%")));

        // Draw gridlines
        for (let i = 0; i < 11; i++) {
            vis.svg.append("line")
                .attr("x1", 0)
                .attr("x2", vis.width - 3 * vis.margin.right)
                .attr("y1", vis.y(i / 10))
                .attr("y2", vis.y(i / 10))
                .attr("stroke", "gray")
                .attr("stroke-width", "0.15");
        }

        // Timeline annotations
        let keyDates = [
            new Date(2014, 0, 0),
            new Date(2017, 0, 0),
            new Date(2019, 0, 0),
            new Date(2021, 0, 0)
        ];

        let keyEvents = [
            "Afghan Security Forces Takeover",
            "Rise of ISIS and Taliban",
            "Peace talks end",
            "U.S. withdrawal"
        ]

        for (let i = 0; i < keyDates.length; i++) {
            vis.svg.append("line")
                .attr("x1", vis.x(keyDates[i]))
                .attr("x2", vis.x(keyDates[i]))
                .attr("y1", vis.y(0))
                .attr("y2", vis.y(0.04))
                .attr("stroke", "#f08080")
                .attr("opacity", 0.75)
                .attr("stroke-width", "1.5");

            vis.svg.append("circle")
                .attr("cx", vis.x(keyDates[i]))
                .attr("cy", vis.y(0.04))
                .attr("r", 2)
                .attr("fill", "#f08080")
                .attr("opacity", 0.75)
                .attr("stroke", "#f08080");

            vis.svg.append("text")
                .attr("x", vis.x(keyDates[i]) + 1)
                .attr("y", vis.y(0.05))
                .attr("fill", "#f08080")
                .attr("opacity", 0.75)
                .attr("text-anchor", "end")
                .attr("font-size", "11px")
                .text(keyEvents[i]);
        }

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Get selected poll question
        vis.selectedQ = document.getElementById('categorySelector').value;

        // console.log("data", vis.data)

        // Slice data to selected Q
        vis.slicedData = vis.data.filter(d => d.Question == vis.selectedQ);

        // console.log("slicedData", vis.slicedData)

        // Group the entries by question
        vis.dataNest = Array.from(
            d3.group(vis.data, d => d.Question), ([key, value]) => ({key, value})
        );

        // console.log("dataNest", vis.dataNest)

        vis.bisectDate = d3.bisector(d=>d.year).left;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // spacing for the legend
        vis.legendSpace = vis.width / vis.dataNest.length;

        // Draw beginning of trend
        vis.displayData = vis.slicedData.slice(0, 7);

        // console.log("displayData", vis.displayData)

        d3.selectAll("path.drawLine").remove();
        d3.selectAll("text.label").remove();
        d3.selectAll("path.trendlines").remove();
        d3.select(".historyinitline").remove();
        vis.firstQ = vis.svg.append("path")
            .attr('class','historyinitline')
            .datum(vis.displayData)
            .transition()
            .duration(400)
            .attr("d", vis.opinionLine)
            .attr("fill", "none")
            .attr("id", "display")
            .attr('stroke',"red")
            .attr('stroke-width',2);

        // Create y label
        vis.svg.append("text")
            .attr("text-anchor", "end")
            .attr("class", "label")
            .attr("font-size","20px")
            .attr("fill","#6F7B7F")
            .attr("x", 0)
            .attr("y", -65)
            .text("% of Respondents")
            .attr("transform", function (d) {
                return "rotate(-90)"
            });

        // Create question text
        $("#drawTextQQ").css('opacity','1');
        d3.select("text.questionTitle2").remove();
        d3.select("#drawTextQQ2").append("text")
            .attr('class','questionTitle2')
            .attr('x',140)
            .attr('y',-10)
            .attr("font-size", 20)
            .attr("fill", "darkblue")
            .text(vis.selectedQ);

        // Prompt to draw trendline in chart
        d3.select("text.historyinitlinetext0").remove();
        vis.svg.append("text")
            .attr('class','historyinitlinetext0')
            .attr('x',160)
            .attr('y', vis.y(vis.displayData[6].Value) - 60)
            .attr("font-size", 18)
            .attr("fill", "#228075")
            .text("Draw the rest of the trend line here");

        // All QQ Data and text to show when "Show Actual Trend" button clicked
        d3.select("path.historyinitline2").remove();
        vis.allQ = vis.svg.append("path")
            .attr('class','historyinitline2')
            .datum(vis.slicedData)
            .attr("d", vis.opinionLine)
            .attr("fill", "none")
            .attr("id", "display")
            .attr('stroke',"#f93700ff")
            .attr('stroke-width',3)
            .attr('display','none');

        // Hide details about answer, it will show later when button is clicked
        $("#drawTextANS2").css("display", "none");
        d3.select("text.historyinitlinetext1").remove();
        d3.select("#drawTextANS2").append("text")
            .attr('class','historyinitlinetext1')
            .text(vis.displayData[0].Text);

        // Hide other answer text, it will show later when button is clicked
        $("#drawTextANS").css("display", "none");
        d3.select("text.historyinitlinetext2").remove();
        d3.select("#drawTextANS").append("text")
            .attr('class','historyinitlinetext2')
            .text('Select another topic or click "Reveal All Trends" to show trends for all questions.');

        // Behavior for button clicks
        $("#history-line-button").click(showAns);
        $("#history-line-action").html('Draw the rest of the trendline in the chart. Click "Show Actual Trend" when you are done');
        $("#history-line-button").css('opacity','1');
        $("#redraw-button").css('opacity','1');
        $("#all-trends-button").css('opacity','0');

        // Function to hide/show content when Show Actual Trend button is clicked
        function showAns(){
            $(".historyinitline").fadeOut(500);
            $(".historyinitlinetext0").fadeOut(500);
            $(".historyinitline2").fadeIn(500);
            $(".historyinitlinetext1").fadeIn(1200);
            $(".historyinitlinetext2").fadeIn(1200);

            $("#drawTextANS").fadeIn(1200);
            $("#drawTextANS2").fadeIn(1200);

            $("#redraw-button").css('opacity','0.3');
            $("#history-line-button").css('opacity','0.3');
            $("#all-trends-button").css('opacity','1');

            $("#history-line-action").html('Select another topic from the dropdown or click "Reveal All Trends" to show trends for all questions.');

            $("#all-trends-button").click(showAll);
        }

        // Function to hide/show content when Reveal All Trends button is clicked
        function showAll() {

            // Remove lines and text
            $(".historyinitline2").fadeOut(500);
            $(".historyinitlinetext1").fadeOut(500);
            $(".historyinitlinetext2").fadeOut(500);
            $(".history-line-action-all").remove();


            // Remove drawing
            d3.selectAll("path.drawLine").remove();

            // Remove other text
            d3.select("text.questionTitle").remove();
            d3.select("text.questionTitle2").remove();
            $("#all-trends-button").css('opacity','0');
            $("#drawTextQQ").css('opacity','0');


            // To show all trends, loop through each symbol / key and draw
            vis.svg.selectAll(".trendlines")
                .data(vis.dataNest)
                .enter()
                .append("path")
                .attr("class", "trendlines")
                .transition()
                .duration(400)
                .style("stroke", function(d) { // Add the colours dynamically
                    return d.color = vis.color(d.key); })
                .attr("stroke-width", 3)
                .style("fill","none")
                .style("opacity", 0.2)
                .attr("id", d => 'tag'+d.key.replace(/\s+/g, '')) // assign an ID
                .attr("d", d => vis.opinionLine(d.value));

            $("#trend-text-reveal").css('display','block');

            // Create QQ labels for each trendline when all trends revealed
            vis.svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","15px")
                .attr("fill","#286CFF")
                .attr("x", vis.width - 3 * vis.margin.right)
                .attr("y",vis.y(vis.dataNest[0].value[16].Value) - 7).attr('fill-opacity',0.5)
                .text("% Suffering").attr('display','none');

            vis.svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","15px")
                .attr("fill","#6F7B7F")
                .attr("x", vis.width - 3 * vis.margin.right)
                .attr("y",vis.y(vis.dataNest[1].value[16].Value) - 7).attr('fill-opacity',0.5)
                .text("% Want to leave permanently").attr('display','none');

            vis.svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","15px")
                .attr("fill","#DC9464")
                .attr("x", vis.width - 3 * vis.margin.right)
                .attr("y",vis.y(vis.dataNest[2].value[16].Value) - 7).attr('fill-opacity',0.5)
                .text("% Believe women are mistreated").attr('display','none');

            vis.svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","15px")
                .attr("fill","#274f53ff")
                .attr("x", vis.width - 3 * vis.margin.right)
                .attr("y",vis.y(vis.dataNest[3].value[16].Value) - 7).attr('fill-opacity',0.5)
                .text("% Difficulty getting by").attr('display','none');

            vis.svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","15px")
                .attr("fill","#DE4C44")
                .attr("x", vis.width - 3 * vis.margin.right)
                .attr("y",vis.y(vis.dataNest[4].value[16].Value) - 7).attr('fill-opacity',0.5)
                .text("% Not enough money for food").attr('display','none');

            vis.svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","15px")
                .attr("fill","#5D7869")
                .attr("x", vis.width - 3 * vis.margin.right)
                .attr("y",vis.y(vis.dataNest[5].value[16].Value) - 7).attr('fill-opacity',0.5)
                .text("% Economy getting worse").attr('display','none');

            vis.svg.append("text")
                .attr("text-anchor", "end")
                .attr("class", "label")
                .attr("font-size","15px")
                .attr("fill","#215a30")
                .attr("x", vis.width - 3 * vis.margin.right)
                .attr("y", vis.y(vis.dataNest[6].value[16].Value) - 7).attr('fill-opacity',0.5)
                .text("% Americans who think war was mistake").attr('display','none');

            $(".label").fadeIn(1000);
        }


        // Call draw function
        vis.drawLine();

    }

    // Function to manually draw line
    drawLine(){
        let vis = this;

        var ptdata = [];
        var session = [];
        var path;
        var drawing = false;


        var line = d3v3.svg.line()
            .interpolate("bundle") // basis, see http://bl.ocks.org/mbostock/4342190
            .tension(1)
            .x(function(d, i) { return d.x; })
            .y(function(d, i) { return d.y; });

        var drawArea = d3v3.select("#history-line").selectAll("svg")
            .attr("width", vis.width - vis.margin.left - vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

        var triggerArea = drawArea.append("rect")
            .attr('id','triggerArea')
            .attr("width", vis.width)
            .attr("height", vis.height )
            .attr("transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .attr('opacity', 0);

        drawArea.append("g")
            .attr('class','drawArea')
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        drawArea
            .on("mousedown", listen)
            .on("touchstart", listen)
            .on("touchend", ignore)
            .on("touchleave", ignore)
            .on("mouseup", ignore)
            .on("mouseleave", ignore);


        // ignore default touch behavior
        var touchEvents = ['touchstart', 'touchmove', 'touchend'];
        touchEvents.forEach(function (eventName) {
            document.body.addEventListener(eventName, function(e){
                e.preventDefault();
            });
        });

        $("#redraw-button").click(redraw);

        function redraw(){
            // console.log("clicked")
            ptdata = [];
            d3.selectAll("path.drawLine").remove();
        }


        function listen () {
            drawing = true;

            ptdata = []; // reset point data
            path = drawArea.append("path") // start a new line
                .data([ptdata])
                .attr("class", "drawLine")
                .attr("stroke", "#228075")
                .attr("stroke-width", "2")
                .attr("stroke-dasharray", "10,10")
                .attr("fill", "none")
                .attr("d", line);

            if (d3v3.event.type === 'mousedown') {
                drawArea.on("mousemove", onmove);
            } else {
                drawArea.on("touchmove", onmove);
            }
        }

        function ignore () {
            var before, after;

            drawArea.on("mousemove", null);
            drawArea.on("touchmove", null);

            // skip out if we're not drawing
            if (!drawing) return;
            drawing = false;

            before = ptdata.length;

            // simplify
            ptdata = simplify(ptdata);
            after = ptdata.length;

            // redraw the line after simplification
            tick();
        }


        function onmove (e) {
            var type = d3v3.event.type;
            var point;

            if (type === 'mousemove') {
                point = d3v3.mouse(this);

            } else {
                // only deal with a single touch input
                point = d3v3.touches(this)[0];
            }

            // push a new data point onto the back
            ptdata.push({ x: point[0], y: point[1] });
            tick();
        }

        function tick() {
            path.attr("d", function(d) { return line(d); }) // Redraw the path:
        }

    }


}





