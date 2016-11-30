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

            echo "test2 " . $r_serverid . " " . $r_IPaddress;

            if($preparedQuery = $conn->prepare('SELECT servicename, servicedesc, serviceprice, Memory, Processor, Storage FROM nimbusioservices WHERE serviceid=?')){
                $preparedQuery->bind_param('i', $r_serverid);
                $preparedQuery->execute();
                $preparedQuery->bind_result($r_servicename, $r_servicedesc, $r_serviceprice, $r_Memory, $r_Processor, $r_Storage);

                echo "test3 " . $r_servicedesc;

                if($preparedQuery->fetch()){
                    $result = array();
                    array_push($result, array("IPaddress"=>$r_IPaddress, "serviceid"=>$r_serverid, "servicename"=>$r_servicename, "servicedesc"=>$r_servicedesc, "serviceprice"=>$r_serviceprice, "Memory"=>$r_Memory, "Processor"=>$r_Processor, "Storage"=>$r_Storage));
                    echo json_encode(array("result"=>$result));
                }
             }
             else{
                 echo "error: services call error";
             }
        }
        else{
            echo "error: Record does not exist.";
        }
    }

    $preparedQuery->close();
?>