var $fixture, $fixtureHTML; 


module("Playback", {
  setup: function() {
    
    if ( !$fixture ) {
      $fixture = jQuery("#qunit-fixture");
      fixtureHTML = $fixture.html();
    } else {
      $fixture.html(fixtureHTML);
    }
    jQuery("canvas").remove();
  },
  teardown: function() {
    //ok(true);
    //console.log("teardown");
  }
});

test("exists", function() {
  
  expect(2);

  ok( Playback, "Playback exists");
  
  equal( typeof Playback, "function", "Playback() is a function" );
});


test("instance", function() {
  
  var tests = 5, 
  count = 0;

  expect(5);
    
  function plus() {
    if ( ++count === tests) {
      start();
    }
  }
  
  stop();
  
  var instance = Playback( "snowdriving", { scale: 1 });
  
  console.log( instance );


  equal( typeof instance.data, "object", "Instance has data prop" );
  plus();

  equal( typeof instance.guid, "number", "Instance has guid number" );
  plus();

  equal( typeof instance.scale, "number", "Instance has a scale" );
  plus();

  equal( typeof instance.type, "string", "Instance has a type" );
  plus();

  equal( typeof instance.media, "object", "Instance has media" );
  plus();

});

