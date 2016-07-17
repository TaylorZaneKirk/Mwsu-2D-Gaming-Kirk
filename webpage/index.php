<!--
    Name: Taylor Kirk
    Professor: Dr. Passos
    Class: Web-App Security
    Date: 7/17/16
-->

<html>

    <head>

        <title>Assignment 2</title>

    </head>

    <body>

        <!--
            Basic user interaction. Enter your name,
            browser "remembers" your name and greets you
        -->

        <form action ="" method="get">
            What's your name?
            <input type="text" name="uname" id="uname" size="30">
            <input type="submit" name="info">
        </form>


        <?php

            if ( !empty($_GET['uname'])){
                $name = $_GET['uname'];
                echo "Your name is:" . $name;
            }
            else{
                echo "Please enter your name above.";
            }

        ?>


    </body>

</html>
