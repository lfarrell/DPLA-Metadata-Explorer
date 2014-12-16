<?php
include 'functions.php';
include 'keys.php';

$q = clean($_GET['q']);
$path = "http://europeana.eu/api/v2/search.json?wskey=$europeana_key&query=$q&rows=0&profile=facets";
$records = get_records($path);

$data = json_decode($records, true);
$values = array();

$languages = $data['facets'][1]['fields'];
$types = $data['facets'][2]['fields'];
$years = $data['facets'][3]['fields'];
$providers = $data['facets'][4]['fields'];
$countries = $data['facets'][6]['fields'];
$rights = $data['facets'][7]['fields'];

$i = 0;
foreach($languages as $language) {
    $values[$i]['term'] = $language['label'];
    $values[$i]['count'] = $language['count'];
    $values[$i]['type'] = 'Language';
    $i++;
}

foreach($types as $type) {
    $values[$i]['term'] = $type['label'];
    $values[$i]['count'] = $type['count'];
    $values[$i]['type'] = 'Type';
    $i++;
}

foreach($years as $year) {
    $values[$i]['term'] = $year['label'];
    $values[$i]['count'] = $year['count'];
    $values[$i]['type'] = 'Year';
    $i++;
}

foreach($providers as $provider) {
    $values[$i]['term'] = $provider['label'];
    $values[$i]['count'] = $provider['count'];
    $values[$i]['type'] = 'Provider';
    $i++;
}

foreach($countries as $country) {
    $values[$i]['term'] = $country['label'];
    $values[$i]['count'] = $country['count'];
    $values[$i]['type'] = 'Country';
    $i++;
}

foreach($rights as $right) {
    $values[$i]['term'] = $right['label'];
    $values[$i]['count'] = $right['count'];
    $values[$i]['type'] = 'Rights';
    $i++;
}

echo json_encode($values);