<?php
include 'functions.php';
include 'keys.php';

$q = clean($_GET['q']);
$path = "http://api.digitalnz.org/v3/records.json?api_key=$digital_nz_key&text=$q&facets=creator,year,category,content_partner";
$records = get_records($path);

$data = json_decode($records, true);
$values = array();

echo json_encode($values);