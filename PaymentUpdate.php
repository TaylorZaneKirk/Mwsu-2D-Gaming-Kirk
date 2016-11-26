<?php
    require "conn.php";

    //$ccuid = $_POST["cc_uid"];
    //$ccn= $_POST["cc_number"];
    //$ccun= $_POST["cc_name"];
    //$cced= $_POST["cc_exp"];
    //$cci = $_POST["cc_issuer"];
   // $cccvv = $_POST["cc_security"];
   // $ccadd1 = $_POST["cc_add1"];
   // $ccadd2 = $_POST["cc_add2"];
   // $cczip = $_POST["cc_zip"];

    $ccuid = 1;
    $ccn = 1234123412341235;
    $ccun = 'Taylor';
    $cced = '02/2017';
    $cci = 'Visa';
    $cccvv = 666;
    $ccadd1 = "1234";
    $ccadd2 = 'TX';
    $cczip = 76367;

    if($preparedQuery = $conn->prepare('SELECT * FROM nimbusiouserpayment WHERE uid=? AND cardnumber=?')){
        $preparedQuery->bind_param('ii', $ccuid, $ccn);
        $preparedQuery->execute();

        if($preparedQuery->fetch()){
            //match found, refuse
            echo 'Error: This card already exists!';
        }
        else{
             if($preparedQuery = $conn->prepare('INSERT into nimbusiouserpayment (uid, cardnumber, nameoncard, expdate, ccissuer, cvv, addressl1, addressl2, zipcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')){
                $preparedQuery->bind_param('iisssissi', $ccuid, $ccn, $ccun, $cced, $cci, $cccvv, $ccadd1, $ccadd2, $cczip); 
                if($preparedQuery->execute()){
                    echo 'Card Added!';
                }
                else{
                    echo "Error: ".$conn->error;
                }
            }
            else{
                echo "Error: ".$conn->error;
            }
        }
        $preparedQuery->close();
    }

    $conn.close();
?>