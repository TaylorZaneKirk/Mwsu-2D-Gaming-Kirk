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
        $preparedQuery->bind_param('ss', $uname, $uemail);
        $preparedQuery->execute();
        $preparedQuery->bind_result($matches_un, $matches_em);

        if($preparedQuery->fetch()){
            //match found, refuse
            echo 'Error: Account with your chosen username or email already exists!';
            $preparedQuery->close();
        }
        else{
            //No record exists, add one...
            if($preparedQuery = $conn->prepare('INSERT into nimbusiouser (username, firstname, lastname, password, email, phone) VALUES (?, ?, ?, ?, ?, ?)')){
                echo 'hello2';
                $preparedQuery->bind_param('ssssss', $uname, $fname, $lname, $upass, $uemail, $uphone); 
                $preparedQuery->execute();

                echo 'Row inserted';
            }
            else{
                echo "Error: ".$conn->error;
            }
            $preparedQuery->close();
        }
    }
    
    $conn.close();
?>