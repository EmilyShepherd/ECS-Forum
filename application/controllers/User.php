<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User extends CI_Controller
{
    /**
     * Ensures that the user is logged in and has the permission to
     * do the requested action
     *
     * Called by client-facing methods
     */
    private function checkLogin()
    {
        // Check for the userid.
        // We don't need to check any more than that, as it couldn't
        // have been set on the server without them already passing
        // the login check
        if (!$this->session->userdata('uid'))
        {
            // They aren't logged in, let the client know they need
            // to be!
            header('HTTP/1.1 401 Unauthorised');

            // Stop all further processing!
            exit;
        }
    }

    public function index()
    {
        $this->load->view('main');
    }

    /**
     * Returns the list of modules that the current user is registered
     * to
     */
    public function registered_modules()
    {
        $this->checkLogin();
        $this->load->model('UserModel');

        // Get the modules for the current user
        $user = $this->UserModel->get();

        unset($user['password']);
        unset($user['image']);
        
        echo json_encode($user);
    }

    /**
     * Attempts to login a user
     *
     * This method expects the following POST parameteres:
     *   + username
     *   + password
     */
    public function login()
    {
        $this->load->model('UserModel');
        $user = $this->UserModel->get_from_username($_POST['username']);

        // Check that a user was found and that their password matches
        // We have to use password_verify() rather than simply comparing
        // with an "===" because we store the passwords hashed
        if ($user && password_verify($_POST['password'], $user['password']))
        {
            // Log them in!
            $this->session->set_userdata(array('uid' => $user['id']));

            // Don't want to send the hashed password back to them!
            unset($user['password']);
            unset($user['image']);

            echo json_encode($user);
        }
        else
        {
            // Indicate that the login failed
            // JavaScript will pick this up and display an appropriate error
            echo '{}';
        }
    }

    /**
     * Logs out the current user
     *
     * This always succeeds
     */
    public function logout()
    {
        $this->session->unset_userdata('uid');

        // Empty response to let the client know they have been logged out
        echo '{}';
    }

    public function image()
    {
        $this->checkLogin();
        $this->load->model('UserModel');

        header('Content-Type: image/jpeg');

        $user = $this->UserModel->get();

        echo $user['image'];
    }

    /**
     * Gets information about a module
     *
     * Also returns the latest list of questions
     *
     * @param $id int The identifier for the module as used by the system
     */
    public function module($id)
    {
        $this->checkLogin();
        $this->load->model('ModuleModel');

        // Find the module
        $module = $this->ModuleModel->get_full($id);

        // Return it to the user as JSON
        echo json_encode($module);
    }

    /**
     * Gets information about a question
     *
     * Also returns the latest list of answers
     *
     * @param $id int The identifier for the question as used by the system
     */
    public function question($id)
    {
        $this->checkLogin();
        $this->load->model('QuestionModel');

        // Find the question
        $question = $this->QuestionModel->get($id);

        // Return it to the user as JSON
        echo json_encode($question);
    }

    /**
     * Adds a new answer to the given question
     *
     * This method expect the following POST parameters:
     *   + title
     *   + text
     *
     * @param $id int The identifier for the question as used by the system
     */
    public function question_answers($id)
    {
        $this->checkLogin();
        $this->load->model('QuestionModel');

        // Check if this question exists and hasn't yet been solved
        $question = $this->QuestionModel->get_simple($id);
        if (!$question || $question['solved'])
        {
            // This action isn't allowed
            header('HTTP/1.1 403 Forbidden');

            // No more processing!
            exit;
        }

        // Add this new answer to the database
        $answer = $this->QuestionModel->add_answer($id, $_POST['title'], $_POST['text']);

        echo json_encode($answer);
    }

    /**
     * Withdraws a proposed answer
     *
     * This can only be done if the current user is the owner of the answer
     * and the question has not been marked as solved
     *
     * @param $id int The id of the answer
     */
    public function withdraw_answer($id)
    {
        $this->checkLogin();
        $this->load->model('QuestionModel');

        // Check that this answer exists and is owned by the current user
        $answer = $this->QuestionModel->get_answer($id);
        if (!$answer || $answer['owner'] != $this->session->userdata('uid'))
        {
            header('HTTP/1.1 403 Forbidden');

            exit;
        }

        // Delete it!
        $this->QuestionModel->delete_answer($id);

        echo '{}';
    }

    /**
     * Marks a proposed answer as the accepted solution to the question
     *
     * This can only be done if the current user is the owner of the question
     * and the question has not already been marked as solved
     *
     * @param $id int The id of the answer
     */
    public function accept_answer($id)
    {
        $this->checkLogin();
        $this->load->model('QuestionModel');

        // Get the question for this answer and check that it has not been solved
        // and is owned by the current user (this operation also checks that the
        // given answer exists!)
        $question = $this->QuestionModel->get_question_from_answer($id);
        if (!$question || $question['owner'] != $this->session->userdata('uid') || $question['solved'])
        {
            header('HTTP/1.1 403 Forbidden');

            exit;
        }

        // Accept it!
        $this->QuestionModel->mark_solved($question['id'], $id);

        echo '{}';
    }
}
