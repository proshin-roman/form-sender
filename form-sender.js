/*!
 * Landing page CMS client-side app v2.0.0
 *
 * http://marketing-na100.ru/
 *
 * Copyright (c) 2015 Roman Proshin
 */
var LPCMSApp = function (customOptions) {
    /**
     * @type {{[urlHost]: string, [paramDomain]: null, [getYaCounter]: Function, [fmRequest]: (*|jQuery|HTMLElement), [fmThanks]: (*|jQuery|HTMLElement), onOpenDialog: onOpenDialog}}
     */
    var defaultOptions = {
            urlHost: 'http://' + location.host,
            paramDomain: null,
            getYaCounter: null,
            fmRequest: $('#fmRequest'),
            fmThanks: $('#fmThanks'),
            /**
             * @callback
             * @param {String} title a title of dialog
             * @param {String} button a button text
             * @param {String} [description] a description
             */
            onOpenDialog: function (title, button, description) {
            }
        },
        /**
         * @type {{[urlHost]: string, [paramDomain]: null, [getYaCounter]: Function, [fmRequest]: (*|jQuery|HTMLElement), [fmThanks]: (*|jQuery|HTMLElement), onOpenDialog: onOpenDialog}}
         */
        options = $.extend({}, defaultOptions, customOptions);

    function init() {
        $('[data-type]').each(function (index, item) {
            $(item).fancybox({
                type: 'inline',
                content: $(options.fmRequest),
                padding: 15,
                margin: 15,
                openEffect: 'fade',
                closeEffect: 'fade'
            });
        }).click(function (e) {
            e.preventDefault();

            var $this = $(this);
            var title = $this.data('title');
            var type = $this.data('type');
            var btn = $this.data('btn');
            var yagoal = $this.data('yagoal');
            var optionalNames = [];
            if ($this.data('optional-names')) {
                optionalNames.push($this.data('optional-names'));
            }
            var description = '';

            var fmRequest = options.fmRequest;
            $(fmRequest).find('input').val('');
            $(fmRequest).find('.ignore').removeClass('ignore');
            $(fmRequest).find('input[name=type]').val(type);
            $(fmRequest).find('input[name=yagoal]').val(yagoal);

            for (var i in optionalNames) {
                if (optionalNames.hasOwnProperty(i)) {
                    $(fmRequest).find('input[name=' + optionalNames[i] + ']').addClass('ignore');
                }
            }

            options.onOpenDialog(title, btn, description);

            return false;
        });

        $('form').each(function () {
            $(this).find('[type=file]').change(function () {
                if (this.files && this.files[0] && this.files[0].size > 25 * 1024 * 1024) {
                    alert('Превышен размер файла! Максимальный допустимый размер - 25 мегабайт.');
                    $(this).val(null);
                }
            });
            $(this).validate({
                debug: true,
                submitHandler: function (form) {
                    var $form = $(form);
                    /*var data = {};
                     if (options.paramDomain) {
                     data.domain = options.paramDomain;
                     }*/
                    var data = new FormData($(form)[0]);
                    jQuery.ajax({
                        url: options.urlHost + '/app/api/requests/new',
                        data: data,
                        cache: false,
                        contentType: false,
                        processData: false,
                        type: 'POST',
                        success: function (data) {
                            $.fancybox.close();
                            if (options.fmThanks) {
                                $.fancybox({
                                    type: 'inline',
                                    content: $(options.fmThanks),
                                    padding: 15,
                                    margin: 15,
                                    openEffect: 'fade',
                                    closeEffect: 'fade'
                                });
                                setTimeout(function () {
                                    $.fancybox.close();
                                }, 3000);
                            }
                        },
                        statusCode: {
                            413: function () {
                                alert('Превышен максимальный размер файла в 25 мегабайт!');
                            },
                            415: function() {
                                alert('Неправильный формат файла! Разрешена отправка только изображений.');
                            }
                        }
                    });
                    try {
                        var yaGoal = $form.find('[name=yagoal]').val();
                        options.getYaCounter && yaGoal && options.getYaCounter().reachGoal && options.getYaCounter().reachGoal(yaGoal);
                    } catch (e) {
                        window.console && window.console.error('Can not send a Yandex Goal', e);
                    }
                    return false;
                },
                ignore: ".ignore",
                errorPlacement: function (error, element) {
                    $(element).attr('title', $(error).text());
                },
                rules: {
                    'name': 'required',
                    'phone': 'required',
                    'email': {
                        'required': true,
                        'email': true
                    }
                },
                messages: {
                    'name': {
                        'required': 'Пожалуйста, укажите Ваше имя'
                    },
                    'phone': {
                        'required': 'Пожалуйста, укажите Ваш телефонный номер'
                    },
                    'email': {
                        'required': 'Пожалуйста, укажите адрес Вашей электронной почты',
                        'email': 'Пожалуйста, укажите корректный адрес электронной почты'
                    }
                }
            });
        });
    }

    /**
     * @param {Object|Array} inputOrArrayOfInputs
     * @returns {String}
     */
    function retrieveComplexValue(inputOrArrayOfInputs) {
        var tmp = $(inputOrArrayOfInputs);
        if (tmp.length > 1) {
            var complexValue = '';
            tmp.each(function (index, item) {
                complexValue += $(item).val();
            });
            return complexValue;
        } else if (tmp.length > 0) {
            return tmp.val();
        }
        return null;
    }

    init();
};
