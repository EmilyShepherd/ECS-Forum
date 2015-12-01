<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User extends CI_Controller
{
    private function checkLogin()
    {
        if (!$this->session->userdata('uid'))
        {
            header('HTTP/1.1 403 Unauthorised');
            exit;
        }
    }

    public function index()
    {
        $this->load->model('Question');

        var_dump($this->Question->get_last_ten_entries());
    }

    public function registered_modules()
    {
        $this->checkLogin();
        $this->load->model('UserModel');

        $query = $this->UserModel->get_modules();

        echo json_encode($query->result_array());
    }

    public function login()
    {
        $this->session->set_userdata(array('uid' => '1'));
    }

    public function module($id)
    {
        $this->checkLogin();
        $this->load->model('ModuleModel');

        $query = $this->ModuleModel->get_questions($id);

        echo json_encode($query->result_array());
    }
}
