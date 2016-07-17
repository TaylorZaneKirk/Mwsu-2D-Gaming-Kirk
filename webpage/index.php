<html>

    <head>

        <title>Assignment 1</title>

    </head>

    <body>

        What's your name?
        <input type="text" name="uname" id="uname" size="30">
        <input type="submit" name="info">

        <?php
            echo "hello world";
            if ( !empty($_POST['uname'])){
                $name = $_POST['uname'];
            }
            echo "Your name is:" + $name
        ?>


    </body>

</html>
