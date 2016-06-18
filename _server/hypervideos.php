<?php

require_once("./config.php");

/**
 * @param $projectID
 * @param $resourcesID
 * @param $name
 * @param $description
 * @param $config
 * @return mixed
 *
Returning Code:
0		=	Success. Hypervideo has been added. Returning new Object in response
1		=	failed. User not logged in
2		=	failed. User not active
3		=	failed. Could not find the projects resources folder
4		=	failed. Name (min 3 chars) or Description have not been submitted.
5		=	failed. resourcesID is not found or no video
 *
 */
function hypervideoAdd($projectID, $resourcesID, $duration = false, $name, $description, $hidden, $start = 0, $end = 0, $in = 0, $out = 0, $config, $subtitles) {

	global $conf;

	if ($_SESSION["ohv"]["projects"][$projectID]["login"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Not logged in or projectID is wrong.";
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["projects"][$projectID]["user"] = array_replace_recursive($_SESSION["ohv"]["projects"][$projectID]["user"], $u["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]);
	}

	if ($_SESSION["ohv"]["projects"][$projectID]["user"]["active"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "User not activated";
		return $return;
	}
	if (!is_dir($conf["dir"]["projects"]."/".$projectID."/resources")) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Could not find the projects resources folder";
		return $return;
	}

	if ((!$description) || (!$name) || (strlen($name) <3)) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "Name (min 3 chars) or Description have not been submitted.";
		return $return;
	}

	$json = file_get_contents($conf["dir"]["projects"]."/".$projectID."/resources/_index.json");
	$res = json_decode($json,true);

	if (((!$resourcesID) || (!$res["resources"][$resourcesID]) || ($res["resources"][$resourcesID]["type"] != "video")) && (!$duration)) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "resourcesID is not found or no video and duration is not set";
		return $return;
	}
	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/hypervideos/_index.json");
	$json = $file->read();
	$hv = json_decode($json,true);
	$hv["hypervideo-increment"]++;
	$newHVdir = $conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hv["hypervideo-increment"];
	mkdir($newHVdir);
	mkdir($newHVdir."/annotationfiles");
	mkdir($newHVdir."/subtitles");
	if (!is_array($config)) {
		$config = Array();
	}
	$projectConfig = file_get_contents($conf["dir"]["projects"]."/_index.json");
	$projectConfig = json_decode($projectConfig,true);
	$projectConfig = $projectConfig["projects"][$projectID];
	$time = time();
	$newHV["name"] = $name;
	$newHV["description"] = $description;
	$newHV["thumb"] = $res["resources"][$resourcesID]["thumb"];
	$newHV["creator"] = $_SESSION["ohv"]["projects"][$projectID]["user"]["name"];
	$newHV["creatorId"] = (string)$_SESSION["ohv"]["projects"][$projectID]["user"]["id"];
	$newHV["created"] = $time;
	$newHV["lastchanged"] = $time;
	$newHV["hidden"] = (boolean)$hidden;
	$newHV["config"]["annotationsVisible"] = true;
	$newHV["config"]["annotationsPosition"] = "bottom";
	$newHV["config"]["annotationTimelineVisible"] = true;
	$newHV["config"]["annotationPreviewVisible"] = false;
	$newHV["config"]["videolinksVisible"] = false;
	$newHV["config"]["videolinkTimelineVisible"] = true;
	$newHV["config"]["overlaysVisible"] = true;
	$newHV["config"]["slidingMode"] = "adjust";
	$newHV["config"]["slidingTrigger"] = "key";
	$newHV["config"]["theme"] = "CssClassName";
	$newHV["config"]["autohideControls"] = true;
	$newHV["config"] = array_replace_recursive($newHV["config"], $projectConfig["defaultHypervideoConfig"], $config);
	foreach ($newHV["config"] as $k=>$v) {
		if (($v == "true") || ($v == "false")) {
			$newHV["config"][$k] = filter_var($v, FILTER_VALIDATE_BOOLEAN);
		}
	}
	$newHV["mainAnnotation"] = "1";
	$newHV["annotationfiles"]["1"]["name"] = "main";
	$newHV["annotationfiles"]["1"]["description"] = "";
	$newHV["annotationfiles"]["1"]["created"] = $time;
	$newHV["annotationfiles"]["1"]["lastchanged"] = $time;
	$newHV["annotationfiles"]["1"]["hidden"] = false;
	$newHV["annotationfiles"]["1"]["owner"] = $_SESSION["ohv"]["projects"][$projectID]["user"]["name"];
	$newHV["annotationfiles"]["1"]["ownerId"] = (string)$_SESSION["ohv"]["projects"][$projectID]["user"]["id"];
	$newHV["annotation-increment"] = 1;
	$newHV["subtitles"] = [];
	if ($subtitles) {
		foreach ($subtitles["name"] as $subtitleKey=>$subtitleName) {
			$tmpObj["src"] = $subtitleKey.".vtt";
			$tmpObj["srclang"] = $subtitleKey;
			$newHV["subtitles"][] = $tmpObj;
			move_uploaded_file($subtitles["tmp_name"][$subtitleKey], $newHVdir."/subtitles/".$subtitleKey.".vtt");
		}
	}
	$hv["hypervideos"][$hv["hypervideo-increment"]] = $newHV;
	$file->writeClose(json_encode($hv, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));

	$hvf["clips"][0]["resourceId"] = $resourcesID;
	$hvf["clips"][0]["duration"] = (int)$duration;
	$hvf["clips"][0]["start"] = (int)$start;
	$hvf["clips"][0]["end"] = (int)$end;
	$hvf["clips"][0]["in"] = (int)$in;
	$hvf["clips"][0]["out"] = (int)$out;
	file_put_contents($newHVdir."/hypervideo.json",json_encode($hvf, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
	$tmp = array();
	file_put_contents($newHVdir."/links.json",json_encode($tmp, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
	file_put_contents($newHVdir."/overlays.json",json_encode($tmp, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
	file_put_contents($newHVdir."/codeSnippets.json",json_encode($tmp, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
	file_put_contents($newHVdir."/annotationfiles/1.json",json_encode($tmp, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));

	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Hypervideo has been added. look at response";
	$return["response"] = $newHV;
	$return["newHypervideoID"] = $hv["hypervideo-increment"];
	return $return;
}

/**
 * @param $projectID
 * @param $hypervideoID
 * @param $name
 * @param $description
 * @return mixed
 *
Returning Code:
0		=	Success. Hypervideo has been cloned. Returning new Object in response
1		=	failed. User not logged in
2		=	failed. User not active
3		=	failed. Could not find the projects resources folder
4		=	failed. Name (min 3 chars) or Description have not been submitted.
5		=	failed. hypervideoID has not been found
 */
function hypervideoClone($projectID, $hypervideoID, $name, $description) {

	global $conf;

	if ($_SESSION["ohv"]["projects"][$projectID]["login"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Not logged in or projectID is wrong.";
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["projects"][$projectID]["user"] = array_replace_recursive($_SESSION["ohv"]["projects"][$projectID]["user"], $u["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]);
	}

	if ($_SESSION["ohv"]["projects"][$projectID]["user"]["active"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "User not activated";
		return $return;
	}
	if (!is_dir($conf["dir"]["projects"]."/".$projectID."/resources")) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Could not find the projects resources folder";
		return $return;
	}

	if ((!$description) || (!$name) || (strlen($name) <3)) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "Name (min 3 chars) or Description have not been submitted.";
		return $return;
	}

	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/hypervideos/_index.json");
	$json = $file->read();
	$hv = json_decode($json,true);
	if (!is_array($hv["hypervideos"][$hypervideoID])) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "hypervideoID seems to be wrong.";
		$file->close();
		return $return;
	}
	$hv["hypervideo-increment"]++;
	mkdir($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hv["hypervideo-increment"]);
	copyr($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID, $conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hv["hypervideo-increment"]);
	$time = time();
	$newHV = $hv["hypervideos"][$hypervideoID];
	$newHV["name"] = $name;
	$newHV["description"] = $description;
	$newHV["creator"] = $_SESSION["ohv"]["projects"][$projectID]["user"]["name"];
	$newHV["creatorId"] = (string)$_SESSION["ohv"]["projects"][$projectID]["user"]["id"];
	$newHV["created"] = $time;
	$newHV["lastchanged"] = $time;

	if ($newHV["annotationfiles"]["1"]["ownerId"] != $_SESSION["ohv"]["projects"][$projectID]["user"]["id"]) {
		$tmpFound = 0;
		//$newAnnotations = array();
		$oldAnnotationfiles = $newHV["annotationfiles"];
		$newAnnotationfile = array();
		foreach ($oldAnnotationfiles as $k=>$v) {
			if ($v["ownerId"] == $_SESSION["ohv"]["projects"][$projectID]["user"]["id"]) {
				$tmpFound = 1;
				$newAnnotationfile["1"] = $v;
				rename($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hv["hypervideo-increment"]."/annotationfiles/".$k.".json", $conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hv["hypervideo-increment"]."/annotationfiles/1.json");
			} elseif ($k != 1) {
				unlink($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hv["hypervideo-increment"]."/annotationfiles/".$k.".json");
			}
		}
		if ($tmpFound == 0) {
			file_put_contents($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hv["hypervideo-increment"]."/annotationfiles/1.json", "[]");
			$newAnnotationfile["1"]["name"] = $name;
			$newAnnotationfile["1"]["description"] = $description;
			$newAnnotationfile["1"]["hidden"] = false;
			$newAnnotationfile["1"]["owner"] = $_SESSION["ohv"]["projects"][$projectID]["user"]["name"];
			$newAnnotationfile["1"]["ownerId"] = (string)$_SESSION["ohv"]["projects"][$projectID]["user"]["id"];
		}
	} else {

		foreach ($newHV["annotationfiles"] as $k=>$v) {
			if ($k != 1) {
				unlink($conf["dir"]["projects"] . "/" . $projectID . "/hypervideos/" . $hv["hypervideo-increment"] . "/annotationfiles/" . $k . ".json");
			}
		}
		$newAnnotationfile["1"]["name"] = $name;
		$newAnnotationfile["1"]["description"] = $description;
		$newAnnotationfile["1"]["hidden"] = false;
		$newAnnotationfile["1"]["owner"] = $_SESSION["ohv"]["projects"][$projectID]["user"]["name"];
		$newAnnotationfile["1"]["ownerId"] = (string)$_SESSION["ohv"]["projects"][$projectID]["user"]["id"];
	}
	$newHV["mainAnnotation"] = "1";
	$newHV["annotation-increment"] = 1;
	$newHV["annotationfiles"] = $newAnnotationfile;
	$newHV["annotationfiles"]["1"]["created"] = $time;
	$newHV["annotationfiles"]["1"]["lastchanged"] = $time;

	$hv["hypervideos"][$hv["hypervideo-increment"]] = $newHV;
	$file->writeClose(json_encode($hv, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
	/* TODO: How to handle annotation/overlay/links files? */

	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Hypervideo has been cloned. look at response";
	$return["response"] = $hv["hypervideos"][$hv["hypervideo-increment"]];
	$return["newHypervideoID"] = $hv["hypervideo-increment"];
	$return["clonedFrom"] = $hypervideoID;
	return $return;
}

/**
 * @param $projectID
 * @param $hypervideoID
 * @param $hypervideoName
 * @return mixed
 *
Returning Code:
0		=	Success. Hypervideo deleted.
1		=	failed. Not logged in to the projectID.
2		=	failed. User not active
3		=	failed. Could not find the projects hypervideosID folder
4		=	failed. hypervideoID could not be found in database.
5		=	failed. hypervideoName is not correct.
6		=	failed. permission denied! The User is not an admin, nor is it his own hypervideo.
 */
function hypervideoDelete($projectID,$hypervideoID,$hypervideoName) {
	global $conf;

	if ($_SESSION["ohv"]["projects"][$projectID]["login"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Not logged in to the projectID.";
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["projects"][$projectID]["user"] = array_replace_recursive($_SESSION["ohv"]["projects"][$projectID]["user"], $u["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]);
	}

	$json = file_get_contents($conf["dir"]["projects"]."/".$projectID."/users.json");
	$userdb = json_decode($json,true);
	$userdb["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]["id"] = $_SESSION["ohv"]["projects"][$projectID]["user"]["id"];
	$_SESSION["ohv"]["projects"][$projectID]["user"] = $userdb["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]];

	if ($_SESSION["ohv"]["projects"][$projectID]["user"]["active"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "User not activated.";
		return $return;
	}

	if (!is_dir($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID)) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Could not find the projects hypervideosID folder";
		return $return;
	}
	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/hypervideos/_index.json");
	$json = $file->read();
	$hv = json_decode($json,true);

	if (!is_array($hv["hypervideos"][$hypervideoID])) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "hypervideoID could not be found in database.";
		$file->close();
		return $return;
	}
	if (strtolower($hv["hypervideos"][$hypervideoID]["name"]) != strtolower($hypervideoName)) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "hypervideoName is not correct.";
		$file->close();
		return $return;
	}
	if (($_SESSION["ohv"]["projects"][$projectID]["user"]["role"] != "admin") && ($_SESSION["ohv"]["projects"][$projectID]["user"]["id"] != $hv["hypervideos"][$hypervideoID]["creatorId"])) {
		$return["status"] = "fail";
		$return["code"] = 6;
		$return["string"] = "permission denied! The User is not an admin, nor is it his own hypervideo.";
		$file->close();
		return $return;
	}
	rrmdir($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID);
	unset($hv["hypervideos"][$hypervideoID]);
	$file->writeClose(json_encode($hv, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Hypervideo deleted.";
	return $return;
}


/**
 * @param $projectID
 * @param $hypervideoID
 * @param bool $name
 * @param bool $description
 * @param string $hidden
 * @param bool $config
 * @return mixed
 *

 *
 */
function hypervideoChange($projectID, $hypervideoID, $name = false, $description = false, $hidden = "", $config = false, $subtitlesToDelete = false, $subtitles = false) {
	global $conf;

	if ($_SESSION["ohv"]["projects"][$projectID]["login"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Not logged in to the projectID.";
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["projects"][$projectID]["user"] = array_replace_recursive($_SESSION["ohv"]["projects"][$projectID]["user"], $u["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]);
	}

	if ($_SESSION["ohv"]["projects"][$projectID]["user"]["active"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "User not activated.";
		return $return;
	}

	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/hypervideos/_index.json");
	$json = $file->read();
	$hv = json_decode($json,true);

	if (!is_array($hv["hypervideos"][$hypervideoID])) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "HypervideoID not found.";
		$file->close();
		return $return;
	}

	if (($hv["hypervideos"][$hypervideoID]["creatorId"] != $_SESSION["ohv"]["projects"][$projectID]["user"]["id"]) && ($_SESSION["ohv"]["projects"][$projectID]["user"]["role"] != "admin")) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "permission denied! The User is not an admin, nor is it his own hypervideo.";
		$file->close();
		return $return;
	}
	if ( (($name) && (strlen($name) < 3)) || !($name) ) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "You tried to change the name but it has to be min. 3 characters.";
		$file->close();
		return $return;
	}

	if ($name) {
		$hv["hypervideos"][$hypervideoID]["name"] = $name;
	}
	if ($description) {
		$hv["hypervideos"][$hypervideoID]["description"] = $description;
	}
	if ($hidden !== "") {
		$hv["hypervideos"][$hypervideoID]["hidden"] = (boolean)$hidden;
	}
	if (is_array($config)) {
		foreach ($config as $k=>$v) {
			if (($v == "true") || ($v == "false")) {
				$config[$k] = filter_var($v, FILTER_VALIDATE_BOOLEAN);
			}
		}

		$hv["hypervideos"][$hypervideoID]["config"] = array_replace_recursive($hv["hypervideos"][$hypervideoID]["config"], $config);
	}
	if ($subtitlesToDelete) {
		foreach($subtitlesToDelete as $sd) {
			foreach ($hv["hypervideos"][$hypervideoID]["subtitles"] as $sk=>$s) {
				if ($sd == $s["srclang"]) {
					unlink($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/subtitles/".$s["src"]);
					unset($hv["hypervideos"][$hypervideoID]["subtitles"][$sk]);
				}
			}
		}
		$hv["hypervideos"][$hypervideoID]["subtitles"] = array_values($hv["hypervideos"][$hypervideoID]["subtitles"]);
	}
	if ($subtitles) {
		if (!is_dir($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/subtitles")) {
			mkdir($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/subtitles");
		}
		if (!$hv["hypervideos"][$hypervideoID]["subtitles"]) {
			$hv["hypervideos"][$hypervideoID]["subtitles"] = [];
		}
		//$subtitles = $subtitles["subtitles"];
		foreach ($subtitles["name"] as $subtitleKey=>$subtitleName) {
			$tmpFound = 0;
			foreach($hv["hypervideos"][$hypervideoID]["subtitles"] as $k=>$v) {
				if ($v["srclang"] == $subtitleKey) {
					$tmpFound++;
				}
			}
			if ($tmpFound === 0) {
				$tmpObj["src"] = $subtitleKey.".vtt";
				$tmpObj["srclang"] = $subtitleKey;
				$hv["hypervideos"][$hypervideoID]["subtitles"][] = $tmpObj;
			}
			move_uploaded_file($subtitles["tmp_name"][$subtitleKey], $conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/subtitles/".$subtitleKey.".vtt");
		}
	}
	$file->writeClose(json_encode($hv, $conf["settings"]["json_flags"]));
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Hypervideo has been updated.";
	$return["response"] = $hv["hypervideos"][$hypervideoID];
	return $return;
}




/**
 * @param $projectID
 * @param $hypervideoID
 * @param $type
 * @param $src
 * @return mixed
 *
Returning Code:
0		=	Success. File has been written
1		=	failed. Not logged in to the projectID.
2		=	failed. User not active
3		=	failed. type not correct. ("overlays", "links")
4		=	failed. HypervideoID not found.
5		=	failed. permission denied! The User is not an admin, nor is it his own hypervideo.
 *
 */
function hypervideoChangeFile($projectID,$hypervideoID,$type,$src) {
	global $conf;

	if ($_SESSION["ohv"]["projects"][$projectID]["login"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Not logged in to the projectID.";
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["projects"][$projectID]["user"] = array_replace_recursive($_SESSION["ohv"]["projects"][$projectID]["user"], $u["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]);
	}

	if ($_SESSION["ohv"]["projects"][$projectID]["user"]["active"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "User not activated.";
		return $return;
	}

	if (($type != "links") && ($type != "overlays") && ($type != "codeSnippets")) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "type not correct.";
		return $return;
	}

	$json = file_get_contents($conf["dir"]["projects"]."/".$projectID."/hypervideos/_index.json");
	$hv = json_decode($json,true);

	if (!is_array($hv["hypervideos"][$hypervideoID])) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "HypervideoID not found.";
		return $return;
	}

	if (($hv["hypervideos"][$hypervideoID]["creatorId"] != $_SESSION["ohv"]["projects"][$projectID]["user"]["id"]) && ($_SESSION["ohv"]["projects"][$projectID]["user"]["role"] != "admin")) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "permission denied! The User is not an admin, nor is it his own hypervideo.";
		return $return;
	}

	if (!file_exists($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/".$type.".json")) {
		file_put_contents($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/".$type.".json","");
	}

	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/".$type.".json");
	$src = json_decode($src,true);
	$src = json_encode($src, $conf["settings"]["json_flags"]);
	$file->writeClose($src);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = $type." has been changed.";
	return $return;
}
?>