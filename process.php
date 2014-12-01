<?php
$_GET['q'] = 'stone';
$q = strip_tags(trim($_GET['q']));
$full_call = "http://api.dp.la/v2/items?q=" . $q . "&facets=sourceResource.type,provider.name,sourceResource.language.name,sourceResource.spatial.country,sourceResource.spatial.state,sourceResource.subject.name&page_size=0&facet_size=2&api_key=f6dc841964a13a22398a3b3e47f525d6";

$ch = curl_init($full_call);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$data =  curl_exec($ch);
curl_close($ch);

$data = json_decode($data, true);
$values = array();

$count = $data['count'];
$formats = $data['facets']['sourceResource.type']['terms'];
$providers = $data['facets']['provider.name']['terms'];
$languages = $data['facets']['sourceResource.language.name']['terms'];
$countries = $data['facets']['sourceResource.spatial.country']['terms'];
$states = $data['facets']['sourceResource.spatial.state']['terms'];
$subjects = $data['facets']['sourceResource.subject.name']['terms'];

$i = 0;
foreach($formats as $format) {
    $values[$i]['term'] = $format['term'];
    $values[$i]['count'] = $format['count'];
    $values[$i]['type'] = 'format';
    $i++;
}

foreach($providers as $provider) {
    $values[$i]['term'] = $provider['term'];
    $values[$i]['count'] = $provider['count'];
    $values[$i]['type'] = 'provider';
    $i++;
}

foreach($languages as $language) {
    $values[$i]['term'] = $language['term'];
    $values[$i]['count'] = $language['count'];
    $values[$i]['type'] = 'language';
    $i++;
}

foreach($countries as $country) {
    $values[$i]['term'] = $country['term'];
    $values[$i]['count'] = $country['count'];
    $values[$i]['type'] = 'country';
    $i++;
}

foreach($states as $state) {
    $values[$i]['term'] = $state['term'];
    $values[$i]['count'] = $state['count'];
    $values[$i]['type'] = 'state';
    $i++;
}

foreach($subjects as $subject) {
    $values[$i]['term'] = $subject['term'];
    $values[$i]['count'] = $subject['count'];
    $values[$i]['type'] = 'subject';
    $i++;
}

echo json_encode($values);