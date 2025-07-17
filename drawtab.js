
function to64(str)	{
	return btoa( String.fromCodePoint(...new TextEncoder().encode(str)));
}


function drawtab(table)	{

	var filter = '';

	if(table === 'titles') {

		filter = d3.select("#filter").property('value');
		if(filter .length > 0)
			filter = to64(filter);

	}

	var url = `api/getcsv.php?f=gettab&tab=${table}&fld=${graphs[table].fld}&filter=${filter}`;
	Object.keys(graphs).forEach( t => url += `&${graphs[t].fld}=${graphs[t].id}` );

	d3.select(`#${table}`).style('opacity', 0.2);

	fetch(url)
	.then( res => res.text() )
	.then( res => {
		
		var tab = [];
		res.split('\n').forEach( s => {

			if(s.length === 0)
				return;

			var row = s.split('\t');
			row[0] = (row[0] === '\\N') ? 0 : +row[0];
			row[1] = +row[1];
			tab.push(row);

		});

		if(table === 'titles')	{

			var need = [];
			tab.forEach( r => {
				if( ! dicts[table][r[0]])
					need.push(r[0]);
			});

			if(need.length > 0)	{

				fetch("api/getcsv.php?f=gettitles&titles=" + need.join(','))
				.then( res => res.text() )
				.then( res => {

					res.split('\n').forEach( s => {

						if(s.length === 0)
							return;

						var row = s.split('\t');
						dicts[table][+row[0]] = row[1];

					});

					drawtab(table);
					return;

				});

				return;

			}

		}

		function filltab()	{

			d3.select(`#${table} tr.placeholder`).remove();

			var filter = '';
			if(graphs[table].filter)
				filter = d3.select("#filter-" + table).property('value').toLowerCase();

			d3.select(`#${table}`).selectAll('tr')
			.data( tab
				.filter(d => ( dicts[table][d[0]].toLowerCase().indexOf(filter) >= 0 ))
				.sort( (a,b) => b[1] - a[1]) )
			.join( enter => {

				var tr = enter.append('tr');
				var td = tr.append('td');
				td.append('label').text(d => dicts[table][d[0]])
					.append('input').attr('type','radio').attr('name', table)
					.property('value', d => d[0]).property('checked', (d => d[0] === graphs[table].id));
				tr.append('td').attr('title', d => d[1])
					.text(d => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: 'compact' }).format(d[1]));
				tr.append('td').append('div').style('width', d => 100.*d[1]/tab[0][1] + '%')
					.style('background', d=>graphs[table].color).classed('rect', true);
				tr.append('td').text( d => (100.*d[1]/tab[0][1]).toFixed(2) + '%');

			}, update => {

				update.select('td:nth-child(1) label').text(d => dicts[table][d[0]])
					.append('input').attr('type','radio').attr('name', table).property('value', d => d[0])
					.property('checked', (d => d[0] === graphs[table].id));
				update.select('td:nth-child(2)').attr('title', d => d[1])
					.text(d => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: 'compact' }).format(d[1]));
				update.select('td:nth-child(3) div').style('width', d => 100.*d[1]/tab[0][1] + '%');
				update.select('td:nth-child(4)').text( d => (100.*d[1]/tab[0][1]).toFixed(2) + '%');
	
			}, exit => {
	
				exit.remove();
			
			});

			d3.select(`#${table}`).selectAll('input[type="radio"]').on('change', e => {

				graphs[table].id = +e.target.value;

				Object.keys(graphs).forEach( t => {
					if(t !== table)
						drawtab(t);
				});

				drawxuids();
				hourly();

			});

		}

		filltab();

		if(graphs[table].filter)
			d3.select("#filter-" + table).on('input', filltab);

		d3.select(`#${table}`).style('opacity', null);

	});

}
