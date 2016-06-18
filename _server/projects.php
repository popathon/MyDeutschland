<?php

require_once("./config.php");

function superUserLogin($password = false) {
	global $conf;

	include_once($conf["dir"]["data"]."/masterpassword.php");

	if (($password) && ($password == $masterpassword)) {
		$return["status"] = "success";
		$return["code"] = 0;
		$return["string"] = "login success";
		$_SESSION["masterpassword"] = $password;
	} elseif ($_SESSION["masterpassword"] == $masterpassword) {
		$return["status"] = "success";
		$return["code"] = 0;
		$return["string"] = "login success";
	} else {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Masterpassword not correct";
		unset($_SESSION["masterpassword"]);
	}
	return $return;
}


function superUserLogout() {
	unset($_SESSION["masterpassword"]);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "superuser logged out";
	return $return;
}

/**
 * @param bool $details
 * @return object
 */
function projectsGet($details = false, $login = false) {
	global $conf;
	$json = file_get_contents($conf["dir"]["projects"]."/_index.json");
	$pDB = json_decode($json,true);
	if ($details) {
		foreach ($pDB["projects"] as $k=>$v) {
			$json = file_get_contents($conf["dir"]["projects"]."/".$k."/hypervideos/_index.json");
			$pDB["projects"][$k]["hypervideos"] = json_decode($json,true);
		}
	}
	if ($login) {
		include_once("user.php");
		foreach ($pDB["projects"] as $k=>$v) {
			if ($_SESSION["ohv"]["projects"][$k]["login"] == 1) {
				$pDB["projects"][$k]["login"] = 1;
				$pDB["projects"][$k]["loginUser"] = userGet($k,$_SESSION["ohv"]["projects"][$k]["user"]["id"])["response"];
				$pDB["loggedInProjects"][] = $k;
			}
		}
	}
	$return["status"] = "success";
	$return["code"] = 200;
	$return["string"] = "see response";
	$return["response"] = $pDB;
	return $return;
}

function projectsNew($name, $description, $config, $userNeedsConfirmation, $defaultUserRole, $theme, $overviewMode, $defaultHypervideoHidden) {
	global $conf;
	$login = superUserLogin();

	if ($login["status"] == "fail") {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "User not logged in with Masterpassword";
		return $return;
	}
	$file = new sharedFile($conf["dir"]["projects"]."/_index.json");
	$projects = $file->read();
	$projects = json_decode($projects,true);

	if (strlen($name) < 3) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Please enter a name with at least 3 characters";
		$file->close();
		return $return;
	} elseif (strlen($description) < 3) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "Please enter a description with at least 3 characters";
		$file->close();
		return $return;
	}

	$projects["project-increment"]++;

	mkdir($conf["dir"]["projects"]."/".$projects["project-increment"]);
	mkdir($conf["dir"]["projects"]."/".$projects["project-increment"]."/hypervideos");
	mkdir($conf["dir"]["projects"]."/".$projects["project-increment"]."/resources");
	file_put_contents($conf["dir"]["projects"]."/".$projects["project-increment"]."/users.json", json_encode(array("user-increment"=>1,"user"=>array())),$conf["settings"]["json_flags"]);
	file_put_contents($conf["dir"]["projects"]."/".$projects["project-increment"]."/hypervideos/_index.json", json_encode(array("hypervideo-increment"=>1,"hypervideos"=>array())),$conf["settings"]["json_flags"]);
	file_put_contents($conf["dir"]["projects"]."/".$projects["project-increment"]."/resources/_index.json", json_encode(array("resources-increment"=>1,"resources"=>array())),$conf["settings"]["json_flags"]);

	$projects["projects"][$projects["project-increment"]]["name"] = $name;
	$projects["projects"][$projects["project-increment"]]["description"] = $description;
	$projects["projects"][$projects["project-increment"]]["created"] = time();
	$projects["projects"][$projects["project-increment"]]["userNeedsConfirmation"] = filter_var($userNeedsConfirmation, FILTER_VALIDATE_BOOLEAN);
	$projects["projects"][$projects["project-increment"]]["defaultUserRole"] = $defaultUserRole;
	$projects["projects"][$projects["project-increment"]]["defaultHypervideoHidden"] = filter_var($defaultHypervideoHidden, FILTER_VALIDATE_BOOLEAN);
	$projects["projects"][$projects["project-increment"]]["theme"] = $theme;
	$projects["projects"][$projects["project-increment"]]["overviewMode"] = $overviewMode;

	foreach ($config as $k=>$v) {
		if (($v == "true") || ($v == "false")) {
			$config[$k] = filter_var($v, FILTER_VALIDATE_BOOLEAN);
		}
	}

	$projects["projects"][$projects["project-increment"]]["defaultHypervideoConfig"] = $config;
	$projects = json_encode($projects, $conf["settings"]["json_flags"]);
	$file->writeClose($projects);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Project has been created";
	return $return;
}

function projectsEdit($projectID, $name, $description, $config, $userNeedsConfirmation, $defaultUserRole, $theme, $overviewMode, $defaultHypervideoHidden) {
	global $conf;

	/* Check for User is ProjectAdmin */

	if ($_SESSION["ohv"]["projects"][$projectID]["login"]) {
		$tmp = json_decode(file_get_contents($conf["dir"]["projects"]."/".$projectID."/users.json"), true);
		$tmpUserIsAdmin = ($tmp["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]["role"] == "admin") ? true : false;
	}

	/* Check for Masterpassword */
	$login = superUserLogin();
	if (($login["status"] == "fail") && (!$tmpUserIsAdmin)) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "User not logged in with Masterpassword and is no logged in Admin of this Project";
		return $return;
	}

	$file = new sharedFile($conf["dir"]["projects"]."/_index.json");
	$projects = $file->read();
	$projects = json_decode($projects,true);

	if (strlen($name) < 3) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Please enter a name with at least 3 characters";
		$file->close();
		return $return;
	} elseif (strlen($description) < 3) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "Please enter a description with at least 3 characters";
		$file->close();
		return $return;
	} elseif (!is_array($projects["projects"][$projectID])) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "ProjectID has not been found";
		$file->close();
		return $return;
	}

	$projects["projects"][$projectID]["name"] = $name;
	$projects["projects"][$projectID]["description"] = $description;
	$projects["projects"][$projectID]["userNeedsConfirmation"] = filter_var($userNeedsConfirmation, FILTER_VALIDATE_BOOLEAN);
	$projects["projects"][$projectID]["defaultUserRole"] = $defaultUserRole;
	$projects["projects"][$projectID]["defaultHypervideoHidden"] = filter_var($defaultHypervideoHidden, FILTER_VALIDATE_BOOLEAN);
	$projects["projects"][$projectID]["theme"] = $theme;
	$projects["projects"][$projectID]["overviewMode"] = $overviewMode;
	foreach ($config as $k=>$v) {
		if (($v == "true") || ($v == "false")) {
			$config[$k] = filter_var($v, FILTER_VALIDATE_BOOLEAN);
		}
	}

	$projects["projects"][$projectID]["defaultHypervideoConfig"] = $config;


	$projects = json_encode($projects, $conf["settings"]["json_flags"]);
	$file->writeClose($projects);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Project has been saved";
	$return["response"] = $projects["projects"][$projectID];
	$return["projectID"] = $projectID;
	return $return;
}

function projectsDelete($projectID, $name) {
	global $conf;
	$login = superUserLogin();
	if ($login["status"] == "fail") {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "User not logged in with Masterpassword";
		return $return;
	}
	$file = new sharedFile($conf["dir"]["projects"]."/_index.json");
	$projects = $file->read();
	$projects = json_decode($projects,true);

	if ($name != $projects["projects"][$projectID]["name"]) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "ProjectName was not correct";
		$file->close();
		return $return;
	} if (!is_numeric($projectID)) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "ProjectID is not nummeric";
		$file->close();
		return $return;
	}

	rrmdir($conf["dir"]["projects"]."/".$projectID);
	unset($projects["projects"][$projectID]);

	$projects = json_encode($projects, $conf["settings"]["json_flags"]);
	$file->writeClose($projects);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Project has been deleted";
	$return["projectID"] = $projectID;
	return $return;
}