<?php
    if($_POST){
        $inputs = $_POST;
        $inputs['responsetext'] = "Hai, I'm the server and I say chicken!!";
        header('Content-Type: application/json');
        echo json_encode($inputs);
    }
