<?php
    require "conn.php";
    $user_name = 'vcmandalapu';

    if($preparedQuery = $conn->prepare('SELECT uid, firstname, lastname, email, phone FROM nimbusiouser WHERE username=?')){
        echo "true";
        $preparedQuery->bind_param('s', $user_name);
        $preparedQuery->execute();
        $preparedQuery->bind_result($r_uid, $r_firstname, $r_lastname, $r_email, $r_email, $r_phone);
        if($preparedQuery->fetch()){
            echo($r_email);
            $result = array();
            array_push($result, array("uid"=>$r_uid,"firstname"=>$r_firstname,"lastname"=>$r_lastname,"email"=>$r_email,"phone"=>$r_phone));
            echo json_encode(array("result"=>$result));
        }
        else{
            echo "error";
        }
        
    }

    $preparedQuery->close();
?>