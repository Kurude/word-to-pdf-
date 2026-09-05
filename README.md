# Word para PDF

Serviço brasileiro para conversão de arquivos DOC e DOCX em PDF usando o renderizador do LibreOffice — o documento não é reconstruído como HTML.

## Executar localmente

Instale o [Node.js 22+](https://nodejs.org/) e o LibreOffice (incluindo Writer). Depois:

```bash
copy .env.example .env
npm install
npm run dev
```

Abra `http://localhost:3000`. Em Linux/macOS use `cp .env.example .env`.

## Docker

```bash
copy .env.example .env
docker compose up --build
```

O Dockerfile instala LibreOffice e fontes Liberation, Carlito/Caladea (substitutos métricos para Calibri/Cambria), Noto e fontes extras. Para máxima fidelidade, acrescente ao ambiente de produção as fontes licenciadas que os documentos da sua organização usam. O LibreOffice faz a substituição mais próxima quando uma fonte proprietária, como Arial ou Segoe UI, não está disponível; a estrutura do arquivo não é alterada.

## Configuração

| Variável | Padrão | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP |
| `MAX_FILE_SIZE_MB` | `50` | Limite por documento |
| `CONVERSION_TIMEOUT_MS` | `120000` | Limite do LibreOffice |
| `TEMP_FILE_RETENTION_MINUTES` | `10` | Prazo de limpeza dos trabalhos |
| `CANONICAL_URL` | `http://localhost:3000` | URL pública para SEO |
| `CORS_ORIGIN` | vazio | Origem permitida, se houver frontend externo |
| `LIBREOFFICE_BIN` | automático | Caminho do executável, caso não esteja no PATH |

## Como funciona e privacidade

Cada envio recebe uma pasta temporária aleatória. O backend valida extensão, tipo declarado e assinatura/estrutura mínima, inicia o LibreOffice em perfil isolado com argumentos (sem shell), e entrega o PDF com o nome original. Os arquivos são apagados após o download ou pelo coletor de expiração. Nomes e conteúdos não são registrados.

## Testes

```bash
npm test
```

## Cloudflare Workers

O site completo usa Cloudflare Workers Containers para executar o Express e o LibreOffice dentro do `Dockerfile`. Esse recurso exige um plano Workers Paid e o Docker Desktop ativo durante o primeiro deploy.

```bash
npx wrangler login
npm run deploy
```

Depois do deploy, o Wrangler informa a URL `workers.dev`. Para usar um domínio próprio, configure um Custom Domain no painel da Cloudflare. Defina `CANONICAL_URL` no ambiente de produção com a URL pública para que o sitemap e os canonical links usem o domínio correto.

Teste manualmente DOC e DOCX com textos em português, tabelas, imagens, cabeçalhos, orientação paisagem, quebras e várias páginas. Compare o PDF com o arquivo aberto no Word/LibreOffice, verificando páginas, margens, fontes, imagens e quebras. A fidelidade final depende do LibreOffice e das fontes disponíveis: recursos exclusivos do Word, macros, objetos OLE e alguns efeitos/SmartArt podem divergir.
