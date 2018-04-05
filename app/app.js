$(document).ready( function() {
    app.initialized()
        .then(function(_client) {
            var client = _client;
            client.events.on('app.activated',
                function() {
                    client.data.get('contact')
                        .then(function(data) {
                            var contact = data.contact;
                            
                            // timeout so app is active
                            setTimeout(function() {
                                new Vue({
                                    el: '#app',

                                    data: {
                                        apiUrl: 'https://app.metorik.com',
                                        user: {},
                                        loading: true,
                                        error: false,
                                        metorikError: false,
                                        tokenError: false,
                                        metorik: {
                                            data: false
                                        },
                                        showAllItems: false
                                    },

                                    mounted: function () {
                                        this.user = contact;
                                        this.getMetorikData();
                                    },

                                    methods: {
                                        getMetorikData: function () {
                                            var self = this;
                                            var email = this.user.email;

                                            // get data from metorik
                                            var url = self.apiUrl + '/api/store/external/freshdesk?token=<%= iparam.api_token %>&email=' + encodeURIComponent(email);
                                            client.request.get(url)
                                                .then(
                                                    function (data) {
                                                        var response = JSON.parse(data.response);

                                                        self.loading = false;
                                                        // handle response
                                                        if (response.success) {
                                                            self.metorik.data = response;
                                                        } else {
                                                            self.metorikError = response.reason;
                                                        }
                                                    },
                                                    function () {
                                                        self.error = true;
                                                    }
                                                );
                                        },

                                        dateFormat: function (date, format) {
                                            var format = format || 'LL';
                                            return moment(date).format(format);
                                        },

                                        numberFormat: function (amount, precision) {
                                            var precision = precision || 2;
                                            return accounting.formatNumber(amount, precision);
                                        },

                                        /**
                                         * Number of decimals for a total items count. Handles possiblity
                                         * that there are decimals, and if so, will give 2 Otherwise 0.
                                         */
                                        totalItemsDecimals: function (items) {
                                            return items % 1 != 0 ? 2 : 0;
                                        },

                                        moneyFormat: function (amount, precision) {
                                            var precision = precision || 2;
                                            
                                            // use current store's current
                                            currency = this.metorik.data.store.currency;

                                            // get symbol for given currency code
                                            var symbol = this.getCurrencySymbol(currency);

                                            // format with accounting js and return
                                            // note - if invalid symbol/currency, uses $
                                            return accounting.formatMoney(amount, symbol, precision);
                                        },

                                        pluralWord: function (count, single, plural) {
                                            var single = single || 'item';
                                            var plural = plural || 'items';

                                            if (count == 1) {
                                                return single;
                                            }

                                            return plural;
                                        },

                                        subscriptionPeriod: function(subscription) {
                                            var period = subscription.billing_interval == 1 ? subscription.billing_period : this.ordinal(subscription.billing_interval) + ' ' + subscription.billing_period;
                                            var amount = this.moneyFormat(subscription.order.total, 2) + ' / ' + period;
                                            return amount;
                                        },

                                        /**
                                         * Ordinal of a number.
                                         * @param n
                                         * @returns {string}
                                         */
                                        ordinal: function (n) {
                                            var s = ["th", "st", "nd", "rd"],
                                                v = n % 100;
                                            return n + (s[(v - 20) % 10] || s[v] || s[0]);
                                        },

                                        statusAttribute: function (status) {
                                            var color;
                                            var icon;

                                            switch (status) {
                                                case 'completed':
                                                    color = '#27AE60'; // green
                                                    icon = 'fa-check';
                                                    break;
                                                case 'active':
                                                    color = '#27AE60'; // green
                                                    icon = 'fa-calendar-check-o';
                                                    break;
                                                case 'processing':
                                                    color = '#FECF39'; // yellow
                                                    icon = 'fa-ellipsis-h';
                                                    break;
                                                case 'pending':
                                                    color = '#ff7418'; // lighter orange
                                                    icon = 'fa-clock-o';
                                                    break;
                                                case 'on-hold':
                                                    color = '#D35400'; // orange
                                                    icon = 'fa-pause-circle';
                                                    break;
                                                case 'cancelled':
                                                    color = '#C0392B'; // darker red
                                                    icon = 'fa-ban';
                                                    break;
                                                case 'refunded':
                                                    color = '#E74C3C'; // red
                                                    icon = 'fa-refresh';
                                                    break;
                                                case 'failed':
                                                    color = '#222C3C'; // dark blue
                                                    icon = 'fa-exclamation';
                                                    break;
                                                default:
                                                    color = '#222'; // black
                                                    icon = 'fa-circle';
                                                    break;
                                            }

                                            return {
                                                color: color,
                                                icon: icon
                                            };
                                        },

                                        getCurrencySymbol: function (code) {
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
                                                "XBT": "Ƀ",
                                                "XCD": "$",
                                                "XOF": "CFA",
                                                "XPF": "₣",
                                                "YER": "﷼",
                                                "ZAR": "R",
                                                "ZWD": "Z$"
                                            };

                                            return symbols[code];
                                        }
                                    },
                                });
                            }, 750);
                        })
                        .catch(function(e) {
                            console.log('Exception - ', e);
                        });
        });
    });
});