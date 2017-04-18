---
layout: default
---

<style>
.boxx form{
  text-align:center;
  position: relative; 
  display: block;
  top:20px; 
  max-width:60%;
  margin-left: auto;
  margin-right: auto;
  padding: 0 0 0 50px;
}
.boxx div{
  text-align:center;
  position:relative;
  display: block;
  top:0px;  
  max-width:60%;
  margin-left: auto;
  margin-right: auto;
  padding: 0 0 0 50px;
}
.boxx {
	width:90%;
  height:250px;
	min-height:min-content;
	background:#FFF;
	margin:20px auto;
  background-image: url('https://github.com/jennyballif/jennyballif.github.io/blob/master/images/Gnome.png?raw=true');
  background-repeat: no-repeat;
  background-attachment: relative;
  background-position: 5% 50%;
}


/*==================================================
 

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

<script>
function searchKeyPress(e)
{
    // look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13)
    {
        document.getElementById('btnSearch').click();
        return false;
    }
    return true;
}
</script>
  

<script>
function myFunction() {
    var text;
    var fruits = document.getElementById("txtSearch").value;

    switch(fruits) {
        case "Banana":
            text = "Banana is good!";
        break;
        case "Orange":
        text = "I am not a fan of orange.";
        break;
        case "Apple":
        text = "How you like them apples?";
        break;
        default:
        text = "I have never heard of that fruit...";
    }
    document.getElementById("demo").innerHTML = text;
}
</script>
 


<!-- Banner -->
<section id="banner">
    <div class="inner">
        <h2>Science Mom</h2>
    </div>
</section>
<section id="main" class="wrapper style1">

<div class="container">
<h2>Gnomes of Grid</h2>
<div class="boxx effect7">

<form>  
  Enter the passcode to unlock new content:
<input type="text" id="txtSearch" onkeypress="return searchKeyPress(event);" />
<input type="button" id="btnSearch" style="display:none" Value="Search" onclick="myFunction();" />
  </form>
  <div id="demo"></div>

</div>


{% include periodictable.html %}
</div>




</section>
