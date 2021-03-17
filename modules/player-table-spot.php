<?php
class PlayerTableSpot { // 1-indexed
    public $lord;
    public $location;  
  
    public function __construct($lord, $location) {
        $this->lord = $lord;
        $this->location = $location;
    } 
}
?>
