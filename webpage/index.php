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

            //errorCodes[0] = Empty Input
            //errorCodes[1] = Alpha chars
            //errorCodes[2] = Special chars
            $errorCodes = array(0, 0, 0, 0);

            $pdo = new mysqli($host, $user, $pass, $db);
//
//            $db = new PDO('mysql:host=127.0.0.1; dbname=bank; charset=utf8', 'root', '1VT2yQtVjX');
//            $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false); //disable emulation
//            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); //should turn this off

            $account = $_GET['AccountQuery'];

            if(mysqli_connect_errno()){
                //Could not establish a connection to the database
                echo 'No Server Response';
                exit;
            }

           if (empty($account)){
               //input is empty
               echo 'Please Enter Account Number Above';
            }
            elseif (strlen($account) != 20){
                //Input is not expected length
                echo 'Request Refused: Your Account Number should be 20 digits in length.';
            }
            else{

                if (preg_match("/[a-zA-Z]/", $account, $match)){
                    //Match any alpha-character input
                    echo 'Request Refused: No Alpha-Characters Allowed';
                }
                elseif (preg_match("/[\W]+/", $account, $match)){
                    //Match any 'non-word' input (flags special chars)
                    echo 'Request Refused: No Special Characters Allowed';
                }
                elseif (!preg_match("/[0-9]/", $account, $match)){
                    //Trigger if any input is explicitly NOT a number
                    echo 'Request Refused: Input must only contain Numerical Characters';
                }
                else{
                    $properInfo = abs((int) filter_var($account, FILTER_SANITIZE_NUMBER_INT));
                    $account = $properInfo;
                    echo 'hello, ' . $account . '<br>';

                    if($preparedQuery = $pdo->prepare('SELECT balance FROM accounts WHERE account_id=?')){
                        $preparedQuery->bind_param('s', $account);
                        $preparedQuery->execute();
                        $preparedQuery->bind_result($balance);
                        $preparedQuery->fetch();



                        echo 'Your Current Balance: ' . $balance;

                        $preparedQuery->close();
                    }
                }
            }


            $pdo->close();
        ?>

    </body>

</html>
