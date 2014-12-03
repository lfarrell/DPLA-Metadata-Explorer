<?php
include 'functions.php';
include 'keys.php';

$_GET['q'] = 'stone';
$q = clean($_GET['q']);
$path = "http://europeana.eu/api/v2/search.json?wskey=$europeana_key&query=$q&rows=0&profile=facets";
$records = get_records($path);

$data = json_decode($records, true);
$values = array();

echo json_encode($values);