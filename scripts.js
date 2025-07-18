var dicts = {};

var graphs = {

	devices:	{ 	id: 0, fld: 'devid',	color: '#29bf12',	filter: false 	},
	genres: 	{	id: 0, fld: 'genreid',	color: '#465c69',	filter: false	},
	titles: 	{	id: 0, fld: 'titleid',	color: '#08bdbd',	filter: false	},
	countries:	{	id: 0, fld: 'countryid',color: '#f21b3f',	filter: true	},
	langs:		{	id: 0, fld: 'langid',	color: '#ff9914',	filter: true	},

};

var countryid = 0;
var langid = 0;

function main() {

	fetch("api/getjson.php?f=getdirs")
	.then( res => res.json() )
	.then( res => {

		Object.keys(res).forEach( d => {

			dicts[d] = {};
			res[d].forEach( r => {

				dicts[d][+r[0]] = r[1];

			});
			dicts[d]["0"] = 'All';

		});

		dicts['titles'] = {};
		dicts['titles'][0] = 'All';
		Object.keys(graphs).forEach( t => drawtab(t) );
		drawxuids();

		d3.select("#filter").on('input', filter);

	});

	d3.select("#popup").style("display", "none");
	numbers();

	svg = d3.select("#hourly")
		.append("svg")
			.attr('width',960)
			.attr('height',200)
		.append('g')
			.attr('transform', `translate(${60},${10})`);

	// x axis
	svg.append("g")
		.attr("transform", `translate(0, ${200-30})`)
		.attr("id", "x-axis");

	// y axis
	svg.append("g")
		.attr("id", "y-axis");

	hourly();

	d3.selectAll('input[type="button"]').on('click', e => {

		d3.selectAll('input[type="radio"]').each( function(e) {

			d3.select(this).property('checked', (e[0] === 0));

		});

		d3.selectAll('input[type="text"]').property('value', '');
		Object.keys(graphs).forEach( t => graphs[t].id = 0 );
		Object.keys(graphs).forEach( t => drawtab(t) );
		drawxuids();

		d3.selectAll("table").each( function() { this.scroll(0, 0) } );
		numbers();
		hourly();

	});

	function checkcompact() {

		var compact = d3.select("#compact").property('checked');
		d3.selectAll("p").style("display", compact ? "none" : null);
		d3.selectAll("ul").style("display", compact ? "none" : null);

	}

	d3.select("#compact").on('click', e => checkcompact() );
	checkcompact();

}

function filter()	{

	drawtab('titles');

}
