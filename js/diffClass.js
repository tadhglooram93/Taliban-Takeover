class DiffBars {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create margins
        vis.margin = {top: 120, right: 0, bottom: 20, left: 25};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width ;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height ;

        // Create SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left - vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + 2 * vis.margin.left + "," + vis.margin.top + ")");


        // Create scale
        vis.xScale = d3.scaleLinear()
            .domain([0,1])
            .range([0, vis.width / 4]);

        // Create category scale
        vis.catScale = d3.scaleBand()
            .range([0, vis.height]);

        // Create title
        vis.svg.append("text")
            .attr("class", "header")
            .text("← Underfunding | Overfunding →")
            .attr("x", vis.xScale(1) - 5)
            .attr("y", -35)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .attr("font-size", 14)
            .attr("fill", "darkblue");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Take wrangled data from bubbleClass
        vis.displayData = myBubbles.displayData;

        // Set catscale domain with distinct values
        vis.distinctVals = [...new Set(vis.displayData.map(item => item.cluster))];
        vis.catScale.domain(vis.distinctVals);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Make vertical line for 0%
        vis.svg.append("line")
            .attr("x1", vis.xScale(1))
            .attr("x2", vis.xScale(1))
            .attr("y1", "0")
            .attr("y2", vis.catScale(vis.displayData[4].cluster) + 14)
            .attr("stroke", "gray")
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", "1.5");

        // Create bars
        vis.diffBars = vis.svg.selectAll(".diffBars")
            .data(vis.displayData);

        vis.diffBars.exit().remove();
        vis.diffBars
            .enter()
            .append("rect")
            .attr("class", "diffBars")
            .merge(vis.diffBars)
            .transition()
            .duration(400)
            .attr("y", d => vis.catScale(d.cluster) - 20)
            .attr("x", function(d) {
                if (d.diff >= 1) {
                    return vis.xScale(1);
                } else {
                    return vis.xScale(Math.abs(d.diff));
                }
            })
            .attr("width", d => vis.xScale(Math.abs(1 - d.diff)))
            .attr("height", 35)
            .attr("fill", function(d) {
                if (d.diff >= 1) {
                    return "#E0EBE5"
                } else {
                    return "#E9D6D9"
                }
            })
            .attr("stroke", function(d) {
                if (d.diff >= 1) {
                    return "darkgreen"
                } else {
                    return "darkred"
                }
            });

        // Add mouseover behavior
        vis.diffBars
            .on("mouseover", function(event, d) {

                // Get items to match on index for mouseover
                let labelNodes = d3.selectAll(".catLabels").nodes();
                let reqBubbleNodes = d3.selectAll(".reqBubble").nodes();
                let fundBubbleNodes = d3.selectAll(".fundBubble").nodes();
                let diffNodes = vis.diffBars.nodes();
                let connectNodes = d3.selectAll(".connectors").nodes();
                let dataLabelNodes = vis.diffText.nodes();
                let i = diffNodes.indexOf(this);

                d3.select(this)
                    .style("fill-opacity", "0.3");
                d3.select(labelNodes[i])
                    .style("fill", "gray");
                d3.select(connectNodes[i])
                    .style("stroke", "black")
                    .style("stroke-width", "1.5");
                d3.select(reqBubbleNodes[i])
                    .style("fill-opacity", "0.3");
                d3.select(fundBubbleNodes[i])
                    .style("fill-opacity", "0.2");
                d3.select(dataLabelNodes[i])
                    .style("font-weight", "bold");

            })
            .on("mouseout", function(d) {

                // Get items to match on index for mouseover
                let labelNodes = d3.selectAll(".catLabels").nodes();
                let reqBubbleNodes = d3.selectAll(".reqBubble").nodes();
                let fundBubbleNodes = d3.selectAll(".fundBubble").nodes();
                let diffNodes = vis.diffBars.nodes();
                let connectNodes = d3.selectAll(".connectors").nodes();
                let dataLabelNodes = vis.diffText.nodes();
                let i = diffNodes.indexOf(this);

                d3.select(this)
                    .style("fill-opacity", "1");
                d3.select(labelNodes[i])
                    .style("fill", "darkblue");
                d3.select(connectNodes[i])
                    .style("stroke", "gray")
                    .style("stroke-width", "0.7");
                d3.select(reqBubbleNodes[i])
                    .style("fill-opacity", "0.07");
                d3.select(fundBubbleNodes[i])
                    .style("fill-opacity", "0.07");
                d3.select(dataLabelNodes[i])
                    .style("font-weight", "normal");

            });

        // Make data labels
        vis.diffText = vis.svg.selectAll(".diffText")
            .data(vis.displayData);

        vis.diffText
            .enter()
            .append("text")
            .attr("class", "diffText")
            .merge(vis.diffText)
            .transition()
            .duration(400)
            .attr("text-anchor", function(d) {
                if (d.diff >= 1) {
                    return "start"
                } else {
                    return "end"
                }
            })
            .attr("y", d => vis.catScale(d.cluster) + 2)
            .attr("x", function(d) {
                if (d.diff >= 1) {
                    return vis.xScale(Math.abs(d.diff)) + 4;
                } else {
                    return vis.xScale(Math.abs(d.diff) - 0.03);
                }
            })
            .text(function(d) {
                if (d.diff >= 1) {
                    return "+" + (100 * (d.diff - 1)).toFixed(1) + "%"
                } else {
                    return "-" + (100 * (1 - d.diff)).toFixed(1) + "%"
                }
            })
            .attr("font-size", 12);


    }


}