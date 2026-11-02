# Bíblia AJA Church

Web app da Bíblia para a AJA Church, pensado para o iPhone (Safari → Compartilhar → Adicionar à Tela de Início).
Site estático publicado no GitHub Pages em https://matheus-maram.github.io/biblia/, a partir da raiz da branch `main`.

## Estrutura

- `index.html`: o app inteiro (HTML, CSS e JS sem build nem framework).
- `data/<versão>/<NN>.json`: um arquivo por livro (`01` a `66`), no formato `[capítulo][versículo] = texto`. Um versículo vazio é uma string vazia, porque a posição no array define o número exibido.
- `manifest.webmanifest` e `icons/`: instalação na tela de início.
- `test/`: `npm test` roda o fluxo principal em jsdom (`app.test.js`) e confere os textos (`data.test.js`).

Os caminhos são relativos, porque o site fica em `/biblia/`. Não use caminhos começando com `/`.

## Decisões de produto

- **Design brutalista:** preto e branco, tipografia pesada, linhas grossas e vermelho rubrica para números, progresso e o lugar atual. Animações secas (`steps`, carimbo, tremor) e sempre respeitando `prefers-reduced-motion`.
- **Logo:** "AJA CHURCH" composto em tipografia, inclusive nos ícones, até chegar o arquivo oficial (de preferência SVG ou PNG transparente). Quando chegar, trocar `.mark` e aplicar a animação da abertura nele.
- **Versões:** só traduções de uso livre (Almeida, Bíblia Livre, Bíblia Livre TR, NVA). ARA, ARC, NVI, NAA e NTLH têm direitos reservados e não podem entrar. A NVA usa "Yahweh" no lugar de "SENHOR".
- **Abertura:** toca uma vez por sessão e um toque pula.
- **Gamificação:** marcar capítulo como lido, desafio de X dias (sugestão de 1 ano) seguindo de Gênesis a Apocalipse, sequência de dias, mapa de 1.189 capítulos e 16 marcos com tela cheia.

## Progresso e privacidade

O progresso fica só no `localStorage` do aparelho (`biblia.prog.v1`; preferências em `biblia.v1`), sem conta nem servidor. Existe backup manual por código `AJA1.`.

- O Safari e o app da tela de início têm armazenamentos separados, e o Safari pode apagar dados de sites pouco usados.
- A sincronização com a conta Claude existia só na versão em artefato e foi removida daqui.
- **LGPD:** se o app ganhar login ou banco de dados, o progresso de leitura passa a ser dado pessoal ligado à convicção religiosa, que é dado sensível (art. 5º, II). Isso exige base legal, aviso de privacidade e cuidado com acesso antes de lançar.

## Problemas conhecidos nos textos

Vêm das fontes e não foram alterados, porque corrigir exige decidir o texto:

- **Almeida, Salmos 86:10 e Lucas 9:61:** faltam na fonte. As posições ficam vazias para manter a numeração, e o app pula esses números. Não preencher com outra tradução.
- **Almeida, Rute 4:1:** o texto está corrompido na fonte.

A numeração da Almeida foi alinhada à Bíblia Livre e à NVA, capítulo por capítulo. As correções estão listadas no README, e `test/data.test.js` impede que os erros de numeração e de codificação voltem.
