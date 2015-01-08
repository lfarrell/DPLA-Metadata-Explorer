<?php
include 'functions.php';

$q = format(clean($_GET['q']));
$path = "http://api.lib.harvard.edu/v2/items.json?q=$q&facets=copyrightDate,genre,publisher,resourceType,subject&limit=0";
$records = get_records($path);

$data = json_decode($records, true);
$values = array();

$copyrights = $data['facets']['facetField'][0]['facet'];
$genres = $data['facets']['facetField'][1]['facet'];
//$languages = $data['search']['facets']['facetName'];
$publishers = $data['facets']['facetField'][2]['facet']; //print_r($publishers); exit;
$resources = $data['facets']['facetField'][3]['facet'];
$subjects = $data['facets']['facetField'][4]['facet'];

$i = 0;
foreach($copyrights as $copyright) {
    $values[$i]['term'] = $copyright['term'];
    $values[$i]['count'] = $copyright['count'];
    $values[$i]['type'] = 'Copyright Date';
    $i++;
}

foreach($genres as $genre) {
    $values[$i]['term'] = $genre['term'];
    $values[$i]['count'] = $genre['count'];
    $values[$i]['type'] = 'Genre';
    $i++;
}

foreach($publishers as $publisher) {
    $values[$i]['term'] = $publisher['term'];
    $values[$i]['count'] = $publisher['count'];
    $values[$i]['type'] = 'Publisher';
    $i++;
}

foreach($resources as $resource) {
    $values[$i]['term'] = $resource['term'];
    $values[$i]['count'] = $resource['count'];
    $values[$i]['type'] = 'Resource';
    $i++;
}

foreach($subjects as $subject) {
    $values[$i]['term'] = $subject['term'];
    $values[$i]['count'] = $subject['count'];
    $values[$i]['type'] = 'Subject';
    $i++;
}

echo json_encode($values);