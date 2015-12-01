<?php
defined('BASEPATH') OR exit('No direct script access allowed');
?><!DOCTYPE html>
<html lang="en">
  <head>
    <title>ECS Forum</title>
    <link rel="stylesheet" href="/styles/style.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karla"/>
  </head>
  <body>
    <div id="login_form" onsubmit="runLogin(this,event);">
      <form>
        <h1>Login</h1>

        <div class="box">
          <label>Username:</label>
          <input type="text" id="username" />
        </div>

        <div class="box">
          <label>Password:</label>
          <input type="password" id="password" />
        </div>

        <input type="submit" value="Login" />
      </form>
    </div>

    <header>
      <h1>ECS Forum</h1>
    </header>

    <main id="main">
    </main>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script src="/scripts/script.js"></script>
  </body>
</html>