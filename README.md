# Bíblia AJA Church

Bíblia Sagrada em web app para a AJA Church, com design brutalista, quatro traduções livres, desafio de leitura e acompanhamento de progresso.

**Acesse:** https://matheus-maram.github.io/biblia/

## Instalar no iPhone

1. Abra o link no Safari.
2. Toque em Compartilhar → Adicionar à Tela de Início.
3. Use sempre pelo ícone. O progresso fica salvo no aparelho, separado do Safari.

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
- Bíblia Livre e Bíblia Livre TR: removida de Deuteronômio 32:5 uma nota de rodapé que aparecia no meio do versículo.
