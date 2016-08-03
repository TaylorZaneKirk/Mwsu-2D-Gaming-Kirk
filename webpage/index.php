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

        <form action="index.php" method="post">
            Please Enter your Account information:<br>
            <input type="text" maxlength="40" size="30" name="AccountQuery" id="account"><br>
            <input type="submit" value="Check" name="AccountInfo"><br>
        </form>

        <?php
            if (!empty($_POST['account'])){
                $account = $_POST['account'];
            }
            else{
                document.account = '';
                echo "Invalid Account Info (no input)";
            }
        ?>

    </body>

</html>
