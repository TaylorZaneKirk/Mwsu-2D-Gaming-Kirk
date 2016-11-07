<?php
	require "conn.php";
    echo 'test';
    echo $user_name;
	if($preparedQuery = $conn->prepare('SELECT password FROM userlogin WHERE username=?')){
		$preparedQuery->bind_param('s', $user_name);  //'?' from above query becomes $account
		$preparedQuery->execute();  //send the query to db
		$preparedQuery->bind_result($user_data);  //the result of the query can
												//ONLY be placed in $user_data, which needs to be shared between all activities
		//get result of query
		if($preparedQuery->fetch()){
			//fetch was good, do the displays
			//List working-account
			echo 'login success !!!!! Welcome ' . $user_name;
		}
		else{
			//input was good, but record does not exist in db
			echo 'Request Refused: Please check your username or password and try again';
		}
		$preparedQuery->close();    //secure close
    }
?>