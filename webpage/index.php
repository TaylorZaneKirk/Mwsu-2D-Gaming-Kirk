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
            ////////////////////
            //Connect to Server
            ///////////////////

            //Server creditials
            $host = '127.0.0.1';
            $db   = 'bank';
            $user = 'root';
            $pass = '1VT2yQtVjX';

            $dbConnect = new mysqli($host, $user, $pass, $db);  //attempt to connect to db

            $account = $_GET['AccountQuery'];   //Account number specified by user

            if(mysqli_connect_errno()){
                //Could not establish a connection to the database

                echo 'No Server Response';
                exit;
            }

            /////////////////////////
            //Begin to validate input
            /////////////////////////
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
                    //  this is a 'catch-all' for anything that might get through the
                    //  first two, but message to user will be less specific

                    echo 'Request Refused: Input must only contain Numerical Characters';
                }
                else{
                    //Input is valid, one final pass to sanitize input with a filter
                    $properInfo = filter_var($account, FILTER_SANITIZE_NUMBER_INT);
                    $account = $properInfo;

                    //List off working-account
                    echo 'Current Account: ' . $account . '<br>';

                    //Use a prepared statement to further limit possibility of attack
                    if($preparedQuery = $dbConnect->prepare('SELECT ISNULL(SELECT balance FROM accounts WHERE account_id=?),0')){

                        $preparedQuery->bind_param('s', $account);  //'?' from above query becomes $account

                        $preparedQuery->execute();  //send the query to db

                        $preparedQuery->bind_result($balance);  //the result of the query can
                                                                //ONLY be placed in $balance

                        $preparedQuery->fetch();    //get result of query

                        //Display balance of the account to the user
                        echo 'Your Current Balance: ' . $balance;

                        $preparedQuery->close();    //secure close
                    }
                }
            }

            $dbConnect->close();  //secure close
        ?>

    </body>

</html>
