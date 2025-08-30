var datetime = (e) => (new Date(+e * 1000)).toLocaleString().slice(0,17);
var shortnum = (e) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: 'compact' }).format(+e);

var numblist = {
	asof: {
		req: "maxtime",
		parser: datetime
	},
	avgtime: {
		req: "avgtime",
		parser: (e) => (+e).toFixed(1)
	},
	xuids: {
		req: "gamers",
		parser: shortnum
	},
	active: {
		req: "active",
		parser: shortnum
	},
}

function numbers()	{

	d3.selectAll("span.numbers").each( function() {

		var id = this.id;

		fetch("api/getcsv.php?f=getnumber&req=" + numblist[id].req)
		.then( res => res.text() )
		.then( res => {

			d3.select(this).text(numblist[id].parser(res));

		});

	});

}
