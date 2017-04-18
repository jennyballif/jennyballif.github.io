---
layout: landing-page
---


<style>
#rcorners3 {
    border-radius: 25px;
    border: 5px solid #629DD1;
    background: url(/images/fbsquare.jpg);
    background-position: left top;
    padding: 0px;
    width: 150px;
    height: 150px;
}
</style>


<style>
  *
  {
   margin: 0;
   padding: 0;
  }
  .zoom-area
  {
   width: 500px;
   margin: 50px auto;
   position: relative;
   cursor: none
  }
  /* create magnify glass */
  .large
  {
   width: 175px;
   height: 175px;
   position: absolute;
   border-radius: 100%;
  
   /* box shadow for glass effect */
   box-shadow: 0 0 0 7px rgba(255, 255, 255, 0.85), 
   0 0 7px 7px rgba(0, 0, 0, 0.25), 
   inset 0 0 40px 2px rgba(0, 0, 0, 0.25);
   
   /*hide the glass by default*/
   display: none;
  }
  .small
  {
   display: block;
  }
  </style>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js">
  </script>
  <script>
  $(document).ready(function()
  {
   var sub_width = 0;
   var sub_height = 0;
    $(".large").css("background","url('" + $(".small").attr("src") + "') no-repeat");
   $(".zoom-area").mousemove(function(e){
    if(!sub_width && !sub_height)
    {
     var image_object = new Image();
     image_object.src = $(".small").attr("src");
     sub_width = image_object.width;
     sub_height = image_object.height;
    }
    else
    {
     var magnify_position = $(this).offset();
     var mx = e.pageX - magnify_position.left;
     var my = e.pageY - magnify_position.top;
     
     if(mx < $(this).width() && my < $(this).height() && mx > 0 && my > 0)
     {
      $(".large").fadeIn(100);
     }
     else
     {
      $(".large").fadeOut(100);
     }
     if($(".large").is(":visible"))
     {
      var rx = Math.round(mx/$(".small").width()*sub_width - $(".large").width()/2)*-1;
      var ry = Math.round(my/$(".small").height()*sub_height - $(".large").height()/2)*-1;
      var bgp = rx + "px " + ry + "px";
      
      var px = mx - $(".large").width()/2;
      var py = my - $(".large").height()/2;
      $(".large").css({left: px, top: py, backgroundPosition: bgp});
     }
    }
   })
  })
  </script>


<div class="magnify">
  
  <!-- container of the magnify glass with original/large version -->
  <div class="large"></div>
  
  <!-- This is the small image -->
  <img class="small" src="https://i.ytimg.com/vi/6lt2JfJdGSY/maxresdefault.jpg" width="500" height="500" />
  
 </div>

	
<div class="container">
		<div class="row 0%">
			<div class="4u 6u$(xsmall)">
				<a href="sciencemom.html" style="display:block; text-decoration:none;">
				<section class="special box">
					<img id="rcorners3" src="images/SMG1/SMG1square.png" style="width:150px;height: 150px;">
					<!--<i class="icon fa-rocket major"></i>-->
					<h3>Science Mom Guides</h3>
					<p>Science lessons with hands-on investigations</p>
				</section>
				</a>
			</div>
			<div class="4u 6u$(xsmall)">
				<a href="sciencemom.html" style="display:block; text-decoration:none;">
				<section class="special box">
					<img id="rcorners3" src="images/SMG1/SMG1square.png" style="width:150px;height: 150px;">
					<!--<i class="icon fa-rocket major"></i>-->
					<h3>Science Activities</h3>
					<p>A summary table of all activities and supplies.</p>
				</section>
				</a>
			</div>
			<div class="4u 6u$(xsmall)">
				<a href="sciencemom.html" style="display:block; text-decoration:none;">
				<section class="special box">
					<img id="rcorners3" src="images/SMG1/SMG1square.png" style="width:150px;height: 150px;">
					<!--<i class="icon fa-rocket major"></i>-->
					<h3>Education Videos</h3>
					<p>Watch science lessons, tips for teachers, and more.</p>
				</section>
				</a>
			</div>
			<div class="4u 6u$(xsmall)">
				<a href="sciencemom.html" style="display:block; text-decoration:none;">
				<section class="special box">
					<img id="rcorners3" src="images/SMG1/SMG1square.png" style="width:150px;height: 150px;">
					<!--<i class="icon fa-rocket major"></i>-->
					<h3>Coloring Books</h3>
					<p>Printable, miniature, foldable books.</p>
				</section>
				</a>
			</div>
			<div class="4u 6u$(xsmall)">
				<a href="sciencemom.html" style="display:block; text-decoration:none;">
				<section class="special box">
					<img id="rcorners3" src="images/SMG1/SMG1square.png" style="width:150px;height: 150px;">
					<!--<i class="icon fa-rocket major"></i>-->
					<h3>Math Investigations</h3>
					<p>Gnomes of Grid comics and activities</p>
				</section>
				</a>
			</div>
			<div class="4u 6u$(xsmall)">
				<a href="sciencemom.html" style="display:block; text-decoration:none;">
				<section class="special box">
					<img id="rcorners3" src="images/SMG1/SMG1square.png" style="width:150px;height: 150px;">
					<!--<i class="icon fa-rocket major"></i>-->
					<h3>Science Mom Journey</h3>
					<p>Miscellaneous initiatives and support options</p>
				</section>
				</a>
			</div>
		</div>
	</div>
	
