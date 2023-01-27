/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */

class MapVis2 {

    constructor(parentElement,geoData,conflictdata){
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.conflictdata = conflictdata
        this.initvis()
    }

    initvis() {
        let vis = this;

        // set margins
        vis.margin = {top: 1, right: 1, bottom: 1, left: 1};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - (vis.margin.left);
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top;

        //initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)

        // define projections
        vis.projection = d3.geoAlbers()

        //define path
        vis.path = d3.geoPath().projection(vis.projection)

        //  get borders
        vis.border_scale = topojson.feature(vis.geoData, vis.geoData.objects.international);

        // scale projections
        vis.projection
            .scale(1)
            .translate([0, 0])
            .rotate([-68, 0]);
        vis.b = vis.path.bounds(vis.border_scale),
            vis.s = .90 / Math.max((vis.b[1][0] - vis.b[0][0]) / vis.width, (vis.b[1][1] - vis.b[0][1]) / vis.height),
            vis.t = [(vis.width - vis.s * (vis.b[1][0] + vis.b[0][0])) / 2, (vis.height - vis.s * (vis.b[1][1] + vis.b[0][1])) / 2];
        vis.projection
            .scale(vis.s)
            .translate(vis.t);

        // convert TopoJson data into GeoJson datastructure
        vis.districts = topojson.feature(vis.geoData, vis.geoData.objects.districts).features;
        vis.provinces = topojson.feature(vis.geoData, vis.geoData.objects.provinces).features;
        vis.borders = topojson.feature(vis.geoData, vis.geoData.objects.international).features;


        // set map and grouping
        vis.map = vis.svg.append("g")
            .attr("class", "districtgroup")

        // draw the district
        vis.district = vis.map.selectAll(".districts")
            .data(vis.districts)
            .enter()
            .append("path")
            .attr("class", "districts")
            .attr("d", vis.path)
            .attr('fill','white')

        // draw the provinces
        vis.province = vis.map.selectAll(".provinces")
            .data(vis.provinces)
            .enter()
            .append("path")
            .attr("class", "provinces")
            .attr("d", vis.path)
            .attr('fill','none')

        // draw the border
        vis.border = vis.map.selectAll(".border")
            .data(vis.borders)
            .enter()
            .append("path")
            .attr("class", "border")
            .attr("d", vis.path)
            .attr('fill','none')

        // draw circles
        vis.circles = vis.map.append("g")
            .attr("class", "bubble")
            .selectAll("circle")
            .data(vis.districts )
            .enter().append("circle")
            .attr("transform", function(d) { return "translate(" + vis.path.centroid(d) + ")"; })

        // tool tip
        vis.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .attr('id','fataltooltip')

        // wrangledata
        vis.wrangleData()
    }
    wrangleData(){
        let vis = this
        //filteredData will filter taliban take over based on date selection
        vis.data = vis.conflictdata;

        //filter the data
        vis.selectedDate = parseInt(d3.select("#dateselector2").node().value);
        vis.data = vis.data.filter(d => d.idx == vis.selectedDate)

        // update text in html to reflect date
        document.getElementById('printdate2').innerHTML = vis.data[0].date

        vis.updateVis()
    }

    updateVis( ) {
        let vis = this;

        console.log(vis.data)

        // create lookup to map to radius
        vis.lookup = {};
        vis.data.forEach(function(d) { vis.lookup[d.id] = +d.fatalities; })

        // use a scaler, otherwise bubbles will blow up
        vis.radius = d3.scaleSqrt()
            .domain([0, 1779])
            .range([0, 30]);

        // update circles
        if(!vis.bubbles) {
            vis.bubbles = vis.map
                .append("g")
                .attr("class", "bubble")
        }

        vis.circles = vis.bubbles
            .selectAll("circle")
            .data(vis.districts, d => d['id'])

        vis.circles
            .enter().append("circle")
            .attr("transform", function(d) { return "translate(" + vis.path.centroid(d) + ")"; })
            .attr("r", function(d) {
                return vis.radius(vis.lookup[d.id])
            });

        vis.circles
            .attr("transform", function(d) { return "translate(" + vis.path.centroid(d) + ")"; })
            .attr("r", function(d) {
                return vis.radius(vis.lookup[d.id])
            });

        vis.circles.exit()
            .remove()

        vis.circles
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(218,218,89,0.44)')
                    .attr('fill-opacity', 1)


                let dist = d.id;
                let distinfo = vis.data.filter(function(d){
                    return d.id == dist;
                })

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid #170a0a; border-radius: 5px; background: #f8f6f6; padding: 20px">
                         <h3><strong> ${distinfo[0].id}</strong> <h3>
                         <p><b>${distinfo[0].fatalities}</b> reported fatalities</p>    
                     </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr("fill", "#3e645f")
                    .attr('fill-opacity', .5)


                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

    }
}