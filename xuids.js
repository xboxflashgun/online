function drawxuids()	{

	var url = "api/getcsv.php?f=getxuids";
	Object.keys(graphs).forEach( t => {
		url += `&${graphs[t].fld}=${graphs[t].id}`
	});

	d3.select('#gamers').style('opacity', 0.2);
	
	fetch(url)
	.then( res => res.text() )
	.then( res => {
		
		var tab = [];
		res.split('\n').forEach( s => {

			if(s.length === 0)
				return;

			var row = s.split('\t');
			row[5] = (new Date(+row[5] * 1000)).toLocaleString().slice(12,17);
			if(row[0].length < 16 && row[0].slice(0,1) !== '2')
				row[0] = `<a href="https://www.xbox.com/play/user/${row[0]}" target="_blank">${row[0]}</a>`;
			tab.push(row);

		});

		d3.select(`#gamers tr.placeholder`).remove();

		d3.select('#gamers').selectAll('tr')
		.data( tab )
		.join( enter => {

			var tr = enter.append('tr');
			tr.append('td').html( d => d[0] );		// gt
			tr.append('td').text( d => d[1] );		// 
			tr.append('td').text( d => d[2] );
			tr.append('td').text( d => d[3] );
			tr.append('td').text( d => d[4] );
			tr.append('td').text( d => d[5] );

		}, update => {

			update.select('td:nth-child(1)').html(d => d[0]);
			update.select('td:nth-child(2)').text(d => d[1]);
			update.select('td:nth-child(3)').text(d => d[2]);
			update.select('td:nth-child(4)').text(d => d[3]);
			update.select('td:nth-child(5)').text(d => d[4]);
			update.select('td:nth-child(6)').text(d => d[5]);

		}, exit => {

			exit.remove();
		
		});

		d3.select('#gamers').style('opacity', null);

	});

}
