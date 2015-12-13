<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Active Record class for users in the system
 */
class UserModel extends CI_Model
{
    /**
     * Obtains a user from the given username
     *
     * @param $username string The username to get
     * @return array The user data
     */
    public function get_from_username($username)
    {
        $user = $this->db->get_where('users', array('username' => $username))->result_array();

        return $user ? $user[0] : NULL;
    }

    /**
     * Obtains the current user, and also returns the list of modules they
     * are registered to
     *
     * @return array The user data
     */
    public function get()
    {
        // Get the user
        $user = $this->db
            ->get_where('users', array('id' => $this->session->userdata('uid')))
            ->result_array()[0];

        // Load their modules
        $user['modules'] = $this->db->select('*')
             ->from('modules')
             ->join('users_modules', 'modules.id=users_modules.module')
             ->where('users_modules.user', $user['id'])
             ->get()->result_array();

        return $user;
    }

    /**
     * Gets a user's modules
     *
     * @return array The user's modules
     */
    public function get_modules()
    {
        $this->db->select('*')
             ->from('modules')
             ->join('users_modules', 'modules.id=users_modules.module')
             ->where('users_modules.user', $this->session->userdata('uid'));

        return $this->db->get();
    }
}