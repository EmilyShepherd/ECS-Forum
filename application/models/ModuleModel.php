<?php
defined('BASEPATH') OR exit('No direct script access allowed');


/**
 * Active Record class for modules
 */
class ModuleModel extends CI_Model
{
    /** 
     * Gets the the questions for a given module
     *
     * @param $id int The id of a module as used by the database
     * @return array The list of questions
     */
    public function get_questions($id)
    {
        $this->db
            ->select
            (
                  'questions.*,'
                . '(SELECT COUNT(*) from answers WHERE question=questions.id) as count,'
                . 'users.name as owner_name'
            )
            ->from('questions')
            ->join('users', 'users.id = questions.owner')
            ->where(array('questions.module' => $id))
            ->limit(10);

        return $this->db->get()->result_array();
    }

    /**
     * Gets information about the given module
     *
     * @param $id int The id of a module as used by the database
     * @return array The module data
     */
    public function get($id)
    {
        return $this->db->get_where('modules', array('id' => $id))->result_array()[0];
    }

    public function get_full($id)
    {
        $module = $this->db
            ->select('*, (SELECT COUNT(*) FROM questions WHERE module=modules.id) as count')
            ->from('modules')
            ->where('modules.id', $id)
            ->get()->result_array()[0];

        $module['questions'] = $this->get_questions($id);

        return $module;
    }
}