( function() {

	var youtube = document.querySelectorAll( ".youtube" );

	for (var i = 0; i < youtube.length; i++) {

		var loc = window.location.toString();
		var params = loc.split('?')[1];
		if (youtube[i].dataset.embed) {
		  params = youtube[i].dataset.embed;
		}

		var source = "https://img.youtube.com/vi/"+ params +"/sddefault.jpg";

		var image = new Image();
				image.src = source;
				image.addEventListener( "load", function() {
					youtube[ i ].appendChild( image );
				}( i ) );

				youtube[i].addEventListener( "click", function() {

					var loc = window.location.toString();
					var param = loc.split('?')[1];
					if (this.dataset.embed) {
					  param = this.dataset.embed;
					}

					var iframe = document.createElement( "iframe" );

							iframe.setAttribute( "frameborder", "0" );
							iframe.setAttribute( "allowfullscreen", "" );
							iframe.setAttribute( "src", "https://www.youtube.com/embed/"+ param +"?rel=0&showinfo=0&autoplay=1" );

							this.innerHTML = "";
							this.appendChild( iframe );
				} );
	};

} )();
