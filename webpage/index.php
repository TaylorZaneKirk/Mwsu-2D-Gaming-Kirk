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
            if (isset($_POST['account'])){
                $account = $_POST['account'];
            }
            else{
                echo '<form action="" method="post">
                    Please Enter your Account information:<br>
                    <input type="text" maxlength="40" size="30" name="AccountQuery" id="account"><br>
                    <input type="submit" value="Check" name="AccountInfo"><br>
                </form>';
            }
        ?>

    </body>

</html>
