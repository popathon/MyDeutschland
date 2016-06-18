<?php
error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING);

session_start();

//DIR
$conf["dir"]["data"] = "../_data";
$conf["dir"]["projects"] = $conf["dir"]["data"]."/projects";

//JSON Return
$conf["settings"]["json_flags"] = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;

require_once("functions.incl.php");

?>