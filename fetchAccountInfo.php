<?php
    require "conn.php";
    $user_name = 'vcmandalapu';

    if($preparedQuery = $conn->prepare('SELECT uid, firstname, lastname, email, phone FROM nimbusiouser WHERE username=?')){
        $preparedQuery->bind_param('s', $user_name);
        $preparedQuery->execute();
        $preparedQuery->bind_result($res);
        echo($res);
        $result = array();
        array_push($result, array("uid"=>$res['uid'],"firstname"=>$res['firstname'],"lastname"=>$res['lastname'],"email"=>$res['email'],"phone"=>$res['phone']));
        echo json_encode(array("result"=>$result));
    }

    $preparedQuery->close();
?>