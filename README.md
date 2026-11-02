# Bíblia AJA Church

Bíblia Sagrada em web app para a AJA Church, com design brutalista, quatro traduções livres, desafio de leitura e acompanhamento de progresso.

**Acesse:** https://matheus-maram.github.io/biblia/

## Instalar no iPhone

1. Abra o link no Safari.
2. Toque em Compartilhar → Adicionar à Tela de Início.
3. Use sempre pelo ícone. O progresso fica salvo no aparelho, separado do Safari.

Para ouvir um capítulo, toque em ▶ Ouvir capítulo. A voz é a do próprio aparelho e funciona sem internet. Para uma voz mais natural no iPhone, baixe uma voz em português marcada como Aprimorada ou Premium em Ajustes → Acessibilidade → Conteúdo Falado → Vozes, feche e abra o app e escolha a voz em Configurações → Voz da leitura.

## Desenvolvimento

O app é estático: todo o código está em `index.html` e os textos em `data/`. Não há etapa de build.

```bash
npm install
npm test
npm start
```

Um `git push` para a branch `main` publica o site pelo GitHub Pages.

## Textos e licenças

| Versão | Licença | Fonte |
| --- | --- | --- |
| Almeida | Domínio público | [open-bibles](https://github.com/seven1m/open-bibles) |
| Bíblia Livre | CC BY 3.0 Brasil | [Scrollmapper Bible Databases](https://github.com/scrollmapper/bible_databases) |
| Bíblia Livre TR | CC BY 3.0 Brasil | [Scrollmapper Bible Databases](https://github.com/scrollmapper/bible_databases) |
| Nova Versão de Acesso Livre | CC BY-SA 4.0 | [Scrollmapper Bible Databases](https://github.com/scrollmapper/bible_databases) |

As licenças acima valem para os textos. Alterações feitas em relação às fontes:

- Almeida: "ç" corrigido para "Ó" em 66 ocorrências e "d‰" corrigido para "de" em Neemias 9:38. São erros de codificação.
- Almeida: numeração alinhada à versificação usual, sem reescrever o texto:
  - versículos unidos foram separados em Gênesis 36:4-5 e 43:4-5, Números 5:5-6 e 25:7-8, Neemias 5:9-10 e Ezequiel 20:4-5. Em Neemias 5:9, saiu o "10" grudado no texto. Em Números 25:8, "o foi" virou "e foi".
  - versículos divididos foram unidos em Juízes 5:31 e 1 Samuel 20:42.
  - versículos trocados voltaram à ordem em 2 Reis 18:34-35 e Neemias 12:3-4.
  - em Salmos 86, foi removida a repetição do versículo 13.
- Almeida: Rute 4:1 (corrompido na fonte), Salmos 86:10 e Lucas 9:61 (ausentes na fonte) vêm da reimpressão de 1911 de uma edição de 1900 da Almeida, pelo módulo [PorAlmeida1911](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=PorAlmeida1911) do CrossWire, com a ortografia atualizada. O módulo é distribuído sob GPL.
- Almeida: 2 Coríntios 13 mantém os 13 versículos da tradição da Almeida, com a bênção no versículo 13. A Bíblia Livre e a NVA numeram até 14.
- Bíblia Livre e Bíblia Livre TR: removida de Deuteronômio 32:5 uma nota de rodapé que aparecia no meio do versículo.
