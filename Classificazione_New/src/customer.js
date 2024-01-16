var _ottoCifre;
var tassonomia = { "keys" : [
    {
        "key" : "150",
        "class" : "performing",
        "label" : "Performing"
    },
    {
        "key" : "151",
        "class" : "active",
        "label" : "Attivo"
    },
    {
        "key" : "152",
        "class" : "static",
        "label" : "Statico"
    },
    {
        "key" : "153",
        "class" : "inactive",
        "label" : "Inattivo"
    }
],
    getMatchedTassonomia : function (val){
        var matchedkey=null;
        $.grep(tassonomia.keys ,function(obj) {
            if(obj.key.toString()===val.toString()){
                matchedkey=obj;
                return;
            }
        });
        return matchedkey;
    }
};

wkscustomer.openListaMoviementi = function(e){
    var $target = $(e.currentTarget),
        smName = $target.attr('smName'),
        inputParams = $target.attr('value');
    var error = function(){
        wkscSMHandler.openLink_smAdaptor({smname: smName, outparams: $target.attr('smOutParams'), inputparams:  JSON.stringify({contoID: inputParams, numeroGiorni: 10}) , newtab: $target.attr('newtab'), iframe: $target.attr('iframe')});
    }
    var  onGrantSuccess = function(hasGrant){
        if (hasGrant) {
            wkscommerciale.getWkscParam('FLAG_LISTA_MOVIMENTI', _.bind(function(response){
                if(_.has(response, 'status') && response.status === 'success' && response.data[0]['FLAG_LISTA_MOVIMENTI']  === 'Y') {
                    customCardLoader({
                        loadType: 'slidein',
                        cardSize: 'size_enormous',
                        cardName: window.wkscustomerContext+'/assets/cards/3.2.3.lista_movimenti_card.html'
                    });
                } else {
                    error()
                }
            }),error)
        }else{
            error()
        }
    }
    wkscommerciale.profiles.checkProfile('ENABLE_LISTA_MOVIMENTI',onGrantSuccess,error);
}

wkscustomer.getCommercialeInfoByConto = function() {
    //Passing soggesto to get conti SOA and getting contoId
    //Using conto getting the related portfolio
    //Using the conto ID's of portfolio user can open an portfolio
    $('#perConto').hide();
    $('#perConto').wkscspinner({css: 'large', position: true});
    var params = {
        'soggettoId': wkscommerciale.idSoggetto.get()
    };
    wkscommerciale.ajaxRequests.post({
        url: window.wkscustomerContext + '/service/customers/getCommercialeInfoByConto',
        params: params,
        dataType: 'json',
        onSuccess: _.bind(function(response) {
            var customerCommercialInfoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/customer_conto_commerciale_info'));
            $('#perConto').wkscspinner('remove');
            if(response.data[0] && response.data[0].refIDContosList.length > 3 && response.data[1] && response.data[1].enablePerContoNewCard==='true'){
                wkscommerciale.customer.refIDContosList = response.data[0].refIDContosList;
                customCardLoader({
                    loadType: 'slidein',
                    cardSize: 'size_small',
                    cardName: window.wkscustomerContext+'/assets/cards/3.12.elenco_13_cifre.html'
                });
            }else {
                var customerCommercialInfoHTML = customerCommercialInfoTemplate({
                    "customerdetails": response.data[0].refIDContosList
                });
                $("#commerciale_portfolio").find("span").remove();
                $("#commerciale_portfolio").append(customerCommercialInfoHTML);
                $(window).trigger('scrollbar:resize', 'relative');
            }
            // if(wkscommerciale.customer.tipoSoggetto==="Semplice"){
            //     $("#commerciale_portfolio span").css({"margin-left":"100px","margin-top":"-16px","position":"relative"})
            // }
        }, this),
        onError: _.bind(function(evt) {
            wkscommerciale.notifyError.pushFromFetchError(evt, []);
            $('#perConto').wkscspinner('remove');
        }, this)
    });
}


wkscustomer.views.PersonalCustomerView = Backbone.View.extend({
    el: $(".card"),
    initialize: function(options) {
        this.options = options;
        this.isSaldiVisible = options.isSaldiVisible;
        this.soggettoId = options.soggettoId;
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        wkscApp.setTipoQuestionario("Private");
        var PrivateCustomerPage = new wkscustomer.views.PrivateCustomerPage({
            el: $("#private_customer_1"),
            logger: this.options.logger
        });
        if(PrivateCustomerPage) {
            wkscommerciale.consolle.log('PrivateCustomerPage variable is used!');
        }
        var saldiEComposizioneList = new wkscustomer.collections.SaldiEComposizioneList();
        //wkscommerciale.log.doPushLog({logger: this.options.logger});
        var SaldiEComposizioneView = new wkscustomer.views.SaldiEComposizioneView({
            el: $("#SaldiComposizione"),
            collection: saldiEComposizioneList,
            logger: this.options.logger,
            isSaldiVisible: this.isSaldiVisible,
            soggettoId: this.soggettoId,
        });
        if(SaldiEComposizioneView) {
            wkscommerciale.consolle.log('SaldiEComposizioneView variable is used!');
        }
//		wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
//			if( ! hasGrant) {
//				wkscommerciale.log.doPushLog({logger: this.options.logger});
//				var bisogniList = new wkscustomer.collections.ShortNeedsMapList();
//				var ShortNeedsMapView = new wkscustomer.views.ShortNeedsMapView({
//					el: $("#ShortNeedsMap"),
//					collection: bisogniList,
//					logger: this.options.logger
//				});
//			} else {
//				$('#ShortNeedsMap').parents('section').remove();
//			}
//		}, this));
        this.recordsPerPage = 10;
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        var collegamenti = new wkscustomer.collections.CollegamentiList();
        var CollegamentiView = new wkscustomer.views.CollegamentiView({
            el: $("#private_customer_3"),
            collection: collegamenti,
            isSaldiVisible: this.isSaldiVisible,
            soggettoId: this.soggettoId,
            recordsPerPage: this.recordsPerPage,
            currentPage: '1',
            logger: this.options.logger
        });
        if(CollegamentiView) {
            wkscommerciale.consolle.log('CollegamentiView variable is used!');
        }
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        var soggettiAbilitati = new wkscustomer.collections.SoggettiAbilitatiList();
        new wkscustomer.views.SoggettiAbilitatiView({
            el: $("#SoggettiAbilitati"),
            collection: soggettiAbilitati,
            logger: this.options.logger
        }).render();
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        var soggettiConti = new wkscustomer.collections.SoggettiContiList();
        var SoggettiContiView = new wkscustomer.views.SoggettiContiView({
            el: $("#private_customer_5"),
            collection: soggettiConti,
            isSaldiVisible: this.isSaldiVisible,
            soggettoId: this.soggettoId,
            recordsPerPage: this.recordsPerPage,
            currentPage: '1',
            logger: this.options.logger
        });
        if(SoggettiContiView) {
            wkscommerciale.consolle.log('SoggettiContiView variable is used!');
        }
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        var attivitaCliente = new wkscustomer.collections.AttivitaClienteList();
        var AttivitaClienteView = new wkscustomer.views.AttivitaClienteView({
            el: $("#attivita_Private"),
            collection: attivitaCliente,
            logger: this.options.logger
        });
        if(AttivitaClienteView) {
            wkscommerciale.consolle.log('AttivitaClienteView variable is used!');
        }
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        var segnalazioniCliente = new wkscustomer.collections.ElencoSegnalazioniList({type: 'CUSTOMER'});
        var SegnalazioniClienteView = new wkscustomer.views.SegnalazioniClienteView({
            el: $("#segnalazioni"),
            collection: segnalazioniCliente,
            logger: this.options.logger
        });
        if(SegnalazioniClienteView) {
            wkscommerciale.consolle.log('SegnalazioniClienteView variable is used!');
        }
        /*wkscommerciale.log.doPushLog({logger: this.options.logger});
         var operativitaCliente = new wkscustomer.collections.OperativitaClienteList();
         var OperativitaClienteView = new wkscustomer.views.OperativitaClienteView({
         el: $("#operativita-cliente"),
         collection: operativitaCliente,
         logger: this.options.logger
         });*/
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.PlurintestazioneCustomerView = Backbone.View.extend({
    el: $(".card"),
    initialize: function(options) {
        this.options = options;
        this.isSaldiVisible = options.isSaldiVisible;
        this.soggettoId = options.soggettoId;
        wkscApp.setTipoQuestionario("Private");
        wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.JointCustomerPage({
            el: $("#private_customer_1"),
            logger: this.options.logger
        }).render();
        var saldiEComposizioneList = new wkscustomer.collections.SaldiEComposizioneList();
        //wkscommerciale.log.doPushLog(this.options);
        var SaldiEComposizioneView = new wkscustomer.views.SaldiEComposizioneView({
            el: $("#SaldiComposizione_pluri"),
            collection: saldiEComposizioneList,
            logger: this.options.logger,
            isSaldiVisible: this.isSaldiVisible,
            soggettoId: this.soggettoId
        });
        if(SaldiEComposizioneView) {
            wkscommerciale.consolle.log('SaldiEComposizioneView variable is used!');
        }
//		wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
//			if( ! hasGrant) {
//				var bisogniList = new wkscustomer.collections.ShortNeedsMapList();
//				wkscommerciale.log.doPushLog(this.options);
//				var ShortNeedsMapView = new wkscustomer.views.ShortNeedsMapView({
//					el: $("#ShortNeedsMap_pluri"),
//					collection: bisogniList,
//					logger: this.options.logger
//				});
//			} else {
//				$('#ShortNeedsMap_pluri').parents('section').remove();
//			}
//		}, this));
        var soggettiAbilitati = new wkscustomer.collections.SoggettiAbilitatiList();
        wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.SoggettiAbilitatiView({
            el: $("#SoggettiAbilitati_pluri"),
            collection: soggettiAbilitati,
            logger: this.options.logger
        }).render();
        var attivitaCliente = new wkscustomer.collections.AttivitaClienteList();
        wkscommerciale.log.doPushLog(this.options);
        var AttivitaClienteView = new wkscustomer.views.AttivitaClienteView({
            el: $("#attivita_Pluri"),
            collection: attivitaCliente,
            logger: this.options.logger
        });
        if(AttivitaClienteView) {
            wkscommerciale.consolle.log('AttivitaClienteView variable is used!');
        }
        var segnalazioniCliente = new wkscustomer.collections.ElencoSegnalazioniList({type: 'CUSTOMER'});
        wkscommerciale.log.doPushLog(this.options);
        var SegnalazioniClienteView = new wkscustomer.views.SegnalazioniClienteView({
            el: $("#segnalazioni_Pluri"),
            collection: segnalazioniCliente,
            logger: this.options.logger
        });
        if(SegnalazioniClienteView) {
            wkscommerciale.consolle.log('SegnalazioniClienteView variable is used!');
        }
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.JointCustomerPage = Backbone.View.extend({
    el: $("#private_customer_1"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/joint_account_customer_page'));
        $(this.el).append(_template());
        var plurintestazioneCustomerInfo = new wkscustomer.collections.PlurintestazioneCustomerInfoList();
        wkscommerciale.log.doPushLog(this.options);
        var JointAccountCustomerInfoView = new wkscustomer.views.JointAccountCustomerInfoView({
            el: $("#personalInfo_Pluri"),
            collection: plurintestazioneCustomerInfo,
            logger: this.options.logger
        });
        if(JointAccountCustomerInfoView) {
            wkscommerciale.consolle.log('JointAccountCustomerInfoView variable is used!');
        }
        wkscommerciale.log.doPushLog(this.options);
        var JointAccountCustomerButtonGroup = new wkscustomer.views.JointAccountCustomerButtonGroup({
            el: $("#bigButtonClass_Pluri"),
            logger: this.options.logger
        });
        if(JointAccountCustomerButtonGroup) {
            wkscommerciale.consolle.log('JointAccountCustomerButtonGroup variable is used!');
        }
        var attivita = new wkscustomer.collections.AttivitaList();
        wkscommerciale.log.doPushLog(this.options);
        var AttivitaListView = new wkscustomer.views.AttivitaListView({
            el: $("#activitiesList_Pluri"),
            collection: attivita,
            logger: this.options.logger
        });
        if(AttivitaListView) {
            wkscommerciale.consolle.log('AttivitaListView variable is used!');
        }
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.PluriCustomerHeader = wkscommerciale.views.WksMasterView.extend({
    el: $("#fixed_header_dupconst"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var customerInfoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/pluri_customer_header'));
        var customerInfoHTML = customerInfoTemplate({
            "data": this.options.data,
            "ottoCifre": this.options.ottoCifre,
            "plurintestazioneCustomerInfo": this.options.plurintestazioneCustomerInfo
        });
        $(this.el).empty();
        $(this.el).append(customerInfoHTML);
        new wkscustomer.views.JointAccountCustomerExternalLinks({
            el: $("#externalLinkButtons_Pluri"),
            "data": this.options.plurintestazioneCustomerInfo[0].alerts,
            "ottoCifre": this.options.plurintestazioneCustomerInfo[0].ottoCifre,
            logger: this.options.logger
        }).render();
        var sociaFlag = $('#sociaFlag'), customerName = this.$('.header-customer-name');
        if(this.options.isSocioEnabled){
            customerName.css({'max-width': 'calc(100% - 55px)'});
            sociaFlag.show();
        } else {
            // remove this property if already set
            customerName.css({'max-width': ''});
            sociaFlag.remove();
        }
        updateFixedHeaderOnCustomers($(".active"));
    }
});
wkscustomer.views.JointAccountCustomerInfoView = wkscommerciale.views.WksMasterView.extend({
    el: $("#personalInfo_Pluri"),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        if( ! _.isUndefined(wkscustomer.personalInfoCollection)) {
            var cb = _.bind(function() { this.render(); }, this);
            $.when( this.collection.reset(wkscustomer.personalInfoCollection) ).then(cb, cb);
        } else {
            wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
                soggettoId: wkscommerciale.idSoggetto.get()
            });
        }
    },
    events : {
        'click #perConto' : 'getCommercialeByConto'
    },
    render: function() {
        delete wkscustomer.personalInfoCollection;
        var plurintestazioneCustomerInfo = this.collection.toJSON();
        if (plurintestazioneCustomerInfo[0].data.length != 0) {
            var plurintestazioneCustomerInfoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/plurintestazione_customer_info'));
            wkscommerciale.log.doPushLog(this.options);
            var isSocioEnabled = ! wkscommerciale.checkIsEmpty(plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto)
            && _.has(plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto[0], 'socioLabelEnabled')
                ? plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto[0].socioLabelEnabled : false;
            new wkscustomer.views.PluriCustomerHeader({
                el: $("#fixed_header_dupconst"),
                "data": plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto[0].alerts,
                "ottoCifre": plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto[0].ottoCifre,
                "plurintestazioneCustomerInfo": plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto,
                "isSocioEnabled": isSocioEnabled
            }).render();
//			var customerIndicators = new wkscustomer.collections.CustomerIndicators();
//			wkscommerciale.log.doPushLog(this.options);
//			var CustomerPageIndicators = new wkscustomer.views.CustomerPageIndicators({
//				el: $("#customerIndicators_Pluri"),
//				collection: customerIndicators,
//				logger: this.options.logger
//			});
//			if(CustomerPageIndicators) {
//				wkscommerciale.consolle.log('CustomerPageIndicators variable is used!');
//			}
            new wkscustomer.views.CustomerInfoIndicatorsView({
                el: $("#customerInfoIndicators_Pluri"),
                logger: this.options.logger
            }).render();
            var members = [];
            for (var i = 1; i < plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto[0].intestazione.length; i++) {
                members.push(plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto[0].intestazione[i].nome);
            }
            var plurintestazioneCustomerInfoHTML = plurintestazioneCustomerInfoTemplate({
                "plurintestazioneCustomerInfo": plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto
            });
            $(this.el).append(plurintestazioneCustomerInfoHTML);
            _.each(plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto, function(item, i){
                _.each(item.intestazione, function(item, j) {
                    //this.abilitatiPrivacyAlert(item.soggettoId)
                    this.checkAbilitatiCustomerAlert(item.soggettoId)
                }, this);
            }, this);
            // PORTAHC-2345: case pluri customers begin
            if (wkscommerciale.user.bankId === "1367924") {
                var elemento = $('span[class="external_link"]');
                if (elemento) {
                    elemento.prop("onclick", null);
                    elemento.replaceWith(function () {
                        return $('<' + this.nodeName + '>').append($(this).contents());
                    });
                }
            }
            // PORTAHC-2345: case pluri customers end
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.profiles.checkProfile('ENABLE_COMMERCIALE', function(hasGrant) {
            if(! hasGrant ) {
                $('.pluri_commerc').hide();
            } else {
                var customerCommercialInfoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/customer_soggesto_commerciale_info'));

                ///need to take wks ma param
                //need to grant
                var showPerConto = false;

                var errorCallBack = function(errOutput) {
                    //console.log(errOutput);
                };

                var successMaParam = function(output){
                    if(_.has(output, 'status') && output.status === 'success' && output.data[0]['ENABLE_COMMERCIALE_BY_IDCONTO']  === 'Y') {
                        showPerConto = true;
                    } else {
                        showPerConto = false;
                    }
                    var customerCommercialInfoHTML = customerCommercialInfoTemplate({
                        "customerdetails": plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto[0],
                        "showPerConto" : showPerConto
                    });
                    $("#commerciale_portfolio").append(customerCommercialInfoHTML);
                };


                var onGrantSuccess = function(hasGrantForPerConto){

                    if (hasGrantForPerConto) {
                        wkscommerciale.getWkscParam('ENABLE_COMMERCIALE_BY_IDCONTO', successMaParam, errorCallBack);
                    } else {
                        var customerCommercialInfoHTML = customerCommercialInfoTemplate({
                            "customerdetails": plurintestazioneCustomerInfo[0].data[0].dettagliSoggetto[0],
                            "showPerConto" : false
                        });
                        $("#commerciale_portfolio").append(customerCommercialInfoHTML);
                    }
                }

                wkscommerciale.profiles.checkProfile('ENABLE_COMMERCIALE_PERCONTO', onGrantSuccess, errorCallBack);

            }
        });
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    /*abilitatiPrivacyAlert : function(soggettoId) {
     wkscommerciale.ajaxRequests.get({
     url: window.wkscustomerContext + '/service/customers/popupSignals',
     params: {
     'soggettoId' : soggettoId
     },
     onSuccess : _.bind(function(response){
     var data = _.has(response, 'data') ? response.data : [];
     if(data.length > 0) {
     var alertCnt = data.length;
     var code = alertCnt > 1 ? 'MANYALERTS' : (_.has(data[0], 'msgCode') ? data[0].msgCode : '');
     if(code) {
     var iconId = wkscommerciale.generateRandomText(8),
     msgs = {
     'MANYALERTS' : 'Necessario recupero modulo privacy',
     'PRIVACYLV6' : 'Necessario aggiornamento consensi privacy'
     },
     icons = {
     'MANYALERTS' : '<img src="assets/vendor-app/images/icon-doc-privacy.png" class="privacy-icon privacy-alert" data-ctool="#' + iconId + '" style="cursor:help;" /><div class="ctool privacy-alert" id="' + iconId + '">{msg}</div>',
     'PRIVACYLV6' : '<img src="assets/vendor-app/images/icon-privacy.png" class="privacy-icon privacy-alert" data-ctool="#' + iconId + '" style="cursor:help;" /><div class="ctool privacy-alert" id="' + iconId + '">{msg}</div>'
     },
     nameLink = this.$('[idsoggetto="' + soggettoId + '"]'),
     nameLinkParent = nameLink.parent('.client_line');
     nameLinkParent.find('.privacy-alert').remove();
     nameLinkParent.append(icons[code].replace(/{msg}/ig, msgs[code]));
     $(window).trigger('cardmaster:loaded', this.$el);
     }
     }
     }, this),
     onError : _.bind(function(response) {
     })
     });
     },*/
    checkAbilitatiCustomerAlert : function(soggettoId) {
        if(typeof wkscustomer.collections.allPopupSignals !== 'undefined') {
            var popupData = wkscustomer.collections.allPopupSignals.toJSON();
            if( ! wkscommerciale.checkIsEmpty(popupData)&& _.has(popupData[0], 'data') &&
                ! wkscommerciale.checkIsEmpty(popupData[0].data) && _.has(popupData[0].data[0], soggettoId)) {
                var alerts = popupData[0].data[0][soggettoId],
//					msgs = {
//						'NOTRACELET' : 'Necessario recupero modulo privacy',
//						'PRIVACYLV6' : 'Necessario aggiornamento consensi privacy',
//						'RDPRVCY3PF' : 'Consenso privacy ai fini commerciali mancante',
//						'RDPRVCY3PL' : 'Consenso privacy ai fini commerciali mancante',
//						'RDRECUPDPF' : 'Necessario aggiornare i recapiti',
//						'RDRECUPDPL' : 'Necessario aggiornare i recapiti'
//					},
                    nameLink = this.$('[idsoggetto="' + soggettoId + '"]'),
                    nameLinkParent = nameLink.parent('.client_line');
                nameLinkParent.find('.privacy-alert').remove();
                _.each(alerts, function(alert, i) {
                    var code = _.has(alert, 'msgCode') && _.size(alert.msgCode) > 0 ? alert.msgCode : '',
                        icon = _.has(alert, 'icon') && _.size(alert.icon) > 0 ? alert.icon : '';
                    if(code && icon) {
                        var iconId = wkscommerciale.generateRandomText(8),
                            tooltipText = _.has(alert, 'alertMessage') && _.size(alert.alertMessage) > 0 ? alert.alertMessage: '';
                        $img = $('<img/>').attr({
                            'src' : 'assets/vendor-app/images/' + alert.icon,
                            'class': 'privacy-icon privacy-alert',
                            'data-ctool' : '#' + iconId,
                            'style' : 'cursor:help;'
                        }), $tooltip = $('<div/>').attr({
                            'class' : 'ctool privacy-alert',
                            'id': iconId
                        }).html(tooltipText);
                        nameLinkParent.append($img, $tooltip);
                    }
                }, this);
                $(window).trigger('cardmaster:loaded', this.$el);
                /*if( ! wkscommerciale.checkIsEmpty(alerts)) {
                 var alertCnt = alerts.length;
                 var code = alertCnt > 1 ? 'MANYALERTS' : alerts[0].msgCode;
                 if(code) {
                 var iconId = wkscommerciale.generateRandomText(8),
                 msgs = {
                 'MANYALERTS' : '',
                 'NOTRACELET' : 'Necessario recupero modulo privacy',
                 'PRIVACYLV6' : 'Necessario aggiornamento consensi privacy',
                 'RDPRVCY3PF' : 'Consenso privacy ai fini commerciali mancante',
                 'RDPRVCY3PL' : 'Consenso privacy ai fini commerciali mancante',
                 'RDRECUPDPF' : 'Necessario aggiornare i recapiti',
                 'RDRECUPDPL' : 'Necessario aggiornare i recapiti'
                 },
                 icon = code === 'MANYALERTS' ? '' : '<img src="assets/vendor-app/images/' + alerts[0].icon + '" class="privacy-icon privacy-alert" data-ctool="#' + iconId + '" style="cursor:help;" /><div class="ctool privacy-alert" id="' + iconId + '">' + msgs[code] + '</div>',
                 nameLink = this.$('[idsoggetto="' + soggettoId + '"]'),
                 nameLinkParent = nameLink.parent('.client_line');
                 nameLinkParent.find('.privacy-alert').remove();
                 nameLinkParent.append(icon);
                 $(window).trigger('cardmaster:loaded', this.$el);
                 }
                 }*/
            }
        }
    },
    getCommercialeByConto : function() {

        wkscustomer.getCommercialeInfoByConto();
    }
});
wkscustomer.views.JointAccountCustomerExternalLinks = Backbone.View.extend({
    el: $("#externalLinkButtons_Pluri"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        $(this.el).empty();
        var self = this;
        var response = this.options.data;
        if (response.length !== 0) {
            wkscommerciale.log.doPushLog(self.options);
            wkscommerciale.profiles.checkProfile('contactsButton', function(contactsButtonAuthorized) {
                if (contactsButtonAuthorized) {
                    if (response.recapitiAlert === "1") {
                        $(self.el).prepend($("<a do-customer-router title='Visualizza e modifica recapiti e indirizzi' routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='contacts' soggettoid='" + wkscommerciale.idSoggetto.get() + "' data-extra-class='size_small' data-icon='I' class='alert' data-tipoValue='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' data-setCurrentPageTipo style='cursor:pointer'></a>"));
                    }
                    else {
                        $(self.el).prepend($("<a do-customer-router title='Visualizza e modifica recapiti e indirizzi' routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='contacts' soggettoid='" + wkscommerciale.idSoggetto.get() + "' data-extra-class='size_small' data-icon='I' data-tipoValue='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' data-setCurrentPageTipo style='cursor:pointer'></a>"));
                    }
                }
                wkscommerciale.profiles.checkProfile('DocumentazioneInviataButton', function(DocumentazioneInviataButtonAuthorized) {
                    if (DocumentazioneInviataButtonAuthorized) {
                        $(self.el).append($("<a href='#' smName='ArchiviazioneFE' title='Documenti archiviati' smOutParams='' value='soggetto" + SPLITTER_STRING + wkscommerciale.idSoggetto.get() + "' newtab='0' iframe='1' sm-open-h2oadaptor data-icon='G'></a>"));
                    }
                    wkscommerciale.profiles.checkProfile('documentIdentitaButton', function(documentIdentitaButtonAuthorized) {
                        if (documentIdentitaButtonAuthorized && !wkscommerciale.user.data.promotoreBSNew) {//5049
                            var isNumerati = $('#EyeIcon').length > 0;
                            if (response.cartelliniFirmaAlert === "1") {
                                if (wkscommerciale.user.data.abiCode === '36772') {
                                    $(self.el).append($("<a href='#' smName='CartelliniFirma' smOutParams='' title='Cartellino firme'  value='" + self.options.ottoCifre + "'  data-icon='H'  newtab='0' iframe='1' sm-open-h2oadaptor  class='alert'></a>"));
                                } else {
                                    $(self.el).append($("<a href='#' title='Cartellino firme' cartelini_firma ottoCifre='" + self.options.ottoCifre + "' data-icon='H' data-is-numerati='" + isNumerati + "' class='alert'></a>"));
                                }

                            }
                            else {
                                if (wkscommerciale.user.data.abiCode === '36772') {
                                    $(self.el).append($("<a href='#' smName='CartelliniFirma' smOutParams='' title='Cartellino firme'  value='" + self.options.ottoCifre + "'  data-icon='H'  newtab='1' iframe='1' sm-open-h2oadaptor '></a>"));
                                } else {
                                    $(self.el).append($("<a href='#' title='Cartellino firme' cartelini_firma ottoCifre='" + self.options.ottoCifre + "' data-icon='H' data-is-numerati='" + isNumerati + "'></a>"));
                                }

                            }
                        }
                    });
                });
            });
            wkscommerciale.log.doPopLog(self.options);
        }
        wkscommerciale.log.doPopLog(self.options);
    }
});
wkscustomer.views.JointAccountCustomerButtonGroup = Backbone.View.extend({
    el: $("#bigButtonClass_Pluri"),
    initialize: function(options) {
        this.options = options;
        this.isPromotore = false;
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
            this.isPromotore = hasGrant;
            this.render();
        }, this));
    },
    render: function() {
        var self = this;
        $("#bigButtonClass_Pluri").hide();
        //var _template = _.template(wkscommerciale.template.get('customer_page_button_group'));
        //$(this.el).append(_template());
        wkscommerciale.log.doPushLog(self.options);
        wkscommerciale.profiles.checkProfile('contieserviziButton', function(contieserviziButtonAuthorized) {
            var $el = $(self.el);
            if (contieserviziButtonAuthorized && ! self.isPromotore) {
                $el.find('.clear').remove();
                $el.append($("<a class='big_button hand_pointer btnmorew' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='conti-e-servizi' card-size='size_big' data-icon='0' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + " data-tipoValue=" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + " data-setCurrentPageTipo>Conti e servizi</a>"));
                $el.append($("<div class='clear'></div>"));
                wkscommerciale.ajaxRequests.load(window.wkscustomerContext+"/service/customers/showCasellarioPostale", [], {
                    soggettoId: wkscommerciale.idSoggetto.get()
                }, function(result) {
                    wkscommerciale.notifyError.pushError(result.message);
                    if (result.data && result.data.length > 0)
                    {
                        if (result.data[0] === true)
                        {   
                        	$("[route=conti-e-servizi]").append("<span data-ctool='#ctcp01' class='bg-blue'>CP</span>");
                            $("[route=conti-e-servizi]").append("<div class='ctool'  id='ctcp01'>Casellario postale attivo</div>");
                            
                        }
                    }
                });
            }
            wkscommerciale.profiles.checkProfile('consulenzaeinvestimentiButton', function(consulenzaeinvestimentiButtonAuthorized) {
                if (consulenzaeinvestimentiButtonAuthorized) {
                    $el.find('.clear').remove();
                    $el.append($("<a class='big_button two_lines hand_pointer btnmorew' smName='CRCS_MenuLayout' smOutParams='' value='" + wkscommerciale.idSoggetto.get(wkscommerciale.idSoggetto.get()) + "' newtab='1' iframe='1' sm-open-encrypted id='consulenzaEInvestimento' href='#' data-icon='N' data-val='" + wkscommerciale.idSoggetto.get() + "' data-hidden>Consulenza e<br>investimenti</a>"));
                    $el.append($("<div class='clear'></div>"));
                }
                // 5482 - joint one pluri
                wkscommerciale.ajaxRequests.get({
                    url: window.wkscustomerContext+"/service/customers/getSoggettiMIFID?soggettoID="+wkscommerciale.customer.idSoggetto,
                    params: {},
                    contentType: "application/json; charset=utf-8",
                    onSuccess: _.bind(function(response) {
                        if(response.data[0]){
                            $(self.el).find('.clear').remove();
                            $(self.el).addClass('el-6-for-row el-height-3-lines');
                            $(self.el).append($('<a target="_blank" class="big_button two_lines btnmorew" id="investimentiwealth" href="#" data-icon="+" data-hidden >Investimenti<br>previdenza<br>e protezione </a>'));
                            $(self.el).append("<div class='clear'></div>");
                            $("#investimentiwealth").attr('href',response.data[0]);
                        }
                        wkscommerciale.profiles.checkProfile('credtoButton', function (credtoButtonAuthorized) {
                            if (credtoButtonAuthorized && !(self.isPromotore || wkscommerciale.user.data.promotoreBSNew)) {//5049
                                $el.find('.clear').remove();
                                $el.append($("<a class='big_button hand_pointer btnmorew' data-url='3.10.crediti_card.html' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='crediti' card-size='size_big' data-icon='F' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Credito</a>"));
                                $el.append($("<div class='clear'></div>"));
                            }
                            wkscommerciale.profiles.checkProfile('condizioniButton', function (condizioniButtonAuthorized) {
                                if (condizioniButtonAuthorized) {
                                    $el.find('.clear').remove();
                                    $el.append($("<a data-url='3.3.conditions_card.html' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='condizioni' card-size='size_big' class='big_button hand_pointer btnmorew' data-icon='T' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Condizioni</a>"));
                                    $el.append($("<div class='clear'></div>"));
                                }
                            });
                        });

                    }, this),
                    onError: _.bind(function(error) {
                        wkscommerciale.notifyError.pushError(error);
                        wkscommerciale.profiles.checkProfile('credtoButton', function (credtoButtonAuthorized) {
                            if (credtoButtonAuthorized && !(self.isPromotore || wkscommerciale.user.data.promotoreBSNew)) {//5049
                                $el.find('.clear').remove();
                                $el.append($("<a class='big_button hand_pointer btnmorew' data-url='3.10.crediti_card.html' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='crediti' card-size='size_big' data-icon='F' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Credito</a>"));
                                $el.append($("<div class='clear'></div>"));
                            }
                            wkscommerciale.profiles.checkProfile('condizioniButton', function (condizioniButtonAuthorized) {
                                if (condizioniButtonAuthorized) {
                                    $el.find('.clear').remove();
                                    $el.append($("<a data-url='3.3.conditions_card.html' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='condizioni' card-size='size_big' class='big_button hand_pointer btnmorew' data-icon='T' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Condizioni</a>"));
                                    $el.append($("<div class='clear'></div>"));
                                }
                            });
                        });
                    }, this)
                });
            });
            wkscommerciale.log.doPopLog(self.options);
        });
        $(this.el).append($("<div class='clear'></div>"));
        $("#bigButtonClass_Pluri").show();
        wkscommerciale.log.doPopLog(self.options);
    }
});
// A wrapper view responsible to load all the sub views within the section private_customer_1
wkscustomer.views.PrivateCustomerPage = Backbone.View.extend({
    el: $("#private_customer_1"),
    initialize: function(options) {
        this.options = options;
        this.template = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/private_customer'));
        this.isPromotore = false;
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
            this.isPromotore = hasGrant;
            this.render();
        }, this));
    },
    render: function() {
        $(this.el).append(this.template());
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        /*$.get(window.wkscustomerContext+'/service/businesscustomers/privacyDetails?soggettoId='+wkscommerciale.idSoggetto.get()).done(function(privacyAlertBanner){
         var privacyAlert = privacyAlertBanner.data[0]
         if(privacyAlert.tipo == 'Consensi a fini commerciale (Liv 3)' && privacyAlert.valore == 'NO')
         $('#banner_alert').addClass('card__banner--danger').html('Consenso privacy ai fini commerciali mancante')
         });*/

        var level3status = false;
        var level5status = false;

        wkscommerciale.ajaxRequests.get({
            url: window.wkscustomerContext + '/service/customers/hasConsensiPrivacy',
            params: { soggettoId : wkscommerciale.idSoggetto.get() },
            onSuccess: _.bind(function(response) {
                if( ! wkscommerciale.checkIsEmpty(response) && _.has(response, 'status') && response.status === 'success' &&
                    _.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data)) {
                    // PORTAHC-3492
                    if(response.data[0] && (wkscommerciale.tipoSoggettoString.get() === 'Ditta individuale' || wkscommerciale.tipoSoggettoString.get() === 'Semplice')) {
                        $('#banner_alert').addClass('card__banner--danger').text('Consenso privacy ai fini commerciali mancante');
                    }
                    // PORTAHC - 4680 BPA only and 4718 semplice and ditta individuale alone
                    if(wkscommerciale.user.data.abiCode === "03211" && ("Ditta individuale" ===  wkscommerciale.customer.tipoSoggettoString || "Semplice" === wkscommerciale.customer.tipoSoggettoString)){
                        level3status = response.data[0];
                        wkscommerciale.ajaxRequests.get({
                            url: window.wkscustomerContext + '/service/customers/hasConsensiPrivacyLevel5',
                            params: { soggettoId : wkscommerciale.idSoggetto.get() },
                            onSuccess: _.bind(function(response) {
                                if( ! wkscommerciale.checkIsEmpty(response) && _.has(response, 'status') && response.status === 'success' &&
                                    _.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data)) {
                                    level5status = response.data[0];

                                    if(level3status && level5status){
                                        $('#banner_alert').addClass('card__banner--danger').text('Consenso privacy ai fini commerciali e Trattamento Dati Particolari mancanti');
                                    }else if(level3status && !level5status){
                                        $('#banner_alert').addClass('card__banner--danger').text('Consenso privacy ai fini commerciali mancante');
                                    }else if(!level3status && level5status){
                                        $('#banner_alert').addClass('card__banner--danger').text('Consenso privacy Trattamento Dati Particolari mancante');
                                    }
                                }
                            }, this),
                            onError: _.bind(function(response) { }, this)
                        });
                    }
                }
            }, this),
            onError: _.bind(function(response) { }, this)
        });




        var customerInfo = new wkscustomer.collections.CustomerDetails();
        var PrivateCustomerInfo = new wkscustomer.views.PrivateCustomerInfo({
            el: $("#personalInfo"),
            collection: customerInfo,
            logger: this.options.logger,
            isPromotore: this.isPromotore
        });
        if(PrivateCustomerInfo) {
            wkscommerciale.consolle.log('PrivateCustomerInfo variable is used!');
        }
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        new wkscustomer.views.CustomerPageButtonGroup({
            el: $("#bigButtonClass"),
            logger: this.options.logger,
            isPromotore: this.isPromotore
        }).render();
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        var attivitaList = new wkscustomer.collections.AttivitaList();
        var AttivitaListView = new wkscustomer.views.AttivitaListView({
            el: $("#activitiesList"),
            collection: attivitaList,
            logger: this.options.logger
        });
        if(AttivitaListView) {
            wkscommerciale.consolle.log('AttivitaListView variable is used!');
        }
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.PrivateCustomerHeader = wkscommerciale.views.WksMasterView.extend({
    el: $("#fixed_header_dupconst"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var customerInfoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/private_customer_header'));
        var customerInfoHTML = customerInfoTemplate({
            "customerdetails": this.options.customerdetails,
            "customerName": this.options.customerName,
            isLiteCustomer: $('.active').find('div.isLiteCustomerCache[data-id="'+ wkscommerciale.idSoggetto.get() +'"]').text()
        });
        $(this.el).empty();
        $(this.el).append(customerInfoHTML);
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        new wkscustomer.views.PrivateCustomerExternalLinkButtons({
            el: $("#externalLinkButtons"),
            data: this.options.customerdetails.alerts,
            "ottoCifre": this.options.customerdetails.ottoCifre,
            logger: this.options.logger
        }).render();
        var sociaFlag = $('#sociaFlag'), customerName = this.$('.header-customer-name');
        if(this.options.isSocioEnabled){
            customerName.css({'max-width': 'calc(100% - 55px)'});
            sociaFlag.show();
        } else {
            // remove this property if already set
            customerName.css({'max-width': ''});
            sociaFlag.remove();
        }
        updateFixedHeaderOnCustomers($(".active"));
        ($(window).trigger('cardmaster:loaded', $('#fixed_header_dupconst').eq(0)));
    }
});
wkscustomer.views.PrivateCustomerInfo = wkscommerciale.views.WksMasterView.extend({
    el: $("#personalInfo"),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        this.isPromotore = options.isPromotore;
        /*wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
         soggettoId: wkscommerciale.idSoggetto.get()
         });*/
        if( ! _.isUndefined(wkscustomer.personalInfoCollection)) {
            var cb = _.bind(function() { this.render(); }, this);
            $.when( this.collection.reset(wkscustomer.personalInfoCollection) ).then(cb, cb);
        } else {
            wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
                soggettoId: wkscommerciale.idSoggetto.get()
            });
        }
    },
    events : {
        'click .contact-btn' : 'onSMSClick',
        'click .mail' : 'openMailTo',
        'click #perConto' : 'getCommercialeByConto'
    },
    render: function() {
        delete wkscustomer.personalInfoCollection;
        var response = this.collection.toJSON();
        if (response[0].data.length != 0) {
//
            /*wkscommerciale.log.doPushLog({logger: this.options.logger});
             var customerContactInfo = new wkscustomer.collections.CustomerContactInfo();
             var customerContactInfo = new wkscustomer.views.customerContactInfo({
             el: $('#customerContactInfo'),
             collection: customerContactInfo,
             logger: this.options.logger
             });*/
            wkscommerciale.log.doPushLog({logger: this.options.logger});
//			var customerIndicators = new wkscustomer.collections.CustomerIndicators();
            new wkscustomer.views.CustomerInfoIndicatorsView({
                el: $("#customerInfoIndicators"),
                logger: this.options.logger
            }).render();
            _ottoCifre = response[0].data[0].dettagliSoggetto[0].ottoCifre;
            var cusName = null;
            if (typeof response[0].data[0].dettagliSoggetto[0].intestazione === "object") {
                cusName = response[0].data[0].dettagliSoggetto[0].intestazione[0].nome;
            } else if (typeof response[0].data[0].dettagliSoggetto[0].intestazione === "string") {
                cusName = response[0].data[0].dettagliSoggetto[0].intestazione;
            }

            var isSocioEnabled = ! wkscommerciale.checkIsEmpty(response[0].data[0].dettagliSoggetto)
            && _.has(response[0].data[0].dettagliSoggetto[0], 'socioLabelEnabled')
                ? response[0].data[0].dettagliSoggetto[0].socioLabelEnabled : false;
            new wkscustomer.views.PrivateCustomerHeader({
                el: $("#fixed_header_dupconst"),
                "customerdetails": response[0].data[0].dettagliSoggetto[0],
                "customerName": cusName,
                "isSocioEnabled": isSocioEnabled
            }).render();
            var customerInfoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/private_customer_info'));
            var customerInfoHTML = customerInfoTemplate({
                "customerdetails": response[0].data[0].dettagliSoggetto[0],
                "customerName": cusName,
                isPromotore: this.isPromotore
            });
            $(this.el).append(customerInfoHTML);
            wksc.clientName = response[0].data[0].dettagliSoggetto[0].intestazione;
        }
        wkscommerciale.profiles.checkProfile('ENABLE_COMMERCIALE', function(hasGrant) {
            if(! hasGrant ) {
                $('#commerciale_portfolio').hide();
            } else {
                var customerCommercialInfoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/customer_soggesto_commerciale_info'));

                ///need to take wks ma param
                //need to grant
                var showPerConto = false;

                var errorCallBack = function(errOutput) {
                    //console.log(errOutput);
                };

                var successMaParam = function(output){
                    if(_.has(output, 'status') && output.status === 'success' && output.data[0]['ENABLE_COMMERCIALE_BY_IDCONTO']  === 'Y') {
                        showPerConto = true;
                    } else {
                        showPerConto = false;
                    }
                    var customerCommercialInfoHTML = customerCommercialInfoTemplate({
                        "customerdetails": response[0].data[0].dettagliSoggetto[0],
                        "showPerConto" : showPerConto
                    });
                    $("#commerciale_portfolio").append(customerCommercialInfoHTML);
                };


                var onGrantSuccess = function(hasGrantForPerConto){

                    if (hasGrantForPerConto) {
                        wkscommerciale.getWkscParam('ENABLE_COMMERCIALE_BY_IDCONTO', successMaParam, errorCallBack);
                    } else {
                        var customerCommercialInfoHTML = customerCommercialInfoTemplate({
                            "customerdetails": response[0].data[0].dettagliSoggetto[0],
                            "showPerConto" : false
                        });
                        $("#commerciale_portfolio").append(customerCommercialInfoHTML);
                    }
                }

                wkscommerciale.profiles.checkProfile('ENABLE_COMMERCIALE_PERCONTO', onGrantSuccess, errorCallBack);
            }
        });

        // PORTAHC-2345: case private customers begin
        if (wkscommerciale.user.bankId === "1367924") {
            var elemento = $('span[class="external_link"]');
            if (elemento) {
                elemento.prop("onclick", null);
                elemento.replaceWith(function () {
                    return $('<' + this.nodeName + '>').append($(this).contents());
                });
            }
        }
        // PORTAHC-2345: case private customers end
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    openMailTo:function(e){
        e.stopPropagation();
        e.preventDefault();
        var $this = $(e.currentTarget);
        wkscommerciale.doLogClickEvent({
            eventCode:"COCA-MAIL",
            successHandler:function(){
                window.location = $this.attr('href');
            },
            errorHandler:function(){
                window.location = $this.attr('href');
            }
        });
    },
    onSMSClick : function(e){

        var commSuccessCb = _.bind(function(response) {
            var flagValue = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'REDIRECT_NEW_SMS_CARD') ? response.data[0].REDIRECT_NEW_SMS_CARD : '';
            if(_.size(flagValue) > 0 && flagValue === 'Y') {
                wkscommerciale.customer.idSoggetto = $(e.target).attr("params").split(';')[3].split('--')[1]; //5219
                customCardLoader({
                    loadType: 'slidein',
                    cardSize: 'size_big',
                    cardName: contextUrls["wkscustomer"] + '/assets/cards/2.11.sms.html'
                });
            }else{

                window_event = e;
                wkscommerciale.doLogClickEvent({
                    eventCode:"COCA-SMS",
                    successHandler:function(){
                        wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
                    },
                    errorHandler:function(){
                        wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
                    }
                });

            }
        }, this);

        var commErrorCb = _.bind(function(response) {
            wkscommerciale.notifyError.pushFromFetchError(response, []);
            window_event = e;
            wkscommerciale.doLogClickEvent({
                eventCode:"COCA-SMS",
                successHandler:function(){
                    wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
                },
                errorHandler:function(){
                    wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
                }
            });
        }, this);

        wkscommerciale.getWkscParam('REDIRECT_NEW_SMS_CARD', commSuccessCb, commErrorCb)
    },
    getCommercialeByConto : function() {

        wkscustomer.getCommercialeInfoByConto();
    }
});
wkscustomer.views.PrivateCustomerExternalLinkButtons = Backbone.View.extend({
    el: $("#externalLinkButtons"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        $(this.el).empty();
        var response = this.options.data;
        var self = this;
        if (response.length !== 0) { 	

            wkscommerciale.profiles.checkProfile('FirmaElettronica', function(firmaElettronicaAuthorized) {
                if (firmaElettronicaAuthorized) {
                    wkscommerciale.profiles.checkProfile('FirmaElecSubs', function(firmaElecSubsAuthorized) {
                        if (firmaElecSubsAuthorized) {
                            if (response.firmaGrafometricaAlert === "1") {
                                $(self.el).append("<a href='#' class='alert' data-icon='*' smName='GestoreContrattualistica' title='Il cliente non aderisce ad Ecofirma' smOutParams='' value='" + wkscommerciale.idSoggetto.get() + SPLITTER_STRING +"[\"FIRMAELETTRONICA\"]' newtab='0' iframe='1' callbackURL='/wkscustomer/refreshFirmaGrafometrica.html' sm-open-h2oadaptor></a>");
                            }
                            else {
                                $(self.el).append("<a href='#' data-icon='*' smName='GestoreContrattualistica' smOutParams='' title='Il cliente aderisce ad Ecofirma' value='" + wkscommerciale.idSoggetto.get() + SPLITTER_STRING + "[\"FIRMAELETTRONICA\"]' newtab='0' iframe='1' callbackURL='/wkscustomer/refreshFirmaGrafometrica.html' sm-open-h2oadaptor></a>");
                            }
                        }
                    });
                }
                wkscommerciale.profiles.checkProfile('contractsButton', function(contractsButtonAuthorized) {
                    if (contractsButtonAuthorized  && !wkscommerciale.user.data.promotoreBSNew) {//5049
                        var isNumerati = $('#EyeIcon').length > 0;
                        if (response.cartelliniFirmaAlert === "1") {
                            if (wkscommerciale.user.data.abiCode === '36772') {
                                $(self.el).append($("<a href='#' smName='CartelliniFirma' smOutParams='' title='Cartellino firme'  value='" + self.options.ottoCifre + "'  data-icon='H'  newtab='0' iframe='1' sm-open-h2oadaptor data-is-numerati='" + isNumerati + "' class='alert'></a>"));
                            } else {
                                $(self.el).append($("<a href='#' title='Cartellino firme' cartelini_firma ottoCifre='" + self.options.ottoCifre + "' data-icon='H' data-is-numerati='" + isNumerati + "' class='alert'></a>"));
                            }

                        }
                        else {
                            if (wkscommerciale.user.data.abiCode === '36772') {
                                $(self.el).append($("<a href='#' smName='CartelliniFirma' smOutParams='' title='Cartellino firme'  value='" + self.options.ottoCifre + "'  data-icon='H'  newtab='1' iframe='1' sm-open-h2oadaptor data-is-numerati='" + isNumerati + "'></a>"));
                            } else {
                                $(self.el).append($("<a href='#' title='Cartellino firme' cartelini_firma ottoCifre='" + self.options.ottoCifre + "' data-icon='H' data-is-numerati='" + isNumerati + "'></a>"));
                            }

                        }
                    }
                    wkscommerciale.profiles.checkProfile('documentIdentitaButton', function(documentIdentitaButtonAuthorized) {
                        if (documentIdentitaButtonAuthorized) {
                            if (response.documentoIdAlert === "1") {
                                $(self.el).append($("<a href='#' document_identita smName='VisualizzaImageStorageSystems' smOutParams='' newtab='1' iframe='0' title=\"Documento d'identit&agrave;\" data-icon='b' class='alert' soggettoId='" + wkscommerciale.idSoggetto.get() + "'></a>"));
                            }
                            else {
                                $(self.el).append($("<a href='#' document_identita smName='VisualizzaImageStorageSystems' smOutParams='' newtab='1' iframe='0' title=\"Documento d'identit&agrave;\" data-icon='b' soggettoId='" + wkscommerciale.idSoggetto.get() + "'><br />"));
                            }
                        }
                    });
                });
            });
            wkscommerciale.profiles.checkProfile('DocumentazioneInviataButton', function(DocumentazioneInviataButtonAuthorized) {
                if (DocumentazioneInviataButtonAuthorized) {
                	//PORTAHC-6283
                	$(self.el).prepend($("<a href='#' smName='ArchiviazioneFE' title='Documenti archiviati' smOutParams='' value='soggetto" + SPLITTER_STRING + wkscommerciale.idSoggetto.get() + "' newtab='0' iframe='1' sm-open-h2oadaptor data-icon='G'></a>"));
                }
            });
        }
        else {
        }
        wkscommerciale.log.doPopLog(this.options);
    }
});
/*wkscustomer.views.customerContactInfo = wkscommerciale.views.WksMasterView.extend({
 el: $('#customerContactInfo'),
 initialize: function(options) {
 this.options = options;
 this.contactInfoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/customer_contact_info'));
 this.$el.wkscspinner({css: 'large'});
 wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {});
 },
 events : {
 'click #use_map_channels_btn': 'openUseMapChannelsCard'
 },
 render: function() {
 var contactInfo = this.collection.toJSON()[0].data;
 if( ! wkscommerciale.checkIsEmpty(contactInfo)) {
 this.$el.html(this.contactInfoTemplate({
 data : contactInfo[0]
 }));
 }
 this.$el.wkscspinner('remove');
 wkscommerciale.log.doPopLog(this.options);
 },
 openUseMapChannelsCard : function(e) {
 e.stopPropagation();
 customCardLoader({
 loadType: 'slidein',
 cardSize: 'size_big',
 cardName: window.wkscustomerContext + '/assets/cards/15.5.scheda_cliente_i_mappa_canali.html'
 });
 }
 });*/
wkscustomer.views.CustomerInfoIndicatorsView = wkscommerciale.views.WksMasterView.extend({
    initialize : function(options) {
        this.options = options;
    },
    render : function() {
//			PORTAHC-3509 - Hidden contact info section
//			var customerContactInfo = new wkscustomer.collections.CustomerContactInfo();
//			wkscommerciale.log.doPushLog({logger: this.options.logger});
//			var CustomerContactInfo = new wkscustomer.views.CustomerContactInfo({
//				el : $('#customerContactInfo'),
//				collection : customerContactInfo,
//				logger : this.options.logger
//			});
//			if(CustomerContactInfo) {
//				wkscommerciale.consolle.log('CustomerContactInfo variable is used!');
//			}
        if(wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) == "Azienda") {
            var bcIndicator = new wkscustomer.collections.BCIndicatorsModel();
            wkscommerciale.log.doPushLog(this.options);
            var BCIndicatorsSectionView = new wkscustomer.views.BCIndicatorsSectionView({
                el: $("#customerIndicators"),
                collection: bcIndicator,
                logger: this.options.logger
            });
            if(BCIndicatorsSectionView) {
                wkscommerciale.consolle.log('BCIndicatorsSectionView variable is used!');
            }
        } else {
            var customerIndicators = new wkscustomer.collections.CustomerIndicators();
            wkscommerciale.log.doPushLog({logger: this.options.logger});
            var CustomerPageIndicators = new wkscustomer.views.CustomerPageIndicators({
                el: $("#customerIndicators"),
                collection: customerIndicators,
                logger: this.options.logger
            });
            if(CustomerPageIndicators) {
                wkscommerciale.consolle.log('CustomerPageIndicators variable is used!');
            }
        }
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.CustomerContactInfo = wkscommerciale.views.WksMasterView.extend({
    initialize : function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            idSoggetto: wkscommerciale.idSoggetto.get()
        });
    },
    render : function() {
        $(this.el).wkscspinner('remove');
        var response = this.collection.toJSON();
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/customer_contact_info'));
        $(this.el).append(_template({
            "contactInfo": response[0].data[0],
            "tipoSoggetto" : wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get())
        }));
        wkscommerciale.log.doPopLog(this.options);
    }
});

wkscustomer.views.CustomerPageIndicators = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            idSoggetto: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        $(this.el).wkscspinner('remove');
        var response = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(response[0].message);
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/customer_indicators'));
        if (response[0].data.length != 0) {
            $(this.el).append(_template({
                "indicators": response[0].data[0],
                "showDefault": false,
                "isShowBpaMargine": showBpaMargine,
                "showUtilizzoApp" : showUtilizzoApp,
                "linkMarginalita" : response[0].data[1].linkMarginalita,
                "profclinewLink" : profclinewLink
            }));
        }
        else
        {
            $(this.el).append(_template({
                "indicators": response[0].data,
                "showDefault": true,
                "isShowBpaMargine": showBpaMargine,
                "showUtilizzoApp" : showUtilizzoApp,
                "profclinewLink" : profclinewLink
            }));
        }
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        //4930 4931
        //PARAM call for volumi and cross selling to get the list of abicodes .. if loggedin user abicode matches we wont restrict or else we will restrict
        //removing the attributes of smopening and handpointer extra to disable the click property.
        var crossSellingSuccessCb = _.bind(function(response) {
            var abicodes = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'CROSS_SELLING') ? response.data[0].CROSS_SELLING : '';
            if(_.size(abicodes) > 0 ) {
                var arr = abicodes.split(';');
                if(!_.contains(arr,wkscommerciale.user.abiCode)){
                    $('.grid--height').find('#crossSelling').removeAttr('smRef').removeAttr('sm-open-newtab-withpost').removeClass('hand_pointer');
                }
            }
        }, this);

        var volumiSuccessCb = _.bind(function(response) {
            var abicodes = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'VOLUMI_LINK') ? response.data[0].VOLUMI_LINK : '';
            if(_.size(abicodes) > 0 ) {
                var arr = abicodes.split(';');
                if(!_.contains(arr,wkscommerciale.user.abiCode)){
                    $('.grid--height').find('#volumi').removeAttr('smRef').removeAttr('sm-open-newtab').removeClass('hand_pointer');
                }
            }
        }, this);

        var margineSuccessCb = _.bind(function(response) {
            var abicodes = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'MARGINE_LINK') ? response.data[0].MARGINE_LINK : '';
            if(_.size(abicodes) > 0 ) {
                var arr = abicodes.split(';');
                if(!_.contains(arr,wkscommerciale.user.abiCode)){
                    $('.grid--height').find('#margineSection').removeAttr('smRef').removeAttr('sm-open-newtab').removeClass('hand_pointer');
                }
            }
        }, this);

        var ErrorCb = _.bind(function(response) {
            wkscommerciale.notifyError.pushFromFetchError(response);
        }, this);

        wkscommerciale.ajaxRequests.get({
            url: 'service/params/wkscParameterValues',
            params: {
                paramIds: 'CROSS_SELLING'
            },
            contentType: 'application/json; charset=utf-8',
            onSuccess: crossSellingSuccessCb,
            onError: ErrorCb
        });


        wkscommerciale.ajaxRequests.get({
            url: 'service/params/wkscParameterValues',
            params: {
                paramIds: 'VOLUMI_LINK'
            },
            contentType: 'application/json; charset=utf-8',
            onSuccess: volumiSuccessCb,
            onError: ErrorCb
        });

        wkscommerciale.ajaxRequests.get({
            url: 'service/params/wkscParameterValues',
            params: {
                paramIds: 'MARGINE_LINK'
            },
            contentType: 'application/json; charset=utf-8',
            onSuccess: margineSuccessCb,
            onError: ErrorCb
        });
        if(showUtilizzoApp && wkscommerciale.customer.tipoSoggetto === 'Semplice') {
            var appUseModel = new wkscustomer.collections.UtilizzoApp();
            var appUseView = new wkscustomer.views.AppUseView({
                el: $("#utilizzoApp"),
                collection: appUseModel,
                "showDefault" : response[0].data && response[0].data.length != 0
                //logger: this.options.logger
            });
        }
        var scroing = new wkscustomer.collections.ScoringList();
        var ScoringIndicatorView = new wkscustomer.views.ScoringIndicatorView({
            el: $("#scoringIndicator"),
            collection: scroing,
            logger: this.options.logger
        });
        if(ScoringIndicatorView) {
            wkscommerciale.consolle.log('ScoringIndicatorView variable is used!');
        }
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        var cadr = new wkscustomer.collections.CADRList();
        var CADRIndicatorView = new wkscustomer.views.CADRIndicatorView({
            el: $("#cadrIndicators"),
            collection: cadr,
            logger: this.options.logger
        });
        if(CADRIndicatorView) {
            wkscommerciale.consolle.log('CADRIndicatorView variable is used!');
        }
        //5004
        if(!wkscUrls.GrantedSM["irs"]){
            $('.grid--height').find('#scoringIndicator').removeAttr('sm-open-h2oadaptor').removeClass('hand_pointer');
        }
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.AppUseView = Backbone.View.extend({
    el: $("#utilizzoApp"),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var response = this.collection.toJSON();
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/UtilizzoApp'));
        if (response[0].data.length != 0) {
            $(this.el).html(_template({
                "appUse": this.options.showDefault ?  response[0].data[0].Indicator : "default",
                "appUseDate" : response[0].data[0].AppDataRif
            }));
        }
        $(this.el).wkscspinner('remove');
        // wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.ScoringIndicatorView = Backbone.View.extend({
    el: $("#scoringIndicator"),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var response = this.collection.toJSON();
        /*if (!response[0].data[0].signalIndicators && !response[0].data[0].signalIndicators.value == "n.d") {
         wkscApp.pushError(response[0].message);
         }*/
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/scoring'));
        if (response[0].data.length !== 0) {
            if (response[0].data[0].scoring.length !== 0) {
                if ($(this.el).hasClass('text_indicator')) {
                    $(this.el).removeClass('text_indicator').addClass('visual_indicator');
                }
                $(this.el).html(_template({
                    "scoring": response[0].data[0].scoring[0],
                    "showDefault": false,
                    "renderType": 'scoring'
                }));
            }
            else if (response[0].data[0].rating.length !== 0){
                if ($(this.el).hasClass('visual_indicator')) {
                    $(this.el).removeClass('visual_indicator').addClass('text_indicator');
                }
                $(this.el).html(_template({
                    "rating": response[0].data[0].rating[0],
                    "showDefault": false,
                    "renderType": 'rating'
                }));
            }
            else{
                $(this.el).html(_template({
                    "scoring": response[0].data[0],
                    "showDefault": true
                }));
            }
        }
        else {
            $(this.el).html(_template({
                "scoring": response[0].data[0],
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.CADRIndicatorView = Backbone.View.extend({
    el: $("#cadrIndicators"),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var response = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(response[0].message);
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/CADRIndicator'));
        if (response[0].data.length != 0) {
            $(this.el).html(_template({
                "CADR": response[0].data[0].signalIndicators[0]
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.CustomerPageButtonGroup = Backbone.View.extend({
    el: $("#bigButtonClass"),
    initialize: function(options) {
        this.options = options;
        this.isPromotore = options.isPromotore;
    },
    render: function() {
        var self = this;
        $("#bigButtonClass").hide();
        //var _template = _.template(wkscommerciale.template.get('customer_page_button_group'));
        //$(this.el).append(_template());
        var privateCustomerButtonClass = wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get())=='Semplice' ? 'btnmorew' : "";
        wkscommerciale.profiles.checkProfile('personaliButton', function(personaliButtonAuthorized) {
            if (personaliButtonAuthorized && ! self.isPromotore) {
                $(self.el).find('.clear').remove();
                $(self.el).prepend($("<a class='big_button hand_pointer "+privateCustomerButtonClass+"' id='personaliButton' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='personali' data-icon='P' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + " data-tipoValue=" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + " data-setCurrentPageTipo>Personali</a>"));
                $(self.el).append("<div class='clear'></div>")
                wkscommerciale.ajaxRequests.load(window.wkscustomerContext+"/service/customers/checkPersonaliButton", [], {
                    soggettoId: wkscommerciale.idSoggetto.get()
                }, function(result) {
                    wkscommerciale.notifyError.pushError(result.message);
                    if (result.data && result.data.length > 0)
                    {
                        if (result.data[0] === "true")
                        {
                            $("#personaliButton").append("<span>!</span>");
                        }
                    }
                });
            }
            wkscommerciale.profiles.checkProfile('contieserviziButton', function(contieserviziButtonAuthorized) {
                if (contieserviziButtonAuthorized && ! self.isPromotore) {
                    $(self.el).find('.clear').remove();
                    $(self.el).append($("<a id='contieserviziButton' class='big_button hand_pointer "+privateCustomerButtonClass+"' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='conti-e-servizi' card-size='size_big' data-icon='0' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + " data-tipoValue=" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + " data-setCurrentPageTipo>Conti e servizi</a>"));
                    $(self.el).append("<div class='clear'></div>")
                    wkscommerciale.ajaxRequests.load(window.wkscustomerContext+"/service/customers/searchSignableDocument", [], {
                        identifier: wkscommerciale.idSoggetto.get()
                    }, function(result) {
                        wkscommerciale.notifyError.pushError(result.message);
                        if (result.data && result.data.length > 0)
                        {
                            if (result.data[0] === "1")
                            {
                                $("#contieserviziButton").append("<span>!</span>");
                            }
                        }
                    });
                    wkscommerciale.ajaxRequests.load(window.wkscustomerContext+"/service/customers/showCasellarioPostale", [], {
                        soggettoId: wkscommerciale.idSoggetto.get()
                    }, function(result) {
                        wkscommerciale.notifyError.pushError(result.message);
                        if (result.data && result.data.length > 0)
                        {
                            if (result.data[0] === true)
                            {
                                $("#contieserviziButton").append("<span data-ctool='#ctcp01' class='bg-blue'>CP</span>");
                                $("#contieserviziButton").append("<div class='ctool'  id='ctcp01'>Casellario postale attivo</div>");
                                
                            }
                        }
                    });
                }
                wkscommerciale.profiles.checkProfile('consulenzaeinvestimentiButton', function(consulenzaeinvestimentiButtonAuthorized) {
                    if (consulenzaeinvestimentiButtonAuthorized) {
                        $(self.el).find('.clear').remove();//4992
                        $(self.el).append($("<a id='consulenzaeinvestimentiButton' class='big_button two_lines hand_pointer "+privateCustomerButtonClass+"' smName='CRCS_MenuLayout' smOutParams='' value='" + wkscommerciale.idSoggetto.get() + "' newtab='1' iframe='1' sm-open-encrypted id='consulenzaEInvestimento' href='#' data-icon='N' data-val='" + wkscommerciale.idSoggetto.get() + "' data-hidden>Consulenza e<br>investimenti</a>"));
                        $(self.el).append("<div class='clear'></div>")
                    }
                    //5482
                    wkscommerciale.ajaxRequests.get({
                        url: window.wkscustomerContext+"/service/customers/getSoggettiMIFID?soggettoID="+wkscommerciale.customer.idSoggetto,
                        params: {},
                        contentType: "application/json; charset=utf-8",
                        onSuccess: _.bind(function(response) {
                            if(response.data[0]){
                                $(self.el).find('.clear').remove();
                                $(self.el).addClass('el-6-for-row el-height-3-lines');
                                $(self.el).append($('<a target="_blank" class="big_button two_lines btnmorew" id="investimentiwealth" href="#" data-icon="+" data-hidden >Investimenti<br>previdenza<br>e protezione </a>'));
                                $(self.el).append("<div class='clear'></div>");
                                $("#investimentiwealth").attr('href',response.data[0]);
                            }
                            wkscommerciale.profiles.checkProfile('credtoButton', function (credtoButtonAuthorized) {
                                if (credtoButtonAuthorized && !(self.isPromotore || wkscommerciale.user.data.promotoreBSNew)) {//5049
                                    $(self.el).find('.clear').remove();
                                    $(self.el).append($("<a id='credtoButton' class='big_button hand_pointer " + privateCustomerButtonClass + "' data-url='3.10.crediti_card.html' card-size='size_big' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='crediti' data-icon='F' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Credito</a>"));
                                    $(self.el).append("<div class='clear'></div>")
                                }
                                wkscommerciale.profiles.checkProfile('condizioniButton', function (condizioniButtonAuthorized) {
                                    if (condizioniButtonAuthorized) {
                                        $(self.el).find('.clear').remove();
                                        $(self.el).append($("<a do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='condizioni' card-size='size_big' class='big_button hand_pointer " + privateCustomerButtonClass + "' data-icon='T' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Condizioni</a>"));
                                        $(self.el).append("<div class='clear'></div>")
                                    }
                                });
                            });

                        }, this),
                        onError: _.bind(function(error) {
                            wkscommerciale.notifyError.pushError(error);
                            wkscommerciale.profiles.checkProfile('credtoButton', function (credtoButtonAuthorized) {
                                if (credtoButtonAuthorized && !(self.isPromotore || wkscommerciale.user.data.promotoreBSNew)) {//5049
                                    $(self.el).find('.clear').remove();
                                    $(self.el).append($("<a id='credtoButton' class='big_button hand_pointer " + privateCustomerButtonClass + "' data-url='3.10.crediti_card.html' card-size='size_big' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='crediti' data-icon='F' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Credito</a>"));
                                    $(self.el).append("<div class='clear'></div>")
                                }
                                wkscommerciale.profiles.checkProfile('condizioniButton', function (condizioniButtonAuthorized) {
                                    if (condizioniButtonAuthorized) {
                                        $(self.el).find('.clear').remove();
                                        $(self.el).append($("<a do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='condizioni' card-size='size_big' class='big_button hand_pointer " + privateCustomerButtonClass + "' data-icon='T' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Condizioni</a>"));
                                        $(self.el).append("<div class='clear'></div>")
                                    }
                                });
                            });
                        }, this)
                    });
                    /*wkscommerciale.profiles.checkProfile('ENABLE_WEALTH_ADVISORY_NEW_LINK', function(wealthAdvisoryAuthorized) {
                     if (wealthAdvisoryAuthorized) {
                     $(self.el).find('.clear').remove();
                     $(self.el).append($('<a class="big_button two_lines btnmorew" href="#" data-icon="+" data-hidden >Investimenti<br>previdenza<br>e protezione </a>'));
                     $(self.el).append("<div class='clear'></div>")
                     }

                     wkscommerciale.profiles.checkProfile('credtoButton', function (credtoButtonAuthorized) {
                     if (credtoButtonAuthorized && !(self.isPromotore || wkscommerciale.user.data.promotoreBSNew)) {//5049
                     $(self.el).find('.clear').remove();
                     $(self.el).append($("<a id='credtoButton' class='big_button hand_pointer " + privateCustomerButtonClass + "' data-url='3.10.crediti_card.html' card-size='size_big' do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='crediti' data-icon='F' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Credito</a>"));
                     $(self.el).append("<div class='clear'></div>")
                     }
                     wkscommerciale.profiles.checkProfile('condizioniButton', function (condizioniButtonAuthorized) {
                     if (condizioniButtonAuthorized) {
                     $(self.el).find('.clear').remove();
                     $(self.el).append($("<a do-customer-router routeTipoSoggetto='" + wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get()) + "' routeSoggettoid='" + wkscommerciale.idSoggetto.get() + "' route='condizioni' card-size='size_big' class='big_button hand_pointer " + privateCustomerButtonClass + "' data-icon='T' data-hidden data-sogg-id=" + wkscommerciale.idSoggetto.get() + ">Condizioni</a>"));
                     $(self.el).append("<div class='clear'></div>")
                     }
                     });
                     });
                     });*/
                });
            });
        });
        //$(this.el).append($("<div class='clear'></div>"));
        $("#bigButtonClass").show();
        wkscommerciale.log.doPopLog(this.options);
    }
});
/*
 <wkscapp.SaldiEComposizioneView> is responsible for the saldi e composizione (pie chart) list on the customer home page.
 */
wkscustomer.views.SaldiEComposizioneView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        this.isSaldiVisible = options.isSaldiVisible;
        this.soggettoId = options.soggettoId;
        this.isPromotore = false;
        // this.soggettoId = wkscommerciale.idSoggetto.get();
        this.collection.on('reset', this.render, this);
        this.isVisualizzaBtnClicked = false;
        // PORTAHC-2866
        var initialParams = 'VisualizzaSaldi=##idsoggetto=' + this.soggettoId;
        this.btnlog = new wkscommerciale.log.wkscLogger('3.1.private_customer_card.html/saldi_e_composizione.html', 'WKSC-PATR', initialParams);
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
            this.isPromotore = hasGrant;
        }, this));
        var headerTemplate = '<header>';
        headerTemplate += 'Saldi e composizione patrimoniale';
        headerTemplate += '<a id="show-saldi-details" class="toggle-arrow-button saldiEComposizione" data-toggle-arrow="show" data-toggle-arrow-target="ta1" data-symbol="&#x25BC;" style="display:none;">Visualizza</a>';
        headerTemplate += '</header>';
        this.$('#saldiHeader').html(headerTemplate);
        if( ! this.isSaldiVisible) {
            this.$('#show-saldi-details').show();
        } else {
            this.$('#show-saldi-details').remove();
            this.fetchSaldiData();
        }
        /*wkscommerciale.ajaxRequests.get({
         url: wkscustomerContext + '/service/customers/saldiVisible',
         params: { soggettoId: this.soggettoId },
         onSuccess: _.bind(function(response) {
         wkscommerciale.notifyError.pushError(response.message);
         if(_.size(response.data) > 0) {
         if( ! response.data[0] === true) {
         this.$('#show-saldi-details').show();
         } else {
         this.$('#show-saldi-details').remove();
         this.fetchSaldiData();
         }
         }
         }, this),
         onError: _.bind(function(response) {
         wkscommerciale.notifyError.pushError(response.message);
         }, this)
         });*/
        /*wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
         soggettoId: wkscommerciale.idSoggetto.get()
         });*/ // triggers the initialize function from the MasterView.
    },
    events : {
        'click #show-saldi-details' : 'logClickEvent'
    },
    render: function() {
        var saldi = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(saldi[0].message);
        if (saldi[0].data.length != 0) {
            var saldiETemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/saldi_e_composizione")); // Fetching the template
            /*
             *  NOTE:	Since we are getting the actual values (75.000) for plotting the chart, we need to
             *			bascially re construct the actual JSON to the format required to bind the chart.
             */
            var total = saldi[0].data[0].saldi[0].saldoComplessivo.toString().replace(/\./g, ""); // Gets the total (count of all values) from the JSON received.
            var _total = total.toString().replace(",", ".");
            var liquiditaeRisparmio = saldi[0].data[0].saldi[0].saldoTotali[0].liquiditaeRisparmio.toString().replace(/\./g, ""); //liquiditaeRisparmio hold the actual value
            var _liquiditaeRisparmio = liquiditaeRisparmio.toString().replace(",", ".");
            var investimenti = saldi[0].data[0].saldi[0].saldoTotali[0].investimenti.toString().replace(/\./g, ""); // investimenti has the actual value
            var _investimenti = investimenti.toString().replace(",", ".");
            var previdenza = saldi[0].data[0].saldi[0].saldoTotali[0].previdenza.toString().replace(/\./g, ""); // previdenza holds the actual value
            var _previdenza = previdenza.toString().replace(",", ".");
            var ottocifreListStr = saldi[0].data[0].saldi[0].ottocifre !== null ? saldi[0].data[0].saldi[0].ottocifre.trim().replace(" ", ";") : "";
            var numerati = saldi[0].data[0].saldi[0].saldoTotali[0].numerati;
            $('a[cartelini_firma]').attr('data-is-numerati', ( ! wkscommerciale.checkIsEmpty(numerati) && numerati === 'X'));
            // Re-constructing the JSON for the chart.
            var chartData = {
                i26BValue: saldi[0].data[0].saldi[0].ottocifre != null ? saldi[0].data[0].saldi[0].ottocifre.trim().replace(" ", ";") + SPLITTER_STRING + saldi[0].data[0].saldi[0].customerName.trim() + SPLITTER_STRING + wkscommerciale.idSoggetto.get() : "",
                i26EsposizioneClienteValue: ottocifreListStr.indexOf(';') !== -1 ? ottocifreListStr.substr(0, ottocifreListStr.indexOf(';')) : ottocifreListStr,
                mutuieprestiti: saldi[0].data[0].saldi[0].mutuieprestiti,
                contiinterni: saldi[0].data[0].saldi[0].contiinterni,
                contiinterniG3: saldi[0].data[0].saldi[0].contiinterniG3,
                contiinterniG3Count: saldi[0].data[0].saldi[0].contiinterniG3Count,
                polizze: saldi[0].data[0].saldi[0].polizze,
                isRenderChart: (parseFloat(_liquiditaeRisparmio) >= 0 && parseFloat(_investimenti) >= 0 && parseFloat(_previdenza) >= 0),
                saldoComplessivo: saldi[0].data[0].saldi[0].saldoComplessivo2, // Setting the saldo total
                numerati: numerati,
                fidoDiContocorrente: saldi[0].data[0].saldi[0].fidoDiContocorrente, // Setting the saldo total
                isT0Enabled : saldi[0].data[0].saldi[0].isT0Enabled,
                partitePrenotate : saldi[0].data[0].saldi[0].saldoTotali[0].partitePrenotate,
                saldoTotali: [{
                    label: "Liquidit&agrave; e risparmio", // Setting legend label
                    value: saldi[0].data[0].saldi[0].saldoTotali[0].liquiditaeRisparmio2, // Setting the legend value
                    count:saldi[0].data[0].saldi[0].saldoTotali[0].liquiditaeRisparmio2Count,
                    tocheck: true,
                    href: "liquiditaerisparmio",
                    extraClass: "size_big",
                    scrollTo: "#",
                    percent: Math.round(parseFloat(_liquiditaeRisparmio) / parseFloat(_total) * 100) // Setting the percentage value based on calculation
                },
                    {
                        label: "Investimenti",
                        value: saldi[0].data[0].saldi[0].saldoTotali[0].investimenti,
                        count: saldi[0].data[0].saldi[0].saldoTotali[0].investimentiCount,
                        tocheck: true,
                        href: "investimenti",
                        extraClass: "size_big",
                        scrollTo: "#",
                        percent: Math.round(parseFloat(_investimenti) / parseFloat(_total) * 100)
                    },
                    {
                        label: "Previdenza",
                        value: saldi[0].data[0].saldi[0].saldoTotali[0].previdenza,
                        count: saldi[0].data[0].saldi[0].saldoTotali[0].previdenzaCount,
                        tocheck: true,
                        href: "previdenza",
                        extraClass: "size_small",
                        scrollTo: "#",
                        percent: Math.round(parseFloat(_previdenza) / parseFloat(_total) * 100)
                    },
                ],
                isVisualizzaSaldiSectionHidden: ! saldi[0].data[0].saldi[0].isSaldiVisible,
                isPromotore: this.isPromotore
            };
            wkscommerciale.profiles.checkProfile('consulenzaeinvestimentiButton', function(hasGrant) {
                if (!hasGrant)
                {
                    document.getElementById("polizze").disabled = true;
                }
            });
            var saldiEHTML = saldiETemplate({
                "saldi": chartData, // Setting the template with the re-constructed data
                soggettoId: this.soggettoId
            });
            this.$el.html(saldiEHTML);
            if (!saldi[0].data[0].saldi[0].ottocifre)
            {
                this.$('#btnI26IBSaldi, #btnI26IBSaldiNew').css('display', 'none');
            }
            var _smname = "CRCS_MenuLayout";
            //openMenuLayoutWithEncryptedParam(wkscommerciale.idSoggetto.get(), _smname, "#polizze");
            /*$("#polizze").click(function(e) {
             var _smname = "CRCS_PortafoglioPerConti";
             var _outparam = "";
             var _value = '{"abi5Digit":"' + wkscApp.getAbiCode() + '","clientName":"","tipoSoggetto":"","soggettoId":"' + $(e.target).attr('data-val') + '"}';
             doOnSmRedirect(_smname, _outparam, _value);
             });*/
        }
        $(this.el).wkscspinner('remove');
        if(this.isVisualizzaBtnClicked) {
            wkscommerciale.log.doPopLog({logger: this.btnlog});
        }
        $(window).trigger('scrollbar:resize', 'relative');
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    logClickEvent: function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isVisualizzaBtnClicked = true;
        wkscommerciale.log.doPushLog({logger: this.btnlog});
        this.fetchSaldiData();
    },
    fetchSaldiData : function() {
        // PORTAHC-3738/PORTAHC-3741 - fetch Salidi data only after clicking Visualizza button
        if( ! this.isVisualizzaBtnClicked) {
            wkscommerciale.log.doPushLog({logger: this.options.logger});
        }
        this.$('#saldiChart').wkscspinner({css: 'large'});
        this.collection.fetch({
            data: {soggettoId : this.soggettoId},
            success: _.bind(function(model, response) {
                var isHypeEnv = false;
                if(response.message && ! _.isUndefined(response.message[0]) && response.message[0].indexOf('Hype is not allowed')>=0){
                    isHypeEnv = true;
                }
                if(!isHypeEnv) {
                    wkscommerciale.notifyError.pushErrorFromResponse(response);
                }
                if ( ! response.authorize) {

                    this.$el.hide();

                }
                if( ! this.isVisualizzaBtnClicked) {
                    wkscommerciale.log.doPopLog({logger: this.options.logger});
                }
                //$(window).trigger('cardmaster:loaded', this.$el);
                $(window).trigger('scrollbar:resize', 'relative');
                if(this.isVisualizzaBtnClicked) {
                    this.isVisualizzaBtnClicked = false;
                }
            }, this),
            error: _.bind(function(model, xhr) {
                this.$('#saldiChart').wkscspinner('remove');
                wkscommerciale.notifyError.pushFromFetchError(xhr);
                if( ! this.isVisualizzaBtnClicked) {
                    wkscommerciale.log.doPopLog({logger: this.options.logger});
                }
                if(this.isVisualizzaBtnClicked) {
                    this.isVisualizzaBtnClicked = false;
                }
            }, this),
            reset: true
        });
    }
});
/*
 <wkscapp.CollegamentiView> is responsible for the Collegamenti on the customer home page.
 */
wkscustomer.views.CollegamentiView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        this.el = options.el;
        $(this.el).wkscspinner({ css: 'large' });
        // this.soggettoId = wkscommerciale.idSoggetto.get();
        this.soggettoId = options.soggettoId;
        this.isSaldiVisible = options.isSaldiVisible;
        this.isVisualizzaBtnShown = ! this.isSaldiVisible;
        this.currentPage = options.currentPage;
        this.recordsPerPage = options.recordsPerPage;
        this.collection.on('reset', this.render, this);
        this.collection.fetch(wkscommerciale.utils.fetchCallback({
            soggettoId: this.soggettoId,
            contoId: '',
            isSaldoRequired: this.isSaldiVisible
        }));
    },
    events:{
        'click a#btnVisualizzaTuttiSaldi':'onBtnClickVisualizzaTuttiSaldi',
        'click #show-saldi-details': 'logClickEvent',
        'click .goTo' : 'goTo',
        'click .prev_cust' : 'prev',
        'click .next_cust' : 'next',
        'click .prevTab' : 'prevTab',
        'click .nextTab' : 'nextTab',
        'click .first' : 'first',//5009
        'click .last' : 'last'//5009
    },
    render: function() {
        // Initialize pagination related params
        this.pagingTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/paging'));
        this.currentTab = 1;
        this.pageTab = new wksc.PageTab(1);
        this.maxPagesShowing = 5;// maxPagesShowing must be valued as integer >= 3
        this.totalRecords = 0;
        this.collegamentiData = [];
        var collegamenti = this.collection.toJSON();
        this.hasVisualizzaSaldiEnabled = true;
        var collegamentiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/collegamenti"));
        if (_.size(collegamenti[0].data) > 0) {
            this.hasVisualizzaSaldiEnabled = collegamenti[0].data[0].isVisualizzaSaldiEnabled;
            if (_.size(collegamenti[0].data[0].collegamenti) > 0) {
                this.collegamentiData = collegamenti[0].data[0].collegamenti
                this.totalRecords = _.size(this.collegamentiData);
            }
        }
        this.$el.html(collegamentiTemplate());
        this.$('#collegamenti-table').wkscspinner({css: 'large', position: true});
        var sIndex = (this.currentTab - 1) * this.recordsPerPage;
        var eIndex = _.min([this.currentTab * this.recordsPerPage, this.totalRecords]);
        this.sectionRender(this.collegamentiData.slice(sIndex, eIndex));
        this.pagingRender();

        wkscommerciale.log.doPopLog(this.options);
    },
    sectionRender: function(data) {
        /*if(_.size(data) > 0 && this.isVisualizzaBtnShown) {
         this.$('#show-saldi-details').show();
         }*/
        var collegamentiRows = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/collegamenti_rows'));
        this.$('#collegamenti-table').html(collegamentiRows({collegamenti: data, isSaldiHidden: this.isVisualizzaBtnShown}));
        wkscommerciale.profiles.checkProfile('ENABLE_COMMERCIALE', function(hasGrant) {
            if(!hasGrant ) {
                $('.commerc_show').hide();
            }
        });

        this.$('#show-saldi-details').toggle(_.size(data) > 0 && this.$('tr[data-need-to-fetch-saldo]').length > 0);
        this.$el.wkscspinner('remove');
        /*if( ! this.isVisualizzaBtnShown) {
         this.logClickEvent();
         }*/
        $(window).trigger('cardmaster:loaded', this.$el);
        $(window).trigger('scrollbar:resize', 'relative');
    },
    pagingRender: function() {
        this.$('.spin-small').hide();
        if (Number(this.totalRecords) > 0 && Number(this.totalRecords) > 10) {
            this.$('.collegamenti-pagination-container').html(this.pagingTemplate());


            var totalCount = parseInt(this.totalRecords);
            var totalPageNo = totalCount > 0 ? Math.ceil(totalCount / this.recordsPerPage) : 0;
            this.pageTab.totalPageNo = totalPageNo;
            this.pageTab.startPageNo = 1;
            this.pageTab.currentTab = 1;
            this.pageTab.endPageNo = totalPageNo > this.maxPagesShowing ? this.maxPagesShowing : totalPageNo;
            this.pageTab.goTo(this.currentTab);
            var tempHTML = this.pageTab.startPageNo > 1 ? '<span style="cursor:pointer" class="prev_cust">...</span>' : '';
            for (var i = this.pageTab.startPageNo; i <= this.pageTab.endPageNo; i++) {
                tempHTML += '<a href="javascript:void(0)" class="' + ((this.pageTab.currentTab == i) ? 'active' : 'goTo') + '">' + i + '</a>';
            }
            tempHTML += this.pageTab.totalPageNo > this.maxPagesShowing && this.pageTab.totalPageNo - this.pageTab.currentTab >= this.maxPagesShowing - 2 ?
                '<span style="cursor:pointer" class="next_cust">...</span>' : '';
            this.$('.pages').html(tempHTML);

        } else {
            this.$('.collegamenti-pagination-container').html('');
            this.pageTab.currentTab = 0;
            this.pageTab.totalPageNo = 0;
        }
        if(this.currentTab !== 1 ) {
            $('.first').addClass('styleFirst');
            $('.prev').addClass('styleFirst');

        }
        if(this.currentTab !==this.pageTab.totalPageNo ) {

            $('.last').addClass('styleLast');
            $('.next').addClass('styleLast');
        }

        $(window).trigger('scrollbar:resize', 'relative');
    },
    goTo: function(e) {
        //wkscommerciale.log.doPushLog({logger: this.options.logger});
        this.pageTab.goTo(parseInt(e.target.text));
        this.loadPage();
    },
    prev: function() {//5009
        if(this.currentTab !== 1) {
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.pageTab.previous();
            this.loadPage();
        }
    },
    next: function() {
        if(this.currentTab !== this.pageTab.totalPageNo) {
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.pageTab.next();
            this.loadPage();
        }
    },
    prevTab: function() {
        this.pageTab.previousTab();
        if(this.currentTab !== this.pageTab.currentTab){
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.loadPage();
        }
    },
    nextTab: function() {
        this.pageTab.nextTab();
        if(this.currentTab !== this.pageTab.currentTab){
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.loadPage();
        }
    },
    first: function() {//5009
        if(this.currentTab !== 1){
            this.pageTab.goTo(1);
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.loadPage();
        }
    },
    last: function() {//5009
        if(this.currentTab !== this.pageTab.totalPageNo){
            this.pageTab.goTo(this.pageTab.totalPageNo);
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.loadPage();
        }
    },
    loadPage: function() {
        this.$('.spin-small').remove();
        this.$('.pagination').after('<div class="spin-small" style="display:none;float:right;position:relative"><div class="spinner" style="top:-7px;left:-30px;position:absolute"><div class="bar1 small"></div><div class="bar2 small"></div><div class="bar3 small"></div><div class="bar4 small"></div><div class="bar5 small"></div><div class="bar6 small"></div><div class="bar7 small"></div><div class="bar8 small"></div><div class="bar9 small"></div><div class="bar10 small"></div><div class="bar11 small"></div><div class="bar12 small"></div></div></div>');
        this.$('.spin-small').show();
        this.currentTab = this.pageTab.currentTab;
        var sIndex = (this.currentTab - 1) * this.recordsPerPage;
        var eIndex = _.min([this.currentTab * this.recordsPerPage, this.totalRecords]);
        this.sectionRender(this.collegamentiData.slice(sIndex, eIndex));
        this.pagingRender();
    },
    onBtnClickVisualizzaTuttiSaldi:function(e){
        e.stopPropagation();
        $(e.currentTarget).hide();
        var spanTd = $(this.el).find('.money[visualizza-tutti-saldi]'),
            span = spanTd.find('span'),
            spinner = $('<div class="spinner absolute" style="left:-50px; top:-20px;"><div class="bar1 small"></div><div class="bar2 small"></div><div class="bar3 small"></div><div class="bar4 small"></div><div class="bar5 small"></div><div class="bar6 small"></div><div class="bar7 small"></div><div class="bar8 small"></div><div class="bar9 small"></div><div class="bar10 small"></div><div class="bar11 small"></div><div class="bar12 small"></div></div>');
        span.addClass('relative');
        span.html(spinner);
        var count=0, soggetto="";
        $.each(spanTd,function(d,td){
            if(count==0){
                soggetto = $(td).attr('idSoggetto');
            }
            else{
                soggetto = soggetto+";"+$(td).attr('idSoggetto');
            }
            count++;
        });
        var $this=this;
        wkscommerciale.ajaxRequests.get({
            url: window.wkscustomerContext+'/service/customers/linkedsaldo?soggettoId='+soggetto.toString(),
            params: '',
            onSuccess: function(response){
                span.empty();
                var data = response.data[0];
                for(key in data){
                    $($this.el).find('.money[visualizza-tutti-saldi][idSoggetto="'+key+'"] span').html(data[key]);
                }
            },
            onError: function(xhr, status, message){
                $(e.currentTarget).show();
                wkscommerciale.notifyError.pushError(message);
                span.empty();
            }
        });
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    logClickEvent: function(e) {
        if(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        var $target = e ? this.$(e.currentTarget) : this.$('#show-saldi-details'),
            table = this.$('.comp_table'),
            trArr = table.find('tr[data-need-to-fetch-saldo]'),
            /*hiddenCols = table.find('.money'),*/
            soggIdArr = [],
            span = trArr.find('.money').find('span'),
            spinner = $('<div class="spinner absolute" style="left:-50px; top:-20px;"><div class="bar1 small"></div><div class="bar2 small"></div><div class="bar3 small"></div><div class="bar4 small"></div><div class="bar5 small"></div><div class="bar6 small"></div><div class="bar7 small"></div><div class="bar8 small"></div><div class="bar9 small"></div><div class="bar10 small"></div><div class="bar11 small"></div><div class="bar12 small"></div></div>');
        $target.hide();
        /*hiddenCols.show();*/
        span.addClass('relative');
        span.html(spinner);
        _.each(trArr, function(tr, i) {
            var soggId = this.$(tr).attr('idSoggetto');
            if(_.size(soggId) > 0) {
                soggIdArr.push(soggId);
            }
        }, this);
        var soggIdStr = soggIdArr.join(';');
        var btnlog;
        if(_.size(soggIdStr) > 0) {
            if(this.isVisualizzaBtnShown) {
                var initialParams = 'VisualizzaSaldi=##idsoggetto=' + this.soggettoId + '##clienteIdSoggetti=' + soggIdArr.join(',');
                btnlog = new wkscommerciale.log.wkscLogger('3.1.private_customer_card.html/collegamenti.html', 'WKSC-COLL', initialParams);
                wkscommerciale.log.doPushLog({logger: btnlog});
                /*this.isVisualizzaBtnShown = false;*/
            }
            wkscommerciale.ajaxRequests.get({
                url: wkscustomerContext + '/service/customers/linkedsaldo',
                params: {soggettoId: soggIdStr},
                onSuccess: _.bind(function(response) {
                    span.empty();
                    if(_.size(response.data) > 0) {
                        _.each(response.data[0], function(saldo, soggettoId) {
                            table.find('tr[idSoggetto=' + soggettoId + ']').find('.money > span').html(saldo);
                            // update the fetched information in this view's persistent variable
                            var rowIndex = wkscommerciale.arrayHelper.searchObject(this.collegamentiData, [{key: 'soggettoId', val: soggettoId}], false);
                            if(rowIndex > -1) {
                                this.collegamentiData[rowIndex].saldo = saldo;
                                this.collegamentiData[rowIndex].saldoToBeFetched = false;
                            }
                        }, this);
                    }
                    if(btnlog) {
                        wkscommerciale.log.doPopLog({logger: btnlog});
                    }
                    $(window).trigger('scrollbar:resize', 'relative');
                }, this),
                onError: _.bind(function(response, status, message) {
                    $target.show();
                    wkscommerciale.notifyError.pushError(message);
                    span.empty();
                    if(btnlog) {
                        wkscommerciale.log.doPopLog({logger: btnlog});
                    }
                }, this)
            });
        }
    }
});
/*
 <wkscapp.SoggettiAbilitatiView> is responsible for the Soggetti Abilitati on the customer home page.
 */
wkscustomer.views.SoggettiAbilitatiView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        /*wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
         soggettoId: wkscommerciale.idSoggetto.get()
         });*/
        if( ! _.isUndefined(wkscustomer.soggettiAbilitatiCollection)) {
            this.collection.reset(wkscustomer.soggettiAbilitatiCollection);
        } else {
            wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
                soggettoId: wkscommerciale.idSoggetto.get()
            });
        }
    },
    render: function() {
        var self = this;
        var soggettiAbilitatiData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(soggettiAbilitatiData[0].message);
        var soggettiAbilitatiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/soggetti_abilitati"));
        if (soggettiAbilitatiData[0].data.length != 0) {
            if (soggettiAbilitatiData[0].data[0].soggettiAbilitati.length != 0) {
                $(this.el).html(soggettiAbilitatiTemplate({
                    "soggettiAbilitati": soggettiAbilitatiData[0].data[0].soggettiAbilitati,
                    "showDefault": false
                }));
                _.each(soggettiAbilitatiData[0].data[0].soggettiAbilitati, function(item, i) {
                    //this.abilitatiPrivacyAlert(item.soggettoId);
                    this.checkAbilitatiCustomerAlert(item.soggettoId,item.conto);
                }, this);
            }
            else {
                $(this.el).html(soggettiAbilitatiTemplate({
                    "soggettiAbilitati": [],
                    "showDefault": true
                }));
            }
        }
        else {
            $(this.el).html(soggettiAbilitatiTemplate({
                "soggettiAbilitati": [],
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    /*abilitatiPrivacyAlert : function(soggettoId) {
     wkscommerciale.ajaxRequests.get({
     url: window.wkscustomerContext + '/service/customers/popupSignals',
     params: {
     'soggettoId' : soggettoId
     },
     onSuccess : _.bind(function(response){
     var data = _.has(response, 'data') ? response.data : [];
     if(data.length > 0) {
     var alertCnt = data.length;
     var code = alertCnt > 1 ? 'MANYALERTS' : (_.has(data[0], 'msgCode') ? data[0].msgCode : '');
     if(code) {
     var iconId = wkscommerciale.generateRandomText(8),
     msgs = {
     'MANYALERTS' : 'Necessario recupero modulo privacy',
     'PRIVACYLV6' : 'Necessario aggiornamento consensi privacy'
     },
     icons = {
     'MANYALERTS' : '<img src="assets/vendor-app/images/icon-doc-privacy.png" class="privacy-icon privacy-alert" data-ctool="#' + iconId + '" style="cursor:help;" /><div class="ctool privacy-alert" id="' + iconId + '">{msg}</div>',
     'PRIVACYLV6' : '<img src="assets/vendor-app/images/icon-privacy.png" class="privacy-icon privacy-alert" data-ctool="#' + iconId + '" style="cursor:help;" /><div class="ctool privacy-alert" id="' + iconId + '">{msg}</div>'
     },
     nameTr = this.$('[idsoggetto="' + soggettoId + '"]'),
     nameTd = nameTr.find('td:eq(0)');
     nameTr.find('.privacy-alert').remove();
     nameTd.append(icons[code].replace(/{msg}/ig, msgs[code]));
     $(window).trigger('cardmaster:loaded', this.$el);
     }
     }
     }, this),
     onError : _.bind(function(response) {
     })
     });
     },*/
    checkAbilitatiCustomerAlert : function(soggettoId, conto) {
        if(typeof wkscustomer.collections.allPopupSignals !== 'undefined') {
            var popupData = wkscustomer.collections.allPopupSignals.toJSON();
            if( ! wkscommerciale.checkIsEmpty(popupData)&& _.has(popupData[0], 'data') &&
                ! wkscommerciale.checkIsEmpty(popupData[0].data) && _.has(popupData[0].data[0], soggettoId)) {
                var alerts = popupData[0].data[0][soggettoId],
//					msgs = {
//						'NOTRACELET' : 'Necessario recupero modulo privacy',
//						'PRIVACYLV6' : 'Necessario aggiornamento consensi privacy',
//						'RDPRVCY3PF' : 'Consenso privacy ai fini commerciali mancante',
//						'RDPRVCY3PL' : 'Consenso privacy ai fini commerciali mancante',
//						'RDRECUPDPF' : 'Necessario aggiornare i recapiti',
//						'RDRECUPDPL' : 'Necessario aggiornare i recapiti'
//					},
                    nameTr = this.$('[idsoggetto="' + soggettoId + '"][idConto="' + conto + '"]'),
                    nameTd = nameTr.find('td:eq(0)');
                nameTr.find('.privacy-alert').remove();
                _.each(alerts, function(alert, i) {
                    var iconId = wkscommerciale.generateRandomText(8),
                        code = _.has(alert, 'msgCode') && _.size(alert.msgCode) > 0 ? alert.msgCode : '',
                        icon = _.has(alert, 'icon') && _.size(alert.icon) > 0 ? alert.icon : '',
                        tooltipText = _.has(alert, 'alertMessage') && _.size(alert.alertMessage) > 0 ? alert.alertMessage: '';
                    if(code && icon) {
                        var $img = $('<img/>').attr({
                            'src' : 'assets/vendor-app/images/' + alert.icon,
                            'class': 'privacy-icon privacy-alert',
                            'data-ctool' : '#' + iconId,
                            'style' : 'cursor:help;'
                        }), $tooltip = $('<div/>').attr({
                            'class' : 'ctool privacy-alert',
                            'id': iconId
                        }).html(tooltipText);
                        nameTd.append($img, $tooltip);
                    }
                }, this);
                $(window).trigger('cardmaster:loaded', this.$el);
                /*if( ! wkscommerciale.checkIsEmpty(alerts)) {
                 var alertCnt = alerts.length;
                 var code = alertCnt > 1 ? 'MANYALERTS' : alerts[0].msgCode;
                 if(code) {
                 var iconId = wkscommerciale.generateRandomText(8),
                 msgs = {
                 'MANYALERTS' : '',
                 'NOTRACELET' : 'Necessario recupero modulo privacy',
                 'PRIVACYLV6' : 'Necessario aggiornamento consensi privacy',
                 'RDPRVCY3PF' : 'Consenso privacy ai fini commerciali mancante',
                 'RDPRVCY3PL' : 'Consenso privacy ai fini commerciali mancante',
                 'RDRECUPDPF' : 'Necessario aggiornare i recapiti',
                 'RDRECUPDPL' : 'Necessario aggiornare i recapiti'
                 },
                 icon = code === 'MANYALERTS' ? '' : '<img src="assets/vendor-app/images/' + alerts[0].icon + '" class="privacy-icon privacy-alert" data-ctool="#' + iconId + '" style="cursor:help;" /><div class="ctool privacy-alert" id="' + iconId + '">' + msgs[code] + '</div>',
                 nameTr = this.$('[idsoggetto="' + soggettoId + '"]'),
                 nameTd = nameTr.find('td:eq(0)');
                 nameTr.find('.privacy-alert').remove();
                 nameTd.append(icon);
                 $(window).trigger('cardmaster:loaded', this.$el);
                 }
                 }*/
            }
        }
    }
});
/*
 <wkscapp.SoggettiContiView> is responsible for the Soggetti Conti on the customer home page.
 */
wkscustomer.views.SoggettiContiView = wkscommerciale.views.WksMasterView.extend({
    el: $("#private_customer_5"),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({ css: 'large' });
        // this.soggettoId = wkscommerciale.idSoggetto.get();
        this.soggettoId = options.soggettoId;
        this.isSaldiVisible = options.isSaldiVisible;
        this.isVisualizzaBtnShown = ! this.isSaldiVisible;
        this.currentPage = options.currentPage;
        this.recordsPerPage = options.recordsPerPage;
        this.collection.on('reset', this.render, this);
        if( ! this.isVisualizzaBtnShown) {
            this.$('#show-saldi-details').remove();
        }
        this.collection.fetch(wkscommerciale.utils.fetchCallback({
            soggettoId: this.soggettoId,
            isSaldoRequired: this.isSaldiVisible
        }));
    },
    events: {
        'click #show-saldi-details': 'logClickEvent',
        'click .goTo' : 'goTo',
        'click .prevSet' : 'prev',
        'click .nextSet' : 'next',
        'click .prevTab' : 'prevTab',
        'click .nextTab' : 'nextTab',
        'click .first' : 'first',//5009
        'click .last' : 'last'//5009
    },
    render: function() {
        // Initialize pagination related params
        this.pagingTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/paging'));
        this.currentTab = 1;
        this.pageTab = new wksc.PageTab(1);
        this.maxPagesShowing = 5;// maxPagesShowing must be valued as integer >= 3
        this.totalRecords = 0;
        this.soggettiContiData = [];
        var soggettiContiData = this.collection.toJSON();
        var soggettiContiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/soggetti_conti'));
        if (_.size(soggettiContiData[0].data) > 0 && _.size(soggettiContiData[0].data[0].soggettiConti) > 0) {
            this.soggettiContiData = soggettiContiData[0].data[0].soggettiConti;
            this.totalRecords = _.size(this.soggettiContiData);
        }
        this.$el.html(soggettiContiTemplate());
        this.$('#soggetti-conti-table').wkscspinner({css: 'large', position: true});
        var sIndex = (this.currentTab - 1) * this.recordsPerPage;
        var eIndex = _.min([this.currentTab * this.recordsPerPage, this.totalRecords]);
        _.each(this.soggettiContiData, function(val, key) {
            if( ! _.has(this.soggettiContiData[key], 'saldoToBeFetched')) {
                this.soggettiContiData[key].saldoToBeFetched = _.size(val.saldo) <= 0;
            }
        }, this);
        this.sectionRender(this.soggettiContiData.slice(sIndex, eIndex));
        this.pagingRender();
        wkscommerciale.log.doPopLog(this.options);
    },
    sectionRender: function(data) {
        /*if(_.size(data) > 0 && this.isVisualizzaBtnShown) {
         // show this button only data is available
         this.$('#show-saldi-details').show();
         }*/
        var soggettiContiRows = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/soggetti_conti_rows'));
        this.$('#soggetti-conti-table').html(soggettiContiRows({soggettiConti: data, isSaldiHidden: this.isVisualizzaBtnShown}));
        this.$('#show-saldi-details').toggle(_.size(data) > 0 && this.$('tr[data-need-to-fetch-saldo]').length > 0);
        this.$el.wkscspinner('remove');
        /*if( ! this.isVisualizzaBtnShown) {
         this.logClickEvent();
         }*/
        $(window).trigger('cardmaster:loaded', this.$el);
        $(window).trigger('scrollbar:resize', 'relative');
    },
    pagingRender: function() {
        this.$('.spin-small').hide();
        if (Number(this.totalRecords) > 0 && Number(this.totalRecords) > 10) {
            this.$('.soggetticonti-pagination-container').html(this.pagingTemplate());
            var totalCount = parseInt(this.totalRecords);
            var totalPageNo = totalCount > 0 ? Math.ceil(totalCount / this.recordsPerPage) : 0;
            this.pageTab.totalPageNo = totalPageNo;
            this.pageTab.startPageNo = 1;
            this.pageTab.currentTab = 1;
            this.pageTab.endPageNo = totalPageNo > this.maxPagesShowing ? this.maxPagesShowing : totalPageNo;
            this.pageTab.goTo(this.currentTab);
            var tempHTML = this.pageTab.startPageNo > 1 ? '<span style="cursor:pointer" class="prevSet">...</span>' : '';
            for (var i = this.pageTab.startPageNo; i <= this.pageTab.endPageNo; i++) {
                tempHTML += '<a href="javascript:void(0)" class="' + ((this.pageTab.currentTab == i) ? 'active' : 'goTo') + '">' + i + '</a>';
            }
            tempHTML += this.pageTab.totalPageNo > this.maxPagesShowing && this.pageTab.totalPageNo - this.pageTab.currentTab >= this.maxPagesShowing - 2 ?
                '<span style="cursor:pointer" class="nextSet">...</span>' : '';
            this.$('.pages').html(tempHTML);
        } else {
            this.$('.soggetticonti-pagination-container').html('');
            this.pageTab.currentTab = 0;
            this.pageTab.totalPageNo = 0;
        }
        //5009
        if(this.currentTab !== 1 ) {
            $('.first').addClass('styleFirst');
            $('.prev').addClass('styleFirst');

        }
        if(this.currentTab !==this.pageTab.totalPageNo ) {

            $('.last').addClass('styleLast');
            $('.next').addClass('styleLast');
        }
        $(window).trigger('scrollbar:resize', 'relative');
    },
    goTo: function(e) {
        //wkscommerciale.log.doPushLog({logger: this.options.logger});
        this.pageTab.goTo(parseInt(e.target.text));
        this.loadPage();
    },
    prev: function() {
        //wkscommerciale.log.doPushLog({logger: this.options.logger});
        this.pageTab.previous();
        this.loadPage();
    },
    next: function() {
        //wkscommerciale.log.doPushLog({logger: this.options.logger});
        this.pageTab.next();
        this.loadPage();
    },
    prevTab: function() {
        this.pageTab.previousTab();
        if(this.currentTab !== this.pageTab.currentTab){
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.loadPage();
        }
    },
    nextTab: function() {
        this.pageTab.nextTab();
        if(this.currentTab !== this.pageTab.currentTab){
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.loadPage();
        }
    },
    first: function() {//5009
        this.pageTab.goTo(1);
        if(this.currentTab !== 1){
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.loadPage();
        }
    },
    last: function() {//5009
        this.pageTab.goTo(this.pageTab.totalPageNo);
        if(this.currentTab !== this.pageTab.totalPageNo){
            //wkscommerciale.log.doPushLog({logger: this.options.logger});
            this.loadPage();
        }
    },
    loadPage: function() {
        this.$('.spin-small').remove();
        this.$('.pagination').after('<div class="spin-small" style="display:none;float:right;position:relative"><div class="spinner" style="top:-7px;left:-30px;position:absolute"><div class="bar1 small"></div><div class="bar2 small"></div><div class="bar3 small"></div><div class="bar4 small"></div><div class="bar5 small"></div><div class="bar6 small"></div><div class="bar7 small"></div><div class="bar8 small"></div><div class="bar9 small"></div><div class="bar10 small"></div><div class="bar11 small"></div><div class="bar12 small"></div></div></div>');
        this.$('.spin-small').show();
        this.currentTab = this.pageTab.currentTab;
        var sIndex = (this.currentTab - 1) * this.recordsPerPage;
        var eIndex = _.min([this.currentTab * this.recordsPerPage, this.totalRecords]);
        this.sectionRender(this.soggettiContiData.slice(sIndex, eIndex));
        this.pagingRender();
    },
    onClose: function() {
        this.collection.off('change', this.render);
    },
    logClickEvent: function(e) {
        if(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        var $target = e ? this.$(e.currentTarget) : this.$('#show-saldi-details'),
            table = this.$('.comp_table'),
            trArr = table.find('tr[data-need-to-fetch-saldo]'),
            /*hiddenCols = table.find('.money'),*/
            soggIdArr = [],
            span = trArr.find('.money').find('span'),
            spinner = $('<div class="spinner absolute" style="left:-50px; top:-20px;"><div class="bar1 small"></div><div class="bar2 small"></div><div class="bar3 small"></div><div class="bar4 small"></div><div class="bar5 small"></div><div class="bar6 small"></div><div class="bar7 small"></div><div class="bar8 small"></div><div class="bar9 small"></div><div class="bar10 small"></div><div class="bar11 small"></div><div class="bar12 small"></div></div>');
        $target.hide();
        /*hiddenCols.show();*/
        span.addClass('relative');
        span.html(spinner);
        _.each(trArr, function(tr, i) {
            var $tr = this.$(tr),
                soggId = $tr.attr('idSoggetto'),
                conto = $tr.attr('data-conto');
            if(_.size(soggId) > 0 && _.size(conto) > 0) {
                soggIdArr.push(soggId + '::' + conto);
            }
        }, this);
        var soggIdStr = soggIdArr.join(';');
        var btnlog;
        if(_.size(soggIdStr) > 0) {
            if(this.isVisualizzaBtnShown) {
                var initialParams = 'VisualizzaSaldi=##idsoggetto=' + this.soggettoId + '##clienteIdSoggetti=' + soggIdArr.join(',');
                btnlog = new wkscommerciale.log.wkscLogger('3.1.private_customer_card.html/soggetti_conti.html', 'WKSC-ABIL', initialParams);
                wkscommerciale.log.doPushLog({logger: btnlog});
                /*this.isVisualizzaBtnShown = false;*/
            }
            wkscommerciale.ajaxRequests.get({
                url: wkscustomerContext + '/service/customers/linkedsaldo',
                params: {soggettoId: soggIdStr},
                onSuccess: _.bind(function(response) {
                    span.empty();
                    if(_.size(response.data) > 0) {
                        _.each(response.data[0], function(saldo, soggettoId) {
                            var selector = 'tr[idSoggetto="' + soggettoId + '"]';
                            var soggConto = soggettoId.split('::');
                            var searchInput = [{key: 'soggettoId', val: soggettoId}];
                            if(_.size(soggConto) > 1) {
                                var soggId = soggConto[0], contoId = soggConto[1];
                                searchInput = [{key: 'soggettoId', val: soggId}, {key: 'conto', val: contoId}];
                                selector = 'tr[idSoggetto="' + soggId + '"][data-conto="' + contoId + '"]';
                            }
                            var tr = table.find(selector),
                                span = tr.find('.money > span'),
                                alertClass = _.size(saldo) > 0 && saldo.indexOf('-') === 0 ? 'bad' : 'good';
                            span.removeClass('good bad').addClass(alertClass).html(saldo);
                            if(alertClass === 'bad') {
                                tr.addClass('alert');
                            }
                            // update the fetched information in this view's persistent variable
                            var rowIndex = wkscommerciale.arrayHelper.searchObject(this.soggettiContiData, searchInput, false);
                            if(rowIndex > -1) {
                                this.soggettiContiData[rowIndex].saldo = saldo;
                                this.soggettiContiData[rowIndex].status = alertClass;
                                this.soggettiContiData[rowIndex].saldoToBeFetched = false;
                                if(alertClass === 'bad') {
                                    this.soggettiContiData[rowIndex].isAlert = 1;
                                }
                            }
                        }, this);
                    }
                    if(btnlog) {
                        wkscommerciale.log.doPopLog({logger: btnlog});
                    }
                    $(window).trigger('scrollbar:resize', 'relative');
                }, this),
                onError: _.bind(function(response, status, message) {
                    $target.show();
                    wkscommerciale.notifyError.pushError(message);
                    span.empty();
                    if(btnlog) {
                        wkscommerciale.log.doPopLog({logger: btnlog});
                    }
                }, this)
            });
        }
    }
});
/*-------------------- Views for personali card starts here -----------------------*/
wkscustomer.views.TriggerPersonaliView = Backbone.View.extend({
    el: $("#customerPersonaliCard"),
    initialize: function(options) {
        this.options = options;
        this.soggettoId = options.soggettoId;
        this.tipoSoggetto = options.tipoSoggetto;
        this.pogEnabled = options.pogEnabled
    },
    render: function() {
        var customerPersonali = new wkscustomer.collections.CustomerPersonaliList();
        wkscommerciale.log.doPushLog(this.options);
        var CustomerPersonaliView = new wkscustomer.views.CustomerPersonaliView({
            el: $("#customerPersonaliCard"),
            collection: customerPersonali,
            logger: this.options.logger
        });
        if(CustomerPersonaliView) {
            wkscommerciale.consolle.log('CustomerPersonaliView variable is used!');
        }
        var personaliQuestionari = new wkscustomer.collections.PersonaliQuestionariList();
        wkscommerciale.log.doPushLog(this.options);
        var PersonaliPrivacyView = new wkscustomer.views.PersonaliPrivacyView({
            el: $("#personal_privacy"),
            collection: personaliQuestionari,
            logger: this.options.logger
        });
        if(PersonaliPrivacyView) {
            wkscommerciale.consolle.log('PersonaliPrivacyView variable is used!');
        }
        if( ! this.pogEnabled) {
            var personaliEsigenze = new wkscustomer.collections.PersonaliEsigenzeList();
            wkscommerciale.log.doPushLog(this.options);
            var PersonaliEsigenzeView = new wkscustomer.views.PersonaliEsigenzeView({
                el: $("#personal_needs"),
                collection: personaliEsigenze,
                logger: this.options.logger
            });
            if(PersonaliEsigenzeView) {
                wkscommerciale.consolle.log('PersonaliEsigenzeView variable is used!');
            }
        } else {
            $('#personal_needs').remove();
        }
        wkscommerciale.log.doPopLog(this.options);
        // Trigger the activityWatch function for the view.
        //this.activityWatch(); //Commented this for remove the Indirizzi and Alti Recapiti functaions.
    }
});
wkscustomer.views.CustomerPersonaliView = wkscommerciale.views.WksMasterView.extend({
    el: $("#customerPersonaliCard"),
    initialize: function(options) {
        this.options = options;
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        $("#personal_registry").wkscspinner({
            css: 'large'
        });
        /* REMOVED WITH PORTAHC-4872
         $("#personal_commercial_initiatives").wkscspinner({
         css: 'large'
         });
         */
        wkscSMHandler.encryptSoggettoId();
    },
    render: function() {
        var customerPersonaliData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(customerPersonaliData[0].message);
        if (customerPersonaliData[0].data.length != 0) {
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.PersonaliAnagraficaView({
                el: $("#personal_registry"),
                data: customerPersonaliData[0].data[0].personali[0],
                logger: this.options.logger
            }).render();
            /* REMOVED WITH PORTAHC-4872
             wkscommerciale.log.doPushLog(this.options);
             new wkscustomer.views.PersonaliIniziativeView({
             el: $("#personal_commercial_initiatives"),
             data: customerPersonaliData[0].data[0].personali[0].iniziativeCommerciale,
             logger: this.options.logger
             }).render();
             */
        }
        else {
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.PersonaliAnagraficaView({
                el: $("#personal_registry"),
                data: [],
                logger: this.options.logger
            }).render();
            /* REMOVED WITH PORTAHC-4872
             wkscommerciale.log.doPushLog(this.options);
             new wkscustomer.views.PersonaliIniziativeView({
             el: $("#personal_commercial_initiatives"),
             data: [],
             logger: this.options.logger
             }).render();
             */
        }
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
wkscustomer.views.PersonaliAnagraficaView = Backbone.View.extend({
    el: $("#personal_registry"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var anagraficaTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_anagrafica"));
        if (this.options.data.length != 0) {
            $(this.el).html(anagraficaTemplate({
                "anagrafica": this.options.data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(anagraficaTemplate({
                "anagrafica": [],
                "showDefault": true
            }));
        }
        if(wkscommerciale.user.data.promotoreBSNew == false)
        {
            $('#personali_AccettazionId').show();
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    }
});
//Removed this view from personali link in the private customer home page : PORTAHC-826
wkscustomer.views.PersonaliIndirizzi = Backbone.View.extend({
    el: $("#personal_addresses"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var indirizziTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_indirizzi"));
        if (this.options.data.length != 0) {
            $(this.el).html(indirizziTemplate({
                "indirizzi": this.options.data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(indirizziTemplate({
                "indirizzi": [],
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
    }
});
//Removed this view from personali link in the private customer home page : PORTAHC-826
wkscustomer.views.PersonaliRecapiti = Backbone.View.extend({
    el: $("#personal_more_contact_details"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var recapitiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_recapiti"));
        if (this.options.data.length != 0) {
            $(this.el).html(recapitiTemplate({
                "recapiti": this.options.data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(recapitiTemplate({
                "recapiti": [],
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
    }
});
/* REMOVED WITH PORTAHC-4872
 wkscustomer.views.PersonaliIniziativeView = Backbone.View.extend({
 el: $("#personal_commercial_initiatives"),
 initialize: function(options) {
 this.options = options;
 },
 render: function() {
 var iniziativeCommercialeTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/iniziative_commerciale"));
 if (this.options.data.length != 0) {
 $(this.el).html(iniziativeCommercialeTemplate({
 "iniziativeCommerciale": this.options.data,
 "showDefault": false
 }));
 }
 else {
 $(this.el).html(iniziativeCommercialeTemplate({
 "iniziativeCommerciale": [],
 "showDefault": true
 }));
 }
 $(this.el).wkscspinner('remove');
 wkscommerciale.log.doPopLog(this.options);
 }
 });
 */
wkscustomer.views.PersonaliPrivacyView = wkscommerciale.views.WksMasterView.extend({
    el: $("#personal_privacy"),
    events: {
        'click .ari-salva': 'salvaAdesioneRI'
    },
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        $("#personal_balance_sheet").html("");
        $("#personal_other_banks").html("");
        $("#personal_more_info").html("");
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        $("#personal_balance_sheet").wkscspinner({
            css: 'large'
        });
        $("#personal_other_banks").wkscspinner({
            css: 'large'
        });
        $("#personal_more_info").wkscspinner({
            css: 'large'
        });
    },
    render: function() {
        var privacyData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(privacyData[0].message);
        var privacyTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_privacy"));
        if (privacyData[0].data.length != 0) {
            $(this.el).html(privacyTemplate({
                "dati": privacyData[0].data[0],
                "showDefault": false
            }));
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.PersonaliSituazionePatrimonialeView({
                el: $("#personal_balance_sheet"),
                data: privacyData[0].data[0].situazionePatrimoniale,
                logger: this.options.logger
            }).render();
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.PersonaliAltreBancheView({
                el: $("#personal_other_banks"),
                data: privacyData[0].data[0].rapportiConAltreBanche,
                logger: this.options.logger
            }).render();
            wkscommerciale.log.doPushLog(this.options);
            if(wkscustomer.views.infoAggiuntivePersonaliView !== undefined && typeof wkscustomer.views.infoAggiuntivePersonaliView.destroy === 'function') {
                wkscustomer.views.infoAggiuntivePersonaliView.destroy();
            }
            wkscustomer.views.infoAggiuntivePersonaliView = new wkscustomer.views.InformazioniAggiuntivePersonaliView({
                el: $("#personal_more_info"),
                data: privacyData[0].data[0].informazioniAggiuntive,
                logger: this.options.logger
            });
            wkscustomer.views.infoAggiuntivePersonaliView.render();
        }
        else {
            $(this.el).html(privacyTemplate({
                "privacy": [],
                "showDefault": true
            }));
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.PersonaliSituazionePatrimonialeView({
                el: $("#personal_balance_sheet"),
                data: [],
                logger: this.options.logger
            }).render();
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.PersonaliAltreBancheView({
                el: $("#personal_other_banks"),
                data: [],
                logger: this.options.logger
            }).render();
            wkscommerciale.log.doPushLog(this.options);
            if(wkscustomer.views.infoAggiuntivePersonaliView !== undefined && _.has(wkscustomer.views.infoAggiuntivePersonaliView, 'destroy') && typeof wkscustomer.views.infoAggiuntivePersonaliView === 'function') {
                wkscustomer.views.infoAggiuntivePersonaliView.destroy();
            }
            wkscustomer.views.infoAggiuntivePersonaliView = new wkscustomer.views.InformazioniAggiuntivePersonaliView({
                el: $("#personal_more_info"),
                data: [],
                logger: this.options.logger
            });
            wkscustomer.views.infoAggiuntivePersonaliView.render();
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    salvaAdesioneRI: function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var editState = this.$(evt.currentTarget).parents('[data-edit-state]');
        var checkedState = this.$(evt.currentTarget).parents('[data-checked-state]');
        var oldVal = checkedState.find('[data-state-label]').attr('data-value');
        var newVal = editState.find('.comp_button_labels a.active').attr('data-edit-state-val');
        if( ! _.isEmpty(oldVal) && ! _.isEmpty(newVal) && oldVal !== newVal) {
            // audit log
            var initialParams = "RelIntModifica=##idsoggetto=" + wkscommerciale.idSoggetto.get() + "##DATI_PRECEDENTI="+oldVal+"##DATI_NUOVI="+newVal;
            var log = new wkscommerciale.log.wkscLogger("3.4.personal_details_card.html/personali_privacy.html", "WKSC-REIN", initialParams);
            wkscommerciale.log.doPushLog({logger: log});
            var successCb = _.bind(function(response){
                if(_.has(response, 'data') && response.data.length > 0 && response.data[0] === 'OK'){
                    checkedState.find('[data-state-label]').attr('data-value', newVal);
                    editState.hide();
                    checkedState.find('[data-show-state]').fadeIn();
                }else{
                    this.annullaClick(editState);
                }
                wkscommerciale.log.doPopLog({logger: log});
            }, this);
            var errorCb = _.bind(function(evt){
                this.annullaClick(editState);
                wkscommerciale.notifyError.pushFromFetchError(evt, []);
                wkscommerciale.log.doPopLog({logger: log});
            }, this);
            wkscommerciale.ajaxRequests.post({
                url: window.wkscustomerContext + '/service/customers/saveAdesioneRI',
                params: {
                    'soggettoId' : wkscommerciale.idSoggetto.get(),
                    'adessioneRiVal' : newVal
                },
                onSuccess: successCb,
                onError: errorCb
            });
        } else {
            this.annullaClick(editState);
        }
    },
    annullaClick: function(editState){
        editState.find('[data-edit-state-cancel]').trigger('click');
    }
});
wkscustomer.views.PersonaliSituazionePatrimonialeView = Backbone.View.extend({
    el: $("#personal_balance_sheet"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var situazionePatrimonialeData = this.options.data;
        var situazionePatrimonialeTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_situazione_patrimoniale"));
        if (situazionePatrimonialeData.length != 0) {
            $(this.el).html(situazionePatrimonialeTemplate({
                "situazionePatrimoniale": situazionePatrimonialeData,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(situazionePatrimonialeTemplate({
                "situazionePatrimoniale": [],
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
wkscustomer.views.PersonaliAltreBancheView = Backbone.View.extend({
    el: $("#personal_other_banks"),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var altreBancheData = this.options.data;
        var altreBancheTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_altre_banche"));
        if (altreBancheData.length != 0) {
            $(this.el).html(altreBancheTemplate({
                "altreBanche": altreBancheData,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(altreBancheTemplate({
                "altreBanche": altreBancheData,
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
wkscustomer.views.InformazioniAggiuntivePersonaliView = Backbone.View.extend({
    el: $("#personal_more_info"),
    initialize: function(options) {
        this.options = options;
    },
    events: {
        'click .bcAddInformation' : 'openModificaCard'
    },
    render: function() {
        var informazioniAggiuntiveData = this.options.data;
        var informazioniAggiuntiveTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_informazioni_aggiuntive"));
        if (informazioniAggiuntiveData.length != 0) {
            $(this.el).html(informazioniAggiuntiveTemplate({
                "informazioniAggiuntive": informazioniAggiuntiveData,
                "showDefault": false
            }));
        } else {
            $(this.el).html(informazioniAggiuntiveTemplate({
                "informazioniAggiuntive": [],
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    openModificaCard: function(e) {
        e.preventDefault();
        var cTarget = $(e.currentTarget);
        wkscommerciale.idSoggetto.set(cTarget.attr('data-val'));
        customCardLoader({
            loadType: "slidein",
            cardSize: cTarget.attr('data-class'),
            cardName: cTarget.attr('a-href')
        });
        return false;
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    destroy : function() {
        /* removes event listeners */
        this.undelegateEvents();
        /* removes data stored in DOM and unbind events from DOM */
        this.$el.removeData().off();
        /* removes view from DOM */
        //this.remove();
        /* call Backbone View's remove method to destroy the View completely */
        //Backbone.View.prototype.remove.call(this);
    }
});
//personaliEsigenze
wkscustomer.views.PersonaliEsigenzeView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var personaliEsigenzeData = this.collection.toJSON();
        // wkscommerciale.notifyError.pushError(personaliEsigenzeData[0].message);
        var personaliEsigenzeTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_esigenze"));
        if (personaliEsigenzeData[0].data.length != 0) {
            $(this.el).html(personaliEsigenzeTemplate({
                "personaliEsigenze": personaliEsigenzeData[0].data[0],
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(personaliEsigenzeTemplate({
                "personaliEsigenze": personaliEsigenzeData[0].data[0],
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
/*----------------- View for the altre banche input form starts here --------------------*/
wkscustomer.views.AltreBancheFormView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var formData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(formData[0].message);
        if (formData[0].data.length != 0) {
            var formTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_altre_banche_input_form"));
            var formHTML = formTemplate({
                "altreBanche": formData[0].data[0]
            });
            $(this.el).html(formHTML);
        }
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
wkscustomer.views.CustomerAgendaView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        var _id;
        if ($('.active').find('#private_customer_1').length === 0 && $('.active').find('#business_customer_1').length === 0)
        {
            _id = wkscommerciale.idAccount.get();
        }
        else
        {
            if (typeof($('.active').find('#agenda_right').attr('clientId')) !== "undefined")
            {
                if ($('.active').find('#agenda_right').attr('clientId') === wkscommerciale.idSoggetto.get())
                {
                    _id = wkscommerciale.idSoggetto.get();
                }
                else if ($('.active').find('#agenda_right').attr('clientId') === wkscommerciale.idProspect.get())
                {
                    _id = wkscommerciale.idProspect.get();
                }
                else
                {
                    _id = $('.active').find('#agenda_right').attr('clientId');
                }
            }
            else
            {
                if (wkscommerciale.idSoggetto.get().length === 0)
                {
                    _id = wkscommerciale.idProspect.get();
                }
                else
                {
                    _id = wkscommerciale.idSoggetto.get();
                }
            }
        }
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: _id
        });
    },
    render: function() {
        var agendaData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(agendaData[0].message);
        if (agendaData[0].data.length != 0) {
            var agendaTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/customer_agenda"));
            var _idSoggetto = agendaData[0].soggettoId;
            $('.active').find("#agenda_count").html("(" + agendaData[0].data[0].agendas.length + ")");
            $('.active').find('#agenda_right').attr('clientId', _idSoggetto);
            var agendaHTML = agendaTemplate({
                "agenda": agendaData[0].data[0].agendas
            });
            $(this.el).html(agendaHTML);
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog({logger: this.options.logger});
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
// Condizioni Conto Corrente card view to follow.
wkscustomer.views.CondizioniContoCorrente = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        this.on('subview', this.renderSubView);
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get(),
            idConto: contoId
        });
    },
    render: function() {

        var abicode_Text;
        this.condizioniData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(this.condizioniData[0].message);
        /*PRORTAHC-1033 */
        if (env === "TEST" || env === "DEV" || env === "PRO" || env === "PP") {
            $("#current_account_details_footer").show();
        }

        //4999
        /*if(wkscommerciale.user.abiCode === '03395'){
         $('#current_account_stampa').hide()
         }*/
        // 5076 Hide stampa button for all banks for conto corrente accounts
        $('#current_account_stampa').hide();


        var condizioniTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/condizioni_current_account"));
        if (this.condizioniData[0].data.length != 0) {
            $(this.el).html(condizioniTemplate({
                "condizioni": this.condizioniData[0].data[0],
                "showDefault": false
            }));
            return this.trigger('subview');
        }
        else {
            $(this.el).wkscspinner('remove');
            $(this.el).html(condizioniTemplate({
                "condizioni": [],
                "showDefault": true
            }));
        }
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        //alert("view closed");
        this.collection.off("change", this.render);
    },
    renderSubView: function() {

        var abikey =  'SELLABOX_DESC_'+ wkscommerciale.user.abiCode+'';
        var abicode_Text;
        var sella_box_SuccessPdfGen = _.bind(function(response) {
            var desciption = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], abikey) ? response.data[0][abikey] : '';
            if(_.size(desciption) > 0 )
            {
                abicode_Text = desciption
            }
            else
            {
                abicode_Text = 'SellaBox'
            }
        }, this);

        wkscommerciale.ajaxRequests.get({
            url: 'service/params/wkscParameterValues',
            params: {
                paramIds: 'SELLABOX_DESC_'+ wkscommerciale.user.abiCode+''
            },
            contentType: 'application/json; charset=utf-8',
            onSuccess: sella_box_SuccessPdfGen,
            // onError: ErrorCb
        });

        // wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.TassoCreditoreView({
            el: $("#tassoCreditore"),
            data: this.condizioniData[0].data[0].tassoCreditore//,
            //logger: this.options.logger
        }).render();
        // wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.TassoDebitoreView({
            el: $("#tassoDebitore"),
            data: this.condizioniData[0].data[0].tassoDebitore//,
            //logger: this.options.logger
        }).render();
        // wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.SpesaTenutaContoView({
            el: $("#spesaTenutaConto"),
            data: this.condizioniData[0].data[0].spesaTenutaConto//,
            //logger: this.options.logger
        }).render();
        //wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.SpeseInvioComunicazioniView({
            el: $("#speseInvio"),
            data: this.condizioniData[0].data[0].speseInvioComunicazioni,
            tipoEC: this.condizioniData[0].data[0].tipoSpeseInvioComunicazioni
        }).render();
        //wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.GiorniValutaPrelieviView({
            el: $("#giorniValutaPrelievi"),
            data: this.condizioniData[0].data[0].giorniValutaPrelievi//,
            //logger: this.options.logger
        }).render();
        // wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.GiorniValutaVersamentiView({
            el: $("#giorniValutaVersamenti"),
            data: this.condizioniData[0].data[0].giorniValutaVersamenti//,
            // logger: this.options.logger
        }).render();
        //wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.BonificiInEuroView({
            el: $("#bonifici"),
            data: this.condizioniData[0].data[0].bonificoInEuro//,
            //logger: this.options.logger
        }).render();
        // wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.PagamentoUtenzeView({
            el: $("#pagamentoUtenze"),
            data: this.condizioniData[0].data[0].pagamentoUtenze//,
            // logger: this.options.logger
        }).render();
        //wkscommerciale.log.doPushLog(this.options);
        new wkscustomer.views.PagamentoRidView({
            el: $("#pagamentoRid"),
            data: this.condizioniData[0].data[0].pagamentoRID//,
            //logger: this.options.logger
        }).render();
        /*PRORTAHC-1033 */
        if (env === "TEST" || env === "DEV" || env === "PRO" || env === "PP") {
            wkscApp.setValues('contoCorrentePdfData', this.condizioniData[0].data[0].contoCorrentePDF);
            $("#current_account_stampa").click(function(e) {
                var initialParams = 'idsoggetto=' + wkscommerciale.idSoggetto.get();
                var prefix='##';
                var obj=wkscApp.getValues('contoCorrentePdfData');
                for(var key in obj){
                    if(obj.hasOwnProperty(key)){
                        initialParams += prefix+key+'='+obj[key];
                    }
                }
                var log = new wkscommerciale.log.wkscLogger("3.3.1.conditions_current_account_details_card.html", "WKSC-PDFG", initialParams);
                obj.sellaBox_Text = abicode_Text+":";

                var condizioni = obj;

                for(var key in condizioni){
                    if(condizioni.hasOwnProperty(key)){
                        if((key ==='spesccart' || key ==='spesconl') && (condizioni[key] === 'null')){
                            condizioni[key] = '0,0';
                        }
                    }
                }

                var param = {
                    'pdfKey': "CONTO_CORRENTE",
                    /*'jsonData': JSON.stringify(wkscApp.getValues('contoCorrentePdfData'))};*/
                    'jsonData': JSON.stringify(obj)};
                wkscommerciale.log.doPushLog({logger: log});
                wkscommerciale.ajaxRequests.post({
                    url: 'pdfInvoker.jsp',
                    params: param,
                    dataType: 'text',
                    onSuccess: function(data) {
                        window.open("pdfgeneratorinvoker", "_blank");
                    },
                    onError : function(request, status, error) {
                        wkscommerciale.notifyError.pushError("pdfgeneratorinvoker - " + request.status + " : " + error);
                    }
                });
                wkscommerciale.log.doPopLog({logger: log});
                /*$.post('pdfInvoker.jsp', param, function(data) {
                 window.open("pdfgeneratorinvoker", "_blank");
                 }).fail(function(request, status, error) {
                 wkscommerciale.notifyError.pushError("pdfgeneratorinvoker - " + request.status + " : " + error);
                 });*/
            });
        }
        $(this.el).wkscspinner('remove');
        var contoCorrenteNr12 = this.condizioniData[0].data[0].contoCorrenteNr;
        var paramContoCorrenteNr12 = "##contoCorrenteNr12=" + contoCorrenteNr12;
        //modifica per conto parametrato... non deve figurare nei log
        var searchCcPar = paramContoCorrenteNr12.search('<br/>Conto Parametrato');
        if (searchCcPar != -1) {
            paramContoCorrenteNr12 = paramContoCorrenteNr12.substring(0, searchCcPar);
        }
        this.options.logger.addlogParams(paramContoCorrenteNr12);
        wkscommerciale.log.doPopLog({logger: this.options.logger});
    }
});
// Condizioni Conto Deposito View
wkscustomer.views.ContoDepositoView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get(),
            idConto: contoId
        });
    },
    render: function() {
        this.contoDepositoData = this.collection.toJSON();
        // wkscommerciale.notifyError.pushError(this.contoDepositoData[0].message);
        /*PRORTAHC-1033 */
        if (env === "TEST" || env === "DEV" || env === "PRO" || env === "PP") {
            $("#deposit_account_details_footer").show();
        }
        // 5076 Hide stampa for all banks for deposito accounts
        $('#deposit_account_stampa').hide();
        if (this.contoDepositoData[0].data.length != 0) {
            var condizioniTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/condizioni_conto_deposito"));
            var condizioniHTML = condizioniTemplate({
                "contoDeposito": this.contoDepositoData[0].data[0]
            });
            $(this.el).html(condizioniHTML);
        }
        var sella_box_Successcondizioni = _.bind(function(response) {
            var key =  'SELLABOX_DESC_'+ wkscommerciale.user.abiCode+'';
            var desciption = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], key) ? response.data[0][key] : '';
            if(_.size(desciption) > 0 )
            {
                $('#sellaBox_condizioni_Id').text(desciption);
            }
            else
            {
                $('#sellaBox_condizioni_Id').text('SellaBox');
            }
        }, this);

        wkscommerciale.ajaxRequests.get({
            url: 'service/params/wkscParameterValues',
            params: {
                paramIds: 'SELLABOX_DESC_'+ wkscommerciale.user.abiCode+''
            },
            contentType: 'application/json; charset=utf-8',
            onSuccess: sella_box_Successcondizioni,
            // onError: ErrorCb
        });
        /*PRORTAHC-1033 */
        if (env === "TEST" || env === "DEV" || env === "PRO" || env === "PP") {
            wkscApp.setValues('contoDepositoPdfData', this.contoDepositoData[0].data[0].contoDepositoPDF);
            $("#deposit_account_stampa").click(function(e) {
                var param = {
                    'pdfKey': "CONTO_DEPOSITO",
                    'jsonData': JSON.stringify(wkscApp.getValues('contoDepositoPdfData'))};
                wkscommerciale.ajaxRequests.post({
                    url: 'pdfInvoker.jsp',
                    params: param,
                    dataType: 'text',
                    onSuccess: function(data) {
                        window.open("pdfgeneratorinvoker", "_blank");
                    },
                    onError: function(request, status, error) {
                        wkscommerciale.notifyError.pushError("pdfgeneratorinvoker - " + request.status + " : " + error);
                    }
                });
                /*$.post('pdfInvoker.jsp', param, function(data) {
                 window.open("pdfgeneratorinvoker", "_blank");
                 }).fail(function(request, status, error) {
                 wkscommerciale.notifyError.pushError("pdfgeneratorinvoker - " + request.status + " : " + error);
                 });*/
            });
        }
        $(this.el).wkscspinner('remove');
        var contoCorrenteNr12 = this.contoDepositoData[0].data[0].contoCorrenteNum;
        var paramContoCorrenteNr12 = "##contoCorrenteNr12=" + contoCorrenteNr12;
        this.options.logger.addlogParams(paramContoCorrenteNr12);
        wkscommerciale.log.doPopLog({logger: this.options.logger});
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
wkscustomer.views.TassoCreditoreView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var tassoCreditoreTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/tasso_creditore"));
        if (data.length != 0) {
            $(this.el).html(tassoCreditoreTemplate({
                "tassoCreditore": data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(tassoCreditoreTemplate({
                "tassoCreditore": data,
                "showDefault": true
            }));
        }
        //wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.TassoDebitoreView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var tassoDebitoreTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/conto_corrente_tasso_debitore"));
        if (data.length != 0) {
            $(this.el).html(tassoDebitoreTemplate({
                "tassoDebitore": data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(tassoDebitoreTemplate({
                "tassoDebitore": data,
                "showDefault": true
            }));
        }
        //wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.SpesaTenutaContoView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var spesaTenutaContoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/spesa_tenuta"));
        if (data.length != 0) {
            $(this.el).html(spesaTenutaContoTemplate({
                "spesaTenutaConto": data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(spesaTenutaContoTemplate({
                "spesaTenutaConto": data,
                "showDefault": true
            }));
        }
        //wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.SpeseInvioComunicazioniView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var tipoEC = this.options.tipoEC;
        var speseInvioComunicazioniTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/conto_corrente_spese_invio_comunicazioni"));
        if (data.length != 0) {
            $(this.el).html(speseInvioComunicazioniTemplate({
                "speseInvioComunicazioni": data,
                "tipoEC": tipoEC,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(speseInvioComunicazioniTemplate({
                "speseInvioComunicazioni": data,
                "tipoEC": "annuale",
                "showDefault": true
            }));
        }
        // wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.GiorniValutaPrelieviView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var giorniValutaPrelieviTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/giorni_valuta_prelievi"));
        if (data.length != 0) {
            $(this.el).html(giorniValutaPrelieviTemplate({
                "giorniValutaPrelievi": data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(giorniValutaPrelieviTemplate({
                "giorniValutaPrelievi": data,
                "showDefault": true
            }));
        }
        // wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.GiorniValutaVersamentiView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var giorniValutaVersamentiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/giorni_valuta_versamenti"));
        if (data.length != 0) {
            $(this.el).html(giorniValutaVersamentiTemplate({
                "giorniValutaVersamenti": data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(giorniValutaVersamentiTemplate({
                "giorniValutaVersamenti": data,
                "showDefault": true
            }));
        }
        //wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.BonificiInEuroView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        if (data.length != 0) {
            var bonificiInEuroTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/conto_corrente_bonifici_in_euro"));
            var bonificiInEuroHTML = bonificiInEuroTemplate({
                "bonificiInEuro": data
            });
            $(this.el).html(bonificiInEuroHTML);
        }
        //wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.PagamentoUtenzeView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var pagamentoUtenzeTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/conto_corrente_pagamento_utenze"));
        if (data.length != 0) {
            $(this.el).html(pagamentoUtenzeTemplate({
                "pagamentoUtenze": data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(pagamentoUtenzeTemplate({
                "pagamentoUtenze": data,
                "showDefault": true
            }));
        }
        //wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.PagamentoRidView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var pagamentoRidTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/conto_corrento_pagamento_rid"));
        if (data.length != 0) {
            $(this.el).html(pagamentoRidTemplate({
                "pagamentoRid": data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(pagamentoRidTemplate({
                "pagamentoRid": data,
                "showDefault": true
            }));
        }
        // wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.DepositoSpesaInvio = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var data = this.options.data;
        var depositoSpesaInvioTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/deposito_spesa_invio"));
        if (data.length != 0) {
            $(this.el).html(depositoSpesaInvioTemplate({
                "depositoSpesaInvio": data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(depositoSpesaInvioTemplate({
                "depositoSpesaInvio": data,
                "showDefault": true
            }));
        }
    }
});
// Backbone View for the Informazioni Aggiuntive(Questionario Form)
wkscustomer.views.InformazioniAggiuntiveView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        this.soggettoId = options.soggettoId;
        this.prospectId = options.prospectId;
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: this.soggettoId
        });
    },
    events: {
        'click .ia_delBtn' : 'clearInputData'
    },
    render: function() {
        var informazioniAggiuntiveData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(informazioniAggiuntiveData[0].message);
        wkscApp.setValues('informazioniAggiuntiveDetails', informazioniAggiuntiveData[0].data[0].domande);
        if (informazioniAggiuntiveData[0].data.length != 0) {
            var informazioniAggiuntiveTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/personali_questionario"));
            var informazioniAggiuntiveHTML = informazioniAggiuntiveTemplate({
                "informazioniAggiuntive": informazioniAggiuntiveData[0].data[0].domande,
                "numeroDiDomanda": informazioniAggiuntiveData[0].data[0].numeroDiDomanda
            });
            $(this.el).html(informazioniAggiuntiveHTML);
            $("input[data-cascade-click]").click(function(e) {
                var hasChild = $(e.currentTarget).attr('data-hasChild');
                if (hasChild === "1") {
                    $(e.currentTarget).parent().find('div').slideDown(250);
                } else {
                    $(e.currentTarget).parent().find('div').slideUp(250);
                }
            });
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    clearInputData : function(e) {
        e.preventDefault();
        var cTarget = $(e.currentTarget);
        cTarget.parents('[delicon]').find('input[type=text]').val('');
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
/*--------------------------------Condizioni Servizi Telematici-------------------------------------------*/
wkscustomer.views.ServiziTelematiciView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var serviziTelematiciData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(serviziTelematiciData[0].message);
        var serviziTelematiciTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/condizioni_servizi_telematici"));
        if (serviziTelematiciData[0].data.length !== 0) {
            $(this.el).html(serviziTelematiciTemplate({
                "serviziTelematici": serviziTelematiciData[0].data[0],
                "showDefault": false
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
/*--------------------------------Carte di Pagamento-------------------------------------------*/
wkscustomer.views.CartaDiPagamentoView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get(),
            cardId: carteId
        });
    },
    render: function() {
        var cartaDiPagamentoData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(cartaDiPagamentoData[0].message);
        if (cartaDiPagamentoData[0].data.length !== 0) {
            var cartaDiPagamentoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/condizioni_carte_di_pagamento"));
            var cartaDiPagamentoHTML = cartaDiPagamentoTemplate({
                "cartaDiPagamento": cartaDiPagamentoData[0].data[0]
            });
            $(this.el).html(cartaDiPagamentoHTML);
        }
        var paramIdCartaNr = "##idCarta=" + carteId;
        this.options.logger.addlogParams(paramIdCartaNr);
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
//		alert("view closed");
        this.collection.off("change", this.render);
    }
});
/*--------------------------------Operativita Estero-------------------------------------------*/
wkscustomer.views.OperativitaEsteroView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var operativitaEsteroData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(operativitaEsteroData[0].message);
        var operativitaEsteroTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/condizioni_operativita_estero"));
        if (operativitaEsteroData[0].data.length !== 0) {
            $(this.el).html(operativitaEsteroTemplate({
                "operativitaEstero": operativitaEsteroData[0].data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(operativitaEsteroTemplate({
                "operativitaEstero": operativitaEsteroData[0].data,
                "showDefault": true
            }));
        }
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
//PORTAHC-6285 added investimenti card in conti e servizi for bank BPA.
/*----------------------------Conti e servizi - investimenti table----------------------------------*/
wkscustomer.views.InvestimentiContiServiziView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var investimentiData = this.collection.toJSON();
        var arrayViewJobs = [];
        if (investimentiData[0].data.length != 0) {
            var investimentiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/investimenti_conti_servizi"));
            var investimentiHTML = investimentiTemplate({
                "investimenti": investimentiData[0].data[0]
            });
            $(this.el).html(investimentiHTML);
        }
        $("#contichiusiInvestment").click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr('soggettoid'));
            wkscApp.setTipoConto("2");
            customCardLoader({
                loadType: "slidein",
                cardSize: "size_small",
                cardName: window.wkscustomerContext+"/assets/cards/3.8.1.conti_chiusura_card.html"
            });
            return false;
        });
        var self = this;
        wkscommerciale.log.doPushLog(self.options);
        wkscommerciale.profiles.advancedCheckProfile('consulenzaeinvestimentiButton', function(consulenzaeinvestimentiButtonAuthorized) {
            arrayViewJobs.push('consulenzaeinvestimentiButton');
            if (consulenzaeinvestimentiButtonAuthorized) {
                $("#consulenzaEInvestimentiINVButton").show();
            }
        }, {logger: self.options.logger});
        wkscommerciale.log.doPushLog(self.options);
        wkscommerciale.profiles.advancedCheckProfile('ContoTitoliMoneyfarmButton', function(ContoTitoliMoneyfarmButtonAuthorized) {
            arrayViewJobs.push('ContoTitoliMoneyfarmButton');
            if (ContoTitoliMoneyfarmButtonAuthorized) {
                $("#ContoTitoliMoneyfarmButton").show();
            }
        }, {logger: self.options.logger});
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
            if(hasGrant)
            {
//				Disable Nuova button
                $(this.el).find('#NuovoInvestimentiButton').hide()
                $(this.el).find('.gray_table .operations li a[smname="TitoliOrdiniNTP"]').remove()
            }
        },this ));
        //5053
        if(wkscommerciale.user.data.promotoreBSNew){
            $(this.el).find('#NuovoInvestimentiButton').hide();
        }
        $('td[sm-open-h2oadaptor-investimenti]').click(function(e) {
            _window_event = e;
            var tr = $(e.currentTarget).parent('tr'),
                conto = tr.find('td').first().text().replace(/\s+/g, ' ').trim(),
                contoType = inspectNumeroConto(conto).tipoConto;
            if (contoType === "C7") {
                wkscSMHandler.openLink_smAdaptor({smname: 'ContoInternoResult', outparams: tr.attr('smOutParams'), inputparams: conto, newtab: tr.attr('newtab'), iframe: tr.attr('iframe')});
            } else {
                wkscSMHandler.openLink_smAdaptor({smname: tr.attr('smName'), outparams: tr.attr('smOutParams'), inputparams: tr.attr('value'), newtab: tr.attr('newtab'), iframe: tr.attr('iframe')});
            }
        });



        $("[sm-open-h2oadaptor-combo]").click(function(e) {
            _window_event = e;
            var $target = $(e.currentTarget),
                smName = $target.attr('smName'),
                inputParams = $target.attr('value');
            if(smName === 'ListaMovimentiConto') {
                // inputParams = JSON.stringify({contoID: inputParams, numeroGiorni: 10});
                window.wkscustomer.selectedListanumeroConto = $(e.currentTarget).attr("data-ref-numberconto");
                window.wkscustomer.selectedListacontoId = $(e.currentTarget).attr("data-ref-contoId");
                wkscustomer.selectedContoDesc = $(e.currentTarget).attr("data-ref-contodesc");
                var get13CifeCollection = new wkscustomer.collections.get13Cifre();
                wkscustomer.isNumerato = false ;
                // need if condtion to check for numerato
                /*if(window.wkscustomer.selectedListanumeroConto=='numerato'){*/
                if( window.wkscustomer.selectedListanumeroConto == "numerato"){
                    wkscustomer.isNumerato = true ;
                    $.when(get13CifeCollection.fetch(wkscommerciale.utils.fetchCallback({
                        "idConto":window.wkscustomer.selectedListacontoId,
                    }))).done(function(response){
                        if(_.size(response.data) > 0 && response.status=="success")
                        {
                            window.wkscustomer.selectedListanumeroConto = response.data[0];
                            wkscustomer.openListaMoviementi(e);
                        }
                        else
                        {
                            wkscommerciale.notifyError.pushError("Error Technico");
                        }
                    });
                }
                else {
                    wkscustomer.openListaMoviementi(e);
                }

            } else {
                wkscSMHandler.openLink_smAdaptor({smname: smName, outparams: $target.attr('smOutParams'), inputparams: inputParams, newtab: $target.attr('newtab'), iframe: $target.attr('iframe')});
            }


        });
        wkscommerciale.log.doPushLog(self.options);
        wkscommerciale.profiles.advancedCheckProfile('VisualizzaBolli', function(visualizzaBolli) {
            arrayViewJobs.push('VisualizzaBolli');
            if (visualizzaBolli) {
                $("#visualizzaBolliButton").show();
            }
        }, {logger: self.options.logger});
        wkscommerciale.profiles.advancedCheckProfile('PersCondConsulenza', function(hasGrant) {
            arrayViewJobs.push('PersCondConsulenza');
            var btn = $("#PersonalizzaCondizioniButton");
            if (hasGrant) {
                btn.show();
            } else {
                btn.remove();
            }
        }, {logger: self.options.logger});
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(self.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
/*----------------------------Saldi - Investimenti----------------------------------*/
wkscustomer.views.InvestimentiView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var investimentiData = this.collection.toJSON();
        var arrayViewJobs = [];
        if (investimentiData[0].data.length != 0) {
            var investimentiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/investimenti"));
            var investimentiHTML = investimentiTemplate({
                "investimenti": investimentiData[0].data[0]
            });
            $(this.el).html(investimentiHTML);
        }
        $("#contichiusi").click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr('soggettoid'));
            wkscApp.setTipoConto("2");
            customCardLoader({
                loadType: "slidein",
                cardSize: "size_small",
                cardName: window.wkscustomerContext+"/assets/cards/3.8.1.conti_chiusura_card.html"
            });
            return false;
        });
        var self = this;
        wkscommerciale.log.doPushLog(self.options);
        wkscommerciale.profiles.advancedCheckProfile('consulenzaeinvestimentiButton', function(consulenzaeinvestimentiButtonAuthorized) {
            arrayViewJobs.push('consulenzaeinvestimentiButton');
            if (consulenzaeinvestimentiButtonAuthorized) {
                $("#consulenzaEInvestimentiINVButton").show();
            }
        }, {logger: self.options.logger});
        wkscommerciale.log.doPushLog(self.options);
        wkscommerciale.profiles.advancedCheckProfile('ContoTitoliMoneyfarmButton', function(ContoTitoliMoneyfarmButtonAuthorized) {
            arrayViewJobs.push('ContoTitoliMoneyfarmButton');
            if (ContoTitoliMoneyfarmButtonAuthorized) {
                $("#ContoTitoliMoneyfarmButton").show();
            }
        }, {logger: self.options.logger});
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
            if(hasGrant)
            {
//				Disable Nuova button
                $(this.el).find('#NuovoInvestimentiButton').hide()
                $(this.el).find('.gray_table .operations li a[smname="TitoliOrdiniNTP"]').remove()
            }
        },this ));
        //5053
        if(wkscommerciale.user.data.promotoreBSNew){
            $(this.el).find('#NuovoInvestimentiButton').hide();
        }
        $('td[sm-open-h2oadaptor-investimenti]').click(function(e) {
            _window_event = e;
            var tr = $(e.currentTarget).parent('tr'),
                conto = tr.find('td').first().text().replace(/\s+/g, ' ').trim(),
                contoType = inspectNumeroConto(conto).tipoConto;
            if (contoType === "C7") {
                wkscSMHandler.openLink_smAdaptor({smname: 'ContoInternoResult', outparams: tr.attr('smOutParams'), inputparams: conto, newtab: tr.attr('newtab'), iframe: tr.attr('iframe')});
            } else {
                wkscSMHandler.openLink_smAdaptor({smname: tr.attr('smName'), outparams: tr.attr('smOutParams'), inputparams: tr.attr('value'), newtab: tr.attr('newtab'), iframe: tr.attr('iframe')});
            }
        });



        $("[sm-open-h2oadaptor-combo]").click(function(e) {
            _window_event = e;
            var $target = $(e.currentTarget),
                smName = $target.attr('smName'),
                inputParams = $target.attr('value');
            if(smName === 'ListaMovimentiConto') {
                // inputParams = JSON.stringify({contoID: inputParams, numeroGiorni: 10});
                window.wkscustomer.selectedListanumeroConto = $(e.currentTarget).attr("data-ref-numberconto");
                window.wkscustomer.selectedListacontoId = $(e.currentTarget).attr("data-ref-contoId");
                wkscustomer.selectedContoDesc = $(e.currentTarget).attr("data-ref-contodesc");
                var get13CifeCollection = new wkscustomer.collections.get13Cifre();
                wkscustomer.isNumerato = false ;
                // need if condtion to check for numerato
                /*if(window.wkscustomer.selectedListanumeroConto=='numerato'){*/
                if( window.wkscustomer.selectedListanumeroConto == "numerato"){
                    wkscustomer.isNumerato = true ;
                    $.when(get13CifeCollection.fetch(wkscommerciale.utils.fetchCallback({
                        "idConto":window.wkscustomer.selectedListacontoId,
                    }))).done(function(response){
                        if(_.size(response.data) > 0 && response.status=="success")
                        {
                            window.wkscustomer.selectedListanumeroConto = response.data[0];
                            wkscustomer.openListaMoviementi(e);
                        }
                        else
                        {
                            wkscommerciale.notifyError.pushError("Error Technico");
                        }
                    });
                }
                else {
                    wkscustomer.openListaMoviementi(e);
                }

            } else {
                wkscSMHandler.openLink_smAdaptor({smname: smName, outparams: $target.attr('smOutParams'), inputparams: inputParams, newtab: $target.attr('newtab'), iframe: $target.attr('iframe')});
            }


        });
        wkscommerciale.log.doPushLog(self.options);
        wkscommerciale.profiles.advancedCheckProfile('VisualizzaBolli', function(visualizzaBolli) {
            arrayViewJobs.push('VisualizzaBolli');
            if (visualizzaBolli) {
                $("#visualizzaBolliButton").show();
            }
        }, {logger: self.options.logger});
        wkscommerciale.profiles.advancedCheckProfile('PersCondConsulenza', function(hasGrant) {
            arrayViewJobs.push('PersCondConsulenza');
            var btn = $("#PersonalizzaCondizioniButton");
            if (hasGrant) {
                btn.show();
            } else {
                btn.remove();
            }
        }, {logger: self.options.logger});
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(self.options);
        $(this.el).append('<section id="investimenti_gestioni_patrimoniali"></section>');
        //6092
        wkscustomer.collections.gestionePatrimoniale = Backbone.Collection.extend({
            url: window.wkscustomerContext+'/service/customers/gestioniPatrimoniali?soggettoId='+wkscommerciale.idSoggetto.get()
        });

        var gestionePatrimonialeCollection = new wkscustomer.collections.gestionePatrimoniale();
        gestionePatrimonialeCollection.fetch({
            success: function () {
                var gestionePatrimoniale = new wkscustomer.views.GestionePatrimoniale({
                    el: $("#investimenti_gestioni_patrimoniali"),
                    collection: gestionePatrimonialeCollection,
                    logger: self.options.logger
                });
                $(window).trigger("cardmaster:loaded", this.$el);
                $(window).trigger("scrollbar:activate", $(".active"));
                $(window).trigger("scrollbar:resize", $(".active"));
            }
        });


    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
/*----------------------------Saldi - Investimenti - gestione_patrimoniale - ElencoMandatiGPDistribuzione - 6092----------------------------------*/
wkscustomer.views.GestionePatrimoniale = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        this.render();

    },
    onClose: function() {
        this.collection.off("change", this.render);
    },

    render: function() {
        var investimentiData = this.collection.toJSON();
        var mandatiList = investimentiData[0].data[0].ElencoMandatiGPDistribuzione.mandatiList;
        var mandatiOp = investimentiData[0].data[1];
        if (investimentiData[0].data.length != 0) {
            if(investimentiData[0].data.length != 1 && mandatiOp.isMenuDispatcherGPDist === "true" && mandatiOp.isGPView === "true"){
                var GestionePatrTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/investimentiGP"));
                var GestionePatrHTML = GestionePatrTemplate({
                    "investimenti": mandatiList
                });
                $(this.el).html(GestionePatrHTML);
                $(this.el).wkscspinner('remove');
            }else{
                $("#investimenti_gestioni_patrimoniali").hide();
            }
            //open new card
            $("#contichiusigp").click(function(e) {
                customCardLoader({
                    loadType: "slidein",
                    cardSize: "size_big",
                    cardName: window.wkscustomerContext+"/assets/cards/3.7.2.investimenti_GP_not_operativo.html"
                });
                return false;
            });
            $('td[sm-open-h2oadaptor-investimentiGP]').click(function(e) {
                _window_event = e;
                var tr = $(e.currentTarget).parent('tr');
                var statemachinevar = tr.attr('sm-open-statemachine');
                var codiceMandatovar = tr.attr('sm-open-codiceMandato');
                var tipoMandatovar = tr.attr('sm-open-tipoMandato');
                wkscSMHandler.openLink_smAdaptor({smname: 'MenuDispatcherGPDist', outparams:tr.attr('smOutParams'), inputparams:JSON.stringify({statemachine: statemachinevar,codiceMandato: codiceMandatovar,tipoMandato:tipoMandatovar}), newtab: tr.attr('newtab'), iframe: tr.attr('iframe')});
            }); //PORTAHC-6532
            $("[sm-open-h2oadaptor-combo-GP]").click(function(e) {
                _window_event = e;
                var $target = $(e.currentTarget),
                    smName = $target.attr('smName'),
                    inputParams = $target.attr('value');
                    wkscSMHandler.openLink_smAdaptor({smname: smName, outparams: $target.attr('smOutParams'), inputparams: inputParams, newtab: $target.attr('newtab'), iframe: $target.attr('iframe')});
            });
            $('#dropdown[data-acts-as-select]').each(function(i, e) {
                var propagate = !!$(e).is('[data-propagate]'),
                        input = $('input[type="hidden"]', $(e)),
                        cselect = $(e);

                if (input.get(0) && input.val() && input.val() != "") {
                    var elem = $('*[data-value="' + input.val() + '"]', $(e)).eq(0);
                    self.try_update_target.call(elem, e);
                }

                $(e).on(Ui.clickHandler, function(evt) {

                    if($(e).hasClass("js-ie-z-index-fix-on-select") && isIE()) {
                        var scroll_to = $("[data-scrollbar-loaded] .overview").css("top").replace("px", "");
                        scroll_to = Math.abs(parseInt(scroll_to, 10)) + 1;
                        $("[data-scrollbar-loaded]").tinyscrollbar_update(scroll_to)
                    }

                	if($(this).parents('.filter').hasClass('filter-disabled')) {
                        evt.stopPropagation();
                        return;
                    }
                	if ($("ul",$(this)).css("display") == "block" || $("[data-open-this]",$(this)).css("display") == "block")
                	{
                		$(this).removeClass('selected');
                        $('ul', $(this)).hide();
                        $(this).css({'z-index': '0', 'margin-bottom': '0'});
                	}
                	else
                	{
        	            $("ul", $(this)).hide();
        	            $($('ul[data-open-this]', $(this)).get(0) || $(this).find('a[data-val=\"' + $(this).children('span').attr('data-val') + '\"]').parent('li').parent('ul').get(0) || $('ul', $(this)).get(0)).show();
        	            $(this).addClass('selected');
        	            $(this).css({'z-index': '100'});

        	            if ($(this).attr('data-last-select')) {
        	            	$('[data-scrollbar-loaded]').tinyscrollbar_update('relative');
        	                $(this).css({'margin-bottom': $('ul', $(this)).height() + 'px'});
        	                if (!Modernizr.touch) {
        	                    $(window).trigger('scrollbar:resize', 'bottom');
        	                }
        	            }

        	            $(window).not($(this)).one('click', function() {
        	                $(this).removeClass('selected');
        	                $('ul', $(this)).hide();
        	                $(this).css({'z-index': '0', 'margin-bottom': '0'});
        	            });
        	            var heightNeeded = $(e).position().top+$(e).contents("ul").outerHeight()+39;
        	            if (heightNeeded>$($(".active").find(".overview")).outerHeight())
        	            {
        	            	$(window).trigger('scrollbar:resize', "relative");
        	            }
                	}

                    if (!propagate) {
                        evt.stopPropagation();
                        evt.stopImmediatePropagation();
                    }
                    $('[data-scrollbar-loaded]').tinyscrollbar_update('relative');
                });

                $('ul', $(e)).on(Ui.clickHandler, 'a', function(evt) {
                    var submenu = $('ul[data-menu-name="' + $(this).parent().attr('data-load') + '"]', $(e));

                    if (submenu.get(0)) {
                        $('ul', $(e)).hide();
                        submenu.show();
                        }
                    $('input[type="hidden"]', $(e)).val($(this).attr('data-value') || $(this).text());

                    if (!propagate) {
                        return false;
                    }
                });
            });
        }
    }
});

/*----------------------------Saldi - Investimenti - gestione_patrimoniale - ElencoMandatiGPDistribuzione - Not Operativi 6092----------------------------------*/
wkscustomer.views.GestionePatrimonialeNotOperativi= wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        this.render();

    },
    onClose: function() {
        this.collection.off("change", this.render);
    },

    render: function() {
        var investimentiData = this.collection.toJSON();
        var mandatiList = investimentiData[0].data[0].ElencoMandatiGPDistribuzione.mandatiList;
        var mandatiOp = investimentiData[0].data[1];
        if (investimentiData[0].data.length != 0) {
            if(investimentiData[0].data.length != 1 && mandatiOp.isMenuDispatcherGPDist === "true" && mandatiOp.isGPView === "true"){
                var GestionePatrTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/investimentiGP2"));
                var GestionePatrHTML = GestionePatrTemplate({
                    "investimenti": mandatiList
                });
                $(this.el).html(GestionePatrHTML);
                $(this.el).wkscspinner('remove');
            }else{
                $("#investimenti_investimentiGP2").hide();
            }
            $('td[sm-open-h2oadaptor-investimentiGP]').click(function(e) {
                _window_event = e;
                var tr = $(e.currentTarget).parent('tr');
                var statemachinevar = tr.attr('sm-open-statemachine');
                var codiceMandatovar = tr.attr('sm-open-codiceMandato');
                var tipoMandatovar = tr.attr('sm-open-tipoMandato');
                wkscSMHandler.openLink_smAdaptor({smname: 'MenuDispatcherGPDist', outparams:tr.attr('smOutParams'), inputparams:JSON.stringify({statemachine: statemachinevar,codiceMandato: codiceMandatovar,tipoMandato:tipoMandatovar}), newtab: tr.attr('newtab'), iframe: tr.attr('iframe')});
            });
        }
    }
});
/*----------------------------Saldi - Previdenza----------------------------------*/
wkscustomer.views.PrevidenzaView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var previdenzaData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(previdenzaData[0].message);
        if (previdenzaData[0].data.length !== 0) {
            var previdenzaTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/previdenza"));
            var conto = null;
            if (previdenzaData[0].data[0].tBody.length > 0) {
                var numero_conto = previdenzaData[0].data[0].tBody[0].tRow[0].replace(/\s+/g, ' ');
                if (numero_conto.length > 11) {
                    conto = numero_conto.substring(2);
                }
                else {
                    conto = numero_conto;
                }
            }
            var previdenzaHTML = previdenzaTemplate({
                "previdenza": previdenzaData[0].data[0],
                "numero_conto": conto
            });
            $(this.el).html(previdenzaHTML);
        }
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
            if(hasGrant)
            {
//				Disable Nuova button
                $(this.el).find('div .button').hide();
//				Disable Operazioni combo
                $(this.el).find('.gray_table th').last().hide();
                $(this.el).find('.gray_table .operations').hide();
            }
        },this ));

        //5056
        if(wkscommerciale.user.data.promotoreBSNew){
            $(this.el).find('div .button').hide();
        }


        $("[sm-open-h2oadaptor-combo]").click(function(e) {
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
        });
        $("#contichiusi").click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr('soggettoid'));
            wkscApp.setTipoConto("3");
            customCardLoader({
                loadType: "slidein",
                cardSize: "size_small",
                cardName: window.wkscustomerContext+"/assets/cards/3.8.1.conti_chiusura_card.html"
            });
            return false;
        });
        var self = this;
        wkscommerciale.ajaxRequests.load("service/profile/check/consulenzaeinvestimentiButton", [], function(result) {
            var _parsedResponse = result;
            if (_parsedResponse.data[0].authorize) {
                //$(self.el).append($("<a class='button_with_symbol' id='consulenzaEInvestimento' data-val='" + wkscommerciale.idSoggetto.get() + "' data-symbol='N' href='#'>Consulenza e investimenti</a>"));
                $(self.el).append($("<a class='big_button two_lines hand_pinter' smName='CRCS_MenuLayout' smOutParams='' value='" + wkscommerciale.idSoggetto.get() + "' newtab='1' iframe='1' sm-open-encrypted id='consulenzaEInvestimento' href='#' data-icon='N' data-val='" + wkscommerciale.idSoggetto.get() + "' data-hidden>Consulenza e investimenti</a>"));
                //var _smname = "CRCS_MenuLayout";
                // openMenuLayoutWithEncryptedParam(wkscommerciale.idSoggetto.get(), _smname, "#consulenzaEInvestimento");
            }
        });
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
/*----------------------------Carte Scadute----------------------------------*/
wkscustomer.views.CarteScaduteView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var carteScaduteData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(carteScaduteData[0].message);
        if (carteScaduteData[0].data.length !== 0) {
            var carteScaduteTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/carte_scadute"));
            var carteScaduteHTML = carteScaduteTemplate({
                "carteScadute": carteScaduteData[0].data[0]
            });
            $(this.el).html(carteScaduteHTML);
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
/*----------------------------Conti Chiusi----------------------------------*/
wkscustomer.views.ContiChiusiView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get(),
            accountType: wkscApp.getTipoConto()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var contiChiusiData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(contiChiusiData[0].message);
        if (contiChiusiData[0].data.length != 0) {
            var contiChiusiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_chiusi"));
            var contiChiusiHTML = contiChiusiTemplate({
                "contiChiusi": contiChiusiData[0].data[0]
            });
            $(this.el).html(contiChiusiHTML);
        }
        $('td[sm-open-h2oadaptor-contichuisi]').click(function(e) {
            _window_event = e;
            var tr = $(e.currentTarget).parent('tr'),
                conto = tr.find('td').first().text().replace(/\s+/g, ' ').trim(),
                contoType = inspectNumeroConto(conto).tipoConto;
            if (contoType === "C7") {
                wkscSMHandler.openLink_smAdaptor({smname: 'ContoInternoResult', outparams: tr.attr('smOutParams'), inputparams: conto, newtab: tr.attr('newtab'), iframe: tr.attr('iframe')});
                //return false;
            }
            else {
                if(contoType!="G3"){
                    wkscSMHandler.openLink_smAdaptor({smname: tr.attr('smName'), outparams: tr.attr('smOutParams'), inputparams: tr.attr('value'), newtab: tr.attr('newtab'), iframe: tr.attr('iframe')});
                    //return false;
                }
            }
        });
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
            if(hasGrant) {
                $(this.el).find('.gray_table th').last().hide();
                $(this.el).find('.gray_table .operations').hide();
            }
        }, this));
        $("[sm-open-h2oadaptor-conticchiusi]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            var $target = $(e.currentTarget),
                smName = $target.attr('smName'),
                inputParams = $target.attr('value');
            if(smName === 'ListaMovimentiConto') {
                // inputParams = JSON.stringify({contoID: inputParams, numeroGiorni: 10});
                window.wkscustomer.selectedListanumeroConto = $(e.currentTarget).attr("data-ref-numberconto");
                window.wkscustomer.selectedListacontoId = $(e.currentTarget).attr("data-ref-contoId");
                wkscustomer.selectedContoDesc = $(e.currentTarget).attr("data-ref-contodesc");
                var get13CifeCollection = new wkscustomer.collections.get13Cifre();

                wkscustomer.isNumerato = false;
                if( window.wkscustomer.selectedListanumeroConto == "numerato"){
                    wkscustomer.isNumerato = true;
                    $.when(get13CifeCollection.fetch(wkscommerciale.utils.fetchCallback({
                        "idConto":window.wkscustomer.selectedListacontoId,
                    }))).done(function(response){
                        if(_.size(response.data) > 0 && response.status=="success")
                        {
                            window.wkscustomer.selectedListanumeroConto = response.data[0];
                            wkscustomer.openListaMoviementi(e);
                        }
                        else
                        {
                            wkscommerciale.notifyError.pushError("Error Technico");
                        }
                    });
                }
                else {
                    wkscustomer.openListaMoviementi(e);
                }


            } else {
                wkscSMHandler.openLink_smAdaptor({smname: smName, outparams: $target.attr('smOutParams'), inputparams: inputParams, newtab: $target.attr('newtab'), iframe: $target.attr('iframe')});
            }
            return false;
        });
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
/*----------------------------Condizioni View----------------------------------*/
wkscustomer.views.CondizioniView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var condizioniData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(condizioniData[0].message);
        var condizioniTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/condizioni/condizioni"));
        if (condizioniData[0].data.length != 0) {
            $(this.el).html(condizioniTemplate({
                "condizioni": condizioniData[0].data,
                "showDefault": false
            }));
        }
        else {
            $(this.el).html(condizioniTemplate({
                "condizioni": condizioniData[0].data,
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
/*----------------------------Conti Interni View----------------------------------*/
wkscustomer.views.ContiInterniView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
        this.collection.on('reset', this.render, this);
        var $this= this;
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var contiInterniData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(contiInterniData[0].message);
        if (contiInterniData[0].data.length != 0) {
            var contiInterniTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_interni"));
            var contiInterniHTML = contiInterniTemplate({
                "contiInterni": contiInterniData[0].data[0]
            });
            $(this.el).html(contiInterniHTML);
            //PORTACH-1105: Below code handles the disabling and activating the nuovo button on that card.
            //var nuovoButton = $('div#contiInterniNuovo');
            // The nuovo button is enabled only if the user has profile to see the SM ApriConto or AperturaContieDepositi
            //if (contiInterniData[0].data[0].isApriConto || contiInterniData[0].data[0].isContoBancheAvailable) {
            //nuovoButton.removeClass('disabled').attr('data-acts-as-select', '');
            /*}
             else {
             nuovoButton.addClass('disabled').removeAttr('data-acts-as-select').css('cursor', 'default');
             }*/
        }
        $("li a[sm-open-h2oadaptor-newtab-contiinternicombo]").click(function(e) {
            _window_event = e;
            var $target = $(e.currentTarget),
                smName = $target.attr('smName'),
                inputParams = $target.attr('value');
            if(smName === 'ListaMovimentiConto') {
                // inputParams = JSON.stringify({contoID: inputParams, numeroGiorni: 10});
                window.wkscustomer.selectedListanumeroConto = $(e.currentTarget).attr("data-ref-numberconto");
                window.wkscustomer.selectedListacontoId = $(e.currentTarget).attr("data-ref-contoId");
                wkscustomer.selectedContoDesc = $(e.currentTarget).attr("data-ref-contodesc");
                var get13CifeCollection = new wkscustomer.collections.get13Cifre();

                wkscustomer.isNumerato = false;
                if( window.wkscustomer.selectedListanumeroConto == "numerato"){
                    wkscustomer.isNumerato = true;
                    $.when(get13CifeCollection.fetch(wkscommerciale.utils.fetchCallback({
                        "idConto":window.wkscustomer.selectedListacontoId,
                    }))).done(function(response){
                        if(_.size(response.data) > 0 && response.status=="success")
                        {
                            window.wkscustomer.selectedListanumeroConto = response.data[0];
                            wkscustomer.openListaMoviementi(e);
                        }
                        else
                        {
                            wkscommerciale.notifyError.pushError("Error Technico");
                        }
                    });
                }
                else {
                    wkscustomer.openListaMoviementi(e);
                }

            } else {
                wkscSMHandler.openLink_smAdaptor({smname: smName, outparams: $target.attr('smOutParams'), inputparams: inputParams, newtab: $target.attr('newtab'), iframe: $target.attr('iframe')});
            }
            //4754
            /*if(smName === 'PFChisuraB9HomePage') {
             //inputParams = JSON.stringify({ID_CONTO_B9: inputParams});
             inputParams = JSON.stringify(inputParams);
             }*/
            //
        });
        $("a[sm-open-h2oadaptor-internicombo]").click(function(e) {
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
        });
        $("#contiinternichiusi").click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr('soggettoid'));
            wkscApp.setTipoConto("05");
            customCardLoader({
                loadType: "slidein",
                cardSize: "size_small",
                cardName: window.wkscustomerContext+"/assets/cards/3.8.1.conti_chiusura_card.html"
            });
            return false;
        });
        $(this.el).wkscspinner('remove');
        $(window).trigger('cardmaster:loaded', this.$el);
        $(window).trigger('scrollbar:resize', 'relative');
        wkscommerciale.log.doPopLog(this.options);

    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    },
    refresh: function(){
        $("#conti_interni_conti_interni .gray_table").wkscspinner({
            css: 'large'
        });
        wkscustomer.collections.contiInterniList.fetch(wkscommerciale.utils.fetchCallback({soggettoId: wkscommerciale.idSoggetto.get()}));
    }
});
wkscustomer.views.MutuiEPrestitiView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        this.idSoggetto = options.idSoggetto;
        this.tipoSoggetto = options.tipoSoggetto;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: this.idSoggetto
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var mutuiEPrestitiData = this.collection.toJSON();
        //$this=this;
        // wkscommerciale.notifyError.pushError(mutuiEPrestitiData[0].message);
        if (mutuiEPrestitiData[0].data.length != 0) {
            var mutuiEPrestitiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/mutui/mutui_e_prestiti"));
            var mutuiEPrestitiHTML = mutuiEPrestitiTemplate({
                "mutuiEPrestiti": mutuiEPrestitiData[0].data[0],
                'tipoSoggetto': this.tipoSoggetto,
                'idSoggetto': this.idSoggetto
            });
            $(this.el).html(mutuiEPrestitiHTML);
            // initiate h2o operation checks only when an item available
            if(mutuiEPrestitiData[0].data[0].tBody.length > 0) {
                // check h2o operation grant
                wkscommerciale.profiles.checkProfile('AF_HOMEPAGE', _.bind(function (hasGrant) {
                    var hpcAFLinkElem = this.$('.afHomepageOpLink');
                    if(hasGrant) {
                        hpcAFLinkElem.show();
                    } else {
                        hpcAFLinkElem.remove();
                    }
                }, this));
                wkscommerciale.profiles.checkProfile('AF_NUOVAANTICIPO', _.bind(function (hasGrant) {
                    var afNuovoAnticipoLinkElem = this.$('.afNuovaAnticipoOpLink');
                    if(hasGrant) {
                        afNuovoAnticipoLinkElem.show();
                    } else {
                        afNuovoAnticipoLinkElem.remove();
                    }
                }, this));
            }
        }
        /* SP41/PORTAHC-1945: Implementation Starts */
        wkscommerciale.profiles.checkProfile('AperturaContoE8', _.bind(function(AperturaContoE8Authorized) {
            if(AperturaContoE8Authorized){
                var listItem = $('<li><a href="#" smName="AperturaContoE8" smOutParams="" value="'+wkscommerciale.idSoggetto.get()+'" newtab="1" iframe="1" sm-open-h2oadaptor-combo style="cursor:pointer">E8 - Chiusura piccoli saldi debitori</a></li>');
                this.$('div.button_select ul').append(listItem);
                listItem.click(function(e){
                    _window_event = e;
                    wkscSMHandler.openLink_smAdaptor({smname: "AperturaContoE8", outparams: "", inputparams: wkscommerciale.idSoggetto.get(), newtab: "1", iframe: "1"});
                });
            }
        }, this));
        /* SP41/PORTAHC-1945: Implementation Ends */
        $("[sm-open-h2oadaptor-combo]").click(function(e) {
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
        });
        $("#contichiusi").click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr('soggettoid'));
            wkscApp.setTipoConto("4");
            customCardLoader({
                loadType: "slidein",
                cardSize: "size_small",
                cardName: window.wkscustomerContext+"/assets/cards/3.8.1.conti_chiusura_card.html"
            });
            return false;
        });
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
            if(hasGrant) {
                $(this.el).find('div.button_select').hide()
                $(this.el).find('.gray_table .operations ').hide()
            }
        }, this));
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
        $(window).trigger('scrollbar:resize', 'relative');
        //LISTA MOVIMENT
        $("[sm-open-h2oadaptor-combo-g9listaMoviment]").click(function(e) {
            _window_event = e;
            var $target = $(e.currentTarget),
                smName = $target.attr('smName'),
                inputParams = $target.attr('value');
            if(smName === 'ListaMovimentiConto') {
                window.wkscustomer.selectedListanumeroConto = $(e.currentTarget).attr("data-ref-numberconto");
                window.wkscustomer.selectedListacontoId = $(e.currentTarget).attr("data-ref-contoId");
                wkscustomer.selectedContoDesc = $(e.currentTarget).attr("data-ref-contodesc");
                var get13CifeCollection = new wkscustomer.collections.get13Cifre();
                wkscustomer.isNumerato = false ;
                if( window.wkscustomer.selectedListanumeroConto == "numerato"){
                    wkscustomer.isNumerato = true ;
                    $.when(get13CifeCollection.fetch(wkscommerciale.utils.fetchCallback({
                        "idConto":window.wkscustomer.selectedListacontoId,
                    }))).done(function(response){
                        if(_.size(response.data) > 0 && response.status=="success")
                        {
                            window.wkscustomer.selectedListanumeroConto = response.data[0];
                            wkscustomer.openListaMoviementi(e);
                        }
                        else
                        {
                            wkscommerciale.notifyError.pushError("Error Technico");
                        }
                    });
                }
                else {
                    wkscustomer.openListaMoviementi(e);
                }

            } else {
                wkscSMHandler.openLink_smAdaptor({smname: smName, outparams: $target.attr('smOutParams'), inputparams: inputParams, newtab: $target.attr('newtab'), iframe: $target.attr('iframe')});
            }
        });
    },
    onClose: function() {
        this.collection.off("change", this.render);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
wkscustomer.views.CodiciBloccatiView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var codiciBloccatiData = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(codiciBloccatiData[0].message);
        var codiciBloccatiTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/codici_bloccati"));
        if (codiciBloccatiData[0].data.length != 0)
        {
            if (codiciBloccatiData[0].data[0].isAuthorized)
            {
                var codiciBloccatiHTML = codiciBloccatiTemplate({
                    "codiciBloccati": codiciBloccatiData[0].data,
                    "isFDAltraBanca" : wkscommerciale.arrayHelper.searchObject(codiciBloccatiData[0].data, [{key: 'valore', val: 'REVOKE_ALTRA_BANCA'}], false) > -1
                });
            }
            else
            {
                var codiciBloccatiHTML = codiciBloccatiTemplate({
                    "codiciBloccati": [],
                    "isFDAltraBanca" : false
                });
            }
        }
        else
        {
            var codiciBloccatiHTML = codiciBloccatiTemplate({
                "codiciBloccati": [],
                "isFDAltraBanca" : false
            });
        }
        $(this.el).html(codiciBloccatiHTML);
        wkscommerciale.log.doPopLog(this.options);
        $(this.el).wkscspinner('remove');
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
wkscustomer.views.InformazioniAggiuntiveAction = Backbone.View.extend({
    el: $("#additional_information_family_footer"),
    initialize: function(options) {
        this.options = options;
        this.soggettoId = options.soggettoId;
        this.prospectId = options.prospectId;
    },
    events: {
        "click #saveQuestionario": "onSalvaClick"
    },
    infortuniAttivitaDetail:{},
    getInfortuniAttivitaDetail:function(callback){
        var $this = this,response;
        wkscommerciale.ajaxRequests.get({
            url: contextUrls["wksactivities"]+"/service/attivita/infortuniAttivitaDetail",
            params: "",
            onSuccess: function(resp) {
                $this.infortuniAttivitaDetail=resp;
                callback();
            },
            onError: function() {
            },
            spinnerContainer: "",
            spinnerClass: ""
        });
    },
    createNewAttivita:function(data,callback) {
        var $this=this;
        var cdrcode = "",
            tipoCdrCode = "";
        if ($this.infortuniAttivitaDetail && $this.infortuniAttivitaDetail.data.length > 0) {
            var resp = $this.infortuniAttivitaDetail;
            if (wkscApp.getUserType() === "UFFINTERNA") {
                cdrcode = wkscApp.getCdrCode();
                tipoCdrCode = "UFFINTERNO";
            }
            else if (wkscApp.getUserType() === "SUCCURSALE") {
                cdrcode = wkscApp.getBranchCode();
                tipoCdrCode = "SUCCURSALE";
            }
            var params = {
                'prospectId': '',
                'soggettoId': this.soggettoId,
                'abiBanca': wkscApp.getAbiCode(),
                'managerId': '',
                'attivitaIdNew': resp.data[0].attivitaIdNew,
                'servizioId': resp.data[0].servizioId,
                'esitoId': resp.data[0].esitoId,
                'priority': resp.data[0].priority,
                'idNotaTipo': resp.data[0].idNotaTipo,
                'notaDesc': data.emptyLabelTxt + " " + data.emptyInputVal,
                'tipoCliente': '',
                'nome': '',
                'cogNome': '',
                'codiceFiscale': '',
                'dataDiNascita': '',
                'ragioneSociale': '',
                'partitaIva': '',
                'costituzione': '',
                'referente': '',
                'showScadenza': resp.data[0].showScadenza,
                'scadenzaDate': data.scadanzaDate,
                'canaleCode': 'SUCCURSALE',
                'tipoCdrCode': tipoCdrCode,
                'cdrCode': cdrcode.toUpperCase(),
                'channel': logChannel,
                'responsible': '',
                'modalitaDiContatto': resp.data[0].modalitaDiContatto
            };
            var contesto = wkscApp.webcontext();
            if (params !== "") {
                wkscommerciale.ajaxRequests.post({
                    url: contesto + '/SSRCrm2AttivitaInserisciServlet',
                    params: params,
                    dataType: 'text',
                    onSuccess: _.bind(function(data) {
                        callback(data);
                    }, this),
                    onError: _.bind(function(evt) {
                        wkscommerciale.notifyError.pushFromFetchError(evt, []);
                    }, this)
                });
                /*$.post(contesto + '/SSRCrm2AttivitaInserisciServlet', params, function(data) {
                 callback(data);
                 }).error(function(evt) {
                 wkscommerciale.notifyError.pushFromFetchError(evt, []);
                 });*/
            }
        }
        else{
            $this.getInfortuniAttivitaDetail(function(){
                $this.createNewAttivita(resp, data, callback);
            });
        }
    },
    validateAndSubmit: function() {
        // PORTAHC-3426
        var isLiteCustomer = $.trim($('.active').parents('#container').find('.isLiteCustomerCache[data-id="' + this.soggettoId + '"]').eq(0).text()) === 'true';
        var gridSection = ($('section[sectionid="IADCOPASSI"]').length>0)?$('section[sectionid="IADCOPASSI"]'):$('section[sectionid="IADCOPSPT"]'),
            gridRow = gridSection.find('tbody tr'),
            gridRowLength = gridSection.find('tbody tr').length,
            $this = this,
            $rowsCheck = [],
            count = 1,
            attivitaCallCount = 1,
            emptyTextRowsLength = gridSection.find('td[colType="Text"] div.hidden[data-val=""]').length,
            emptyDateRowsLength = (gridSection.find('td[colType="date"]').length > 0) ? gridSection.find('td[colType="date"] div.hidden[data-val=""]').length : gridSection.find('td[colType="Date"] div.hidden[data-val=""]').length;
        emptyRows = (emptyTextRowsLength === emptyDateRowsLength) ? emptyDateRowsLength : (emptyTextRowsLength > emptyDateRowsLength) ? emptyTextRowsLength - (emptyTextRowsLength - emptyDateRowsLength) : emptyDateRowsLength - (emptyDateRowsLength - emptyTextRowsLength),
            allDescText = gridSection.find('td[colType="Text"] input[type="Text"]'),
            emptyTextCount = 0;
        // Finding count of empty rows
        $.each(allDescText, function(txtBx, input) {
            if ($(input).val().trim().length === 0) {
                emptyTextCount += 1;
            }
        });
        $.each(gridRow, function(r, row) {
            var inputCol = $(row).find('td[colType="Text"]'),
                dateCol = ($(row).find('td[colType="date"]').length > 0) ? $(row).find('td[colType="date"]') : $(row).find('td[colType="Date"]'),
                hiddenDesc = $(inputCol).find('div.hidden').attr('data-val').trim(),
                hiddenDate = $(dateCol).find('div.hidden').attr('data-val').trim();
            // Find empty rows
            if (hiddenDesc === "" && hiddenDate === "") {
                var emptyInputCol = $(row).find('td[colType="Text"]'),
                    emptyDateCol = ($(row).find('td[colType="date"]').length > 0) ? $(row).find('td[colType="date"]') : $(row).find('td[colType="Date"]'),
                    emptyLabelCol = $(row).find('td[colType="Label"]'),
                    emptyLabelTxt = $(emptyLabelCol).find('label').text(),
                    emptyInputVal = $(emptyInputCol).find('input[type="Text"]').val().trim(),
                    emptyHiddenInputVal = $(emptyInputCol).find('div.hidden').attr('data-val'),
                    emptyDate = $(emptyDateCol).find('input[type="text"]').val().trim(),
                    emptyHiddenDate = $(emptyDateCol).find('div.hidden').attr('data-val'),
                    hasDescChanged = (emptyInputVal === emptyHiddenInputVal) ? false : true,
                    hasDateChanged = (emptyDate === emptyHiddenDate) ? false : true,
                    scadanzaDate;
                // Had the empty row been modified?
                if (hasDescChanged || hasDateChanged) {
                    // If modified and both desc and date is not empty
                    if (emptyInputVal !== "" && emptyDate !== "") {
                        var duedate = formatTheDate(new Date(convertStringToUTC(emptyDate)).addDays(-7));
                        var dateDiff = findDateDiff(formatTheDate(), duedate);
                        // The date should be +7 days from selected date
                        if (dateDiff < -7) {
                            $rowsCheck.push('false');
                            $.jPopOut.alert('simple', {
                                messageType: 'warning',
                                message: "attenzione! la data di scadenza è già stata superata"
                            });
                        } else {
                            if (dateDiff < 0 && dateDiff >= -7) {
                                duedate = formatTheDate();
                            }
                            $rowsCheck.push('true');
                            scadanzaDate = duedate;
                            // PORTAHC-3426
                            if( ! isLiteCustomer) {
                                $this.createNewAttivita({'emptyLabelTxt':emptyLabelTxt,'emptyInputVal':emptyInputVal,'scadanzaDate':scadanzaDate},function(data){
                                    $(emptyInputCol).find('div.hidden').attr('data-val', emptyInputVal);
                                    $(emptyDateCol).find('div.hidden').attr('data-val', emptyDate);
                                    if (attivitaCallCount === (emptyRows - emptyTextCount)) {
                                        responseStatus(data, '', '', "", wkscustomer.views.informazioniaggiuntiveAction);
                                    }
                                    else {
                                        attivitaCallCount += 1;
                                    }
                                });
                            } else {
                                if (attivitaCallCount !== (emptyRows - emptyTextCount)) {
                                    attivitaCallCount += 1;
                                }
                            }
                            /*if (wkscApp.getTipoQuestionario() === "Private") {
                             if($this.infortuniAttivitaDetail.data){
                             $this.createNewAttivita({'emptyLabelTxt':emptyLabelTxt,'emptyInputVal':emptyInputVal,'scadanzaDate':scadanzaDate},function(data){
                             $(emptyInputCol).find('input[type="hidden"]').val(emptyInputVal);
                             $(emptyDateCol).find('input[type="hidden"]').val(emptyDate);
                             if (attivitaCallCount === (emptyRows - emptyTextCount)) {
                             responseStatus(data, '', '', "", wkscustomer.views.informazioniaggiuntiveAction);
                             }
                             else {
                             attivitaCallCount += 1;
                             }
                             });
                             }
                             else{
                             $this.getInfortuniAttivitaDetail(function(){
                             $this.createNewAttivita({'emptyLabelTxt':emptyLabelTxt,'emptyInputVal':emptyInputVal,'scadanzaDate':scadanzaDate},function(data){
                             $(emptyInputCol).find('input[type="hidden"]').val(emptyInputVal);
                             $(emptyDateCol).find('input[type="hidden"]').val(emptyDate);
                             if (attivitaCallCount === (emptyRows - emptyTextCount)) {
                             responseStatus(data, '', '', "", wkscustomer.views.informazioniaggiuntiveAction);
                             }
                             else {
                             attivitaCallCount += 1;
                             }
                             });
                             });
                             }
                             }*/
                        }
                    }
                    // If desc is empty and date is not empty alert the user
                    else if (emptyInputVal === "" && emptyDate !== "") {
                        $rowsCheck.push('false');
                        $.jPopOut.alert('simple', {
                            messageType: 'warning',
                            message: emptyLabelTxt + " inserire la descrizione."
                        });
                    }
                    // If the date is empty and desc is not empty alert the user.
                    else if (emptyInputVal !== "" && emptyDate === "") {
                        $rowsCheck.push('false');
                        $.jPopOut.alert('simple', {
                            messageType: 'warning',
                            message: emptyLabelTxt + " inserire la data."
                        });
                    }
                }
                // What to be done, if the empty rows are not modified.
                else {
                    $rowsCheck.push('true');
                }
            }
            // What to be done if there are no empty rows on grid.
            else {
                $rowsCheck.push('true');
            }
            // A code snippet to find the end of loop to ensure that all the rows has been scanned
            if (count === gridRowLength) {
                // function isAllValueSame returns boolean after checking the values inside the array. Is all same TRUE else FALSE
                var isReady = isAllValueSame($rowsCheck, gridRowLength);
                // If all the values on array are same, means all the validations are done and the form is to be saved.
                // inside the condition call save form method.
                if (isReady) {
                    $this.saveInformazioniAggiuntive();
                }
            }
            else {
                count += 1;
            }
        });
    },
    onSalvaClick: function() {
        var $this=this;
        this.getInfortuniAttivitaDetail(function(){
            if(wkscommerciale.customer.tipoSoggetto === 'Azienda') {
                // no need to create activities because of PORTAHC-3220
                // so skip validation and directly save questionario
                $this.saveInformazioniAggiuntive();
            } else {
                $this.validateAndSubmit();
            }
        });
    },
    saveInformazioniAggiuntive: function() {
        var informazioniAggiuntiveDetailsObj = JSON.stringify(wkscApp.getValues('informazioniAggiuntiveDetails'))
        var domanda = $("#additional_information").find("section");
        var domande = [];
        var flow;
        var list;
        var grid;
        var cascade;
        var $this = this;
        $('#saveQuestionario').attr("disabled", true);
        $.each(domanda, function(i, item) {
            var idSoggetto = $this.soggettoId;
            var sectionId = $(item).attr('sectionId');
            var component;
            var components = [];
            var secUI;
            var secUIList = [];
            if ($(item).attr('layout') == "Flow") {
                var radioBtns = $(item).find('div').children('fieldset').find('input');
                $.each(radioBtns, function(i, input) {
                    var selected;
                    if ($(input).is(':checked')) {
                        selected = 1;
                    } else {
                        selected = 0;
                    }
                    ;
                    component = {
                        label: $(input).val(),
                        id: $(input).attr('id'),
                        name: $(input).attr('name'),
                        type: $(input).attr('type'),
                        defaultValue: null,
                        isSelected: selected,
                        secUIControl: null
                    };
                    components.push(component);
                });
                flow = {
                    soggettoId: $this.soggettoId,
                    layout: $(item).attr('layout'),
                    domanda: $(item).find('div').children('header').attr('domanda'),
                    id: sectionId,
                    components: components,
                    risposta: null,
                    gridTable: null,
                    cascadeInformazioni: null
                };
                domande.push(flow);
            }
            else if ($(item).attr('layout') == "List") {
                var listLi = $(item).find('div').children('fieldset').find('li');
                var rispostaItem;
                var rispostaItems = [];
                // loop li to get the components
                $.each(listLi, function(li, lst) {
                    var lstInput = $(lst).find('input[name="' + sectionId + '"]');
                    var lstLabel = $(lst).find('label');
                    var checked;
                    if ($(lstInput).is(':checked')) {
                        checked = 1;
                    } else {
                        checked = 0;
                    }
                    var secUIComponent;
                    var secUIComponents = [];
                    //var secUI = $(lst).find('input[name="'+$(lstInput).attr('id')+'"]');
                    var secUI = $(lst).find('input[type=Text]');
                    $.each(secUI, function(u, ui) {
                        var secUiChecked;
                        var textVal = "";
                        if ($(ui).is(':checked')) {
                            secUiChecked = 1;
                        } else {
                            secUiChecked = 0;
                        }
                        if (checked === 1) {
                            textVal = $(ui).val();
                        } else {
                            textVal = "";
                        }
                        secUIComponent = {
                            type: $(ui).attr('type'),
                            id: $(ui).attr('id'),
                            name: $(ui).attr('name'),
                            defaultValue: textVal,
                            value: textVal,
                            isSelected: secUiChecked
                        };
                        secUIComponents.push(secUIComponent);
                    });
                    rispostaItem = {
                        type: $(lstInput).attr('type'),
                        label: $(lstLabel).text(),
                        id: $(lstInput).attr('id'),
                        name: $(lstInput).attr('name'),
                        isSelected: checked,
                        secUIControl: secUIComponents
                    };
                    rispostaItems.push(rispostaItem);
                });
                list = {
                    soggettoId: $this.soggettoId,
                    layout: $(item).attr('layout'),
                    domanda: $(item).find('div').children('header').attr('domanda'),
                    id: sectionId,
                    components: null,
                    risposta: rispostaItems,
                    gridTable: null,
                    cascadeInformazioni: null
                };
                domande.push(list);
            }
            else if ($(item).attr('layout') == "Grid") {
                var gridTbl = $(item).find('div').children('table');
                var tblHeader = $(gridTbl).find('thead').children('tr').find('th');
                var header = [];
                $.each(tblHeader, function(i, item) {
                    header.push($(item).text().toString().replace(/\s+/g, ' '));
                });
                var tblRow = $(gridTbl).find('tbody').children('tr');
                var body = [];
                $.each(tblRow, function(r, row) {
                    var column = $(row).children('td');
                    var columns = [];
                    $.each(column, function(c, column) {
                        var rColumn;
                        if ($(column).attr('colType').toLowerCase() == "label") {
                            rColumn = {
                                id: $(column).children('label').attr('id'),
                                type: $(column).children('label').attr('type'),
                                value: $(column).children('label').text(),
                                defaultValue: "",
                                name: $(column).children('label').attr('name'),
                                isSelected: 0
                            };
                        }
                        else if ($(column).attr('colType').toLowerCase() == "text") {
                            rColumn = {
                                id: $(column).children('input').attr('id'),
                                type: $(column).children('input').attr('type'),
                                value: $(column).children('input').val(),
                                defaultValue: $(column).children('input').val(),
                                name: $(column).children('input').attr('name'),
                                isSelected: 0
                            };
                        }
                        else if ($(column).attr('colType').toLowerCase() == "date") {
                            rColumn = {
                                id: $(column).children('span').find('input').attr('id'),
                                type: 'date',
                                value: $(column).children('span').find('input').val(),
                                defaultValue: $(column).children('span').find('input').val(),
                                name: $(column).children('span').find('input').attr('name'),
                                isSelected: 0
                            };
                        }
                        else {
                            var component = $(column).children('input');
                            var uiSelected;
                            if ($(component).is(':checked')) {
                                uiSelected = 1;
                            } else {
                                uiSelected = 0;
                            }
                            rColumn = {
                                id: $(column).children('input').attr('id'),
                                type: $(column).children('input').attr('type'),
                                value: $(column).children('input').val(),
                                defaultValue: $(column).children('input').val(),
                                name: $(column).children('input').attr('name'),
                                isSelected: uiSelected
                            };
                        }
                        columns.push(rColumn);
                    });
                    var tblBody = {
                        id: $(row).attr('id'),
                        deleteIcon: $(row).attr('delIcon'),
                        column: columns
                    };
                    body.push(tblBody);
                });
                grid = {
                    soggettoId: $this.soggettoId,
                    layout: $(item).attr('layout'),
                    domanda: $(item).find('div').children('header').attr('domanda'),
                    id: sectionId,
                    components: null,
                    risposta: null,
                    cascadeInformazioni: null,
                    gridTable: [
                        {
                            tableHeader: header,
                            tableContent: body
                        }
                    ]
                };
                domande.push(grid);
            }
            else if ($(item).attr('layout') === "Cascade") {
                var radioBtns = $(item).find('div').children('fieldset').find('input[data-cascade-click]');
                var tmpchildren = [];
                var children = [];
                var childControl;
                var childControls = [];
                $.each(radioBtns, function(i, input) {
                    var selected;
                    if ($(input).is(':checked')) {
                        selected = 1;
                    } else {
                        selected = 0;
                    }
                    //Get the child controls data
                    if ($(input).attr('data-hasChild') === "0") {
                        component = {
                            label: $(input).val(),
                            id: $(input).attr('id'),
                            name: $(input).attr('name'),
                            type: $(input).attr('type'),
                            defaultValue: null,
                            isSelected: selected,
                            secUIControl: null,
                            children: []
                        };
                        components.push(component);
                    } else {
                        var childBtns = $(input).parent().find('div').find('input');
                        $.each(childBtns, function(i, childInput) {
                            var childSelected;
                            if ($(childInput).is(':checked') && selected === 1) {
                                childSelected = 1;
                            } else {
                                childSelected = 0;
                            }
                            childControl = {
                                type: $(childInput).attr('type'),
                                selected: childSelected,
                                value: $(childInput).val()
                            };
                            childControls.push(childControl);
                        });
                        tmpchildren = {
                            visibility: "",
                            rispostaCode: "",
                            layout: $(input).parent().find('div').attr('data-layout'),
                            controls: childControls
                        };
                        /*Make this as one Array we are saving into temp variable and push into the array.*/
                        children.push(tmpchildren);
                        component = {
                            label: $(input).val(),
                            id: $(input).attr('id'),
                            name: $(input).attr('name'),
                            type: $(input).attr('type'),
                            defaultValue: null,
                            isSelected: selected,
                            secUIControl: null,
                            children: children
                        };
                        components.push(component);
                    }
                });
                cascade = {
                    soggettoId: $this.soggettoId,
                    layout: $(item).attr('layout'),
                    domanda: $(item).find('div').children('header').attr('domanda'),
                    id: sectionId,
                    components: null,
                    risposta: null,
                    gridTable: null,
                    cascadeInformazioni: components
                };
                domande.push(cascade);
            }
        });
        var initialParams = 'idsoggetto=' + wkscommerciale.idSoggetto.get()
            + '##DATI_PRECEDENTI='+informazioniAggiuntiveDetailsObj
            + '##DATI_NUOVI='+JSON.stringify(domande);

        var log = new wkscommerciale.log.wkscLogger("3.4.1.additional_information_card.html", "WKSC-ADIU", initialParams);
        wkscommerciale.log.doPushLog({logger: log});

        wkscommerciale.ajaxRequests.post({
            url: window.wkscustomerContext+"/service/customers/sendinformazioniaggiuntive",
            params: JSON.stringify(domande),
            contentType: "application/json; charset=utf-8",
            onSuccess: function() {
                $('#saveQuestionario').attr("disabled", false);
                CardMaster.remove();
                if (wkscApp.getTipoQuestionario() === "Business") {
                    if ($(".active").find(".company_ia_quest").length>0)
                    {
                        var bcInfoAggiuntive = new wkscustomer.collections.BCInfoAggiuntiveDetails();
                        var BCInfoAggiuntiveRefresh = new wkscustomer.views.BCInfoAggiuntiveRefresh({
                            el: $(".company_ia_quest"),
                            collection: bcInfoAggiuntive
                        });
                        if(BCInfoAggiuntiveRefresh) {
                            wkscommerciale.consolle.log('BCInfoAggiuntiveRefresh variable is used!');
                        }
                    }
                }
                else {
                    if ($(".active").find("#personal_privacy").length>0)
                    {
                        var personaliQuestionari = new wkscustomer.collections.PersonaliQuestionariList();
                        var PersonaliPrivacyView = new wkscustomer.views.PersonaliPrivacyView({
                            el: $("#personal_privacy"),
                            collection: personaliQuestionari
                        });
                        if(PersonaliPrivacyView) {
                            wkscommerciale.consolle.log('PersonaliPrivacyView variable is used!');
                        }
                    }
                }
            },
            successParams: null,
            onError: function(request, error) {
                wkscommerciale.showBrowserAlert('Service call failed: ' + request.status + ' ' + request.statusText);
                $('#saveQuestionario').attr("disabled", false);
            }
        });
        wkscommerciale.log.doPopLog({logger: log});
        /* DEPRICATED!
         ajaxRequests({
         requestType: "POST",
         requestUrl: window.wkscustomerContext+"/service/customers/sendinformazioniaggiuntive",
         queryParams: JSON.stringify(domande),
         onSuccess: function() {
         $('#saveQuestionario').attr("disabled", false);
         CardMaster.remove();
         if (wkscApp.getTipoQuestionario() == "Business") {
         var bcInfoAggiuntive = new wkscApp.BCInfoAggiuntiveDetails();
         new wkscustomer.views.BCInfoAggiuntiveRefresh({
         el: $("#company_more_info"),
         collection: bcInfoAggiuntive
         });
         }
         else {
         var personaliQuestionari = new wkscApp.PersonaliQuestionariList();
         new wkscustomer.views.PersonaliPrivacyView({
         el: $("#personal_privacy"),
         collection: personaliQuestionari
         });
         }
         },
         successParams: null,
         onError: function(request, error) {
         alert('Service call failed: ' + request.status + ' ' + request.statusText);
         $('#saveQuestionario').attr("disabled", false);
         }
         });
         */
    },
    onCallBackAfterSuccess: function() {
        var $this = wkscustomer.views.informazioniaggiuntiveAction;
        var curPageType = $this.curTippoSoggetto;
        var attivitaId = "";
        var attivitaListId = "";
        var soggettoId = $this.soggettoId;
        var prospectId = $this.prospectId;
        if (soggettoId !== "" && prospectId === "" && curPageType === "Semplice") {
            attivitaListId = "activitiesList";//This for check the customer is Private customer
            attivitaId = "attivita_Private";
        }
        else{
            attivitaListId = "business_customer_smallButtonIndicators";//This for check the customer is Business customer
            attivitaId = "attivita";
        }
        $('#' + attivitaListId).off('click', '.small_button');
        //To refresh the attivita summary
        var attivita = new wkscustomer.collections.AttivitaList();
        var AttivitaListView = new wkscustomer.views.AttivitaListView({
            el: $("#" + attivitaListId),
            collection: attivita
        });
        if(AttivitaListView) {
            wkscommerciale.consolle.log('AttivitaListView variable is used!');
        }
        //Customer page right side Attivita list
        $('#' + attivitaId).wkscspinner({css: 'large', position: true});
        $('#' + attivitaId).off('click', '.activity_note');
        var attivitaCliente = new wkscustomer.collections.AttivitaClienteList();
        var AttivitaClienteView = new wkscustomer.views.AttivitaClienteView({
            el: $("#" + attivitaId),
            collection: attivitaCliente
        });
        if(AttivitaClienteView) {
            wkscommerciale.consolle.log('AttivitaClienteView variable is used!');
        }
    }
});
wkscustomer.views.LiquiditaeRisparmioView = Backbone.View.extend({
    el: $('.column'),
    initialize: function(options) {
        this.options = options;
        this.pogEnabled = options.pogEnabled;
        this.complianceMandatory = options.complianceMandatory;
        this.soggettoId = options.soggettoId;
        this.tipoSoggetto = options.tipoSoggetto;
    },
    render: function() {
        var self = this;
        var needMap = new wkscustomer.collections.ShortNeedsMapList();
        var liquiditaeRisparmio = new wkscustomer.collections.LiquiditaeRisparmioList();
        wkscustomer.collections.contiInterniList = new wkscustomer.collections.ContiInterniList();
        var raisinCarteViacard = new wkscustomer.collections.ServiziContiRaisincardList();
        //var raisinCarteViacard = new wkscustomer.collections.ServiziContiCarteViacardList();
        var tippoSoggetto = wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get());
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant){
            if( ! hasGrant && !wkscommerciale.user.data.promotoreBSNew) {//5052
                $('#needs_map').children('header:first').append(' ed interni');
            }
            var questionarioInfoView, questionarioInfoViewEl = $('#questionario_info_section'), needsMapViewEl = $('#needs_map_section');
            if(this.pogEnabled) {
                var getQuestionarioInfo = new wkscustomer.collections.GetQuestionarioInfo();
                wkscommerciale.log.doPushLog(this.options);
                questionarioInfoView = new wkscustomer.views.QuestionarioInfoView({
                    el: questionarioInfoViewEl,
                    collection: getQuestionarioInfo,
                    soggettoId: this.soggettoId,
                    tipoSoggetto: tippoSoggetto,
                    needsBtnSection: false,
                    pogEnabled: this.pogEnabled,
                    complianceMandatory : this.complianceMandatory,
                    logger: this.options.logger
                });

                getQuestionarioInfo.fetch(wkscommerciale.utils.fetchCallback({soggettoId: this.soggettoId, tipoSoggetto: this.tipoSoggetto}));
                needsMapViewEl.remove();
            } else {
                questionarioInfoViewEl.remove();
                wkscommerciale.log.doPushLog(self.options);
                var MappaDelleEsigenzeContiEServizi = new wkscustomer.views.MappaDelleEsigenzeContiEServizi({
                    el: $('#needs_map_section'),
                    collection: needMap,
                    logger: self.options.logger,
                    isPromotore : hasGrant,
                    template:"/assets/templates/risparmio/esigenza_conti"
                });
                if(MappaDelleEsigenzeContiEServizi) {
                    wkscommerciale.consolle.log('MappaDelleEsigenzeContiEServizi variable is used!');
                }

            }
            wkscommerciale.log.doPushLog(self.options);
            var ContiEServizi_ContiShort = new wkscustomer.views.ContiEServizi_ContiShort({
                el: $('#current_account_accounts'),
                collection: liquiditaeRisparmio,
                logger: self.options.logger,
                isPromotore : hasGrant
            });
            if(ContiEServizi_ContiShort) {
                wkscommerciale.consolle.log('ContiEServizi_ContiShort variable is used!');
            }

            //========== raisin view for liquid section card ========== //

            wkscommerciale.getWkscParam('ENABLE_RAISIN', _.bind(function(response){
                    if(_.has(response, 'status') && response.status === 'success') {
                        var data = _.has(response, 'data') && _.isArray(response.data) ? response.data : [];
                        if( ! wkscommerciale.checkIsEmpty(data) && _.isObject(data[0])) {
                            if(_.has(data[0], 'ENABLE_RAISIN') && data[0].ENABLE_RAISIN === 'Y' && wkscommerciale.customer.tipoSoggetto==="Semplice") {
                                //5203 SHOW_RISPARMIO_SELLA_LINK profile Check
                                wkscommerciale.profiles.checkProfile('SHOW_RISPARMIO_SELLA_LINK', _.bind(function(hasGrant) {
                                    if(hasGrant){
                                        wkscommerciale.log.doPushLog(self.options);
                                        var ContiEServizi_raisin = new wkscustomer.views.ContiEServizi_Liq_Raisin({
                                            el: $('#current_account_raisin'),
                                            collection: raisinCarteViacard,
                                            logger: self.options.logger,
                                        });
                                        if(ContiEServizi_raisin) {
                                            wkscommerciale.consolle.log('ContiEServizi_ContiShort variable is used!');
                                        }
                                    }else{
                                        $('#current_account_raisin').remove();
                                        wkscommerciale.consolle.log('No Grants for Raisin');
                                    }
                                },this))

                            }else{
                                $('#current_account_raisin').remove();
                            }
                        }
                    }

                },this),
                _.bind(function (error) {})
            );
            //================= //
            if( hasGrant)
            {
                $('#current_account_functionality_accounts').hide()
                $('#conti_interni_conti_interni').hide()
            }
            else
            {
//				If not promotore, show funzionalita section
                wkscommerciale.log.doPushLog(self.options);
                var funzionalitaERicercheView = new wkscustomer.views.FunzionalitaERicerche({
                    el: $("#current_account_functionality_accounts"),
                    collection: "",
                    pageType: tippoSoggetto,
                    logger: self.options.logger,
                    questionarioInfoView: questionarioInfoView,
                    pogEnabled: this.pogEnabled,
                    complianceMandatory : this.complianceMandatory,
                    template:"/assets/templates/risparmio/funzionalita_e_ricerche"
                });
                if(this.pogEnabled) {
                    questionarioInfoView.funzionalitaERicercheView = funzionalitaERicercheView;
                }
//				If not promotore enable conti interni section
                if(!wkscommerciale.user.data.promotoreBSNew){//5052
                    wkscommerciale.log.doPushLog(self.options);
                    wkscustomer.views.contiInterniView = new wkscustomer.views.ContiInterniView({
                        el: $("#conti_interni_conti_interni"),
                        collection: wkscustomer.collections.contiInterniList,
                        logger: self.options.logger
                    });
                    if(wkscustomer.views.contiInterniView) {
                        wkscommerciale.consolle.log('ContiInterniView variable is used!');
                    }
                }
            }
            wkscommerciale.log.doPopLog(self.options);
        },this));
    }
});
// Conti e Servizi master views and sub views
wkscustomer.views.TriggerContiEServizi = Backbone.View.extend({
    el: $('.column'),
    initialize: function(options) {
        this.options = options;
        this.pogEnabled = options.pogEnabled;
        this.complianceMandatory = options.complianceMandatory;
        this.soggettoId = options.soggettoId;
        this.tipoSoggetto = options.tipoSoggetto;
    },
    render: function() {
        var self = this;
        var needMap = new wkscustomer.collections.ShortNeedsMapList();
        wkscustomer.collections.contiInterniList = new wkscustomer.collections.ContiInterniList();
        var codiceServiziAltri = new wkscustomer.collections.CodiceServiziAltriList();
        var sellaDigitServizi = new wkscustomer.collections.SellaDigitServiziList();
        var contiCarteViacard = new wkscustomer.collections.ServiziContiCarteViacardList();
        var raisinCarteViacard = new wkscustomer.collections.ServiziContiRaisincardList();
        var funzionalitaRicerche = new wkscustomer.collections.FunzionalitaRicerche();
        var tippoSoggetto = wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get());
        var questionarioInfoView = {}, questionarioInfoViewEl = $('#questionario_info_section'), needsMapViewEl = $('#needs_map_section');
        if(this.pogEnabled) {
            var getQuestionarioInfo = new wkscustomer.collections.GetQuestionarioInfo();
            wkscommerciale.log.doPushLog(this.options);
            questionarioInfoView = new wkscustomer.views.QuestionarioInfoView({
                el: questionarioInfoViewEl,
                collection: getQuestionarioInfo,
                soggettoId: this.soggettoId,
                tipoSoggetto: tippoSoggetto,
                needsBtnSection: true,
                pogEnabled: this.pogEnabled,
                complianceMandatory : this.complianceMandatory,
                logger: this.options.logger
            });
            getQuestionarioInfo.fetch(wkscommerciale.utils.fetchCallback({soggettoId: this.soggettoId, tipoSoggetto: this.tipoSoggetto}));
            needsMapViewEl.remove();
        } else {
            questionarioInfoViewEl.remove();
            wkscommerciale.log.doPushLog(self.options);
            var MappaDelleEsigenzeContiEServizi = new wkscustomer.views.MappaDelleEsigenzeContiEServizi({
                el: $('#needs_map_section'),
                collection: needMap,
                logger: self.options.logger,
                template: "/assets/templates/needs_map/esigenza_conti"
            });
            if(MappaDelleEsigenzeContiEServizi) {
                wkscommerciale.consolle.log('MappaDelleEsigenzeContiEServizi variable is used!');
            }
        }

        wkscommerciale.log.doPushLog(self.options);
        var funzionalitaERicercheView = new wkscustomer.views.FunzionalitaERicerche({
            el: $("#current_account_functionality_accounts"),
            collection: (tippoSoggetto === "Semplice" ? funzionalitaRicerche : ""),
            pageType: tippoSoggetto,
            logger: self.options.logger,
            questionarioInfoView: questionarioInfoView,
            pogEnabled: this.pogEnabled,
            complianceMandatory : this.complianceMandatory,
            template:"/assets/templates/conti_e_servizi/funzionalita_e_ricerche"
        });
        if(this.pogEnabled) {
            questionarioInfoView.funzionalitaERicercheView = funzionalitaERicercheView;
        }
        // DEMO INTEGRATION OF H2O IN WKSC
        /*new wkscustomer.views.h2oIframeView({
         el: $("#current_account_h2oIframe")
         }).render();*/
        wkscommerciale.log.doPushLog(self.options);
        var ContiEServizi_Conti = new wkscustomer.views.ContiEServizi_Conti({
            el: $('#current_account_accounts'),
            collection: contiCarteViacard,
            soggettoId: this.soggettoId,
            tipoSoggetto: this.tipoSoggetto,
            questionarioInfoView: questionarioInfoView,
            pogEnabled: this.pogEnabled,
            complianceMandatory : this.complianceMandatory,
            logger: self.options.logger
        });
        if(ContiEServizi_Conti) {
            wkscommerciale.consolle.log('ContiEServizi_Conti variable is used!');
        }
        //PORTAHC-6285 added investimenti card in conti e servizi for bank BPA.
        var investimentishowabiCb = _.bind(function(response) {
            var abicodes = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'ABI_SHOW_INVESTIMENTI_IN_CONTI_SERVIZI') ? response.data[0].ABI_SHOW_INVESTIMENTI_IN_CONTI_SERVIZI : '';
            if(_.size(abicodes) > 0 ) {
                var arr = abicodes.split(';');
                if(!_.contains(arr,wkscommerciale.user.abiCode)){
                	$("#investimenti_investimenti").remove();
                }else{
                	var investimentiContiServizi = new wkscustomer.collections.InvestimentiList();
                	var InvestimentiContiServiziView = new wkscustomer.views.InvestimentiContiServiziView({
                		el:$("#investimenti_investimenti"),
                		collection: investimentiContiServizi,
                		logger: self.options.logger
                    	});
                             
                }

                    	 
                
            }
        }, this);

        var ErrorInvestimentishowabiCb = _.bind(function(response) {
        	$("#investimenti_investimenti").remove();
            wkscommerciale.notifyError.pushFromFetchError(response);
        }, this);

        wkscommerciale.ajaxRequests.get({
            url: 'service/params/wkscParameterValues',
            params: {
                paramIds: 'ABI_SHOW_INVESTIMENTI_IN_CONTI_SERVIZI'
            },
            contentType: 'application/json; charset=utf-8',
            onSuccess: investimentishowabiCb,
            onError: ErrorInvestimentishowabiCb
        });
        


        //============ rasin view for contiservizi card ==================//
        wkscommerciale.getWkscParam('ENABLE_RAISIN', _.bind(function(response){
                if(_.has(response, 'status') && response.status === 'success') {
                    var data = _.has(response, 'data') && _.isArray(response.data) ? response.data : [];
                    if( ! wkscommerciale.checkIsEmpty(data) && _.isObject(data[0])) {
                        if(_.has(data[0], 'ENABLE_RAISIN') && data[0].ENABLE_RAISIN === 'Y' && wkscommerciale.customer.tipoSoggetto==="Semplice") {
                            //5203 SHOW_RISPARMIO_SELLA_LINK profile Check
                            wkscommerciale.profiles.checkProfile('SHOW_RISPARMIO_SELLA_LINK', _.bind(function(hasGrant) {
                                if(hasGrant){
                                    wkscommerciale.log.doPushLog(self.options);
                                    var ContiEServizi_raisin = new wkscustomer.views.ContiEServizi_raisin({
                                        el: $('#current_account_raisin'),
                                        collection: raisinCarteViacard,
                                        soggettoId: this.soggettoId,
                                        tipoSoggetto: this.tipoSoggetto,
                                        questionarioInfoView: questionarioInfoView,
                                        pogEnabled: this.pogEnabled,
                                        complianceMandatory : this.complianceMandatory,
                                        logger: self.options.logger
                                    });

                                    if(ContiEServizi_raisin) {
                                        wkscommerciale.consolle.log('ContiEServizi_raisin variable is used!');
                                    }
                                }else{
                                    $('#current_account_raisin').remove();
                                    wkscommerciale.consolle.log('No Grants for Raisin');
                                }
                            },this))

                        }else{
                            $('#current_account_raisin').remove();
                        }
                    }
                }
                // $(window).trigger('cardmaster:loaded', this.$el);

            },this),
            _.bind(function (error) {})
        );

        if(wkscommerciale.user.data.promotoreBSNew){ //5051 added promotori check to
            $('#conti_interni_conti_interni').hide();
        }else{
            wkscommerciale.log.doPushLog(self.options);
            wkscustomer.views.contiInterniView = new wkscustomer.views.ContiInterniView({
                el: $("#conti_interni_conti_interni"),
                collection: wkscustomer.collections.contiInterniList,
                logger: self.options.logger
            });
            if(wkscustomer.views.contiInterniView) {
                wkscommerciale.consolle.log('ContiInterniView variable is used!');
            }
        }
        wkscommerciale.log.doPushLog(self.options);
        var ContiEServizi_ServiziTelematici = new wkscustomer.views.ContiEServizi_ServiziTelematici({
            el: $('#current_account_internet_banking'),
            collection: sellaDigitServizi,
            logger: self.options.logger
        });
        if(ContiEServizi_ServiziTelematici) {
            wkscommerciale.consolle.log('ContiEServizi_ServiziTelematici variable is used!');
        }
        wkscommerciale.log.doPushLog(self.options);
        var ContiEServizi_ServiziDiCustodia = new wkscustomer.views.ContiEServizi_ServiziDiCustodia({
            el: $('#current_account_custody'),
            collection: codiceServiziAltri,
            logger: self.options.logger
        });
        if(ContiEServizi_ServiziDiCustodia) {
            wkscommerciale.consolle.log('ContiEServizi_ServiziDiCustodia variable is used!');
        }
        if (tippoSoggetto.trim() !== "Prospect") {
            $("#current_account_remote_business").show();
            var remoteBanking = new wkscApp.ContiServiziRemoteBanking();
            wkscommerciale.log.doPushLog(self.options);
            var RemoteBanking = new wkscustomer.views.RemoteBanking({
                el: $("#current_account_remote_business"),
                collection: remoteBanking,
                logger: self.options.logger
            });
            if(RemoteBanking) {
                wkscommerciale.consolle.log('RemoteBanking variable is used!');
            }
        }
        wkscommerciale.log.doPopLog(self.options);
    }
});
// DEMO INTEGRATION OF H2O IN WKSC
wkscustomer.views.h2oIframeView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render:function(){
        ///SMURLServlet?smName=VariazioneCliente&outSMParam=&wkscCallbackUrl=/wkscommerciale/closeIFR.html&smParams=1159992
        var $this = this;
        wkscommerciale.ajaxRequests.get({
            url: 'https://te-x-net.bansel.it/wkscommerciale/SMURLServlet?smName=VariazioneCliente&outSMParam=&wkscCallbackUrl=/wkscommerciale/closeIFR.html&smParams='+wkscommerciale.idSoggetto.get(),
            params: '',
            onSuccess: function(h2oUrl){
                var smUrl = "https://te-x-net.bansel.it"+h2oUrl,
                    iframe = $($this.el).find('iframe');
                iframe.attr('src',smUrl);
            },
            onError: function() {}
        });
        /*$.get('https://te-x-net.bansel.it/wkscommerciale/SMURLServlet?smName=VariazioneCliente&outSMParam=&wkscCallbackUrl=/wkscommerciale/closeIFR.html&smParams='+wkscommerciale.idSoggetto.get())
         .done(function(h2oUrl){
         var smUrl = "https://te-x-net.bansel.it"+h2oUrl,
         iframe = $($this.el).find('iframe');
         iframe.attr('src',smUrl);
         })
         .error(function(){
         });*/
    }
});
wkscustomer.views.RemoteBanking = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
        this.template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/remote_banking"));
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var _response = this.collection.toJSON();
        wkscommerciale.notifyError.pushError(_response[0].message);
        if (_response[0].data.length != 0) {
            if (_response[0].data[0].remote.length != 0) {
                $(this.el).html(this.template({"remoteBanking": _response[0].data[0].remote, "showDefault": false}));
            } else {
                $(this.el).html(this.template({"remoteBanking": _response[0].data, "showDefault": true}));
            }
        } else {
            $(this.el).html(this.template({"remoteBanking": _response[0].data, "showDefault": true}));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.FunzionalitaERicerche = Backbone.View.extend({
    el: $("#current_account_functionality_accounts"),
    initialize: function(options) {
        this.options = options;
        this.template = _.template(wkscommerciale.template.get(window.wkscustomerContext+this.options.template));
        this.pageType = options.pageType;
        var type = "";
        this.isDataLoaded = false;
        if(this.pageType === 'Semplice' || this.pageType === 'Plurintestazione' ||this.pageType === 'PlurintestazioneAZ' ||this.pageType === 'PlurintestazioneAZandPF') {
            this.questionarioInfoView = options.questionarioInfoView;
            this.pogEnabled = options.pogEnabled;
            this.complianceMandatory = options.complianceMandatory;
        }
        $(this.el).wkscspinner({
            css: 'large'
        });
        if (this.pageType === "Semplice" && this["collection"])
        {
            wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
                identifier: wkscommerciale.idSoggetto.get()
            });
        }
        else {
            this.render();
        }
    },
    events: {
        //'click .openReportingClientsListBtn': 'openReportingClientsList',
        'click .contrattualisticaProsegui': 'openH2OAdapter'
    },
    render: function() {
        if (this.pageType === 'Semplice' && this["collection"] ) {
            var _response = this.collection.toJSON();
            wkscommerciale.notifyError.pushError(_response[0].message);
            if (_response[0].data.length !== 0) {
                $(this.el).append(this.template({"details": _response[0].data[0], "type": this.pageType, "segnalaz": _response[0].data[1].segnalaz }));
            }
            else {
                $(this.el).append(this.template({"details": "0", "type": this.pageType, "segnalaz": false}));
            }
        }
        else {
            $(this.el).append( this.template({"details": "0", "type": this.pageType}));
        }
        this.isDataLoaded = true;
        var btnsSection = this.$('.mutui_buttons');
        var contrattualisticaSMConfigAttributes = 'smName="GestoreContrattualistica" smOutParams="" value="' + wkscommerciale.idSoggetto.get() + '" newtab="1" iframe="1"';
        var btnTemplate = '<div class="button">';
        btnTemplate += '<a href="javascript:void(0);" id="contrattualisticaBtn" class="collar contrattualisticaBtnWithBaloon" ' + contrattualisticaSMConfigAttributes + ' sm-open-h2oadaptor>Contrattualistisca</a>';
        btnTemplate += '</div>';
        var $contrattualisticaBtn = $(btnTemplate);
        // remove if already contrattualistica button present - we have to remove and add the button again to clear the already bounded events of the button
        btnsSection.find('#contrattualisticaBtn').parents('.button').remove();
        if((this.pageType === 'Semplice' || this.pageType === 'Plurintestazione'  ||this.pageType === 'PlurintestazioneAZ' ||this.pageType === 'PlurintestazioneAZandPF') && this.complianceMandatory === 'true') {
            if(this.pogEnabled && this.questionarioInfoView.isDataLoaded) {
                var btnTooltip = this.questionarioInfoView.contrattualisticaTooltip;
                if(_.size(btnTooltip) > 0) {
                    var baloonTemplate = '<div class="contrattualisticaBtnBaloon default-baloon" data-acts-as-baloon-on=".contrattualisticaBtnWithBaloon" data-fix-top="-175px" data-fix-left="-2px" data-fix-bottom-left="65px">';
                    baloonTemplate += '<p>' + btnTooltip +'</p>';
                    baloonTemplate += '<div class="buttons">';
                    baloonTemplate += '<a href="javascript:void(0);" class="button small" data-close-parent=".contrattualisticaBtnBaloon">Annulla</a>';
                    baloonTemplate += '<a href="javascript:void(0);" class="button contrattualisticaProsegui small" data-close-parent=".contrattualisticaBtnBaloon" smName="GestoreContrattualistica" ' + contrattualisticaSMConfigAttributes + '>Prosegui</a>';
                    baloonTemplate += '<div class="clear"></div>';
                    baloonTemplate += '</div>';
                    baloonTemplate += '<div class="bottom"></div>';
                    baloonTemplate += '</div>';
                    var $contrattualisticaBtnBaloon = $(baloonTemplate);
                    $contrattualisticaBtn.find('#contrattualisticaBtn').removeAttr('sm-open-h2oadaptor');
                    $contrattualisticaBtn.append( $contrattualisticaBtnBaloon );
                }
            }
        }
        // add the contrattualistica button
        $contrattualisticaBtn.insertBefore( btnsSection.find('.button:first') );
        var profileCheckCb = _.bind(function(hasGrant) {
            this.$('#ricercaBanconoGrossoTaglioLink').toggle(hasGrant);
        }, this);
        wkscommerciale.profiles.checkProfile('SEARCH_LARGE_BILLS', profileCheckCb);

        /* PORTAHC-3873 - Flag to show/hide button */
        if(this.pageType === 'Semplice') {
            var clientsReportSuccessCb = _.bind(function(response) {
                var flag = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'SHOW_SEG_CLIENTI_SOC_TERZA') ? response.data[0].SHOW_SEG_CLIENTI_SOC_TERZA : '';
                if(_.size(flag) > 0 && flag === 'Y') {
                    this.$('.openReportingClientsListBtn').show();	//show the button defined here: wkscustomer-web\src\main\webapp\assets\templates\conti_e_servizi\funzionalita_e_ricerche.html
                }
            }, this);
            var clientsReportErrorCb = _.bind(function(response) {
                wkscommerciale.notifyError.pushFromFetchError(response);
                this.$('.openReportingClientsListBtn').show();
            }, this);
            wkscommerciale.getWkscParam('SHOW_SEG_CLIENTI_SOC_TERZA', clientsReportSuccessCb, clientsReportErrorCb);
        }


        //PORTAHC-6215
        var caeGetPosNewLinkSuccessCb = _.bind(function(response) {
            var link = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'CAE_NEWLINK') ? response.data[0].CAE_NEWLINK : '';
            if(_.size(link) > 0) {
                $('#caeGestorePosButton').attr('smRef',link);
            }
        }, this);
        var  caeGetPosNewLinkErrorCb = _.bind(function(response) {
            $('#caeGestorePosButton').attr('smRef','/main?application.CaeGestorePos.new');
        }, this);
        wkscommerciale.getWkscParam('CAE_NEWLINK', caeGetPosNewLinkSuccessCb, caeGetPosNewLinkErrorCb);

        //5031
        if( wkscustomer.ListaMovimentiCardAccess === 'N') {
            $('#current_account_functionality_accounts .mutui_buttons').find('[data-label = "Ricerca Movimenti"]').show();
        }else{
            $('#current_account_functionality_accounts .mutui_buttons').find('[data-label = "Ricerca Movimenti"]').hide();
        }

        $(this.el).wkscspinner('remove');
        $("a[sm-open-h2oadaptor-funzionalitacombo]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
            return false;
        });
        $("a[sm-open-h2oadaptor-newtab-funzionalitacombo]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
            return false;
        });
        $(window).trigger('cardmaster:loaded', $("#current_account_functionality_accounts"));
        wkscommerciale.log.doPopLog(this.options);
        //PORTAHC-6323
        $('#enableIdentifyCustomerVideoConf').on('click',function(e) {
        	e.preventDefault();
            e.stopPropagation();
        	customCardLoader({
                loadType: "slidein",
                cardSize: "size_enormous",
                cardName: contextUrls["wkscustomer"] + "/assets/cards/video_conference_card.html"
            });
        });
    },
    openReportingClientsList: function(e) {
        /* PORTAHC-4871 - Popup - Segnalazione Cliente a società Terza */
        /*
         e.preventDefault();
         var $target = $(e.currentTarget);
         var soggettoId = $target.attr('data-soggetto-id');
         //var tipoSoggetto = $target.attr('data-tipo-soggetto');
         if(_.size(soggettoId) > 0) {
         wkscommerciale.idSoggetto.set(soggettoId);
         customCardLoader({
         loadType: 'slidein',
         cardSize: 'size_enormous',
         cardName: window.wkscustomerContext + '/assets/cards/reporting_clients_list.html'
         });
         }*/
        return false;
    },
    openH2OAdapter: function(e) {
        e.preventDefault();
        var _t = $(e.currentTarget);
        var sel = _t.attr('data-close-parent');
        if(sel) {
            _t.parents(sel).eq(0).hide();
        }
        wkscSMHandler.openSM_H2OAdaptor.call($(e.currentTarget), e);
    }
});
wkscustomer.views.FunzionalitaERicercheMutui = wkscommerciale.views.WksMasterView.extend({
    el: $("#current_account_functionality"),
    initialize: function(options) {
        this.options = options;
        this.tipoSoggetto = options.tipoSoggetto;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        wkscommerciale.profiles.checkProfile('PROMOTORE_BS_MAP_SEC', _.bind(function(hasGrant) {
            if( ! hasGrant) {
                var response = this.collection.toJSON();
                var self = this;
                var _parsedResponse = "";
                var ottocifre = "";
                wkscommerciale.notifyError.pushError(response[0].message);
                var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/mutui/funzionalita_e_ricerche"));
                //5677
                if (response[0].data.length !== 0)
                {
                    ottocifre = response[0].data[0];
                    $(this.el).append(_template({
                        "ottocifre": ottocifre,
                        "type": this.tipoSoggetto
                    }));
                    //5677
                    if (this.tipoSoggetto === 'Azienda'){
                        var profileCheckCb = _.bind(function(hasGrant) {
                            this.$('#supplyChainFinancebutton').toggle(hasGrant);
                            if(!hasGrant){
                                this.$('#supplyChainFinancebutton').remove();
                            }
                        }, this);
                        wkscommerciale.profiles.checkProfile('ENABLE_SUPPLY_CHAIN_FINANCE', profileCheckCb);
                    }

                    $(".mutui_buttons [data-open-card]").click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var $target = $(e.currentTarget), cardSize = $target.attr('data-card-size'),
                            cardName = $target.attr('data-card-name');
                        if (cardName) {
                            customCardLoader({
                                loadType: 'slidein',
                                cardSize: 'size_' + (_.size(cardSize) > 0 ? cardSize : 'small'),
                                cardName: cardName
                            });
                        } else {
                            wkscommerciale.consolle.log('card name is mandatory');
                        }
                        return false;
                    });

                    // PORTAHC-4164
                    var CentraleRischiBtn = this.$('#CentraleRischiURL');
                    var centraleRischiSuccessCb = _.bind(function(response) {
                        var link = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'CENTRAL_RISCHI_URL') ? response.data[0].CENTRAL_RISCHI_URL : '';
                        if(_.size(link) > 0) {
                            CentraleRischiBtn.attr('smRef', link).show();
                        } else {
                            CentraleRischiBtn.remove();
                        }
                    }, this);
                    var centraleRischiErrorCb = _.bind(function(response) {
                        CentraleRischiBtn.remove();
                    }, this);
                    wkscommerciale.getWkscParam('CENTRAL_RISCHI_URL', centraleRischiSuccessCb, centraleRischiErrorCb);
                    /*  Added By seethadevi V. Jira id :PORTAHC-789 Version : Orion Sprint 26
                     *  Nuovi link per nuova procedura crediti di firma.
                     */
                    wkscommerciale.ajaxRequests.load("service/profile/check/CaricoFideiussioniButton", [], function(result) {
                        _parsedResponse = result;
                        if (_parsedResponse.data[0].authorize) {
                            $('#mutuiButtons').append("<div class='button' smName='FideiussioneHome' smOutParams='' value='" + wkscommerciale.idSoggetto.get() + "' newtab='0' iframe='1' sm-open-h2oadaptor style=cursor:pointer'><a href='#'>Crediti di Firma Italia</a></div>");
                        }
                        wkscommerciale.ajaxRequests.load("service/profile/check/GestioneFideiussioniButton", [], function(result) {
                            _parsedResponse = result;
                            if (_parsedResponse.data[0].authorize && ottocifre !== "") {
                                $('#mutuiButtons').append("<div class='button' smName='FideiussioniIns' smOutParams='' value='" + ottocifre + "' newtab='0' iframe='1' sm-open-h2oadaptor style=cursor:pointer'><a href='#'>Carico Fidejussione</a></div>");
                            }
                            $('#mutuiButtons').append('<div class="button" smName="GestoreContrattualistica" smOutParams="" value="' + wkscommerciale.idSoggetto.get() + '" newtab="1" iframe="1" sm-open-h2oadaptor><a href="javascript:void(0);" style="font-size:13px;position: relative;">Contrattualistica</a></div>');
                            // PORTAHC-3701 - New button Prospetto PIES for Privato and Plurintestazioni
                            if(wkscommerciale.tipoSoggetto.get() === 'Semplice' || wkscommerciale.tipoSoggetto.get() === 'Plurintestazione' || wkscommerciale.tipoSoggetto.get() === 'PlurintestazioneAZ' || wkscommerciale.tipoSoggetto.get() === 'PlurintestazioneAZandPF') {
                                $('#mutuiButtons').append('<div class="button" smName="PIESNonVincolante" smOutParams="" value="' + wkscommerciale.idSoggetto.get() + '" newtab="0" iframe="1" sm-open-h2oadaptor><a href="javascript:void(0);" style="font-size:13px;position: relative;">Prospetto PIES</a></div>');
                            }
                            $('#mutuiButtons').append("<div class='clear'></div>");
                        });
                    });
                }
                wkscommerciale.profiles.removeElOnGrant('ENABLE_CENTRALE_RISCHISTICR_WEB',$('#CentraleRischiURL'));

                $("a[sm-redirect]").click(function(e) {
                    var _smname = $(e.target).attr('smRef');
                    var _outparam = $(e.target).attr('smOutParams');
                    var _value = $(e.target).attr('value');
                    doOnSmRedirect(_smname, _outparam, _value);
                });
                $(this.el).wkscspinner('remove');
            }
            else
            {
                $(this.el).remove();
            }
            $(window).trigger('scrollbar:resize', 'relative');
        }, this));
        wkscommerciale.log.doPopLog(this.options);
    }
});

wkscustomer.views.ContiEServizi_Liq_Raisin = wkscommerciale.views.WksMasterView.extend({
    el: $('#current_account_raisin'),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/raisin"));


        var response = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(response[0].message);
        if (response[0].data.length != 0) {
            if (response[0].data[0].conti.length != 0) {
                if (response[0].data[0].conti[0].isAuthorized) {
                    $(this.el).show();
                    $(this.el).append(_template({
                        "conti": response[0].data[0].conti,
                        "isClosed": response[0].data[0].accountClosed,
                        "isSelfid": response[0].data[0].isSelfid,
                        "showDefault": false
                    }));
                }
                else {
                    $(this.el).hide();
                }
            }
            else {
                $(this.el).append(_template({
                    "conti": response[0].data[0].conti,
                    "isClosed": response[0].data[0].accountClosed,
                    "isSelfid": response[0].data[0].isSelfid,
                    "showDefault": true
                }));
            }

        }
        else {
            $(this.el).append(_template({
                "conti": [],
                "isClosed": false,
                "isSelfid": false,
                "showDefault": true
            }));
            wkscommerciale.log.doPushLog(this.options);
            // Push notification
        }
        /* wkscommerciale.getWkscParam('ENABLE_RAISIN', _.bind(function(response){
         if(_.has(response, 'status') && response.status === 'success') {
         var data = _.has(response, 'data') && _.isArray(response.data) ? response.data : [];
         if( ! wkscommerciale.checkIsEmpty(data) && _.isObject(data[0])) {
         if(_.has(data[0], 'ENABLE_RAISIN') && data[0].ENABLE_RAISIN !== 'Y') {
         $('#current_account_raisin').remove();
         }
         }
         }
         $(window).trigger('cardmaster:loaded', this.$el);
         },this),
         _.bind(function (error) {})
         );*/

        $(this.el).wkscspinner('remove');

        wkscommerciale.log.doPopLog(this.options);
        $("#contiraisinchiusi").click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr('soggettoid'));
            wkscApp.setTipoConto("07");
            customCardLoader({
                loadType: "slidein",
                cardSize: "size_small",
                cardName: window.wkscustomerContext+"/assets/cards/3.8.1.conti_chiusura_card.html"
            });
            return false;
        });
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
wkscustomer.views.ContiEServizi_ContiShort = wkscommerciale.views.WksMasterView.extend({
    el: $('#current_account_accounts'),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/conti"));


        var response = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(response[0].message);
        if (response[0].data.length != 0) {
            if (response[0].data[0].conti.length != 0) {
                if (response[0].data[0].conti[0].isAuthorized) {
                    $(this.el).show();
                    $(this.el).append(_template({
                        "conti": response[0].data[0].conti,
                        "isClosed": response[0].data[0].accountClosed,
                        "isSelfid": response[0].data[0].isSelfid,
                        "showDefault": false
                    }));
                }
                else {
                    $(this.el).hide();
                }
            }
            else {
                $(this.el).append(_template({
                    "conti": response[0].data[0].conti,
                    "isClosed": response[0].data[0].accountClosed,
                    "isSelfid": response[0].data[0].isSelfid,
                    "showDefault": true
                }));
            }
//			If user is promotore, disable nuova button and operazioni combo
            if(this.options.isPromotore)
            {
                $(this.el).find('.button_select').hide()
                $('.gray_table').find('.operations').hide();
            }
        }
        else {
            $(this.el).append(_template({
                "conti": [],
                "isClosed": false,
                "isSelfid": false,
                "showDefault": true
            }));
            wkscommerciale.log.doPushLog(this.options);
            // Push notification
        }
        wkscommerciale.getWkscParam('FLAG_PARTITA_PRENOTATE', _.bind(function(response){
                if(_.has(response, 'status') && response.status === 'success') {
                    var data = _.has(response, 'data') && _.isArray(response.data) ? response.data : [];
                    if( ! wkscommerciale.checkIsEmpty(data) && _.isObject(data[0])) {
                        if(_.has(data[0], 'FLAG_PARTITA_PRENOTATE') && data[0].FLAG_PARTITA_PRENOTATE !== 'Y') {
                            $('li#partitaPrenotate').remove();
                        }
                    }
                }
                $(window).trigger('cardmaster:loaded', this.$el);
            },this),
            _.bind(function (error) {})
        );
        $(this.el).wkscspinner('remove');
        $(".operations a[data-load-card]").click(function(e)
        {
            var $target = $(e.currentTarget);
            wkscustomer.partitaConto = {
                'contoId' : $target.attr('data-conto-id'),
                'numConto' : $target.attr('data-num-conto'),
                'contoDesc' : $target.attr('data-conto-desc')
            }
            customCardLoader({
                loadType: 'slidein',
                cardSize: 'size_enormous',
                cardName: window.wkscustomerContext+'/assets/cards/3.2.4.partite_prenotate.html'
            });
        });

        $(".operations a[data-load-card-antici]").click(function(e)
        {
            var $target = $(e.currentTarget);
            wkscustomer.anttraConto = {
                'contoId' : $target.attr('data-conto-id'),
                'numConto' : $target.attr('data-num-conto'),
                'contoDesc' : $target.attr('data-conto-desc')
            }

            customCardLoader({
                loadType: 'slidein',
                cardSize: 'size_enormous',
                cardName: window.wkscustomerContext+'/assets/cards/3.2.5.anticipo_transato.html'
            });
        });

        $("[sm-open-h2oadaptor-conticombo]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            var $target = $(e.currentTarget),
                smName = $target.attr('smName'),
                inputParams = $target.attr('value');
            if(smName === 'ListaMovimentiConto') {
                window.wkscustomer.selectedListanumeroConto = $(e.currentTarget).attr("data-ref-numberconto");
                window.wkscustomer.selectedListacontoId = $(e.currentTarget).attr("data-ref-contoId");
                wkscustomer.selectedContoDesc = $(e.currentTarget).attr("data-ref-contodesc");
                var get13CifeCollection = new wkscustomer.collections.get13Cifre();
                wkscustomer.isNumerato = false;
                if( window.wkscustomer.selectedListanumeroConto == "numerato"){
                    wkscustomer.isNumerato = true;
                    $.when(get13CifeCollection.fetch(wkscommerciale.utils.fetchCallback({
                        "idConto":window.wkscustomer.selectedListacontoId,
                    }))).done(function(response){
                        if(_.size(response.data) > 0 && response.status=="success")
                        {
                            window.wkscustomer.selectedListanumeroConto = response.data[0];
                            wkscustomer.openListaMoviementi(e);
                        }
                        else
                        {
                            wkscommerciale.notifyError.pushError("Error Technico");
                        }
                    });
                }
                else {
                    wkscustomer.openListaMoviementi(e);
                }

            } else {
                wkscSMHandler.openLink_smAdaptor({smname: smName, outparams: $target.attr('smOutParams'), inputparams: inputParams, newtab: $target.attr('newtab'), iframe: $target.attr('iframe')});
            }
            return false;
        });
        $("[sm-open-h2oadaptor-newtab-conticombo]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            if ($(e.currentTarget).attr('value') != "EMPTY")
            {
                wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), newtabie: $(e.currentTarget).attr('newtabie'), iframe: $(e.currentTarget).attr('iframe')});
            }
            else
            {
                wkscSMHandler.openSM_IENewTab({url: $(e.currentTarget).attr('smName')});
            }
            return false;
        });
        $("#contichiusi").click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr('soggettoid'));
            wkscApp.setTipoConto("01");
            customCardLoader({
                loadType: "slidein",
                cardSize: "size_small",
                cardName: window.wkscustomerContext+"/assets/cards/3.8.1.conti_chiusura_card.html"
            });
            return false;
        });
        wkscommerciale.log.doPopLog(this.options);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
wkscustomer.views.ContiEServizi_Conti = wkscommerciale.views.WksMasterView.extend({
    el: $('#current_account_accounts'),
    initialize: function(options) {
        this.options = options;
        this.soggettoId = options.soggettoId;
        this.tipoSoggetto = options.tipoSoggetto;
        this.questionarioInfoView = options.questionarioInfoView;
        this.pogEnabled = options.pogEnabled;
        this.complianceMandatory = options.complianceMandatory;
        $(this.el).wkscspinner({css: 'large'});
        $('#current_account_cards').wkscspinner({css: 'large'});
        $('#current_account_viacard_telepass').wkscspinner({css: 'large'});
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/conti"));
        var response = this.collection.toJSON();
        var contiIsAuthorized = null, contiData = [], contiIsClosed = false, contiIsSelfId = false, contiShowDefault = true;
        var carteData = [], carteIsClosed = false;
        var viaCardData = [];
        if (_.size(response[0].data) > 0) {
            contiData = response[0].data[0].conti;
            contiIsClosed = response[0].data[0].accountClosed;
            contiIsSelfId = response[0].data[0].isSelfid;
            if (_.size(response[0].data[0].conti) > 0) {
                contiShowDefault = false;
                contiIsAuthorized = response[0].data[0].conti[0].isAuthorized;
            }
            carteIsClosed = response[0].data[0].cardClosed
            if (_.size(response[0].data[0].carte) > 0) {
                carteData = response[0].data[0].carte;
            }
            if (_.size(response[0].data[0].visacardTelepass) > 0) {
                viaCardData = response[0].data[0].visacardTelepass;
            }
        }
        $(this.el).append(_template({
            'conti': contiData,
            'isClosed': contiIsClosed,
            'isSelfid': contiIsSelfId,
            'showDefault': contiShowDefault
        }));
        wkscommerciale.getWkscParam('FLAG_PARTITA_PRENOTATE', _.bind(function(response){
                if(_.has(response, 'status') && response.status === 'success') {
                    var data = _.has(response, 'data') && _.isArray(response.data) ? response.data : [];
                    if( ! wkscommerciale.checkIsEmpty(data) && _.isObject(data[0])) {
                        if(_.has(data[0], 'FLAG_PARTITA_PRENOTATE') && data[0].FLAG_PARTITA_PRENOTATE !== 'Y') {
                            $('li#partitaPrenotate').remove();
                        }
                    }
                }
            },this),
            _.bind(function (error) { }));
        this.$el.wkscspinner('remove');
        if (_.isBoolean(contiIsAuthorized)) {
            this.$el.toggle(contiIsAuthorized);
        }
        $(window).trigger('cardmaster:loaded', this.$el);
        wkscommerciale.log.doPushLog(this.options);

        new wkscustomer.views.ContiEServizi_Carte({
            el: $('#current_account_cards'),
            data: carteData,
            isClosed: carteIsClosed,
            logger: this.options.logger

        }).render();
        $('#current_account_cards').wkscspinner('remove');
        $(window).trigger('cardmaster:loaded', $('#current_account_cards'));

        var viaCardTelepassSection = _.bind(function(isNuovoBtnHasPopup) {
            wkscommerciale.log.doPushLog(this.options);
            var viaCardTelepassView = new wkscustomer.views.ContiEServizi_Viacard({
                el: $('#current_account_viacard_telepass'),
                data: viaCardData,
                soggettoId: this.soggettoId,
                tipoSoggetto: this.tipoSoggetto,
                questionarioInfoView: this.questionarioInfoView,
                pogEnabled: this.pogEnabled,
                complianceMandatory: this.complianceMandatory,
                isNuovoBtnHasPopup: isNuovoBtnHasPopup,
                logger: this.options.logger
            });
            if(this.pogEnabled) {
                this.questionarioInfoView.viaCardTelepassView = viaCardTelepassView;
            }
            viaCardTelepassView.render();
            wkscommerciale.log.doPopLog(this.options);
        }, this);
        wkscommerciale.log.doPushLog(this.options);
        if(this.pogEnabled && this.complianceMandatory === 'true') {
            wkscommerciale.ajaxRequests.get({
                url: window.wkscustomerContext + '/service/questionnaire/isShowPopupViacardTelepass',
                params: { soggettoId: this.soggettoId },
                onSuccess: _.bind(function(response) {
                    wkscommerciale.notifyError.pushErrorFromResponse(response);
                    var isNuovoBtnHasPopup = response.status === 'success' && _.size(response.data) > 0 && response.data[0] === true;
                    viaCardTelepassSection(isNuovoBtnHasPopup);
                }, this),
                onError: _.bind(function(response) {
                    wkscommerciale.notifyError.pushError(response.message);
                    viaCardTelepassSection(false);
                }, this)
            });
        } else {
            viaCardTelepassSection(false);
        }
        $('#current_account_viacard_telepass').wkscspinner('remove');
        $(window).trigger('cardmaster:loaded', $('#current_account_viacard_telepass'));
        $(".operations a[data-load-card]").click(function(e)
        {
            var $target = $(e.currentTarget);
            wkscustomer.partitaConto = {
                'contoId' : $target.attr('data-conto-id'),
                'numConto' : $target.attr('data-num-conto'),
                'contoDesc' : $target.attr('data-conto-desc')
            }
            customCardLoader({
                loadType: 'slidein',
                cardSize: 'size_enormous',
                cardName: window.wkscustomerContext+'/assets/cards/3.2.4.partite_prenotate.html'
            });
        });

        $(".operations a[data-load-card-antici]").click(function(e)
        {
            var $target = $(e.currentTarget);
            wkscustomer.anttraConto = {
                'contoId' : $target.attr('data-conto-id'),
                'numConto' : $target.attr('data-num-conto'),
                'contoDesc' : $target.attr('data-conto-desc')
            }

            customCardLoader({
                loadType: 'slidein',
                cardSize: 'size_enormous',
                cardName: window.wkscustomerContext+'/assets/cards/3.2.5.anticipo_transato.html'
            });
        });

        $('[sm-open-h2oadaptor-conticombo]').click(function(e) {
            e.stopPropagation();
            _window_event = e;
            var $target = $(e.currentTarget),
                smName = $target.attr('smName'),
                inputParams = $target.attr('value');
            if(smName === 'ListaMovimentiConto') {
                // inputParams = JSON.stringify({contoID: inputParams, numeroGiorni: 10});
                window.wkscustomer.selectedListanumeroConto = $(e.currentTarget).attr("data-ref-numberconto");
                window.wkscustomer.selectedListacontoId = $(e.currentTarget).attr("data-ref-contoId");
                wkscustomer.selectedContoDesc = $(e.currentTarget).attr("data-ref-contodesc");
                var get13CifeCollection = new wkscustomer.collections.get13Cifre();
                wkscustomer.isNumerato = false;
                if( window.wkscustomer.selectedListanumeroConto == "numerato"){
                    wkscustomer.isNumerato = true;
                    $.when(get13CifeCollection.fetch(wkscommerciale.utils.fetchCallback({
                        "idConto":window.wkscustomer.selectedListacontoId,
                    }))).done(function(response){
                        if(_.size(response.data) > 0 && response.status=="success")
                        {
                            window.wkscustomer.selectedListanumeroConto = response.data[0];
                            wkscustomer.openListaMoviementi(e);
                        }
                        else
                        {
                            wkscommerciale.notifyError.pushError("Error Technico");
                        }
                    });
                }
                else {
                    wkscustomer.openListaMoviementi(e);
                }
            } else {
                wkscSMHandler.openLink_smAdaptor({smname: smName, outparams: $target.attr('smOutParams'), inputparams: inputParams, newtab: $target.attr('newtab'), iframe: $target.attr('iframe')});
            }
            return false;
        });
        $('[sm-open-h2oadaptor-newtab-conticombo]').click(function(e) {
            e.stopPropagation();
            _window_event = e;
            if ($(e.currentTarget).attr('value') != 'EMPTY') {
                wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), newtabie: $(e.currentTarget).attr('newtabie'), iframe: $(e.currentTarget).attr('iframe')});
            } else {
                wkscSMHandler.openSM_IENewTab({url: $(e.currentTarget).attr('smName')});
            }
            return false;
        });
        $('#contichiusi').click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr('soggettoid'));
            wkscApp.setTipoConto('01');
            customCardLoader({
                loadType: 'slidein',
                cardSize: 'size_small',
                cardName: window.wkscustomerContext+'/assets/cards/3.8.1.conti_chiusura_card.html'
            });
            return false;
        });
        wkscommerciale.log.doPopLog(this.options);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});


wkscustomer.views.ContiEServizi_raisin = wkscommerciale.views.WksMasterView.extend({
    el: $('#current_account_raisin'),
    initialize: function(options) {
        this.options = options;
        this.soggettoId = options.soggettoId;
        this.tipoSoggetto = options.tipoSoggetto;
        $(this.el).wkscspinner({css: 'large'});
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/raisin"));
        var response = this.collection.toJSON();
        var contiIsAuthorized = null, contiData = [], contiIsClosed = false, contiIsSelfId = false, contiShowDefault = true;
        var carteData = [], carteIsClosed = false;
        var viaCardData = [];
        if (_.size(response[0].data) > 0) {
            contiData = response[0].data[0].conti;
            contiIsClosed = response[0].data[0].accountClosed;
            contiIsSelfId = response[0].data[0].isSelfid;
            if (_.size(response[0].data[0].conti) > 0) {
                contiShowDefault = false;
                contiIsAuthorized = response[0].data[0].conti[0].isAuthorized;
            }
            carteIsClosed = response[0].data[0].cardClosed
            if (_.size(response[0].data[0].carte) > 0) {
                carteData = response[0].data[0].carte;
            }
            if (_.size(response[0].data[0].visacardTelepass) > 0) {
                viaCardData = response[0].data[0].visacardTelepass;
            }
        }
        $(this.el).append(_template({
            'conti': contiData,
            'isClosed': contiIsClosed,
            'isSelfid': contiIsSelfId,
            'showDefault': contiShowDefault
        }));
        this.$el.wkscspinner('remove');
        if (_.isBoolean(contiIsAuthorized)) {
            this.$el.toggle(contiIsAuthorized);
        }
        wkscommerciale.getWkscParam('ENABLE_RAISIN', _.bind(function(response){
                if(_.has(response, 'status') && response.status === 'success') {
                    var data = _.has(response, 'data') && _.isArray(response.data) ? response.data : [];
                    if( ! wkscommerciale.checkIsEmpty(data) && _.isObject(data[0])) {
                        if(_.has(data[0], 'ENABLE_RAISIN') && data[0].ENABLE_RAISIN !== 'Y' && wkscommerciale.customer.tipoSoggetto==="Semplice") {
                            $('#current_account_raisin').remove();
                        }
                    }
                }
                $(window).trigger('cardmaster:loaded', this.$el);
            },this),
            _.bind(function (error) {})
        );


        $('#current_account_viacard_telepass').wkscspinner('remove');

        wkscommerciale.log.doPopLog(this.options);

        $("#contiraisinchiusi").click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr('soggettoid'));
            wkscApp.setTipoConto("07");
            customCardLoader({
                loadType: "slidein",
                cardSize: "size_small",
                cardName: window.wkscustomerContext+"/assets/cards/3.8.1.conti_chiusura_card.html"
            });
            return false;
        });
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
wkscustomer.views.ContiEServizi_Carte = Backbone.View.extend({
    el: $('#current_account_cards'),
    initialize: function(options) {
        this.options = options;
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/carte"));
        var response = this.options.data;

        if (response.length != 0) {
            if (response[0].isAuthorized) {
                $(this.el).show();
                $(this.el).append(_template({
                    "carte": response,
                    "showDefault": false,
                    "isClosed": this.options.isClosed
                }));
            }
            else {
                $(this.el).hide();
            }
        }
        else {
            $(this.el).append(_template({
                "carte": response,
                "showDefault": true,
                "isClosed": this.options.isClosed
            }));
        }
        $("[sm-open-h2oadaptor-cartecombo]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe'), attribute: $(e.currentTarget).attr('attribute')});
            return false;
        });
        $("[sm-open-h2oadaptor-newtab-cartecombo]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
            return false;
        });
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
wkscustomer.views.ContiEServizi_Viacard = Backbone.View.extend({
    el: $('#current_account_viacard_telepass'),
    initialize: function(options) {
        this.options = options;
        this.soggettoId = options.soggettoId;
        this.tipoSoggetto = options.tipoSoggetto;
        this.isDataLoaded = false;
        if(this.tipoSoggetto === 'Semplice' || this.tipoSoggetto === 'Plurintestazione' || this.tipoSoggetto === 'PlurintestazioneAZ' || this.tipoSoggetto === 'PlurintestazioneAZandPF' || isPogAz(this.tipoSoggetto)) {
            this.questionarioInfoView = options.questionarioInfoView;
            this.pogEnabled = options.pogEnabled;
            this.complianceMandatory = options.complianceMandatory;
            this.isNuovoBtnHasPopup = options.isNuovoBtnHasPopup;
        }
    },
    render: function() {
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/viacard"));
        var response = this.options.data;
        var isAuthorized = null;
        var showDefault = true;
        if (_.size(response) > 0) {
            isAuthorized = response[0].isAuthorized;
            showDefault = false;
        }
        $(this.el).append(_template({
            'viacard': response,
            'showDefault': showDefault
        }));
        this.isDataLoaded = true;
        if(!wkscommerciale.user.data.promotoreBSNew){//5051 blocking the showing of novuo button if it is promotori
            this.nuovoBtnRender();
        }
        $(this.el).wkscspinner('remove');
        if (_.isBoolean(isAuthorized) && ! isAuthorized) {
            this.$el.hide();
        }
        wkscommerciale.log.doPopLog(this.options);
        $(window).trigger('cardmaster:loaded', this.$el);
        $(window).trigger('scrollbar:resize', 'relative');
    },
    nuovoBtnRender: function() {
        var btnsSection = this.$('.viaCardButtonSection');
        var viaCardTelepassNuovoSMConfigAttributes = 'smName="GestioneViacard" smOutParams="" value="' + this.soggettoId + '" newtab="1" iframe="1"';
        var btnTemplate = '<div class="button">';
        btnTemplate += '<a href="javascript:void(0);" data-icon="+" id="viaCardTelepassNuovoBtn" class="button collar viaCardTelepassNuovoBtnWithBaloon" ' + viaCardTelepassNuovoSMConfigAttributes + ' sm-open-h2oadaptor>Nuovo</a>';
        btnTemplate += '</div>';
        var $nuovaBtn = $(btnTemplate);
        // remove if already nuova button present - we have to remove and add the button again to clear the already bounded events of the button
        btnsSection.find('#viaCardTelepassNuovoBtn').parents('.button').remove();
        if((this.tipoSoggetto === 'Semplice' || this.tipoSoggetto === 'Plurintestazione' || this.tipoSoggetto === 'PlurintestazioneAZ' || this.tipoSoggetto === 'PlurintestazioneAZandPF' || isPogAz(this.tipoSoggetto) ) && this.isNuovoBtnHasPopup) {
            var baloonTemplate = '<div class="viaCardTelepassNuovoBtnBaloon default-baloon" data-acts-as-baloon-on=".viaCardTelepassNuovoBtnWithBaloon" data-fix-top="-162px" data-fix-left="-200px" data-fix-bottom-left="235px" data-offset-left="" data-offset-top="">';
            baloonTemplate += '<p>Per richiedere un <strong>Telepass</strong> o una <strong>Viacard</strong> è necessario compilare prima il <strong>Questionario delle esigenze</strong></p>';
            baloonTemplate += '<div class="buttons">';
            baloonTemplate += '<a href="javascript:void(0);" class="button small telepass-viacard-baloon-exit" data-close-parent=".viaCardTelepassNuovoBtnBaloon">Annulla</a>';
            baloonTemplate += '<div class="clear"></div>';
            baloonTemplate += '</div>';
            baloonTemplate += '<div class="bottom"></div>';
            baloonTemplate += '</div>';
            var $viaCardTelepassNuovoBtnBaloon = $(baloonTemplate);
            $nuovaBtn.find('#viaCardTelepassNuovoBtn').removeAttr('sm-open-h2oadaptor');
            $nuovaBtn.append( $viaCardTelepassNuovoBtnBaloon );
        }
        // add the nuovo button
        $nuovaBtn.insertAfter( btnsSection.find('.title') );
        $(window).trigger('cardmaster:loaded', this.$el);
    },
    reloadView: function() {
        if(this.pogEnabled && this.complianceMandatory === 'true') {
            wkscommerciale.ajaxRequests.get({
                url: window.wkscustomerContext + '/service/questionnaire/isShowPopupViacardTelepass',
                params: { soggettoId: this.soggettoId },
                onSuccess: _.bind(function(response) {
                    wkscommerciale.notifyError.pushErrorFromResponse(response);
                    this.isNuovoBtnHasPopup = response.status === 'success' && _.size(response.data) > 0 && response.data[0] === true;
                    this.nuovoBtnRender();
                }, this),
                onError: _.bind(function(response) {
                    wkscommerciale.notifyError.pushError(response.message);
                }, this)
            });
        }
    }
});
wkscustomer.views.ContiEServizi_ServiziTelematici = wkscommerciale.views.WksMasterView.extend({
    el: $('#current_account_internet_banking'),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        $('#current_account_sella_box').wkscspinner({
            css: 'large'
        });
        $('#current_account_sms').wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var response = this.collection.toJSON();
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/servizi_telematici"));
        if (response[0].data.length != 0) {
            if(wkscommerciale.tipoSoggetto.get() != 'Azienda') {
                if (response[0].data[0].codiciInternetBanking.length != 0) {
                    if (response[0].data[0].codiciInternetBanking[0].isAuthorized) {
                        $(this.el).show();
                        $(this.el).append(_template({
                            "servizitelematici": response[0].data[0].codiciInternetBanking,
                            "showDefault": false,
                            "isClosed": response[0].data[0].codiciClosed,
                            "fdAltraBanca" : response[0].data[0].fdAltraBanca
                        }));
                    }
                    else {
                        $(this.el).hide();
                    }
                }
                else {
                    $(this.el).append(_template({
                        "servizitelematici": response[0].data[0].codiciInternetBanking,
                        "showDefault": true,
                        "isClosed": response[0].data[0].codiciClosed,
                        "fdAltraBanca" : response[0].data[0].fdAltraBanca
                    }));
                }
            }
            else
                $(this.el).hide();
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.ContiEServizi_SellaBox({
                el: $('#current_account_sella_box'),
                data: response[0].data[0].sellaBox,
                pluri: response[0].data[0].pluri,
                logger: this.options.logger
            }).render();
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.ContiEServizi_ServizioSMS({
                el: $('#current_account_sms'),
                data: response[0].data[0].servizioSMS,
                ibCode: response[0].data[0].codiceInternet,
                logger: this.options.logger
            }).render();
        }
        else {
            // Push notification
            $(this.el).append(_template({
                "servizitelematici": [],
                "showDefault": true,
                "isClosed": false,
                "fdAltraBanca" : false
            }));
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.ContiEServizi_SellaBox({
                el: $('#current_account_sella_box'),
                data: [],
                pluri: true,
                logger: this.options.logger
            }).render();
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.ContiEServizi_ServizioSMS({
                el: $('#current_account_sms'),
                data: [],
                ibCode: "",
                logger: this.options.logger
            }).render();
        }
        $(window).trigger('cardmaster:loaded', $("#current_account_sella_box"));
        $(window).trigger('cardmaster:loaded', $("#current_account_sms"));
        $("[sm-open-h2oadaptor-telematicicombo]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
            return false;
        });
        $("[sm-open-h2oadaptor-sellaboxcmb]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
            return false;
        });
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.ContiEServizi_SellaBox = Backbone.View.extend({
    el: $('#current_account_sella_box'),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var response = this.options.data;
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/sella_box"));
        if (response.length != 0) {
            if (response[0].isAuthorized) {
                $(this.el).show();
                $(this.el).append(_template({
                    "pluri": this.options.pluri,
                    "sellaBox": response,
                    "showDefault": false
                }));
            }
            else {
                $(this.el).hide();
            }
        }
        else {
            $(this.el).append(_template({
                "pluri": this.options.pluri,
                "sellaBox": response,
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');

        var sella_box_SuccessCb = _.bind(function(response) {
            var key =  'SELLABOX_DESC_'+ wkscommerciale.user.abiCode+'';
            var desciption = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], key) ? response.data[0][key] : '';
            if(_.size(desciption) > 0 )
            {
                $('#sella_box_id').text(desciption);
                $('#sellabox_label').text(desciption+" e Rendicontazioni");
            }
            else
            {
                $('#sella_box_id').text('SellaBox');
                $('#sellabox_label').text("SellaBox/Modalità invio comunicazioni");
            }
        }, this);
        
        var successCb = _.bind(function(response) {
            var enableBank = _.size(response.data) > 0 && _.has(response.data[0], 'SELLABOX_VISUALIZZA_BUTTON') ? response.data[0].SELLABOX_VISUALIZZA_BUTTON : '';
            if(_.size(enableBank) > 0 ) {
                var arr = enableBank.split(';');
                if(_.contains(arr,wkscommerciale.user.abiCode)){
                    $('#visualizzaButton').show();
                }
                else{
                    $('#visualizzaButton').hide();
                }
            }
            else{
            $('#visualizzaButton').hide();
            }
        }, this);
        var errorCb = _.bind(function(response) {
        	$('#visualizzaButton').hide();
            wkscommerciale.notifyError.pushError(response);
        }, this);
        
        wkscommerciale.getWkscParam('SELLABOX_VISUALIZZA_BUTTON', successCb, errorCb);


        wkscommerciale.ajaxRequests.get({
            url: 'service/params/wkscParameterValues',
            params: {
                paramIds: 'SELLABOX_DESC_'+ wkscommerciale.user.abiCode+''
            },
            contentType: 'application/json; charset=utf-8',
            onSuccess: sella_box_SuccessCb,
            // onError: ErrorCb
        });
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.ContiEServizi_ServizioSMS = Backbone.View.extend({
    el: $('#current_account_sms'),
    initialize: function(options) {
        this.options = options;
    },
    events: {
        'click .catEvntTrigger' : 'catEvntTriggerFn'
    },
    render: function() {
        var response = this.options.data;
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/servizio_sms"));
        if (response.length != 0) {
            if (response[0].isAuthorized) {
                $(this.el).show();
                $(this.el).append(_template({
                    "servizioSMS": response,
                    "ibCode": this.options.ibCode,
                    "showDefault": false
                }));
            }
            else {
                $(this.el).hide();
            }
        }
        else {
            $(this.el).append(_template({
                "servizioSMS": response,
                "ibCode": "",
                "showDefault": true
            }));
        }
        $("[sm-open-h2oadaptor-smscombo]").click(function(e) {
            e.stopPropagation();
            if( ! _.isUndefined(e.ctrlKey)) _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
            return false;
        });
        $("[sm-open-newtab-combo]").click(function(e) {
            e.stopPropagation();
            if( ! _.isUndefined(e.ctrlKey)) _window_event = e;
            wkscSMHandler.openSM_IENewTab({url: "doOTHERRedirect.jsp?link=" + $(e.currentTarget).attr('smRef') + "&params=" + $(e.currentTarget).attr('params'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
            return false;
        });
        //4950
        wkscommerciale.profiles.showElOnGrant('NOTIFICATION_MANAGEMENT',$('.nuovoCombo li ').find('a[data-ref-category = "MemoShop"]'));
        wkscommerciale.profiles.showElOnGrant('SMS',$('.nuovoCombo li ').find('a[data-ref-category = "SmsBankingNo"]'));
        wkscommerciale.profiles.showElOnGrant('SERVIZISMS',$('.nuovoCombo li ').find('a[data-ref-category = "SmsTrading"]'));
        wkscommerciale.profiles.showElOnGrant('OTP_SMS',$('.nuovoCombo li ').find('a[data-ref-category = "SmsBankingYes"]'));

        $('[sm-open-memoshop]').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if( ! _.isUndefined(e.ctrlKey)) _window_event = e;
            var _t = $(e.currentTarget);
            var smName = _t.attr('smName');
            var smOutParams = _t.attr('smOutParams');
            var smInputParams = _t.attr('value');
            var newTab = _t.attr('newtab');
            var newTabIe = _t.attr('newtabie');
            var iframe = _t.attr('iframe');
            wkscSMHandler.openLink_smAdaptor({
                smname: smName,
                outparams: smOutParams,
                inputparams: smInputParams,
                newtab: newTab,
                newtabie: newTabIe,
                iframe: iframe
            });
        });
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    catEvntTriggerFn : function(e) {
        e.preventDefault();
        _window_event = e;
        var _target = $(e.currentTarget);
        var category = _target.attr('data-category');
        var services = _target.attr('data-services');
        var nuovoCombo = $('.nuovoCombo');
        switch(category) {
            case 'SmsBanking':
                if( ! wkscommerciale.checkIsEmpty(services) && (services.toString()).indexOf('Sms Conferma') > -1) {
                    nuovoCombo.find('[data-ref-category="' + category + 'Yes"]').trigger('click');
                } else {
                    nuovoCombo.find('[data-ref-category="' + category + 'No"]').trigger('click');
                }
                break;
            case 'InfoCard':
            case 'SmsTrading':
                nuovoCombo.find('[data-ref-category="SmsTrading"]').trigger('click');
                break;
            case 'MemoShop':
                nuovoCombo.find('[data-ref-category="' + category +'"]').trigger('click');
                break;
            default:
                // do nothing
                break;
        };
    }
});
wkscustomer.views.ContiEServizi_ServiziDiCustodia = wkscommerciale.views.WksMasterView.extend({
    el: $('#current_account_custody'),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        $('#current_account_wallet').wkscspinner({
            css: 'large'
        });
        /*		$('#current_account_rid').wkscspinner({
         css: 'large'
         });*/
        $('#current_account_permanent_order').wkscspinner({
            css: 'large'
        });
        $('#current_account_pos_business').wkscspinner({
            css: 'large'
        });
        $('#current_account_casellario').wkscspinner({
            css : 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.scopoDelRapportoLoading = [];
    },
    events: {
        'mouseover .scopoDelRapporto': 'fetchScopoDelRapporto'
    },
    render: function() {
        var response = this.collection.toJSON();
        //wkscommerciale.notifyError.pushError(response[0].message);
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/servizi_di_custodia"));
        if (response[0].data.length != 0) {
            if (response[0].data[0].serviziDiCustodia.length != 0) {
                if (response[0].data[0].serviziDiCustodia[0].isAuthorized) {
                    $(this.el).show();
                    $(this.el).append(_template({
                        "serviziDiCustodia": response[0].data[0].serviziDiCustodia,
                        "showDefault": false
                    }));
                }
                else {
                    $(this.el).hide();
                }
            }
            else {
                $(this.el).append(_template({
                    "serviziDiCustodia": response[0].data[0].serviziDiCustodia,
                    "showDefault": true
                }));
            }
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.ContiEServizi_RapportiDiPortafoglio({
                el: $('#current_account_wallet'),
                data: response[0].data[0].rappotiDiPortafoglio,
                logger: this.options.logger
            }).render();
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.ContiEServizi_CasellarioPostale({
                el : $('#current_account_casellario'),
                data : response[0].data[0].casellarioPostale,
                logger: this.options.logger
            }).render();
            /*
             wkscommerciale.log.doPushLog(this.options);
             new wkscustomer.views.ContiEServizi_OrdiniPermanentiRID({
             el: $('#current_account_rid'),
             data: response[0].data[0].ordiniPermanentiRID,
             logger: this.options.logger
             }).render();
             */
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.ContiEServizi_OrdiniPermanentiDiBonifico({
                el: $('#current_account_permanent_order'),
                data: response[0].data[0].ordiniPermanentiDiBonifico,
                logger: this.options.logger
            }).render();
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.ContiEServizi_POSECOMMERCE({
                el: $('#current_account_pos_business'),
                data: response[0].data[0].pos,
                ottocifrePOS: response[0].data[0].ottocifrePos,
                theSubjectType:response[0].data[0].subjectType,
                caePosNewLink:response[0].data[0].caePosNewLink,
                logger: this.options.logger
            }).render();
            //PORTAHC-1528 - New view for Commerce created to be displayed only for Business Customer.
            //	if(response[0].data[0].subjectType !="Semplice" && response[0].data[0].subjectType!="Plurintestazione"){
            // Display E-Commerce view.
            $('#current_account_ecommerce_business').show();
            wkscommerciale.log.doPushLog(this.options);
            new wkscustomer.views.ContiEServizi_ECOMMERCE({
                el: $('#current_account_ecommerce_business'),
                data: response[0].data[0].ecommerce,
                ottocifrePOS: response[0].data[0].ottocifrePos,
                theSubjectType:response[0].data[0].subjectType,
                caeEcommNewLink:response[0].data[0].caeEcommNewLink,
                logger: this.options.logger
            }).render();
            //	}
            $(window).trigger('cardmaster:loaded', $('#current_account_wallet'));
            $(window).trigger('cardmaster:loaded', $('#current_account_rid'));
            $(window).trigger('cardmaster:loaded', $('#current_account_permanent_order'));

            $(window).trigger('cardmaster:loaded', $('#current_account_pos_business'));
            $(window).trigger('cardmaster:loaded', $('#current_account_ecommerce_business'));
            $(window).trigger('cardmaster:loaded', $('#current_account_casellario'));
            $("a[sm-redirect]").click(function(e) {
                var _smname = $(e.target).attr('smRef');
                var _outparam = $(e.target).attr('smOutParams');
                var _value = $(e.target).attr('value');
                doOnSmRedirect(_smname, _outparam, _value);
            });
        }
        else {
            // Push notification
            $("#current_account_pos_business").css("display", "none");
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    fetchScopoDelRapporto: function(e) {
        scopeDelRapportoTooltip.call(this, e);
    }
});
//PORTAHC-1528: View definition for wkscustomer.views.ContiEServizi_ECOMMERCE
wkscustomer.views.ContiEServizi_ECOMMERCE = Backbone.View.extend({
    el: $('#current_account_ecommerce_business'),
    initialize: function(options) {
        this.options = options;
        this._template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/ecommerce"));
    },
    render: function() {
        this.response = this.options.data;
        this.ottocifrepos = this.options.ottocifrePOS;
        this.theSubjectType = this.options.theSubjectType;
        this.hasDisattivi=_.size(this.response.disattivo)>0;
        this.caeEcommNewLink = this.options.caeEcommNewLink;

        /*this.caeEcomNewLink = "";
        var caeSuccessCb = _.bind(function(response) {
            this.caeEcomNewLink =  response.data[0].CAE_NEWLINK;
        }, this);
        var caeErrorCb = _.bind(function(response) {
            wkscommerciale.notifyError.pushError(response);
        }, this);
        wkscommerciale.getWkscParam('CAE_NEWLINK', caeSuccessCb, caeErrorCb);*/

        var log = new wkscommerciale.log.wkscLogger("3.2.1.current_account_commerce_disattivo_card.html",
            "WKSC-ECCL",
            "idsoggetto=" + wkscommerciale.idSoggetto.get());
        wkscommerciale.cards[wkscustomerContext+"/assets/cards/3.2.1.current_account_commerce_disattivo_card.html"] = _.bind(function() {
            wkscommerciale.template.load([
                window.wkscustomerContext+"/assets/templates/conti_e_servizi/commerce_disattivi",
            ],_.bind(function(){
                new wkscustomer.views.ContiEServizi_ECOMMERCE_Disattivo({
                    el:$('.active section[current_account_ecommerce_disattivi]'),
                    data:this.response.disattivo,
                    ottocifrepos:this.ottocifrepos,
                    theSubjectType:this.theSubjectType,
                    //caeEcomNewLink:this.caeEcomNewLink,
                    caeEcommNewLink:this.caeEcommNewLink,
                    logger: log
                }).render();
            },this));
        },this);



        this.showNewNuovoLink = false;
        wkscommerciale.getWkscParam('ECOMM_NUOVO_LINK_DATE', _.bind(function(resp){
            var newLinkDate = resp.status === 'success' && _.size(resp.data) > 0 && _.has(resp.data[0], 'ECOMM_NUOVO_LINK_DATE') ? resp.data[0].ECOMM_NUOVO_LINK_DATE : '';
            if (_.size(newLinkDate) > 0) {
                var formattedNewLinkDate = Date.parseExact(newLinkDate, 'dd-MM-yyyy');
                if (formattedNewLinkDate) {
                    var isToday = Date.today().equals(formattedNewLinkDate);
                    var isGreaterThanToday = Date.today().isAfter(formattedNewLinkDate);
                    this.showNewNuovoLink = isToday || isGreaterThanToday;
                }
            }
            this.renderECommerce();
        },this), _.bind(function(){
            this.renderECommerce();
        },this));
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    },
    renderECommerce : function()
    {
        $(this.el).append(this._template({
            "ecommerce": this.response.attivo,
            "ottocifrePOS": this.ottocifrepos,
            "theSubjectType":this.theSubjectType,
            "disattivi":this.hasDisattivi,
            "showNewLink" : this.showNewNuovoLink,
            "caeEcommNewLink" : this.caeEcommNewLink
        }));
        //PORTAHC-4967 check the operation Layout.CAE.isEnabled to hide/show CAE button
        wkscommerciale.profiles.showElOnGrant('ENABLE_CAE_LAYOUT',$('#ecom_cae_btn'));

        $("li a[sm-open-h2oadaptor-commercecombo]").click(function(e) {
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
        });
        $(window).trigger('cardmaster:loaded', $(this.el));
        $(window).trigger('scrollbar:resize', 'relative');
    }
});
//PORTAHC-1668:
wkscustomer.views.ContiEServizi_ECOMMERCE_Disattivo = Backbone.View.extend({
    el:$('.active section[current_account_ecommerce_disattivi]'),
    initialize: function(options) {
        this.options = options;
        this.logger = this.options.logger;
    },
    render:function(){
        wkscommerciale.log.doPushLog({logger: this.logger});
        var response = this.options.data,
            ottocifrepos=this.options.ottocifrepos,
            theSubjectType=this.options.theSubjectType,
            caeEcommNewLink=this.options.caeEcommNewLink,
            _template=_.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/commerce_disattivi"));
        $(this.el).html(_template({
            "ecommerce": response,
            "ottocifrePOS": ottocifrepos,
            "theSubjectType":theSubjectType,
            "caeEcommNewLink" : this.caeEcommNewLink
        }));
        $("li a[sm-open-h2oadaptor-commercecombo-disattivo]").click(function(e) {
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
        });
        $(window).trigger('cardmaster:loaded', $(this.el));
        wkscommerciale.log.doPopLog({logger: this.logger});
    }
});
wkscustomer.views.ContiEServizi_POSECOMMERCE = Backbone.View.extend({
    el: $('#current_account_pos_business'),
    initialize: function(options) {
        this.options = options;

    },
    render: function() {
        var response = this.options.data;
        var ottocifrepos = this.options.ottocifrePOS;
        var theSubjectType = this.options.theSubjectType;
        var caePosNewLink = this.options.caePosNewLink;
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/pos_ecommerce")),
            hasDisattivi=(response.disattivo.length>0)?true:false,that=this;

        var log = new wkscommerciale.log.wkscLogger("3.2.1.current_account_pos_disattivo_card.html",
            "WKSC-POCL",
            "idsoggetto=" + wkscommerciale.idSoggetto.get());

        wkscommerciale.cards[wkscustomerContext+"/assets/cards/3.2.1.current_account_pos_disattivo_card.html"] = function() {
            wkscommerciale.template.load([
                wkscustomerContext+"/assets/templates/conti_e_servizi/pos_disattivi",
            ],function(){
                new wkscustomer.views.ContiEServizi_POSECOMMERCE_Disattivo({
                    el:$('.active section[current_account_pos_disattivi]'),
                    data:response.disattivo,
                    ottocifrepos:that.options.ottocifrepos,
                    theSubjectType:that.options.theSubjectType,
                    caePosNewLink:that.options.caePosNewLink,
                    logger: log
                }).render();
            });
        };
        //if (response && response.length && response.length != 0) {
        $(this.el).append(_template({
            "pos": response.attivo,
            "ottocifrePOS": ottocifrepos,
            "theSubjectType":theSubjectType,
            "disattivi":hasDisattivi,
            "caePosNewLink":caePosNewLink
        }));
        //PORTAHC-4967 check the operation Layout.CAE.isEnabled to hide/show CAE button
        wkscommerciale.profiles.showElOnGrant('ENABLE_CAE_LAYOUT',$('#pos_cae_btn'));

        $("li a[sm-open-h2oadaptor-poscombo]").click(function(e) {
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
        });
        /*}
         else
         {
         $("#current_account_pos_business").css("display", "none");
         }*/
        $(window).trigger('cardmaster:loaded', $(this.el));
        $(window).trigger('scrollbar:resize', 'relative');
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    }
});
//PORTAHC-1668:
wkscustomer.views.ContiEServizi_POSECOMMERCE_Disattivo = Backbone.View.extend({
    el:$('.active section[current_account_pos_disattivi]'),
    initialize: function(options) {
        this.options = options;
        this.logger = this.options.logger;
    },
    render:function(){
        wkscommerciale.log.doPushLog({logger: this.logger});

        var response = this.options.data,
            ottocifrepos=this.options.ottocifrepos,
            theSubjectType=this.options.theSubjectType,
            caePosNewLink = this.options.caePosNewLink;
            _template=_.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/pos_disattivi"));
        $(this.el).html(_template({
            "pos": response,
            "ottocifrePOS": ottocifrepos,
            "theSubjectType":theSubjectType,
            "caePosNewLink":caePosNewLink
        }));
        $("li a[sm-open-h2oadaptor-poscombo-disattivo]").click(function(e) {
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
        });
        $(window).trigger('cardmaster:loaded', $(this.el));
        $(window).trigger('scrollbar:resize', 'relative');
        wkscommerciale.log.doPopLog({logger : this.logger});
    }
});
wkscustomer.views.ContiEServizi_CasellarioPostale = Backbone.View.extend({
    el : $('#current_account_casellario'),
    initialize: function(options) {
        this.options = options;
        this.scopoDelRapportoLoading = [];
    },
    events: {
    },
    render : function () {
        var response = this.options.data;
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext + "/assets/templates/conti_e_servizi/casellario_postale"));
        $(this.el).append(_template({
            "casellarioPostale" : response,
        }));
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.ContiEServizi_RapportiDiPortafoglio = Backbone.View.extend({
    el: $('#current_account_wallet'),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var response = this.options.data;
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/rapporti_di_portafoglio"));
        if (response.length != 0) {
            if (response[0].isAuthorized)
            {
                $(this.el).append(_template({
                    "rapportiDiPortafoglio": response,
                    "showDefault": false
                }));
            }
            else
            {
                $(this.el).hide();
            }
        }
        else {
            $(this.el).append(_template({
                "rapportiDiPortafoglio": response,
                "showDefault": true
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    }
});
/*wkscustomer.views.ContiEServizi_OrdiniPermanentiRID = Backbone.View.extend({
 el: $('#current_account_rid'),
 initialize: function(options) {
 this.options = options;
 },
 render: function() {
 var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/ordini_permanenti_rid"));
 $(this.el).append(_template({
 "permanentiRid": this.options.data
 }));
 $("[sm-open-h2oadaptor-rdicombo]").click(function(e) {
 e.stopPropagation();
 _window_event = e;
 wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
 return false;
 });
 $("[sm-open-h2oadaptor-newtab-rdicombo]").click(function(e) {
 e.stopPropagation();
 _window_event = e;
 wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
 return false;
 });
 $(this.el).wkscspinner('remove');
 wkscommerciale.log.doPopLog(this.options);
 }
 });
 */
wkscustomer.views.ContiEServizi_OrdiniPermanentiDiBonifico = Backbone.View.extend({
    el: $('#current_account_permanent_order'),
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/conti_e_servizi/ordini_permanenti_di_bonifico"));
        $(this.el).append(_template({
            "permanentiDiBonifico": this.options.data
        }));
        $("[sm-open-h2oadaptor-bonificocombo]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
            return false;
        });
        $("[sm-open-h2oadaptor-newtab-bonificocombo]").click(function(e) {
            e.stopPropagation();
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
            return false;
        });
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
    }
});
/* Occasionale Customer Views and sub views */
/* This view, wkscApp.OccasionaleCustomerViewInit is triggered from wksc-init.js
 * line 1138. This view is responsible for loading the parent templates to be rendered
 * on the card 3.1.gestione_portatori_e_fiduciarie_card.html
 * */
wkscustomer.views.OccasionaleCustomerViewInit = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var self = this;
        // Loads the parent templates required for the card.
        wkscommerciale.log.doPushLog(self.options);
        wkscommerciale.template.load([
            window.wkscustomerContext+"/assets/templates/occasionale/occasionale_customer_info",
            window.wkscustomerContext+"/assets/templates/occasionale/occasionale_collegamenti",
            window.wkscustomerContext+"/assets/templates/occasionale/occasionale_soggetti_abilitati"
        ], function() {
            // Renders the account info view.
            wkscommerciale.log.doPushLog(self.options);
            new wkscustomer.views.OccasionaleCustomerInfo({el: $("#private_customer_1"), logger: self.options.logger}).render();
            // Collection instances created for collegamenti and Soggetti abilitati.
            var occasionaleCollegamenti = new wkscApp.OccasionaleCollegamentiList(); //customermodels.js @line636
            //var occasionaleSoggettiAbilitati = new wkscApp.OccasionaleSoggettiAbilitatiList(); //customermodels.js @line648
            // Backbone view initialized for collegamenti and Soggetti abilitati.
            wkscommerciale.log.doPushLog(self.options);
            var OccasionaleCollegamenti = new wkscustomer.views.OccasionaleCollegamenti({el: $("#private_customer_3"), collection: occasionaleCollegamenti, logger: self.options.logger});
            if(OccasionaleCollegamenti) {
                wkscommerciale.consolle.log('OccasionaleCollegamenti variable is used!');
            }
            //wkscommerciale.log.doPushLog(self.options);
            //var OccasionaleSoggettiAbilitati = new wkscApp.OccasionaleSoggettiAbilitati({el: $("#private_customer_4"), collection: occasionaleSoggettiAbilitati,logger:self.options.logger});
            //self.activityWatch();
            wkscommerciale.log.doPopLog(self.options);
        });
        wkscommerciale.log.doPopLog(self.options);
    },
    activityWatch: function() {
        setInterval(function() {
            if (fetchRequestQueue.length === 2) {
                fetchRequestQueue.clear();
            }}, 1000);
    }
});
/* It is for modularity that we have created this view. The section private_customer_1
 * have 3 other <div> that renders the customer data, catalina firma button, and
 * the button group container.
 */
wkscustomer.views.OccasionaleCustomerInfo = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var self = this;
        // Loads the wkscspinner to the el, #private_customer_1
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.log.doPushLog(self.options);
        //Loads the child templates to be rendered for the view for data, catalina firma and the button group
        wkscommerciale.template.load([
            window.wkscustomerContext+"/assets/templates/occasionale/occasionale_customer_data",
            window.wkscustomerContext+"/assets/templates/occasionale/occasionale_customer_external_button",
            window.wkscustomerContext+"/assets/templates/occasionale/occasionale_customer_button_group",
            window.wkscustomerContext+"/assets/templates/occasionale/occasionale_commerical",
        ], function() {
            // Collection instance of the customer list is being created.
            //customermodels.js @line623

            // Account data view is being initialized.
            wkscommerciale.log.doPushLog(self.options);
            var occasionaleCustomer = new wkscApp.OccasionaleCustomerList();
            var OccasionaleCustomerData = new wkscustomer.views.OccasionaleCustomerData({
                el: $(self.el).find(".data"),
                parentEl: $(self.el),
                _template: _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/occasionale/occasionale_customer_data")),
                collection: occasionaleCustomer,
                logger: self.options.logger
            });
            if(OccasionaleCustomerData) {
                wkscommerciale.consolle.log('OccasionaleCustomerData variable is used!');
            }
            wkscommerciale.log.doPopLog(self.options);
        });
        wkscommerciale.log.doPopLog(self.options);
    }
});
/*
 * View that render the account data on the DOM. The views wkscApp.OccasionaleCustomerExternalButtons
 * and wkscApp.OccasionaleCustomerButtonGroup are depended on this view rendering.
 */
wkscustomer.views.OccasionaleCustomerData = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            contoId: wkscommerciale.idAccount.get()
        });
    },
    render: function() {
        var self = this;
        var customerDataTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/occasionale/occasionale_customer_info"));
        $(self.options.parentEl).html(customerDataTemplate())
        var customerData = this.collection.toJSON();
        wkscommerciale.notifyError.pushError(customerData[0].message);
        if (customerData[0].authorize) {
            if (customerData[0].data.length !== 0) {
                if (customerData[0].data[0].dettagliSoggetto.length !== 0) {
                    // underscore template rendering for account data to DOM element <div> with class '.data'
                    $(self.options.parentEl).find(".data").html(this.options._template({"data": customerData[0].data[0].dettagliSoggetto[0]}));
                    // Rendering the wkscApp.OccasionaleCustomerExternalButtons, and the account 'cifre' is being send along with it as view param.
                    /* As per the comment on ticket https://svil.bansel.it/jira/browse/PORTAHC-580?focusedCommentId=429365&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-429365
                     * the view below is now hidden
                     new wkscApp.OccasionaleCustomerExternalButtons({
                     el: $(self.options.parentEl).find(".buttons"),
                     _template: _.template(wkscommerciale.template.get("occasionale/occasionale_customer_external_button")),
                     cifre: customerData[0].data[0].dettagliSoggetto[0].cifre,
                     isAlert:customerData[0].data[0].dettagliSoggetto[0].alerts.cartelliniFirmaAlert
                     }).render();
                     */
                    var commSuccess = _.bind(function(response) {
                        if(response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0],'ENABLE_COMMERCIALE_BY_IDCONTO') && response.data[0].ENABLE_COMMERCIALE_BY_IDCONTO ==="Y"){

                            wkscommerciale.profiles.checkProfile('ENABLE_COMMERCIALE_PERCONTO', function(hasGrant) {
                                if(hasGrant) {
                                    var occasionaleCustomerCommerical = new wkscApp.OccasionaleCustomerCommerical();
                                    var ccasionaleCustomerCommericalData= new wkscustomer.views.OccasionaleCustomerCommericalData({
                                        parentEl: $(self.options.parentEl),
                                        _template: _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/occasionale/occasionale_commerical")),
                                        collection:occasionaleCustomerCommerical
                                    });
                                }
                            });
                        }
                    }, this);
                    var commError = _.bind(function(response) {
                        wkscommerciale.notifyError.pushFromFetchError(response, []);

                    }, this);

                    wkscommerciale.ajaxRequests.get({
                        url: 'service/params/wkscParameterValues',
                        params: {
                            paramIds: 'ENABLE_COMMERCIALE_BY_IDCONTO'
                        },
                        contentType: 'application/json; charset=utf-8',
                        onSuccess: commSuccess,
                        onError: commError
                    });
                    // Rendering the new wkscApp.OccasionaleCustomerButtonGroup, 'tippo' is the view param send to the view which is required while rendering.
                    wkscommerciale.log.doPushLog(self.options);
                    new wkscustomer.views.OccasionaleCustomerButtonGroup({
                        el: $(self.options.parentEl).find(".subareas"),
                        _template: _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/occasionale/occasionale_customer_button_group")),
                        tipo: customerData[0].data[0].dettagliSoggetto[0].tipo,
                        logger: self.options.logger
                    }).render();
                }
                else {
                    //wkscommerciale.notifyError.pushError(self.collection.url + " returned empty array"); //Commented this line.PORTAHC-850
                }
            }
            else {
                //wkscommerciale.notifyError.pushError(self.collection.url + " returned empty array"); //Commented this line.PORTAHC-850
            }
        }
        var contoCifre = customerData[0].data[0].dettagliSoggetto[0].cifre;
        var paramContoCifre = "##contoCorrenteNr12=" + contoCifre;
        this.options.logger.addlogParams(paramContoCifre);
        wkscommerciale.log.doPopLog(self.options);
    }
});

wkscustomer.views.OccasionaleCustomerCommericalData = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            contoId: wkscommerciale.idAccount.get()
        });
    },
    render: function() {
        var self = this;
        var customerDataCommericalTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/occasionale/occasionale_commerical"));
        var customerData = this.collection.toJSON();
        if(customerData[0].data[0].nome.indexOf('-')>=0) {
            var newdata = customerData[0].data[0].nome;
            customerData[0].data[0].nome = newdata.substring(newdata.indexOf('-')+1, newdata.length);
        }
        if(customerData[0].data[0].h2oOperatorCode!== null && customerData[0].data[0].h2oOperatorCode!== "" && customerData[0].data[0].description !== null && customerData[0].data[0].description !== "") {
            customerData[0].data[0].description = "("+customerData[0].data[0].description+")";
        }else{
            customerData[0].data[0].description ="";
        }
        $(self.options.parentEl).find("#data_commerciale").html(customerDataCommericalTemplate({"data": customerData[0].data[0]}));

    }
});
// Defined wkscApp.OccasionaleCustomerExternalButtons view.
/* As per the comment on ticket https://svil.bansel.it/jira/browse/PORTAHC-580?focusedCommentId=429365&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-429365
 * the view below is now hidden
 wkscApp.OccasionaleCustomerExternalButtons = Backbone.View.extend({
 render: function() {
 var self = this;
 //The account 13cifre is reqired to open the external link Catalina firma.
 $(self.el).html(this.options._template({cifre: self.options.cifre,isAlert:self.options.isAlert}));
 }
 });
 */
// Defined wkscApp.OccasionaleCustomerButtonGroup view.
wkscustomer.views.OccasionaleCustomerButtonGroup = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },
    render: function() {
        var self = this;
        /*
         * Tippo is the type of account, this card has 2 types libretto al portatore
         * and fiduciarie. Libretto al portatore is like the private customer, hence it should have
         * Personali button and fiduciarie is like the business customer and this require the
         * Aziendali button. If the tippo is of type 'Conto al portatore' the template will show
         * Personali button, else we show the Aziendali button.
         */
        $(self.el).html(this.options._template({"tipo": self.options.tipo}));
        wkscommerciale.log.doPopLog(self.options);
    }
});
// Defined wkscApp.OccasionaleCollegamenti view.
wkscustomer.views.OccasionaleCollegamenti = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            contoId: wkscommerciale.idAccount.get(),
            soggettoId: ""
        });
    },
    render: function() {
        var self = this;
        var collegamentiData = this.collection.toJSON();
        wkscommerciale.notifyError.pushError(collegamentiData[0].message);
        this.template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/occasionale/occasionale_collegamenti"));
        var isVisualizzaSaldiSectionHidden = true;
        if (collegamentiData[0].authorize) {
            if (collegamentiData[0].data.length !== 0) {
                if (collegamentiData[0].data[0].collegamenti.length !== 0) {
                    isVisualizzaSaldiSectionHidden = ! collegamentiData[0].data[0].collegamenti[0].isSaldiVisible;
                    $(self.el).html(this.template({"data": collegamentiData[0].data[0].collegamenti, "isVisualizzaSaldiSectionHidden": isVisualizzaSaldiSectionHidden, showDefault: false}));

                    wkscommerciale.profiles.checkProfile('ENABLE_PORTFOLIO', function(hasGrant) {
                        if(! hasGrant ) {
                            $('.ref_enableportfolio').hide();
                        }
                    });

                }
                else {
                    /* Show the template with message 'Non sono presenti collegamenti' and push the error to WKSC error console.
                     * To change the error message, you need to go to the template occasionale/occasionale_collegamenti.html and
                     * change it there.
                     */
                    $(self.el).html(this.template({"data": [], "isVisualizzaSaldiSectionHidden": isVisualizzaSaldiSectionHidden, showDefault: true}));
                    //wkscommerciale.notifyError.pushError("Occasionale Collegamenti returned empty array"); //Commented this line.PORTAHC-850
                }
            }
            else {
                /* Show the template with message 'Non sono presenti collegamenti' and push the error to WKSC error console.
                 * To change the error message, you need to go to the template occasionale/occasionale_collegamenti.html and
                 * change it there.
                 */
                $(self.el).html(this.template({"data": [], "isVisualizzaSaldiSectionHidden": isVisualizzaSaldiSectionHidden, showDefault: true}));
                //wkscommerciale.notifyError.pushError("Occasionale Collegamenti returned empty array"); //Commented this line.PORTAHC-850
            }
        }
        else {
            // hide the section if not authorized.
            $(self.el).hide();
        }
        wkscommerciale.log.doPopLog(self.options);
    }
});
// Defined wkscApp.OccasionaleSoggettiAbilitati view.
wkscustomer.views.OccasionaleSoggettiAbilitati = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            contoId: wkscommerciale.idAccount.get()
        });
    },
    render: function() {
        var self = this;
        var soggettiAbilitatiData = this.collection.toJSON();
        wkscommerciale.notifyError.pushError(soggettiAbilitatiData[0].message);
        this.template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/occasionale/occasionale_soggetti_abilitati"));
        if (soggettiAbilitatiData[0].authorize) {
            if (soggettiAbilitatiData[0].data.length !== 0) {
                if (soggettiAbilitatiData[0].data[0].soggettiAbilitati.length !== 0) {
                    $(self.el).html(this.template({"data": soggettiAbilitatiData[0].data[0].soggettiAbilitati, showDefault: false}));
                }
                else {
                    /* Show the template with message 'Non sono presenti soggetti abilitati' and push the error to WKSC error console.
                     * To change the error message, you need to go to the template occasionale/occasionale_collegamenti.html and
                     * change it there.
                     */
                    $(self.el).html(this.template({"data": [], showDefault: true}));
                    //wkscommerciale.notifyError.pushError("Occasionale Soggetti Abilitati returned empty array"); //Commented this line.PORTAHC-850
                }
            }
            else {
                /* Show the template with message 'Non sono presenti soggetti abilitati' and push the error to WKSC error console.
                 * To change the error message, you need to go to the template occasionale/occasionale_collegamenti.html and
                 * change it there.
                 */
                $(self.el).html(this.template({"data": [], showDefault: true}));
                // wkscommerciale.notifyError.pushError("Occasionale Soggetti Abilitati returned empty array"); //Commented this line.PORTAHC-850
            }
        }
        else {
            // hide the section if not authorized.
            $(self.el).hide();
        }
        wkscommerciale.log.doPopLog(self.options);
    }
});
var isAllValueSame = function(array, limit) {
    if (array.length > 0) {
        for (var i = 0; i < limit; i++) {
            if (array[i] !== array[0]) {
                return false;
            }
        }
    }
    return true;
};
Backbone.View.prototype.close = function() {
    this.remove();
    this.off();
    if (this.onClose) {
        this.onClose();
    }
};
//== Customer - Needs Map - View ======================================================================|
/*
 <wkscapp.MappaDeiBisogniView> is responsible for the Mappa Dei Bisogni on the customer home page.
 */
//wkscustomer.views.ShortNeedsMapView = wkscommerciale.views.WksMasterView.extend({
//	el: $("#customer_6"),
//	initialize: function(options) {
//		this.options = options;
//		$(this.el).wkscspinner({
//			css: 'large'
//		});
//		wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
//			soggettoId: wkscommerciale.idSoggetto.get()
//		});
//	},
//	events: {
//		'click #needMap': 'openDetailCard'
//	},
//	render: function() {
//		var bisogni = this.collection.toJSON();
//		//wkscError.pushError(bisogni[0].message);
//
//		var bisogniTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/needs_map/mappa_dei_bisogni"));
//		if (bisogni[0].data.length != 0 && bisogni[0].data[0].needList) {
//			if (bisogni[0].data[0].needList.length != 0) {
//				$(this.el).html(bisogniTemplate({
//					"bisogni": bisogni[0].data[0],
//					"showDefault": false
//				}));
//			}
//			else {
//				$(this.el).html(bisogniTemplate({
//					"bisogni": [],
//					"showDefault": true
//				}));
//			}
//		}
//		else {
//			$(this.el).html(bisogniTemplate({
//				"bisogni": [],
//				"showDefault": true
//			}));
//		}
//
//		$("[set-scrollto-mappa]").click(function(e) {
//			fnSetScrollTo($(e.currentTarget).attr('data-scrollTo'));
//		});
//
//		$(this.el).wkscspinner('remove');
//		wkscommerciale.log.doPopLog(this.options);
//	},
//	openDetailCard: function(e)
//	{
//		wkscommerciale.idSoggetto.set($(e.currentTarget).attr('a-val'));
//		customCardLoader({
//			loadType: "slidein",
//			scrollto: $(e.currentTarget).attr('a-scroll-top'),
//			cardSize: $(e.currentTarget).attr('a-class'),
//			cardName: $(e.currentTarget).attr('a-href')
//		});
//
//		return false;
//	},
//	onClose: function() {
//		this.collection.off("change", this.render);
//	}
//});
wkscustomer.views.RowCustomerNeedsMapView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get(),
            type: options.type,
            subjtype: options.subjtype
        });
    },
    render: function() {
        var details = this.collection.toJSON()[0].data;
        var noData = "<strong>Prodotti sottoscritti</strong><br><div class=\"disabled noicon\">- nessuno -</div>";
        if (this.collection.toJSON()[0].status === "success") {
            var needs = details[0].needList;
            if (needs && needs.length > 0) {
                var details = needs[0].details;
                if (details && details.length > 0) {
                    for (var i = 0; i < details.length; i++) {
                        var html = "<strong>Prodotti sottoscritti</strong><br>";
                        if (details[i].prodottiSottoscritti && details[i].prodottiSottoscritti.rows && details[i].prodottiSottoscritti.rows.length && details[i].prodottiSottoscritti.rows.length > 0) {
                            for (var b = 0; b < details[i].prodottiSottoscritti.rows.length; b++) {
                                var ii = details[i].prodottiSottoscritti.rows[b];
                                html += "<div class=\"table_prodotti_colonne\">";
                                html += "<div class=\"icona\">" + ii.icon + "</div>";
                                html += "<div class=\"prodotto\">" + ii.name + "</div>";
                                html += "</div>";
                            }
                        } else {
                            html += "<div class=\"disabled noicon\">- nessuno -</div>";
                        }
                        var id = details[i].code;
                        $("#" + id).html(html);
                    }
                }
            } else {
                $("#" + options.type).html(noData);
            }
        } else {
            $("#" + options.type).html(noData);
        }
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.FullCustomerNeedsMapView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        this._businessCustomerTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/needs_map/needs_map'));
        this.altriProdottiLink = "";
        var altriProdottiSuccessCb = _.bind(function(response) {
            this.altriProdottiLink =  response.data[0].URL_COMM_SMALL_BUSS;
        }, this);
        var altriProdottiErrorCb = _.bind(function(response) {
            wkscommerciale.notifyError.pushError(response);
        }, this);
        wkscommerciale.getWkscParam('URL_COMM_SMALL_BUSS', altriProdottiSuccessCb, altriProdottiErrorCb);
    },
    events: {
        'click #questionario': 'questionario'
    },
    render: function() {
        var details = this.collection.toJSON()[0].data;
        this.options.type = wkscommerciale.utils.capitilize(details[0].tipoSoggetto);
        var tempHTML = null;
        if (this.collection.toJSON()[0].status === "success") {
            tempHTML = this._businessCustomerTemplate({
                "needs": details[0],
                "status": true,
                "altriProdottiLink" : this.altriProdottiLink

            });
            $(this.el).html(tempHTML);
        } else {
            tempHTML = this._businessCustomerTemplate({
                "needs": details[0],
                "status": false,
                "altriProdottiLink" : this.altriProdottiLink
            });
        }
        $(self).wkscspinner('remove');
        if (this.collection.toJSON()[0].status === "success") {
            var allNeed = details[0].needList;
            for (var i = 0; i < allNeed.length; i++) {
                var need = allNeed[i].details;
                for (var b = 0; b < need.length; b++) {
                    wkscApp.rowModel = new wkscustomer.collections.NeedsMapSection();
                    wkscommerciale.log.doPushLog(this.options);
                    wkscApp.rowView = new wkscustomer.views.RowCustomerNeedsMapView({
                        type: need[b].code,
                        subjtype: details[0].tipoSoggetto,
                        collection: wkscApp.rowModel,
                        logger: this.options.logger
                    });
                }
            }
        }
        $("[a-descr]").click(function(e) {
            wkscommerciale.idSoggetto.set($(e.currentTarget).attr("soggettoid"));
            if ($(e.currentTarget).attr("a-subval") && $(e.currentTarget).attr("a-subval") !== "") {
                wkscApp.setValues('tipoInAttivita', $(e.currentTarget).attr("a-subval"));
            } else {
                wkscApp.setValues('tipoInAttivita', "");
            }
            customCardLoader({
                loadType: "slidein",
                cardSize: $(e.currentTarget).attr('a-class'),
                cardName: $(e.currentTarget).attr('a-href')
            });
            return false;
        });
        $("[sm-open-newtab-mappa]").click(function(e) {
            _window_event = e;
            wkscSMHandler.openLink_newTab({link: $(e.currentTarget).attr('smRef'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe'), params: ""});
        });
        $("[sm-open-h2oadaptor-mappa]").click(function(e) {
            _window_event = e;
            wkscSMHandler.openLink_smAdaptor({smname: $(e.currentTarget).attr('smName'), outparams: $(e.currentTarget).attr('smOutParams'), inputparams: $(e.currentTarget).attr('value'), newtab: $(e.currentTarget).attr('newtab'), iframe: $(e.currentTarget).attr('iframe')});
        });
        wkscommerciale.log.doPopLog(this.options);
        return this;
    },
    questionario: function(e) {
        wkscommerciale.idSoggetto.set($(e.currentTarget).attr("soggettoid"));
        if (this.options.type == "Private") {
            wkscApp.setTipoQuestionario("Private");
        } else {
            wkscApp.setTipoQuestionario("Business");
        }
        customCardLoader({
            loadType: "slidein",
            cardSize: $(e.currentTarget).attr('a-class'),
            cardName: $(e.currentTarget).attr('a-href')
        });
        return false;
    }
});
wkscustomer.views.QuestionarioInfoView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
        this.funzionalitaERicercheView = {};
        this.viaCardTelepassView = {};
        this.contrattualisticaTooltip = '';
        this.isDataLoaded = false;
        this.soggettoId = options.soggettoId;
        this.tipoSoggetto = options.tipoSoggetto;
        this.needsBtnSection = options.needsBtnSection;
        this.pogEnabled = options.pogEnabled;
        this.complianceMandatory = options.complianceMandatory;
        this.$el.wkscspinner({css: 'large', position: false});
        this.collection.on('reset', this.render, this);
    },
    events: {
        'click #questionario_delle_esigenze_btn': 'openQuestionarioDelleEsigenzeCard',
        'click #customer_products_btn': 'openCustomerProductsCard'
    },
    render: function() {
        var questionarioInfoTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/questionario_info/questionario_info_template'));
        var responseJSON = this.collection.toJSON()[0];
        wkscommerciale.notifyError.pushErrorFromResponse(responseJSON);
        if (responseJSON.status === 'success') {
            var respData = _.size(responseJSON.data) > 0 ? responseJSON.data[0] : {};
            var warningMsg = 'Ricarica la card';
            if (this.complianceMandatory === 'true') {
                warningMsg = 'Per aprire un conto, un deposito o richiedere una carta compilare il <strong>Questionario delle esigenze</strong>.';
                this.contrattualisticaTooltip = _.has(respData, 'contrattualisticaTooltip') ? respData.contrattualisticaTooltip : '';
            } else if (this.complianceMandatory === 'false') {
                warningMsg = 'Cliente non sottomettibile a POG';
            }
            this.$el.html(questionarioInfoTemplate({
                data: respData,
                needsBtnSection: this.needsBtnSection,
                warningMsg: warningMsg,
                showSistemiDiPagamento: this.complianceMandatory === 'true'
            }));
        }
        var contoSel = '.cercaContoLink', cartaSel = '.cercaCartaLink';
        if (_.size(this.tipoSoggetto) > 0) {
            if (this.tipoSoggetto === 'Semplice' || this.tipoSoggetto === 'Plurintestazione' || this.tipoSoggetto === 'PlurintestazioneAZ' || this.tipoSoggetto === 'PlurintestazioneAZandPF') {
                var contoSuccessCb = _.bind(function (response) {
                    var link = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'CERCA_CONTO_URL') ? response.data[0].CERCA_CONTO_URL : '';
                    if (_.size(link) > 0) {
                        this.$(contoSel).attr('href', link).show();
                    } else {
                        this.reportError(response, contoSel);
                    }
                }, this);
                var contoErrorCb = _.bind(function (response) {
                    this.reportError(response, contoSel);
                }, this);
                wkscommerciale.getWkscParam('CERCA_CONTO_URL', contoSuccessCb, contoErrorCb);
                var cartaSuccessCb = _.bind(function (response) {
                    var link = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'CERCA_CARTA_URL') ? response.data[0].CERCA_CARTA_URL : '';
                    if (_.size(link) > 0) {
                        this.$(cartaSel).attr('href', link).show();
                    } else {
                        this.reportError(response, cartaSel);
                    }
                }, this);
                var cartaErrorCb = _.bind(function (response) {
                    this.reportError(response, cartaSel);
                }, this);
                wkscommerciale.getWkscParam('CERCA_CARTA_URL', cartaSuccessCb, cartaErrorCb);
            } else {
                // remove the buttons when tipoSoggetto not available
                this.$(contoSel).remove();
                this.$(cartaSel).remove();
            }
        } else {
            // remove the buttons when tipoSoggetto not available
            this.$(contoSel).remove();
            this.$(cartaSel).remove();
        }
        this.isDataLoaded = true;
        this.$el.wkscspinner('remove');
        if (this.funzionalitaERicercheView.isDataLoaded) {
            var btnsSection = this.funzionalitaERicercheView.$('.mutui_buttons');
            var contrattualisticaSMConfigAttributes = 'smName="GestoreContrattualistica" smOutParams="" value="' + this.soggettoId + '" newtab="1" iframe="1"';
            var btnTemplate = '<div class="button">';
            btnTemplate += '<a href="javascript:void(0);" id="contrattualisticaBtn" class="collar contrattualisticaBtnWithBaloon" ' + contrattualisticaSMConfigAttributes + ' sm-open-h2oadaptor>Contrattualistisca</a>';
            btnTemplate += '</div>';
            var $contrattualisticaBtn = $(btnTemplate);
            // remove if already contrattualistica button present - we have to remove and add the button again to clear the already bounded events of the button
            btnsSection.find('#contrattualisticaBtn').parents('.button').remove();
            var btnTooltip = this.contrattualisticaTooltip;
            if (_.size(btnTooltip) > 0 && this.complianceMandatory === 'true') {
                var baloonTemplate = '<div class="contrattualisticaBtnBaloon default-baloon" data-acts-as-baloon-on=".contrattualisticaBtnWithBaloon" data-fix-top="-175px" data-fix-left="-2px" data-fix-bottom-left="65px">';
                baloonTemplate += '<p>' + btnTooltip + '</p>';
                baloonTemplate += '<div class="buttons">';
                baloonTemplate += '<a href="javascript:void(0);" class="button small" data-close-parent=".contrattualisticaBtnBaloon">Annulla</a>';
                baloonTemplate += '<a href="javascript:void(0);" class="button contrattualisticaProsegui small" data-close-parent=".contrattualisticaBtnBaloon" smName="GestoreContrattualistica" ' + contrattualisticaSMConfigAttributes + '>Prosegui</a>';
                baloonTemplate += '<div class="clear"></div>';
                baloonTemplate += '</div>';
                baloonTemplate += '<div class="bottom"></div>';
                baloonTemplate += '</div>';
                var $contrattualisticaBtnBaloon = $(baloonTemplate);
                $contrattualisticaBtn.find('#contrattualisticaBtn').removeAttr('sm-open-h2oadaptor');
                $contrattualisticaBtn.append($contrattualisticaBtnBaloon);
            }
            // add the contrattualistica button
            $contrattualisticaBtn.insertBefore(btnsSection.find('.button:first'));
            $(window).trigger('cardmaster:loaded', this.funzionalitaERicercheView.el);
            $(window).trigger('scrollbar:resize', 'relative');
        }
        if (this.viaCardTelepassView.isDataLoaded) {
            // removed because there isn't any direct connection for this section in this view
        }
        $(window).trigger('cardmaster:loaded', this.$el);
        $(window).trigger('scrollbar:resize', 'relative');
        wkscommerciale.log.doPopLog(this.options);

        // $('#questionario_info_section .infobox , #questionario_info_section .head').remove();
        wkscommerciale.profiles.showElOnGrant('CATPRODOTTI_BTN', $('#questionario_info_section #Offerta_Id , #questionario_info_section .cercaCartaLink , #questionario_info_section .cercaContoLink'), true,function(){SectionMinAdjustment($('#questionario_info_section'), $('#needs_map'))})
        wkscommerciale.profiles.showElOnGrant('ENABLE_POG', $('#questionario_info_section .infobox , #questionario_info_section .head'), true,function(){SectionMinAdjustment($('#questionario_info_section'), $('#needs_map'))})
        return this;
    },

    reportError: function(response, selector) {
        wkscommerciale.notifyError.pushFromFetchError(response, []);
        if(selector) {
            this.$(selector).remove();
        }
    },
    openQuestionarioDelleEsigenzeCard: function(e) {
        e.preventDefault();
        wkscustomer.quesInfoView = this;
        // pass the soggettoId and tipoSoggetto to next card
        wkscustomer.questionnaireTempData = {
            soggettoId: this.soggettoId,
            tipoSoggetto: this.tipoSoggetto
        };
        customCardLoader({
            loadType: 'slidein',
            cardSize: 'size_big',
            cardName: window.wkscustomerContext + '/assets/cards/3.2.1.questionnaire.html'
        });
        return false;
    },
    openCustomerProductsCard: function(e) {
        e.preventDefault();
        // pass the soggettoId and tipoSoggetto to next card
        wkscustomer.questionnaireTempData = {
            soggettoId: this.soggettoId,
            tipoSoggetto: this.tipoSoggetto
        };
        customCardLoader({
            loadType: 'slidein',
            cardSize: 'size_big',
            cardName: window.wksproductsContext + '/assets/cards/3.2.2.products.html'
        });
        return false;
    },
    reloadView: function() {
        this.$el.html('');
        this.$el.wkscspinner({css: 'large', position: false});
        wkscommerciale.log.doPushLog(this.options);
        this.isDataLoaded = false;
        this.collection.fetch(wkscommerciale.utils.fetchCallback({soggettoId: this.soggettoId, tipoSoggetto: this.tipoSoggetto}));
        // re-render viacard telepass section
        if(this.viaCardTelepassView.reloadView) {
            this.viaCardTelepassView.isDataLoaded = false;
            this.viaCardTelepassView.reloadView();
        }
    },
    destroyView: function() {
        /* removes event listeners */
        this.undelegateEvents();
        /* removes data stored in DOM and unbind events from DOM */
        this.$el.removeData().off();
        /* removes view from DOM */
        this.remove();
        /* call Backbone View's remove method to destroy the View completely */
        Backbone.View.prototype.remove.call(this);
    }
});
wkscustomer.views.MappaDelleEsigenzeContiEServizi = wkscommerciale.views.WksMasterView.extend({
    el: $('#needs_map'),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
        this.offertaCompletaLink = "";
        var offertaSuccessCb = _.bind(function(response) {
            this.offertaCompletaLink =  response.data[0].URL_COMM_PICCOLE_IMP;
        }, this);
        var offertaErrorCb = _.bind(function(response) {
            wkscommerciale.notifyError.pushError(response);
        }, this);
        wkscommerciale.getWkscParam('URL_COMM_PICCOLE_IMP', offertaSuccessCb, offertaErrorCb);
    },
    render: function() {
        var response = this.collection.toJSON();
        if (response[0].data.length != 0) {
            var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+ this.options.template));
            var data = response[0].data[0];
            var templateParams = {"needs": data,
                "offertaCompletaLink" : this.offertaCompletaLink};
            if(this.options.isPromotore != undefined)
                templateParams["isPromotore"] = this.options.isPromotore
            $(this.el).append(_template(
                templateParams
            ));

            var contoSel = '.cercaContoLink',
                cartaSel = '.cercaCartaLink',
                contoBizSel = '.cercaContoBizLink';

            if(_.has(data, 'tipoSoggetto') && _.size(data.tipoSoggetto) > 0) {
                if(data.tipoSoggetto.toLowerCase() === 'private') {
                    var contoSuccessCb = _.bind(function(response) {
                        var link = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'CERCA_CONTO_URL') ? response.data[0].CERCA_CONTO_URL : '';
                        if(_.size(link) > 0) {
                            this.$(contoSel).attr('href', link).show();
                        } else {
                            this.reportError(response, contoSel);
                        }
                    }, this);
                    var contoErrorCb = _.bind(function(response) {
                        this.reportError(response, contoSel);
                    }, this);
                    wkscommerciale.getWkscParam('CERCA_CONTO_URL', contoSuccessCb, contoErrorCb);
                    var cartaSuccessCb = _.bind(function(response) {
                        var link = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'CERCA_CARTA_URL') ? response.data[0].CERCA_CARTA_URL : '';
                        if(_.size(link) > 0) {
                            this.$(cartaSel).attr('href', link).show();
                        } else {
                            this.reportError(response, cartaSel);
                        }
                    }, this);
                    var cartaErrorCb = _.bind(function(response) {
                        this.reportError(response, cartaSel);
                    }, this);
                    wkscommerciale.getWkscParam('CERCA_CARTA_URL', cartaSuccessCb, cartaErrorCb);
                } else if(data.tipoSoggetto.toLowerCase() === 'business') {
                    var contoSuccessCb = _.bind(function(response) {
                        var link = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'CERCA_CONTO_BIZ_URL') ? response.data[0].CERCA_CONTO_BIZ_URL : '';
                        if(_.size(link) > 0) {
                            this.$(contoBizSel).attr('href', link).show();
                        } else {
                            this.reportError(response, contoBizSel);
                        }
                    }, this);
                    var contoErrorCb = _.bind(function(response) {
                        this.reportError(response, contoBizSel);
                    }, this);
                    wkscommerciale.getWkscParam('CERCA_CONTO_BIZ_URL', contoSuccessCb, contoErrorCb);

                } else {
                    // remove the buttons when tipoSoggetto not available
                    this.$(contoSel).remove();
                    this.$(cartaSel).remove();
                    this.$(contoBizSel).remove();
                }
            } else {
                // remove the buttons when tipoSoggetto not available
                this.$(contoSel).remove();
                this.$(cartaSel).remove();
                this.$(contoBizSel).remove();
            }
        }
//		If user is promotore, disable link towards mappa delle esigenza card
        if(this.options.isPromotore) {
            this.$('.need_index').removeAttr('data-href').removeAttr('route').removeClass('hand_pointer').removeAttr('data-load-card')
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);

        // $('#needs_map_section .products , #needs_map_section .need_index , #needs_map_section .legenda , #needs_map_section .title').hide();
        // $('#needs_map_section .button , #needs_map_section .products').remove();
        if(!wkscommerciale.user.data.promotoreBSNew){ //5051
            wkscommerciale.profiles.showElOnGrant('ENABLE_MAPPAESIGENZE',$('#needs_map_section .products , #needs_map_section .need_index , #needs_map_section .legenda , #needs_map_section .title'),true,function(){SectionMinAdjustment($('#needs_map_section'),$('#needs_map'))});
        }
        if(!wkscommerciale.user.data.promotoreBSNew || this.options.template!="/assets/templates/risparmio/esigenza_conti"){//5052
            wkscommerciale.profiles.showElOnGrant('CATPRODOTTI_BTN',$('#needs_map_section .button '),true,function(){SectionMinAdjustment($('#needs_map_section'),$('#needs_map'))});
        }
        else
        {
            SectionMinAdjustment($('#needs_map_section'),$('#needs_map'));
        }//5052
    },

    reportError: function(response, selector) {
        wkscommerciale.notifyError.pushFromFetchError(response, []);
        if(selector) {
            this.$(selector).remove();
        }
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }

});
wkscustomer.views.TriggerMappaDelleEsigenzeView = wkscommerciale.views.WksMasterView.extend({
    initialize: function(options) {
        this.options = options;
        this.idSoggetto = options.idSoggetto;
        this.tipoSoggetto = options.tipoSoggetto;
        var needMap = new wkscustomer.collections.ShortNeedsMapList();
        wkscommerciale.log.doPushLog(this.options);
        var MappaDelleEsigenzeMutui = new wkscustomer.views.MappaDelleEsigenzeMutui({
            el: $("#needs_map_credits"),
            collection: needMap,
            logger: this.options.logger
        });
        if(MappaDelleEsigenzeMutui) {
            wkscommerciale.consolle.log('MappaDelleEsigenzeMutui variable is used!');
        }
        var ottoCifreModel = new wkscustomer.collections.GETOTTOCIFRE();
        wkscommerciale.log.doPushLog(this.options);
        var FunzionalitaERicercheMutui = new wkscustomer.views.FunzionalitaERicercheMutui({
            el: $("#current_account_functionality"),
            collection: ottoCifreModel,
            tipoSoggetto: this.tipoSoggetto, //5677
            logger: this.options.logger
        });
        if(FunzionalitaERicercheMutui) {
            wkscommerciale.consolle.log('FunzionalitaERicercheMutui variable is used!');
        }
        var mutuiEPrestiti = new wkscustomer.collections.MutuiEPrestitiList();
        wkscommerciale.log.doPushLog(this.options);
        var MutuiEPrestitiView = new wkscustomer.views.MutuiEPrestitiView({
            el: $("#current_account_mutui"),
            collection: mutuiEPrestiti,
            logger: this.options.logger,
            idSoggetto: this.idSoggetto,
            tipoSoggetto: this.tipoSoggetto
        });
        if(MutuiEPrestitiView) {
            wkscommerciale.consolle.log('MutuiEPrestitiView variable is used!');
        }
        wkscommerciale.log.doPopLog(this.options);
    }
});
wkscustomer.views.MappaDelleEsigenzeMutui = wkscommerciale.views.WksMasterView.extend({
    el: $('#needs_map_credits'),
    initialize: function(options) {
        this.options = options;
        $(this.el).wkscspinner({
            css: 'large'
        });
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            soggettoId: wkscommerciale.idSoggetto.get()
        });
    },
    render: function() {
        var response = this.collection.toJSON();
        //wkscError.pushError(response[0].message);
        if (response[0].data.length != 0) {
            var _template = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/mutui/esigenza_mutui"));
            $(this.el).append(_template({
                "needs": response[0].data[0]
            }));
        }
        $(this.el).wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);


        //  $('#needs_map_credits .need_index , #needs_map_credits .legenda , #needs_map_credits .title').hide();
        wkscommerciale.profiles.showElOnGrant('CATPRODOTTI_BTN',$('#needs_map_credits .button , #needs_map_credits .products'),true,function(){SectionMinAdjustment($('#needs_map_credits'),$('#needs_map_credits'))});
        wkscommerciale.profiles.showElOnGrant('ENABLE_MAPPAESIGENZE',$('#needs_map_credits .need_index , #needs_map_credits .legenda , #needs_map_credits .title'),true,function(){SectionMinAdjustment($('#needs_map_credits'),$('#needs_map_credits'))});

        /* var getAllChildrenElement = $('#needs_map_credits').find('div div');
         getAllChildrenElement.each(function()
         {
         var emptyTest = $(this).is(':empty');
         if(emptyTest)
         {
         var currentEl = $(this);
         $(this).remove();
         if((currentEl).parent().is(':empty'))
         {
         $(currentEl).parent().remove();
         }
         }
         });


         var sectionLength = $('#needs_map_credits').children().length;
         if(sectionLength<=1){
         $('#needs_map_credits').css('border-bottom','none');
         }*/
    },
    onClose: function() {
        this.collection.off("change", this.render);
    }
});
/* Utility Function */
function findNeedByCode(items, code)
{
    if (items && items.length)
    {
        for (var i = 0; i < items.length; i++)
        {
            if ((items[i].mainCode && items[i].mainCode == code) || (items[i].desc && items[i].desc == code))
            {
                return items[i];
            }
        }
    }
    return {mainCode: code,
        desc: code,
        dataValue: '0',
        dataTot: '100',
        total: '100',
        value: '0',
        details: [],
        servizi: []};
}
//4922 4923
function SectionMinAdjustment(childelement,parentEl)
{
    var childrenel = childelement.children();
    var flag = true;
    var pog_flag = true;
    childrenel.each(function()
    {
        if($(this).attr('class')=='infobox' && $(this).text()!="" && $(this).text()!=undefined && $(this).css('display')!='none')
        {
            flag = false;
            pog_flag = false;
        }
        else
        {
            var minchildEl = $(this).children();
            minchildEl.each(function()
            {
                if($(this).attr('class')!='clear')
                {
                    if($(this).css('display')=='block')
                    {
                        flag = false;
                    }
                }
            });
        }
    });
    if(flag)
    {
        if(childelement.attr('id')!="needs_map_credits")
        {
            childelement.hide();
        }
        else
        {
            parentEl.removeClass('minheight');
        }
        parentEl.css('border-bottom','none');
    }
    else
    {
        if(childelement.attr('id')=='questionario_info_section')
        {
            if(childelement.find('.button').length>0)
            {
                if(childelement.find('.button').is(':visible')==false)
                {
                    parentEl.css('border-bottom','none');
                }
            }

        }
    }


}

//==============================================================================================================|
wkscustomer.views.IndirizziRecapitiView = wkscommerciale.views.WksMasterView.extend({
    el: $("#customerContactInfoCard"),
    initialize: function(options) {
        this.options = options;
        var curPageType = wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get());
        var customerId = "", customerType = "";
        var soggettoId = wkscommerciale.idSoggetto.get();
        var prospectId = wkscommerciale.idProspect.get();
        if (soggettoId !== "" && prospectId === "" && (curPageType === "Semplice" || curPageType === "Plurintestazione" || curPageType === "PlurintestazioneAZ" || curPageType === "PlurintestazioneAZandPF")) {
            customerId = soggettoId;
            customerType = curPageType;
        }
        else if (soggettoId !== "" && prospectId === "" && (curPageType !== "Semplice" && curPageType !== "Plurintestazione" && curPageType !== "PlurintestazioneAZ" && curPageType !== "PlurintestazioneAZandPF" && curPageType.length > 0)) {
            customerId = soggettoId;
            customerType = "Azienda";
        }
        else if (soggettoId === "" && prospectId !== "") {
            customerId = prospectId;
            customerType = "Prospect";
        }
        wkscommerciale.views.WksMasterView.prototype.initialize.call(this, {
            customerId: customerId,
            customerType: customerType
        });
    },
    events : {
        'click .sms' : 'onSMSClick',
        'click .mail' : 'openMailTo'
    },
    openMailTo:function(e){
        e.stopPropagation();
        e.preventDefault();
        var $this = $(e.currentTarget);
        wkscommerciale.doLogClickEvent({
            eventCode:"COCA-MAIL",
            successHandler:function(){
                window.location = $this.attr('href');
            },
            errorHandler:function(){
                window.location = $this.attr('href');
            }
        });
    },
    render: function() {
        var indirizziTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+"/assets/templates/indirizzi_e_recapiti"));
        var details = this.collection.toJSON();
        var curPageType = wkscommerciale.tipoSoggetto.get(wkscommerciale.idSoggetto.get());
        var emptyData = {
            "indirizzi": [],
            "recapiti": [
                {
                    "postaElettronica": [],
                    "telFisso": [],
                    "telCellulare": [],
                    "fax": []
                }
            ]
        };
        //Log the error message in the message
        wkscommerciale.notifyError.pushError(details[0].message);
        if (details.length > 0 && details[0].authorize && details[0].data.length > 0) {
            $(this.el).html(indirizziTemplate({
                "details": details[0].data[0],
                "customerType": curPageType
            }));
            if(details[0].data[0].retailDeskUser){

                $(".cust_retail_desk").show();
            }
            if(details[0].data[0].sasUser){

                $(".normal_retail_desk").show();
            }

        }
        else {
            $(this.el).html(indirizziTemplate({
                "details": emptyData,
                "customerType": curPageType
            }));
        }
        $(this.el).wkscspinner('remove');


        $('a[data-direct-link]').on('click',this.openMailTo);
//		$('a[postaElettronica]').on('click',this.openMailTo);
        wkscommerciale.log.doPopLog(this.options);
    },
    onSMSClick : function(e){
        var commSuccessCb = _.bind(function(response) {
            var flagValue = response.status === 'success' && _.size(response.data) > 0 && _.has(response.data[0], 'REDIRECT_NEW_SMS_CARD') ? response.data[0].REDIRECT_NEW_SMS_CARD : '';
            if(_.size(flagValue) > 0 && flagValue === 'Y') {
                wkscommerciale.customer.idSoggetto = $(e.target).attr("params").split(';')[3].split('--')[1]; //5219
                customCardLoader({
                    loadType: 'slidein',
                    cardSize: 'size_big',
                    cardName: contextUrls["wkscustomer"] + '/assets/cards/2.11.sms.html'
                });
            }else{

                window_event = e;
                wkscommerciale.doLogClickEvent({
                    eventCode:"COCA-SMS",
                    successHandler:function(){
                        wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
                    },
                    errorHandler:function(){
                        wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
                    }
                });

            }
        }, this);

        var commErrorCb = _.bind(function(response) {
            wkscommerciale.notifyError.pushFromFetchError(response, []);
            window_event = e;
            wkscommerciale.doLogClickEvent({
                eventCode:"COCA-SMS",
                successHandler:function(){
                    wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
                },
                errorHandler:function(){
                    wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
                }
            });
        }, this);

        wkscommerciale.getWkscParam('REDIRECT_NEW_SMS_CARD', commSuccessCb, commErrorCb)

        /*if(true){
         customCardLoader({
         loadType: 'slidein',
         cardSize: 'size_big',
         cardName: contextUrls["wkscustomer"] + '/assets/cards/2.11.sms.html'
         });
         }else{
         window_event = e;
         wkscommerciale.doLogClickEvent({
         eventCode:"COCA-SMS",
         successHandler:function(){
         wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
         },
         errorHandler:function(){
         wkscSMHandler.openLink_newTab_WithPost({link: $(e.currentTarget).attr('smRef'), iframe: $(e.currentTarget).attr('iframe'), params: $(e.currentTarget).attr('params')});
         }
         });
         }*/
    }
});
// Moved prospect customer code to prospectcustomer.js
//== Customer Rapporto View ====================================================================================|
wkscustomer.views.CustomerRapportoView = Backbone.View.extend({
    initialize : function(options) {
        this.options = options;
        this._filterTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/rapporto/customer_rapporto'));
        this.collection.on('reset', this.render, this);
    },
    render : function() {
        var details = this.collection.toJSON()[0];
        if (details.status == 'success') {
            var tempHTML = (typeof (details.data) != 'undefined') ? this._filterTemplate(details.data[0]) : '';
            $(this.el).html(tempHTML);
        }
        $(window).trigger('cardmaster:loaded', this.$el);
        wkscommerciale.log.doPopLog(this.options);
        return this;
    }
});
//== Customer Rapporto - List ==================================================================================|
wkscustomer.views.CustomerRapportoListView = Backbone.View.extend({
    initialize : function(options) {
        this.options = options;
        this._filterTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/rapporto/customer_rapporto_list'));
        this.collection.on('reset', this.render, this);
        this.newRow = {
            "note" : "",
            "tipologia" : "",
            "istituto" : ""
        };
        this.tipologia = '';
        this.istituto = '';
        this.domanda = '';
        this.code = '';
        this.hasDropDown = false;
    },
    events: {
        'click .button' : 'onRemove'
    },
    render : function() {
        var details = this.collection.toJSON()[0];
        wkscApp.setValues('customerRapportosDetails', details.data[0]);
        var $this = this;
        $($this.el).html('');
        if (details.status == 'success' && details.data.length > 0) {
            $this.domanda = details.data[0].domanda;
            $this.tipologia = details.data[0].tipologia;
            $this.istituto = details.data[0].istituto;
            $this.code = details.data[0].code;
            $this.hasDropDown = (($this.tipologia != '' && $this.istituto != '')? true : false);
            if (details.data[0].sections && details.data[0].sections.length > 0) {
                $.each(details.data[0].sections, function(i, li) {
                    $this.onAdd(li);
                });
            } /*else {
             $this.onAdd($this.newRow);
             }*/
        }
        $('#other_banks_table').wkscspinner('remove');
        wkscommerciale.log.doPopLog(this.options);
        return this;
    },
    onAdd : function(li) {
        if(this.hasDropDown) {
            $(this.el).append(this._filterTemplate({
                "tipologia" : this.tipologia,
                "istituto" : this.istituto,
                "data" : li
            }));
        }
    },
    onRemove: function(e){
        $(e.target).parent('td').parent('tr').remove();
        $(window).trigger('scrollbar:resize', 'relative');
    }
});
//== Customer Rapporto - Submit ================================================================================|
wkscustomer.views.CustomerRapportoNuovoView = Backbone.View.extend({
    initialize : function(options) {
        this.options = options;
        this._filterTemplate = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/rapporto/customer_rapporto_nuovo'));
        this.listInstance = options.listInstance;
    },
    events: {
        "click #customer_rapporto_nuovo" : "onAddNew",
        "click #customer_rapporto_submit" : "onSubmit"
    },
    render: function() {
        $(this.el).html(this._filterTemplate);
        $(window).trigger('cardmaster:loaded', this.$el);
        $(window).trigger('scrollbar:resize', 'relative');
        wkscommerciale.log.doPopLog(this.options);
        return this;
    },
    onAddNew: function(){
        this.listInstance.onAdd(this.listInstance.newRow);
        $(window).trigger('scrollbar:resize', 'relative');
    },
    onSubmit: function(){
        var customerRapportosDetailsObj =  JSON.stringify(wkscApp.getValues('customerRapportosDetails'));
        if(this.listInstance.hasDropDown) {
            var paramArray = [];
            var domArray = $('#other_banks_table_content').children('tr');
            if(domArray.length > 0){
                domArray.each(function(index) {
                    var tipologia = $(this).children('td').children('.rapporto_tipologia').children("select").children("option:selected").attr("value");
                    var istituto = $(this).children('td').children('.rapporto_istituto').children("select").children("option:selected").attr("value");
                    var note = $(this).children('td').children('.rapporto_note').val();
                    paramArray.push({
                        "note" : note,
                        "tipologia" : tipologia,
                        "istituto" : istituto
                    });
                });
            }
            var makeParams = {
                "soggettoId" : wkscommerciale.idSoggetto.get(),
                "domanda" : this.listInstance.domanda,
                "tipologia" : this.listInstance.tipologia,
                "istituto" : this.listInstance.istituto,
                "code" : this.listInstance.code,
                "sections" : paramArray
            };
            var initialParams = 'idsoggetto=' + wkscommerciale.idSoggetto.get()
                + '##DATI_PRECEDENTI='+customerRapportosDetailsObj
                + '##DATI_NUOVI='+JSON.stringify(makeParams);

            var log = new wkscommerciale.log.wkscLogger(" 3.4.2.other_banks_card.html", "WKSC-OTBU", initialParams);
            wkscommerciale.log.doPushLog({logger: log});

            wkscustomer.collections.customerRapportoNuovoSubmit = new wkscustomer.collections.CustomerRapportoNuovoSubmit();
            wkscustomer.collections.customerRapportoNuovoSubmit.save(makeParams, {
                success: function(model, response) {
                    if(wkscApp.getTipoQuestionario()=="Business")
                    {
                        var bcRapportiAltre = new wkscustomer.collections.BCRapportiAltreDetails();
                        var BCRapportiAltreRefresh = new wkscustomer.views.BCRapportiAltreRefresh({
                            el:$("#company_other_banks"),
                            collection:bcRapportiAltre
                        });
                        if(BCRapportiAltreRefresh) {
                            wkscommerciale.consolle.log('BCRapportiAltreRefresh variable is used!');
                        }
                    }
                    else
                    {
                        var personaliQuestionari = new wkscustomer.collections.PersonaliQuestionariList();
                        var PersonaliPrivacyView = new wkscustomer.views.PersonaliPrivacyView({
                            el:$("#personal_privacy"),
                            collection:personaliQuestionari
                        });
                        if(PersonaliPrivacyView) {
                            wkscommerciale.consolle.log('PersonaliPrivacyView variable is used!');
                        }
                    }
                },
                error: function(model, response) {
                }
            });
            wkscommerciale.log.doPopLog({logger: log});
            //---------------------------------------------------------------------------------|
        }
    }
});
wkscustomer.views.PopupSignalView = Backbone.View.extend({
    initialize : function(options) {
        this.options = options;
        this.collection.on('reset', this.render, this);
        this.template = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/report_msg_block_template'));
        this.customerType = options.customerType;
        this.reloadCustomerCard = options.reloadCustomerCard;
        // this.soggettoId = wkscommerciale.idSoggetto.get();
        this.soggettoId = options.soggettoId;
        //5077
        //this.isSaldiVisible = false;
        /* wkscommerciale.ajaxRequests.get({
         url: wkscustomerContext + '/service/customers/saldiVisible',
         params: { soggettoId: this.soggettoId },
         onSuccess: _.bind(function(response) {
         wkscommerciale.notifyError.pushError(response.message);
         if(_.size(response.data) > 0) {
         if(  response.data[0] === true) {
         this.isSaldiVisible = true;
         }
         }
         }, this),
         onError: _.bind(function(response) {
         wkscommerciale.notifyError.pushError(response.message);
         }, this)
         });*/

    },
    events : {
        'click .remind-me-later-btn' : 'remindMeLater',
        'click .sm-do-action-btn' : 'doActionSM'
    },
    render : function() {
        this.soggIdList = wkscustomer.popupSignalSoggIdList;
        this.customerName = wkscustomer.customerName
        delete wkscustomer.popupSignalSoggIdList;
        delete wkscustomer.customerName;
        wkscommerciale.consolle.log('PopupSignalView render called!!');
        if(wkscommerciale.idSoggettoLinked.get()!==""){
            wkscommerciale.idSoggettoLinked.clean()
        }
        if(this.reloadCustomerCard) {
            this.loadCustomerHomePage();
        }
        var response = this.collection.toJSON();
        var msg = ! wkscommerciale.checkIsEmpty(response) && _.has(response[0], 'message') ? response[0].message : '';
        wkscommerciale.notifyError.pushError(msg);
        var popupSignals = ! wkscommerciale.checkIsEmpty(response) && _.has(response[0], 'data') ? response[0].data : [];
        /* prepare unique list of popup signals */
        var uniqPopupSignals = this.getUniqPopupSignals(popupSignals);
        /* append custoemr details for each popup signal */
        var popupSignalData = this.preparePopupSignalData(popupSignals, uniqPopupSignals);
        wkscommerciale.consolle.log('popup signal data ::::::: ' + JSON.stringify(popupSignalData));
        if(popupSignalData.length > 0) {
            this.$("#report-msg-block-container")
                .addClass('reporting-msg-block')
                .html(this.template({
                    data: popupSignalData
                }));
        } else {
            this.executeSuspendedSMAction();
            // remove popup signals
            this.$("#report-msg-block-container").html('').removeClass('reporting-msg-block');
        }
        $(window).trigger('cardmaster:loaded', this.$el);
        // wkscommerciale.log.doPopLog({logger: this.options.logger});
        if(_.size(popupSignals) < 1) {
            this.destroy();
        }
    },
    getUniqPopupSignals : function(data) {
        var uniqPopupSignal = [], mergedPopupSignals = {};
        if(data.length > 0) {
            _.each(data[0], function(popups, soggId) {
                _.each(popups, function(popup, i){
                    if(_.has(mergedPopupSignals, popup.msgCode)) {
                        mergedPopupSignals[popup.msgCode].push(popup);
                    } else {
                        mergedPopupSignals[popup.msgCode] = [popup];
                    }
                    if(wkscommerciale.arrayHelper.searchObject(uniqPopupSignal, [{key: 'msgCode', val: popup.msgCode}], false) === -1) {
                        /* add empty array of customers which will be updated later */
                        popup.customerList = [];
                        uniqPopupSignal.push(popup);
                    }
                }, this);
            }, this);
        }
        /* decide which label has to be shown for skip button */
        _.each(mergedPopupSignals, function(popups, msgCode) {
            var needRemindMeLater = true;
            _.every(popups, function(popup, i) {
                needRemindMeLater = popup.needRemindMeLater;
                return ! needRemindMeLater;
            }, this);
            var popupIndex = wkscommerciale.arrayHelper.searchObject(uniqPopupSignal, [{key: 'msgCode', val: msgCode}], false);
            if(popupIndex !== -1) {
                /* if popup data available then update the flag to decide which skip button label should be shown */
                uniqPopupSignal[popupIndex].needRemindMeLater = needRemindMeLater;
            }
        }, this);
        return uniqPopupSignal;
    },
    preparePopupSignalData : function(data, uniqPopupSignals) {
        _.each(this.soggIdList, function(soggid, i) {
            var popups = _.has(data[0], soggid) ? data[0][soggid] : [];
            if( ! wkscommerciale.checkIsEmpty(popups)) {
                _.each(popups, function(popup, j) {
                    var popupIndex = wkscommerciale.arrayHelper.searchObject(uniqPopupSignals, [{key: 'msgCode', val: popup.msgCode}], false);
                    if(popupIndex > -1) {
                        if(i > 0) {
                            var response = wkscustomer.soggettiAbilitatiCollection[0];
                            if(_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data)) {
                                /* AZIENDE */
                                if(_.has(response.data[0], 'linkedSubjects')) {
                                    var subjectData = wkscommerciale.arrayHelper.searchObject(response.data[0].linkedSubjects, [{key: 'idsoggetto', val: soggid}], true);
                                    if( ! _.isUndefined(subjectData)) {
                                        uniqPopupSignals[popupIndex].customerList.push({name: subjectData.name, soggettoId: soggid});
                                    }
                                }
                                /* PRIVATE or PLURI */
                                else if(_.has(response.data[0], 'soggettiAbilitati')) {
                                    var subjectData = wkscommerciale.arrayHelper.searchObject(response.data[0].soggettiAbilitati, [{key: 'soggettoId', val: soggid}], true);
                                    if( ! _.isUndefined(subjectData)) {
                                        uniqPopupSignals[popupIndex].customerList.push({name: subjectData.soggetto, soggettoId: soggid});
                                    }
                                }
                            }
                        } else {
                            /* currently loading customer details */
                            uniqPopupSignals[popupIndex].customerList.push({name: this.customerName, soggettoId: soggid});
                        }
                    }
                }, this);
            }
        }, this);
        return uniqPopupSignals;
    },
    loadCustomerHomePage : function() {
        // wkscommerciale.log.doPushLog({logger: this.options.logger});
        if(this.customerType === 'PRIVATE') {
            var PersonalCustomerView = new wkscustomer.views.PersonalCustomerView({
                el: $(".card"),
                logger: this.options.logger,
                isSaldiVisible: wkscustomer.isSaldiVisible,
                soggettoId: this.soggettoId
            });
            if(PersonalCustomerView) {
                wkscommerciale.consolle.log('PersonalCustomerView variable is used!');
            }
        } else if(this.customerType === 'PLURI') {
            var PlurintestazioneCustomerView = new wkscustomer.views.PlurintestazioneCustomerView({
                el: $(".card"),
                logger: this.options.logger,
                isSaldiVisible: wkscustomer.isSaldiVisible,
                soggettoId: this.soggettoId
            });
            if(PlurintestazioneCustomerView) {
                wkscommerciale.consolle.log('PlurintestazioneCustomerView variable is used!');
            }
        } else if(this.customerType === 'AZIENDE') {
            var BCCustomersStartView = new wkscustomer.views.BCCustomersStartView({
                el: $(".card"),
                logger: this.options.logger,
                isSaldiVisible: wkscustomer.isSaldiVisible,
                soggettoId: this.soggettoId
            });
            if(BCCustomersStartView) {
                wkscommerciale.consolle.log('BCCustomersStartView variable is used!');
            }
        }
    },
    remindMeLater : function(e) {
        wkscommerciale.consolle.log('Remind Me Later Clicked!!');
        $target = $(e.currentTarget);
        var msgCode = $target.attr('data-msg-code');
        wkscommerciale.consolle.log('msg code: ' + msgCode);
        var soggIds = $target.attr('data-sogg-id-list');
        wkscommerciale.consolle.log('soggIds: ' + soggIds);
        $(this.$el).trigger('report:skip-report', e);
        if( ! wkscommerciale.checkIsEmpty(soggIds)) {
            // to increment skip counter
            wkscommerciale.ajaxRequests.post({
                url: window.wkscustomerContext + '/service/customers/updateSkips',
                params: {
                    'soggettoIdList' : soggIds,
                    'msgCode' : msgCode,
                    'userCode' : wkscApp.getOperatoreIns()
                },
                onSuccess: function() {},
                onError: function(e) {
                    wkscommerciale.notifyError.pushError("Increment skip counter Failed!");
                }
            });
        }
        if(this.$('.reporting-msg-block').length <= 0) {
            this.executeSuspendedSMAction();
            // remove the view and unbind events
            this.destroy();
        }
    },
    doActionSM : function(e) {
        wkscommerciale.consolle.log('SM Action Button Clicked!!');
        var $this = this;
        // disable CTRL + Click behavior only on Privacy Popup SM button
        try{
            if(e && e.ctrlKey) {
                e.ctrlKey = false;
            }
            if(window.event && window.event.ctrlKey) {
                window.event.ctrlKey = false;
            }
            wkscommerciale.consolle.log('Disabling CTRL + Click on Privacy popup SM button - Success');
        } catch(e) {
            wkscommerciale.consolle.log('Disabling CTRL + Click on Privacy popup SM button - Failure');
        }
        _window_event = e;
        $target = this.$(e.currentTarget);
        var smName = $target.attr('data-sm-name');
        var soggettoId = $target.attr('data-soggetto-id') ? $target.attr('data-soggetto-id') : wkscommerciale.idSoggetto.get();
        wkscommerciale.consolle.log('sm name: ' + smName);
        var smParamKeywords = $target.attr('data-sm-param-keywords');
        wkscommerciale.consolle.log('sm param keywords: ' + smParamKeywords);
        var smParamsArray = ! wkscommerciale.checkIsEmpty(smParamKeywords) ? smParamKeywords.split('||') : [];
        var params = '';
        _.each(smParamsArray, function(param, i) {
            switch(param) {
                case 'CustomerSubjectId':
                    params += ! wkscommerciale.checkIsEmpty(params) ? SPLITTER_STRING + soggettoId : soggettoId;
                    break;
                case 'EmployeeSubjectId':
                    params += ! wkscommerciale.checkIsEmpty(params) ? SPLITTER_STRING + wkscommerciale.user.data.subjectId : wkscommerciale.user.data.subjectId;
                    break;
            }
        }, this);
        wkscommerciale.triggerIframeCloseEvent = true;
        // listen for iframe dialog close event
        $(window).on('WKSC:iframeCloseCalled', function(e){
            wkscommerciale.consolle.log('chp reload event listened');
            $this.$("#report-msg-block-container").html('').removeClass('reporting-msg-block');
            // reload CHP
            reloadCHP();
            $this.destroy();
        });
        // remove suspended SM Operation
        delete wkscommerciale.suspenderSMAction;
        // remove popup signals when SM push happens
        this.$("#report-msg-block-container").html('').removeClass('reporting-msg-block');
        // open SM and prepare its params
        wkscSMHandler.openLink_smAdaptor({
            smname: smName,
            outparams: "",
            inputparams: params,
            newtab: "0",
            iframe: "1",
            attribute: ""
        });
    },
    executeSuspendedSMAction : function() {
        // trigger the suspended SM operation if any
        if(wkscommerciale.suspenderSMAction !== undefined && typeof wkscommerciale.suspenderSMAction === 'function'){
            wkscommerciale.suspenderSMAction();
            // remove suspended SM operation after execution
            delete wkscommerciale.suspenderSMAction;
        }
    },
    refresh : function(params) {
        wkscommerciale.log.doPushLog({logger: this.options.logger});
        this.collection.fetch(wkscommerciale.utils.fetchCallback(params));
    },
    destroy : function() {
        // Completely swipes the element from the DOM
        this.undelegateEvents();
        this.collection.off(null, null, this);
        this.$el.removeData().off();
        // unbind event listening
        $(window).off('WKSC:iframeCloseCalled');
        //this.remove();
        //Backbone.View.prototype.remove.call(this);
    }
});
//PORTAHC-6323 new card view
wkscustomer.views.VideoConferencePage = Backbone.View.extend({
	   initialize: function(options) {
	        this.options = options;
	        //this.logger = options.logger;
	        this._templateTabella = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/video_conference/VC_Table'));
	        this._template = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/video_conference/VC_Page'));			   
	        this._templateClient = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/video_conference/VC_PageClient'));
		    this.subjectId = wkscommerciale.idSoggetto.get();
	   },
	    events : {
	        'click #insertAuth' : 'insertAuth',
	        'click #searchAuth' : 'searchAuth',
		    'click #insertAuthClient' : 'insertAuthClient',
		    'click #searchAuthClient' : 'searchAuthClient',
		    'keypress #numeroCellulareText': 'checkNumber',
		    'blur #numeroCellulareText' : 'fixIntNumber',
            /* PORTAHC-6375*/
            'keypress #numeroCellulareTextFissaVC': 'checkNumber',
            'blur #numeroCellulareTextFissaVC' : 'fixIntNumberVC',
            'click #inviaBtnFissaVC' : 'inviaCallback',
            'click #clientInviaBtnFissaVC' : 'inviaCallbackClient'
	    },
	    checkNumber :  function(e){
	        var keycode = e.which;
	        if (!(e.shiftKey === false && (keycode == 43 || (keycode >= 48 && keycode <= 57)))) {
	            e.preventDefault();
	        }
	    },
	    fixIntNumber: function(e){
	    	var cell = $('#numeroCellulareText').val(); 
	    	if(cell != "" && cell.lastIndexOf("+", 0) !== 0){
	    		$('#numeroCellulareText').val("+39" + cell);
	     	}
	    },
	    validationEmail: function(email) { //validate email
	    	var valid = true; 
	    	if (valid && email.length > 0) {
	            var regex = /.+\@.+\..+/i
	            if (regex && !regex.test(email)) {
	                valid = false;
	            }
	    	}else{
	    		valid = false; 
	    	}
	    	if(!valid && email !== ""){
	    		$('#videoconferencePage').empty(); 
	    		  $('#statusVC').addClass("red");
                  $('#statusVC').html("Email non valida");
	    	}
	    	return valid;   	
	    },
	    validationEmailWithoutMessage: function(email) { //validate email
	    	var valid = true; 
	    	if (valid && email.length > 0) {
	            var regex = /.+\@.+\..+/i
	            if (regex && !regex.test(email)) {
	                valid = false;
	            }
	    	}else{
	    		valid = false; 
	    	}
	    	return valid;   	
	    },
	    validationPhone: function(cell) { //validate cell
	     	var valid = true; 
	     	
	    	if (valid && cell.length > 0 && cell.length <= 13) {
	            var regex = /([+](\d{11,12}))/i
	            if (regex && !regex.test(cell)) {
	                valid = false;
	            } 
	    	}else{
	    		valid = false; 
	    	}
	    	if(!valid && cell !== ""){
	    		$('#videoconferencePage').empty(); 
	    		$('#statusVC').addClass("red");
                $('#statusVC').html("Numero di cellulare non valido");
	    	}
	    	return valid; 
	    	
	    },
	    validationPhoneWithoutMessage: function(cell) { //validate cell
	     	var valid = true; 
	    	if (valid && cell.length > 0 && cell.length <= 13) {
	            var regex = /([+](\d{11,12}))/i
	            if (regex && !regex.test(cell)) {
	                valid = false;
	            } 
	    	}else{
	    		valid = false; 
	    	}
	    	return valid; 
	    	
	    },
	    resetValidation: function(){
	    	$('#videoconferencePage').empty(); 
	    	$('#statusVC').removeClass("red");
            $('#statusVC').html("");
	    },
	    writeError: function(text){
    		$('#videoconferencePage').empty(); 
  		    $('#statusVC').addClass("red");
            $('#statusVC').html(text);
	    }, 
	    dateFormatter: function(days) { //making the date ready to insert in rest
	    	var date = new Date();
	    	if(days == null){
	    		return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + " 00:00:00";
	    	}
	    	date.setDate(date.getDate()-days);
	    	return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + " 00:00:00"; 
	    	
	    },
	    dateFormatterEnd: function() {
	    	var date = new Date();
	    	return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + " 23:59:59";
	    },//configuring the dropdowns
	    dropdownLoad : function() {
	    	$(".dropdownVC").each(function(i, el) {
	            $(el).off('click').on("click", function(evt) {
	                evt.preventDefault;
	                $(".dropdown-open").not(evt.currentTarget).removeClass("dropdown-open");
	                $(evt.currentTarget).toggleClass("dropdown-open");
	            });
	            $(el).off("mousewheel").on("mousewheel", function(evt) {
	                evt.stopImmediatePropagation();
	            });
	            $(".js-dropdown-menu > *", el).not(".dropdown-header").each(function(j, item) {
	                $(item).off("click").on("click", function() {
	                    $(".js-dropdown-menu > *", el).removeClass("active");
	                    $(".js-dropdown-label", el).html($(item).html());
	                    $(item).addClass("active");
	                });

	            })
	        });
	    },
    insertAuthClient : function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.resetValidation();
        $('#videoconferencePage').wkscspinner({css: 'large', position: true});
        var cell = $('#cellVC ul').find('.active')[0].innerText;
        var email = $('#emailVC ul').find('.active')[0].innerText;
        var formattedDate = "";
        var endFormattedDate = "";
        formattedDate = this.dateFormatter();
        endFormattedDate = this.dateFormatterEnd();

        var paramsInsert ={
            'email' : email,
            'phone' :cell,
        };
        var params ={
            'email' : email,
            'phone' :cell,
            'dateStart' : formattedDate,
            'dateEnd': endFormattedDate,
        };

        var emailValid = true;
        if(email.indexOf('Selezionare email') === -1){
            var paramsEmail ={
                'email' : email,
            };
            _.extend(params, paramsEmail);

        } else {
            var paramsEmail ={
                'email' : "",
            };
            _.extend(params, paramsEmail);
            emailValid = false;
        }
        var cellValid = true;
        if(cell.indexOf('Selezionare un numero di cellulare') === -1){
            var paramsCell ={
                'phone' :cell,
            };
            _.extend(params, paramsCell);
        } else {
            var paramsCell ={
                'phone' : "",
            };
            _.extend(params, paramsCell);
            cellValid = false;
        }



        if(cellValid && emailValid){
            wkscommerciale.ajaxRequests.get({
                url: window.wkscustomerContext + '/service/customers/insertValidationRequestVideoConference' ,
                params:paramsInsert,
                onSuccess: _.bind(function(response) {

                    if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.data[0].status === "OK") {
                        //WKSC-VAIN
                        var loggingParam = {};
                        loggingParam.MAIL = params["email"];
                        loggingParam.CELLULARE = params["phone"];
                        loggingParam.idsoggetto = wkscommerciale.idSoggetto.get();
                        var log = new wkscommerciale.log.wkscLogger("video_conference_card.html","WKSC-VAIN",
                            wkscommerciale.utils.obsKeysValueWithSeparatorToString(loggingParam, "##"));
                        wkscommerciale.log.doPushLog({logger: log});
                        wkscommerciale.log.doPopLog({logger: log});

                        wkscommerciale.ajaxRequests.get({
                            url: window.wkscustomerContext + '/service/customers/getListValidationsVideoConference' ,
                            params:params,
                            onSuccess: _.bind(function(response) {
                                if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.data[0].status === "OK") {
                                    //WKSC-VALI
                                    var loggingParam = {};
                                    loggingParam.MAIL = params["email"];
                                    loggingParam.CELLULARE = params["phone"];
                                    loggingParam.DATA_INVIO = formattedDate+'-'+endFormattedDate; //data ot this
                                    loggingParam.idsoggetto = wkscommerciale.idSoggetto.get();
                                    var log = new wkscommerciale.log.wkscLogger("video_conference_card.html","WKSC-VALI",
                                        wkscommerciale.utils.obsKeysValueWithSeparatorToString(loggingParam, "##"));
                                    wkscommerciale.log.doPushLog({logger: log});
                                    wkscommerciale.log.doPopLog({logger: log});
                                    if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data)) {

                                        $('#videoconferencePage').empty();
                                        $('#videoconferencePage').append(this._templateTabella(
                                            {"data": response.data[0] }
                                        ));
                                        this.dropdownLoad();

                                        $(window).trigger('scrollbar:resize', 'relative');
                                        $('#videoconferencePage').wkscspinner('remove');
                                    }
                                }else{
                                    this.writeError("Errore durante la richiesta");
                                    wkscommerciale.notifyError.pushError(response.message);
                                    $('#videoconferencePage').wkscspinner('remove');
                                }
                            }, this),
                            onError: _.bind(function(evt) {
                                wkscommerciale.notifyError.pushFromFetchError(evt, []);
                                $('#videoconferencePage').wkscspinner('remove');
                            }, this)
                        });
                    }else{
                        this.writeError("Errore durante la richiesta");
                        wkscommerciale.notifyError.pushError(response.message);
                        $('#videoconferencePage').wkscspinner('remove');
                    }
                }, this),
                onError: _.bind(function(evt) {
                    wkscommerciale.notifyError.pushFromFetchError(evt, []);
                    $('#videoconferencePage').wkscspinner('remove');
                }, this)
            });
        }else{
            $('#videoconferencePage').wkscspinner('remove');
            if(!this.validationPhoneWithoutMessage(cell) && !this.validationEmailWithoutMessage(email)){
                $('#videoconferencePage').empty();
                $('#statusVC').addClass("red");
                $('#statusVC').html("Dati non validi");
            }
            else if(!this.validationPhoneWithoutMessage(cell)){
                $('#videoconferencePage').empty();
                $('#statusVC').addClass("red");
                $('#statusVC').html("Numero di cellulare non valido");
            }
            else if(!this.validationEmailWithoutMessage(email)){
                $('#videoconferencePage').empty();
                $('#statusVC').addClass("red");
                $('#statusVC').html("Email non valida");
            }
        }

    },
    // PORTAHC-6374 starts
    fixIntNumberVC: function(e){
        var cell = $('#numeroCellulareTextFissaVC').val();
        if(cell != "" && cell.lastIndexOf("+", 0) !== 0){
            $('#numeroCellulareTextFissaVC').val("+39" + cell);
        }
    },
    resetValidationFissaVC: function(){
        $('#fissaVideoconferencePage').empty();
        $('#statusFissaVC').removeClass("red");
        $('#statusFissaVC').html("");
    },
    writeErrorFissaVC: function(text){
        $('#fissaVideoconferencePage').empty();
        $('#statusFissaVC').addClass("red");
        $('#statusFissaVC').html(text);
    },
    isValid : function (cell, email, ora){ // To validate the input value and set the error messages
            var status = true;
            $('#fissaVideoconferencePage').wkscspinner('remove');
            if(!this.validationPhoneWithoutMessage(cell)
                && !this.validationEmailWithoutMessage(email)){this.writeErrorFissaVC("Dati non validi"); status = false;}
            else if(!this.validationPhoneWithoutMessage(cell)){this.writeErrorFissaVC("Numero di cellulare non valido"); status = false;}
            else if(!this.validationEmailWithoutMessage(email)){ this.writeErrorFissaVC("Email non valida");status = false;}
            else if($('#dataFissaVC').val() ==""){ this.writeErrorFissaVC("Data non valida");status = false; }
            else if(ora == 'Selezionare Ora'){ this.writeErrorFissaVC("Ora non valida");status = false; }
            return status
    },
    getFissaVCParams : function (cell, email){ // To build Param values for the rest call
        var ora = $('#oraFissaVC ul').find('.active')[0].innerText;
        var dataFissaVC = $('#dataFissaVC').val()+" "+ora+":00";
        var idSoggetto = wkscommerciale.idSoggetto.get();
        var abiCode = wkscommerciale.user.data.abiCode;
        var agent = wkscommerciale.user.data.code;
        var params ={
            'system':'WKSC',
            'agent' : agent,
            'abiCode': abiCode,
            'phone' :cell,
            'email' : email,
            'idSoggetto' : idSoggetto,
            'idProspect': null,
            'callbackScheduledTime' : dataFissaVC
        };
            return params;
    },
    inviaCallbackClient : function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.resetValidationFissaVC();
        $('#fissaVideoconferencePage').wkscspinner({css: 'large', position: true});
        var cell = $('#cellFissaVC ul').find('.active')[0].innerText;
        var email = $('#emailFissaVC ul').find('.active')[0].innerText;
        var ora = $('#oraFissaVC ul').find('.active')[0].innerText;
        var params = this.getFissaVCParams(cell, email);
        var emailValid = true;
        if(email.indexOf('Selezionare email') === -1){
            var paramsEmail ={
                'email' : email,
            };
            _.extend(params, paramsEmail);
        } else {
            var paramsEmail ={
                'email' : "",
            };
            _.extend(params, paramsEmail);
            emailValid = false;
        }
        var cellValid = true;
        if(cell.indexOf('Selezionare un numero di cellulare') === -1){
            var paramsCell ={
                'phone' :cell,
            };
            _.extend(params, paramsCell);
        } else {
            var paramsCell ={
                'phone' : "",
            };
            _.extend(params, paramsCell);
            cellValid = false;
        }
        if(cellValid && emailValid && this.validationPhoneWithoutMessage(cell) && this.validationEmailWithoutMessage(email)
            && ora != 'Selezionare Ora' && $('#dataFissaVC').val() !="" ){
            this.getStatusFissaVC(params);
        }else{
            this.isValid(cell, email, ora);
        }
    },
    inviaCallback : function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.resetValidationFissaVC();
        $('#fissaVideoconferencePage').wkscspinner({css: 'large', position: true});
        var cell = $('#numeroCellulareTextFissaVC').val();
        var email = $('#emailTextFissaVC').val();
        var ora = $('#oraFissaVC ul').find('.active')[0].innerText;
        var params = this.getFissaVCParams(cell, email);
        if(this.validationPhoneWithoutMessage(cell) && this.validationEmailWithoutMessage(email)
            && ora != undefined && ora != 'Selezionare Ora' && $('#dataFissaVC').val() !=""){
            this.getStatusFissaVC(params);
        }else{
            this.isValid(cell, email, ora);
        }
    },
    getStatusFissaVC : function(params){
        wkscommerciale.ajaxRequests.post({//sending rest call
            url: window.wkscustomerContext + '/service/customers/sendVideoConferenceInviaRequest' ,
            params: params,
            dataType: 'json',
            onSuccess: _.bind(function(response) {
                // For logger starts
                var loggingParam = {};
                loggingParam.MAIL = params["email"];
                loggingParam.CELLULARE = params["phone"];
                loggingParam.idsoggetto = params["idSoggetto"].length == 0 ?" ": params["idSoggetto"];
                loggingParam.DATA = $('#dataFissaVC').val();
                loggingParam.ORA = $('#oraFissaVC ul').find('.active')[0].innerText;
                var log = new wkscommerciale.log.wkscLogger("video_conference_card.html","WKSC-VASD",
                    wkscommerciale.utils.obsKeysValueWithSeparatorToString(loggingParam, "##"));
                wkscommerciale.log.doPushLog({logger: log});
                wkscommerciale.log.doPopLog({logger: log});
                // For logger ends
                if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.data[0].status === "OK") {
                    this.resetValidationFissaVC();
                   // $('#fissaVideoconferencePage').empty();
                    $('#statusFissaVC').addClass("green");
                    $('#statusFissaVC').html("Richiesta inviata correttamente");

                    this.dropdownLoad();
                    $(window).trigger('scrollbar:resize', 'relative');
                    $('#fissaVideoconferencePage').wkscspinner('remove');
                }else{
                    this.writeErrorFissaVC(response.data[0].errMessage);
                    //wkscommerciale.notifyError.pushError(response.message);
                    $('#fissaVideoconferencePage').wkscspinner('remove');
                }
            }, this),
            onError: _.bind(function(evt) {
                // wkscommerciale.notifyError.pushFromFetchError(evt, []);
                $('#fissaVideoconferencePage').wkscspinner('remove');
            }, this)
        });
    },
    // PORTAHC-6374 ends
    //logic for click of new validazione without user info
	    insertAuth : function(e) {
	    	e.stopPropagation();
	        e.preventDefault();
	        this.resetValidation(); 
	        $('#videoconferencePage').wkscspinner({css: 'large', position: true});   
	        var cell = $('#numeroCellulareText').val(); 
	        var email = $('#emailText').val(); 
	        
	        var formattedDate = this.dateFormatter();
	        var endFormattedDate =  this.dateFormatterEnd();

	        var paramsInsert ={
	 		            'email' : email,
	 		            'phone' :cell  
            };
	        var params ={
 		            'email' : email,
 		            'phone' :cell,
 		            'dateStart' : formattedDate,
 		            'dateEnd':endFormattedDate   
            };

            
	        if(this.validationPhone(cell) && this.validationEmail(email)){
                wkscommerciale.ajaxRequests.get({//sending rest and updating the table
		        url: window.wkscustomerContext + '/service/customers/insertValidationRequestVideoConference' ,
		        params:paramsInsert,
		        onSuccess: _.bind(function(response) {	        	
		        	if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.data[0].status === "OK") {        		
		        		//WKSC-VAIN
				    	var loggingParam = {};
			            loggingParam.MAIL = params["email"];
			            loggingParam.CELLULARE = params["phone"];
			            loggingParam.idsoggetto = " ";
			            var log = new wkscommerciale.log.wkscLogger("video_conference_card.html","WKSC-VAIN",
			                wkscommerciale.utils.obsKeysValueWithSeparatorToString(loggingParam, "##"));
			            wkscommerciale.log.doPushLog({logger: log});
		                wkscommerciale.log.doPopLog({logger: log});
		                
		        		wkscommerciale.ajaxRequests.get({
		    		        url: window.wkscustomerContext + '/service/customers/getListValidationsVideoConference' ,
		    		        params:params,
		    		        onSuccess: _.bind(function(response) {
		    		        	if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.data[0].status === "OK") {
			    		        	//WKSC-VALI
						            var loggingParam = {};
						            loggingParam.MAIL = params["email"];
						            loggingParam.CELLULARE = params["phone"];
						            loggingParam.DATA_INVIO = formattedDate+'-'+endFormattedDate;
						            loggingParam.idsoggetto = " ";
						            var log = new wkscommerciale.log.wkscLogger("video_conference_card.html","WKSC-VALI",
						                wkscommerciale.utils.obsKeysValueWithSeparatorToString(loggingParam, "##"));
						            wkscommerciale.log.doPushLog({logger: log});
						            wkscommerciale.log.doPopLog({logger: log});
						            
		    				    	this.resetValidation(); 
		    				    	$('#videoconferencePage').empty(); 
		    				    	$('#videoconferencePage').append(this._templateTabella(
		    				    			{"data": response.data[0] }
		    			           ));
		    				    	
		    			            
		    				    	this.dropdownLoad();
		    				    	$(window).trigger('scrollbar:resize', 'relative');
		    				    	$('#videoconferencePage').wkscspinner('remove');
		    				    }else{
		    				    	this.writeError("Errore durante la richiesta"); 
		    				    	wkscommerciale.notifyError.pushError(response.message);
		    			            $('#videoconferencePage').wkscspinner('remove'); 
		    				    }
		    		        }, this),
		    		        onError: _.bind(function(evt) {
		    		            wkscommerciale.notifyError.pushFromFetchError(evt, []);
		    		            $('#videoconferencePage').wkscspinner('remove');
		    		        }, this)
		    		    });
				    }else{
				    	this.writeError("Errore durante la richiesta"); 
				    	wkscommerciale.notifyError.pushError(response.message);
			            $('#videoconferencePage').wkscspinner('remove');           
				    }
		        }, this),
		        onError: _.bind(function(evt) {
		            wkscommerciale.notifyError.pushFromFetchError(evt, []);
		            $('#videoconferencePage').wkscspinner('remove');
		        }, this)
		    });
		    }else{
		    	
		    	$('#videoconferencePage').wkscspinner('remove');
		    	if(!this.validationPhoneWithoutMessage(cell) && !this.validationEmailWithoutMessage(email)){
		    		$('#videoconferencePage').empty(); 
		    		$('#statusVC').addClass("red");
	                $('#statusVC').html("Dati non validi");
		    	}
		    	else if(!this.validationPhoneWithoutMessage(cell)){
		    		$('#videoconferencePage').empty(); 
		    		$('#statusVC').addClass("red");
	                $('#statusVC').html("Numero di cellulare non valido");
		    	} 
		    	else if(!this.validationEmailWithoutMessage(email)){
		    		$('#videoconferencePage').empty(); 
		    		$('#statusVC').addClass("red");
	                $('#statusVC').html("Email non valida");
		    	}
		    }
	        
	        	
		   
	   },//logic for click of cerca without user info already retrived
	    searchAuth : function(e) {
	    	e.stopPropagation();
	        e.preventDefault();
	        this.resetValidation(); 
	        $('#videoconferencePage').wkscspinner({css: 'large', position: true}); 
	        var cell = $('#numeroCellulareText').val();
	        var email = $('#emailText').val(); 
	        var data = $('#dataVC ul').find('.active').attr('id');
	        var formattedDate = ""; 
	        var endFormattedDate = ""; 
	        endFormattedDate = this.dateFormatterEnd();
	        switch (data) {
	        case "dateOggi":
	        	formattedDate = this.dateFormatter();
	        	break;
	        case "dateWeek":
	        	formattedDate = this.dateFormatter(7);
	        	break;
	        case "dateMonth":
	        	formattedDate = this.dateFormatter(30);
	        	break;
	        case "date6month":
	        	formattedDate = this.dateFormatter(180);
	        	break;
	        default:
	        	formattedDate = this.dateFormatter();
	        	break;
	        }
	        
	        var params ={
	 		            'dateStart' : formattedDate,
	 		            'dateEnd': endFormattedDate,   
	 		            'email' : email, 
	 		            'phone' : cell
	 		           
            };

	        if((this.validationPhoneWithoutMessage(cell) && email === "") || (this.validationEmailWithoutMessage(email) && cell === "") ||  (this.validationPhoneWithoutMessage(cell) && this.validationEmailWithoutMessage(email))){
                wkscommerciale.ajaxRequests.get({
		        url: window.wkscustomerContext + '/service/customers/getListValidationsVideoConference' ,
		        params:params,
		        onSuccess: _.bind(function(response) {
		        	if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.data[0].status === "OK") {
	
		        		this.resetValidation();
				    	$('#videoconferencePage').empty(); 
				    	$('#videoconferencePage').append(this._templateTabella(
				    			{"data": response.data[0] }
			           )); 
				    	//WKSC-VALI
			            var loggingParam = {};
			            loggingParam.MAIL = params["email"];
			            loggingParam.CELLULARE = params["phone"];
			            loggingParam.DATA_INVIO = formattedDate+'-'+endFormattedDate;
			            loggingParam.idsoggetto = " ";
			            var log = new wkscommerciale.log.wkscLogger("video_conference_card.html","WKSC-VALI",
			                wkscommerciale.utils.obsKeysValueWithSeparatorToString(loggingParam, "##"));
			            wkscommerciale.log.doPushLog({logger: log});
			            wkscommerciale.log.doPopLog({logger: log});
				    	this.dropdownLoad();
				    	$(window).trigger('scrollbar:resize', 'relative');
				    	$('#videoconferencePage').wkscspinner('remove');
				    }else{
				    	this.writeError("Errore durante la richiesta"); 
		        		wkscommerciale.notifyError.pushError(response.message);
		        		$('#videoconferencePage').wkscspinner('remove');
				    }
		        }, this),
		        onError: _.bind(function(evt) {
		            wkscommerciale.notifyError.pushFromFetchError(evt, []);
		        	$('#videoconferencePage').wkscspinner('remove');
		        }, this)
		    });	
	        }else{
	        	$('#videoconferencePage').wkscspinner('remove');
		    	if(cell === ""){
		    		if(email === ""){
			    		$('#videoconferencePage').empty(); 
			    		$('#statusVC').addClass("red");
		                $('#statusVC').html("Dati non validi");
		    		}
		    		else if(!this.validationEmailWithoutMessage(email)){
			    		$('#videoconferencePage').empty(); 
			    		$('#statusVC').addClass("red");
		                $('#statusVC').html("Email non valida");
			    	} 
		    	}
		    	else if(email === ""){
		    		if(!this.validationPhoneWithoutMessage(cell)){
			    		$('#videoconferencePage').empty(); 
			    		$('#statusVC').addClass("red");
		                $('#statusVC').html("Numero di cellulare non valido");
			    	}
		    		
		    	}
		    	else if(!this.validationPhoneWithoutMessage(cell)){
		    		$('#videoconferencePage').empty(); 
		    		$('#statusVC').addClass("red");
	                $('#statusVC').html("Numero di cellulare non valido");
		    	}
		    	else if(!this.validationEmailWithoutMessage(email)){
		    		$('#videoconferencePage').empty(); 
		    		$('#statusVC').addClass("red");
	                $('#statusVC').html("Email non valida");
		    	}
		    	else if(!this.validationPhoneWithoutMessage(cell) && !this.validationEmailWithoutMessage(email)){
		    		$('#videoconferencePage').empty(); 
		    		$('#statusVC').addClass("red");
		    		$('#statusVC').html("Dati non validi");
		    	}
		    	
		    }
		   
	   },//logic for click of cerca with user info
	   searchAuthClient : function(e) {
	    	e.stopPropagation();
	        e.preventDefault();
	        this.resetValidation(); 
	        $('#videoconferencePage').wkscspinner({css: 'large', position: true});
	        var cell = $('#cellVC ul').find('.active')[0].innerText;
	        var email = $('#emailVC ul').find('.active')[0].innerText;
	        var data = $('#dataVC2 ul').find('.active').attr('id');
	        var date = new Date();
	        var endDate = new Date();
	        var formattedDate = ""; 
	        var endFormattedDate = this.dateFormatterEnd();
	        switch (data) {
	        case "dateOggi2":
	        	formattedDate = this.dateFormatter();
	        	break;
	        case "dateWeek2":
	        	formattedDate = this.dateFormatter(7);
	        	break;
	        case "dateMonth2":
	        	formattedDate = this.dateFormatter(30);
	        	break;
	        case "date6month2":
	        	formattedDate = this.dateFormatter(180);
	        	break;
	        default:
	        	formattedDate = this.dateFormatter();
	        	break;
	        }
	        
	        var params ={
	 		            'dateStart' : formattedDate,
	 		            'dateEnd': endFormattedDate  
            };
	        var emailValid = true; 
	        if(email.indexOf('Selezionare email') === -1){
		        var paramsEmail ={
		 		            'email' : email,  
	            };
		        _.extend(params, paramsEmail);
		        
	        } else {
	        	var paramsEmail ={
	 		            'email' : "",  
	        	};
	        _.extend(params, paramsEmail);
	        emailValid = false; 
	        }
	        var cellValid = true; 
	        if(cell.indexOf('Selezionare un numero di cellulare') === -1){
		        var paramsCell ={
		        			'phone' :cell, 
	            };
		        _.extend(params, paramsCell);
	        } else {
	        	var paramsCell ={
	        			'phone' : "", 
	        	};
	        _.extend(params, paramsCell);
	        cellValid = false; 
	        }

	        
	        if((cellValid || emailValid)){
		    wkscommerciale.ajaxRequests.get({
		        url: window.wkscustomerContext + '/service/customers/getListValidationsVideoConference' ,
		        params:params,
		        onSuccess: _.bind(function(response) {
		        	if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.data[0].status === "OK") {

		        		$('#videoconferencePage').empty(); 
		        		$('#videoconferencePage').append(this._templateTabella(
		        				{"data": response.data[0] }
		        		)); 
		        		//WKSC-VALI
		        		var loggingParam = {};
		        		loggingParam.MAIL = params["email"];
		        		loggingParam.CELLULARE = params["phone"];
		        		loggingParam.DATA_INVIO = formattedDate+'-'+endFormattedDate; //data ot this
		        		loggingParam.idsoggetto = wkscommerciale.idSoggetto.get();
		        		var log = new wkscommerciale.log.wkscLogger("video_conference_card.html","WKSC-VALI",
		        				wkscommerciale.utils.obsKeysValueWithSeparatorToString(loggingParam, "##"));
		        		wkscommerciale.log.doPushLog({logger: log});
		        		wkscommerciale.log.doPopLog({logger: log});
		        		this.dropdownLoad();
		        		$(window).trigger('scrollbar:resize', 'relative');
		        		$('#videoconferencePage').wkscspinner('remove');
		        	}else{
		        		this.writeError("Errore durante la richiesta"); 
		        		wkscommerciale.notifyError.pushError(response.message);
		        		$('#videoconferencePage').wkscspinner('remove');
		        	}
		        }, this),
		        onError: _.bind(function(evt) {
		            wkscommerciale.notifyError.pushFromFetchError(evt, []);
		        	$('#videoconferencePage').wkscspinner('remove');
		        }, this)
		    });	
	        }else{
	    		$('#videoconferencePage').empty(); 
	    		$('#statusVC').addClass("red");
                $('#statusVC').html("Dati non validi");
	        }
	        
	        

	   },//logic for click of new validazione with user info 
	    insertAuthClient : function(e) {
	    	e.stopPropagation();
	        e.preventDefault();
	        this.resetValidation(); 
	        $('#videoconferencePage').wkscspinner({css: 'large', position: true});
	        var cell = $('#cellVC ul').find('.active')[0].innerText;
	        var email = $('#emailVC ul').find('.active')[0].innerText;
	        var formattedDate = ""; 
	        var endFormattedDate = ""; 
	        formattedDate = this.dateFormatter();
	        endFormattedDate = this.dateFormatterEnd();
   
	        var paramsInsert ={
	 		            'email' : email,
	 		            'phone' :cell,  
            };
	        var params ={
 		            'email' : email,
 		            'phone' :cell,
 		            'dateStart' : formattedDate,
 		            'dateEnd': endFormattedDate,   
            };
	        
	        var emailValid = true; 
	        if(email.indexOf('Selezionare email') === -1){
		        var paramsEmail ={
		 		            'email' : email,  
	            };
		        _.extend(params, paramsEmail);
		        
	        } else {
	        	var paramsEmail ={
	 		            'email' : "",  
	        	};
	        _.extend(params, paramsEmail);
	        emailValid = false; 
	        }
	        var cellValid = true; 
	        if(cell.indexOf('Selezionare un numero di cellulare') === -1){
		        var paramsCell ={
		        			'phone' :cell, 
	            };
		        _.extend(params, paramsCell);
	        } else {
	        	var paramsCell ={
	        			'phone' : "", 
	        	};
	        _.extend(params, paramsCell);
	        cellValid = false; 
	        }
	 
            
	 
	        if(cellValid && emailValid){
		    wkscommerciale.ajaxRequests.get({
		        url: window.wkscustomerContext + '/service/customers/insertValidationRequestVideoConference' ,
		        params:paramsInsert,
		        onSuccess: _.bind(function(response) {

		        	if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.data[0].status === "OK") {
			        	//WKSC-VAIN
				    	var loggingParam = {};
			            loggingParam.MAIL = params["email"];
			            loggingParam.CELLULARE = params["phone"];
			            loggingParam.idsoggetto = wkscommerciale.idSoggetto.get();
			            var log = new wkscommerciale.log.wkscLogger("video_conference_card.html","WKSC-VAIN",
			                wkscommerciale.utils.obsKeysValueWithSeparatorToString(loggingParam, "##"));
			            wkscommerciale.log.doPushLog({logger: log});
			            wkscommerciale.log.doPopLog({logger: log});
			            
		        		wkscommerciale.ajaxRequests.get({
		    		        url: window.wkscustomerContext + '/service/customers/getListValidationsVideoConference' ,
		    		        params:params,
		    		        onSuccess: _.bind(function(response) {
		    		        	if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.data[0].status === "OK") {
		    		        		//WKSC-VALI
		    		        		var loggingParam = {};
		    		        		loggingParam.MAIL = params["email"];
		    		        		loggingParam.CELLULARE = params["phone"];
		    		        		loggingParam.DATA_INVIO = formattedDate+'-'+endFormattedDate; //data ot this
		    		        		loggingParam.idsoggetto = wkscommerciale.idSoggetto.get();
		    		        		var log = new wkscommerciale.log.wkscLogger("video_conference_card.html","WKSC-VALI",
		    		        				wkscommerciale.utils.obsKeysValueWithSeparatorToString(loggingParam, "##"));
		    		        		wkscommerciale.log.doPushLog({logger: log});
		    		        		wkscommerciale.log.doPopLog({logger: log});
		    		        		if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data)) {

		    		        			$('#videoconferencePage').empty(); 
		    		        			$('#videoconferencePage').append(this._templateTabella(
		    		        					{"data": response.data[0] }
		    		        			)); 
		    		        			this.dropdownLoad();

		    		        			$(window).trigger('scrollbar:resize', 'relative');
		    		        			$('#videoconferencePage').wkscspinner('remove');
		    		        		}
		    		        	}else{
		    		        		this.writeError("Errore durante la richiesta"); 
		    		        		wkscommerciale.notifyError.pushError(response.message);
		    		        		$('#videoconferencePage').wkscspinner('remove');
		    		        	}
		    		        }, this),
		    		        onError: _.bind(function(evt) {
		    		        	wkscommerciale.notifyError.pushFromFetchError(evt, []);		    		            
		    		        	$('#videoconferencePage').wkscspinner('remove');
		    		        }, this)
		        		});	
		        	}else{
		        		this.writeError("Errore durante la richiesta"); 
		        		wkscommerciale.notifyError.pushError(response.message);
		        		$('#videoconferencePage').wkscspinner('remove');
		        	}
		        }, this),
		        onError: _.bind(function(evt) {
		            wkscommerciale.notifyError.pushFromFetchError(evt, []);
		        	$('#videoconferencePage').wkscspinner('remove');
		        }, this)
		    });	
	        }else{
	        	$('#videoconferencePage').wkscspinner('remove');
		    	if(!this.validationPhoneWithoutMessage(cell) && !this.validationEmailWithoutMessage(email)){
		    		$('#videoconferencePage').empty(); 
		    		$('#statusVC').addClass("red");
	                $('#statusVC').html("Dati non validi");
		    	}
		    	else if(!this.validationPhoneWithoutMessage(cell)){
		    		$('#videoconferencePage').empty(); 
		    		$('#statusVC').addClass("red");
	                $('#statusVC').html("Numero di cellulare non valido");
		    	} 
		    	else if(!this.validationEmailWithoutMessage(email)){
		    		$('#videoconferencePage').empty(); 
		    		$('#statusVC').addClass("red");
	                $('#statusVC').html("Email non valida");
		    	}
	        }	
		   
	   },
	   render : function() {		
		   $(this.el).wkscspinner({css: 'large', position: true}); //loading header and client data if they exist
		   if(!wkscommerciale.idSoggetto.get() == ""){
		    wkscommerciale.ajaxRequests.post({
		        url: window.wkscustomerContext + '/service/customers/personalInfo?soggettoId='+wkscommerciale.idSoggetto.get(),
		        dataType: 'json',
		        onSuccess: _.bind(function(response) {
		        	if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data)) {
				    	$(this.el).append(this._templateClient(
						   {"customerInfo": response.data[0].dettagliSoggetto[0] }
				    	));
                        $(window).trigger('cardmaster:loaded',this.$el); // Used for datepicker
                        $(window).trigger("scrollbar:resize", $(".active"));
				    	this.dropdownLoad();
				    	$(this.el).wkscspinner('remove');
				    }
		        }, this),
		        onError: _.bind(function(evt) {
		        	 $(this.el).wkscspinner('remove');
		        }, this)
		    });
		   } else {
			  	$(this.el).append(this._template( ));
               $(window).trigger('cardmaster:loaded',this.$el);// Used for datepicker
               $(window).trigger("scrollbar:resize", $(".active"));
			  	this.dropdownLoad();
			  	$(this.el).wkscspinner('remove');
		   }
		    

            
	   }

});
//== HOMEPAGE ATTIVITA Filter ======================================================|
wkscustomer.views.FilterDDL = Backbone.View.extend({
    initialize: function(options) {
    	this.options = options;
        this.template = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/dropdownCruscotto'));
        this.collection.on('reset', this.render, this);
        this.hasTutti = options.hasTutti;
        this.logger = options.logger;
        this.name = options.name;
        this.needTuttiForSuccursale = _.has(options, 'needTuttiForSuccursale') ? options.needTuttiForSuccursale : false;
        this.isNewHPE = options.isNewHPE;
        this.collection.fetch(wkscommerciale.utils.fetchCallback(''));
    },
    updateLogWithFilters: function () {
    	var actiLog = this.logger;
    	if (actiLog != null) {
    		var currentFilter = '';

    		// Succursale Filter: begin
    		if (this.name === 'succursaleDDL') {
            	currentFilter = ''; // no default
            	if (
            		$('#homepage_succursale_filter') &&
            		$('#homepage_succursale_filter').children('.select') &&
            		$('#homepage_succursale_filter').children('.select').children('.label') &&
            		$('#homepage_succursale_filter').children('.select').children('.label').attr('data-val')
            	   ) {
            		currentFilter = $('#homepage_succursale_filter').children('.select').children('.label').attr('data-val');
            		 $('#homepage_succursale_filter').find('a[data-val="' + currentFilter + '"]').addClass('selected');
            	}
            	actiLog.addOrReplaceLogParams('##idsuccursale=' + currentFilter);
    		}
    		// Succursale Filter: end
    	}
    },
    render: function() {
    	$('#successioni_succursali_dropdown').hide();	
        var details = this.collection.toJSON()[0];
        var idAttr = $(this.el).attr('id');
        var tempHTML = '';
        if (details.status === 'success') {
            if (details.data.length > 0) {
                if (this.hasTutti) {
                    details.data[0].menus[0].menuItems.splice(0, 0, {'value': '', 'desc': 'Tutti', 'subMenuId': ''});
                }                     
                tempHTML = this.template(details.data[0]);
            }
            $(this.el).children('.select').remove(); 
            $(this.el).append(tempHTML);    
            this.loaded(); 
            $(window).trigger('cardmaster:loaded', $(this.el));

            var changeMenus = {};
            this.$('ul').on('click', 'a[customize=true]', function(){
                changeMenus[idAttr];
            });
        }
        this.updateLogWithFilters();
        wkscommerciale.log.doPopLog(this.options);
        return this;
    },
    loaded: function(){//after succursali combo load, hide spinner and load table 
		$('#successioni_succursali_dropdown .select').addClass("auto-fill-new-select");
		$('#succursaliSpinner').hide();
		$('#successioni_succursali_dropdown').show();
		
		//load table
		wkscustomer.views.Cruscotto.prototype.loadTable(wkscustomer.views.Cruscotto.prototype.getParamsCall());
    }
    
});
//SUCCESSIONI CRUSCOTTO 
wkscustomer.views.Cruscotto = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
        this.logger = options.logger;
        this._template = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/Successioni_Page'));
        this.subjectId = wkscommerciale.idSoggetto.get();
        
    },
    paginate : { //varibale for pagination
        	currentlimit: 10,
        	viewReference: this, //reference to view, may be useful
        	currentPage: 1,
    		totalPages: 1, 
        	totalRecords: 0,
    		startArray: 0,
    		endArray: 0
    },
    events: {
        "click #inserisci_nuova_posizione": "openInsertSuccessioni",
        "click #goToAggiorna": "openUpdateSuccessioni",
        "click #SC_cercaButton": "cercaEvent",
        "click #results10": "changeResultpage10",
        "click #results20": "changeResultpage20",
        "click #results30": "changeResultpage30",
        "click .prev" : 'prev',
        "click .next" : 'next',
        "click .first" : 'first',
        "click .last" : 'last', 
        "click .goTo" : 'goTo',
        "click #goToDettagli" : 'goToDettagli'	
    },
    //6608
    goToDettagli: function(e) {//Open dettagli card
    	e.stopPropagation();
        e.preventDefault();
        var cTarget = $(e.currentTarget);
        var ottoCifre = cTarget.attr('data-ottoCifre');
        var intestazione = cTarget.attr('data-intestazione');
        var dateDecesso = cTarget.attr('data-dateDecesso');
        var successioniId = cTarget.attr('data-successioniId');
        var idSoggetto = cTarget.attr('data-idSoggetto');
        var dateCreation = cTarget.attr('data-dateCreation');
        
        wkscommerciale.successioniCustomer.dateCreation = dateCreation.substring(0, 10);
        wkscommerciale.successioniCustomer.ottoCifre = ottoCifre;
        wkscommerciale.successioniCustomer.nome = intestazione;
        wkscommerciale.successioniCustomer.dateDecesso = dateDecesso;
        wkscommerciale.successioniCustomer.successioniId = successioniId;
        wkscommerciale.successioniCustomer.idSoggetto = idSoggetto;


        // To load all valid documents while loading the page
        wkscommerciale.successioniCustomer.documentiObbligatoriFlag = "false";
      /*  var ContiBloccatiVSU = new wkscustomer.views.SuccessioniDettagli({
            el: $('#dettagli_section_card'),
            dateDecesso: dateDecesso,
            ottoCifre: ottoCifre,
            intestazione:intestazione
        });*/
        var params = {
                'ottoCifre': wkscommerciale.successioniCustomer.ottoCifre
            };
        
        $.ajax({
            url: 'service/successioni/getDotsOttoCifre',
            type:"post",
            data: JSON.stringify(params),
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            success: _.bind(function(response) {
                $('#dettagliSpanId').text(intestazione);
            	 if(response.data.length == 0){//if response empty just show empty table
           			wkscommerciale.successioniCustomer.dots = "0000000000"; //leave white if call fails
           		 }else{
           			wkscommerciale.successioniCustomer.dots = response.data[0];
           		 }
                 
                 customCardLoader({
                     loadType: 'slidein',
                     cardSize: 'size_enormous',
                     cardName: window.wkscustomerContext+'/assets/cards/16.1.2.Dettagli.html'
                 });
            }, this),
            error: _.bind(function(evt) {
           	 wkscommerciale.notifyError.pushFromFetchError(evt, []);
           	 
             customCardLoader({
                 loadType: 'slidein',
                 cardSize: 'size_enormous',
                 cardName: window.wkscustomerContext+'/assets/cards/16.1.2.Dettagli.html'
             });
            }, this)
   	 });

        $('#dettagliSpanId').text(intestazione);
    },
    goTo: function(e) {//changes to number of page
    	this.paginate.currentPage = parseInt(e.target.text)
    	this.loadTable(this.getParamsCall());
    },
    prev: function() {//navigation function
        if(this.paginate.currentPage !== 1) {
        	this.paginate.currentPage--;
        	this.loadTable(this.getParamsCall()); 
        }
    },
    next: function() {
        if(this.paginate.currentPage !== this.paginate.totalPages) {
        	this.paginate.currentPage++
        	this.loadTable(this.getParamsCall()); 
        }
    },
    first: function() {
    	if(this.paginate.currentPage !== 1) {
    		this.paginate.currentPage = 1;
    		this.loadTable(this.getParamsCall()); 
        }
    },
    last: function() {
    	if(this.paginate.currentPage !== this.paginate.totalPages) {
    		this.paginate.currentPage = this.paginate.totalPages;
    		this.loadTable(this.getParamsCall()); 
        }
    },
    changeResultpage10: function(){//changes the current limit for lines
    	$("#resultLimits .active").removeClass("active");
    	$("#results10").addClass("active");
    	this.reloadPaginate();
    	this.paginate.currentlimit = 10; 
    	this.loadTable(this.getParamsCall()); 
    },
    changeResultpage20: function(){
    	$("#resultLimits .active").removeClass("active");
    	$("#results20").addClass("active");
    	this.reloadPaginate();
    	this.paginate.currentlimit = 20; 
    	this.loadTable(this.getParamsCall()); 
    },
    changeResultpage30: function(){
    	$("#resultLimits .active").removeClass("active");
    	$("#results30").addClass("active");
    	this.reloadPaginate();
    	this.paginate.currentlimit = 30; 
    	this.loadTable(this.getParamsCall()); 
    },
    openInsertSuccessioni: function(e) {
        e.stopPropagation();
        e.preventDefault();
        customCardLoader({
            loadType: 'slidein',
            cardSize: 'size_small',
            cardName: window.wkscustomerContext+'/assets/cards/16.1.1.Inserisci_nuova_posizione.html'
        });
    },
    openUpdateSuccessioni: function(e) {
    	e.stopPropagation();
        e.preventDefault();
        var cTarget = $(e.currentTarget);
        var ottoCifre = cTarget.attr('data-ottoCifre');
        var intestazione = cTarget.attr('data-intestazione');
        var dateDecesso = cTarget.attr('data-dateDecesso');
        wkscommerciale.successioniCustomer.ottoCifre = ottoCifre;
        wkscommerciale.successioniCustomer.nome = intestazione;
        wkscommerciale.successioniCustomer.dateDecesso = dateDecesso;
        customCardLoader({
            loadType: 'slidein',
            cardSize: 'size_small',
            cardName: window.wkscustomerContext+'/assets/cards/16.1.3.update.html'
        });
    },
    dropdownLoad : function() {//initializes dropdown
    	$(".dropdownSC").each(function(i, el) {
            $(el).off('click').on("click", function(evt) {
                evt.preventDefault;
                $(".dropdown-open").not(evt.currentTarget).removeClass("dropdown-open");
                $(evt.currentTarget).toggleClass("dropdown-open");
            });
            $(el).off("mousewheel").on("mousewheel", function(evt) {
                evt.stopImmediatePropagation();
            });
            $(".js-dropdown-menu > *", el).not(".dropdown-header").each(function(j, item) {
                $(item).off("click").on("click", function() {
                    $(".js-dropdown-menu > *", el).removeClass("active");
                    $(".js-dropdown-label", el).html($(item).html());
                    $(item).addClass("active");
                });

            })
        });
    },
    pages: function(){ //start to inclued pages -2 of the current, if they're less equal 0, don't add them. Otherwise add them until you count 5 or you reach end of pages 
    	var i = this.paginate.currentPage-2;
    	var counter = 5;
    	tempHTML = ""
    	while(counter != 0){
    		if(i <= 0){
    			i++
    		}else{
    			if(i > this.paginate.totalPages){
    				$('#pages').html(tempHTML);
    				return
    			}
    			tempHTML += '<a href="javascript:void(0)" class="' + ((this.paginate.currentPage == i) ? 'active' : 'goTo') + '">' + i + '</a>';
    			i++;
    			counter--;
    		}
    	} 
    	$('#pages').html(tempHTML);
    },
    loadTable: function(params){
    	//Templates
    	this._templateTable = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/Successioni_PageTable'));
    	this._templatePagination = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/Successioni_Pagination'));
    	
    	//spinner
    	$("#cruscotto_table_spinner").wkscspinner({css: 'large', position: true}); 	
    	$("#cruscotto_table").hide();
    	$("#cruscotto_pagination").hide();
    	
    	 $.ajax({
             url: 'service/successioni/getCruscottoData',
             type:"post",
             data: JSON.stringify(params),
             dataType : "json",
             contentType: "application/json; charset=utf-8",
             crossDomain: true,
             success: _.bind(function(response) {
            	 if(response.data){//if response empty just show empty table
            		 if(response.data[0].length == 0){
            			 $("#cruscotto_table_spinner").wkscspinner('remove');
                		 $("#cruscotto_table").html(this._templateTable(response));
                		 $("#cruscotto_table").show();
            		 }else{
            			 //count lines and pages
            			 this.paginate.totalRecords = response.data[0].length;
            			 this.paginate.totalPages = Math.ceil(this.paginate.totalRecords / this.paginate.currentlimit);
            			 //always 1 page at least
            			 if(this.paginate.totalPages == 0){
            				 this.paginate.totalPages = 1; 
            			 }//if page is only 1 print just that
            			 if(this.paginate.totalPages == 1){
            				 response.data = response.data.slice(0, this.paginate.totalRecords);
            				 this.paginate.startArray = 1;
            				 this.paginate.endArray = this.paginate.totalRecords;            			
            			 }else{//if you reach the end of the pages
            				 if(this.paginate.currentPage == this.paginate.totalPages){
            					 response.data[0] = response.data[0].slice(((this.paginate.currentPage)*this.paginate.currentlimit)-this.paginate.currentlimit);
            					 this.paginate.startArray = ((this.paginate.currentPage)*this.paginate.currentlimit)-this.paginate.currentlimit;
            					 this.paginate.endArray = this.paginate.totalRecords; 
            				 }else if(this.paginate.currentPage == 1){//1st page
            					 response.data[0] = response.data[0].slice(0, this.paginate.currentlimit);
            					 this.paginate.startArray = 1;
            					 this.paginate.endArray = this.paginate.currentlimit; 			 
            				 }else{//all the pages not start or end
            					 response.data[0] = response.data[0].slice(((this.paginate.currentPage)*this.paginate.currentlimit)-this.paginate.currentlimit, ((this.paginate.currentPage+1)*this.paginate.currentlimit)-this.paginate.currentlimit);
            					 this.paginate.startArray = ((this.paginate.currentPage)*this.paginate.currentlimit)-this.paginate.currentlimit+1;
            					 this.paginate.endArray = ((this.paginate.currentPage+1)*this.paginate.currentlimit)-this.paginate.currentlimit; 	
            				 }           			
            			 }
            		 }
            		 $("#cruscotto_table_spinner").wkscspinner('remove');
            		 $("#cruscotto_table").html(this._templateTable(response));
            		 $("#cruscotto_table").show();
            		 $("#cruscotto_pagination").html(this._templatePagination(this.paginate));
            		 //handle all limits for pages
            		 if(this.paginate.currentlimit == 10){
            			 $("#resultLimits .active").removeClass("active");
            		     $("#results10").addClass("active");
            		 }else if(this.paginate.currentlimit == 20){
            			 $("#resultLimits .active").removeClass("active");
            		     $("#results20").addClass("active");
            		 }else if(this.paginate.currentlimit == 30){
            			 $("#resultLimits .active").removeClass("active");
            		     $("#results30").addClass("active");
            		 }
            		 //activate scrollbar
            		 $(window).trigger('scrollbar:resize', 'relative');
            		 //insert numbered pages
            		 this.pages();
            		 
            		 $("#cruscotto_pagination").show();
            	 }else{
            		 wkscommerciale.notifyError.pushFromFetchError("Dati non ricevuti", []);
            		 $("#cruscotto_table_spinner").wkscspinner('remove');
            	 }
             }, this),
             error: _.bind(function(evt) {
            	 wkscommerciale.notifyError.pushFromFetchError(evt, []);
            	 $("#cruscotto_table_spinner").wkscspinner('remove');
             }, this)
    	 });
    	
    	$("#cruscotto_table").wkscspinner('remove');
    },
    getParamsCall: function(){//prepare params for table
        var succVal;
        if($('.combo_crop_text')[0] === undefined ){
            succVal = $('.combo_actual_text')[0].getAttribute('data-val');
        }else {
            succVal = $('.combo_crop_text')[0].getAttribute('data-val');
        }

        var params = {
    			ottoCifre: $('#SC_ottocrifre').val(),
    		    succursale: succVal,
    		    codeOperator: $('#SC_operatore').val(),
    		    state: $('#Esito-field ul').find('.active')[0].getAttribute('value')
    			
    	};
    return params; 
    },
    reloadPaginate : function(){//reset the variable with pages
    	this.paginate = {currentlimit: 10,
    	    	viewReference: this, 
    	    	currentPage: 1,
    			totalPages: 1, 
    	    	totalRecords: 0,
    			startArray: 0,
    			endArray: 0
    	    	}
    },
    cercaEvent: function(){
    	this.reloadPaginate();
    	this.loadTable(this.getParamsCall()); 
    },
    render: function () {
    	
    	this.$el.html(this._template());
    	this.dropdownLoad();
    	$("#cruscotto_table").hide();
    	//spinner filter
        if(!($('#succursaliSpinner').length >0)){ // to avoid duplicate spinner when reloading from child cards
            this.spinner = $('<div class="spinner absolute" id="succursaliSpinner" style=""><div class="bar1 large"></div><div class="bar2 large"></div><div class="bar3 large"></div><div class="bar4 large"></div><div class="bar5 large"></div><div class="bar6 large"></div><div class="bar7 large"></div><div class="bar8 large"></div><div class="bar9 large"></div><div class="bar10 large"></div><div class="bar11 large"></div><div class="bar12 large"></div></div>');
            $('#successioni_succursali').append(this.spinner);
        }

    	wkscommon.collections.succursaleDDL = new wkscommon.collections.SuccursaleDDL();
    	// To create an instance for SUCCURSALE filter
    	wkscustomer.views.succursaleDDL = new wkscustomer.views.FilterDDL({
    		el: '#successioni_succursali_dropdown',
    		collection: wkscommon.collections.succursaleDDL,
    		hasTutti: false,
    		logger: this.logger,
    		name: 'succursaleDDL',
    		needTuttiForSuccursale: false,
    		isNewHPE:true
    		});
    		
    		$(window).trigger('cardmaster:loaded',this.$el)
    	
    }
});

//6610
wkscustomer.views.CruscottoInsert = Backbone.View.extend({
    initialize: function(options) {
        this.logger = options.logger;
        this.model = new wkscustomer.models.SuccessioniNuovoInsertio();
        this._templateInsertio = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/insert_successioni'));
    },
    events: {
        "click #insertioConferma": "validateAndInsert",
        "change #dateDecesso": "resetErrorMsg",
        "change #cifreDeCuius": "validateCifreDeCuiusAndGetNome"
    },
    validateCifreDeCuiusAndGetNome: function(e) {
        this.resetErrorMsg();
        $("#nomeCognome").html("");
        e.stopPropagation();
        e.preventDefault();
        var ottoCifre = $("#cifreDeCuius").val();
        if (!this.validateOttoCifre(ottoCifre)) {
            return false;
        }

        var params = {
            'ottoCifre' : ottoCifre
        };
        $("#insert_successioni_spinner").wkscspinner({css: 'large', position: true});
        var soggettoId = "";
        wkscommerciale.ajaxRequests.get({
                url: 'service/successioni/getCustomerDetails',
                params:params,
                onSuccess: _.bind(function(response) {
                if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
                    let nome = response.data[0].nome;
                    let tipoSoggetto = response.data[0].tipoSoggetto;
                    soggettoId = response.data[0].soggettoId;
                    let insertionAllowed = response.data[0].insertioAllowed;
                    if(soggettoId ==null) {
                        this.addErrorMsg("8 cifre inesistenti");
                        $("#insert_successioni_spinner").wkscspinner('remove');
                        return false;
                    }
                    if (insertionAllowed === false) {
                        this.addErrorMsg("Deve essere inserito l'ottocifre del cliente deceduto");
                        $("#insert_successioni_spinner").wkscspinner('remove');
                        return false;
                    }
                    $("#nomeCognome").html(nome);
                    // TODO, recheck this part
                    this.model.defaults.params.intestazione = nome;
                    this.model.defaults.params.idSubject = soggettoId;
                    this.model.defaults.params.ottoCifre = ottoCifre;
                }else{
                    wkscommerciale.notifyError.pushError(response.message);
                }
                $("#insert_successioni_spinner").wkscspinner('remove');
            }, this),
            onError:  _.bind(function(evt) {
                wkscommerciale.notifyError.pushFromFetchError(evt, []);
                $("#insert_successioni_spinner").wkscspinner('remove');
            }, this)
        });
    },
    validateOttoCifre: function(oCifre) {
        if (oCifre == null || oCifre.length != 8) {
            this.addErrorMsg("Inserire un 8 Cifre valido");
            return false;
        }

        let containsAllDigits = /\d/.test(oCifre);
        if (!containsAllDigits) {
            this.addErrorMsg("Inserire un 8 Cifre valido");
            return false;
        }
        return true;
    },
    validateDecuiusDate: function(decuiusDate) {
        if (decuiusDate == null) {
            this.addErrorMsg("Decesso Date is not valid");
            return false;
        }
        return true;
    },
    validateAndInsert: function(e) {
        this.resetErrorMsg();
        e.stopPropagation();
        e.preventDefault();
        var ottoCifre = $("#cifreDeCuius").val();
        var dateDecesso = $("#dateDecesso").val();
        if (!this.validateOttoCifre(ottoCifre) || !this.validateDecuiusDate(dateDecesso)) {
            return false;
        }else {
            this.insertSuccessioniDetails(dateDecesso, ottoCifre);
        }
    },
    // 6610, Rest call for 3 api and insert
    insertSuccessioniDetails: function(dateDecesso, ottoCifre) {
        var params = {
            'dateDecesso' : dateDecesso,
            'ottoCifre' : ottoCifre,
            'flagUpdate' : false
        };
        $("#insert_successioni_spinner").wkscspinner({css: 'large', position: true});
        //call Anagrafe, Account and Card Apis
        wkscommerciale.ajaxRequests.post({
            url: 'service/successioni/insertSuccessioniDetails',
            params:params,
            onSuccess: _.bind(function(response) {
                        if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
                            this.closeCurrentCard();
                            CardMaster.remove();
                            // closing insert card and reloading dash board
                            var cruscotto =  new wkscustomer.views.Cruscotto(this.logger );
                            cruscotto.render();
                        }else if(_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.status == "error"){
                            $("#statusInsertioNuovo").addClass('red');
                            $("#statusInsertioNuovo").html(response.data[0]);
                        }else{
                            wkscommerciale.notifyError.pushError(response.message);
                            $("#statusInsertioNuovo").addClass('red');
                            $("#statusInsertioNuovo").html('Deve essere inserito l\'ottocifre del cliente deceduto');
                        }
                        $("#insert_successioni_spinner").wkscspinner('remove');

                    }, this),
                    onError: _.bind(function(exe) {
                        wkscommerciale.notifyError.pushFromFetchError(exe, []);
                        $("#insert_successioni_spinner").wkscspinner('remove');
                    }, this)
                });

        return true;
    },
    resetErrorMsg: function(e) {
        $("#statusInsertioNuovo").html("");
    },
    addErrorMsg: function(msg) {
        $("#statusInsertioNuovo").addClass("red");
        $("#statusInsertioNuovo").html(msg);
    },
    render: function() {
        this.$el.html(this._templateInsertio());
        $(window).trigger('cardmaster:loaded',this.$el);
    },
    closeCurrentCard : function()
    { // Completely swipes the element from the DOM
        this.undelegateEvents();
        this.$el.removeData().off();
        this.remove();
        Backbone.View.prototype.remove.call(this);
    }
});
//6610

//6698
wkscustomer.views.CruscottoUpdate = Backbone.View.extend({
    initialize: function(options) {
        this.logger = options.logger;
        this.model = new wkscustomer.models.SuccessioniNuovoInsertio();
        this._templateInsertio = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/update_successioni'));
    },
    events: {
        "click #insertioConferma": "validateAndInsert",
        "change #dateDecesso": "resetErrorMsg",
    },
    validateDecuiusDate: function(decuiusDate) {
        if (decuiusDate == "") {
            this.addErrorMsg("Data di decesso non valida");
            return false;
        }
        return true;
    },
    validateAndInsert: function(e) {
        this.resetErrorMsg();
        e.stopPropagation();
        e.preventDefault();
        var ottoCifre = $("#cifreDeCuius").val();
        var dateDecesso = $("#dateDecesso").val();
        if (!this.validateDecuiusDate(dateDecesso)) {
            return false;
        }else {
            this.insertSuccessioniDetails(dateDecesso, ottoCifre);
        }
    },
    //Rest call for 3 api and update
    insertSuccessioniDetails: function(dateDecesso, ottoCifre) {
        var params = {
            'dateDecesso' : dateDecesso,
            'ottoCifre' : ottoCifre,
            'flagUpdate' : true
        };
        $("#insert_successioni_spinner").wkscspinner({css: 'large', position: true});
        //call Anagrafe, Account and Card Apis
        wkscommerciale.ajaxRequests.post({
            url: 'service/successioni/insertSuccessioniDetails',
            params:params,
            onSuccess: _.bind(function(response) {
                        if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
                            this.closeCurrentCard();
                            CardMaster.remove();
                            // closing insert card and reloading dash board
                            var cruscotto =  new wkscustomer.views.Cruscotto(this.logger );
                            cruscotto.render();
                        }else if(_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.status == "error"){
                            $("#statusInsertioNuovo").addClass('red');
                            $("#statusInsertioNuovo").html(response.data[0]);
                        }else{
                            wkscommerciale.notifyError.pushError(response.message);
                            $("#statusInsertioNuovo").addClass('red');
                            $("#statusInsertioNuovo").html('Errore aggiornamento');
                        }
                        $("#insert_successioni_spinner").wkscspinner('remove');

                    }, this),
                    onError: _.bind(function(exe) {
                        wkscommerciale.notifyError.pushFromFetchError(exe, []);
                        $("#insert_successioni_spinner").wkscspinner('remove');
                    }, this)
                });

        return true;
    },
    resetErrorMsg: function(e) {
        $("#statusInsertioNuovo").html("");
    },
    addErrorMsg: function(msg) {
        $("#statusInsertioNuovo").addClass("red");
        $("#statusInsertioNuovo").html(msg);
    },
    render: function() {
        this.$el.html(this._templateInsertio({"ottocifre": wkscommerciale.successioniCustomer.ottoCifre, "name": wkscommerciale.successioniCustomer.nome}));
        
        $(window).trigger('cardmaster:loaded',this.$el);
    },
    closeCurrentCard : function()
    { // Completely swipes the element from the DOM
        this.undelegateEvents();
        this.$el.removeData().off();
        this.remove();
        Backbone.View.prototype.remove.call(this);
    }
});

//6608,
wkscustomer.views.carteBloccate = Backbone.View.extend({
    initialize: function(options) {
        this._templateCarte_Bloccate = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Carte_Bloccate'));
    },
    render: function() {
        var templateCarte_Bloccate = this._templateCarte_Bloccate;
        var templateCarte_BloccateHTML = templateCarte_Bloccate({
            "carteInfoForSuccessioniCollection": [],
            "nome":"",
            "colorCode": wkscommerciale.successioniCustomer.dots.charAt(1)
        });
        $('#Carte_Bloccate').html(templateCarte_BloccateHTML);
        $(window).trigger('cardmaster:loaded', $("#Carte_Bloccate"));
    },
   events: {
       'click #carteBloccoContentHead.flagOpen':'getCardsDetailsByIdsoggetto'
    },
    getCardsDetailsByIdsoggetto: function(){
        if(wkscommerciale.successioniCustomer.carteInfoForSuccessioniCollectionFlag != 'true') {
            $("#contiBloccati_Spinner").wkscspinner({css: 'large', position: true});
            var params = {
                'ottoCifre': wkscommerciale.successioniCustomer.ottoCifre
            };
            wkscommerciale.ajaxRequests.get({
                url: 'service/successioni/getCardsDetailsByIdsoggetto',
                params: params,
                onSuccess: _.bind(function (response) {
                    if (_.has(response, 'data') && !wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
                        wkscommerciale.successioniCustomer.carteInfoForSuccessioniCollectionFlag = "true";
                        var templateCarte_Bloccate = this._templateCarte_Bloccate;
                        var templateCarte_BloccateHTML = templateCarte_Bloccate({
                            "carteInfoForSuccessioniCollection": response.data[0].carteInfoForSuccessioniCollection,
                            "nome": this.nome,
                            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(1)
                        });
                        $('#Carte_Bloccate').html(templateCarte_BloccateHTML);
                        $(window).trigger('cardmaster:loaded', $("#Carte_Bloccate"));
                        window.setTimeout(function(){
                            $('[data-scrollbar-loaded]').tinyscrollbar_update('relative');
                        }, 500);
                    } else {
                        wkscommerciale.notifyError.pushError(response.message);
                    }
                    $('#carteBloccoContent').slideToggle();
                    $('#carteBloccoContentHead').addClass("open");
                    $('#carteBloccoContentHead').removeClass("flagOpen");
                    $("#contiBloccati_Spinner").wkscspinner('remove');
                }, this),
                onError: _.bind(function (exe) {
                    wkscommerciale.notifyError.pushFromFetchError(exe, []);
                    $("#contiBloccati_Spinner").wkscspinner('remove');
                }, this)
            });
        }
    }
});

//6652
wkscustomer.views.rendicontoServiziCollegati = Backbone.View.extend({
    initialize: function(options) {
        this._templateRendiconto_Servizi_Collegati = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Rendiconto_Servizi_Collegati'));
    },
    render: function() {

        var templateRendiconto_Servizi_Collegati = this._templateRendiconto_Servizi_Collegati;
        var templateRendiconto_Servizi_CollegatiHTML = templateRendiconto_Servizi_Collegati({
            "data": [],
            'colorCode' : wkscommerciale.successioniCustomer.dots.charAt(3)
        });

        $('#Rendiconto_Servizi_Collegati').html(templateRendiconto_Servizi_CollegatiHTML);
        $(window).trigger('cardmaster:loaded',  $("#Rendiconto_Servizi_Collegati"));
        $(window).trigger('scrollbar:resize', 'relative');
    },
   events: {
        'click #rendicontoServiziCollegatiHead.flagOpen':'getRendicontiServiziDetail'
    },
    getRendicontiServiziDetail: function(e){

        if( wkscommerciale.successioniCustomer.rendicontiServiziFlag != "true") {
            $("#rendicontiServizi_Spinner").wkscspinner({css: 'large', position: true});
            var params = {
                'ottoCifre': wkscommerciale.successioniCustomer.ottoCifre
            };
            wkscommerciale.ajaxRequests.get({
                url: 'service/successioni/getRendicontiServiziDetail',
                params: params,
                onSuccess: _.bind(function (response) {
                    if (_.has(response, 'data') && !wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
                        wkscommerciale.successioniCustomer.rendicontiServiziFlag = "true";
                        var templateRendiconto_Servizi_Collegati = this._templateRendiconto_Servizi_Collegati;
                        var templateRendiconto_Servizi_CollegatiHTML = templateRendiconto_Servizi_Collegati({
                            "data": response.data[0],
                            'colorCode' : wkscommerciale.successioniCustomer.dots.charAt(3)
                        });
                        $('#Rendiconto_Servizi_Collegati').html(templateRendiconto_Servizi_CollegatiHTML);
                        $(window).trigger('cardmaster:loaded', $("#Rendiconto_Servizi_Collegati"));
                        window.setTimeout(function(){ //Todo
                            $('[data-scrollbar-loaded]').tinyscrollbar_update('relative');
                        }, 500);
                    } else {
                        wkscommerciale.notifyError.pushError(response.message);
                    }
                    $('#rendicontoServiziCollegati').slideToggle();
                    $('#rendicontoServiziCollegatiHead').addClass("open");
                    $('#rendicontoServiziCollegatiHead').removeClass("flagOpen");
                    $("#rendicontiServizi_Spinner").wkscspinner('remove');
                }, this),
                onError: _.bind(function (exe) {
                    wkscommerciale.notifyError.pushFromFetchError(exe, []);
                    $("#rendicontiServizi_Spinner").wkscspinner('remove');
                }, this)
            });
        }
    }
});
//6607
wkscustomer.views.successioniContiChiusi = Backbone.View.extend({
    initialize: function(options) {
        this._templateConti_Bloccati_VSU = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Conti_Bloccati_VSU'));       
    },
    render: function() {

        var templateConti_Bloccati_VSUHTML = this._templateConti_Bloccati_VSU({
            "data": [],
            'colorCode' : wkscommerciale.successioniCustomer.dots.charAt(0)
        });
        $('#Conti_Bloccati_VSU').html(templateConti_Bloccati_VSUHTML);
        $(window).trigger('cardmaster:loaded',  $("#Conti_Bloccati_VSU"));
        $(window).trigger('scrollbar:resize', 'relative');
    },
   events: {
        'click #accountsBloccoContentHead.flagOpen':'getAccountDetails'
    },
    getAccountDetails: function(e){

        if( wkscommerciale.successioniCustomer.AccountsFlag != "true") {
            $("#Conti_Bloccati_spinner").wkscspinner({css: 'large', position: true});
            
            var dateToSend = ""; 
            if(wkscommerciale.successioniCustomer.dateDecesso == ""){dateToSend = wkscommerciale.successioniCustomer.dateCreation; }
            else{dateToSend = wkscommerciale.successioniCustomer.dateDecesso;}
            var params = {
                'ottoCifre': wkscommerciale.successioniCustomer.ottoCifre,
                'dateDecesso': dateToSend
            };
            
            wkscommerciale.ajaxRequests.post({
                url: 'service/successioni/getAccountsDetailsByIdsoggetto',
                params: JSON.stringify(params),
                contentType: "application/json; charset=utf-8",
                onSuccess: _.bind(function (response) {
                    if (_.has(response, 'data') && !wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
                        wkscommerciale.successioniCustomer.AccountsFlag = "true";
                        var templateConti_Bloccati_VSUHTML = this._templateConti_Bloccati_VSU({
                            "data": response.data[0],
                            'colorCode' : wkscommerciale.successioniCustomer.dots.charAt(0)
                        });
                        $('#Conti_Bloccati_VSU').html(templateConti_Bloccati_VSUHTML);
                        $(window).trigger('cardmaster:loaded', $("#Conti_Bloccati_VSU"));
                        window.setTimeout(function(){ 
                            $('[data-scrollbar-loaded]').tinyscrollbar_update('relative');
                        }, 500);
                    } else {
                        wkscommerciale.notifyError.pushError(response.message);
                    }
                    $('#statoBloccoConti1Content').slideToggle();
                    $('#accountsBloccoContentHead').addClass("open");
                    $('#accountsBloccoContentHead').removeClass("flagOpen");
                    $("#Conti_Bloccati_spinner").wkscspinner('remove');
                }, this),
                onError: _.bind(function (exe) {
                    wkscommerciale.notifyError.pushFromFetchError(exe, []);
                    $("#Conti_Bloccati_spinner").wkscspinner('remove');
                }, this)
            });
        }
    }
});

//6745
wkscustomer.views.VerificaContoMono = Backbone.View.extend({
    initialize: function(options) {
        this._templateVerifica_Conto_Sconfino = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Verifica_conto_monointestato_sconfino'));
    },
    render: function() {
    	var isdateEmpty = false; 
        if(wkscommerciale.successioniCustomer.dateDecesso == ""){isdateEmpty = true;}
        var templateVerifica_Conto_SconfinoHTML = this._templateVerifica_Conto_Sconfino({
            "data": "",
            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(2),
            "isdateEmpty" : isdateEmpty
        });
        $('#Verifica_conto_monointestato_sconfino').html(templateVerifica_Conto_SconfinoHTML);
        $(window).trigger('cardmaster:loaded',  $("#Verifica_conto_monointestato_sconfino"));
        $(window).trigger('scrollbar:resize', 'relative');
    },
    events: {
        'click #verificaContoMonointestatoSconfinoHead.flagOpen':'getAccountsDetailsBysoggetto'
    },
    getAccountsDetailsBysoggetto: function(e){
        if (wkscommerciale.successioniCustomer.verificaContoMonointestatoSconfino != "true") {
            $("#verificaContoMono_Spinner").wkscspinner({css: 'large', position: true});
            var isdateEmpty = false; 
            if(wkscommerciale.successioniCustomer.dateDecesso == ""){
            	isdateEmpty = true;
            	var templateVerifica_Conto_SconfinoHTML = this._templateVerifica_Conto_Sconfino({
            		"data": "",
            		"colorCode" : wkscommerciale.successioniCustomer.dots.charAt(2),
            		"isdateEmpty" : isdateEmpty
            	});
            	$("#verificaContoMono_Spinner").wkscspinner('remove');
            }else{
            	//PORTAHC-6764 if there is no date, show a message in template
            	var params = {
            			'ottoCifre': wkscommerciale.successioniCustomer.ottoCifre,
            			'dateDecesso': wkscommerciale.successioniCustomer.dateDecesso,
            			"isdateEmpty" : isdateEmpty
            	};
            	wkscommerciale.ajaxRequests.post({
            		url: 'service/successioni/getAccountsDetailsBysoggetto',
            		params: JSON.stringify(params),
            		contentType: "application/json; charset=utf-8",
            		onSuccess: _.bind(function (response) {
            			if (_.has(response, 'data') && !wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
            				wkscommerciale.successioniCustomer.verificaContoMonointestatoSconfino = "true";

            				var templateVerifica_Conto_SconfinoHTML = this._templateVerifica_Conto_Sconfino({
            					"data": response.data[0],
            					"colorCode" : wkscommerciale.successioniCustomer.dots.charAt(2),
            					"isdateEmpty" : isdateEmpty
            				});
            				$('#Verifica_conto_monointestato_sconfino').html(templateVerifica_Conto_SconfinoHTML);
            				$(window).trigger('cardmaster:loaded', $("#Verifica_conto_monointestato_sconfino"));
            				if (response.data[0] != "") {
            					$('#hasAccountInfo').show();
            					$('#hasNoAccountInfo').hide();
            				} else {
            					$('#hasAccountInfo').hide();
            					$('#hasNoAccountInfo').show();
            				} 
            				window.setTimeout(function(){
            					$('[data-scrollbar-loaded]').tinyscrollbar_update('relative');
            				}, 500);
            			} else {
            				wkscommerciale.notifyError.pushError(response.message);
            			}
            			$('#verificaContoMonointestatoSconfinoContent').slideToggle();
            			$('#verificaContoMonointestatoSconfinoHead').addClass("open");
            			$('#verificaContoMonointestatoSconfinoHead').removeClass("flagOpen");
            			$("#verificaContoMono_Spinner").wkscspinner('remove');
            		}, this),
            		onError: _.bind(function (exe) {
            			wkscommerciale.notifyError.pushFromFetchError(exe, []);
            			$("#verificaContoMono_Spinner").wkscspinner('remove');
            		}, this)
            	});
            }
            
        }
            
    }
});


wkscustomer.views.SuccessioniDettagli = Backbone.View.extend({
    initialize: function(options) {
        this.logger = '';
        //6608, required values for the api call param
        this.ottoCifre = wkscommerciale.successioniCustomer.ottoCifre;
        this.nome = wkscommerciale.successioniCustomer.nome;
        this.dateDecesso = wkscommerciale.successioniCustomer.dateDecesso;
        this.carteInfoForSuccessioniCollectionFlag = wkscommerciale.successioniCustomer.carteInfoForSuccessioniCollectionFlag;

        this._templatedettagli_section_client = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/dettagli_section_client'));
        this._templateDocumenti_Obbligatori_Richiedere = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Documenti_Obbligatori_Richiedere'));
        this._templateModulo_unificato_trasferimento = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Modulo_unificato_trasferimento'));
        this._templateRichiesta_esonero_Successione = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Richiesta_esonero_Successione'));
        this._templateRichiesta_Produzione_Certificazione_Saldi = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Richiesta_Produzione_Certificazione_Saldi'));
        this._templateRichiesta_Produzione_Sussistenza_debito = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Richiesta_Produzione_Sussistenza_debito'));
        this._templateVerifica_conformita_denuncia = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Verifica_conformita_denuncia'));
        //this._templateVerifica_conto_monointestato_sconfino = _.template(wkscommerciale.template.get(window.wkscustomerContext+'/assets/templates/successioni/dettagli/Verifica_conto_monointestato_sconfino')); //6745
    },
    events: {
        'click header[data-collapsed]':'toggleAccordion',
        'click #dettagliAnnulla': 'dettagliAnnulla',
        'click #dettagliChiudiConferma': 'dettagliChiudiConferma'
    },
    toggleAccordion: function(e){
        e.stopPropagation();
        var $this = $(e.currentTarget);
        $($this.next('.content[data-content]').get(0)).toggle($this.hasClass('open'));
        window.setTimeout(function(){
            $('[data-scrollbar-loaded]').tinyscrollbar_update('relative');
        }, 500);
    },
    render: function() {
        this.$el.hide();

        $('#dettagli_section_client').html(this._templatedettagli_section_client);

        var dettagli_sectionHTML = this._templatedettagli_section_client({
            "name" : wkscommerciale.successioniCustomer.intestazione
        });
        $('#dettagli_section').html(dettagli_sectionHTML);

        /*var documenti_Obbligatori_RichiedereHTML = this._templateDocumenti_Obbligatori_Richiedere({
            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(4)
        });
        $('#Documenti_Obbligatori_Richiedere').html(documenti_Obbligatori_RichiedereHTML);*/
        
        var modulo_unificato_trasferimentoHTML = this._templateModulo_unificato_trasferimento({
            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(9)
        });
        $('#Modulo_unificato_trasferimento ').html(modulo_unificato_trasferimentoHTML);
        
        var richiesta_esonero_SuccessioneHTML = this._templateRichiesta_esonero_Successione({
            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(7)
        });
        $('#Richiesta_esonero_Successione').html(richiesta_esonero_SuccessioneHTML);
        
        var richiesta_Produzione_Certificazione_SaldiHTML = this._templateRichiesta_Produzione_Certificazione_Saldi({
            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(5)
        });
        $('#Richiesta_Produzione_Certificazione_Saldi').html(richiesta_Produzione_Certificazione_SaldiHTML);
        
        var richiesta_Produzione_Sussistenza_debitoHTML = this._templateRichiesta_Produzione_Sussistenza_debito({
            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(6)
        });
        $('#Richiesta_Produzione_Sussistenza_debito').html(richiesta_Produzione_Sussistenza_debitoHTML);
        
        var verifica_conformita_denunciaHTML = this._templateVerifica_conformita_denuncia({
            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(8)
        });
        $('#Verifica_conformita_denuncia').html(verifica_conformita_denunciaHTML);    
        // 6745
        // var verifica_conto_monointestato_sconfinoHTML = this._templateVerifica_conto_monointestato_sconfino({
        //     "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(2)
        // });
        // $('#Verifica_conto_monointestato_sconfino').html(verifica_conto_monointestato_sconfinoHTML);
        
        this.$el.show();
        $(window).trigger('cardmaster:loaded', this.$el);
        $(window).trigger('scrollbar:resize', 'relative');

        wkscommerciale.successioniCustomer.carteInfoForSuccessioniCollectionFlag = "false";
        wkscommerciale.successioniCustomer.rendicontiServiziFlag = "false";
        wkscommerciale.successioniCustomer.AccountsFlag = "false";
        wkscommerciale.successioniCustomer.verificaContoMonointestatoSconfino = "false";
        wkscommerciale.successioniCustomer.documentiObbligatoriFlag = "false";

        wkscommerciale.profiles.checkProfile('SHOW_SUCCESSIONI_ANNULLA_BTN', function(hasGrant) {
            if(hasGrant) {
                $('#dettagliAnnulla').show();
            } else {
                $('#dettagliAnnulla').hide();
            }
        });
    },
    dettagliAnnulla: function(e){
        $("#dettagli_card_spinner").wkscspinner({css: 'large', position: true});
        var params = {
            'ottoCifre': wkscommerciale.successioniCustomer.ottoCifre
        };
        wkscommerciale.ajaxRequests.get({
            url: 'service/successioni/updateAnnulla',
            params: params,
            contentType: "application/json; charset=utf-8",
            onSuccess: _.bind(function (response) {
                if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
                    this.closeDettagliCurrentCard();
                    CardMaster.remove();
                    // closing insert card and reloading dash board
                    var cruscotto =  new wkscustomer.views.Cruscotto(this.logger);
                    cruscotto.render();
                }else {
                    wkscommerciale.notifyError.pushError(response.message);
                    $("#statusDettagliCard").addClass('red');
                    $("#statusDettagliCard").html(response.message);
                }
                $("#dettagli_card_spinner").wkscspinner('remove');
            }, this),
            onError: _.bind(function (exe) {
                $("#dettagli_card_spinner").wkscspinner('remove');
                wkscommerciale.notifyError.pushFromFetchError(exe, []);
            }, this)
        });
    },
    dettagliChiudiConferma: function(e){
        $("#dettagli_card_spinner").wkscspinner({css: 'large', position: true});
        var params = {
            'ottoCifre': wkscommerciale.successioniCustomer.ottoCifre
        };
        wkscommerciale.ajaxRequests.get({
            url: 'service/successioni/updateChiudiData',
            params: params,
            contentType: "application/json; charset=utf-8",
            onSuccess: _.bind(function (response) {
                if (_.has(response, 'data') && ! wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
                    this.closeDettagliCurrentCard();
                    CardMaster.remove();
                    // closing insert card and reloading dash board
                    var cruscotto =  new wkscustomer.views.Cruscotto(this.logger);
                    cruscotto.render();
                }else{
                    wkscommerciale.notifyError.pushError(response.message);
                    $("#statusDettagliCard").addClass('red');
                    $("#statusDettagliCard").html(response.message);
                }
                $("#dettagli_card_spinner").wkscspinner('remove');
            }, this),
            onError: _.bind(function (exe) {
                $("#dettagli_card_spinner").wkscspinner('remove');
                wkscommerciale.notifyError.pushFromFetchError(exe, []);
            }, this)


        });
    },
    closeDettagliCurrentCard : function() { // Completely swipes the element from the DOM
        this.undelegateEvents();
        this.$el.removeData().off();
        this.remove();
        Backbone.View.prototype.remove.call(this);
    }
});

//6739
wkscustomer.views.documentiObbligatoriRichiedere = Backbone.View.extend({
    initialize: function (options) {
        this._templateDocumenti_Obbligatori_Richiedere = _.template(wkscommerciale.template.get(window.wkscustomerContext + '/assets/templates/successioni/dettagli/Documenti_Obbligatori_Richiedere'));
    },

    render: function () {
        var Documenti_Obbligatori_RichiedereHTML = this._templateDocumenti_Obbligatori_Richiedere({
            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(4)
        });
        $('#Documenti_Obbligatori_Richiedere').html(Documenti_Obbligatori_RichiedereHTML);

       /* var Documenti_Obbligatori_RichiedereHTML = this._templateDocumenti_Obbligatori_Richiedere({});
        $('#Documenti_Obbligatori_Richiedere').html(Documenti_Obbligatori_RichiedereHTML);*/
        //this.$el.html(Documenti_Obbligatori_RichiedereHTML);
        $(window).trigger('cardmaster:loaded', this.$el);
        $(window).trigger('scrollbar:resize', 'relative');
    },

    events: {
        'click #documentiObbligatoriHeader.flagOpen':'getDocumentiObbligatoriDetail',
        'click .file_upload': 'fileUpload',
        'change input[type=file]': 'fileChange', // Attatch file
        'click .ok_attach': 'confirmButtonClicked', // Confirm  -- /confermaInsertDocSection
        'click .cancel_attach': 'cancelButtonClicked', // Annulla
        'click .certificato_del_yes': 'confirmDelete', // Eliminare l'allegato? - SI -- -- /annullaUpdateDocSection
        'click .certificato_del_No': 'cancelDelete', // Eliminare l'allegato? - NO
        'click .download_attach': 'clickDownloadButton', // Download document

    },
    getDocumentiObbligatoriDetail: function(e){
        if( wkscommerciale.successioniCustomer.documentiObbligatoriFlag != "true") {
            $("#documentiObbligatoriSpinner").wkscspinner({css: 'large', position: true});
            var params = {
                'idSoggetto': wkscommerciale.successioniCustomer.idSoggetto
            };
            wkscommerciale.ajaxRequests.post({
                url: 'service/successioni/loadAllValidDocuments',
                params: params,
                onSuccess: _.bind(function (response) {
                    if (_.has(response, 'data') && !wkscommerciale.checkIsEmpty(response.data) && response.status == "success") {
                        wkscommerciale.successioniCustomer.documentiObbligatoriFlag = "true";
                        var templateDocumentiObbligatori= this._templateDocumenti_Obbligatori_Richiedere;
                        var templateDocumentiObbligatoriHTML = templateDocumentiObbligatori({
                            "data": response.data[0],
                            "colorCode" : wkscommerciale.successioniCustomer.dots.charAt(4)
                        });
                        var data = response.data[0];
                        this.loadFilesFromDB(templateDocumentiObbligatoriHTML, data);
                        window.setTimeout(function(){
                            $('[data-scrollbar-loaded]').tinyscrollbar_update('relative');
                        }, 500);
                    } else {
                        this.addDocumentiErrorMsg(response.message);
                    }
                    $('#documentiObbligatoriHeader').addClass("open");
                    $('#documentiObbligatoriHeader').removeClass("flagOpen");
                    $("#documentiObbligatoriSpinner").wkscspinner('remove');
                }, this),
                onError: _.bind(function (exe) {
                    wkscommerciale.notifyError.pushFromFetchError(exe, []);
                    $("#documentiObbligatoriSpinner").wkscspinner('remove');
                }, this)
            });
        }
    },
    fileUpload: function(e) {
        e.stopPropagation();
        $(e.currentTarget).parent().next().find('input[type=file]').click();
    },
    downloadFile: function(issId, scId) {
        // Construct the base URL
        var baseUrl = window.location.protocol + '//' + window.location.host;

        // Construct the download URL
        var downloadUrl = baseUrl + '/wkscommerciale/service/successioni/downloadSuccessioniDoc?issId=' + issId + '&scId=' + scId;

        // Create a new anchor element
        var newAnchor = $('<a>')
            .attr('id', 'newLinkId')
            .attr('href', downloadUrl)
            .attr('target', '_blank')
            .text('Download');

        // Append the anchor to the body and trigger a click
        newAnchor.appendTo('body');
        newAnchor[0].click();
    },
    createAttachmentImage: function() {
        return'<a href="" target="_blank" style="top: -13px; display: none;" class="attachment hand_pointer"></a>';
    },
    fileChange: function(e) {
        var fileInput = $(e.target);
        var file = e.target.files[0];
        var fileListId = fileInput.closest('li').find('#file_list1, #file_list2, #file_list3, #file_list4, #file_list5').attr('id');
        // Define the allowed extensions
        var allowedExtensions = ['jpg', 'jpeg','doc','docx','pdf','txt'];
        this.resetDocumentiErrorMsg();
        // Check if the file has an allowed extension
        if (file && this.isValidFile(file.name, allowedExtensions)) {
            // The file has an allowed extension, add it
            if (file) {

                // Check if the maximum number of files has been reached
                if (!this.validateFileCount(fileInput, '#' + fileListId)) {
                    // The maximum number of files has been reached, don't add the file
                    return;
                }

                var createAttachmentImage = this.createAttachmentImage();
                var fileDiv = this.createFileDiv(file, fileInput,createAttachmentImage);
                var fileId = 'fileDiv'+ Date.now(); // Create a unique id for the fileDiv
                fileDiv.attr('id', fileId);  // Set the id of the fileDiv
                fileDiv.data('file', file);  // Store the file object in the fileDiv data
                var cancelButton = this.createCancelButton(fileDiv);  // Define cancelButton before createDeleteButton
                var deleteButton = this.createDeleteButton(fileDiv, cancelButton);  // Pass cancelButton to createDeleteButton
                var confirmButton = this.createConfirmButton(deleteButton, cancelButton);

                fileDiv.append(deleteButton, confirmButton, cancelButton);

                var fileList = fileInput.closest('li').find('#file_list1, #file_list2, #file_list3, #file_list4, #file_list5');
                fileList.append(fileDiv);  // Add the fileDiv to the fileList
            }
        } else {
            // The file does not have an allowed extension, don't add it
            var errMsg = 'Invalid file type. Only ' + allowedExtensions.join(', ') + ' files are allowed.';
            this.addDocumentiErrorMsg(errMsg);
        }
        fileInput.val(null);  // Clear the file input's value
    },
    clearExistingFile: function() {
        $("#file_list1").empty();
        $("#file_list2").empty();
        $("#file_list3").empty();
        $("#file_list4").empty();
        $("#file_list5").empty();
    },
    loadFilesFromDB: function(html, data) {
        //file_list1

        this.clearExistingFile();

        var fileList = ""; // TODO dynamic
        for(var i = 0; i < data.length; i++) {
            var document = data[i];
            var file = {
                documentId: document.documentId,
                name: document.fileName,
                size: 0,
                type: ''
            };
            if (document.documentCategory === "1") {
                fileList = $("#file_list1");
            } else if (document.documentCategory === "2") {
                fileList = $("#file_list2");
            } else if (document.documentCategory === "3") {
                fileList = $("#file_list3");
            } else if (document.documentCategory === "4") {
                fileList = $("#file_list4");
            } else if (document.documentCategory === "5") {
                fileList = $("#file_list5");
            }
            var fileDiv = this.createFileDiv(file, "");
            var deleteButton = this.createDeleteButton(fileDiv, null);
            fileDiv.append(deleteButton);
            fileList.append(fileDiv);
        }
        // Use setTimeout to delay the execution of the show method
        $('.delete-button-class').show();
        $('.download_attach').show();

    },
    createFileDiv: function(file, fileInput) {
        var date = Date.now();
        var issId = "Additional_Content";
        if (file != null && 'documentId' in file) {
            issId = file.documentId;
        }
        return $('<div>').attr('id', 'fileDiv' + date).css({
            'display': 'flex',
            'align-items': 'baseline',
            //'justify-content': 'center',
            'flex-wrap': 'wrap',
            'padding-left': '39%'
        }).data('fileInput', fileInput)
            .append(this.createDownloadButton())
            .append($('<span class="download_attach">').text(file.name))
            .append($('<span>').attr('id', 'issId_'+ date).text(issId).css('display', 'none'));
    },

    createDeleteButton: function(fileDiv, cancelButton) {
        return $('<img>').attr({
            'src': './assets/vendor-app/images/clear_search_r.png',
            'alt': 'Clear',
            'style': 'margin-right: 5px;margin-left: 2%;margin-top: 0px;'
        }).addClass('delete-button-class').click(function(e) {
            e.stopPropagation();
            fileDiv.addClass('file-to-delete');
            var confirmSection = $(this).closest('section').find('.certificato_confirm');
            //confirmSection.show();
            confirmSection.slideDown();
            confirmSection.children().show();
            $(this).hide();
            if (cancelButton != undefined && cancelButton != null) {
                cancelButton.hide();
            }
            $('input[type=file]').prop('disabled', true);
            return false;
        }).hide();
    },

    createConfirmButton: function(deleteButton, cancelButton) {
        return $('<div class="ok_attach"><img src="./assets/vendor-app/images/check.png" alt="Check" style="width: 16px; height: 11px; margin-right: 5px;"> <span class="conferma">Conferma</span></div>').css({
            'margin-right': '10px',
            'margin-left': '10px'
        });
    },
    confirmButtonClicked: function(e) {
        e.stopPropagation();
        var confirmButton = $(e.currentTarget);
        var fileDiv = confirmButton.closest('div[id^="fileDiv"]');  // Get the fileDiv using its id
        var file = fileDiv.data('file');  // Retrieve the file object from the fileDiv data
        var fileId = confirmButton.closest('section').find('div[id^="fileDiv"]').attr('id');  // Get the id of the fileDiv
        var deleteButton = confirmButton.closest('div').find('.delete-button-class');
        var cancelButton = confirmButton.siblings('.cancel_attach');  // Find the "Annulla" button
        var sectionId = confirmButton.closest('section').attr('id');  // Get the section id
        var issId = confirmButton.closest('section').find('span[id^="issId"]').attr('id');
        var issSpan = $('#'+issId);

        // Get the necessary data for the API call
        var fileName = file.name;

        this.validateFileExtension(fileName);
        // Set the documentCategory based on the sectionId
        var documentCategory;
        if (sectionId === 'morte_doc_list') {
            documentCategory = 1;
        } else if (sectionId === 'identity_doc_list') {
            documentCategory = 2;
        }else if (sectionId === 'certificato_doc_list') {
            documentCategory = 3;
        }else if (sectionId === 'testamento_doc_list') {
            documentCategory = 4;
        }else if (sectionId === 'altro_doc_list') {
            documentCategory = 5;
        }

        var documentCategory = documentCategory;

        // Create a new FormData instance
        var formData = new FormData();

        // Append the parameters to the formData
        formData.append('file', file);
        formData.append('fileName', fileName);
        formData.append('documentCategory', documentCategory);
        formData.append('successioniId', wkscommerciale.successioniCustomer.successioniId);

        $("#documentiObbligatoriSpinner").wkscspinner({css: 'large', position: true});

        wkscommerciale.ajaxRequests.post({
            url: 'service/successioni/confermaInsertDocSection',
            params: formData,
            processData: false,  // Tell jQuery not to process the data
            contentType: false,  // Tell jQuery not to set contentType
            onSuccess: _.bind(function(response) {
                if (response.status == "success") {
                    wkscommerciale.successioniCustomer.documentiObbligatoriFlag = "false";
                    this.getDocumentiObbligatoriDetail();
                }  else {
                    // If the status is not "success", remove the file
                    //  e.currentTarget.parentElement.remove();
                    $('input[type=file]').prop('disabled', false);
                    this.addDocumentiErrorMsg(response.message);
                }
                $('#documentiObbligatoriHeader').addClass("open");
                $("#documentiObbligatoriSpinner").wkscspinner('remove');
            }, this),
            onError: _.bind(function(exe) {
                e.currentTarget.parentElement.remove();
                $('input[type=file]').prop('disabled', false);
                wkscommerciale.notifyError.pushFromFetchError(exe, []);
                $("#documentiObbligatoriSpinner").wkscspinner('remove');
            }, this)
        });

        cancelButton.hide();
        confirmButton.remove();
        return false;
    },
    createCancelButton: function(fileDiv) {
        return $('<div class="cancel_attach"><img src="./assets/vendor-app/images/clear_search_r.png" alt="Clear" style="margin-right: 5px;"><span class="annulla">Annulla</span></div>').css({
            'margin-right': '10px',
            'margin-left': '10px'
        });
    },
    createDownloadButton: function() {
        return $('<div class="download_attach hide"><img src="./assets/vendor-app/images/attachment_icon.png" alt="down_img" style="width: 34px;height: 24px"><span class="download"></span></div>');
    },
    clickDownloadButton: function(e) {
        var toGetIssId = $(e.currentTarget).siblings('span[id^="issId_"]');
        var issId = toGetIssId.text();
        var scId = wkscommerciale.successioniCustomer.successioniId;
        this.downloadFile(issId, scId);
    },
    cancelButtonClicked: function(e) {
        e.stopPropagation();
        e.currentTarget.parentElement.remove();
        return false;
    },

    confirmDelete: function(e) {
        var confirmButton = $(e.currentTarget);
        var section = confirmButton.closest('section');
        var fileDiv = section.find('.file-to-delete');  // Get the fileDiv that has the class file-to-delete
        var file = fileDiv.data('file');  // Retrieve the file object from the fileDiv data

        //var issSpan = $(e.currentTarget).closest('section').find('span[id^="issId"]').first(); // may be useful to each row delete
        var issSpan = fileDiv.find('span[id^="issId"]');
        var issId = issSpan.text();
        var sectionId = confirmButton.closest('section').attr('id');  // Get the section id
        var scId = wkscommerciale.successioniCustomer.successioniId;

        // Set the documentCategory based on the sectionId
        var documentCategory;
        if (sectionId === 'morte_doc_list') {
            documentCategory = 1;
        } else if (sectionId === 'identity_doc_list') {
            documentCategory = 2;
        }else if (sectionId === 'certificato_doc_list') {
            documentCategory = 3;
        }else if (sectionId === 'testamento_doc_list') {
            documentCategory = 4;
        }else if (sectionId === 'altro_doc_list') {
            documentCategory = 5;
        }
        $("#documentiObbligatoriSpinner").wkscspinner({css: 'large', position: true});
        wkscommerciale.ajaxRequests.get({
            url: 'service/successioni/annullaUpdateDocSection?scId='+scId+'&issId='+issId,
            processData: false,  // Tell jQuery not to process the data
            contentType: false,  // Tell jQuery not to set contentType
            onSuccess: _.bind(function(response) {
                if (response.status == "success") {
                    var confirmSection = $(e.currentTarget).parent();
                    var fileDiv = confirmSection.closest('section').find('.file-to-delete');
                    var fileInput = $(fileDiv.data('fileInput'));  // Retrieve the file input element
                    fileInput.val('');  // Clear the file input's value
                    fileDiv.remove();  // Remove the file div
                    confirmSection.hide();
                    // TODO Refresh after file delete
                    // wkscommerciale.successioniCustomer.documentiObbligatoriFlag = "false";
                    // this.getDocumentiObbligatoriDetail();
                    $('input[type=file]').prop('disabled', false);

                } else {
                    this.addDocumentiErrorMsg(response.message);
                }
                $('#documentiObbligatoriHeader').addClass("open");
                $('#documentiObbligatoriHeader').removeClass("flagOpen");
                $("#documentiObbligatoriSpinner").wkscspinner('remove');
            }, this),
            onError: _.bind(function(exe) {
                wkscommerciale.notifyError.pushFromFetchError(exe, []);
                $("#documentiObbligatoriSpinner").wkscspinner('remove');
            }, this)
        });
    },

    cancelDelete: function(e) {
        var confirmSection = $(e.currentTarget).parent();
        var fileDiv = confirmSection.closest('section').find('.file-to-delete');
        fileDiv.find('.delete-button-class').show();  // Show the delete button
        confirmSection.hide();
        $('input[type=file]').prop('disabled', false);
    },
    validateFileExtension: function(fileName) {
        var allowedExtensions = ['doc', 'docx', 'pdf', 'txt', 'jpeg', 'jpg'];
        var fileExtension = fileName.split('.').pop().toLowerCase();
        return allowedExtensions.indexOf(fileExtension) !== -1;
    },
    validateFileCount: function(fileInput, fileListId) {
        // Maximum number of files for each file list
        var fileLists = {
            '#file_list1': 3,
            '#file_list2': 15,
            '#file_list3': 10,
            '#file_list4': 10,
            '#file_list5': 10
        };
        this.resetDocumentiErrorMsg();
        var fileList = $(fileListId);
        // Get the number of files in the section
        var numFiles = fileList.children().length;
        var titleText = fileInput.closest('li').find('.title_file').text();

        // Check if the maximum number of files has been reached
        if (numFiles >= fileLists[fileListId]) {

            // The maximum number of files has been reached, display an error message
            var errMsg = 'Maximum number of files reached in ' + titleText + '. You can only upload ' + fileLists[fileListId] + ' files.';
            this.addDocumentiErrorMsg(errMsg);
            return false;  // Return false if the maximum number of files has been reached
        } else {
            // Do nothing
        }

        return true;  // Return true if the maximum number of files has not been reached
    },
    isValidFile:function(fileName, allowedExtensions) {
        // Get the file extension
        var fileExtension = fileName.split('.').pop().toLowerCase();

        // Check if the extension is in the list of allowed extensions
        if (allowedExtensions.indexOf(fileExtension) !== -1) {
            return true;
        } else {
            return false;
        }
    },
    resetDocumentiErrorMsg: function(e) {
        $("#documentiCard").html("");
    },
    addDocumentiErrorMsg: function(msg) {
        $("#documentiCard").addClass('red');
        $("#documentiCard").html(msg);
    }
});


