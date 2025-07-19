function profile(e, p, age)	{

	const prof = Object.fromEntries(
		Object.entries(p).map(([k, v]) => [k.toLowerCase(), v])
	);

	d3.select("#pic").attr("src", "/img/person-holder.png");

	console.log(prof, prof.ModernGamertagSuffix);

	d3.select("#gt").text(prof.moderngamertag);
	d3.select("#suffix").style("display", (prof.moderngamertagsuffix === "") ? "none" : null).text("#" + prof.moderngamertagsuffix);

	var realname = (prof.realnameoverride) ? prof.realnameoverride : prof.realname;
	d3.select("#realname").style("display", (realname === "") ? "none" : null).text(realname);

	d3.select("#gamerscore").text(prof.gamerscore);

	var pic = (prof.gamedisplaypicraw) ? prof.gamedisplaypicraw : prof.displaypicraw;

	d3.select("#pic").attr("src", pic + "&w=200&h=200");



}
