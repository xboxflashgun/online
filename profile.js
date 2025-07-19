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
	d3.select("#updated").text(age);
	d3.select("#day-days").text( (age === 1) ? "" : "s" );

	var bio = prof.bio;
	bio ??= prof.detail.bio;
	d3.select("#bio").style("display", bio ? null : "none");
	d3.select("#bioph").text(bio);

	var loc = prof.location;
	loc ??= prof.detail.location;
	d3.select("#location").style("display", loc ? null : "none");
	d3.select("#locph").text(loc);
	

}
