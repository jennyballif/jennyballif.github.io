---
layout: default
---




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


<div class="box effect7">
<form>
    Enter the passcode to unlock new content:
    <input id="pwd" type="text" name="pwd" />
    </form>
    <div id="content" style="display:none;">
    testing 123
    </div>  
  
</div>

</section>
