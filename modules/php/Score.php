<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy;

class Score {
    public ?int $lords = null;
    public ?int $locations = null;
    public ?int $coalition = null;
    public ?int $pearlMaster = null;
    public ?int $total = null;
    
    public function getTotal(): int {
        $this->total = $this->lords + $this->locations + $this->coalition + $this->pearlMaster;
        return $this->total;
    }
}
