<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Active Record class for Questions and Answers
 */
class QuestionModel extends CI_Model
{
    /**
     * Returns the latest ten questions
     *
     * @return array The questions
     */
    function get_last_ten_entries()
    {
        $query = $this->db->get('questions', 10);
        return $query->result();
    }

    /**
     * Obtains information about a question
     *
     * @param $id int The id of the question
     * @return array The data about the question
     */
    public function get_simple($id)
    {
        return $this->db
            ->get_where('questions', array('id' => $id))
            ->result_array()[0];
    }

    /** 
     * Gets a question in full, with its owner and latest answers
     *
     * @param $id int The id of the question to get
     * @return array The data about the question and answers
     */
    public function get($id)
    {
        // Get the questions itself
        $query = $this->db
            ->select('*, (SELECT COUNT(*) from answers WHERE question=questions.id) as count')
            ->from('questions')
            ->where('questions.id', $id)
            ->get()->result_array()[0];

        // Find its latest 10 answers, with associated owners
        $query['latest_answers'] = $this->db
            ->select('answers.*, users.id as owner_id, users.name as owner_name')
            ->from('answers')
            ->join('users', 'answers.owner = users.id')
            ->where(array('answers.question' => $id))
            ->order_by('answers.id')
            ->limit(10)
            ->get()->result_array();

        // Find the owner of this question
        $query['owner'] = $this->db
            ->select('id, name')
            ->from('users')
            ->where(array('id' => $query['owner']))
            ->get()->result_array()[0];

        return $query;
    }

    /**
     * Adds a proposed answer to the question
     *
     * The datetime is set to now and the owner is set to the current user
     *
     * @param $id int The id of the question to answer
     * @param $title string The title of the proposed answer
     * @param $text string The full text of the answer
     * @return array The created answer
     */
    function add_answer($id, $title, $text)
    {
        // Populate values
        $answer           = new stdClass();
        $answer->question = $id;
        $answer->title    = $title;
        $answer->answer   = $text;
        $answer->date     = date("Y-m-d H:i:s");
        $answer->owner    = $this->session->userdata('uid');

        // Add it to the database
        $this->db->insert('answers', $answer);

        // Get its ID
        $id = $this->db->insert_id();

        // Return the data
        return $this->get_answer($id);
    }

    /**
     * Gets information about a given answer
     *
     * @param $id int The id of the answer to get
     * @return array The answer data
     */
    function get_answer($id)
    {
        return $this->db
            ->get_where('answers', array('id' => $id))
            ->result_array()[0];
    }

    /**
     * Obtains the question for the given answer
     *
     * @param $id int The id of an answer
     * @return array The question for which the given answer was proposed
     */
    function get_question_from_answer($id)
    {
        return $this->db
            ->select('questions.*') // We only want information about the question
            ->from('answers')
            ->join('questions', 'answers.question=questions.id')
            ->where('answers.id', $id)
            ->get()->result_array()[0];
    }

    /** 
     * Marks the given question as solved by the given answer
     *
     * @param $qid int The id of the question to mark as solved
     * @param $aid int The id of the answer to use as the solution
     */
    function mark_solved($qid, $aid)
    {
        $this->db
            ->where('id', $qid)
            ->update('questions', array('solved' => $aid));
    }

    /**
     * Deletes an answer
     *
     * @param $id int The id of the answer to delete
     */
    function delete_answer($id)
    {
        $this->db->delete('answers', array('id' => $id));
    }
}