/**
 * register.js — ذخیره درخواست ثبت در localStorage (کلید info)
 * خروجی با admin-info به‌صورت info.js قابل دانلود است
 */
(function () {
  'use strict';
  var KEY = 'passazh_info_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function save(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function splitList(s) {
    return (s || '').split(/[,،]/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function uid() {
    return 'info_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  var form = document.getElementById('reg-form');
  var thanks = document.getElementById('reg-thanks');
  if (!form) return;

  // theme from main site
  var th = localStorage.getItem('passazh_theme') || 'light';
  document.documentElement.setAttribute('data-theme', th);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var fd = new FormData(form);
    var rec = {
      id: uid(),
      createdAt: new Date().toISOString(),
      province: (fd.get('province') || '').toString().trim(),
      city: (fd.get('city') || '').toString().trim(),
      mall: (fd.get('mall') || '').toString().trim(),
      category: (fd.get('category') || '').toString().trim(),
      address: (fd.get('address') || '').toString().trim(),
      storeName: (fd.get('storeName') || '').toString().trim(),
      floor: (fd.get('floor') || '').toString().trim(),
      unit: (fd.get('unit') || '').toString().trim(),
      phone: (fd.get('phone') || '').toString().trim(),
      fax: (fd.get('fax') || '').toString().trim(),
      website: (fd.get('website') || '').toString().trim(),
      whatsapp: (fd.get('whatsapp') || '').toString().trim(),
      telegram: (fd.get('telegram') || '').toString().trim(),
      instagram: (fd.get('instagram') || '').toString().trim(),
      shopCategories: splitList(fd.get('shopCategories')),
      brands: splitList(fd.get('brands'))
    };
    var list = load();
    list.unshift(rec);
    save(list);
    form.hidden = true;
    if (thanks) thanks.hidden = false;
    window.scrollTo(0, 0);
  });
})();
