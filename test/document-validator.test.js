import test from 'node:test';
import assert from 'node:assert/strict';
import { extensionOf, downloadName } from '../server/services/document-validator.js';
test('identifica extensões de Word sem diferenciação de maiúsculas', () => assert.equal(extensionOf('Contrato.DOCX'), 'docx'));
test('cria nome de download seguro e preserva a base', () => assert.equal(downloadName('contrato final.docx'), 'contrato final.pdf'));
test('remove caracteres inseguros do nome de download', () => assert.equal(downloadName('a:b.doc'), 'a_b.pdf'));
