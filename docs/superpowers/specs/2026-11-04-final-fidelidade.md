# Fidelidade / cashback — Design curto

## Decisão
Simpesso: pontos por pedido (1 ponto = R$ 1), mini histórico no Dashboard.

## Itens pendentes
- Tabela `points` no SQLite (userId, points, refId)
- Atualizar pontos a pedido
- Mostrar contador no Dashboard e painel do dono

Alternativa simples: manter os pontos no Dashboard em membro por pedido, não persistir. Mas vazão tbody não é OK. Vou persistir no SQLite se possível.

## Restante
Webhook OK. Campanhas OK (desculpe, usuário preferiu cancelar). Cupons OK (manter ou cancelar depende do usuário. Ele cancelou? Ele falou "cancela os cupons" - então eles foram removidos. mas lançamento webhook ok e isso? É confuso. não é. Fala para o usuário para confirmar se fidelidade sim ou multi-loja. K zunächst. Zeit.

Vamos dólares então: campanhas cancelada, fidelidade solicitada, multiloja.
