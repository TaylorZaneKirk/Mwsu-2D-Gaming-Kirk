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
    if($preparedQuery = $conn->prepare('INSERT INTO userservers (uid, serviceid, IPaddress) VALUES (?,?,?)')){
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
        
       

        $preparedQuery->close();
    }
?>