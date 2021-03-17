<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Conspiracy implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * conspiracy.action.php
 *
 * Conspiracy main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/conspiracy/conspiracy/myAction.html", ...)
 *
 */
  
  
  class action_conspiracy extends APP_GameAction { 
    // Constructor: please do not modify
   	public function __default() {
      if( self::isArg( 'notifwindow') ) {
          $this->view = "common_notifwindow";
          $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
      } else {
          $this->view = "conspiracy_conspiracy";
          self::trace( "Complete reinitialization of board game" );
      }
  	} 
  	
  	// defines your action entry points there

    public function chooseLordDeckStack() {
        self::setAjaxMode();     

        $number = self::getArg( "number", AT_posint, true );
        $this->game->chooseLordDeckStack( $number );

        self::ajaxResponse( );
    }

    public function chooseVisibleStack() {
        self::setAjaxMode();     

        $guild = self::getArg( "guild", AT_posint, true );
        $this->game->chooseVisibleStack( $guild );

        self::ajaxResponse( );
    }

    public function pickLord() {
        self::setAjaxMode();     

        $id = self::getArg( "id", AT_posint, true );
        $this->game->pickLord( $id );

        self::ajaxResponse( );
    }

    public function chooseLocationDeckStack() {
        self::setAjaxMode();     

        $number = self::getArg( "number", AT_posint, true );
        $this->game->chooseLocationDeckStack( $number );

        self::ajaxResponse( );
    }

    public function pickLocation() {
        self::setAjaxMode();     

        $id = self::getArg( "id", AT_posint, true );
        $this->game->pickLocation( $id );

        self::ajaxResponse( );
    }

  }
  

