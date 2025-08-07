var svg;

function hourly() {

	// var svg = d3.select("#hourly svg");
	var url = "api/getcsv.php?f=gethourly";

	Object.keys(graphs).forEach( t => url += `&${graphs[t].fld}=${graphs[t].id}` );

	fetch(url)
	.then(res => res.text())
	.then(res => {

		var tab = [];
		res.split('\n').forEach( s => {

			if(s.length === 0)
				return;

			var row = s.split('\t');
			row[0] = (new Date(+row[0] * 1000)).toLocaleString().slice(12,17);
			row[1] = +row[1];
			row[2] = +row[2];
			tab.push(row);

		});

		// x axis
		var x = d3.scaleBand()
			.range( [ 0,960 - 90]  )
			.domain(tab.map( d => d[0] ))
			.padding(0.2);

		svg.select("#x-axis")
			.transition()
			.duration(700)
			.call(d3.axisBottom(x));

		// y axis
		var y = d3.scaleLinear([ 0, d3.max(tab.map( d => d[1]+d[2] )) ], [200-30, 0]);

		svg.select("#y-axis")
			.transition()
			.duration(700)
			.call(d3.axisLeft(y));

		// shiny small triangles
		function tweenfunc(d)	{

			var oldy = +d3.select(this).attr("y");
			var barx = +d3.select(this).attr("x");
			var newy = y(d[1]+d[2]);

			var tri;
			if(oldy !== newy)
				tri = d3.select(this.parentNode)
					.append("path")
					.attr("d", d3.symbol().type(d3.symbolTriangle)
						.size(30))
					.attr("fill", "red")
					.attr("transform", `translate(${barx + 19.4 - 10.78/2}, ${oldy - 6})` + ((oldy > newy) ? "" : " rotate(180)") );

			return function(t)	{

				if(tri)
					tri.attr("transform", `translate(${barx + 19.4 - 10.78/2}, ${oldy + (newy - oldy) * t - 6})` + ((oldy > newy) ? "" : " rotate(180)") );
		
				if(tri && t === 1)
					tri.remove();

			}

		}

		svg.select("#bars").selectAll("g")
			.data(tab)
			.join( enter => {

				var g = enter.append("g");
				g.append("rect")
					.attr("x", d => x(d[0]))
					.attr("y", d => y(d[1]))
					.attr("data-num", d => d[1])
					.attr("width", x.bandwidth())
					.attr("height", d => 200-30 - y(d[1]))
					.attr("fill", "#59a392");
				g.append("rect")
					.attr("x", d => x(d[0]))
					.attr("y", d => y(d[1] + d[2]))
					.attr("data-num", d => d[2])
					.attr("width", x.bandwidth())
					.attr("height", d => 200-30 - y(d[2]))
					.attr("fill", "#da5f5f");

			}, update => {

				update.select("rect")
					.transition()
					.duration(700)
					.attr("y", d => y(d[1]))
					.attr("data-num", d => d[1])
					.attr("height", d => 200-30 - y(d[1]));
				update.select("rect:nth-child(2)")
					.transition()
					.tween('lil-arrows', tweenfunc)
					.duration(700)
					.attr("y", d => y(d[1] + d[2]))
					.attr("data-num", d => d[2])
					.attr("height", d => 200-30 - y(d[2]));

			}, exit => {

				exit.remove();

			});

		svg.selectAll("rect")
			.attr("pointer-events", "all")
			.on("mouseover", function(e) {

				var [ mx, my ] = [ e.clientX, e.clientY];
				d3.select(e.target)
					.style('filter', 'brightness(1.2)')
					.classed("highlight", true);
				
				d3.select("#popup")
					.style("left", mx + 'px')
					.style("top", (my - 40) + 'px')
					.text(e.target.dataset.num);
				d3.select("#popup").style("display", null);

			})
			.on("mouseout", () => {
				
				d3.select("rect.highlight")
					.style('filter', 'brightness(1)')
					.classed("highlight", false);
				d3.select("#popup").style("display", "none");

			});

	});

};
