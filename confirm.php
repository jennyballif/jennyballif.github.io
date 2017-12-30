---
layout: default
---


<style type="text/css">
form#captcha_form ol {list-style: none outside none;}
form#captcha_form label.solo, form#captcha_form span.category {
	display:		block;
	float:			left;
	width: 			175px;
	font-weight:	bold;
}
span.required {
	clear:			left;
	color:			#888888;
	display:		block;
	float:			left;
	width:			100px;
}
form#captcha_form li div.soloinput, img#captcha{
	display:		inline-block;
}
form#captcha_form li input.soloinput, form#captcha_form li select.soloinput, form#captcha_form li textarea.soloinput, form#captcha_form li div.soloinput {
	width: 			250px;
	height:			21px;
	font-family:	inherit;
	font-size:		inherit;
	padding:		7px;
	margin-top: 	2px;
	border:			#888888 1px solid;
}
form#captcha_form li textarea.soloinput {
	height:			100px;
}
form#captcha_form li div.soloinput {
	border:			0px;
	padding:		0px;
}
form#captcha_form li select.soloinput{
	width:			266px;
	height:			36px;
}
form#captcha_form li input.city {
	width: 			154px;
	height:			21px;
	font-family:	inherit;
	font-size:		inherit;
	padding:		7px;
	margin-top: 	2px;
	border:			#888888 1px solid;
	margin-right:	0px;
	padding-right:	0px;
}
form#captcha_form li span.comma {
	display:		inline;
	width: 			16px;
	font-family:	inherit;
	font-size:		inherit;
	padding:		7px;
	margin-top: 	2px;
	margin-left:	0px;
	padding-left:	0px;
	margin-right:	0px;
	padding-right:	0px;
	readonly:		true;
}
form#captcha_form li input.state {
	width: 			80px;
	height:			21px;
	font-family:	inherit;
	font-size:		inherit;
	padding:		7px;
	margin-top: 	2px;
	border:			#888888 1px solid;
	margin-left:	0px;
	padding-left:	0px;
}
form#captcha_form li input#zip {
	width:			90px;
	height:			21px;
}
form#captcha_form li select#month {
	width: 			128px;
	height:			36px;
	font-family:	inherit;
	font-size:		inherit;
	padding:		7px;
	margin-top: 	2px;
	border:			#888888 1px solid;
}
form#captcha_form li select#day {
	width: 			60px;
	height:			36px;
	font-family:	inherit;
	font-size:		inherit;
	padding:		7px;
	margin-top: 	2px;
	border:			#888888 1px solid;
}
form#captcha_form li select#year {
	width: 			60px;
	height:			36px;
	font-family:	inherit;
	font-size:		inherit;
	padding:		7px;
	margin-top: 	2px;
	border:			#888888 1px solid;
}
form#captcha_form li img#captcha {
	font-family:	inherit;
	font-size:		inherit;
	padding:		7px;
	margin-top: 	0;
}
fieldset {
	border:			0px;
	padding:		0px;
	margin:			0px;
	padding-right:	37px;
	display:		block;
	min-width:		450px;
}
form#captcha_form li {
	border-bottom:	1px dashed #999999;
	height:			1%;
	padding:		12px 0 12px 0;
	position: 		relative;
}
form#captcha_form a.soloinput {
	max-width: 		350px;
	min-width:		250px;
	font-size:		14px;
}
#ht {
	display:		none;
}
</style>

<!-- Banner -->
<section id="banner">
    <div class="inner">
        <h2>Support</h2>
    </div>
</section>

<div id="main" class="container">
  <p>
Please fill out any details below unless you would like to remain anonymous.
  </p>
</div>

<form method="post" id="captcha_form" name="captcha_form" action="mailform.php"><fieldset><ol>
<li id="ht"><label class="solo" for="htest">Leave this input blank</label><span class="required">(required)</span><input type="text" class="soloinput" name="htest" id="htest" value="" />

	</li><li><label class="solo" for="email">Email address:</label><span class="required">(required)</span><input type="text" class="soloinput" name="email" id="email" value="" />

	</li><li><label class="solo" for="name">Name:</label><input type="text" class="soloinput" name="name" id="name" value="" />


	</li><li><label class="solo" for="companyname">Company Name:</label><input type="text" class="soloinput" name="companyname" id="companyname" value="" />


	</li><li><span class="category">Mailing address:</span>
	<br /><label class="solo" for="addressline1">Line 1:</label> <input type="text" class="soloinput" name="addressline1" id="addressline1" value="" />
	<br /><label class="solo" for="addressline2">Line 2:</label> <input type="text" class="soloinput" name="addressline2" id="addressline2" value="" />
	<br /><span class="category"><label for="city">City</label> and <label for="state">State:</label></span> <input type="text" class="city" name="city" id="city" value="" /><span class="comma" name="comma"> , </span><input type="text" class="state" name="state" id="state" value="" />
	<br /><label class="solo" for="zip">Zip:</label><input type="text" class="soloinput" name="zip" id="zip" style="" value="" />

	</li><li><label class="solo" for="phone">Phone number:</label> <input type="text" class="soloinput" name="phone" id="phone" value="" />


	</li><li><label class="solo" for="url">Website URL:</label> <input type="text" class="soloinput" name="url" id="url" value="http://" />

	<?php $subject = "New Paypal Supporter Contact"; ?>
	</li><li><label class="solo" for="message">Message:</label><span class="required">(required)</span>
<div class="soloinput"><textarea class="soloinput" name="message" id="message" ></textarea>
						<br /><a class="soloinput" href="http://www.addressmunger.com/contact_form_generator/" style="">Free contact form from AddressMunger.com</a>


	<p><input name="submit" id="submit" type="submit" value="Send" style="float: right;" /></p></div>
	</li></ol>
</fieldset></form> &nbsp;<br />&nbsp;<br />&nbsp;
