function profile(e, p, age)	{

	const prof = Object.fromEntries(
		Object.entries(p).map(([k, v]) => [k.toLowerCase(), v])
	);

	d3.select("#profile").style("top", e.pageY + 4 + "px").style("left", e.pageX + 4 + "px").style("display", null);

	console.log(prof);

	d3.select("#pic").attr("src", "/img/person-holder.png");

	d3.select("#gt").text(prof.moderngamertag);
	d3.select("#suffix").style("display", (prof.moderngamertagsuffix === "") ? "none" : null).text("#" + prof.moderngamertagsuffix);

	if(prof.gamertag !== prof.uniquemoderngamertag)
	d3.select("#oldgt").classed("hidden", prof.gamertag === prof.uniquemoderngamertag).text("(" + prof.gamertag + ")");

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

	if(prof.preferredcolor)
		d3.select("#profile").style("background-color", '#' + prof.preferredcolor.primaryColor);
	
	if(prof.linkedaccounts && prof.linkedaccounts.length > 0)	{

		const nets = {
			Discord:	{
				logo: "Discord-Symbol-Blurple.svg"
			},
			Reddit: 	{
				logo: "reddit.svg"
			},
			Steam: 		{
				logo: "Steam_icon_logo.svg"
			},
			Twitch: 	{
				logo: "glitch_flat_purple.svg"
			},
			YouTube:	{
				logo: "youtube_social_icon_red.png"
			}
		};

		var td = d3.select("#accph");
		td.selectAll('*').remove();

		prof.linkedaccounts.forEach( n => {

			var net = n.networkName;

			console.log(n);
			
			var div = td.append('div');
			div.append("img").attr('src', '/img/' + nets[net].logo).style('height', '24px');
			div.append("span").classed("netacc", true).text(n.displayName);

		});

	}

}
