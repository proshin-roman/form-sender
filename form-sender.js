/*!
 * Form sender v3.0.0
 *
 * Copyright (c) 2015 Roman Proshin
 */
/**
 * @param {{[url]: string, [referrer]: null, [getYaCounter]: function, [fmRequest]: (*|jQuery|HTMLElement), [fmThanks]: (*|jQuery|HTMLElement|function), [onSendRequest]: function, onOpenDialog: function}} customOptions
 * @constructor
 */
var FormSender = function (customOptions) {
    /**
     * @type {{[url]: string, [referrer]: null, [getYaCounter]: function, [fmRequest]: (*|jQuery|HTMLElement), [fmThanks]: (*|jQuery|HTMLElement|function), [onSendRequest]: function, onOpenDialog: function}}
     */
    var defaultOptions = {
            url: 'http://' + location.host + '/app/api/requests/new',
            referrer: location.host,
            getYaCounter: null,
            fmRequest: $('#fmRequest'),
            onSendRequest: function () {
            },
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
         * @type {{[url]: string, [referrer]: null, [getYaCounter]: function, [fmRequest]: (*|jQuery|HTMLElement), [fmThanks]: (*|jQuery|HTMLElement|function), [onSendRequest]: function, onOpenDialog: function}}
         */
        options = $.extend({}, defaultOptions, customOptions);

    function init() {
        $('[data-type]').click(function (e) {
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

            $(options.fmRequest).modal('show');

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
                submitHandler: function (form) {
                    var $form = $(form);
                    var data = new FormData($(form)[0]);
                    data.append('referrer', options.referrer);

                    jQuery.ajax({
                        url: options.url,
                        data: data,
                        cache: false,
                        contentType: false,
                        processData: false,
                        type: 'POST',
                        success: function (data) {
                            $(options.fmRequest).modal('hide');
                            options.onSendRequest && options.onSendRequest();
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

    init();
};