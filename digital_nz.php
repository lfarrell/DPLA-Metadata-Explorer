<?php
include 'functions.php';
include 'keys.php';

$_GET['q'] = 'stone';
$q = clean($_GET['q']);
$path = "http://api.digitalnz.org/v3/records.json?api_key=$digital_nz_key";
$records = get_records($path);

$data = json_decode($records, true);
$values = array();