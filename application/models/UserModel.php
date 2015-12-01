<?php

class UserModel extends CI_Model
{
	public function get_modules()
	{
		$this->db->select('*')
				 ->from('modules')
				 ->join('users_modules', 'modules.id=users_modules.module')
				 ->where('users_modules.user', $this->session->userdata('uid'));

		return $this->db->get();
	}
}