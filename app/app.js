(function() {
  "use strict";
  	return {
		initialize: function() {
			var self = this;

			// container
			var $container = this.$container;

		  	// base url
		  	var baseUrl = "https://app.metorik.com";

		  	// email to request for (and urlencode)
		  	var email = page_type == 'ticket' ? domHelper.ticket.getContactInfo().user.email : domHelper.contact.getContactInfo().user.email;
		  	email = encodeURIComponent(email);

		  	// get data
		  	this.$request.get(baseUrl + "/api/store/external/freshdesk?token={{iparam.api_token}}&email=" + email)
				.done(function(data) {
					// stop loading
					jQuery($container).find('.loading').hide();

					// handle data
					var body = JSON.parse(data.response);

					// check for errors
					if (! body.success) {
						jQuery($container).find('.error').show();
						jQuery($container).find('.error .reason').text(body.reason);
					} else {
					  	// customer or guest
					  	jQuery($container).find('.customer-details').show();

					  	// customer
					  	if (body.customer) {
					  		// vars
					  		var joinDate = new Date(body.customer.customer_created_at).toDateString();
					  		var phone = body.customer.billing_address_phone;

					  		// show
					  		jQuery($container).find('.customer-url').show();
					  		jQuery($container).find('.customer-stats').show();
					  		jQuery($container).find('.customer-orders').show();
					  		jQuery($container).find('.customer-products').show();

					  		// customer details
					  		jQuery($container).find('.customer-url').attr('href', 'https://app.metorik.com/customer/' + body.customer.customer_id);
					  		jQuery($container).find('.customer-name').text(body.customer.fullName);
					  		jQuery($container).find('.customer-image').attr('src', body.customer.avatar);
					  		jQuery($container).find('.customer-join-date').text(joinDate);
					  		jQuery($container).find('.customer-location').show().text(body.customer.location);
					  		jQuery($container).find('.customer-phone').show().attr('href', 'tel:' + phone).text(phone);
					  	
					  		// customer stats
					  		jQuery($container).find('.customer-stats .orders .amount').text(body.totals.orders_count);
					  		jQuery($container).find('.customer-stats .orders .words').text(body.totals.orders_count == 1 ? 'Order' : 'Orders');
					  		jQuery($container).find('.customer-stats .items .amount').text(body.totals.items_count);
					  		jQuery($container).find('.customer-stats .items .words').text(body.totals.items_count == 1 ? 'Item' : 'Items');
					  		jQuery($container).find('.customer-stats .aov .amount').text(self.moneyFormat(body.totals.average_order, body.store.currency, 0));
					  		jQuery($container).find('.customer-stats .ltv .amount').text(self.moneyFormat(body.totals.total, body.store.currency, 0));
					  	
					  		// customer orders
					  		var customerOrdersHtml = '';
					  		body.orders.forEach(function(order) {
					  			var items = order.total_items + ' ' + (order.total_items == 1 ? 'item' : 'items');
					  			var orderDate = new Date(order.order_created_at).toDateString();

					  			customerOrdersHtml = customerOrdersHtml + '<div class="order">' +
				      				'<a href="https://app.metorik.com/order/' + order.order_id + '" class="order-link">' +
					      				'<div class="order-details clearfix">' +
						      				'<div class="details">' +
						      					'<div class="total">' +
						      						'<span class="amount">' + self.moneyFormat(order.total, body.store.currency) + '</span> for <span class="items">' + items + '</span>' +
					      						'</div>' +
						      					'<div class="meta">' +
						      						'<span class="order-number">' + order.order_number + '</span> - <span class="order-date">' + orderDate + '</span>' +
					      						'</div>' +
						      				'</div>' +
						      				'<div class="status-wrapper">' +
						      					'<div class="status">' + order.status + '</div>' +
						      				'</div>' +
					      				'</div>' +
				      				'</a>' +
				      			'</div>';
					  		});

					  		jQuery($container).find('.customer-orders .orders').prepend(customerOrdersHtml);

					  		// customer products
					  		var customerProductsHtml = '';
					  		for (var key in body.products) {
					  			if (! body.products.hasOwnProperty(key)) {
					  				continue;
					  			}
					  			var product = body.products[key];

								customerProductsHtml = customerProductsHtml + '<li class="product">' +
									'<span>' + product.name + '</span> x ' + product.count +
								'</li>';
					  		}

					  		jQuery($container).find('.customer-products .products').prepend(customerProductsHtml);
					  	}

					  	// guest
					  	if (body.guest) {
					  		// vars
					  		var order = body.orders[0];
					  		var joinDate = new Date(order.order_created_at).toDateString();
					  		var phone = order.billing_address_phone;
					  		var items = order.total_items + ' ' + (order.total_items == 1 ? 'item' : 'items');

					  		// show
					  		jQuery($container).find('.guest-data').show();

					  		// customer details
					  		jQuery($container).find('.customer-name').text(order.billing_address_first_name + " " + order.billing_address_last_name);
					  		jQuery($container).find('.customer-image').attr('src', order.customerAvatar);
					  		jQuery($container).find('.customer-join-date').text(joinDate);
					  		if (body.location) {
					  			jQuery($container).find('.customer-location').show().text(body.location);
					  		}
					  		if (phone) {
					  			jQuery($container).find('.customer-phone').show().attr('href', 'tel:' + phone).text(phone);
					  		}
					  		
					  		// order data
					  		jQuery($container).find('.guest-orders').show();
					  		jQuery($container).find('.guest-orders .order-link').attr('href', 'https://app.metorik.com/order/' + order.order_id);
					  		jQuery($container).find('.guest-orders .amount').text(self.moneyFormat(order.total, body.store.currency));
					  		jQuery($container).find('.guest-orders .items').text(items);
					  		jQuery($container).find('.guest-orders .order-number').text(order.order_number);
					  		jQuery($container).find('.guest-orders .order-date').text(joinDate);
					  		jQuery($container).find('.guest-orders .status').text(order.status);
					  		
					  		// order items
					  		var itemsHtml = '';
					  		order.line_items.forEach(function(item) {
					  			itemsHtml = itemsHtml + '<li>' + item.name + ' x ' + item.quantity + ' - ' + self.moneyFormat(item.total, body.store.currency) + '</li>';
					  		});
					  		jQuery($container).find('.guest-orders .order-items').show();
					  		jQuery($container).find('.guest-orders .order-items ul').append(itemsHtml);
					  	}

					  	// extra styling just for contact page
					  	if (page_type == 'contact') {
					  		jQuery($container).find('.customer-details').addClass('contact-page');
					  	}
					}
				})
				.fail(function(err) {
					// stop loading
					jQuery($container).find('.loading').hide();

					// handle data
					var body = JSON.parse(JSON.parse(err.message).response);

					// handle failure
					jQuery($container).find('.error').show();
					jQuery($container).find('.error .reason').text(body.reason);
				});
		},

		moneyFormat: function(amount, currency, decimals) {
			// decimals default
			if (decimals === undefined) {
				decimals = 2;
			}

			// number
			amount = new Number(amount);

			// format with decimals
			var number = amount.toFixed(decimals).replace(/./g, function(c, i, a) {
			    return i && c !== "." && (a.length - i) % 3 === 0 ? ',' + c : c;
			});

			// get symbol
			var symbol = this.getCurrencySymbol(currency);

			// put together and return
			return symbol + number;
		},

		getCurrencySymbol: function(code) {
			var symbols = {
				"AED": "د.إ",
				"AFN": "؋",
				"ALL": "L",
				"ANG": "ƒ",
				"AOA": "Kz",
				"ARS": "$",
				"AUD": "$",
				"AWG": "ƒ",
				"AZN": "₼",
				"BAM": "KM",
				"BBD": "$",
				"BDT": "৳",
				"BGN": "лв",
				"BHD": ".د.ب",
				"BIF": "FBu",
				"BMD": "$",
				"BND": "$",
				"BOB": "Bs.",
				"BRL": "R$",
				"BSD": "$",
				"BTN": "Nu.",
				"BWP": "P",
				"BYR": "p.",
				"BZD": "BZ$",
				"CAD": "$",
				"CDF": "FC",
				"CHF": "Fr.",
				"CLP": "$",
				"CNY": "¥",
				"COP": "$",
				"CRC": "₡",
				"CUC": "$",
				"CUP": "₱",
				"CVE": "$",
				"CZK": "Kč",
				"DJF": "Fdj",
				"DKK": "kr",
				"DOP": "RD$",
				"DZD": "دج",
				"EEK": "kr",
				"EGP": "£",
				"ERN": "Nfk",
				"ETB": "Br",
				"EUR": "€",
				"FJD": "$",
				"FKP": "£",
				"GBP": "£",
				"GEL": "₾",
				"GGP": "£",
				"GHC": "₵",
				"GHS": "GH₵",
				"GIP": "£",
				"GMD": "D",
				"GNF": "FG",
				"GTQ": "Q",
				"GYD": "$",
				"HKD": "$",
				"HNL": "L",
				"HRK": "kn",
				"HTG": "G",
				"HUF": "Ft",
				"IDR": "Rp",
				"ILS": "₪",
				"IMP": "£",
				"INR": "₹",
				"IQD": "ع.د",
				"IRR": "﷼",
				"ISK": "kr",
				"JEP": "£",
				"JMD": "J$",
				"JPY": "¥",
				"KES": "KSh",
				"KGS": "лв",
				"KHR": "៛",
				"KMF": "CF",
				"KPW": "₩",
				"KRW": "₩",
				"KYD": "$",
				"KZT": "₸",
				"LAK": "₭",
				"LBP": "£",
				"LKR": "₨",
				"LRD": "$",
				"LSL": "M",
				"LTL": "Lt",
				"LVL": "Ls",
				"MAD": "MAD",
				"MDL": "lei",
				"MGA": "Ar",
				"MKD": "ден",
				"MMK": "K",
				"MNT": "₮",
				"MOP": "MOP$",
				"MUR": "₨",
				"MVR": "Rf",
				"MWK": "MK",
				"MXN": "$",
				"MYR": "RM",
				"MZN": "MT",
				"NAD": "$",
				"NGN": "₦",
				"NIO": "C$",
				"NOK": "kr",
				"NPR": "₨",
				"NZD": "$",
				"OMR": "﷼",
				"PAB": "B/.",
				"PEN": "S/.",
				"PGK": "K",
				"PHP": "₱",
				"PKR": "₨",
				"PLN": "zł",
				"PYG": "Gs",
				"QAR": "﷼",
				"RMB": "￥",
				"RON": "lei",
				"RSD": "Дин.",
				"RUB": "₽",
				"RWF": "R₣",
				"SAR": "﷼",
				"SBD": "$",
				"SCR": "₨",
				"SDG": "ج.س.",
				"SEK": "kr",
				"SGD": "$",
				"SHP": "£",
				"SLL": "Le",
				"SOS": "S",
				"SRD": "$",
				"SSP": "£",
				"STD": "Db",
				"SVC": "$",
				"SYP": "£",
				"SZL": "E",
				"THB": "฿",
				"TJS": "SM",
				"TMT": "T",
				"TND": "د.ت",
				"TOP": "T$",
				"TRL": "₤",
				"TRY": "₺",
				"TTD": "TT$",
				"TVD": "$",
				"TWD": "NT$",
				"TZS": "TSh",
				"UAH": "₴",
				"UGX": "USh",
				"USD": "$",
				"UYU": "$U",
				"UZS": "лв",
				"VEF": "Bs",
				"VND": "₫",
				"VUV": "VT",
				"WST": "WS$",
				"XAF": "FCFA",
				"XBT": "Ƀ" ,
				"XCD": "$",
				"XOF": "CFA" ,
				"XPF": "₣" ,
				"YER": "﷼",
				"ZAR": "R",
				"ZWD": "Z$"
			};

			return symbols[code];
		}
	};
})();