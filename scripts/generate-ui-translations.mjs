import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceRoot = resolve('src');
const sourceFiles = await findFiles(sourceRoot);
const phrases = new Set();

for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8');

  for (const match of source.matchAll(/>([^<>{}]+)</g)) addPhrase(match[1], true);
  for (const match of source.matchAll(/\b(?:aria-label|alt|placeholder|title)=["']([^"']+)["']/g)) {
    addPhrase(match[1], true);
  }
  for (const match of source.matchAll(/(['"`])((?:(?!\1)[^\\\r\n]|\\.){2,220})\1/g)) {
    addPhrase(match[2].replaceAll("\\'", "'").replaceAll('\\"', '"'));
  }
}

const sortedPhrases = [...phrases].sort((a, b) => a.localeCompare(b));
const translations = {};

for (const locale of ['fr', 'en', 'ar']) {
  const entries = {};
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < sortedPhrases.length) {
      const phrase = sortedPhrases[nextIndex++];
      entries[phrase] = await translate(phrase, locale);
    }
  }

  await Promise.all(Array.from({ length: 10 }, () => worker()));
  translations[locale] = entries;
  process.stdout.write(`${locale}: ${sortedPhrases.length} phrases\n`);
}

Object.assign(translations.en, {
  'CRM': 'CRM',
  'NO-SHOWS': 'NO-SHOWS',
  'CONTACTS PASSÉS': 'PAST CONTACTS',
  'PROMOTIONS': 'PROMOTIONS',
  'UTILISATEURS': 'USERS',
  'SUPPORT': 'SUPPORT',
  'Déconnexion': 'Log out',
  'Rechercher...': 'Search...',
  "Visites Aujourd'hui": 'Visits Today',
});
Object.assign(translations.fr, {
  'CRM': 'CRM',
  'NO-SHOWS': 'ABSENCES',
  'CONTACTS PASSÉS': 'CONTACTS PASSÉS',
  'PROMOTIONS': 'PROMOTIONS',
  'UTILISATEURS': 'UTILISATEURS',
  'SUPPORT': 'ASSISTANCE',
});
Object.assign(translations.ar, {
  'CRM': 'إدارة العملاء',
  'NO-SHOWS': 'حالات عدم الحضور',
  'CONTACTS PASSÉS': 'جهات الاتصال السابقة',
  'PROMOTIONS': 'العروض الترويجية',
  'UTILISATEURS': 'المستخدمون',
  'SUPPORT': 'الدعم',
  '+ Ajouter Lead': '+ إضافة عميل محتمل',
  '2. Get Uninformed Leads': '2. جلب العملاء المحتملين غير المُبلّغين',
  '6. Update Lead': '6. تحديث العميل المحتمل',
  '7. Loop Informed Leads': '7. معالجة العملاء المحتملين المُبلّغين',
  'Ajouter un Lead': 'إضافة عميل محتمل',
  'Capture de Leads:': 'استقطاب العملاء المحتملين:',
  'Créer le Lead': 'إنشاء العميل المحتمل',
  'Déposez un lead ici': 'أفلت عميلاً محتملاً هنا',
  'Déconnexion': 'تسجيل الخروج',
  'Failed to submit manual lead:': 'فشل إرسال العميل المحتمل يدوياً:',
  'Failed to update pipeline status:': 'فشل تحديث حالة مسار المبيعات:',
  'Informations du Lead': 'معلومات العميل المحتمل',
  'lead-form step-2-form': 'lead-form step-2-form',
  'Leads': 'العملاء المحتملون',
  'Lead soumis via formulaire web': 'تم إرسال العميل المحتمل عبر نموذج الويب',
  'met a jour le statut du lead': 'تحديث حالة العميل المحتمل',
  'Pipeline': 'مسار المبيعات',
  'Pipeline des Leads': 'مسار العملاء المحتملين',
  'Pipeline des leads': 'مسار العملاء المحتملين',
  'Rechercher...': 'بحث...',
  'Recuperer les leads non informes': 'جلب العملاء المحتملين غير المُبلّغين',
  'recupere les leads planifies': 'جلب العملاء المحتملين المجدولين',
  'Sauvegarde lead dans n8n DB': 'حفظ العميل المحتمل في قاعدة بيانات n8n',
  'Trier les leads': 'فرز العملاء المحتملين',
  'Unexpected pipeline status update failure:': 'فشل غير متوقع في تحديث حالة مسار المبيعات:',
  "Visites Aujourd'hui": 'زيارات اليوم',
});

await writeFile(
  resolve('src/i18n/ui-translations.generated.json'),
  `${JSON.stringify(translations, null, 2)}\n`,
);

function addPhrase(rawValue, visibleText = false) {
  const phrase = rawValue
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replace(/\s+/g, ' ')
    .trim();

  if (!phrase || phrase.length > 180 || !/\p{L}{2}/u.test(phrase)) return;
  if (/^(?:https?:|mailto:|tel:|\/|\.|#|--|rgba?\(|linear-gradient)/i.test(phrase)) return;
  if (!visibleText && /^[a-z][a-z0-9_-]*$/i.test(phrase)) return;
  if (/[{}[\]<>]|=>|===|!==|\b(?:const|return|import|export|case|console|VITE_)\b/.test(phrase)) return;
  if (/^[A-Z0-9_./-]+$/.test(phrase) && phrase.length > 5) return;

  phrases.add(phrase);
}

async function translate(text, target) {
  const protectedText = text
    .replaceAll('ReactivationFlow', 'ZXQREACTIVATIONFLOWZXQ')
    .replaceAll('WhatsApp', 'ZXQWHATSAPPZXQ')
    .replaceAll('Systemify Automation', 'ZXQSYSTEMIFYZXQ');
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'auto');
  url.searchParams.set('tl', target);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', protectedText);

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      return payload[0]
        .map((part) => part[0])
        .join('')
        .replaceAll('ZXQREACTIVATIONFLOWZXQ', 'ReactivationFlow')
        .replaceAll('ZXQWHATSAPPZXQ', 'WhatsApp')
        .replaceAll('ZXQSYSTEMIFYZXQ', 'Systemify Automation');
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise((resolvePromise) => setTimeout(resolvePromise, attempt * 500));
    }
  }
}

async function findFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findFiles(path));
    else if (entry.name.endsWith('.tsx')) files.push(path);
  }

  return files;
}
