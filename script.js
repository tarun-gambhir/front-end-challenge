var getPdts = $.Deferred();
var domUpdated = $.Deferred();

//show the spinner until page loads.
$(window).bind("load", function () {
	$('#inProgress').fadeOut(2000);
});

function domobj(){
  var self        =this;
  self.products   = [];

  self.getproducts = function(url){
    $.getJSON(url, function(response){
        for(i=0; i<response.sales.length ; i++){
          self.products.push( new productobj(response.sales[i], i)  );
        }
		for( i=0; i< self.products.length ; i++){
		  self.products[i].updatehtml();
		}
    }).done(function(){
		getPdts.resolve();	//getProducts is complete, now we can update DOM.
	});
  }
  //Included in the getJSON call above
/*	  
  self.updateproducthtml = function(){
    for( i=0; i< self.products.length ; i++){
      self.products[i].updatehtml();
    }
  }
*/
  self.updatedom = function(){
    var i=0
    thishtml='';
	var pdts = [];
		
    for( i=0; i< self.products.length ; i++){
      if (i % 3 == 0 ){  thishtml += "<div class='row'>";}
      thishtml += self.products[i].htmlview;
      if ((i % 3 == 2) || i == (self.products.length-1) ){thishtml += "</div>";}
	 pdts[i] = self.products[i];
    }
    $("#content").append(thishtml);
	domUpdated.resolve([pdts]);		//pass in the products array to doneCallback.
  }
}

function productobj(product, i){
  var self          = this;
  self.photo        = product.photos.medium_half
  self.title        = product.name
  self.tagline      = product.tagline
  self.url          = product.url
  self.description	= product.description;
  self.htmlview     = ""
  self.index        = i

   self.updatehtml= function(){
    $.get('product-template.html', function(template){
      self.htmlview = template
	  .replace('{image}', self.photo)
	  .replace(/{title}/g, self.title)		//replace title globally
	  .replace('{tagline}', self.tagline)
	  .replace('{url}', self.url);
    });

  }
}

var page=new domobj();
page.getproducts('data.json');

$.when(getPdts).then(function(){
	setTimeout("page.updatedom()",500);
});

domUpdated.done(function(resp){
    $(".product-container").hover(function(){
			for(var i=0; i<resp[0].length; i++){
				//Match the title data in input to the title in the product, if matched -> show the repective description
				if($(this).data('title') == resp[0][i].title){
					$(this).find(".product-box-overlay").html(resp[0][i].description);
					$(this).find(".product-box-overlay").show();
				}
			}
		},
		function(){
			$(this).find(".product-box-overlay").hide();
		}
	);
	
	$(".closeBtn").click(function(){
		var pdt = $(this).parent().prev();
		var self = $(this);
		pdt.animate({
			opacity: 0.25,
			height: "toggle"
		}, "slow", function() {
			// Animation complete.
			self.remove();
		});
		
	});

});
