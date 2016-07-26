<!--
    Name: Taylor Kirk
    Professor: Dr. Passos
    Class: Web-App Security
    Date: 7/25/16
-->

<html>

    <head>

        <title>Assignment 4</title>

    </head>

    <body>

        <!--
            Basic user interaction. Enter your name,
            browser "remembers" your name and greets you
        -->

        <FORM name="Calculator">
            <table border="4">  <!--OUTER BORDER OF CALCULATOR, PANELS-->
                <tr>   <!--TOP PANEL------>
                    <td colspan="2">A Simple JavaScript Calculator<br>
                        <input type="text" maxlength="40" size="30" name="Display">
                    </td>
                </tr>  <!--END TOP PANEL--->
                <tr>
                    <td> <!--LEFT PANEL------>
                        <table>
                            <tr>
                                <td><input type="button" value="7"></td>
                                <td><input type="button" value="8"></td>
                                <td><input type="button" value="9"></td>
                            </tr>
                            <tr>
                                {all other rows of digits are similar..}
                            </tr>
                        </table>
                    </td><!--END LEFT PANEL-->
                    <td> <!--RIGHT PANEL----->
                        <table>
                            {right panel is similar in overall structure to left}
                        </table>
                    </td><!--END RIGHT PANEL-->
                </tr>
            </table>
</FORM>


    </body>

</html>
