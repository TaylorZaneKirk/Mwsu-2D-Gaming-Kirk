<!--
Name: Taylor Kirk
Professor: Dr. Passos
Class: Web-App Security
Date: 8/3/16
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
            ////////////////////
            //Connect to Server
            ///////////////////

            //Server creditials
            $host = '127.0.0.1';
            $db   = 'bank';
            $user = 'root';
            $pass = '1VT2yQtVjX'; //please do not hack me, Passos

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

               echo 'Please enter Account Number above';
            }
            elseif (strlen($account) != 20){
                //Input is not expected length

                echo 'Request Refused: Your Account Number must be 20 digits in length';
            }
            else{

                if (preg_match("/[a-zA-Z]/", $account, $match)){
                    //Match any alpha-character input

                    echo 'Request Refused: No Alpha-Characters allowed';
                }
                elseif (preg_match("/[\W]+/", $account, $match)){
                    //Match any 'non-word' input (flags special chars)

                    echo 'Request Refused: No Special Characters allowed';
                }
                elseif (!preg_match("/[0-9]/", $account, $match)){
                    //Trigger if any input is explicitly NOT a number
                    //  this is a 'catch-all' for anything that might get through the
                    //  first two filters, but message-to-user will be less specific

                    echo 'Request Refused: Input must only contain Numerical Characters';
                }
                else{
                    //Input is valid, one final pass to sanitize input with a filter
                    $account = filter_var($account, FILTER_SANITIZE_NUMBER_INT); //strip every NOT #

                    //Use a prepared statement to further limit possibility of attack
                    if($preparedQuery = $dbConnect->prepare('SELECT balance FROM accounts WHERE account_id=?')){

                        $preparedQuery->bind_param('s', $account);  //'?' from above query becomes $account

                        $preparedQuery->execute();  //send the query to db

                        $preparedQuery->bind_result($balance);  //the result of the query can
                                                                //ONLY be placed in $balance

                        //get result of query
                        if($preparedQuery->fetch()){
                            //fetch was good, do the displays

                            //List working-account
                            echo 'Current Account: ' . $account . '<br>';

                            //Display balance of the account to the user
                            echo 'Your Current Balance: $' . $balance;
                        }
                        else{

                            //input was good, but record does not exist in db
                            echo 'Request Refused: Please check your Account Number and try again';
                        }

                        $preparedQuery->close();    //secure close
                    }
                }
            }

            $dbConnect->close();  //secure close
        ?>

    </body>

</html>
