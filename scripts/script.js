
'use strict';

var waitingTask =
{
    "url"        : null,
    "oncomplete" : null,
    "data"       : null
}

var els =
{
    "login" : document.getElementById('login_form'),
    "user"  : document.getElementById('username'),
    "pass"  : document.getElementById('password'),
    "main"  : document.getElementById('main')
}

function showLogin()
{
    els.login.style.display = 'block';
}

function runLogin(el, event)
{
    event.preventDefault();

    getData
    (
        'login',
        'username=' + els.user.value + '&password=' + els.pass.value,
        (function(data)
        {
            els.login.style.display = 'none';

            if (waitingTask.url)
            {
                getData(waitingTask.url, waitingTask.data, waitingTask.complete);

                waitingTask.url = null;
            }
        })
    );
}

function getData(url, data, complete)
{
    $.ajax
    (
        '/user/' + url,
        {
            "data"     : data,
            "method"   : data ? "POST" : "GET",
            "dataType" : 'json'
        }
    )
    .done(complete)
    .fail(function(response)
    {
        if (response.status == 403)
        {
            waitingTask.url        = url;
            waitingTask.oncomplete = complete;
            waitingTask.data       = data;

            showLogin();
        }
    });
}

function loadModule()
{
    getData
    (
        'module/' + this.module,
        null,
        function(data)
        {
            els.main.innerHTML = '';

            var h2       = document.createElement('h2');
            h2.innerHTML = 'Module Questions';
            els.main.appendChild(h2);

            for (var i = 0; i < data.length; i++)
            {
                var row          = document.createElement('div');
                row.className    = 'row';
                row.style.cursor = 'pointer';
                els.main.appendChild(row);

                var title        = document.createElement('h3');
                title.innerHTML  = data[i].title;
                row.appendChild(title);

                var text         = document.createElement('p');
                text.innerHTML   = data[i].text;
                row.appendChild(text);
            }
        }
    );
}

$(document).ready(function()
{
    getData
    (
        'registered-modules',
        null,
        function(data)
        {
            els.main.innerHTML = '';

            var h2       = document.createElement('h2');
            h2.innerHTML = 'Your Registered Modules';
            els.main.appendChild(h2);

            for (var i = 0; i < data.length; i++)
            {
                var row          = document.createElement('div');
                row.className    = 'row';
                row.style.cursor = 'pointer';
                row.onclick      = loadModule;
                row.module       = data[i].id;
                els.main.appendChild(row);

                var title        = document.createElement('h3');
                title.innerHTML  = data[i].name;
                row.appendChild(title);
            }
        }
    );
});