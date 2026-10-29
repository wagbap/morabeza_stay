import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chaveErroExclusao } from '../src/utils/erroExclusao.js';

test('foreign key failures become a user-facing linked-record explanation', () => {
  for (const data of [{ message: 'SQLSTATE[23000]: Integrity constraint violation: 1451 Cannot delete parent row' }, { error: 'FOREIGN KEY (alojamento_id) REFERENCES alojamentos (id)' }, 'Integrity constraint violation']) {
    assert.equal(chaveErroExclusao(data), 'exclusao_associados');
  }
});
test('authorization errors and unexpected payloads never expose raw backend details', () => {
  assert.equal(chaveErroExclusao({ message: 'Internal database path' }, 403), 'exclusao_sem_permissao');
  assert.equal(chaveErroExclusao(null, 500), 'exclusao_erro');
  assert.equal(chaveErroExclusao({ message: { internal: 'SQL error' } }), 'exclusao_erro');
});
