/**
 * Science Mom - Main JavaScript
 *
 * This file is currently minimal. Add interactivity here as needed.
 * The site works without JavaScript for core functionality.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Copy email to clipboard
  var copyButtons = document.querySelectorAll('[data-copy-email]');

  copyButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      var email = this.getAttribute('data-copy-email');
      var statusEl = document.getElementById('copy-status');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function() {
          if (statusEl) {
            statusEl.textContent = 'Copied!';
            setTimeout(function() {
              statusEl.textContent = '';
            }, 2000);
          }
        }).catch(function() {
          fallbackCopy(email, statusEl);
        });
      } else {
        fallbackCopy(email, statusEl);
      }
    });
  });

  function fallbackCopy(email, statusEl) {
    // Fallback: select the email text for manual copy
    var emailEl = document.getElementById('contact-email');
    if (emailEl) {
      var range = document.createRange();
      range.selectNodeContents(emailEl);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      if (statusEl) {
        statusEl.textContent = 'Selected! Press Ctrl+C (or Cmd+C) to copy.';
        setTimeout(function() {
          statusEl.textContent = '';
        }, 4000);
      }
    }
  }

  // -------------------------
  // Mobile Nav Toggle
  // -------------------------
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function() {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpen);
      siteNav.classList.toggle('is-open', !isOpen);
    });

    // Close menu when clicking a link
    siteNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!navToggle.contains(e.target) && !siteNav.contains(e.target)) {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
      }
    });
  }

  // -------------------------
  // Subscribe Modal & Kit Form
  // -------------------------
  var modal = document.getElementById('subscribe-modal');
  var form = document.getElementById('kit-subscribe-form');
  var formContainer = document.getElementById('subscribe-form-container');
  var successContainer = document.getElementById('subscribe-success');
  var errorContainer = document.getElementById('subscribe-error');
  var submitBtn = document.getElementById('kit-submit-btn');

  // Open modal
  var openTriggers = document.querySelectorAll('[data-open-subscribe]');
  openTriggers.forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      openModal();
    });
  });

  // Close modal
  var closeTriggers = document.querySelectorAll('[data-close-modal]');
  closeTriggers.forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && !modal.getAttribute('aria-hidden')) {
      closeModal();
    }
  });

  // Retry button
  var retryBtn = document.getElementById('subscribe-retry');
  if (retryBtn) {
    retryBtn.addEventListener('click', function() {
      showFormState('form');
    });
  }

  function openModal() {
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // Focus the first input
      var firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  }

  function closeModal() {
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      // Reset to form state after closing
      setTimeout(function() {
        showFormState('form');
      }, 300);
    }
  }

  function showFormState(state) {
    if (formContainer) formContainer.style.display = state === 'form' ? 'block' : 'none';
    if (successContainer) successContainer.style.display = state === 'success' ? 'block' : 'none';
    if (errorContainer) errorContainer.style.display = state === 'error' ? 'block' : 'none';
  }

  // Form submission via fetch
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var formData = new FormData(form);
      var submitBtnText = submitBtn ? submitBtn.textContent : '';

      // Show loading state
      if (submitBtn) {
        submitBtn.textContent = 'Subscribing...';
        submitBtn.disabled = true;
      }

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(function(response) {
        if (response.ok) {
          showFormState('success');
          form.reset();
        } else {
          throw new Error('Subscription failed');
        }
      })
      .catch(function(error) {
        console.error('Subscribe error:', error);
        showFormState('error');
      })
      .finally(function() {
        // Reset button state
        if (submitBtn) {
          submitBtn.textContent = submitBtnText;
          submitBtn.disabled = false;
        }
      });
    });
  }
});
