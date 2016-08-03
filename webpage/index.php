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
            $db = new PDO('mysql:dbname=bank; host=127.0.0.1; charset=utf8', 'root', '1VT2yQtVjX') or die("system down");
            $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); //disable emulation
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); //should turn this off


            $preparedQuery = $PDO->prepare('SELECT * FROM bank WHERE account_id = ?');
//            if ($preparedQuery->execute($_GET['account']){
//                foreach($preparedQuery as $item){
//                    echo 'hi';
//                }
//            }
//            else{
//                //Display form
//                echo '<form action="" method="get">
//                    Please Enter your Account information:<br>
//                    <input type="text" maxlength="40" size="30" name="AccountQuery" id="account"><br>
//                    <input type="submit" value="Check" name="AccountInfo"><br>
//                </form>';
//            }
        ?>

    </body>

</html>
