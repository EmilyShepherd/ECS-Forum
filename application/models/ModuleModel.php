<?php

class ModuleModel extends CI_Model
{
    public function get_questions($id)
    {
        $this->db->select('*')
             ->from('questions')
             ->where('questions.module', $id);

        return $this->db->get();
	}
}