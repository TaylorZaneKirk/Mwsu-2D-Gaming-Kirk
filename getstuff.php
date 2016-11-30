<?php
    require "conn.php";

    //$uid = $_GET['uid'];
    $uid = 2;

    if($preparedQuery = $conn->prepare('SELECT IPaddress, serverid FROM userservers WHERE uid=?')){
        
        echo "test1";

        $preparedQuery->bind_param('i', $uid);
        $preparedQuery->execute();
        $preparedQuery->bind_result($r_IPaddress, $r_serverid);
        if($preparedQuery->fetch()){

            echo "test2" . $r_serverid;

            if($preparedQuery = $conn->prepare('SELECT serverName, serverDesc, serverRAM, serverProc, serverSpace FROM servicesTable WHERE serverid=?')){
                $preparedQuery->bind_param('i', $r_serverid);
                $preparedQuery->execute();
                $preparedQuery->bind_result($r_serverName, $r_serverDesc, $r_serverRAM, $r_serverProc, $r_serverSpace);

                if($preparedQuery->fetch()){
                    $result = array();
                    array_push($result, array("IPaddress"=>$r_IPaddress, "serverName"=>$r_serverName, "serverDesc"=>$r_serverDesc, "serverRam"=>$r_serverRAM, "serverProc"=>$r_serverProc, "serverSpace"=>$r_serverSpace));
                    echo json_encode(array("result"=>$result));
                }
             }
        }
        else{
            echo "error: Record does not exist.";
        }
    }

    $preparedQuery->close();
?>