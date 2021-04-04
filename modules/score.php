<?php
class Score {
    public /*int*/ $lords;
    public /*int*/ $locations;
    public /*int*/ $coalition;
    public /*int*/ $pearlMaster;
    public /*int*/ $total;
    
    public function getTotal() {
        $this->total = $this->lords + $this->locations + $this->coalition + $this->pearlMaster;
        return $this->total;
    }
}
?>
