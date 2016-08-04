<!--
Name: Taylor Kirk
Professor: Dr. Passos
Class: Web-App Security
Date: 8/4/16
-->

<html>

    <head>

        <title>Security Project</title>

    </head>

    <body>

        <form action="" method="GET">
            Please Enter your Account information:<br>
            <input type="text" maxlength="20" size="30" name="AccountQuery" id="account"><br>
            <input type="submit" name="AccountInfo"><br>
        </form>

        <?php

        //Server creditials
        $host = '127.0.0.1';
        $db   = 'bank';
        $user = 'root';
        $pass = '1VT2yQtVjX';

        $dbConnect = new mysqli($host, $user, $pass, $db);

        $account = $_GET['AccountQuery'];

        if(mysqli_connect_errno()){

            echo 'No Server Response';
            exit;
        }

        $unsafeQuery = "SELECT * FROM accounts WHERE account_id=" . $account;
        $result = mysqli_query($dbConnect, $unsafeQuery);

        if(mysqli_num_rows($result) > 0){
            while($row = mysqli_fetch_assoc($result)){
                echo "acount: " . $row["account_id"] . "<br>";
            }
        }
        else{
            echo "table empty";
        }

        $dbConnect->close();
        ?>

    </body>

</html>
