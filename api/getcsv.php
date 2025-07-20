<?php

header('Content-type: text/csv');
header("Cache-control: private");

foreach ($_GET as $k => $v)     {

	if(preg_match('/[^0-9a-z_-]/', $k) ||
		preg_match('/[^0-9A-Za-z =\/\-\+],/', $v))

		die("Oops: $k, $v");

}

$mc = new Memcached('xboxstat4');
if (!count($mc->getServerList()))
	$mc->addServer( '127.0.0.1', 11211 );

$rep = $mc->get($_SERVER['QUERY_STRING']);

if( $rep )      {
	echo $rep;
	return 0;
}

$db = pg_pconnect("port=6432 host=/tmp dbname=global user=readonly password=masha27uk")
	or die("could not connect to DB");

$rows = array();
$timeout = 60;

if( preg_match('/^(get|add|del)/', $_GET['f']) )
    $_GET['f']();

$rep = implode($rows);

$mc->set($_SERVER['QUERY_STRING'], $rep, $timeout);
header("Cache-control: max-age=$timeout");
echo $rep;



// usage: GET http://host/api/getcsv.php?f=func&par=parameters

function getnumber()	{

	static $reqs = array(
		"avgtime" => "select avg(secs)/60. from perflog where prog='presence' and prestime>=now()-interval '1 day'",
		"maxtime" => "select max(utime) from presence where secs is null",
		"gamers"  => "select gamers from history2 order by hdate desc limit 1",
		"active"  => "select weekgamers from history2 order by hdate desc limit 1",
		"gtready" => "select count(*) filter (where gt is not null)/count(*)::float from profiles",
	);

	global $db, $rows;

	$rows = pg_copy_to($db, "(" . $reqs[$_GET['req']] . ")", chr(9));

}

function gettitles()	{

	global $db, $rows;

	$titles = $_GET['titles'];

	$rows = pg_copy_to($db, "(
		select titleid,name from games where titleid=any(array[$titles])
	)", chr(9));

}


function getxuids()	{

	global $db, $rows;

	$devid = $_GET['devid'];
	$genreid = $_GET['genreid'];
	$titleid = $_GET['titleid'];
	$countryid = $_GET['countryid'];
	$langid = $_GET['langid'];

	$where = '';
	$joing = '';

	if($devid)
		$where .= "and presence.devid=$devid\n";

	if($genreid)
		$where .= "and genreid=$genreid\n";

	if($titleid)
		$where .= "and presence.titleid=$titleid\n";

	if($countryid)
		$where .= "and countryid=$countryid\n";

	if($langid)
		$where .= "and langid=$langid\n";

	$rows = pg_copy_to($db, "(

		select 
			coalesce(gt,xuid::text) as gt,
			devname,
			games.name,
			countries.name,
			languages.name,
			utime,
			profile,
			extract(days from now()-scanned),
			xuid
		from presence
		join gamers using(xuid)
		join profiles using(xuid)
		join games using(titleid)
		join devices using(devid)
		join countries using(countryid)
		join languages using(langid)
		left join gamegenres using(titleid)
		where
			utime >= extract(epoch from now()-interval'1 day')::int and secs is null
		$where
			and profile->>'linkedAccounts' <> '[]'
		group by 1,2,3,4,5,6,7,8,9
		order by utime desc,3,2,4
		limit 100

	)", chr(9));

}


function gettab()	{		// tab = { devices, countries, langs, genres, titles }

	global $db, $rows;

	$tab = $_GET['tab'];
	$devid = $_GET['devid'];
	$genreid = $_GET['genreid'];
	$titleid = $_GET['titleid'];
	$countryid = $_GET['countryid'];
	$langid = $_GET['langid'];
	$fld = $_GET['fld'];
	$filter = $_GET['filter'];

	$where = '';
	$joing = '';
	$joinx = '';

	if($devid and $tab != 'devices')
		$where .= "and devid=$devid\n";

	if($genreid and $tab != 'genres')	{
		$where .= "and genreid=$genreid\n";
		$joing = "left join gamegenres using (titleid)\n";
	}

	if($tab == 'genres')
		$joing = "left join gamegenres using (titleid)\n";

	if($titleid and $tab != 'titles')
		$where .= "and titleid=$titleid\n";

	if($countryid and $tab != 'countries')	{
		$where .= "and countryid=$countryid\n";
		$joinx = "join gamers using(xuid)\n";
	}

	if($langid and $tab != 'langs')	{
		$where .= "and langid=$langid\n";
		$joinx = "join gamers using(xuid)\n";
	}

	if($tab == 'langs' or $tab == 'countries')
		$joinx = "join gamers using(xuid)\n";

	if($tab == 'titles' and strlen($filter) > 0) {
		$joinx .= "join games using(titleid)\n";
		$where .= "and name ilike '%" . pg_escape_string($db, base64_decode($filter)) . "%'\n";
	}

	if($fld == 'genreid')
		$fld = "coalesce(genreid,13248) as genreid";		// "Not specified" for empty strings

	$rows = pg_copy_to($db, "(

		select 
			$fld,count(*) 
		from presence 
		$joing
		$joinx
		where
			utime >= extract(epoch from now()-interval'1 day')::int and secs is null
		$where
		group by cube(1)
		order by 2 desc
		limit 150

	)", chr(9));

}

function gethourly()	{

	global $db, $rows;

	$devid = $_GET['devid'];
	$genreid = $_GET['genreid'];
	$titleid = $_GET['titleid'];
	$countryid = $_GET['countryid'];
	$langid = $_GET['langid'];

	$where = "true\n";
	$joing = "";

	if($devid)
		$where .= "and devid=$devid\n";

	if($genreid)	{
		$where .= "and genreid=$genreid\n";
		$joing = "left join gamegenres using (titleid)\n";
	}

	if($titleid)
		$where .= "and titleid=$titleid\n";

	if($countryid)
		$where .= "and countryid=$countryid\n";

	if($langid)
		$where .= "and langid=$langid\n";

	$rows = pg_copy_to($db, "(
	
		with tab as (
			select 
				utime,
				sum(gamers) as gamers
			from aggs.hourly_histo
			$joing
			where
				$where
			group by 1
		union
			select
	 			u as utime,
	 			0 as gamers
	 		from
	 			generate_series(
	 				(select min(utime) from aggs.hourly_histo),
	 				(select max(utime) from aggs.hourly_histo),
	 				3600) u
		) select
			utime,
			max(gamers) as gamers
		from tab
		group by 1
		order by 1

	)", chr(9));

}
