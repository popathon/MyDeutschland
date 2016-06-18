/**
 * @module Shared
 */


/**
 * I am the type definition of a ResourceText.
 * 
 * * Text Resources only appear in the 'Add Custom Overlay' tab
 *   and are not listed in the ResourceManager.
 * 
 * * Text Resources can not be used as Annotation or Videolink
 *
 * @class ResourceText
 * @category TypeDefinition
 * @extends Resource
 */



FrameTrail.defineType(

    'ResourceText',
    'Resource',

    function(resourceData){

        this.resourceData = resourceData;



    },

    {
        /**
         * I hold the data object of a custom ResourceText, which is not stored in the Databse and doesn't appear in the resource's _index.json.
         * @attribute resourceData
         * @type {}
         */
        resourceData:   {},


        /**
         * I render the content of myself, which is a &lt;div&gt; containing a custom text wrapped in a &lt;div class="resourceDetail" ...&gt;
         *
         * @method renderContent
         * @return HTMLElement
         */
        renderContent: function() {

            var self = this;

            var resourceDetail = $('<div class="resourceDetail" data-type="'+ this.resourceData.type +'" style="width: 100%; height: 100%;"></div>'),
                unescapeHelper = document.createElement('div'),
                child,
                unescapedString;
            
            // unescape string from json 
            unescapeHelper.innerHTML = self.resourceData.attributes.text;
            child = unescapeHelper.childNodes[0];
            unescapedString = child ? child.nodeValue : '';

            resourceDetail.html(unescapedString);

        	return resourceDetail;

        }, 

        /**
         * Several modules need me to render a thumb of myself.
         *
         * These thumbs have a special structure of HTMLElements, where several data-attributes carry the information needed.
         * 
         * @method renderThumb
         * @return thumbElement
         */
        renderThumb: function() {

            var self = this;

            var thumbElement = $('<div class="resourceThumb" data-type="'+ this.resourceData.type +'">'
                + '                  <div class="resourceOverlay">'
                + '                      <div class="resourceIcon"></div>'
                + '                  </div>'
                + '                  <div class="resourceTitle">Custom Text</div>'
                + '              </div>');

            var previewButton = $('<div class="resourcePreviewButton"></div>').click(function(evt) {
                // call the openPreview method (defined in abstract type: Resource)
                self.openPreview( $(this).parent() );
                evt.stopPropagation();
                evt.preventDefault();
            });
            thumbElement.append(previewButton);

            return thumbElement;

        },


        /**
         * See {{#crossLink "Resource/renderBasicPropertiesControls:method"}}Resource/renderBasicPropertiesControls(){{/crossLink}}
         * @method renderPropertiesControls
         * @param {Overlay} overlay
         * @return &#123; controlsContainer: HTMLElement, changeStart: Function, changeEnd: Function, changeDimensions: Function &#125;
         */
        renderPropertiesControls: function(overlay) {

            var basicControls = this.renderBasicPropertiesControls(overlay);

            /* Add Video Type  Controls */

            var textLabel = $('<div>Custom Text:</div>'),

                textarea = $('<textarea>' + overlay.data.attributes.text + '</textarea>')
                    .on('keyup', function () {
                        
                        var escapeHelper = document.createElement('div'),
                            escapedHtml;

                        // save escaped html string
                        escapeHelper.appendChild(document.createTextNode($(this).val()));
                        escapedHtml = escapeHelper.innerHTML;
                        overlay.data.attributes.text = escapedHtml;

                        overlay.overlayElement.children('.resourceDetail').html($(this).val());

                        FrameTrail.module('HypervideoModel').newUnsavedChange('overlays');

                    });

            basicControls.controlsContainer.append(textLabel, textarea);

            return basicControls;

        }


        



    }

);
