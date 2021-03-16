<?php
class PlayerTableSpot {
    public $lord;
    public $location;  
  
    public function __construct($lord, $location) {
        $this->lord = $lord;
        $this->location = $location;
    } 
}
?>
