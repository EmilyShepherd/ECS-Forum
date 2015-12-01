<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends CI_Controller {

	/**
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 * 		http://example.com/index.php/welcome
	 *	- or -
	 * 		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the default controller in
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see http://codeigniter.com/user_guide/general/urls.html
	 */
	public function index()
	{
		$this->load->view('main');
	}

	public function user()
	{
		$this->load->model('User');

		$query = $this->User->get_modules();

		foreach ($query->result() as $row)
		{
			echo $row->name . '<br />';
		}
	}

	public function module($id)
	{
		$this->load->model('Module');
		$query = $this->Module->get_questions($id);

		foreach ($query->result() as $row)
		{
			echo '<b>' . $row->title . '</b>' . '<br />';
			echo '<p>' . $row->text . '</p>';
		}
	}
}
