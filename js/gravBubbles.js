class GravBubbles {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create margins
        vis.margin = {top: 50, right: 100, bottom: 50, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - (vis.margin.left);
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height;

        // Scale to apply to rect and circle elements
        vis.scaleFactor = 7;

        // Max dollar amount to set largest size
        vis.maxDollar = 5000000000;

        // Create SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + 2 * vis.margin.top + ")");

        // Create radius scale
        vis.rScale = d3.scaleSqrt()
            .domain([0, vis.maxDollar])
            .range([0, vis.height]);

        // Create colorscale
        vis.colorScale = d3.scaleOrdinal([
            "#286CFF",
            "#DC9464",
            "black",
            "#215a30",
            "#aa5bdeff",
            "#215a30",
            "orange",
            "#DE4C44"
        ]);

        // Title
        vis.svg
            .append("text")
            .attr("x", vis.width / 2 + 35)
            .attr("y", -55)
            .attr("text-anchor", "middle")
            .text("Who is Funding Humanitarian Causes?")
            .attr("font-weight", "bold")
            .attr("opacity", 0.8)
            .attr("font-size", "21px");
        vis.svg
            .append("text")
            .attr("x", vis.width / 2 + 35)
            .attr("y", -25)
            .attr("text-anchor", "middle")
            .text("Circles represent donors. The square represents total funding needs")
            .attr("fill", "gray")
            .attr("opacity", 0.7)
            .attr("font-size", "13px");

        // Legend
        vis.svg
            .append("rect")
            .attr("x", 91)
            .attr("y", 41)
            .attr('width',18)
            .attr('height', 18)
            .attr("stroke", "gray")
            .attr("transform", `translate(${vis.width/ 2 + 50}, ${(vis.height/2 - 190)} )`)
            .attr("stroke-width", 3)
            .attr("fill-opacity", "0.00");

        vis.svg
            .append("text")
            .attr("x", 115)
            .attr("y", 51)
            .text("Total Aid Needed")
            .attr("transform", `translate(${vis.width/ 2 + 50}, ${(vis.height/2 - 190)} )`)
            .attr("text-anchor", "right")
            .attr("stroke", "gray")
            .style("alignment-baseline", "middle")
            .attr("font-size", "12");

        vis.svg
            .append("text")
            .attr("x", 92)
            .attr("y", 77)
            .text("Aid Provided By:")
            .attr("transform", `translate(${vis.width/ 2 + 50}, ${(vis.height/2 - 190)} )`)
            .attr("text-anchor", "right")
            .attr("stroke", "gray")
            .style("alignment-baseline", "middle")
            .attr("font-size", "12");

        // create a list of keys
        var keys = [...new Set(vis.data.filter(d => d.srcOrganizationTypes != "").map(item => item.srcOrganizationTypes))];
        console.log(keys)

        // Add one dot in the legend for each name.
        vis.svg.selectAll("mydots")
            .data(keys)
            .enter()
            .append("circle")
            .attr("cx", 100)
            .attr("cy", function(d,i){ return 100 + i*25})
            .attr("r", 7)
            .attr("fill-opacity", "0.15")
            .attr("transform", `translate(${vis.width/ 2 + 50}, ${(vis.height/2 - 190)} )`)
            .attr("stroke", function(d){ return vis.colorScale(d)})
            .style("fill", function(d){ return vis.colorScale(d)});

        // Add one dot in the legend for each name.
        vis.svg.selectAll("mylabels")
            .data(keys)
            .enter()
            .append("text")
            .attr("x", 110)
            .attr("y", function(d,i){ return 100 + i*25})
            .style("fill", function(d){ return vis.colorScale(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .attr("transform", `translate(${vis.width/ 2 + 50}, ${(vis.height/2 - 190)} )`)
            .attr("font-size", "12px")
            .style("alignment-baseline", "middle");


        // Set up tooltip
        vis.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .attr('id','bubbleTooltip');

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data;

        // Filter donor data and total need data by year
        vis.selectedYear = parseInt(d3.select("#yearSelector").node().value);
        vis.displayData = vis.displayData.filter(d => d.year == vis.selectedYear);

        // Bring in data on amount of funding needed per year
        vis.needData = myLine.displayData.filter(d => d[0] == vis.selectedYear);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Draw box for total need
        vis.totalNeed = vis.svg.selectAll(".totalNeed")
            .data(vis.needData);

         d3.selectAll(".totalNeed").exit().remove();
         vis.totalNeed
             .enter()
             .append("rect")
             .attr("class", "totalNeed")
             .merge(vis.totalNeed)
             .transition()
             .duration(400)
             .attr("y", d => (vis.height / 2) - 1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor) / 2)-15)
             .attr("x", d => (vis.width / 2) - 1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor) / 2)-35)
             .attr("width", d => 1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor)))
             .attr("height", d => 1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor)))
             .attr("fill", "white")
             .attr("fill-opacity", 0)
             .attr("stroke-width", 3)
             .attr("stroke", "gray")



        // Create bubbles representing donors with force to keep in center and non overlapping
        vis.gravBubs = vis.svg.selectAll(".gravBub")
            .data(vis.displayData);

        //Initialize a force layout
        vis.force = d3.forceSimulation(vis.displayData)
            .force("forceX", d3.forceX().strength(0.05).x(0))
            .force("forceY", d3.forceY().strength(0.05).y(0))
            .force("collide", d3.forceCollide().strength(0.03).radius(d => (vis.rScale(d.amountUSD / vis.scaleFactor)) + 2.5))
        ;

        vis.nodes = vis.svg.selectAll(".gravBub")
            .data(vis.displayData)
        ;
        d3.selectAll(".gravBub").exit();
        vis.nodes
            .enter()
            .append("circle")
            .attr("transform", `translate(${vis.width/ 2 - 35}, ${(vis.height/2) - 15} )`)
            .attr("class", "gravBub")
            .merge(vis.nodes)
            .transition()
            .duration(400)
            // .attr("cx", (vis.width/ 2))
            // .attr("cy", (vis.height/ 2) + 30)
            .attr("r", d => vis.rScale((d.amountUSD)/ vis.scaleFactor))
            .attr("stroke-width", 1)
            .attr("fill-opacity", "0.15")
            .attr("fill", d => vis.colorScale(d.srcOrganizationTypes))
            .attr("stroke", d => vis.colorScale(d.srcOrganizationTypes));


        // Tooltip for mouseover
        vis.nodes
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1.5px')
                    .attr('stroke', 'black')
                    .attr("fill-opacity", "0.5")

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid #170a0a; border-radius: 2px; background: #f8f6f6; padding: 15px">
                         <h5 id="bubbleTooltipTitle">${d.srcOrganization}<h5>
                         <p id="bubbleTooltip">Donor Type: ${(d.srcOrganizationTypes)}</p>                          
                         <p id="bubbleTooltip">Amount: $${(d.amountUSD / 1000000).toFixed(1)} MM </p>    
                     </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr("fill", d => vis.colorScale(d.srcOrganizationTypes))
                    .attr("stroke", d => vis.colorScale(d.srcOrganizationTypes))
                    .attr("stroke-width", 1)
                    .attr("fill-opacity", "0.15");

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        // Draw Label for funding needed
        vis.totalNeedText = vis.svg.selectAll(".totalNeedText")
            .data(vis.needData);

        d3.selectAll(".totalNeedText").exit().remove();
        vis.totalNeedText
            .enter()
            .append("text")
            .merge(vis.totalNeedText)
            .transition()
            .duration(400)
            .attr("class", "totalNeedText")
            .attr("x", d => (vis.width / 2) - (1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor)) / 2) - 60)
            .attr("y", d => (vis.height / 2) - (1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor)) / 2) - 75)
            .attr("fill", "darkslategray")
            .attr("font-size", "16px")
            .attr("text-anchor", "start")
            .text(function(d) {
                if (d[1][0] / 1000000000 > 1) {
                    return "Total Aid Needed: $" + (d[1][0] / 1000000000).toFixed(1) + "B"
                } else {
                    return "Total Aid Needed: $" + (d[1][0] / 1000000).toFixed(1) + "M"
                }
            });

        // Draw Label for funding provided
        vis.totalFundingText = vis.svg.selectAll(".totalFundingText")
            .data(vis.needData);
        vis.totalFund = d3.sum(vis.displayData, item => item.amountUSD);
        d3.selectAll(".totalFundingText").exit().remove();
        vis.totalFundingText
            .enter()
            .append("text")
            .merge(vis.totalFundingText)
            .transition()
            .duration(400)
            .attr("class", "totalFundingText")
            .attr("x", d => (vis.width / 2) - (1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor)) / 2) - 60)
            .attr("y", d => (vis.height / 2) - (1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor)) / 2) - 55)
            .attr("fill", "darkslategray")
            .attr("font-size", "16px")
            .attr("text-anchor", "start")
            .text(function(d) {
                if (vis.totalFund / 1000000000 > 1) {
                    return "Total Aid Provided: $" + (vis.totalFund / 1000000000).toFixed(1) + "B"
                } else {
                    return "Total Aid Provided: $" + (vis.totalFund / 1000000).toFixed(1) + "M"
                }
            });

        // Draw Label for funding percent
        vis.percentFundedText = vis.svg.selectAll(".percentFundedText")
            .data(vis.needData);
        d3.selectAll(".percentFundedText").exit().remove();
        vis.percentFundedText
            .enter()
            .append("text")
            .merge(vis.percentFundedText)
            .transition()
            .duration(400)
            .attr("class", "percentFundedText")
            .attr("x", d => (vis.width / 2) - (1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor)) / 2) - 60)
            .attr("y", d => (vis.height / 2) - (1.7724 * (vis.rScale(vis.needData[0][1][0] / vis.scaleFactor)) / 2) - 35)
            .attr("fill", "darkslategray")
            .attr("font-size", "16px")
            .attr("text-anchor", "start")
            .text(function(d) {
                return "Percent Funded: " + (100 * vis.totalFund / d[1][0]).toFixed(1) + "%"
            });


        //Every time the simulation "ticks", this will be called
        vis.force.on("tick", function() {

            vis.nodes
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

        });


    }




}