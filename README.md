## Краткое описание
Это form-sender - небольшой скрипт для удобной обработки форм на landing page. Основные функции скрипта:
- автоматическая привязка на элементы с аттрибутом data-type, а так же на все формы страницы
- отображение диалогового окна при клике на элемент data-type
- автоматическая валидация всех форм
- отправка данных с формы на указанный URL

## Требования
Для корректной работы скрипта на странице должны присутствовать:
* jQuery 1.x
* jQuery validate plugin 1.13.x
* Bootstrap 3.x
* jquery-json [https://github.com/Krinkle/jquery-json]

Кроме того, модальные окна должны быть реализованы и инициализированы с использованием фреймворка Bootstrap.

## Как подключить
Скрипт инициализируется созданием инстанса:
```javascript
new FormSender({});
```

При этом конструктор принимает следующие параметры:

| Название параметра | Тип | Обязательный? | Значение по умолчанию | Описание |
| --- | --- | --- | --- | --- |
| url | string | Да | | URL, на который будут отправляться данные с формы |
| referrer | string | Нет | null | Маркер сайта, используется для определения отправителя на стороне сервера |
| getYaCounter | function | Нет | null | Функция, возвращающая объект Яндекс.Метрики |
| fmRequest | jQuery | Да | | jQuery объект модального окна, который будет отображен при клике на элементы с data-type |
| modalClassToCenter | string | Нет | .modal | CSS класс для поиска модальных окон, которые необходимо центрировать |
| onSendRequest | function | Да | | Callback функция, которая вызывается по завершению запроса |
| onOpenDialog | function | Да | | Callback функция, которая вызывается после клика по элементу data-type, но перед отображением модального окна |
| getSearchQuery | function | Нет | | Функция, возвращающая query часть URL текущей страницы. По умолчанию используется location.search |

Пример инициализации скрипта:
```javascript
$(function () {
  new FormSender({
    fmRequest: $('#myModal'),
    onSendRequest: function () {
      $('#fmThanks').modal('show');
        setTimeout(function () {
          $('#fmThanks').modal('hide')
        }, 3000);
    },
    onOpenDialog: function (modal, button) {
      $(modal).find('.title').html(button.data('title') || 'Заголовок по умолчанию');
      $(modal).find('.submit-button').text(button.data('btn') || 'Отправить заявку');
    },
    getYaCounter: function () {
      return yaCounter123456789;
    },
    url: 'http://backend-server-domain.ru/app/api/requests/new',
    referrer: 'landing-page-domain.ru'
  });
});
```

## Ссылки для подключения скрипта через CDN:
* 1.0 - http://cdn.rawgit.com/proshin-roman/form-sender/v.1.0/form-sender.min.js
* 1.1 - http://cdn.rawgit.com/proshin-roman/form-sender/v.1.1/form-sender.min.js
* 2.0 - http://cdn.rawgit.com/proshin-roman/form-sender/v.2.0/form-sender.min.js
* 2.1 - http://cdn.rawgit.com/proshin-roman/form-sender/v.2.1/form-sender.min.js
* 2.1.1 - http://cdn.rawgit.com/proshin-roman/form-sender/v.2.1.1/form-sender.min.js
* 3.0.0 - http://cdn.rawgit.com/proshin-roman/form-sender/v.3.0.0/form-sender.min.js
* 3.1.0 - http://cdn.rawgit.com/proshin-roman/form-sender/v.3.1.0/form-sender.min.js
* 3.1.1 - http://cdn.rawgit.com/proshin-roman/form-sender/v.3.1.1/form-sender.min.js
* 3.1.2 - http://cdn.rawgit.com/proshin-roman/form-sender/v.3.1.2.r/form-sender.min.js
* 3.1.3 - http://cdn.rawgit.com/proshin-roman/form-sender/v.3.1.3/form-sender.min.js
* 3.2.0 - http://cdn.rawgit.com/proshin-roman/form-sender/v.3.2.0/form-sender.min.js
* 3.2.1 - http://cdn.rawgit.com/proshin-roman/form-sender/v.3.2.1/form-sender.min.js
* 4.0.1 - http://cdn.rawgit.com/proshin-roman/form-sender/v.4.0.1/form-sender.min.js
