<!--
Name: Taylor Kirk
Professor: Dr. Passos
Class: Web-App Security
Date: 7/25/16
-->

<html>

    <head>

        <title>Security Project</title>

    </head>

    <body>

        <form action="" method="GET">
            Please Enter your Account information:<br>
            <input type="text" maxlength="40" size="30" name="AccountQuery" id="account"><br>
            <input type="submit" name="AccountInfo"><br>
        </form>

        <?php
            //Just test stuff
            $host = '127.0.0.1';
            $db   = 'bank';
            $user = 'root';
            $pass = '1VT2yQtVjX';
            $charset = 'utf8';

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $opt = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new mysqli($host, $user, $pass, $db);
//
//            $db = new PDO('mysql:host=127.0.0.1; dbname=bank; charset=utf8', 'root', '1VT2yQtVjX');
//            $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); //disable emulation
//            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); //should turn this off

            $account = $_GET['AccountQuery'];

            if(mysqli_connect_errno()){
                echo 'No Server Response';
                exit;
            }

           if (empty($account)){
               //Display form
               echo 'Please Enter Account Number Above';
            }
            else{
                echo 'hello, ' . $account . '<br>';

                if($preparedQuery = $pdo->prepare('SELECT balance FROM accounts WHERE account_id=?')){
                    $preparedQuery->bind_param('s', $account);
                    $preparedQuery->execute();
                    $preparedQuery->bind_result($balance);
                    $preparedQuery->fetch();

                    echo 'Your Result: ' . $balance;

                    $preparedQuery->close();
                }
            }
            $pdo->close();
        ?>

    </body>

</html>
