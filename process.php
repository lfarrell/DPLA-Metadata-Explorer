<?php

$q = strip_tags(trim($_GET['q']));
$full_call = $q . "&facets=sourceResource.type,provider.name,sourceResource.language.name,sourceResource.subject.name&page_size=0&facet_size=2&api_key=f6dc841964a13a22398a3b3e47f525d6";

$ch = curl_init($full_call);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$data =  curl_exec($ch);
curl_close($ch);