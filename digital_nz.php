<?php
include 'functions.php';
include 'keys.php';

$q = clean($_GET['q']);
$path = "http://api.digitalnz.org/v3/records.json?api_key=$digital_nz_key&text=$q&facets=placename,creator,year,category,language,content_partner&facet_per_page=50&per_page=0";
$records = get_records($path);

$data = json_decode($records, true);
$values = array();

$place_names = $data['search']['facets']['placename'];
$creators = $data['search']['facets']['category'];
$years = $data['search']['facets']['year'];
$categories = $data['search']['facets']['category'];
$languages = $data['search']['facets']['language'];
$providers = $data['search']['facets']['content_provider'];

$i = 0;
foreach($place_names as $key => $place_name) {
    $values[$i]['term'] = $key;
    $values[$i]['count'] = $place_name;
    $values[$i]['type'] = 'place';
    $i++;
}

foreach($creators as $key => $creator) {
    $values[$i]['term'] = $key;
    $values[$i]['count'] = $creator;
    $values[$i]['type'] = 'creator';
    $i++;
}

foreach($years as $key => $year) {
    $values[$i]['term'] = $key;
    $values[$i]['count'] = $year;
    $values[$i]['type'] = 'year';
    $i++;
}

foreach($categories as $key => $category) {
    $values[$i]['term'] = $key;
    $values[$i]['count'] = $category;
    $values[$i]['type'] = 'category';
    $i++;
}

foreach($languages as $key => $language) {
    $values[$i]['term'] = $key;
    $values[$i]['count'] = $language;
    $values[$i]['type'] = 'language';
    $i++;
}

foreach($providers as $key => $provider) {
    $values[$i]['term'] = $key;
    $values[$i]['count'] = $provider;
    $values[$i]['type'] = 'provider';
    $i++;
}

echo json_encode($values);