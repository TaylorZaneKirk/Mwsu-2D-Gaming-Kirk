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

        <?php
            //Just test stuff
//            $host = '127.0.0.1';
//            $db   = 'bank';
//            $user = 'root';
//            $pass = '1VT2yQtVjX';
//            $charset = 'utf8';
//
//            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
//            $opt = [
//                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
//                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
//                PDO::ATTR_EMULATE_PREPARES   => false,
//            ];
//            $pdo = new PDO($dsn, $user, $pass, $opt);

            $db = new PDO('mysql:host=127.0.0.1; dbname=bank; charset=utf8', 'root', '1VT2yQtVjX');
            $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); //disable emulation
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); //should turn this off


           if (isset($_GET['account'])){
               echo 'hello';
               $account = $_GET['account'];

//               $preparedQuery = $PDO->prepare('SELECT * FROM accounts WHERE account_id = ?');
//               $preparedQuery->bind_param('s', $account);
            }
            else{
                //Display form
                echo '<form action="" method="get">
                    Please Enter your Account information:<br>
                    <input type="text" maxlength="40" size="30" name="AccountQuery" id="account"><br>
                    <input type="submit" value="Check" name="AccountInfo"><br>
                </form>';
            }
        ?>

    </body>

</html>
