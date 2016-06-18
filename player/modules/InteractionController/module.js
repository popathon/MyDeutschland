/**
 * @module Player
 */


/**
 * I am the InteractionController.
 *
 * I listen to key events which happen on window.document & and scroll events on the 'ViewVideo' element.
 * When the keycode is in the local map keyBindings, I call the bound method.
 *
 * @class InteractionController
 * @static
 */


FrameTrail.defineModule('InteractionController', function(){


    var keyBindings = {

        	"38": interfaceUp,
        	"40": interfaceDown,

        	"37": interfaceLeft,
        	"39": interfaceRight,

            "32": spaceKey,
            "88": xKey


        },
        scrollThreshold = 10,
        scrollUpBlocked = false,
        scrollDownBlocked = false,
        scrollLeftBlocked = false,
        scrollRightBlocked = false;


    /**
     * I set the event listener which triggers the appropriate event-handler.
     * @method initController
     * @return CallExpression or undefined
     */
    function initController() {

        scrollUpBlocked = false,
        scrollDownBlocked = false,
        scrollLeftBlocked = false,
        scrollRightBlocked = false;

    	$(document).off('keydown').on('keydown', function(evt){

    		if (	evt.target.tagName === 'INPUT'
    			 || evt.target.tagName === 'TEXTAREA') {

    			return;
    		}

    		return keyBindings[evt.keyCode] && keyBindings[evt.keyCode].call(this, evt);

    	});

        $('body').off('mousewheel', '#ViewVideo').on('mousewheel', '#ViewVideo', function(evt) {
            
            if (evt.deltaY >= scrollThreshold && !scrollUpBlocked) {
                
                scrollUpBlocked = true;
                interfaceUp();
                window.setTimeout(function() {
                    scrollUpBlocked = false;
                }, 700);

            } else if (evt.deltaY <= - scrollThreshold && !scrollDownBlocked) {
                
                scrollDownBlocked = true;
                interfaceDown();
                window.setTimeout(function() {
                    scrollDownBlocked = false;
                }, 700);

            } else if (evt.deltaX >= scrollThreshold && !scrollRightBlocked) {
                
                scrollRightBlocked = true;
                interfaceRight();
                window.setTimeout(function() {
                    scrollRightBlocked = false;
                }, 500);

            } else if (evt.deltaX <= - scrollThreshold && !scrollLeftBlocked) {
                
                scrollLeftBlocked = true;
                interfaceLeft();
                window.setTimeout(function() {
                    scrollLeftBlocked = false;
                }, 500);

            }

        });


    };


    /**
     * I {{#crossLink "ViewVideo/slidePositionUp:method"}}slide the video view up{{#crossLink}}.
     * 
     * In case the annotation position is set to 'top' and no annotation has been opened before, I try to {{#crossLink "Annotation/openAnnotation:method"}}open the first annotation{{/crossLink}}.
     *
     * @method interfaceUp
     */
    function interfaceUp(evt) {

        var currentAnnotation = FrameTrail.module('AnnotationsController').findTopMostActiveAnnotation();

    	if ( 	 FrameTrail.getState('hv_config_annotationsPosition') == 'top'
	    	 &&  FrameTrail.getState('hv_config_annotationsVisible')
             &&  FrameTrail.getState('slidePosition') == 'middle'
	    	 &&  currentAnnotation !== null) {

	    	currentAnnotation.openAnnotation();

	    } else if ( FrameTrail.getState('hv_config_annotationsPosition') == 'bottom'
                &&  FrameTrail.getState('hv_config_videolinksVisible')
                &&  FrameTrail.getState('slidePosition') == 'middle'
                &&  FrameTrail.module('VideolinksController').openedLink === null
                &&  FrameTrail.module('HypervideoModel').videolinks[0]) {

            FrameTrail.module('HypervideoModel').videolinks[0].openVideolink();

        } else {

	    	FrameTrail.module('ViewVideo').slidePositionUp();

	    }

    };


    /**
     * I {{#crossLink "ViewVideo/slidePositionDown:method"}}slide the video view down{{#crossLink}}.
     * 
     * In case the annotation position is set to 'bottom' and no annotation has been opened before, I try to {{#crossLink "Annotation/openAnnotation:method"}}open the first annotation{{/crossLink}}.
     * @method interfaceDown
     */
    function interfaceDown(evt) {

        var currentAnnotation = FrameTrail.module('AnnotationsController').findTopMostActiveAnnotation();

	    if ( 	 FrameTrail.getState('hv_config_annotationsPosition') == 'bottom'
	    	 &&  FrameTrail.getState('hv_config_annotationsVisible')
             &&  FrameTrail.getState('slidePosition') == 'middle'
	    	 &&  currentAnnotation !== null) {

	    	currentAnnotation.openAnnotation();

	    } else if ( FrameTrail.getState('hv_config_annotationsPosition') == 'top'
                &&  FrameTrail.getState('hv_config_videolinksVisible')
                &&  FrameTrail.getState('slidePosition') == 'middle'
                &&  FrameTrail.module('VideolinksController').openedLink === null
                &&  FrameTrail.module('HypervideoModel').videolinks[0]) {

            FrameTrail.module('HypervideoModel').videolinks[0].openVideolink();

        } else {

	    	FrameTrail.module('ViewVideo').slidePositionDown();

	    }
    	
    };


    /**
     * I try to {{#crossLink "Annotation/openAnnotation:method"}}open the annotation{{/crossLink}} to the left of the currently selected annotation.
     *
     * @method interfaceLeft
     */
    function interfaceLeft(evt) {
    	
        if ( FrameTrail.module('ViewVideo').shownDetails == 'annotations' ) {
            
            var currentAnnotation   = FrameTrail.module('AnnotationsController').openedAnnotation,
                annotations         = FrameTrail.module('HypervideoModel').annotations,
                idx                 = annotations.indexOf(currentAnnotation);

            if (idx < 1) return;

            FrameTrail.module('HypervideoModel').annotations[idx-1].openAnnotation();

        } else if ( FrameTrail.module('ViewVideo').shownDetails == 'videolinks' ) {

            var currentVideolink    = FrameTrail.module('VideolinksController').openedLink,
                videolinks          = FrameTrail.module('HypervideoModel').videolinks,
                idx                 = videolinks.indexOf(currentVideolink);

            if (idx < 1) return;

            FrameTrail.module('HypervideoModel').videolinks[idx-1].openVideolink();

        }


    };


    /**
     * I try to {{#crossLink "Annotation/openAnnotation:method"}}open the annotation{{/crossLink}} to the right of the currently selected annotation.
     *
     * @method interfaceRight
     */
    function interfaceRight(evt) {

    	if ( FrameTrail.module('ViewVideo').shownDetails == 'annotations' ) {

            var currentAnnotation   = FrameTrail.module('AnnotationsController').openedAnnotation,
                annotations         = FrameTrail.module('HypervideoModel').annotations,
                idx                 = annotations.indexOf(currentAnnotation);

            if (idx < 0 || idx >= annotations.length-1) return;

            FrameTrail.module('HypervideoModel').annotations[idx+1].openAnnotation();

        } else if ( FrameTrail.module('ViewVideo').shownDetails == 'videolinks' ) {

            var currentVideolink    = FrameTrail.module('VideolinksController').openedLink,
                videolinks          = FrameTrail.module('HypervideoModel').videolinks,
                idx                 = videolinks.indexOf(currentVideolink);

            if (idx < 0 || idx >= videolinks.length-1) return;

            FrameTrail.module('HypervideoModel').videolinks[idx+1].openVideolink();

        }

    };

    
    /**
     * When the space key is pressed, I toggle play / pause in the player
     *
     * @method spaceKey
     */
    function spaceKey(evt) {

        var HypervideoController = FrameTrail.module('HypervideoController');

        if ( HypervideoController.isPlaying ) {
            HypervideoController.pause();
        } else {
            HypervideoController.play();
        }

    };



    /**
     * When the "x" key is pressed, I change the xKey state so other modules can listen to the change
     *
     * @method xKey
     */
    function xKey(evt) {

        FrameTrail.changeState('xKey', true);

        $(document).one('keyup', function(evt) {

            if ( evt.keyCode == '88' ) {
                FrameTrail.changeState('xKey', false);
            }

        });

        evt.preventDefault();
        evt.stopPropagation();

    };

        
    return {

        onChange: {
            
        },

        initController: initController

    };

});