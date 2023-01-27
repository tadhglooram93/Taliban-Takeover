class Bubbles {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create margins
        vis.margin = {top: 120, right: 20, bottom: 20, left: 35};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height;

        // Set scale factor for bubble size
        vis.scalefactor = 7;

        // Max dollar amount to set largest size
        vis.maxDollar = 5000000000;

        // Create SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Create circles group
        vis.circleGroup = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Create labels group
        vis.labelsGroup = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Create radius scale
        vis.rScale = d3.scaleSqrt()
            .domain([0, vis.maxDollar])
            .range([0, vis.height]);

        // Create category scale
        vis.catScale = d3.scaleBand()
            .range([0, vis.height]);

        // Create title
        vis.svg.append("text")
            .attr("x", 70)
            .attr("y", "-75")
            .attr("font-size", "21")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("opacity", 0.8)
            .attr("text-anchor", "start")
            .text("Are Priority Areas Well-Funded?");

        vis.svg.append("text")
            .attr("x", 70)
            .attr("y", "-55")
            .attr("font-size", "15")
            .attr("fill", "gray")
            .attr("opacity", 0.8)
            .attr("text-anchor", "start")
            .text("Top 5 Categories by Funding Needs");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Filter to selected year where requirements > 0
        vis.displayData = vis.data;
        vis.selectedYear = parseInt(d3.select("#yearSelector").node().value);
        vis.displayData = vis.displayData.filter(d => d.year == vis.selectedYear);
        vis.displayData = vis.displayData.filter(d => d.requirements > 0);

        // Create field for under/over funding
        vis.displayData.forEach(function(d) {
            d.diff = d.percent_funded ;
        });

        // Sort high to low and take top n
        vis.displayData = vis.displayData.sort(function(a, b) {
            return b.requirements - a.requirements;
        });

        vis.displayData = vis.displayData.slice(0,5);

        // console.log("new data", vis.displayData)

        // Get distinct categories and make categorical scale
        vis.distinctVals = [...new Set(vis.displayData.map(item => item.cluster))];
        vis.catScale.domain(vis.distinctVals);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // console.log(vis.displayData)

        // Add labels
        vis.catLabels = vis.svg.selectAll(".catLabels")
            .data(vis.displayData);
        vis.reqLabels = vis.svg.selectAll(".reqLabels")
            .data(vis.displayData);
        vis.fundLabels = vis.svg.selectAll(".fundLabels")
            .data(vis.displayData);

        // Category labels
        d3.selectAll(".catLabels").exit().remove();
        vis.catLabels
            .enter()
            .append("text")
            .attr("class", "catLabels")
            .merge(vis.catLabels)
            .transition()
            .duration(400)
            .text(d => d.cluster)
            .attr("y", d => vis.catScale(d.cluster) - 10)
            .attr("x", 80)
            .attr("font-weight", "bold")
            .attr("font-size", 15)
            .style("fill", "darkblue");

        // Requirements labels
        d3.selectAll(".reqLabels").exit().remove();
        vis.reqLabels
            .enter()
            .append("text")
            .attr("class", "reqLabels")
            .merge(vis.reqLabels)
            .transition()
            .duration(400)
            .text(function(d) {
                    if (d.requirements / 1000000000 > 1) {
                        return "Aid Needed: $" + (d.requirements / 1000000000).toFixed(1) + "B"
                    } else {
                        return "Aid Needed: $" + (d.requirements / 1000000).toFixed(1) + "M"
                    }
                }
            )
            .attr("y", d => vis.catScale(d.cluster) + 10)
            .attr("font-size", "14")
            .attr("x", 80);

        // Funding amount labels
        d3.selectAll(".fundLabels").exit().remove();
        vis.fundLabels
            .enter()
            .append("text")
            .attr("class", "fundLabels")
            .merge(vis.fundLabels)
            .transition()
            .duration(400)
            .text(function(d) {
                    if (d.requirements / 1000000000 > 1) {
                        return "Aid Provided: $" + (d.funding / 1000000000).toFixed(1) + "B"
                    } else {
                        return "Aid Provided: $" + (d.funding / 1000000).toFixed(1) + "M"
                    }
                }
            )
            .attr("y", d => vis.catScale(d.cluster) + 30)
            .attr("font-size", "14")
            .attr("x", 80)
            .attr("fill", function(d) {
                if(d.funding > d.requirements) {
                    return "darkgreen"
                } else {
                    return "darkred"
                }
            })
            .attr("opacity", 0.8);

        vis.reqBubbles = vis.svg.selectAll(".reqBubble")
            .data(vis.displayData);
        vis.fundBubbles = vis.svg.selectAll(".fundBubble")
            .data(vis.displayData);

        // Create requirements bubbles
        d3.selectAll(".reqBubble").exit().remove();
        vis.reqBubbles
            .enter()
            .append("circle")
            .attr("class", "reqBubble")
            .merge(vis.reqBubbles)
            .transition()
            .duration(400)
            .attr("cy", d => vis.catScale(d.cluster))
            .attr("cx", 30)
            .attr("r", d => vis.rScale(d.requirements / vis.scalefactor))
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill-opacity", "0.15")
            .attr("opacity", "0.7")
            .attr("fill", "lightgray");

        // Add mouseover behavior
        vis.reqBubbles
            .on("mouseover", function(event, d) {

                // Get items to match on index for mouseover
                let labelNodes = vis.reqLabels.nodes();
                let bubbleNodes = vis.reqBubbles.nodes();
                let diffNodes = d3.selectAll(".diffBars").nodes();
                let connectNodes = vis.connect.nodes();
                let dataLabelNodes = d3.selectAll(".diffText").nodes();
                let i = bubbleNodes.indexOf(this);

                d3.select(this)
                    .style("fill", "gray");
                d3.select(labelNodes[i])
                .style("font-weight", "bold");
                d3.select(connectNodes[i])
                    .style("stroke", "black")
                    .style("stroke-width", "1.5");
                d3.select(diffNodes[i])
                    .style("fill-opacity", "0.2");
                d3.select(dataLabelNodes[i])
                    .style("font-weight", "bold");

            })
            .on("mouseout", function(d) {

                // Get items to match on index for mouseover
                let labelNodes = vis.reqLabels.nodes();
                let bubbleNodes = vis.reqBubbles.nodes();
                let diffNodes = d3.selectAll(".diffBars").nodes();
                let connectNodes = vis.connect.nodes();
                let dataLabelNodes = d3.selectAll(".diffText").nodes();
                let i = bubbleNodes.indexOf(this);

                d3.select(this)
                    .style("fill", "lightgray");
                d3.select(labelNodes[i])
                    .style("font-weight", "normal");
                d3.select(diffNodes[i])
                    .style("fill-opacity", "1");
                d3.select(connectNodes[i])
                    .style("stroke", "gray")
                    .style("stroke-width", "0.7");
                d3.select(dataLabelNodes[i])
                    .style("font-weight", "normal");
            });

        // Create funding bubbles
        d3.selectAll(".fundBubble").exit().remove();
        vis.fundBubbles
            .enter()
            .append("circle")
            .attr("class", "fundBubble")
            .merge(vis.fundBubbles)
            .transition()
            .duration(400)
            .attr("cy", d => vis.catScale(d.cluster))
            .attr("cx", 30)
            .attr("r", d => vis.rScale(d.funding / vis.scalefactor))
            .attr("stroke", function(d) {
                if (d.funding < d.requirements) {
                    return "red"
                } else {
                    return "green"
                }
            })
            .attr("stroke-width", 1)
            .attr("fill", function(d) {
                if (d.funding < d.requirements) {
                    return "red"
                } else {
                    return "lightgreen"
                }
            })
            .attr("fill-opacity", "0.05");

        // Add mouseover behavior
        vis.fundBubbles
            .on("mouseover", function(event, d) {

                // Get items to match on index for mouseover
                let labelNodes = vis.fundLabels.nodes();
                let bubbleNodes = vis.fundBubbles.nodes();
                let diffNodes = d3.selectAll(".diffBars").nodes();
                let connectNodes = vis.connect.nodes();
                let dataLabelNodes = d3.selectAll(".diffText").nodes();
                let i = bubbleNodes.indexOf(this);

                d3.select(this)
                    .style("fill-opacity", "0.2");
                d3.select(labelNodes[i])
                    .style("font-weight", "bold");
                d3.select(connectNodes[i])
                    .style("stroke", "black")
                    .style("stroke-width", "1.5");
                d3.select(diffNodes[i])
                    .style("fill-opacity", "0.3");
                d3.select(dataLabelNodes[i])
                    .style("font-weight", "bold");
            })
            .on("mouseout", function(d) {

                // Get items to match on index for mouseover
                let labelNodes = vis.fundLabels.nodes();
                let bubbleNodes = vis.fundBubbles.nodes();
                let diffNodes = d3.selectAll(".diffBars").nodes();
                let connectNodes = vis.connect.nodes();
                let dataLabelNodes = d3.selectAll(".diffText").nodes();
                let i = bubbleNodes.indexOf(this);

                d3.select(this)
                    .style("fill-opacity", "0.05");
                d3.select(labelNodes[i])
                    .style("font-weight", "normal");
                d3.select(diffNodes[i])
                    .style("fill-opacity", "1");
                d3.select(connectNodes[i])
                    .style("stroke", "gray")
                    .style("stroke-width", "0.7");
                d3.select(dataLabelNodes[i])
                    .style("font-weight", "normal");
            });


        // Add connector lines
        vis.connect = vis.svg.selectAll(".connectors")
            .data(vis.displayData);
        vis.connect
            .enter()
            .append("line")
            .attr("class", "connectors")
            .attr("x1", vis.width - 150)
            .attr("x2", vis.width)
            .attr("y1", d => vis.catScale(d.cluster) + 2)
            .attr("y2", d => vis.catScale(d.cluster) + 2)
            .attr("stroke", "gray")
            .attr("stroke-width", "0.7");

    }




}