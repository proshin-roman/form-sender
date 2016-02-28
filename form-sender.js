/*!
 * Form sender v4.0.0
 *
 * Copyright (c) 2015 Roman Proshin
 */
/**
 * @param {{[url]: string, [referrer]: null, [getYaCounter]: function, [fmRequest]: (*|jQuery|HTMLElement), [modalClassToCenter]: string, [onSendRequest]: function, onOpenDialog: function, [getSearchQuery]: function}} customOptions
 * @constructor
 */
var FormSender = function (customOptions) {
    /**
     * @type {{[url]: string, [referrer]: null, [getYaCounter]: function, [fmRequest]: (*|jQuery|HTMLElement), [modalClassToCenter]: string, [onSendRequest]: function, onOpenDialog: function, getSearchQuery: function}}
     */
    var defaultOptions = {
            url: 'http://' + location.host + '/app/api/requests/new',
            referrer: location.hostname,
            getYaCounter: null,
            fmRequest: $('#fmRequest'),
            modalClassToCenter: '.modal',
            onSendRequest: function () {
            },
            /**
             * @callback
             * @param {jQuery} modal instance
             * @param {jQuery} button instance
             */
            onOpenDialog: function (modal, button) {
            },
            getSearchQuery: function () {
                return location.search;
            }
        },
        /**
         * @type {{[url]: string, [referrer]: null, [getYaCounter]: function, [fmRequest]: (*|jQuery|HTMLElement), [modalClassToCenter]: string, [onSendRequest]: function, onOpenDialog: function, getSearchQuery: function}}
         */
        options = $.extend({}, defaultOptions, customOptions);

    /**
     * Rebind listeners to existing buttons. It might be helpful when you create buttons dynamically.
     */
    this.rebindButtons = function () {
        bindButtons();
    };

    /**
     * Bind onclick listeners on each item with 'data-type' attribute
     */
    function bindButtons() {
        $('[data-type]').unbind().click(function (e) {
            e.preventDefault();

            var $this = $(this);
            var type = $this.data('type');
            var yagoal = $this.data('yagoal');
            var modal = $this.data('modal');
            var optionalNames = [];
            if ($this.data('optional-names')) {
                optionalNames.push($this.data('optional-names'));
            }
            var fmRequest = modal ? $('#' + modal) : options.fmRequest;
            $(fmRequest).find('input').val('');
            $(fmRequest).find('.ignore').removeClass('ignore');

            checkAndCreateIfNotExists(fmRequest, 'type');
            checkAndCreateIfNotExists(fmRequest, 'yagoal');

            $(fmRequest).find('input[name=type]').val(type);
            $(fmRequest).find('input[name=yagoal]').val(yagoal);

            for (var i in optionalNames) {
                if (optionalNames.hasOwnProperty(i)) {
                    $(fmRequest).find('input[name=' + optionalNames[i] + ']').addClass('ignore');
                }
            }

            options.onOpenDialog(fmRequest, $this);

            $(fmRequest).modal();

            return false;
        });
    }

    /**
     * Check if the given forms contains an input with the given name and create it if doesn't contain
     *
     * @param {jQuery} $form
     * @param {String} inputName
     */
    function checkAndCreateIfNotExists($form, inputName) {
        if ($($form).find('form input[name=' + inputName + ']').length === 0) {
            $($form).find('form').append($('<input/>', {type: 'hidden', name: inputName}));
        }
    }

    /**
     * Bind onsubmit listeners and validators on each form
     */
    function bindForms() {
        $('form').each(function () {
            $(this).find('[type=file]').change(function () {
                if (this.files && this.files[0] && this.files[0].size > 25 * 1024 * 1024) {
                    alert('Превышен размер файла! Максимальный допустимый размер - 25 мегабайт.');
                    $(this).val(null);
                }
            });
            $(this).validate({
                submitHandler: function (form) {
                    var $form = $(form);
                    try {
                        var data = new FormData($(form)[0]);
                        var phone = '';
                        if ($form.find('input[name=phone]').length > 1) {
                            $form.find('input[name=phone]').each(function () {
                                phone += $(this).val();
                            })
                        } else {
                            phone = $form.find('input[name=phone]').val()
                        }

                        var request = {
                            name: $form.find('input[name=name]').val(),
                            email: $form.find('input[name=email]').val(),
                            phone: phone,
                            type: $form.find('input[name=type]').val(),
                            referrer: options.referrer,
                            query: location.search,
                            fields: new UtmLabelsParser(location).getLabels()
                        };

                        data.append('request', $.toJSON(request));

                        $.ajax({
                            url: options.url,
                            data: data,
                            cache: false,
                            contentType: false,
                            processData: false,
                            type: 'POST',
                            success: function () {
                                $(options.fmRequest).modal('hide');
                                options.onSendRequest && options.onSendRequest();
                                $form.find('input[type=text]').val('');
                            },
                            statusCode: {
                                413: function () {
                                    alert('Превышен максимальный размер файла в 25 мегабайт!');
                                },
                                415: function () {
                                    alert('Неправильный формат файла! Разрешена отправка только изображений.');
                                }
                            }
                        });
                    } catch (e) {
                        console.log(e);
                        return false;
                    } finally {
                        try {
                            var yaGoal = $form.find('[name=yagoal]').val();
                            options.getYaCounter && yaGoal && options.getYaCounter().reachGoal && options.getYaCounter().reachGoal(yaGoal);
                        } catch (e) {
                            window.console && window.console.error('Can not send a Yandex Goal', e);
                        }
                    }
                    return false;
                },
                ignore: ".ignore",
                errorPlacement: function (error, element) {
                    $(element).attr('title', $(error).text());
                },
                rules: {
                    'phone': 'required',
                    'email': 'email'
                },
                messages: {
                    'phone': {
                        'required': 'Пожалуйста, укажите Ваш телефонный номер'
                    },
                    'email': {
                        'email': 'Пожалуйста, укажите корректный адрес электронной почты'
                    }
                }
            });
        });
    }

    function centerModals() {
        function centerModals($element) {
            var $modals;
            if ($element.length) {
                $modals = $element;
            } else {
                $modals = $(options.modalClassToCenter + ':visible');
            }
            $modals.each(function (i) {
                var $clone = $(this).clone().css('display', 'block').appendTo('body');
                var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
                top = top > 0 ? top : 0;
                $clone.remove();
                $(this).find('.modal-content').css("margin-top", top);
            });
        }

        $(options.modalClassToCenter).on('show.bs.modal', function (e) {
            centerModals($(this));
        });
        $(window).on('resize', centerModals);
    }

    bindButtons();
    bindForms();
    centerModals();

    /**
     * Parse the given url and retrieve all UTM labels
     * @param {String} url URL to parse
     * @constructor
     */
    function UtmLabelsParser(url) {

        /**
         * Get an object with parsed UTM labels
         * @returns {Array} parsed UTM labels
         */
        this.getLabels = function () {
            var params = [];

            if (typeof url !== 'string') {
                url = '' + url;
            }
            if (url.indexOf('?') > -1) {
                url = url.slice(url.indexOf('?') + 1);
            }
            var parameters = url.split('&');
            for (var i in parameters) {
                if (parameters.hasOwnProperty(i)) {
                    var param = parameters[i];
                    var key = getNameOfUtmLabel(param.split('=')[0]);
                    params.push({name: key, value: decodeURIComponent(param.split('=')[1])});
                }
            }
            return params;
        };

        /**
         * Find a human readable UTM name
         * @param {String} utmLabel UTM label
         * @returns {String} human readable name of the given UTM label (if found)
         */
        function getNameOfUtmLabel(utmLabel) {
            if (utmLabelNames[utmLabel]) {
                return utmLabelNames[utmLabel] + ' (' + utmLabel + ')';
            }
            return utmLabel;
        }

        /**
         * Human readable names of the UTM labels
         * @type {{utm_source: string, utm_campaign: string, utm_medium: string, utm_term: string, utm_content: string}}
         */
        var utmLabelNames = {
            'utm_source': 'Источник перехода',
            'utm_campaign': 'Рекламная кампания',
            'utm_medium': 'Тип трафика',
            'utm_term': 'Ключевая фраза',
            'utm_content': 'Доп. информация'
        };
    }
};
