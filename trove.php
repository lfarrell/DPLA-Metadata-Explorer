<?php
include 'functions.php';

$_GET['q'] = 'stone';
$q = clean($_GET['q']);
$path = "http://api.dp.la/v2/items?q=" . $q . "&facets=sourceResource.type,provider.name,sourceResource.language.name,sourceResource.spatial.country,sourceResource.spatial.state,sourceResource.subject.name&page_size=0&facet_size=2&api_key=f6dc841964a13a22398a3b3e47f525d6";
$records = get_records($path);

$data = json_decode($records, true);
$values = array();