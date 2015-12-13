
'use strict';

// Used when there's a task which we need to perform after logging
// in
var waitingTask =
{
    "url"        : null,
    "oncomplete" : null,
    "data"       : null
};

// Element shortcuts
var els =
{
    "login"   : document.getElementById('login_form'),
    "log_err" : document.getElementById('login_error'),
    "user"    : document.getElementById('username'),
    "pass"    : document.getElementById('password'),
    "main"    : document.getElementById('main'),
    "side"    : document.getElementById('sidebar'),
    "title"   : document.getElementById('title'),
    "desc"    : document.getElementById('desc'),
    "header"  : document.getElementById('header'),
    "rows"    : document.getElementById('rows'),
    "footer"  : document.getElementById('footer'),
    "name"    : document.getElementById('name'),
    "pic"     : document.getElementById('pic')
};

// The current user
var CURRENT_USER = null;

// If there's a WYSIWYG editor on this page - this will be a quick link
// to it
var editor = null;

/**
 * Loads up the page when the window is first opened
 */
$(document).ready(function()
{
    getData
    (
        'registered-modules',
        null,
        function(data)
        {
            updateUser(data);

            updateMain
            (
                'Your Modules',
                data.modules,
                loadModule,
                'name', 'description', els.side
            );
        }
    );
});

/**
 * Displays the login screen
 *
 * This is displayed when the server returns a 401 response
 */
function showLogin()
{
    els.login.style.display = 'block';
}

/**
 * Passes the given user name and password to the server
 *
 * Called by the login form
 *
 * @param el DOMElement The element
 * @param event Event The event
 */
function runLogin(el, event)
{
    // Stop the form from submitting
    event.preventDefault();

    getData
    (
        'login',
        // Username and password from the form
        'username=' + els.user.value + '&password=' + els.pass.value,
        function(data)
        {
            // Check if login failed
            if (data.id == undefined)
            {
                // Popup the login error message
                els.log_err.style.opacity = 1;

                // Let's have the login error message hide itself automatically
                // after 5 seconds
                window.setTimeout
                (
                    function()
                    {
                        els.log_err.style.opacity = 0;
                    },
                    5000
                );
            }
            // Login succeeded! Yey!
            else
            {
                // Hide the login form
                els.login.style.display = 'none';
                
                // Set the current user
                updateUser(data);

                // If we're waiting to do something, do it now
                // (This happens when we attempted to do something which failed because
                // the user wasn't logged in... so now that we are, we can try again!)
                if (waitingTask.url)
                {
                    getData(waitingTask.url, waitingTask.data, waitingTask.oncomplete);

                    // Make sure we delete this task to ensure we don't do it again
                    waitingTask.url = null;
                }
            }
        }
    );
}

/**
 * Main AJAX function which gets and sends data to the server
 *
 * @param url string The url to go to
 * @param data string The POST data to send
 * @param complete callable The function to call on a successful request
 */
function getData(url, data, complete)
{
    $.ajax
    (
        // AJAX stuffs
        '/user/' + url,
        {
            "data"     : data,
            "method"   : data ? "POST" : "GET",
            "dataType" : 'json'
        }
    )
    // This unassuming line is what we do if all goes well
    .done(complete)
    // Something went wrong - check what's going on
    .fail(function(response)
    {
        // This means the user hasn't logged in so let's save the task
        // and have a go at logging in
        if (response.status == 401)
        {
            // If there's no user, we need to make a record of that
            CURRENT_USER           = null;

            // Save this request for later
            waitingTask.url        = url;
            waitingTask.oncomplete = complete;
            waitingTask.data       = data;

            // Ask the user to login
            showLogin();
        }
        // User attempted to do something they aren't allowed to do!
        else if (response.status == 403)
        {
            alert('Could not complete action');
        }
    });
}

/**
 * Loads a question and its latest answers
 *
 * This is called when a user clicks a question
 */
function loadQuestion()
{
    getData
    (
        'question/' + this.dataId, // The ID of the question to load
        null,
        function(data)
        {
            // Clear out the main area and populate it with this question's text
            els.title.innerHTML  = 'Question: ' + data.title;
            els.desc.innerHTML   = 'Asked ' + data.date + ' by ' + data.owner.name;
            els.header.innerHTML = data.text;
            els.rows.innerHTML   = '';

            // Display a message if we don't have any answers so the page doesn't look
            // empty
            if (data.latest_answers.length == 0)
            {
                els.rows.innerHTML = '<div class="page_msg">There are no answers at the moment. Provide your own below!</div>';
            }

            // For all the answers that we do have, lets add them!
            for (var i = 0; i < data.latest_answers.length; i++)
            {
                var row           = document.createElement('div');
                row.className     = 'row';
                rows.appendChild(row);

                // If the question hasn't been solved, we may have some options to
                // add
                if (data.solved == 0)
                {
                    // Owners can delete their own anwers
                    if (data.latest_answers[i].owner == CURRENT_USER.id)
                    {
                        var withdraw       = document.createElement('span');
                        withdraw.className = 'withdraw';
                        withdraw.onclick   = withdrawAnswer;
                        withdraw.dataId    = data.latest_answers[i].id;
                        withdraw.innerHTML = 'Withdraw';
                        row.appendChild(withdraw);
                    }

                    // The owner of the question can choose to accept an answer
                    if (data.owner.id == CURRENT_USER.id)
                    {
                        var accept       = document.createElement('span');
                        accept.className = 'withdraw';
                        accept.onclick   = acceptAnswer;
                        accept.dataId    = data.latest_answers[i].id;
                        accept.innerHTML = 'Accept Solution';
                        row.appendChild(accept);
                    }
                }

                // Lets add the information about the answer
                // Short answer:
                var title         = document.createElement('h3');
                title.innerHTML   = data.latest_answers[i].title;
                row.appendChild(title);

                // Poster and datetime:
                var details       = document.createElement('span');
                details.className = 'details';
                details.innerHTML = 'Suggested ' + data.latest_answers[i].date + ' by ' + data.latest_answers[i].owner_name;
                row.appendChild(details);

                // Long answer:
                var text          = document.createElement('p');
                text.innerHTML    = data.latest_answers[i].answer;
                row.appendChild(text);

                // If this question has been solved and this is the solution, mark
                // it as such so it looked pretty :)
                if (data.latest_answers[i].id == data.solved)
                {
                    row.className += ' solution';
                }
            }

            // Page footer area
            if (data.solved != 0)
            {
                els.footer.innerHTML = 'You cannot submit an answer to a solved question';
            }
            else
            {
                els.footer.innerHTML = '';

                var h3 = document.createElement('h3');
                h3.innerHTML = 'Provide an Answer:';
                els.footer.appendChild(h3);

                var answer       = document.createElement('span');
                answer.innerHTML = 'Your Answer: <input type="text" id="answer" /><br />Extra Details:';
                els.footer.appendChild(answer);

                var answerBox = document.createElement('textarea');
                els.footer.appendChild(answerBox);

                var submit     = document.createElement('input');
                submit.type    = 'submit';
                submit.value   = 'Submit Answer';
                submit.onclick = submitAnswer;
                submit.box     = answerBox;
                submit.dataId  = data.id;
                els.footer.appendChild(submit);

                // Make this a nice WYSIWYG editor rather than a textarea
                editor = CKEDITOR.replace( answerBox );
            }
        }
    );
}

/**
 * Submits an answer
 *
 */
function submitAnswer()
{
    getData
    (
        'question-answers/' + this.dataId, // The question ID
        // The answer short text and longer text
        'text=' + editor.getData() + '&title=' + document.getElementById('answer').value,
        function(data)
        {
            // Clear the data from the answer box
            editor.setData();
            document.getElementById('answer').value = '';

            // If we didn't have any answers before, we do now, so we have
            // to remove the "there are no answers..." message
            if (els.rows.childNodes[0].className == 'page_msg')
            {
                els.rows.innerHTML = '';
            }

            // Add this answer to the bottom of the list
            var newrow          = document.createElement('div');
            newrow.className    = 'row';
            els.rows.appendChild(newrow);

            // Create the withdraw button
            var withdraw       = document.createElement('span');
            withdraw.className = 'withdraw';
            withdraw.onclick   = withdrawAnswer;
            withdraw.dataId    = data.id;
            withdraw.innerHTML = 'Withdraw';
            newrow.appendChild(withdraw);

            // Short answer:
            var title         = document.createElement('h3');
            title.innerHTML   = data.title;
            newrow.appendChild(title);

            // Poster and datetime:
            var details       = document.createElement('span');
            details.className = 'details';
            details.innerHTML = 'Suggested ' + data.date + ' by ' + CURRENT_USER.name;
            newrow.appendChild(details);

            // Long answer:
            var text          = document.createElement('p');
            text.innerHTML    = data.answer;
            newrow.appendChild(text);
        }
    );
}

/**
 * Withdraws an answer
 */
function withdrawAnswer()
{
    // We have to save "this" in the current environment because "this"
    // will mean something else in the callback below
    var el = this.parentElement;

    getData
    (
        'withdraw-answer/' + this.dataId, // The answer ID
        null,
        function(data)
        {
            // Just delete the answer from the page
            el.parentElement.removeChild(el);
        }
    );
}

/**
 * Mark an a proposed answer as the accepted solution
 *
 */
function acceptAnswer()
{
    // We have to save "this" in the current environment because "this"
    // will mean something else in the callback below
    var el = this;

    getData
    (
        'accept-answer/' + this.dataId, // The answer ID
        null,
        function(data)
        {
            // Mark the answer as the solution
            el.parentElement.className += ' solution';
            // Remove the answer box (as solved questions need no more answers)
            els.footer.innerHTML        = '';
            
            // As this question has been solved, we now need to delete
            // all the withdraw / accept buttons
            var buttons = document.getElementsByClassName('withdraw');
            for (var i = 0; i < buttons.length; i++)
            {
                buttons[i].style.display = 'none';
            }
        }
    );
}

/**
 * Loads a module
 *
 */
function loadModule()
{
    getData
    (
        'module/' + this.dataId, // The module ID
        null,
        function(data)
        {
            // This causes this module list to flip off to the side
            // (CSS handles the animation)
            els.side.className = 'sidebar';

            // Clear out the main area and add in the module's name and description
            els.title.innerHTML  = data.name + ': Questions';
            els.rows.innerHTML   = '';
            els.footer.innerHTML = '';
            els.desc.innerHTML   = '';
            els.header.innerHTML = data.description;

            // For all the questions that we have, list them
            for (var i = 0; i < data.questions.length; i++)
            {
                var row          = document.createElement('div');
                row.className    = 'row';
                row.style.cursor = 'pointer';
                row.onclick      = loadQuestion;
                row.dataId       = data.questions[i].id;
                els.rows.appendChild(row);

                // Question short title:
                var title        = document.createElement('h3');
                title.innerHTML  = (data.questions[i].solved != 0 ? '[SOLVED] ' : '') + data.questions[i].title;
                title.innerHTML += ' (' + data.questions[i].count + ' answer' + (data.questions[i].count != 1 ? 's' : '') + ')';

                row.appendChild(title);

                // Question poster and datetime
                var details       = document.createElement('span');
                details.className = 'details';
                details.innerHTML = 'Asked ' + data.questions[i].date + ' by ' + data.questions[i].owner_name;
                row.appendChild(details);

                // If this question has some long text, add it here
                if (data.questions[i].text)
                {
                    var text         = document.createElement('p');
                    text.innerHTML   = data.questions[i].text;
                    row.appendChild(text);
                }
            }
        }
    );
}

function updateMain(titleTxt, data, onclick, titleName, textName, el)
{
    if (!el) el = els.main;

    el.innerHTML = '';

    var h2       = document.createElement('h2');
    h2.innerHTML = titleTxt;
    el.appendChild(h2);

    for (var i = 0; i < data.length; i++)
    {
        var row          = document.createElement('div');
        row.className    = 'row';
        row.style.cursor = 'pointer';
        row.onclick      = onclick;
        row.dataId       = data[i].id;
        el.appendChild(row);

        var title        = document.createElement('h3');
        title.innerHTML  = data[i][titleName];
        row.appendChild(title);

        if (textName && data[i][textName])
        {
            var text         = document.createElement('p');
            text.innerHTML   = data[i][textName];
            row.appendChild(text);
        }
    }
}

/**
 * Set the current user
 *
 * This saves the user in the JavaScript and updates the name
 * at the top.
 *
 * @param user Object The user data
 */
function updateUser(user)
{
    CURRENT_USER = user;

    els.name.innerHTML = user.name;
    els.pic.src        = '/user/image';
}