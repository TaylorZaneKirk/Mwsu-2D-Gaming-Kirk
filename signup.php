<?php
    require "conn.php";

    //$fname = $_POST["first_name"];
    //$lname = $_POST["last_name"];
    //$uname = $_POST["user_name"];
    //$upass = $_POST["password"];
    //$uemail = $_POST["user_email"];
    //$uphone = $_POST["user_phone"];

    $fname = 'test1';
    $lname = 'test1';
    $uname = 'test1';
    $upass = 'test1';
    $uemail = 'test1@test.com';
    $uphone = '9784561236';

    //check if there is already an account associated with specified username or email
    if($preparedQuery = $conn->prepare('SELECT * FROM numbusiouser WHERE username=? OR email=?')){
        echo 'hello1';
       
    }
    
    $conn.close();
?>