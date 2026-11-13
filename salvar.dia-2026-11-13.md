# salvar.dia-2026-11-13

## Estado
- Todos os commits feitos. Árvore limpa (`git status` vazio).
- Último commit: `be1e126 chore: ignorar ai-workflow (venv Python)`.

## Tarefas pendentes do usuário
- Trocar os 36 placeholders de imagem pelo painel admin (`docs/produtos-sem-imagem.md`).
- Substituir CNPJ/endereço/contato pelos dados reais (rodapé + políticas).
- Assinar DPA com processadores (`DPA-modelo.md`).
- No host de produção, preencher `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL` (senão uploads vão para disco local e somem em serverless).

## Verificações
- `tsc --noEmit`: 0 erros.
- `npm run build`: verde.
- `PLANO-EXECUCAO.md`: status atualizados para tarefas 11, 13, 15, 17, 18, 19, 20.

## Histórico dos commits desta sessão
- `90050f0` refactor(storefront): redesign do cardápio e do carrinho
- `dcdeab4` feat(lgpd): política, termos e consentimento no checkout
- `0c4f93a` feat(infra): headers de segurança, HTTPS e CORS restrito
- `8780252` feat(storage): uploads em S3/R2 com fallback para disco
- `24f3c00` feat(pwa): manifest, service worker e registro
- `f18dda2` feat(db/auth): camada sqlite, autenticação e redefinição de senha
- `a27d41d` feat(tracking): rastreador de entrega e imagem
- `939c613` docs: anotações, roadmap, scripts, specs e notas
- `ef80227` feat(actions): server actions de produto e loja
- `be1e126` chore: ignorar ai-workflow (venv Python)

Pronto para publicar e para continuar com novas funções ou correções pelo agente Opencode.
