/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */

class MapVis {

    constructor(parentElement,geoData,talibandata){
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.talibandata = talibandata
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
            .attr('fill','none')

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

        // tool tip
        vis.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .attr('id','bartooltip')

        // wrangledata
        vis.wrangleData()
    }
    wrangleData(){
        let vis = this

        //filteredData will filter taliban take over based on date selection
        vis.data = vis.talibandata;

        //filter the data
        vis.selectedDate = parseInt(d3.select("#dateselector").node().value);
        vis.data = vis.data.filter(d => d.idx == vis.selectedDate)

        // update text in html to reflect date
        document.getElementById('printdate').innerHTML = vis.data[0].date

        //group data by district
        vis.distgroup = Array.from(d3.group(vis.data, d => d.id), ([key, value]) => ({key, value}))

        //final data structure
        vis.distcontrol = []

        //loop through data if under taliban control return 1 else 0
        vis.distgroup.forEach(district => {
            //get district name
            let districtname = district.key

            //set state of control to 0
            let talibancontrol = 0
            let talibancontroltxt = ""

            // if key 0 talibancontrol stays 0 else make it 1
            district.value.forEach(i => {
                if (i['taliban_control'] > 0){
                    talibancontrol = 1
                    talibancontroltxt = "Under Taliban Control"
                } else{
                    talibancontrol = 0
                    talibancontroltxt = "No Information"

                }
            });

            // push data to distrgroup
            vis.distcontrol.push(
                {
                    id: districtname,
                    talibancontrol: talibancontrol,
                    talibancontroltxt: talibancontroltxt,

                }
            )
        })

        //console.log(vis.distcontrol)

        vis.updateVis()
    }

    updateVis( ){
        let vis = this;

        //set color scale"
        vis.colorScale = d3.scaleOrdinal()
            .range(['rgba(248,246,246,0)', '#3e645f'])
            .domain([0,1])

        // update district fill
        vis.district
            .attr("fill", function(d){
                let dist = d.id;
                let color = ""
                vis.distcontrol.forEach(i=> {
                    if (i.id === dist) {
                        color =  vis.colorScale(i['talibancontrol'])
                    }
                })
                return color;
            })
            .attr('fill-opacity', .5);


        // add the tooltip
        vis.district
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(218,218,89,0.44)')
                    .attr('fill-opacity', 1)


                let dist = d.id;
                let distinfo = vis.distcontrol.filter(function(d){
                    return d.id == dist;
                })

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid #170a0a; border-radius: 5px; background: #f8f6f6; padding: 20px">
                         <h3><strong> ${distinfo[0].id}</strong> <h3>
                         <p> ${distinfo[0].talibancontroltxt}</p>    
                     </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr("fill", function(d){
                        let dist = d.id;
                        let distinfo = vis.distcontrol.filter(function(d){
                            return d.id == dist;
                        })

                        return vis.colorScale(distinfo[0]['talibancontrol'])
                    })
                    .attr('fill-opacity', .5)



                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });
    }
}