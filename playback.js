(function ( global, Math ) {
  
  var doc = global.document, 
  
  //  Minor method lookup performance improvement
  ceil = Math.ceil, 
  
  nodeData = {
    video : {
      ready: "readyState",
      load: "loadeddata", 
      width: "videoWidth", 
      height: "videoHeight", 
      action: "throttle"
    },
    img : {
      ready: "complete", 
      load: "load", 
      width: "width", 
      height: "height",
      action: "process"
    }
  };  

  
  //console.log(hueData.blue, hueData.green);
  
  function Playback( id, options ) {

    var options = options || {};
    
    //  Store a ref to the media element - needs better checks
    this.media = doc.getElementById( id ) || doc.getElementsByTagName( id )[0] ;
    
    //  Output scaling
    this.scale = options.scale || 1;
    
    //  GUID
    this.guid = +new Date();
    
    //  Media node type
    this.type = this.media.nodeName.toLowerCase();
    
    //  Node specific properties
    this.data = nodeData[ this.type ];
    
    var initKeying = function() {

      //  Store a ref to the video element dimensions
      this.width = ( options.width || this.media[ this.data.width ] ) * this.scale;
      this.height = ( options.height || this.media[ this.data.height ] ) * this.scale; 

      //  Create canvases, auto-id unless provided
      this.reference = this.canvas( options.reference || "chroma-ref-" + this.guid );
      this.playback = this.canvas( options.playback || "chroma-chr-" + this.guid );

      //  Stash the reference canvas
      this.reference.style.display = "none";


      //  If style specified, apply
      if ( options.css ) {
        for ( var prop in options.css ) {
          this.playback.style[ prop ] = options.css[ prop ];
        }
      }

      //  Store refs to canvas contexts
      this.referenceContext = this.reference.getContext("2d");
      this.playbackContext = this.playback.getContext("2d");


      //  If just an image, then process immediately
      if ( this.data.action === "process" ) {

        this.process();

      } else {

        //  Throttling 
        this.timeout = options.timeout || 0;        

        //  Register listener to handle playback rendering
        this.media.addEventListener( "play", function() {

          //  Call the processing throttler
          this.throttle();

        }.bind( this ) , false);  
      }
    }.bind( this );
    
    //  Media exists
    if ( this.media ) {
      
      //  Media is ready to process
      if ( this.media[ this.data.ready ] ) {
      
        initKeying();
      
      //  Media is not ready, listen for readyness
      } else {
      
        this.media.addEventListener( this.data.load , initKeying, false);
      
      }
    }
    
    return this;
  }

  Playback.prototype.canvas = function( id ) {
    
    var canvas = doc.createElement("canvas");
    
    this.media.parentNode.appendChild( canvas );
    
    canvas.id = id;
    canvas.width = this.width;
    canvas.height = this.height;    
    
    return canvas;
    
  };
 
  Playback.prototype.throttle = function() {
    
    
    //  Return immediately if paused/ended
    if ( this.media.paused || this.media.ended ) {
      return;
    }
    
    //  Process the current scene
    this.process();
    
    //  Store ref to `this` context
    var self = this;
    
    //  The actual throttling is handled here, 
    //  throttle set to 20 fps
    setTimeout(function () {
      
      //  Recall the processing throttler
      self.throttle();

    }, this.timeout );
  };
  
  
  Playback.prototype.process = function() {
      
    var width = this.width, 
        height = this.height,
        frame;
    
    
    //  Draw current video frame
    this.referenceContext.drawImage( this.media, 0, 0, width, height );

    //  Return current 32-bit CanvasPixelArray data
    frame = this.referenceContext.getImageData( 0, 0, width, height );


    //  Draw back to the chroma canvas
    this.playbackContext.putImageData( frame, 0, 0 );
  };


  //  Expose API
  global.Playback = function( id, options ) {
    return new Playback( id, options );
  }
  

})( this, Math );
