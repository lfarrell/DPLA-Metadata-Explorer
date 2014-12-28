<?php
include 'functions.php';
include 'keys.php';
$_GET['q'] = 'Queensland';
$q = clean($_GET['q']);
$path = "http://api.trove.nla.gov.au/result?key=$trove_key&zone=newspaper&q=$q&facet=format,year,decade,language,category";
//echo $path; exit;
$records = get_records($path);


$data = simplexml_load_string($records);

$values = array();

$facets = $data->zone->facets; print_r($facets);
foreach($facets as $facet) {

        print_r($facet);
    echo '<br><br>';
  //  print_r($facet); exit;
}
//print_r($languages); exit;

echo json_encode($values);