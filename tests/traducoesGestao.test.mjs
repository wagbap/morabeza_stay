import { test } from 'node:test';
import assert from 'node:assert/strict';
import i18next from 'i18next';
import { normalizarTraducoes } from '../src/utils/normalizarTraducoes.js';

test('carros e experiências resolvem as traduções de raiz e do bloco translation nos sete idiomas', async () => {
  for (const lang of ['pt', 'en', 'fr', 'es', 'de', 'ir', 'cv']) {
    const { default: data } = await import(`../src/locales/${lang}.js`);
    const instance = i18next.createInstance();
    await instance.init({ lng: lang, fallbackLng: false, resources: { [lang]: normalizarTraducoes(data) } });
    for (const key of ['gest_frota_titulo', 'gest_frota_adicionar', 'gest_carros_unidades_meus', 'gest_carros_unidades_buscar',
      'gest_header_experiencias_titulo', 'gest_header_experiencias_descricao', 'gest_exp_nova', 'gest_exp_configurar', 'gest_exp_politicas', 'gest_exp_pesquisar']) {
      assert.notEqual(instance.t(key), key, `${lang}: ${key}`);
    }
    assert.match(instance.t('gest_frota_unidades', { count: 5 }), /5/);
    assert.notEqual(instance.t('gest_exp_participantes', { count: 2 }), 'gest_exp_participantes');
  }
});

test('preserva traduções existentes e corrige o singular de unidades', async () => {
  const { default: data } = await import('../src/locales/pt.js');
  const instance = i18next.createInstance();
  await instance.init({ lng: 'pt', resources: { pt: normalizarTraducoes(data) } });
  assert.equal(instance.t('gest_frota_titulo'), 'Meus veículos');
  assert.equal(instance.t('gest_frota_unidades', { count: 1 }), '1 unidade registada');
  assert.equal(instance.t('gest_frota_unidades', { count: 5 }), '5 unidades registadas');
  assert.equal(instance.t('gest_exp_configurar'), 'Configurar sessões');
});

test('car availability uses singular, plural and empty labels before payment', async () => {
 const { default: data } = await import('../src/locales/pt.js');
 const instance = i18next.createInstance();
 await instance.init({ lng: 'pt', resources: { pt: normalizarTraducoes(data) } });
 assert.equal(instance.t('carro_resultados', { count: 1 }), '1 carro dispon\u00edvel');
 assert.equal(instance.t('carro_resultados', { count: 2 }), '2 carros dispon\u00edveis');
 assert.equal(instance.t('carro_resultados', { count: 0 }), 'Sem carros dispon\u00edveis');
 assert.equal(instance.t('carro_total_a_pagar'), 'Total a pagar');
 assert.equal(instance.t('carro_sem_avaliacoes'), 'Sem avalia\u00e7\u00f5es');
});
