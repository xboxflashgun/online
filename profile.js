function profile(e, p, age)	{

	const prof = Object.fromEntries(
		Object.entries(p).map(([k, v]) => [k.toLowerCase(), v])
	);

	d3.select("#pic").style("display", "none");
	d3.select("#person").style("display", null);

	console.log(prof, prof.ModernGamertagSuffix);

	d3.select("#gt").text(prof.moderngamertag);
	d3.select("#suffix").style("display", (prof.moderngamertagsuffix === "") ? "none" : null).text("#" + prof.moderngamertagsuffix);
	d3.select("#realname").style("display", (prof.realnameoverride === "") ? "none" : null).text(prof.realnameoverride);

	d3.select("#gamerscore").text(prof.gamerscore);

	var pic = (prof.gamedisplaypicraw) ? prof.gamedisplaypicraw : prof.displaypicraw;

	d3.select("#pic").attr("src", pic + "&w=200&h=200").on('load', (e) => {
		d3.select(e.target).style("display", null);
		d3.select("#person").style("display", "none");
	});



}
