class Line {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Create margins
        vis.margin = {top: 10, right: 10, bottom: 50, left: 30};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - (vis.margin.left) - (vis.margin.right);
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - (vis.margin.top);

        // Create SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + 2 * vis.margin.left + "," + 2 * vis.margin.top + ")");

        // Group data by year
        vis.grouped = d3.rollups(vis.data, function (v) {
            return [d3.sum(v, d => d.requirements), d3.sum(v, d => d.funding)]
        }, d => d.year);

        vis.displayData = vis.grouped;

        // Filter out before 2009
        vis.displayData = vis.displayData.filter(d => d[0] > 2008);

        // Create scales
        vis.xScale = d3.scaleLinear()
            .domain(d3.extent(vis.displayData, d => d[0]))
            .range([0, vis.width - 3 * vis.margin.left]);

        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d[1][0])])
            .range([vis.height, 0]);

        //Create and draw axes
        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)
            .tickFormat(d3.format("d"));
        vis.yAxis = d3.axisLeft()
            .scale(vis.yScale)
            .tickFormat(function(d) {
                return "$" + (d / 1000000000).toFixed(0) + "B"
            });

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis2")
            .attr("transform", "translate(0," + (vis.height) + ")");

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis2");

        vis.svg.select(".x-axis")
            .call(vis.xAxis
                .ticks(8));

        vis.svg.select(".y-axis")
            .call(vis.yAxis
                .ticks(4))
            .select(".domain").remove();


        // Create line for funding needs
        vis.svg.append("path")
            .datum(vis.displayData)
            .attr("fill", "none")
            .attr("stroke", "#f08080")
            .attr("opacity", 0.8)
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => vis.xScale(d[0]))
                .y(d => vis.yScale(d[1][0]))
                .curve(d3.curveLinear)
            );

        // Create line for funding provided
        vis.svg.append("path")
            .datum(vis.displayData)
            .attr("fill", "none")
            .attr("stroke", "#228075")
            .attr("opacity", 0.9)
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => vis.xScale(d[0]))
                .y(d => vis.yScale(d[1][1]))
                .curve(d3.curveLinear)
            );

        // Create title
        vis.svg.append("text")
            .attr("x", "-34")
            .attr("y", "-5")
            .attr("font-weight", "bold")
            .attr("fill", "#228075")
            .attr("opacity", 0.8)
            .attr("font-size", "16")
            .text("As the crisis escalates, humanitarian aid has plateaued");

        // Create color rects for legend
        vis.svg.append("rect")
            .attr("x", "10")
            .attr("y", "35")
            .attr("width", "12")
            .attr("height", "6")
            .attr("opacity", 0.7)
            .attr("fill", "#f08080");

        vis.svg.append("rect")
            .attr("x", "10")
            .attr("y", "50")
            .attr("width", "12")
            .attr("height", "6")
            .attr("opacity", 0.7)
            .attr("fill", "#228075");

        // Create vertical line to indicate US withdrawal
        vis.svg.append("line")
            .attr("x1", vis.xScale(2021))
            .attr("x2", vis.xScale(2021))
            .attr("y1", vis.yScale(0))
            .attr("y2", vis.yScale(d3.max(vis.displayData, d => d[1][0])))
            .attr("stroke", "gray")
            .attr("stroke-dasharray", "2,2")
            .attr("stroke-width", "2");

        vis.svg.append("text")
            .attr("x", vis.xScale(2021) - 5)
            .attr("y", 40)
            .attr("font-size", 14)
            .attr("fill", "gray")
            .attr("text-anchor", "end")
            .text("U.S. Withdrawal");

        // Category labels for legend
        vis.svg.append("text")
            .attr("x", 30)
            .attr("y", 42)
            .attr("font-size", 14)
            .attr("fill", "gray")
            .text("Funding needed");

        vis.svg.append("text")
            .attr("x", 30)
            .attr("y", 57)
            .attr("font-size", 14)
            .attr("fill", "gray")
            .text("Funding provided");

    }

}
