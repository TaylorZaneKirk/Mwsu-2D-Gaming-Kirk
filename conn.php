<?php
	////////////////////
	//Connect to Server
	///////////////////
	//Server creditials
	$host = 'localhost';
	$db   = 'nimbus_android';
	$user = 'root';
	$pass = '1VT2yQtVjX'; //please do not hack me, Passos
	$conn = new mysqli($host, $user, $pass, $db);  //attempt to connect to db
	
	if(mysqli_connect_errno()){
		//Could not establish a connection to the database
		echo 'No Server Response';
		exit;
	}

    $user_name = 'username1';
    $password = 'userpassword';
?>