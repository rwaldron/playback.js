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

    //  Store ref to `this` context
    var self = this;
    
    options = options || {};
    
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
    
    //  Raw caching for last frame data
    this.last = [];

    //  Ceil caching for last frame data
    //  Will be set to Uint16Array
    this.Uint16Ceil;
    
    
    
    var initKeying = function() {

      //  Store a ref to the video element dimensions
      self.width = ( options.width || self.media[ self.data.width ] ) * self.scale;
      self.height = ( options.height || self.media[ self.data.height ] ) * self.scale; 

      //  Create canvases, auto-id unless provided
      self.reference = self.canvas( options.reference || "chroma-ref-" + self.guid );
      self.playback = self.canvas( options.playback || "chroma-chr-" + self.guid );

      //  Stash the reference canvas
      self.reference.style.display = "none";


      //  If style specified, apply
      if ( options.css ) {
        for ( var prop in options.css ) {
          self.playback.style[ prop ] = options.css[ prop ];
        }
      }

      //  Store refs to canvas contexts
      self.referenceContext = self.reference.getContext("2d");
      self.playbackContext = self.playback.getContext("2d");


      //  If just an image, then process immediately
      if ( self.data.action === "process" ) {

        self.process();

      } else {

        //  Throttling 
        self.timeout = options.timeout || 0;        

        //  Register listener to handle playback rendering
        self.media.addEventListener( "play", function() {

          //  Call the processing throttler
          self.throttle();

        }, false);  
      }
    };
    
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
        ceils = [], 
        last, frame, frameLen, r, g, b, idx, hsl, hueIdx;
    
    
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
