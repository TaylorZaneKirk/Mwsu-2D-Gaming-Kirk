<html>

    <head>

        <title>Assignment 1</title>

    </head>

    <body>

        <form action ="" method="get">
            What's your name?
            <input type="text" name="uname" id="uname" size="30">
            <input type="submit" name="info">
        </form>


        <?php
            echo "hello world";
            if ( !empty($_GET['uname'])){
                $name = $_GET['uname'];
                echo "Your name is:" . $name;
            }

        ?>


    </body>

</html>
