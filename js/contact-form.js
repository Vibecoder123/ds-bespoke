// Sends the enquiry form to Formspree and shows a real result.
// The endpoint is the form's action attribute in contact.html. While it
// still contains YOUR_FORM_ID, nothing is sent and the visitor sees the
// error message with Dan's phone number, never a false "sent".
// Request format checked against @formspree/core 4.0.0: POST FormData with
// Accept: application/json. Success returns { next }, failure returns
// { errors: [{ field?, code?, message }] } or { error }.
// Without JavaScript the form still posts to Formspree directly.
(function () {
  var form = document.getElementById('enquiry-form');
  if (!form) return;

  var errorBox = document.getElementById('form-error');
  var successBox = document.getElementById('form-success');
  var button = form.querySelector('button[type="submit"]');
  var buttonLabel = button.textContent;
  var PHONE = '<a href="tel:+447771860143">07771 860143</a>';
  var TIMEOUT_MS = 15000;

  var MSG_FAILED = 'Your enquiry couldn’t be sent. Please try again, or call ' + PHONE + '.';
  var MSG_EMAIL = 'Please check your email address and try again, or call ' + PHONE + '.';

  function showError(html) {
    errorBox.innerHTML = html;
    errorBox.hidden = false;
  }

  function setSending(sending) {
    button.disabled = sending;
    button.textContent = sending ? 'Sending…' : buttonLabel;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    errorBox.hidden = true;

    if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
      console.warn('contact-form: Formspree endpoint not set, nothing was sent.');
      showError(MSG_FAILED);
      return;
    }

    setSending(true);
    var controller = 'AbortController' in window ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, TIMEOUT_MS) : null;

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && !result.data.errors && !result.data.error) {
          form.hidden = true;
          successBox.hidden = false;
          successBox.focus();
          return;
        }
        var errors = result.data.errors || [];
        var emailProblem = errors.some(function (e) { return e.field === 'email'; });
        if (emailProblem) {
          showError(MSG_EMAIL);
          document.getElementById('email').focus();
        } else {
          showError(MSG_FAILED);
        }
      })
      .catch(function () {
        showError(MSG_FAILED);
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        setSending(false);
      });
  });
})();
