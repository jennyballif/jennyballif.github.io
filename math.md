---
layout: default
---

<style>
.boxx form{
  text-align:center;
	position: relative; 
	top:40px;
  max-width:60%;
  margin-left: auto;
  margin-right: auto;
  padding: 0 0 0 50px;
}
.boxx div{
  text-align:center;
	position:relative;
	top:80px;  
}
.boxx {
	width:90%;
	height: auto !important;
	min-height:200px;
	background:#FFF;
	margin:20px auto;
  background-image: url('images/Gnome.png');
  background-repeat: no-repeat;
  background-attachment: relative;
  background-position: 5% 50%;
}


/*==================================================
 * Effect 7
 * ===============================================*/
.effect7
{
  	position:relative;
    -webkit-box-shadow:0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
       -moz-box-shadow:0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
            box-shadow:0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
}
.effect7:before, .effect7:after
{
	content:"";
    position:absolute;
    z-index:-1;
    -webkit-box-shadow:0 0 20px rgba(0,0,0,0.8);
    -moz-box-shadow:0 0 20px rgba(0,0,0,0.8);
    box-shadow:0 0 20px rgba(0,0,0,0.8);
    top:0;
    bottom:0;
    left:10px;
    right:10px;
    -moz-border-radius:100px / 10px;
    border-radius:100px / 10px;
}
.effect7:after
{
	right:10px;
    left:auto;
    -webkit-transform:skew(8deg) rotate(3deg);
       -moz-transform:skew(8deg) rotate(3deg);
        -ms-transform:skew(8deg) rotate(3deg);
         -o-transform:skew(8deg) rotate(3deg);
            transform:skew(8deg) rotate(3deg);
}
</style>


<!-- Banner -->
<section id="banner">
    <div class="inner">
        <h2>Gnomes of Grid</h2>
    </div>
</section>
<section id="main" class="wrapper style1">

<script type="text/javascript" src="http://code.jquery.com/jquery-1.6.2.js"></script>
<script type='text/javascript'>//<![CDATA[
$(window).load(function(){
$('#pwd').keyup(function(){
    if($(this).val() == 'smelly jelly bean')
       $('#content').show(); 
});
});//]]> 

</script>

<div class="container">
<div class="boxx effect7">

<form>
    Enter the passcode to unlock new content:
    <input id="pwd" type="text" name="pwd" />
</form>
<div id="content" style="display:none;">
    testing 123
</div>  
  
</div>
</div>

</section>
