/**
 * @param {{[urlHost]: string, [paramDomain]: null, [fmRequest]: (*|jQuery|HTMLElement), [fmThanks]: (*|jQuery|HTMLElement), [onOpenDialog]: onOpenDialog}} [customOptions]
 * @constructor
 */
var LPCMSApp = function (customOptions) {
    /**
     * @type {{urlHost: string, paramDomain: null, fmRequest: (*|jQuery|HTMLElement), fmThanks: (*|jQuery|HTMLElement), onOpenDialog: onOpenDialog}}
     */
    var defaultOptions = {
            urlHost: 'http://' + location.host,
            paramDomain: null,
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
         * @type {{urlHost: string, paramDomain: null, fmRequest: (*|jQuery|HTMLElement), fmThanks: (*|jQuery|HTMLElement), onOpenDialog: onOpenDialog}}
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
            var description = '';

            var fmRequest = options.fmRequest;
            $(fmRequest).find('input').val('');
            $(fmRequest).find('input[type=hidden]').val(type);

            options.onOpenDialog(title, btn, description);

            return false;
        });

        $('form').each(function () {
            $(this).validate({
                submitHandler: function (form) {
                    var $form = $(form);
                    var data = {
                        name: $form.find('[name=name]').val(),
                        email: $form.find('[name=email]').val(),
                        tel: retrieveComplexValue($form.find('[name=phone]')),
                        type: $form.find('[name=type]').val()
                    };
                    if (options.paramDomain) {
                        data.domain = options.paramDomain;
                    }
                    $.ajax({
                        async: 'true',
                        type: 'POST',
                        cache: false,
                        url: options.urlHost + '/app/api/subscribe',
                        data: $.param(data),
                        crossDomain: true,
                        success: function () {
                            $.fancybox.close();
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
                    });
                    return false;
                },
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