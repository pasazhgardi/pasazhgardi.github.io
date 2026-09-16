/**
 * admin-info.js — نمایش درخواست‌های ثبت + کپی فیلد + دانلود info.js
 */
(function () {
  'use strict';
  var KEY = 'passazh_info_v1';

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveLocal(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  function allRecords() {
    var local = loadLocal();
    var file = (typeof infoSubmissions !== 'undefined' && Array.isArray(infoSubmissions))
      ? infoSubmissions : [];
    // merge by id, local first
    var map = {};
    file.forEach(function (r) { if (r && r.id) map[r.id] = r; });
    local.forEach(function (r) { if (r && r.id) map[r.id] = r; });
    return Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }

  var FIELDS = [
    ['province', 'استان'],
    ['city', 'شهر'],
    ['mall', 'پاساژ'],
    ['category', 'دسته‌بندی'],
    ['address', 'آدرس'],
    ['storeName', 'نام فروشگاه'],
    ['floor', 'طبقه'],
    ['unit', 'واحد'],
    ['phone', 'تلفن'],
    ['fax', 'فکس'],
    ['website', 'سایت'],
    ['whatsapp', 'واتساپ'],
    ['telegram', 'تلگرام'],
    ['instagram', 'اینستاگرام'],
    ['shopCategories', 'دسته فروشگاه'],
    ['brands', 'برندها']
  ];

  function val(rec, key) {
    var v = rec[key];
    if (Array.isArray(v)) return v.join('، ');
    return (v == null || v === '') ? '—' : String(v);
  }

  function copyText(text, btn) {
    if (!text || text === '—') return;
    function ok() {
      btn.classList.add('done');
      btn.textContent = 'کپی شد';
      setTimeout(function () {
        btn.classList.remove('done');
        btn.textContent = 'کپی';
      }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        fallback(text); ok();
      });
    } else {
      fallback(text); ok();
    }
  }
  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function render() {
    var box = document.getElementById('info-list');
    if (!box) return;
    var list = allRecords();
    if (!list.length) {
      box.innerHTML = '<p class="empty">هنوز درخواستی ثبت نشده. از صفحه ثبت رایگان یا آپلود info.js استفاده کنید.</p>';
      return;
    }
    var html = '';
    list.forEach(function (rec) {
      html += '<article class="info-card glass" data-id="' + rec.id + '">';
      html += '<h3>' + (rec.storeName || 'بدون نام') + '</h3>';
      html += '<div class="info-meta">' + (rec.createdAt || '') + ' · ' + (rec.province || '') + ' / ' + (rec.city || '') + '</div>';
      FIELDS.forEach(function (pair) {
        var key = pair[0], label = pair[1];
        var v = val(rec, key);
        html += '<div class="info-field">';
        html += '<span class="info-label">' + label + '</span>';
        html += '<span class="info-val" data-copy="' + key + '">' + v + '</span>';
        html += '<button type="button" class="copy-btn" data-copy-val="' + encodeURIComponent(v) + '">کپی</button>';
        html += '</div>';
      });
      html += '<div style="margin-top:10px;text-align:left">';
      html += '<button type="button" class="btn btn-danger" data-del="' + rec.id + '" style="font-size:0.78rem;padding:6px 12px">حذف این درخواست</button>';
      html += '</div></article>';
    });
    box.innerHTML = html;
  }

  document.getElementById('info-list').addEventListener('click', function (e) {
    var c = e.target.closest('.copy-btn');
    if (c) {
      var raw = decodeURIComponent(c.getAttribute('data-copy-val') || '');
      copyText(raw, c);
      return;
    }
    var d = e.target.closest('[data-del]');
    if (d) {
      if (!confirm('حذف شود؟')) return;
      var id = d.getAttribute('data-del');
      var local = loadLocal().filter(function (r) { return r.id !== id; });
      saveLocal(local);
      render();
    }
  });

  document.getElementById('btn-refresh').addEventListener('click', render);

  document.getElementById('btn-dl-info').addEventListener('click', function () {
    var list = allRecords();
    var out = '/** info.js — درخواست‌های ثبت رایگان */\nconst infoSubmissions = ' +
      JSON.stringify(list, null, 2) + ';\n';
    var blob = new Blob([out], { type: 'application/javascript;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'info.js';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById('btn-clear-info').addEventListener('click', function () {
    if (!confirm('همه درخواست‌های مرورگر پاک شود؟')) return;
    localStorage.removeItem(KEY);
    render();
  });

  document.getElementById('upload-info').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var src = String(reader.result || '');
        var data;
        try {
          var fn = new Function(src + '; return typeof infoSubmissions!=="undefined"?infoSubmissions:null;');
          data = fn();
        } catch (err) {
          data = JSON.parse(src);
        }
        if (!Array.isArray(data)) throw new Error('آرایه معتبر نیست');
        saveLocal(data);
        render();
        alert('بارگذاری شد: ' + data.length + ' مورد');
      } catch (err) {
        alert('خطا در خواندن فایل');
      }
    };
    reader.readAsText(file, 'UTF-8');
  });

  var th = localStorage.getItem('passazh_theme') || 'light';
  document.documentElement.setAttribute('data-theme', th);
  render();
})();
