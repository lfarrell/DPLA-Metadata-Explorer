<?php
include 'functions.php';
include 'keys.php';

$q = clean($_GET['q']);
$path = "http://api.trove.nla.gov.au/result?key=$trove_key&zone=all&q=$q&facet=format";
$records = get_records($path);

$data = json_decode($records, true);
$values = array();

echo json_encode($values);