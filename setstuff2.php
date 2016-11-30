<?php
    require "conn.php";
    echo "test-1";
    //$uid = $_GET['uid'];
    //$IPaddress = $_GET['IPaddress'];
    //$serviceid = $_GET['serviceid'];
    //$servicename = $_GET['servicename'];
    //$servicedesc = $_GET['servicedesc'];
    //$serviceprice = $_GET['serviceprice'];
    //$Memory = $_GET['Memory'];
    //$Processor = $_GET['Processor'];
    //$Storage = $_GET['Storage'];

    $uid = 2;
    //$IPaddress = $_GET['IPaddress'];
    $serviceid = 1;
    $servicename = "LAMP";
    $servicedesc = "Linux, Apache, MySQL, PHP";
    $serviceprice = 4.99;
    $Memory = 512;
    $Processor = "Xenon";
    $Storage = 10240;

    //generate a random IPaddress string
    $IPaddress = "".mt_rand(0,255).".".mt_rand(0,255).".".mt_rand(0,255).".".mt_rand(0,255);
    
    echo "test0 " . $uid . " " . $serviceid . " " . $IPaddress;
    //User just bought a server, add their server to userservers
    if($preparedQuery = $conn->prepare('INSERT INTO userservers (uid, serviceid, IPaddress) VALUES (?, ?, ?)')){
        $preparedQuery->bind_param('iis', $uid, $serviceid, $IPaddress);
        $preparedQuery->execute();
        //If using preset types, job is done. If user is using a custom type, first
        //  check to see if there is already a custom type on record that matches
        //  all configurations of THIS custom type. If there is a match, update
        //  the serviceid record on the userservers to use that matching type.
        //  If there is no match returned, create a new serviceid on the nimbusioservices
        //  and then update the serviceid record on the userservers to reflect
        //  the new serviceid
        $preparedQuery->store_result();
        echo "test1";
    }
        
    if($serviceid == 0){ //Is custom?

        //Check if this custom type already has a record
        if($preparedQuery2 = $conn->prepare('SELECT serviceid FROM nimbusioservices WHERE servicename=? AND servicedesc=? AND serviceprice=? AND Processor=? AND Memory=? AND Storage=?')){
            $preparedQuery2->bind_param('ssisii', $servicename, $servicedesc, $serviceprice, $Processor, $Memory, $Storage);
            $preparedQuery2->execute();
            $preparedQuery2->store_result();
            $preparedQuery2->bind_result($newserviceid);

            if($preparedQuery2->fetch()){ //Found a match, update userservers and use this type instead
                //Pretty much do nothing
            }
            else{ //No match found, create new type
                //Get the max value from the serviceid column of the nimbusioservices
                if($preparedQuery3 = $conn->prepare('SELECT MAX(serviceid) FROM nimbusioservices')){
                    $preparedQuery3->execute();
                    $preparedQuery3->store_result();
                    $preparedQuery3->bind_result($maxType);

                    $newserviceid = $maxType + 1;
                    $preparedQuery3->close();
                }

                //Insert new type record into nimbusioservices, we want serviceid to be set 
                //  to AUTO-INCREMENT on the backend-side for new records that are inserted
                //  into the table of the nimbusioservices. Ideally, this incremented record should
                //  match the value of the variable $newserviceid at this point
                if($preparedQuery4 = $conn->prepare('INSERT INTO nimbusioservices (servicename, servicedesc, serviceprice, Processor, Memory, Storage) VALUES (?,?,?,?,?)')){
                    $preparedQuery4->bind_param('ssisii', $servicename, $servicedesc, $serviceprice, $Processor, $Memory, $Storage);
                    $preparedQuery4->execute();
                    $preparedQuery4->store_result();
                    $preparedQuery4->close();
                }

                //Now we update userservers to reflect changes for custom type
                //UPDATE userservers SET serviceid=$newserviceid WHERE uid=$uid AND serviceid=serviceid
                if($preparedQuery5 = $conn->prepare('UPDATE userservers SET serverid=? WHERE uid=? AND serverid=?')){
                    $preparedQuery5->bind_param('iii', $newserviceid, $uid, $serviceid)
                    $preparedQuery5->execute();
                    $preparedQuery5->store_result();
                    $preparedQuery5->close();
                }
            }
            $preparedQuery2->close();
        }
    }
?>