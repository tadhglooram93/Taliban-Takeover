class networkgraph {
    constructor(parentElement, networkdata) {
        this.parentElement = parentElement;
        this.data = networkdata;
        this.initvis()
    }

    initvis() {
        let vis = this;
        console.log(vis.data)

        // set margins
        vis.margin = {top: 30, right: 1, bottom: 1, left: 1};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - (vis.margin.left);
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top;

        console.log(document.getElementById(vis.parentElement).getBoundingClientRect())


        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)

        vis.node_scale = d3.scaleSqrt()
            .domain([0,24228])
            .range([10, 50]);

        vis.link_scale = d3.scaleSqrt()
            .domain([1,23959])
            .range([.5, 10]);

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        vis.node = vis.svg
            .selectAll("circle")
            .data(vis.data.nodes)
            .enter()
            .append("circle")
            .attr("r",function(d) { return vis.node_scale(d.Radius); })
            .style("fill", "#3e645f")
            .style('fill-opacity', 1)

        vis.link = vis.svg
            .selectAll("line")
            .data(vis.data.links)
            .enter()
            .append("line")
            .style("stroke", "#3e645f")
            .attr("stroke-width", function(d) { return vis.link_scale(d.edgethickness); });

        vis.force = d3.forceSimulation(vis.data.nodes)
            .force("charge", d3.forceManyBody().strength(-50))
            .force("link", d3.forceLink().distance(140)
                .id(function(d) { return d.id; })
                .links(vis.data.links)
            )
            .force("center", d3.forceCenter().x(vis.width/2).y(vis.height/2));

        vis.force.on("tick", function() {

            vis.link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            vis.node.attr("cx", function(d) { return d.x+6; })
                .attr("cy", function(d) { return d.y-6; });

        })
        vis.wrangleData()
    }

    wrangleData(){
        let vis = this;
        vis.updatevis()
    }
    updatevis(){
        let vis = this;
        vis.node
            .on("mouseover", function(event,d) {
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid #170a0a; border-radius: 5px; background: #f8f6f6; padding: 20px">
                         <h3><strong> ${d['Nodes']}</strong> <h3>
                     </div>`);
            })
            .on("mouseout", function(d) {
                vis.tooltip.style("opacity", 0);
            });

    }
}
